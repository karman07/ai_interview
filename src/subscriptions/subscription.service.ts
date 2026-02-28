import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, SubscriptionType, FeatureType } from './schemas/subscription.schema';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
} from './dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) { }

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
    const plans = [
      {
        name: `free_tier_${countryCode.toLowerCase()}`,
        displayName: 'Free Tier',
        country: countryCode.toUpperCase(),
        price: 0,
        currency: countryCode === 'IN' ? 'INR' : 'USD',
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        features: [
          {
            name: 'Resume Upload Limit',
            description: 'Total resumes you can upload',
            type: FeatureType.NUMERIC,
            value: 5,
            enabled: true,
            limit: 5,
            unit: 'resumes'
          },
          { name: 'Interviews', description: 'Limited interviews', type: FeatureType.BOOLEAN, value: true, enabled: true },
        ],
        order: 0
      },
      {
        name: `pro_monthly_${countryCode.toLowerCase()}`,
        displayName: 'Pro Monthly',
        country: countryCode.toUpperCase(),
        price: countryCode === 'IN' ? 99900 : 2900,
        currency: countryCode === 'IN' ? 'INR' : 'USD',
        type: SubscriptionType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        features: [
          {
            name: 'Resume Upload Limit',
            description: 'Total resumes you can upload',
            type: FeatureType.NUMERIC,
            value: 10,
            enabled: true,
            limit: 10,
            unit: 'resumes'
          },
          { name: 'Interviews', description: 'Unlimited premium interviews', type: FeatureType.BOOLEAN, value: true, enabled: true },
          { name: 'AI Feedback', description: 'Deep qualitative analysis', type: FeatureType.BOOLEAN, value: true, enabled: true }
        ],
        order: 1
      },
      {
        name: `enterprise_yearly_${countryCode.toLowerCase()}`,
        displayName: 'Enterprise Yearly',
        country: countryCode.toUpperCase(),
        price: countryCode === 'IN' ? 999900 : 24900,
        currency: countryCode === 'IN' ? 'INR' : 'USD',
        type: SubscriptionType.YEARLY,
        status: SubscriptionStatus.ACTIVE,
        features: [
          {
            name: 'Resume Upload Limit',
            description: 'Total resumes you can upload',
            type: FeatureType.NUMERIC,
            value: 1000,
            enabled: true,
            limit: 1000,
            unit: 'resumes'
          },
          { name: 'Team Access', description: 'Up to 10 seats', type: FeatureType.NUMERIC, value: 10, enabled: true, limit: 10 }
        ],
        order: 2
      }
    ];

    for (const planData of plans) {
      await this.subscriptionModel.findOneAndUpdate({ name: planData.name }, planData, { upsert: true });
    }

    // Also update any existing plans that might not have the resume limit feature
    await this.subscriptionModel.updateMany(
      { "features.name": { $ne: 'Resume Upload Limit' } },
      {
        $push: {
          features: {
            name: 'Resume Upload Limit',
            description: 'Total resumes you can upload',
            type: FeatureType.NUMERIC,
            value: 5,
            enabled: true,
            limit: 5,
            unit: 'resumes'
          }
        }
      }
    );

    return { message: `Subscription plans seeded for ${countryCode} including Free Tier` };
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