import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Subscription, SubscriptionDocument, SubscriptionType } from '../subscriptions/schemas/subscription.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  async getFreeTierPlan() {
    return this.subscriptionModel.findOne({ name: /free_tier/i }).exec();
  }

  private normalizeLimit(value: any, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
  }

  extractLimitsFromPlan(plan: SubscriptionDocument | null) {
    let interviewLimit = 0;
    let resumeLimit = 0;
    let coverLetterLimit = 0;

    if (plan && (plan as any).features) {
      const features = (plan as any).features;
      const intF = features.find((f: any) => f.name === 'Interview Limit');
      const resF = features.find((f: any) => f.name === 'Resume Limit' || f.name === 'Resume Upload Limit');
      const clF  = features.find((f: any) => f.name === 'Cover Letter Limit');
      if (intF) interviewLimit    = this.normalizeLimit(intF.value ?? intF.limit, 0);
      if (resF) resumeLimit       = this.normalizeLimit(resF.value ?? resF.limit, 0);
      if (clF)  coverLetterLimit  = this.normalizeLimit(clF.value  ?? clF.limit,  0);
    }

    return { interviewLimit, resumeLimit, coverLetterLimit };
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const freePlan = await this.getFreeTierPlan();
    const limits = this.extractLimitsFromPlan(freePlan);
    const syncKey = `${freePlan?._id?.toString?.() ?? 'free'}:free`;

    const now = new Date();
    const limitsNextReset = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const created = new this.userModel({
      ...dto,
      passwordHash,
      subscriptionPlan: freePlan?._id,
      subscriptionStatus: 'free',
      interviewLimit: this.normalizeLimit(dto.interviewLimit, limits.interviewLimit),
      resumeLimit: this.normalizeLimit(dto.resumeLimit, limits.resumeLimit),
      coverLetterLimit: this.normalizeLimit((dto as any).coverLetterLimit, limits.coverLetterLimit),
      limitsSyncKey: syncKey,
      limitsNextReset,
    });
    return created.save();
  }

  async createGoogleUser(data: { name: string; email: string; googleId: string; profileImageUrl?: string }): Promise<UserDocument> {
    const freePlan = await this.getFreeTierPlan();
    const limits = this.extractLimitsFromPlan(freePlan);
    const syncKey = `${freePlan?._id?.toString?.() ?? 'free'}:free`;

    const now = new Date();
    const limitsNextReset = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const created = new this.userModel({
      ...data,
      isEmailVerified: true,
      subscriptionPlan: freePlan?._id,
      subscriptionStatus: 'free',
      interviewLimit: this.normalizeLimit((data as any).interviewLimit, limits.interviewLimit),
      resumeLimit: this.normalizeLimit((data as any).resumeLimit, limits.resumeLimit),
      coverLetterLimit: this.normalizeLimit((data as any).coverLetterLimit, limits.coverLetterLimit),
      limitsSyncKey: syncKey,
      limitsNextReset,
    });
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async findByRazorpaySubscriptionId(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ razorpaySubscriptionId: id }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .populate('subscriptionPlan')
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('subscriptionPlan').exec();
    if (!user) throw new NotFoundException('User not found');

    const updatePayload: Record<string, any> = {};

    // 0 limits are now intentional for the free tier (coupon-gated access).
    // Only repair limits if they are null/undefined (not if they are 0).
    const planDoc: any = (user as any).subscriptionPlan ?? null;
    const planLimits = this.extractLimitsFromPlan(planDoc);
    if (user.interviewLimit == null) {
      updatePayload.interviewLimit = planLimits.interviewLimit;
    }
    if (user.resumeLimit == null) {
      updatePayload.resumeLimit = planLimits.resumeLimit;
    }
    if (user.coverLetterLimit == null) {
      updatePayload.coverLetterLimit = planLimits.coverLetterLimit;
    }

    // Repair inconsistent status (e.g., paid/PAYG plan but status is still "free").
    const status = String(user.subscriptionStatus || '').toLowerCase();
    const planName = String(planDoc?.name || '').toLowerCase();
    const isPaygPlan = planDoc?.type === SubscriptionType.PAY_AS_YOU_GO || planName.includes('payg_');
    const isFreePlan = planName.startsWith('free_tier') || planName === 'free';
    const hasPaygBudget = Number(user.paygMonthlyBudget || 0) > 0;

    if (status === 'free') {
      if (isPaygPlan && hasPaygBudget) {
        updatePayload.subscriptionStatus = 'active';
      } else if (planDoc && !isFreePlan) {
        updatePayload.subscriptionStatus = 'active';
      }
    }

    // If plan/status changed since last sync, reset only usage counters.
    const planId = planDoc?._id?.toString?.() ?? 'none';
    const effectiveStatus = String(updatePayload.subscriptionStatus ?? status ?? 'free').toLowerCase();
    const currentSyncKey = `${planId}:${effectiveStatus}`;
    if (user.limitsSyncKey !== currentSyncKey) {
      updatePayload.interviewCount = 0;
      updatePayload.resumeCount = 0;
      if (isPaygPlan) {
        updatePayload.paygInterviewsUsed = 0;
        updatePayload.paygResumesUsed = 0;
      }
      if (!isPaygPlan) {
        updatePayload.interviewLimit = planLimits.interviewLimit;
        updatePayload.resumeLimit = planLimits.resumeLimit;
        updatePayload.coverLetterLimit = planLimits.coverLetterLimit;
      }
      updatePayload.limitsSyncKey = currentSyncKey;
    }

    if (Object.keys(updatePayload).length === 0) {
      return user;
    }

    const repaired = await this.userModel
      .findByIdAndUpdate(id, { $set: updatePayload }, { new: true })
      .populate('subscriptionPlan')
      .exec();
    if (!repaired) throw new NotFoundException('User not found');
    return repaired;
  }

  async updateProfile(userId: string, partial: Partial<User>): Promise<UserDocument> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      partial,
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async incrementInterviewCount(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $inc: { interviewCount: 1 } }).exec();
  }

  async setRefreshToken(userId: string, hash: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash }).exec();
  }

  async adminUpdateUserPlan(
    userId: string,
    planId: string | null,
    status: string,
    expiryDays?: number,
  ): Promise<UserDocument> {
    const plan = planId
      ? await this.subscriptionModel.findById(planId).exec()
      : await this.getFreeTierPlan();

    if (!plan) throw new NotFoundException('Subscription plan not found');

    const expiry = expiryDays && expiryDays > 0
      ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
      : undefined;

    const planName = String((plan as any).name || '').toLowerCase();
    const isFreePlan = planName.startsWith('free_tier') || planName === 'free';
    const isPaygPlan = (plan as any).type === SubscriptionType.PAY_AS_YOU_GO || planName.includes('payg_');
    const effectiveStatus = (!isFreePlan && status === 'free') ? 'active' : status;

    // Derive limits from the selected target plan.
    const limits = this.extractLimitsFromPlan(plan);
    let newInterviewLimit = this.normalizeLimit(limits.interviewLimit, 0);
    let newResumeLimit = this.normalizeLimit(limits.resumeLimit, 0);

    const update: any = {
      subscriptionPlan: plan._id,
      subscriptionStatus: effectiveStatus,
      // Reset usage counters on plan switch
      resumeCount: 0,
      interviewCount: 0,
      limitsSyncKey: `${plan._id.toString()}:${effectiveStatus}`,
    };

    if (isPaygPlan) {
      // For PAYG, derive limits from budget/pricing so UI and enforcement stay aligned.
      const monthlyBudget = Math.max(Number((plan as any).paygMinBudget ?? 9900), Number((plan as any).paygMinBudget ?? 9900));
      const pricePerInterview = Number((plan as any).paygPricePerInterview ?? 4900);
      const pricePerResume = Number((plan as any).paygPricePerResume ?? 2900);

      const paygInterviewLimit = Math.max(1, Math.floor(monthlyBudget / Math.max(1, pricePerInterview)));
      const paygResumeLimit = Math.max(1, Math.floor(monthlyBudget / Math.max(1, pricePerResume)));

      newInterviewLimit = paygInterviewLimit;
      newResumeLimit = paygResumeLimit;

      update.paygMonthlyBudget = monthlyBudget;
      update.paygInterviewsLimit = paygInterviewLimit;
      update.paygResumesLimit = paygResumeLimit;
      update.paygInterviewsUsed = 0;
      update.paygResumesUsed = 0;
      update.paygBillingCycleStart = new Date();
      const cycleEnd = new Date();
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);
      update.paygBillingCycleEnd = cycleEnd;
    } else {
      // Switching away from PAYG should clear PAYG-only state.
      update.paygMonthlyBudget = undefined;
      update.paygInterviewsLimit = undefined;
      update.paygResumesLimit = undefined;
      update.paygInterviewsUsed = 0;
      update.paygResumesUsed = 0;
      update.paygBillingCycleStart = undefined;
      update.paygBillingCycleEnd = undefined;
    }

    // Stamp normalized limits used by dashboard cards/guards.
    update.interviewLimit = newInterviewLimit;
    update.resumeLimit = newResumeLimit;
    if (expiry) update.subscriptionExpiry = expiry;

    const updated = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .populate('subscriptionPlan')
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async adminUpdateUserLimits(userId: string, interviewLimit?: number, resumeLimit?: number): Promise<UserDocument> {
    const updatePayload: any = {};
    if (typeof interviewLimit === 'number') {
      if (interviewLimit <= 0) throw new BadRequestException('interviewLimit must be greater than 0');
      updatePayload.interviewLimit = Math.floor(interviewLimit);
    }
    if (typeof resumeLimit === 'number') {
      if (resumeLimit <= 0) throw new BadRequestException('resumeLimit must be greater than 0');
      updatePayload.resumeLimit = Math.floor(resumeLimit);
    }
    
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: updatePayload }, { new: true })
      .populate('subscriptionPlan')
      .exec();
    
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async adminVerifyUser(
    userId: string,
    isEmailVerified?: boolean,
    isPhoneVerified?: boolean,
  ): Promise<UserDocument> {
    const update: any = {};
    if (isEmailVerified !== undefined) update.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined) update.isPhoneVerified = isPhoneVerified;
    const updated = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .populate('subscriptionPlan')
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async adminSetRole(userId: string, role: string): Promise<UserDocument> {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .populate('subscriptionPlan')
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async adminDeleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId).exec();
    if (!result) throw new NotFoundException('User not found');
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    if (!token) return;
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token }
    }).exec();
  }

  async deleteFcmTokens(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { fcmTokens: [] }
    }).exec();
  }

  async getAllFcmTokens(): Promise<string[]> {
    const users = await this.userModel.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } }).select('fcmTokens').exec();
    const tokens = users.flatMap(u => u.fcmTokens || []);
    return [...new Set(tokens)]; // unique tokens
  }

  // ── Pay-as-you-go ──────────────────────────────────────────────────────────

  /**
   * Called when a user sets up / updates their PAYG budget.
   * Derives interview & resume limits from the budget ÷ admin-configured unit prices.
   */
  async setupPayg(userId: string, monthlyBudgetRupees: number, interviews?: number, resumes?: number): Promise<UserDocument> {
    // Get user to determine country-specific PAYG pricing
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    
    const userCountry = user.country?.toUpperCase() || 'IN';
    const paygPlan = await this.subscriptionModel
      .findOne({ type: 'pay_as_you_go', country: userCountry, status: 'active' })
      .exec();

    if (!paygPlan) throw new BadRequestException(`PAYG plan is not configured for ${userCountry}. Please contact support.`);

    const pricePerInterview = paygPlan.paygPricePerInterview ?? 4900;
    const pricePerResume    = paygPlan.paygPricePerResume    ?? 2900;
    const minBudget         = (paygPlan.paygMinBudget ?? 9900) / 100;
    const maxBudget         = (paygPlan.paygMaxBudget ?? 500000) / 100;

    if (monthlyBudgetRupees < minBudget) {
      throw new BadRequestException(`Minimum monthly budget is ₹${minBudget}`);
    }
    if (monthlyBudgetRupees > maxBudget) {
      throw new BadRequestException(`Maximum monthly budget is ₹${maxBudget}`);
    }

    const budgetInPaisa = Math.round(monthlyBudgetRupees * 100);

    // Use provided counts or derive from budget
    const interviewsLimit = interviews ?? Math.floor(budgetInPaisa / pricePerInterview);
    const resumesLimit    = resumes    ?? Math.floor(budgetInPaisa / pricePerResume);

    const now      = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      {
        paygMonthlyBudget:      budgetInPaisa,
        paygInterviewsLimit:    interviewsLimit,
        paygResumesLimit:       resumesLimit,
        paygInterviewsUsed:     0,
        paygResumesUsed:        0,
        paygBillingCycleStart:  now,
        paygBillingCycleEnd:    cycleEnd,
        subscriptionStatus:     'active',
        subscriptionPlan:       paygPlan._id,
        resumeCount:            0,
        interviewCount:         0,
      },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  /** Returns the user's PAYG usage summary */
  async getPaygStatus(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('subscriptionPlan')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    if (!user.paygMonthlyBudget) throw new BadRequestException('User is not on a PAYG plan');

    const userCountry = user.country?.toUpperCase() || 'IN';
    const paygPlan: any = await this.subscriptionModel.findOne({ 
      type: SubscriptionType.PAY_AS_YOU_GO, 
      country: userCountry,
      status: 'active' 
    }).exec() || await this.subscriptionModel.findOne({ 
      type: SubscriptionType.PAY_AS_YOU_GO, 
      country: userCountry 
    }).exec();
    const pricePerInterview = paygPlan?.paygPricePerInterview ?? 4900;
    const pricePerResume    = paygPlan?.paygPricePerResume    ?? 2900;

    const interviewsUsed     = user.paygInterviewsUsed ?? 0;
    const resumesUsed        = user.paygResumesUsed    ?? 0;
    const interviewsLimit    = user.paygInterviewsLimit ?? 0;
    const resumesLimit       = user.paygResumesLimit   ?? 0;

    const spentOnInterviews  = interviewsUsed * pricePerInterview;
    const spentOnResumes     = resumesUsed * pricePerResume;
    const totalSpent         = spentOnInterviews + spentOnResumes;
    const budget             = user.paygMonthlyBudget ?? 0;

    return {
      monthlyBudgetRupees:    budget / 100,
      pricePerInterviewRupees: pricePerInterview / 100,
      pricePerResumeRupees:    pricePerResume / 100,
      interviews:  { used: interviewsUsed,  limit: interviewsLimit,  remaining: Math.max(0, interviewsLimit - interviewsUsed) },
      resumes:     { used: resumesUsed,      limit: resumesLimit,      remaining: Math.max(0, resumesLimit - resumesUsed) },
      spending:    { totalPaisaSpent: totalSpent, totalPaisaBudget: budget, remainingPaisa: Math.max(0, budget - totalSpent) },
      billingCycle: { start: user.paygBillingCycleStart, end: user.paygBillingCycleEnd },
    };
  }

  /** Increments PAYG consumption; throws if limit exceeded. Called before each interview/resume. */
  async checkAndIncrementPaygUsage(userId: string, type: 'interview' | 'resume'): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.paygMonthlyBudget) return; // Not on PAYG — skip

    if (type === 'interview') {
      const used  = user.paygInterviewsUsed ?? 0;
      const limit = user.paygInterviewsLimit ?? 0;
      if (used >= limit) throw new BadRequestException('You have reached your monthly interview limit. Please increase your PAYG budget.');
      await this.userModel.findByIdAndUpdate(userId, { $inc: { paygInterviewsUsed: 1 } }).exec();
    } else {
      const used  = user.paygResumesUsed ?? 0;
      const limit = user.paygResumesLimit ?? 0;
      if (used >= limit) throw new BadRequestException('You have reached your monthly resume analysis limit. Please increase your PAYG budget.');
      await this.userModel.findByIdAndUpdate(userId, { $inc: { paygResumesUsed: 1 } }).exec();
    }
  }

  /** Called by the monthly Razorpay webhook to reset usage for the new billing cycle */
  async resetPaygCycle(userId: string): Promise<void> {
    const now      = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    await this.userModel.findByIdAndUpdate(userId, {
      paygInterviewsUsed:    0,
      paygResumesUsed:       0,
      paygBillingCycleStart: now,
      paygBillingCycleEnd:   cycleEnd,
    }).exec();
  }
}
