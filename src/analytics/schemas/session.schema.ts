import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type SessionDocument = Session & Document;

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  sessionId: string; // Unique session identifier

  @Prop({ required: true })
  visitorId: string; // Reference to visitor

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId; // If the session belongs to a logged-in user

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ default: 0 })
  duration: number; // Session duration in seconds

  @Prop({ default: 0 })
  pageViews: number; // Number of pages viewed in this session

  @Prop({ default: 0 })
  interactions: number; // Number of interactions (clicks, scrolls, etc.)

  @Prop()
  lastActivity: Date;

  @Prop({ required: true, enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  entryPage: string; // First page visited in the session

  @Prop()
  exitPage: string; // Last page visited in the session

  @Prop({ type: [String], default: [] })
  pagesVisited: string[]; // All pages visited in this session

  @Prop({ default: 0 })
  bounceRate: number; // 1 if bounced (single page view), 0 if not

  @Prop()
  referrer: string;

  @Prop()
  utmSource: string;

  @Prop()
  utmMedium: string;

  @Prop()
  utmCampaign: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  events: any[]; // Array of custom events during the session

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;
}

export const SessionSchema = SchemaFactory.createForClass(Session);