import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PageViewDocument = PageView & Document;

export enum PageViewType {
  PAGE = 'page',
  API = 'api',
  RESOURCE = 'resource',
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

@Schema({ timestamps: true })
export class PageView {
  @Prop({ required: true })
  visitorId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  title: string;

  @Prop({ required: true, enum: PageViewType, default: PageViewType.PAGE })
  type: PageViewType;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: 0 })
  timeSpent: number; // Time spent on this page in seconds

  @Prop()
  scrollDepth: number; // Maximum scroll depth percentage (0-100)

  @Prop({ default: 0 })
  clicks: number; // Number of clicks on this page

  @Prop({ default: 0 })
  interactions: number; // Total interactions on this page

  @Prop()
  loadTime: number; // Page load time in milliseconds

  @Prop()
  previousPage: string; // Previous page URL

  @Prop()
  nextPage: string; // Next page URL (if available)

  @Prop({ required: true, enum: DeviceType })
  device: DeviceType;

  @Prop()
  browser: string;

  @Prop()
  operatingSystem: string;

  @Prop()
  screenResolution: string;

  @Prop()
  viewportSize: string;

  @Prop()
  referrer: string;

  @Prop()
  utmSource: string;

  @Prop()
  utmMedium: string;

  @Prop()
  utmCampaign: string;

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop({ default: false })
  isBounce: boolean; // True if this was the only page viewed in the session

  @Prop({ default: false })
  isExit: boolean; // True if this was the last page in the session

  @Prop({ default: false })
  isEntry: boolean; // True if this was the first page in the session

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  customEvents: any[]; // Custom events triggered on this page

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;
}

export const PageViewSchema = SchemaFactory.createForClass(PageView);