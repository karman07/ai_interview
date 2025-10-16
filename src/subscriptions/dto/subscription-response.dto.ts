import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionType, SubscriptionStatus, FeatureType } from '../schemas/subscription.schema';

export class FeatureResponseDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Interview Sessions',
  })
  name: string;

  @ApiProperty({
    description: 'Feature description',
    example: 'Number of AI interview sessions per month',
  })
  description: string;

  @ApiProperty({
    description: 'Feature type',
    enum: FeatureType,
    example: FeatureType.NUMERIC,
  })
  type: FeatureType;

  @ApiProperty({
    description: 'Feature value',
    example: 10,
  })
  value: any;

  @ApiProperty({
    description: 'Whether the feature is enabled',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Limit for numeric features',
    example: 10,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Unit for numeric features',
    example: 'sessions',
    required: false,
  })
  unit?: string;
}

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Unique subscription name',
    example: 'premium-monthly',
  })
  name: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Premium Monthly',
  })
  displayName: string;

  @ApiProperty({
    description: 'Subscription description',
    example: 'Access to advanced AI interview features',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Price in paisa',
    example: 99999,
  })
  price: number;

  @ApiProperty({
    description: 'Formatted price for display',
    example: '₹999.99',
  })
  formattedPrice: string;

  @ApiProperty({
    description: 'Currency',
    example: 'INR',
  })
  currency: string;

  @ApiProperty({
    description: 'Subscription type',
    enum: SubscriptionType,
    example: SubscriptionType.MONTHLY,
  })
  type: SubscriptionType;

  @ApiProperty({
    description: 'Duration in days',
    example: 30,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: 'Human-readable duration',
    example: '1 month',
  })
  formattedDuration: string;

  @ApiProperty({
    description: 'List of features',
    type: [FeatureResponseDto],
  })
  features: FeatureResponseDto[];

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Whether marked as popular',
    example: true,
    required: false,
  })
  popularBadge?: boolean;

  @ApiProperty({
    description: 'Discount percentage',
    example: 20,
    required: false,
  })
  discountPercentage?: number;

  @ApiProperty({
    description: 'Original price before discount',
    example: 124999,
    required: false,
  })
  originalPrice?: number;

  @ApiProperty({
    description: 'Formatted original price',
    example: '₹1,249.99',
    required: false,
  })
  formattedOriginalPrice?: string;

  @ApiProperty({
    description: 'Savings amount',
    example: 25000,
    required: false,
  })
  savings?: number;

  @ApiProperty({
    description: 'Formatted savings',
    example: '₹250.00',
    required: false,
  })
  formattedSavings?: string;

  @ApiProperty({
    description: 'Color scheme',
    example: '#007bff',
    required: false,
  })
  colorScheme?: string;

  @ApiProperty({
    description: 'Icon',
    example: 'crown',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: 'Tags',
    example: ['Best Value', 'Most Popular'],
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    description: 'Additional metadata',
    example: { category: 'premium', priority: 1 },
    required: false,
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-10-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-10-01T10:05:00Z',
  })
  updatedAt: Date;
}