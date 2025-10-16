import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, SubscriptionType } from './schemas/subscription.schema';
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
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    try {
      // Check if subscription name already exists
      const existingSubscription = await this.subscriptionModel.findOne({
        name: createSubscriptionDto.name,
      });

      if (existingSubscription) {
        throw new BadRequestException(`Subscription with name '${createSubscriptionDto.name}' already exists`);
      }

      // Convert price to paisa
      const priceInPaisa = Math.round(createSubscriptionDto.price * 100);
      const originalPriceInPaisa = createSubscriptionDto.originalPrice 
        ? Math.round(createSubscriptionDto.originalPrice * 100) 
        : undefined;

      const subscription = new this.subscriptionModel({
        ...createSubscriptionDto,
        price: priceInPaisa,
        originalPrice: originalPriceInPaisa,
      });

      await subscription.save();

      this.logger.log(`Subscription created: ${subscription.name}`);

      return this.toSubscriptionResponseDto(subscription);
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(status?: SubscriptionStatus): Promise<SubscriptionResponseDto[]> {
    const filter = status ? { status } : {};
    const subscriptions = await this.subscriptionModel
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .exec();

    return subscriptions.map(subscription => this.toSubscriptionResponseDto(subscription));
  }

  async findActive(): Promise<SubscriptionResponseDto[]> {
    return this.findAll(SubscriptionStatus.ACTIVE);
  }

  async findById(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return this.toSubscriptionResponseDto(subscription);
  }

  async findByName(name: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findOne({ name });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return this.toSubscriptionResponseDto(subscription);
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    try {
      const updateData: any = { ...updateSubscriptionDto };

      // Convert prices to paisa if provided
      if (updateData.price !== undefined) {
        updateData.price = Math.round(updateData.price * 100);
      }
      if (updateData.originalPrice !== undefined) {
        updateData.originalPrice = Math.round(updateData.originalPrice * 100);
      }

      updateData.updatedAt = new Date();

      const subscription = await this.subscriptionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      this.logger.log(`Subscription updated: ${subscription.name}`);

      return this.toSubscriptionResponseDto(subscription);
    } catch (error) {
      this.logger.error(`Failed to update subscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.subscriptionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Subscription not found');
    }

    this.logger.log(`Subscription deleted: ${result.name}`);
  }

  async activate(id: string): Promise<SubscriptionResponseDto> {
    return this.updateStatus(id, SubscriptionStatus.ACTIVE);
  }

  async deactivate(id: string): Promise<SubscriptionResponseDto> {
    return this.updateStatus(id, SubscriptionStatus.INACTIVE);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    this.logger.log(`Subscription status updated: ${subscription.name} -> ${status}`);

    return this.toSubscriptionResponseDto(subscription);
  }

  async getStats() {
    const stats = await this.subscriptionModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
          averagePrice: { $avg: '$price' },
        },
      },
    ]);

    const typeStats = await this.subscriptionModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
        },
      },
    ]);

    return {
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalRevenue: stat.totalRevenue,
          averagePrice: stat.averagePrice,
        };
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          averagePrice: stat.averagePrice,
        };
        return acc;
      }, {}),
    };
  }

  private toSubscriptionResponseDto(subscription: SubscriptionDocument): SubscriptionResponseDto {
    const priceInRupees = subscription.price / 100;
    const originalPriceInRupees = subscription.originalPrice ? subscription.originalPrice / 100 : undefined;
    const savings = subscription.originalPrice ? subscription.originalPrice - subscription.price : undefined;
    const savingsInRupees = savings ? savings / 100 : undefined;

    return {
      id: subscription._id.toString(),
      name: subscription.name,
      displayName: subscription.displayName,
      description: subscription.description,
      price: subscription.price,
      formattedPrice: this.formatPrice(priceInRupees, subscription.currency),
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
      formattedOriginalPrice: originalPriceInRupees 
        ? this.formatPrice(originalPriceInRupees, subscription.currency) 
        : undefined,
      savings,
      formattedSavings: savingsInRupees 
        ? this.formatPrice(savingsInRupees, subscription.currency) 
        : undefined,
      colorScheme: subscription.colorScheme,
      icon: subscription.icon,
      tags: subscription.tags,
      metadata: subscription.metadata,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  private formatPrice(price: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  }

  private formatDuration(type: SubscriptionType, duration?: number): string {
    switch (type) {
      case SubscriptionType.LIFETIME:
        return 'Lifetime';
      case SubscriptionType.TRIAL:
        return duration ? `${duration} day${duration > 1 ? 's' : ''} trial` : 'Trial';
      case SubscriptionType.MONTHLY:
        return '1 month';
      case SubscriptionType.YEARLY:
        return '1 year';
      default:
        return duration ? `${duration} day${duration > 1 ? 's' : ''}` : 'Custom';
    }
  }
}