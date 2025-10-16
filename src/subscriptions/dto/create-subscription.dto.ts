import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsNumber, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionType, SubscriptionStatus, FeatureType } from '../schemas/subscription.schema';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Interview Sessions',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Feature description',
    example: 'Number of AI interview sessions per month',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Feature type',
    enum: FeatureType,
    example: FeatureType.NUMERIC,
  })
  @IsNotEmpty()
  @IsEnum(FeatureType)
  type: FeatureType;

  @ApiProperty({
    description: 'Feature value (boolean, number, or string)',
    example: 10,
  })
  @IsNotEmpty()
  value: any;

  @ApiProperty({
    description: 'Whether the feature is enabled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'Limit for numeric features',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;

  @ApiProperty({
    description: 'Unit for numeric features',
    example: 'sessions',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Unique subscription name (slug)',
    example: 'premium-monthly',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Display name for the subscription',
    example: 'Premium Monthly',
  })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'Subscription description',
    example: 'Access to advanced AI interview features',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price in INR (will be converted to paisa)',
    example: 999.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'INR',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Subscription type',
    enum: SubscriptionType,
    example: SubscriptionType.MONTHLY,
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @ApiProperty({
    description: 'Duration in days (null for lifetime)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'List of features included in this subscription',
    type: [CreateFeatureDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureDto)
  features: CreateFeatureDto[];

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiProperty({
    description: 'Mark as popular/recommended',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  popularBadge?: boolean;

  @ApiProperty({
    description: 'Discount percentage',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @ApiProperty({
    description: 'Original price before discount',
    example: 1249.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({
    description: 'Color scheme for UI',
    example: '#007bff',
    required: false,
  })
  @IsOptional()
  @IsString()
  colorScheme?: string;

  @ApiProperty({
    description: 'Icon name or URL',
    example: 'crown',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Subscription tags',
    example: ['Best Value', 'Most Popular'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Additional metadata',
    example: { category: 'premium', priority: 1 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}