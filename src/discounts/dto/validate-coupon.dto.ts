import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  orderAmount: number; // Amount in paisa to validate against minOrderAmount

  @IsString()
  @IsOptional()
  subscriptionId?: string; // To check if coupon applies to this plan
}
