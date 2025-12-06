import { PaymentStatus, PaymentMethod } from '../schemas/payment.schema';

export class PaymentResponseDto {
  id: string;

  userId: string;

  razorpayOrderId: string;

  razorpayPaymentId?: string;

  amount: number;

  currency: string;

  status: PaymentStatus;

  method?: PaymentMethod;

  description?: string;

  receipt?: string;

  notes?: Record<string, any>;

  failureReason?: string;

  createdAt: Date;

  updatedAt: Date;
}

export class OrderResponseDto {
  id: string;

  amount: number;

  currency: string;

  receipt?: string;

  status: string;

  created_at: number;

  notes?: Record<string, any>;
}