import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../schemas/payment.schema';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439012',
  })
  userId: string;

  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_abc123',
  })
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay payment ID',
    example: 'pay_xyz789',
    required: false,
  })
  razorpayPaymentId?: string;

  @ApiProperty({
    description: 'Amount in paisa',
    example: 50050,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'INR',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
    required: false,
  })
  method?: PaymentMethod;

  @ApiProperty({
    description: 'Payment description',
    example: 'Payment for premium subscription',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Receipt identifier',
    example: 'receipt_123',
    required: false,
  })
  receipt?: string;

  @ApiProperty({
    description: 'Payment notes',
    example: { plan: 'premium', duration: '1 month' },
    required: false,
  })
  notes?: Record<string, any>;

  @ApiProperty({
    description: 'Failure reason if payment failed',
    example: 'Payment failed due to insufficient funds',
    required: false,
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-10-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-10-01T10:05:00Z',
  })
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Order amount in paisa',
    example: 50050,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'INR',
  })
  currency: string;

  @ApiProperty({
    description: 'Order receipt',
    example: 'receipt_123',
    required: false,
  })
  receipt?: string;

  @ApiProperty({
    description: 'Order status',
    example: 'created',
  })
  status: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: 1633089600,
  })
  created_at: number;

  @ApiProperty({
    description: 'Order notes',
    example: { plan: 'premium' },
    required: false,
  })
  notes?: Record<string, any>;
}