import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Coupon,
  CouponDocument,
  CouponUsage,
  CouponUsageDocument,
  CouponType,
  DiscountType,
} from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(CouponUsage.name) private usageModel: Model<CouponUsageDocument>,
  ) {}

  // ── Admin: Create coupon / referral code ────────────────────────────────────

  async createCoupon(adminId: string, dto: CreateCouponDto): Promise<CouponDocument> {
    const code = dto.code.toUpperCase().trim();

    const existing = await this.couponModel.findOne({ code });
    if (existing) throw new ConflictException(`Coupon code "${code}" already exists`);

    const coupon = new this.couponModel({
      ...dto,
      code,
      createdBy: new Types.ObjectId(adminId),
      referrerId: dto.referrerId ? new Types.ObjectId(dto.referrerId) : undefined,
      applicablePlans: (dto.applicablePlans || []).map((id) => new Types.ObjectId(id)),
      linkedPlanId: dto.linkedPlanId ? new Types.ObjectId(dto.linkedPlanId) : undefined,
    });

    return coupon.save();
  }

  // ── Admin: Generate referral code for a specific user ───────────────────────

  async generateReferralCodeForUser(
    adminId: string,
    referrerId: string,
    discountValue: number,
    discountType: DiscountType = DiscountType.PERCENTAGE,
    referrerRewardAmount = 0,
  ): Promise<CouponDocument> {
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `REF${suffix}`;

    const coupon = new this.couponModel({
      code,
      type: CouponType.REFERRAL,
      discountType,
      discountValue,
      referrerId: new Types.ObjectId(referrerId),
      referrerRewardAmount,
      createdBy: new Types.ObjectId(adminId),
      isActive: true,
    });

    return coupon.save();
  }

  // ── Admin: Update / toggle coupon ───────────────────────────────────────────

  async updateCoupon(couponId: string, dto: UpdateCouponDto): Promise<CouponDocument> {
    const update: any = { ...dto };
    if (dto.applicablePlans) {
      update.applicablePlans = dto.applicablePlans.map((id) => new Types.ObjectId(id));
    }
    const coupon = await this.couponModel.findByIdAndUpdate(couponId, update, { new: true });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async toggleCoupon(couponId: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.isActive = !coupon.isActive;
    return coupon.save();
  }

  async deleteCoupon(couponId: string): Promise<void> {
    const coupon = await this.couponModel.findByIdAndDelete(couponId);
    if (!coupon) throw new NotFoundException('Coupon not found');
  }

  // ── Admin: List all coupons ──────────────────────────────────────────────────

  async getAllCoupons(filter?: { type?: CouponType; isActive?: boolean }) {
    const query: any = {};
    if (filter?.type) query.type = filter.type;
    if (filter?.isActive !== undefined) query.isActive = filter.isActive;

    return this.couponModel
      .find(query)
      .populate('createdBy', 'name email')
      .populate('referrerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  // ── Admin: Detailed stats for a single coupon ───────────────────────────────

  async getCouponStats(couponId: string) {
    const coupon = await this.couponModel
      .findById(couponId)
      .populate('createdBy', 'name email')
      .populate('referrerId', 'name email')
      .lean();
    if (!coupon) throw new NotFoundException('Coupon not found');

    const usages = await this.usageModel
      .find({ couponId: new Types.ObjectId(couponId) })
      .populate('userId', 'name email')
      .sort({ usedAt: -1 })
      .lean();

    const totalDiscountGranted = usages.reduce((s, u) => s + u.discountAmount, 0);
    const totalRevenue = usages.reduce((s, u) => s + u.finalAmount, 0);

    return {
      coupon,
      stats: {
        totalUses: usages.length,
        totalDiscountGranted,
        totalRevenue,
        averageDiscount:
          usages.length > 0 ? Math.round(totalDiscountGranted / usages.length) : 0,
      },
      usages,
    };
  }

  // ── Admin: Overall coupon analytics ─────────────────────────────────────────

  async getCouponAnalytics() {
    const [totalCoupons, activeCoupons, usages] = await Promise.all([
      this.couponModel.countDocuments(),
      this.couponModel.countDocuments({ isActive: true }),
      this.usageModel.find().lean(),
    ]);

    const totalDiscountGranted = usages.reduce((s, u) => s + u.discountAmount, 0);
    const totalRevenue = usages.reduce((s, u) => s + u.finalAmount, 0);

    // Top coupons by usage
    const topCouponsRaw = await this.usageModel.aggregate([
      {
        $group: {
          _id: '$couponId',
          uses: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
        },
      },
      { $sort: { uses: -1 } },
      { $limit: 5 },
    ]);

    const topCoupons = await Promise.all(
      topCouponsRaw.map(async (tc) => {
        const coupon = await this.couponModel.findById(tc._id).select('code type discountValue').lean();
        return { ...tc, coupon };
      }),
    );

    return {
      totalCoupons,
      activeCoupons,
      totalUsages: usages.length,
      totalDiscountGranted,
      totalRevenue,
      topCoupons,
    };
  }

  // ── User: Validate a coupon code ─────────────────────────────────────────────

  async validateCoupon(
    userId: string,
    dto: ValidateCouponDto,
  ): Promise<{
    valid: boolean;
    coupon?: CouponDocument;
    discountAmount: number;
    finalAmount: number;
    message: string;
  }> {
    const code = dto.code.toUpperCase().trim();
    const coupon = await this.couponModel.findOne({ code });

    if (!coupon || !coupon.isActive) {
      return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: 'Invalid or inactive coupon code.' };
    }

    // Expiry check
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: 'This coupon has expired.' };
    }

    // Max uses check
    if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: 'This coupon has reached its usage limit.' };
    }

    // Min order check
    if (coupon.minOrderAmount && dto.orderAmount < coupon.minOrderAmount) {
      const min = coupon.minOrderAmount / 100;
      return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: `Minimum order of ₹${min} required.` };
    }

    // Check user hasn't already used this coupon (prevent double dipping)
    const alreadyUsed = await this.usageModel.findOne({
      couponId: coupon._id,
      userId: new Types.ObjectId(userId),
    });
    if (alreadyUsed) {
      return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: 'You have already used this coupon.' };
    }

    // Referral: user can't use their own referral code
    if (coupon.type === CouponType.REFERRAL && coupon.referrerId?.toString() === userId) {
      return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: "You can't use your own referral code." };
    }

    // Plan restriction check
    if (coupon.applicablePlans?.length > 0 && dto.subscriptionId) {
      const applicable = coupon.applicablePlans.map((p) => p.toString());
      if (!applicable.includes(dto.subscriptionId)) {
        return { valid: false, discountAmount: 0, finalAmount: dto.orderAmount, message: 'This coupon is not valid for the selected plan.' };
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = Math.round((dto.orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, dto.orderAmount);
    }

    const finalAmount = dto.orderAmount - discountAmount;

    return {
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
      message: `Coupon applied! You save ₹${(discountAmount / 100).toFixed(2)}.`,
    };
  }

  // ── Record usage after successful payment ────────────────────────────────────

  async recordCouponUsage(
    couponId: string,
    userId: string,
    paymentId: string,
    discountAmount: number,
    originalAmount: number,
    finalAmount: number,
    subscriptionName?: string,
  ): Promise<void> {
    try {
      await this.usageModel.create({
        couponId: new Types.ObjectId(couponId),
        userId: new Types.ObjectId(userId),
        paymentId: new Types.ObjectId(paymentId),
        discountAmount,
        originalAmount,
        finalAmount,
        subscriptionName,
      });

      await this.couponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
      this.logger.log(`Coupon ${couponId} used by user ${userId}, discount: ${discountAmount}`);
    } catch (err) {
      this.logger.error(`Failed to record coupon usage: ${err.message}`);
    }
  }

  // ── User: Get their own referral code (creates one if none exists) ───────────

  async getOrCreateUserReferralCode(userId: string): Promise<CouponDocument> {
    const existing = await this.couponModel.findOne({
      type: CouponType.REFERRAL,
      referrerId: new Types.ObjectId(userId),
      isActive: true,
    });
    if (existing) return existing;

    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `REF${suffix}`;

    return this.couponModel.create({
      code,
      type: CouponType.REFERRAL,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10, // Default 10% referral discount
      referrerId: new Types.ObjectId(userId),
      referrerRewardAmount: 0,
      createdBy: new Types.ObjectId(userId),
      isActive: true,
      description: 'Personal referral code',
    });
  }

  async getUserReferralStats(userId: string) {
    const coupon = await this.couponModel.findOne({
      type: CouponType.REFERRAL,
      referrerId: new Types.ObjectId(userId),
    });

    if (!coupon) return { referralCode: null, totalReferrals: 0, usages: [] };

    const usages = await this.usageModel
      .find({ couponId: coupon._id })
      .populate('userId', 'name email')
      .sort({ usedAt: -1 })
      .lean();

    return {
      referralCode: coupon.code,
      discountValue: coupon.discountValue,
      discountType: coupon.discountType,
      totalReferrals: usages.length,
      usages,
    };
  }

  // ── User: Redeem an ACCESS_CODE coupon ────────────────────────────────────────

  async redeemAccessCode(
    userId: string,
    code: string,
  ): Promise<{
    valid: boolean;
    couponId?: string;
    linkedPlanId?: string;
    trialDays?: number;
    message: string;
  }> {
    const couponCode = code.toUpperCase().trim();
    const coupon = await this.couponModel
      .findOne({ code: couponCode })
      .populate('linkedPlanId');

    if (!coupon || !coupon.isActive) {
      return { valid: false, message: 'Invalid or inactive access code.' };
    }

    if (coupon.type !== CouponType.ACCESS_CODE) {
      return { valid: false, message: 'This is not a valid access code.' };
    }

    // Expiry check
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, message: 'This access code has expired.' };
    }

    // Max uses check
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: 'This access code has reached its usage limit.' };
    }

    // Check user hasn't already used this code
    const alreadyUsed = await this.usageModel.findOne({
      couponId: coupon._id,
      userId: new Types.ObjectId(userId),
    });
    if (alreadyUsed) {
      return { valid: false, message: 'You have already used this access code.' };
    }

    if (!coupon.linkedPlanId) {
      return { valid: false, message: 'Access code is not linked to any plan. Contact support.' };
    }

    if (!coupon.trialDays || coupon.trialDays <= 0) {
      return { valid: false, message: 'Access code has no trial duration configured. Contact support.' };
    }

    return {
      valid: true,
      couponId: coupon._id.toString(),
      linkedPlanId: coupon.linkedPlanId.toString(),
      trialDays: coupon.trialDays,
      message: `Access code valid! You'll get a ${coupon.trialDays}-day free trial.`,
    };
  }

  // ── Record access code usage (after trial activation) ─────────────────────

  async recordAccessCodeUsage(couponId: string, userId: string): Promise<void> {
    try {
      await this.usageModel.create({
        couponId: new Types.ObjectId(couponId),
        userId: new Types.ObjectId(userId),
        discountAmount: 0,
        originalAmount: 0,
        finalAmount: 0,
        subscriptionName: 'Trial via Access Code',
      });

      await this.couponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
      this.logger.log(`Access code ${couponId} redeemed by user ${userId}`);
    } catch (err) {
      this.logger.error(`Failed to record access code usage: ${err.message}`);
    }
  }
}
