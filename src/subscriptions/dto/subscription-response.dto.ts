import { SubscriptionType, SubscriptionStatus, FeatureType } from '../schemas/subscription.schema';

export class FeatureResponseDto {
  name: string;

  description: string;

  type: FeatureType;

  value: any;

  enabled: boolean;

  limit?: number;

  unit?: string;
}

export class SubscriptionResponseDto {
  id: string;

  name: string;

  displayName: string;

  description?: string;

  price: number;

  formattedPrice: string;

  currency: string;

  type: SubscriptionType;

  duration?: number;

  formattedDuration: string;

  features: FeatureResponseDto[];

  status: SubscriptionStatus;

  order: number;

  popularBadge?: boolean;

  discountPercentage?: number;

  originalPrice?: number;

  formattedOriginalPrice?: string;

  savings?: number;

  formattedSavings?: string;

  colorScheme?: string;

  icon?: string;

  tags?: string[];

  metadata?: Record<string, any>;

  createdAt: Date;

  updatedAt: Date;
}