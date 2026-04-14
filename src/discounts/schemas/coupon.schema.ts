import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;
export type CouponUsageDocument = CouponUsage & Document;

export enum CouponType {
  DISCOUNT = 'discount',       // Admin-created promo code
  REFERRAL = 'referral',       // Referral code tied to a referrer user
  ACCESS_CODE = 'access_code', // Trial access code — grants a plan for X days
}

export enum DiscountType {
  PERCENTAGE = 'percentage', // e.g. 20% off
  FIXED = 'fixed',           // e.g. ₹200 off
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: CouponType, default: CouponType.DISCOUNT })
  type: CouponType;

  @Prop({ enum: DiscountType, default: DiscountType.PERCENTAGE })
  discountType: DiscountType;

  @Prop({ default: 0 })
  discountValue: number; // Percentage (0-100) or fixed amount in paisa

  @Prop()
  maxDiscountAmount?: number; // Cap for percentage discounts (in paisa)

  @Prop()
  minOrderAmount?: number; // Minimum order value to apply (in paisa)

  @Prop({ default: null })
  maxUses?: number; // null = unlimited

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // Admin who created it

  // For referral codes: the user who owns this referral link
  @Prop({ type: Types.ObjectId, ref: 'User' })
  referrerId?: Types.ObjectId;

  // Reward for the referrer when someone uses their code
  @Prop({ default: 0 })
  referrerRewardAmount: number; // in paisa

  @Prop()
  description?: string;

  // Which subscription plans this applies to (empty = all plans)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Subscription' }], default: [] })
  applicablePlans: Types.ObjectId[];

  // ── ACCESS_CODE fields ──────────────────────────────────────────────
  // Number of free trial days this code grants (e.g. 14, 30)
  @Prop()
  trialDays?: number;

  // The subscription plan that gets activated when this code is redeemed
  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  linkedPlanId?: Types.ObjectId;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ type: 1, isActive: 1 });

// ─── Coupon Usage ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true })
export class CouponUsage {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Coupon' })
  couponId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  @Prop({ required: true })
  discountAmount: number; // Actual amount discounted in paisa

  @Prop({ required: true })
  originalAmount: number; // Original order amount in paisa

  @Prop({ required: true })
  finalAmount: number; // Amount paid after discount in paisa

  @Prop()
  subscriptionName?: string; // Which plan was purchased

  @Prop({ default: Date.now })
  usedAt: Date;
}

export const CouponUsageSchema = SchemaFactory.createForClass(CouponUsage);
CouponUsageSchema.index({ couponId: 1 });
CouponUsageSchema.index({ userId: 1 });
