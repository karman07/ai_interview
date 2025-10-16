import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import {
  CreateOrderDto,
  VerifyPaymentDto,
  PaymentResponseDto,
  OrderResponseDto,
} from './dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
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
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaisa,
        currency: razorpayOrder.currency,
        status: PaymentStatus.CREATED,
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