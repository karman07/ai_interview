import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { DiscountType } from '../schemas/coupon.schema';

export class UpdateCouponDto {
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  maxDiscountAmount?: number;

  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  referrerRewardAmount?: number;

  @IsArray()
  @IsOptional()
  applicablePlans?: string[];
}
