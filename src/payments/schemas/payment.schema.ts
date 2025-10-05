import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  CREATED = 'created',
  ATTEMPTED = 'attempted',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  NETBANKING = 'netbanking',
  UPI = 'upi',
  WALLET = 'wallet',
  EMI = 'emi',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  razorpayOrderId: string;

  @Prop()
  razorpayPaymentId: string;

  @Prop()
  razorpaySignature: string;

  @Prop({ required: true })
  amount: number; // Amount in paisa (smallest currency unit)

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @Prop({ enum: PaymentMethod })
  method: PaymentMethod;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  notes: Record<string, any>;

  @Prop()
  receipt: string;

  @Prop()
  failureReason: string;

  @Prop()
  refundedAmount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);