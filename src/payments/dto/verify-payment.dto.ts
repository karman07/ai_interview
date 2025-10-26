import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_abc123',
  })
  @IsNotEmpty()
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay payment ID',
    example: 'pay_xyz789',
  })
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'Razorpay signature for verification',
    example: 'signature_hash',
  })
  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;
}