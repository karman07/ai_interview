import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max, IsArray } from 'class-validator';
import { CouponType, DiscountType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number; // percentage (1-100) or fixed amount in paisa

  @IsNumber()
  @IsOptional()
  maxDiscountAmount?: number; // cap in paisa (for percentage discounts)

  @IsNumber()
  @IsOptional()
  minOrderAmount?: number; // min order in paisa

  @IsNumber()
  @IsOptional()
  maxUses?: number; // null = unlimited

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  referrerId?: string; // for referral codes: the user whose referral this is

  @IsNumber()
  @IsOptional()
  referrerRewardAmount?: number; // paisa reward for referrer

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  applicablePlans?: string[]; // subscription plan IDs

  // ── ACCESS_CODE fields ──────────────────────────────────────────────
  @IsNumber()
  @IsOptional()
  @Min(1)
  trialDays?: number; // free trial duration in days

  @IsString()
  @IsOptional()
  linkedPlanId?: string; // subscription plan ID to activate
}
