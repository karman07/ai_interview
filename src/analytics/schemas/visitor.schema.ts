import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type VisitorDocument = Visitor & Document;

@Schema({ timestamps: true })
export class Visitor {
  @Prop({ required: true, unique: true })
  visitorId: string; // Unique identifier for the visitor (e.g., UUID)

  @Prop()
  sessionId: string; // Current session ID

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  browser: string;

  @Prop()
  browserVersion: string;

  @Prop()
  operatingSystem: string;

  @Prop()
  device: string; // desktop, mobile, tablet

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop()
  timezone: string;

  @Prop()
  language: string;

  @Prop()
  screenResolution: string;

  @Prop()
  referrer: string;

  @Prop()
  utmSource: string;

  @Prop()
  utmMedium: string;

  @Prop()
  utmCampaign: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId; // If the visitor is a logged-in user

  @Prop({ default: false })
  isReturning: boolean;

  @Prop({ default: 1 })
  sessionCount: number;

  @Prop({ default: Date.now })
  firstVisit: Date;

  @Prop({ default: Date.now })
  lastVisit: Date;

  @Prop({ default: 0 })
  totalTimeSpent: number; // Total time spent across all sessions (in seconds)

  @Prop({ default: 0 })
  totalPageViews: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);