import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Amount in INR (will be converted to paisa)',
    example: 500.50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Payment for premium subscription',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Receipt identifier',
    example: 'receipt_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: { plan: 'premium', duration: '1 month' },
    required: false,
  })
  @IsOptional()
  notes?: Record<string, any>;
}