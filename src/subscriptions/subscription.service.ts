import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, SubscriptionType, FeatureType } from './schemas/subscription.schema';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
} from './dto';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  async onModuleInit() {
    this.logger.log('🌱 Application initialized - Auto-seeding of plans is disabled to preserve database integrity.');
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

    const subscription = await this.subscriptionModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.toSubscriptionResponseDto(subscription);
  }

  async remove(id: string): Promise<void> {
    const result = await this.subscriptionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Subscription not found');
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
            description: '3 Professional AI interviews',
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
        price: countryCode === 'IN' ? 10000 : 900,
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
            description: '10 Professional AI interviews',
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
        price: countryCode === 'IN' ? 20000 : 1900,
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
            description: '20 Professional AI interviews',
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