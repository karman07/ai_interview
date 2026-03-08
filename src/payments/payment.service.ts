import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import {
  CreateOrderDto,
  CreateSubscriptionRequestDto,
  VerifyPaymentDto,
  VerifySubscriptionDto,
  PaymentResponseDto,
  OrderResponseDto,
} from './dto';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { SubscriptionType } from '../subscriptions/schemas/subscription.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
    private usersService: UsersService,
    private subscriptionService: SubscriptionService,
    private emailService: EmailService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      const { amount, description, receipt, notes } = createOrderDto;

      // Convert amount to paisa (smallest currency unit)
      const amountInPaisa = Math.round(amount * 100);

      const orderOptions = {
        amount: amountInPaisa,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      };

      // Create order in Razorpay
      const razorpayOrder = await this.razorpay.orders.create(orderOptions);

      // Save payment record in database
      const payment = new this.paymentModel({
        userId: new Types.ObjectId(userId),
        subscriptionId: createOrderDto.subscriptionId ? new Types.ObjectId(createOrderDto.subscriptionId) : undefined,
        amount: amountInPaisa,
        currency: razorpayOrder.currency,
        status: PaymentStatus.CREATED,
        razorpayOrderId: razorpayOrder.id,
        description,
        receipt: razorpayOrder.receipt,
        notes: razorpayOrder.notes,
      });

      await payment.save();

      this.logger.log(`Order created: ${razorpayOrder.id} for user: ${userId}`);

      return {
        id: razorpayOrder.id,
        amount: Number(razorpayOrder.amount),
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at,
        notes: razorpayOrder.notes,
      };
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<PaymentResponseDto> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentDto;

      // Verify signature
      const isValidSignature = this.verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

      if (!isValidSignature) {
        throw new BadRequestException('Invalid payment signature');
      }

      // Find payment record
      const payment = await this.paymentModel.findOne({ razorpayOrderId });
      if (!payment) {
        throw new NotFoundException('Payment record not found');
      }

      // Get payment details from Razorpay
      const razorpayPayment = await this.razorpay.payments.fetch(razorpayPaymentId);

      // Update payment record
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = PaymentStatus.PAID;
      payment.method = razorpayPayment.method as any;
      payment.updatedAt = new Date();

      await payment.save();

      // If this was a subscription payment, update user profile
      if (payment.subscriptionId) {
        try {
          const subscription = await this.subscriptionService.findById(payment.subscriptionId.toString());
          const expiryDate = new Date();

          if (subscription.type === SubscriptionType.MONTHLY) {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (subscription.type === SubscriptionType.YEARLY) {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          } else if (subscription.duration) {
            expiryDate.setDate(expiryDate.getDate() + subscription.duration);
          } else {
            // Lifetime or custom duration logic
            expiryDate.setFullYear(expiryDate.getFullYear() + 100);
          }

          await this.usersService.updateProfile(payment.userId.toString(), {
            subscriptionPlan: payment.subscriptionId,
            subscriptionStatus: 'active',
            subscriptionExpiry: expiryDate,
          } as any);

          this.logger.log(`User ${payment.userId} subscription updated to ${subscription.name}`);

          // Send confirmation email
          const user = await this.usersService.findById(payment.userId.toString());
          if (user && user.email) {
            await this.emailService.sendPaymentSuccessEmail(user.email, subscription.displayName, payment.amount);
          }
        } catch (subError) {
          this.logger.error(`Failed to update user subscription after payment: ${subError.message}`);
        }
      }

      this.logger.log(`Payment verified: ${razorpayPaymentId} for order: ${razorpayOrderId}`);

      return this.toPaymentResponseDto(payment);
    } catch (error) {
      this.logger.error(`Payment verification failed: ${error.message}`, error.stack);

      // Update payment status to failed if payment record exists
      const payment = await this.paymentModel.findOne({ razorpayOrderId: verifyPaymentDto.razorpayOrderId });
      if (payment) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = error.message;
        payment.updatedAt = new Date();
        await payment.save();
      }

      throw new BadRequestException(`Payment verification failed: ${error.message}`);
    }
  }

  async getPaymentById(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toPaymentResponseDto(payment);
  }

  async getPaymentByOrderId(orderId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toPaymentResponseDto(payment);
  }

  async getUserPayments(userId: string, limit = 10, offset = 0): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    return payments.map(payment => this.toPaymentResponseDto(payment));
  }

  async getPaymentStats(userId: string) {
    const stats = await this.paymentModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
      };
      return acc;
    }, {});
  }

  async createSubscription(userId: string, dto: CreateSubscriptionRequestDto): Promise<any> {
    try {
      this.logger.log(`Creating subscription for user ${userId} with input ID: ${dto.subscriptionId}`);

      // Use the new robust lookup method in SubscriptionService
      let subscription = await this.subscriptionService.findOneByAnyId(dto.subscriptionId);

      // Fallback: Use the first active plan with a Razorpay ID
      if (!subscription) {
        this.logger.warn(`Plan ${dto.subscriptionId} not found. Falling back to first active plan.`);
        subscription = await this.subscriptionService.findFirstActive();
      }

      if (!subscription) {
        throw new BadRequestException('No valid subscription plan found in the system');
      }

      // Verify/Create Plan dynamically before using it
      let activePlanId = subscription.razorpayPlanId;
      try {
        if (!activePlanId) throw new Error('No plan id');
        await this.razorpay.plans.fetch(activePlanId);
      } catch (e) {
        this.logger.warn(`Plan ${activePlanId} not found in Razorpay. Creating it dynamically...`);
        const newPlan = await this.razorpay.plans.create({
          period: 'monthly',
          interval: 1,
          item: {
            name: subscription.displayName,
            amount: subscription.price,
            currency: 'INR',
            description: `Automated plan for ${subscription.name}`
          }
        });
        activePlanId = newPlan.id;
        subscription.razorpayPlanId = activePlanId;
        await subscription.save();
        this.logger.log(`Created new Razorpay plan on the fly: ${activePlanId}`);
      }

      this.logger.log(`Using plan: ${subscription.name} (Razorpay: ${activePlanId})`);

      // Calculate total_count based on type
      let totalCount = 12; // Default to 1 year of months
      if (subscription.type === SubscriptionType.YEARLY) {
        totalCount = 10; // 10 years
      } else if (subscription.type === SubscriptionType.MONTHLY) {
        totalCount = 120; // 10 years
      } else if (subscription.duration) {
        totalCount = Math.floor(3650 / subscription.duration);
      }

      const subscriptionOptions = {
        plan_id: activePlanId,
        customer_notify: 1,
        total_count: totalCount,
        quantity: 1,
        notes: {
          userId: userId,
          subscriptionId: subscription._id.toString(),
          ...(dto.notes || {})
        },
      };

      this.logger.debug(`Razorpay subscription options: ${JSON.stringify(subscriptionOptions)}`);

      const razorpaySubscription = await this.razorpay.subscriptions.create(subscriptionOptions as any);

      // Save initial payment record
      const payment = new this.paymentModel({
        userId: new Types.ObjectId(userId),
        subscriptionId: subscription._id,
        amount: subscription.price,
        currency: subscription.currency || 'INR',
        status: PaymentStatus.CREATED,
        razorpaySubscriptionId: razorpaySubscription.id,
        paymentType: 'subscription',
        description: `Subscription for ${subscription.displayName}`,
        notes: razorpaySubscription.notes,
      });

      await payment.save();

      this.logger.log(`Razorpay subscription created: ${razorpaySubscription.id} for user: ${userId}`);
      return razorpaySubscription;
    } catch (error) {
      const errorMsg = error.error?.description || error.message || 'Unknown error';
      this.logger.error(`Failed to create subscription: ${errorMsg}`, error.stack);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(`Failed to create subscription: ${errorMsg}`);
    }
  }

  async verifySubscription(userId: string, dto: VerifySubscriptionDto): Promise<any> {
    try {
      const { razorpaySubscriptionId, razorpayPaymentId, razorpaySignature } = dto;

      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpayPaymentId + '|' + razorpaySubscriptionId)
        .digest('hex');

      if (generated_signature !== razorpaySignature) {
        throw new BadRequestException('Invalid subscription signature');
      }

      // Update payment record
      const payment = await this.paymentModel.findOne({ razorpaySubscriptionId });
      if (payment) {
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        payment.status = PaymentStatus.PAID;
        await payment.save();
      }

      // Update user subscription status
      const sub = await this.subscriptionService.findById(payment.subscriptionId.toString());

      const expiryDate = new Date();
      if (sub.type === SubscriptionType.MONTHLY) expiryDate.setMonth(expiryDate.getMonth() + 1);
      else if (sub.type === SubscriptionType.YEARLY) expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      else expiryDate.setDate(expiryDate.getDate() + (sub.duration || 30));

      await this.usersService.updateProfile(userId, {
        subscriptionPlan: sub.id as any,
        subscriptionStatus: 'active',
        subscriptionExpiry: expiryDate,
        razorpaySubscriptionId: razorpaySubscriptionId,
      } as any);

      this.logger.log(`Subscription verified and activated: ${razorpaySubscriptionId} for user: ${userId}`);
      return { success: true, payment: this.toPaymentResponseDto(payment) };
    } catch (error) {
      this.logger.error(`Subscription verification failed: ${error.message}`);
      throw new BadRequestException(`Subscription verification failed: ${error.message}`);
    }
  }

  async recordWebhookPayment(data: {
    userId: string;
    subscriptionId?: string;
    razorpayOrderId?: string;
    razorpaySubscriptionId?: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method?: string;
    description?: string;
  }): Promise<PaymentDocument> {
    const payment = new this.paymentModel({
      userId: new Types.ObjectId(data.userId),
      subscriptionId: data.subscriptionId ? new Types.ObjectId(data.subscriptionId) : undefined,
      razorpayOrderId: data.razorpayOrderId,
      razorpaySubscriptionId: data.razorpaySubscriptionId,
      razorpayPaymentId: data.razorpayPaymentId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      method: data.method as any,
      description: data.description,
      paymentType: data.razorpaySubscriptionId ? 'subscription' : 'one-time',
    });

    return payment.save();
  }

  async getAllPaymentsAdmin(limit = 20, offset = 0): Promise<any[]> {
    return this.paymentModel
      .find()
      .populate('userId', 'name email')
      .populate('subscriptionId', 'displayName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async getAdminAnalytics(): Promise<any> {
    const totalRevenue = await this.paymentModel.aggregate([
      { $match: { status: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const statusBreakdown = await this.paymentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentPayments = await this.paymentModel
      .find({ status: PaymentStatus.PAID })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('subscriptionId', 'displayName')
      .exec();

    return {
      totalRevenue: (totalRevenue[0]?.total || 0) / 100, // Return in main currency units
      statusBreakdown: statusBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      recentPayments,
    };
  }

  async processWebhook(payload: any, signature: string): Promise<void> {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.error('RAZORPAY_WEBHOOK_SECRET is not defined');
      throw new BadRequestException('Webhook secret not configured');
    }

    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(payload));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      this.logger.error('Invalid Razorpay webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const event = payload.event;
    this.logger.log(`Processing Razorpay webhook event: ${event}`);

    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged':
        await this.handleSubscriptionCharged(payload.payload);
        break;
      case 'subscription.cancelled':
      case 'subscription.halted':
      case 'subscription.expired':
        await this.handleSubscriptionTermination(payload.payload.subscription.entity);
        break;
    }
  }

  private async handleSubscriptionTermination(subscriptionEntity: any) {
    const razorpaySubscriptionId = subscriptionEntity.id;
    const user = await this.usersService.findByRazorpaySubscriptionId(razorpaySubscriptionId);

    if (user) {
      this.logger.log(`Degrading user ${user.email} to free plan due to subscription termination (${subscriptionEntity.status})`);

      await this.usersService.updateProfile(user._id.toString(), {
        subscriptionStatus: 'free',
        subscriptionPlan: null, // Reset to no plan
        // We keep razorpaySubscriptionId for history/reference but status is free
      } as any);

      await this.emailService.sendSubscriptionCancelledEmail(user.email);
      this.logger.log(`Subscription terminated and user degraded: ${user.email}`);
    }
  }

  private async handleSubscriptionCharged(payload: any) {
    const subEntity = payload.subscription.entity;
    const paymentEntity = payload.payment.entity;
    const razorpaySubscriptionId = subEntity.id;
    const razorpayPlanId = subEntity.plan_id;

    const user = await this.usersService.findByRazorpaySubscriptionId(razorpaySubscriptionId);
    if (user) {
      // Find the subscription plan (either from user profile or look up by Razorpay Plan ID)
      let sub: any = null;
      if (user.subscriptionPlan) {
        sub = await this.subscriptionService.findById(user.subscriptionPlan.toString());
      } else {
        sub = await this.subscriptionService.findOneByAnyId(razorpayPlanId);
      }

      if (!sub) {
        this.logger.error(`Could not find plan for Razorpay Plan ID: ${razorpayPlanId}`);
        return;
      }

      await this.recordWebhookPayment({
        userId: user._id.toString(),
        subscriptionId: sub.id || sub._id?.toString(),
        razorpaySubscriptionId: razorpaySubscriptionId,
        razorpayPaymentId: paymentEntity.id,
        amount: paymentEntity.amount,
        currency: paymentEntity.currency,
        status: PaymentStatus.PAID,
        method: paymentEntity.method,
        description: paymentEntity.description,
      });

      // Update expiry
      const newExpiry = new Date();
      if (sub.type === SubscriptionType.MONTHLY) newExpiry.setMonth(newExpiry.getMonth() + 1);
      else if (sub.type === SubscriptionType.YEARLY) newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      else newExpiry.setDate(newExpiry.getDate() + (sub.duration || 30));

      await this.usersService.updateProfile(user._id.toString(), {
        subscriptionStatus: 'active',
        subscriptionPlan: sub.id || sub._id,
        subscriptionExpiry: newExpiry,
        razorpaySubscriptionId: razorpaySubscriptionId // Ensure it is stored
      } as any);

      this.logger.log(`Subscription charged and activated for user: ${user.email}. Plan: ${sub.displayName}`);
    }
  }

  private verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  private toPaymentResponseDto(payment: PaymentDocument): PaymentResponseDto {
    return {
      id: payment._id.toString(),
      userId: payment.userId.toString(),
      razorpayOrderId: payment.razorpayOrderId,
      razorpaySubscriptionId: payment.razorpaySubscriptionId,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
      receipt: payment.receipt,
      notes: payment.notes,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}