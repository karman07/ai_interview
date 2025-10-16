import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  DEPRECATED = 'deprecated',
}

export enum SubscriptionType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
  TRIAL = 'trial',
}

export enum FeatureType {
  BOOLEAN = 'boolean',
  NUMERIC = 'numeric',
  TEXT = 'text',
}

@Schema({ _id: false })
export class Feature {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: FeatureType })
  type: FeatureType;

  @Prop({ type: MongooseSchema.Types.Mixed })
  value: any; // Can be boolean, number, or string

  @Prop({ default: true })
  enabled: boolean;

  @Prop()
  limit?: number; // For numeric features (e.g., max interviews per month)

  @Prop()
  unit?: string; // For numeric features (e.g., "interviews", "storage GB")
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number; // Price in paisa (smallest currency unit)

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ required: true, enum: SubscriptionType })
  type: SubscriptionType;

  @Prop()
  duration: number; // Duration in days (null for lifetime)

  @Prop({ type: [FeatureSchema], default: [] })
  features: Feature[];

  @Prop({ required: true, enum: SubscriptionStatus, default: SubscriptionStatus.DRAFT })
  status: SubscriptionStatus;

  @Prop({ default: 0 })
  order: number; // For display ordering

  @Prop()
  popularBadge: boolean; // Mark as "Most Popular"

  @Prop()
  discountPercentage: number; // Discount percentage (e.g., 20 for 20% off)

  @Prop()
  originalPrice: number; // Original price before discount

  @Prop()
  colorScheme: string; // CSS color for UI theming

  @Prop()
  icon: string; // Icon name or URL

  @Prop({ type: [String], default: [] })
  tags: string[]; // Tags like "Best Value", "Enterprise", etc.

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>; // Additional flexible data

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);