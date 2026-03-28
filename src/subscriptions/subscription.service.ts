import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, SubscriptionType, FeatureType } from './schemas/subscription.schema';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
} from './dto';
import { User, UserDocument } from '../users/schemas/user.schema';

import Razorpay from 'razorpay';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async onModuleInit() {
    this.logger.log('🌱 Application initialized - Auto-syncing plans with Razorpay...');
    try {
      await this.syncPlansWithRazorpay('IN');
      await this.syncPlansWithRazorpay('US');
      this.logger.log('✅ Subscription plans synced successfully for IN and US!');
    } catch (error) {
      this.logger.error(`❌ Failed to sync subscription plans: ${error.message}`);
    }
  }

  async syncPlansWithRazorpay(countryCode: string) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    let razorpay: Razorpay | null = null;
    if (key_id && key_secret) {
      razorpay = new Razorpay({ key_id, key_secret });
    }

    // fetch all razorpay plans to find matches
    let rzpPlans = [];
    if (razorpay) {
      try {
        const response = await razorpay.plans.all();
        rzpPlans = response.items || [];
      } catch (e) {
        this.logger.error('Failed to fetch Razorpay plans', e);
      }
    }

    const getOrCreateRzpPlan = async (name: string, amount: number, currency: string = 'INR') => {
      if (!razorpay) return undefined;
      const existing = rzpPlans.find(p => p.item.amount === amount && p.item.currency === currency && p.item.name.toLowerCase().includes(name.toLowerCase()));
      if (existing) return existing.id;

      try {
        const newPlan = await razorpay.plans.create({
          period: 'monthly',
          interval: 1,
          item: {
            name,
            amount,
            currency,
            description: `Automated plan for ${name}`
          }
        });
        this.logger.log(`Created new Razorpay plan: ${newPlan.id} for ${name} (${currency})`);
        return newPlan.id;
      } catch (e) {
        this.logger.error(`Failed to create Razorpay plan for ${name} (${currency})`, e);
        return undefined;
      }
    };

    const isIndia = countryCode === 'IN';
    const currency = isIndia ? 'INR' : 'USD';

    // Updated prices: India 99/199, Outside 5/9
    const starterPrice = isIndia ? 9900 : 500;
    const proPrice = isIndia ? 19900 : 900;

    const starterRzpId = await getOrCreateRzpPlan('Career Starter', starterPrice, currency);
    const proRzpId = await getOrCreateRzpPlan('Professional', proPrice, currency);

    const plans = [
      {
        name: `free_tier_${countryCode.toLowerCase()}`,
        displayName: 'Free Tier',
        country: countryCode.toUpperCase(),
        price: 0,
        currency: currency,
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        description: 'Perfect for starters to experience the platform.',
        features: [
          { name: 'Resume Limit', description: '5 Resume analysis reports', type: FeatureType.NUMERIC, value: 5, enabled: true, limit: 5, unit: 'resumes' },
          { name: 'Interview Limit', description: '3 Professional Ai for jobs', type: FeatureType.NUMERIC, value: 3, enabled: true, limit: 3, unit: 'interviews' },
          { name: 'AI Feedback', description: 'Basic qualitative feedback', type: FeatureType.BOOLEAN, value: true, enabled: true },
        ],
        order: 0
      },
      {
        name: `pro_tier_100_${countryCode.toLowerCase()}`,
        displayName: 'Career Starter',
        country: countryCode.toUpperCase(),
        price: starterPrice,
        currency: currency,
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        razorpayPlanId: starterRzpId,
        description: 'Accelerate your job search with more resumes and interviews.',
        features: [
          { name: 'Resume Limit', description: '15 Resume analysis reports', type: FeatureType.NUMERIC, value: 15, enabled: true, limit: 15, unit: 'resumes' },
          { name: 'Interview Limit', description: '10 Professional Ai for jobs', type: FeatureType.NUMERIC, value: 10, enabled: true, limit: 10, unit: 'interviews' },
          { name: 'AI Feedback', description: 'Detailed qualitative analysis', type: FeatureType.BOOLEAN, value: true, enabled: true },
          { name: 'Priority Support', description: '24/7 Priority support access', type: FeatureType.BOOLEAN, value: true, enabled: true }
        ],
        order: 1,
        popularBadge: true
      },
      {
        name: `pro_tier_200_${countryCode.toLowerCase()}`,
        displayName: 'Professional',
        country: countryCode.toUpperCase(),
        price: proPrice,
        currency: currency,
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        razorpayPlanId: proRzpId,
        description: 'For power users who want the maximum edge in their prep.',
        features: [
          { name: 'Resume Limit', description: '40 Resume analysis reports', type: FeatureType.NUMERIC, value: 40, enabled: true, limit: 40, unit: 'resumes' },
          { name: 'Interview Limit', description: '20 Professional Ai for jobs', type: FeatureType.NUMERIC, value: 20, enabled: true, limit: 20, unit: 'interviews' },
          { name: 'AI Feedback', description: 'Full deep-dive qualitative analysis', type: FeatureType.BOOLEAN, value: true, enabled: true },
          { name: 'Custom Roadmaps', description: 'Personalized career roadmaps', type: FeatureType.BOOLEAN, value: true, enabled: true }
        ],
        order: 2
      },
      // ── Pay-as-you-go template (admin must activate + set unit prices) ──────
      {
        name: `payg_${countryCode.toLowerCase()}`,
        displayName: 'Pay As You Go',
        country: countryCode.toUpperCase(),
        price: 0, // Variable — not a fixed price
        currency: currency,
        type: SubscriptionType.PAY_AS_YOU_GO,
        status: SubscriptionStatus.ACTIVE, // Visible immediately
        description: 'Set your own monthly budget. Only pay for what you use.',
        features: [
          { name: 'Interviews', description: 'Charged per interview session', type: FeatureType.NUMERIC, value: 0, enabled: true, unit: 'interviews' },
          { name: 'Resume Scans', description: 'Charged per resume analysis', type: FeatureType.NUMERIC, value: 0, enabled: true, unit: 'resumes' },
          { name: 'Flexible Budget', description: 'Set your own monthly budget', type: FeatureType.BOOLEAN, value: true, enabled: true },
          { name: 'Cancel Anytime', description: 'Cancel or change budget anytime', type: FeatureType.BOOLEAN, value: true, enabled: true },
        ],
        paygPricePerInterview: isIndia ? 4900 : 99,   // ₹49 or $0.99
        paygPricePerResume:    isIndia ? 2900 : 49,   // ₹29 or $0.49
        paygMinBudget:         isIndia ? 9900 : 199,  // ₹99 or $1.99 min
        paygMaxBudget:         isIndia ? 500000 : 9999, // ₹5000 or $99.99 max
        order: 10
      } as any,
    ];

    for (const planData of plans) {
      const existing = await this.subscriptionModel.findOne({ name: planData.name });
      if (!existing) {
        // Only seed if not present, preventing hardcoded overwrites of Admin-modified features
        await this.subscriptionModel.create(planData);
      } else {
        // If razorpayPlanId was generated but is missing in DB, update just that
        if (planData.razorpayPlanId && !existing.razorpayPlanId) {
          await this.subscriptionModel.updateOne({ name: planData.name }, { $set: { razorpayPlanId: planData.razorpayPlanId } });
        }
      }
    }
  }

  // Silently generate a Razorpay plan for a subscription document. Skips if already valid or keys missing.
  private async autoGenerateRazorpayPlan(subscription: SubscriptionDocument): Promise<void> {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) return; // keys not configured — skip silently

    const razorpay = new Razorpay({ key_id, key_secret });

    type RazorpayPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
    const periodMap: Record<string, RazorpayPeriod> = {
      monthly: 'monthly', yearly: 'yearly',
      'half-yearly': 'monthly', quarterly: 'monthly',
    };
    const intervalMap: Record<string, number> = {
      monthly: 1, yearly: 1, 'half-yearly': 6, quarterly: 3,
    };
    const period: RazorpayPeriod = periodMap[subscription.type] ?? 'monthly';
    const interval = intervalMap[subscription.type] ?? 1;

    // Verify existing plan is still valid
    if (subscription.razorpayPlanId) {
      try {
        await razorpay.plans.fetch(subscription.razorpayPlanId);
        return; // still valid, nothing to do
      } catch { /* fall through to create */ }
    }

    try {
      const newPlan: any = await (razorpay.plans.create as Function)({
        period, interval,
        item: {
          name: subscription.displayName || subscription.name,
          amount: subscription.price, // stored in paisa
          currency: subscription.currency || 'INR',
          description: subscription.description || `Plan for ${subscription.displayName}`,
        },
      });
      subscription.razorpayPlanId = newPlan.id;
      await subscription.save();
      this.logger.log(`Auto-generated Razorpay plan ${newPlan.id} for ${subscription.name}`);
    } catch (err) {
      this.logger.warn(`Razorpay plan auto-generation failed for ${subscription.name}: ${err.message}`);
    }
  }

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    try {
      const existingSubscription = await this.subscriptionModel.findOne({
        name: createSubscriptionDto.name,
      });

      if (existingSubscription) {
        throw new BadRequestException(`Subscription with name '${createSubscriptionDto.name}' already exists`);
      }

      const priceInPaisa = Math.round(createSubscriptionDto.price * 100);
      const originalPriceInPaisa = createSubscriptionDto.originalPrice
        ? Math.round(createSubscriptionDto.originalPrice * 100)
        : undefined;

      const subscription = new this.subscriptionModel({
        ...createSubscriptionDto,
        price: priceInPaisa,
        originalPrice: originalPriceInPaisa,
        country: createSubscriptionDto.country.toUpperCase(),
      });

      await subscription.save();
      await this.autoGenerateRazorpayPlan(subscription);
      this.logger.log(`Subscription created: ${subscription.name}`);
      return this.toSubscriptionResponseDto(subscription);
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  async findAll(status?: SubscriptionStatus, country?: string): Promise<SubscriptionResponseDto[]> {
    const filter: any = {};
    if (status) filter.status = status;
    if (country) filter.country = country.toUpperCase();

    const subscriptions = await this.subscriptionModel
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .exec();

    return subscriptions.map(subscription => this.toSubscriptionResponseDto(subscription));
  }

  async findActive(country?: string): Promise<SubscriptionResponseDto[]> {
    return this.findAll(SubscriptionStatus.ACTIVE, country);
  }

  async findById(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findById(id);
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.toSubscriptionResponseDto(subscription);
  }

  async findByName(name: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findOne({ name });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.toSubscriptionResponseDto(subscription);
  }

  async findOneByAnyId(id: string): Promise<SubscriptionDocument | null> {
    // Try by MongoDB ID
    if (Types.ObjectId.isValid(id)) {
      const sub = await this.subscriptionModel.findById(id).exec();
      if (sub) return sub;
    }

    // Try by Razorpay Plan ID or Name
    return this.subscriptionModel.findOne({
      $or: [
        { razorpayPlanId: id },
        { name: id }
      ]
    }).exec();
  }

  async findFirstActive(): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel.findOne({
      status: SubscriptionStatus.ACTIVE,
      razorpayPlanId: { $exists: true, $ne: null }
    }).exec();
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    const updateData: any = { ...updateSubscriptionDto };
    if (updateData.price !== undefined) updateData.price = Math.round(updateData.price * 100);
    if (updateData.originalPrice !== undefined) updateData.originalPrice = Math.round(updateData.originalPrice * 100);
    if (updateData.country) updateData.country = updateData.country.toUpperCase();

    // Razorpay plans are immutable — if price or currency changed, force a new plan
    if (updateData.price !== undefined || updateData.currency !== undefined) {
      const existing = await this.subscriptionModel.findById(id);
      if (existing) {
        const priceChanged = updateData.price !== undefined && existing.price !== updateData.price;
        const currencyChanged = updateData.currency !== undefined && existing.currency !== updateData.currency;
        if (priceChanged || currencyChanged) {
          updateData.razorpayPlanId = null; // clear so autoGenerateRazorpayPlan creates a fresh one
        }
      }
    }

    const subscription = await this.subscriptionModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!subscription) throw new NotFoundException('Subscription not found');
    
    // Auto sync updated limits horizontally to all users
    await this.syncPlanLimitsToUsers(subscription);

    await this.autoGenerateRazorpayPlan(subscription);
    return this.toSubscriptionResponseDto(subscription);
  }

  private async syncPlanLimitsToUsers(subscription: SubscriptionDocument) {
    try {
      const features = (subscription as any).features || [];
      const intF = features.find((f: any) => f.name === 'Interview Limit');
      const resF = features.find((f: any) => f.name === 'Resume Limit' || f.name === 'Resume Upload Limit');
      const interviewLimit = intF ? (intF.value ?? intF.limit ?? 3) : 3;
      const resumeLimit = resF ? (resF.value ?? resF.limit ?? 5) : 5;

      const isFreeTier = subscription.name.toLowerCase().includes('free');
      
      const query = isFreeTier 
        ? { $or: [{ subscriptionPlan: subscription._id }, { subscriptionStatus: 'free' }, { subscriptionPlan: { $exists: false } }] }
        : { subscriptionPlan: subscription._id };

      const result = await this.userModel.updateMany(query, {
        $set: { interviewLimit, resumeLimit }
      });
      this.logger.log(`Synced updated limits to ${result.modifiedCount} users for plan ${subscription.name}`);
    } catch (e) {
      this.logger.error(`Failed to sync plan limits to users: ${e.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.subscriptionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Subscription not found');
  }

  async generateRazorpayPlan(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findById(id);
    if (!subscription) throw new NotFoundException('Subscription not found');
    await this.autoGenerateRazorpayPlan(subscription);
    return this.toSubscriptionResponseDto(subscription);
  }

  async activate(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findByIdAndUpdate(id, { status: SubscriptionStatus.ACTIVE }, { new: true });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.toSubscriptionResponseDto(subscription);
  }

  async deactivate(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findByIdAndUpdate(id, { status: SubscriptionStatus.INACTIVE }, { new: true });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.toSubscriptionResponseDto(subscription);
  }


  // ── PAYG Admin ──────────────────────────────────────────────────────

  async getPaygConfig(country: string = 'IN') {
    const plan = await this.subscriptionModel.findOne({
      type: SubscriptionType.PAY_AS_YOU_GO,
      country: country.toUpperCase(),
    }).exec();
    if (!plan) return null;
    return {
      id: plan._id.toString(),
      country: plan.country,
      status: plan.status,
      pricePerInterviewPaisa:   (plan as any).paygPricePerInterview,
      pricePerResumePaisa:      (plan as any).paygPricePerResume,
      minBudgetPaisa:           (plan as any).paygMinBudget,
      maxBudgetPaisa:           (plan as any).paygMaxBudget,
      pricePerInterviewRupees:  ((plan as any).paygPricePerInterview ?? 0) / 100,
      pricePerResumeRupees:     ((plan as any).paygPricePerResume ?? 0) / 100,
      minBudgetRupees:          ((plan as any).paygMinBudget ?? 0) / 100,
      maxBudgetRupees:          ((plan as any).paygMaxBudget ?? 0) / 100,
    };
  }

  async updatePaygConfig(
    country: string = 'IN',
    data: {
      pricePerInterviewRupees?: number;
      pricePerResumeRupees?: number;
      minBudgetRupees?: number;
      maxBudgetRupees?: number;
    },
  ) {
    const update: Record<string, number> = {};
    if (data.pricePerInterviewRupees !== undefined) update['paygPricePerInterview'] = Math.round(data.pricePerInterviewRupees * 100);
    if (data.pricePerResumeRupees    !== undefined) update['paygPricePerResume']    = Math.round(data.pricePerResumeRupees    * 100);
    if (data.minBudgetRupees         !== undefined) update['paygMinBudget']         = Math.round(data.minBudgetRupees         * 100);
    if (data.maxBudgetRupees         !== undefined) update['paygMaxBudget']         = Math.round(data.maxBudgetRupees         * 100);

    const updated = await this.subscriptionModel.findOneAndUpdate(
      { type: SubscriptionType.PAY_AS_YOU_GO, country: country.toUpperCase() },
      update,
      { new: true },
    ).exec();

    if (!updated) throw new Error('PAYG plan not found for country: ' + country);
    this.logger.log(`PAYG config updated for ${country}: ${JSON.stringify(update)}`);
    return this.getPaygConfig(country);
  }

  async seedCountryPlans(countryCode: string) {
    if (countryCode.toUpperCase() === 'IN') {
      // Clear existing plans for India as requested
      await this.subscriptionModel.deleteMany({ country: 'IN' });
    }

    const plans = [
      {
        name: `free_tier_${countryCode.toLowerCase()}`,
        displayName: 'Free Tier',
        country: countryCode.toUpperCase(),
        price: 0,
        currency: countryCode === 'IN' ? 'INR' : 'USD',
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        description: 'Perfect for starters to experience the platform.',
        features: [
          {
            name: 'Resume Limit',
            description: '5 Resume analysis reports',
            type: FeatureType.NUMERIC,
            value: 5,
            enabled: true,
            limit: 5,
            unit: 'resumes'
          },
          {
            name: 'Interview Limit',
            description: '3 Professional Ai for jobs',
            type: FeatureType.NUMERIC,
            value: 3,
            enabled: true,
            limit: 3,
            unit: 'interviews'
          },
          { name: 'AI Feedback', description: 'Basic qualitative feedback', type: FeatureType.BOOLEAN, value: true, enabled: true },
        ],
        order: 0
      },
      {
        name: `pro_tier_100_${countryCode.toLowerCase()}`,
        displayName: 'Career Starter',
        country: countryCode.toUpperCase(),
        price: countryCode === 'IN' ? 9900 : 500,
        currency: countryCode === 'IN' ? 'INR' : 'USD',
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        razorpayPlanId: countryCode === 'IN' ? 'plan_SKqg030DvG2aew' : undefined,
        description: 'Accelerate your job search with more resumes and interviews.',
        features: [
          {
            name: 'Resume Limit',
            description: '15 Resume analysis reports',
            type: FeatureType.NUMERIC,
            value: 15,
            enabled: true,
            limit: 15,
            unit: 'resumes'
          },
          {
            name: 'Interview Limit',
            description: '10 Professional Ai for jobs',
            type: FeatureType.NUMERIC,
            value: 10,
            enabled: true,
            limit: 10,
            unit: 'interviews'
          },
          { name: 'AI Feedback', description: 'Detailed qualitative analysis', type: FeatureType.BOOLEAN, value: true, enabled: true },
          { name: 'Priority Support', description: '24/7 Priority support access', type: FeatureType.BOOLEAN, value: true, enabled: true }
        ],
        order: 1,
        popularBadge: true
      },
      {
        name: `pro_tier_200_${countryCode.toLowerCase()}`,
        displayName: 'Professional',
        country: countryCode.toUpperCase(),
        price: countryCode === 'IN' ? 19900 : 900,
        currency: countryCode === 'IN' ? 'INR' : 'USD',
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        razorpayPlanId: countryCode === 'IN' ? 'plan_SOZ3HmKkAFI4Bc' : undefined,
        description: 'For power users who want the maximum edge in their prep.',
        features: [
          {
            name: 'Resume Limit',
            description: '40 Resume analysis reports',
            type: FeatureType.NUMERIC,
            value: 40,
            enabled: true,
            limit: 40,
            unit: 'resumes'
          },
          {
            name: 'Interview Limit',
            description: '20 Professional Ai for jobs',
            type: FeatureType.NUMERIC,
            value: 20,
            enabled: true,
            limit: 20,
            unit: 'interviews'
          },
          { name: 'AI Feedback', description: 'Full deep-dive qualitative analysis', type: FeatureType.BOOLEAN, value: true, enabled: true },
          { name: 'Custom Roadmaps', description: 'Personalized career roadmaps', type: FeatureType.BOOLEAN, value: true, enabled: true }
        ],
        order: 2
      }
    ];

    for (const planData of plans) {
      await this.subscriptionModel.findOneAndUpdate({ name: planData.name }, planData, { upsert: true });
    }

    return { message: `Subscription plans seeded for ${countryCode}. Previous plans removed.` };
  }

  private toSubscriptionResponseDto(subscription: SubscriptionDocument): SubscriptionResponseDto {
    const priceInMain = subscription.price / 100;
    const originalPriceInMain = subscription.originalPrice ? subscription.originalPrice / 100 : undefined;
    const savings = subscription.originalPrice ? subscription.originalPrice - subscription.price : undefined;

    return {
      id: subscription._id.toString(),
      name: subscription.name,
      displayName: subscription.displayName,
      description: subscription.description,
      price: subscription.price,
      formattedPrice: this.formatPrice(priceInMain, subscription.currency),
      currency: subscription.currency,
      type: subscription.type,
      duration: subscription.duration,
      formattedDuration: this.formatDuration(subscription.type, subscription.duration),
      features: subscription.features,
      status: subscription.status,
      order: subscription.order,
      popularBadge: subscription.popularBadge,
      discountPercentage: subscription.discountPercentage,
      originalPrice: subscription.originalPrice,
      formattedOriginalPrice: originalPriceInMain ? this.formatPrice(originalPriceInMain, subscription.currency) : undefined,
      savings,
      formattedSavings: savings ? this.formatPrice(savings / 100, subscription.currency) : undefined,
      colorScheme: subscription.colorScheme,
      icon: subscription.icon,
      razorpayPlanId: subscription.razorpayPlanId,
      tags: subscription.tags,
      metadata: subscription.metadata,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  private formatPrice(price: number, currency: string = 'INR'): string {
    if (currency === 'INR') return `₹${price.toLocaleString('en-IN')}`;
    return `$${price.toFixed(2)}`;
  }

  private formatDuration(type: SubscriptionType, duration?: number): string {
    switch (type) {
      case SubscriptionType.LIFETIME: return 'Lifetime';
      case SubscriptionType.TRIAL: return `${duration} day trial`;
      case SubscriptionType.MONTHLY: return '1 Month';
      case SubscriptionType.YEARLY: return '1 Year';
      default: return 'Custom';
    }
  }
}