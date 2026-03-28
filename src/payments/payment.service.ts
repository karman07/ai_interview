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
import { DiscountsService } from '../discounts/discounts.service';

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
    private discountsService: DiscountsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      const { amount, description, receipt, notes, couponCode } = createOrderDto;

      // Convert amount to paisa (smallest currency unit)
      const originalAmountInPaisa = Math.round(amount * 100);
      let finalAmountInPaisa = originalAmountInPaisa;
      let discountAmount = 0;
      let appliedCoupon: any = null;

      // Apply coupon discount if provided
      if (couponCode) {
        const couponResult = await this.discountsService.validateCoupon(userId, {
          code: couponCode,
          orderAmount: originalAmountInPaisa,
          subscriptionId: createOrderDto.subscriptionId,
        });

        if (couponResult.valid && couponResult.coupon) {
          discountAmount = couponResult.discountAmount;
          finalAmountInPaisa = couponResult.finalAmount;
          appliedCoupon = couponResult.coupon;
          this.logger.log(`Coupon ${couponCode} applied for user ${userId}: discount=${discountAmount} paisa`);
        } else {
          throw new BadRequestException(couponResult.message);
        }
      }

      const orderOptions = {
        amount: finalAmountInPaisa,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...(notes || {}),
          ...(appliedCoupon ? { couponCode, discountAmount, originalAmount: originalAmountInPaisa } : {}),
        },
      };

      // Create order in Razorpay
      const razorpayOrder = await this.razorpay.orders.create(orderOptions);

      // Save payment record in database
      const payment = new this.paymentModel({
        userId: new Types.ObjectId(userId),
        subscriptionId: createOrderDto.subscriptionId ? new Types.ObjectId(createOrderDto.subscriptionId) : undefined,
        amount: finalAmountInPaisa,
        currency: razorpayOrder.currency,
        status: PaymentStatus.CREATED,
        razorpayOrderId: razorpayOrder.id,
        description,
        receipt: razorpayOrder.receipt,
        notes: razorpayOrder.notes,
      });

      await payment.save();

      // Record coupon usage immediately (order created = intent to pay)
      if (appliedCoupon) {
        await this.discountsService.recordCouponUsage(
          appliedCoupon._id.toString(),
          userId,
          payment._id.toString(),
          discountAmount,
          originalAmountInPaisa,
          finalAmountInPaisa,
        );
      }

      this.logger.log(`Order created: ${razorpayOrder.id} for user: ${userId}`);

      return {
        id: razorpayOrder.id,
        amount: Number(razorpayOrder.amount),
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at,
        notes: razorpayOrder.notes,
        ...(appliedCoupon ? {
          discountApplied: true,
          discountAmount,
          originalAmount: originalAmountInPaisa,
          couponCode,
        } : {}),
      } as any;
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

  // ── PAYG subscription autopay ─────────────────────────────────────────────

  /**
   * Creates a Razorpay subscription for a user-defined monthly budget.
   * Since every user can have a different amount, we create a fresh Razorpay plan
   * per-budget on the fly (or reuse an existing one with the same amount).
   */
  async createPaygSubscription(userId: string, monthlyBudgetRupees: number): Promise<any> {
    try {
      const budgetInPaisa = Math.round(monthlyBudgetRupees * 100);
      this.logger.log(`Creating PAYG subscription for user ${userId} budget=${budgetInPaisa} paisa`);

      // Fetch PAYG plan template from DB to validate min/max bounds
      const paygTemplate = await this.subscriptionService.findOneByAnyId('payg_in')
        ?? await this.subscriptionService.findOneByAnyId('payg_us');
      if (!paygTemplate) throw new BadRequestException('PAYG plan template not found. Contact support.');

      const minBudget = (paygTemplate as any).paygMinBudget ?? 9900;
      const maxBudget = (paygTemplate as any).paygMaxBudget ?? 500000;
      if (budgetInPaisa < minBudget) throw new BadRequestException(`Minimum budget is ₹${minBudget / 100}`);
      if (budgetInPaisa > maxBudget) throw new BadRequestException(`Maximum budget is ₹${maxBudget / 100}`);

      // Create (or reuse) a Razorpay plan for this exact budget amount
      let razorpayPlanId: string;
      const planLabel = `PAYG ₹${monthlyBudgetRupees}/mo`;
      const existingPlans = await this.razorpay.plans.all({ count: 100 });
      const matching = (existingPlans as any).items?.find(
        (p: any) => p.item.amount === budgetInPaisa && p.item.currency === 'INR' && p.item.name === planLabel
      );
      if (matching) {
        razorpayPlanId = matching.id;
        this.logger.log(`Reusing existing Razorpay plan ${razorpayPlanId} for ${planLabel}`);
      } else {
        const newPlan = await (this.razorpay.plans.create as Function)({
          period: 'monthly',
          interval: 1,
          item: { name: planLabel, amount: budgetInPaisa, currency: 'INR', description: 'Pay As You Go monthly budget' },
        });
        razorpayPlanId = newPlan.id;
        this.logger.log(`Created Razorpay plan ${razorpayPlanId} for ${planLabel}`);
      }

      // Create the recurring subscription
      const rzpSub = await this.razorpay.subscriptions.create({
        plan_id: razorpayPlanId,
        customer_notify: 1,
        total_count: 120, // 10 years
        quantity: 1,
        notes: { userId, budgetRupees: String(monthlyBudgetRupees), type: 'payg' },
      } as any);

      // Record pending payment
      const payment = new this.paymentModel({
        userId: new Types.ObjectId(userId),
        subscriptionId: paygTemplate._id,
        amount: budgetInPaisa,
        currency: 'INR',
        status: PaymentStatus.CREATED,
        razorpaySubscriptionId: rzpSub.id,
        paymentType: 'subscription',
        description: `PAYG monthly budget — ${planLabel}`,
        notes: { budgetRupees: monthlyBudgetRupees },
      });
      await payment.save();

      this.logger.log(`PAYG Razorpay subscription created: ${rzpSub.id}`);
      return {
        subscriptionId: rzpSub.id,
        razorpayKey: this.configService.get<string>('RAZORPAY_KEY_ID'),
        budgetRupees: monthlyBudgetRupees,
        planId: razorpayPlanId,
      };
    } catch (error) {
      const msg = error.error?.description || error.message || 'Unknown error';
      this.logger.error(`Failed to create PAYG subscription: ${msg}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to create PAYG subscription: ${msg}`);
    }
  }

  /**
   * Verifies the Razorpay payment signature after PAYG checkout completes.
   * On success: activates the PAYG plan (sets limits, billing cycle, subscription status).
   */
  async verifyPaygSubscription(userId: string, dto: {
    razorpaySubscriptionId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    budgetRupees: number;
  }): Promise<any> {
    const { razorpaySubscriptionId, razorpayPaymentId, razorpaySignature, budgetRupees } = dto;
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    const generated = crypto
      .createHmac('sha256', secret)
      .update(razorpayPaymentId + '|' + razorpaySubscriptionId)
      .digest('hex');

    if (generated !== razorpaySignature) {
      throw new BadRequestException('Invalid PAYG payment signature');
    }

    // Update payment record
    const payment = await this.paymentModel.findOne({ razorpaySubscriptionId });
    if (payment) {
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = PaymentStatus.PAID;
      await payment.save();
    }

    // Activate the PAYG plan — sets limits + billing cycle + stores razorpaySubscriptionId on user
    const user = await this.usersService.setupPayg(userId, budgetRupees);

    // Also store the Razorpay subscription ID on the user so webhook resets work
    await this.usersService.updateProfile(userId, {
      razorpaySubscriptionId,
    } as any);

    this.logger.log(`PAYG plan activated: ${razorpaySubscriptionId} for user ${userId} — ₹${budgetRupees}/mo`);
    return { success: true, budgetRupees, interviewsLimit: user.paygInterviewsLimit, resumesLimit: user.paygResumesLimit };
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
            currency: subscription.currency || 'INR',
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
    const { razorpaySubscriptionId, razorpayPaymentId, razorpaySignature } = dto;
    this.logger.log(`[verifySubscription] START userId=${userId} rzpSub=${razorpaySubscriptionId} rzpPay=${razorpayPaymentId}`);

    try {
      // ── 1. Verify HMAC signature ──────────────────────────────────────────
      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      const generated = crypto
        .createHmac('sha256', secret)
        .update(razorpayPaymentId + '|' + razorpaySubscriptionId)
        .digest('hex');

      if (generated !== razorpaySignature) {
        this.logger.error(`[verifySubscription] ❌ Signature mismatch`);
        throw new BadRequestException('Invalid subscription signature');
      }
      this.logger.log(`[verifySubscription] ✅ Signature valid`);

      // ── 2. Update payment record if it exists ─────────────────────────────
      const payment = await this.paymentModel.findOne({ razorpaySubscriptionId });
      this.logger.log(`[verifySubscription] Payment record: ${payment ? `found (${payment._id})` : 'NOT FOUND — will resolve plan from Razorpay'}`);

      if (payment) {
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        payment.status = PaymentStatus.PAID;
        await payment.save();
        this.logger.log(`[verifySubscription] ✅ Payment marked PAID`);
      }

      // ── 3. Resolve plan (payment record → Razorpay API → user's plan) ─────
      let sub: any = null;

      if (payment?.subscriptionId) {
        try {
          sub = await this.subscriptionService.findById(payment.subscriptionId.toString());
          this.logger.log(`[verifySubscription] Plan from payment record: ${sub?.displayName} id=${sub?.id}`);
        } catch (e) { this.logger.warn(`[verifySubscription] findById from payment failed: ${e.message}`); }
      }

      if (!sub) {
        try {
          this.logger.log(`[verifySubscription] Fetching Razorpay subscription ${razorpaySubscriptionId}...`);
          const rzpSub = await this.razorpay.subscriptions.fetch(razorpaySubscriptionId);
          const rzpPlanId = (rzpSub as any).plan_id;
          this.logger.log(`[verifySubscription] Razorpay plan_id=${rzpPlanId}`);
          if (rzpPlanId) {
            sub = await this.subscriptionService.findOneByAnyId(rzpPlanId);
            this.logger.log(`[verifySubscription] Plan from Razorpay: ${sub?.displayName}`);
          }
        } catch (e) { this.logger.warn(`[verifySubscription] Razorpay fetch failed: ${e.message}`); }
      }

      if (!sub) {
        try {
          const userDoc = await this.usersService.findById(userId);
          if (userDoc?.subscriptionPlan) {
            sub = await this.subscriptionService.findById(userDoc.subscriptionPlan.toString());
            this.logger.log(`[verifySubscription] Plan from user's existing plan: ${sub?.displayName}`);
          }
        } catch (e) { this.logger.warn(`[verifySubscription] User plan fallback failed: ${e.message}`); }
      }

      if (!sub) {
        this.logger.error(`[verifySubscription] ❌ Could not resolve plan for user ${userId}`);
        throw new BadRequestException('Could not resolve subscription plan. Contact support.');
      }

      // ── 4. Expiry ─────────────────────────────────────────────────────────
      const expiryDate = new Date();
      if (sub.type === SubscriptionType.MONTHLY) expiryDate.setMonth(expiryDate.getMonth() + 1);
      else if (sub.type === SubscriptionType.YEARLY) expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      else expiryDate.setDate(expiryDate.getDate() + (sub.duration || 30));

      // ── 5. Extract limits from plan features ──────────────────────────────
      const features: any[] = (sub as any).features ?? [];
      this.logger.log(`[verifySubscription] Plan "${sub.displayName}" features: ${JSON.stringify(features.map((f: any) => ({ name: f.name, value: f.value, limit: f.limit })))}`);

      const interviewFeature = features.find((f: any) => f.name === 'Interview Limit');
      const resumeFeature    = features.find((f: any) => f.name === 'Resume Limit' || f.name === 'Resume Upload Limit');
      const newInterviewLimit = interviewFeature ? Number(interviewFeature.limit ?? interviewFeature.value ?? 3) : 3;
      const newResumeLimit    = resumeFeature    ? Number(resumeFeature.limit    ?? resumeFeature.value    ?? 5) : 5;

      this.logger.log(`[verifySubscription] 📊 Stamping: interviews=${newInterviewLimit}, resumes=${newResumeLimit}`);

      // ── 6. Update user ────────────────────────────────────────────────────
      await this.usersService.updateProfile(userId, {
        subscriptionPlan:       (sub.id ?? sub._id) as any,
        subscriptionStatus:     'active',
        subscriptionExpiry:     expiryDate,
        razorpaySubscriptionId: razorpaySubscriptionId,
        interviewLimit:         newInterviewLimit,
        resumeLimit:            newResumeLimit,
        resumeCount:            0,
        interviewCount:         0,
      } as any);

      this.logger.log(`[verifySubscription] ✅ DONE. User=${userId} Plan=${sub.displayName} interviews=${newInterviewLimit} resumes=${newResumeLimit} usage=0`);
      return { success: true, plan: sub.displayName, interviewLimit: newInterviewLimit, resumeLimit: newResumeLimit, payment: payment ? this.toPaymentResponseDto(payment) : null };
    } catch (error) {
      this.logger.error(`[verifySubscription] ❌ FAILED: ${error.message}`, error.stack);
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
      
      const freePlan = await this.usersService.getFreeTierPlan();
      const limits = this.usersService.extractLimitsFromPlan(freePlan);

      await this.usersService.updateProfile(user._id.toString(), {
        subscriptionStatus: 'free',
        subscriptionPlan: freePlan ? freePlan._id : null, 
        // Reset usage count limits back to dynamic Free Tier logic
        interviewLimit: limits.interviewLimit,
        resumeLimit: limits.resumeLimit,
        interviewCount: 0,
        resumeCount: 0,
        // Reset PAYG state
        paygMonthlyBudget: 0,
        paygInterviewsLimit: 0,
        paygResumesLimit: 0,
        paygInterviewsUsed: 0,
        paygResumesUsed: 0,
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

      // ✅ Re-stamp limits from plan features on every renewal (plan may have been updated by admin)
      const features = (sub as any).features ?? [];
      const interviewFeature  = features.find((f: any) => f.name === 'Interview Limit');
      const resumeFeature     = features.find((f: any) => f.name === 'Resume Limit' || f.name === 'Resume Upload Limit');
      const newInterviewLimit = interviewFeature ? (interviewFeature.value ?? interviewFeature.limit ?? 3) : 3;
      const newResumeLimit    = resumeFeature    ? (resumeFeature.value    ?? resumeFeature.limit    ?? 5) : 5;

      await this.usersService.updateProfile(user._id.toString(), {
        subscriptionStatus: 'active',
        subscriptionPlan: sub.id || sub._id,
        subscriptionExpiry: newExpiry,
        razorpaySubscriptionId: razorpaySubscriptionId,
        // ✅ Stamp limits and reset usage on renewal
        interviewLimit: newInterviewLimit,
        resumeLimit:    newResumeLimit,
        resumeCount:    0,
        interviewCount: 0,
      } as any);

      this.logger.log(`Subscription renewed for user: ${user.email}. Plan: ${sub.displayName}. Limits: ${newInterviewLimit} interviews / ${newResumeLimit} resumes.`);
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