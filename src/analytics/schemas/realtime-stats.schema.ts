import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RealTimeStatsDocument = RealTimeStats & Document;

@Schema({ timestamps: true })
export class RealTimeStats {
  @Prop({ required: true, unique: true })
  date: string; // Date in YYYY-MM-DD format

  @Prop({ default: 0 })
  activeUsers: number; // Currently active users

  @Prop({ default: 0 })
  totalSessions: number; // Total sessions for the day

  @Prop({ default: 0 })
  totalPageViews: number; // Total page views for the day

  @Prop({ default: 0 })
  uniqueVisitors: number; // Unique visitors for the day

  @Prop({ default: 0 })
  newVisitors: number; // New visitors for the day

  @Prop({ default: 0 })
  returningVisitors: number; // Returning visitors for the day

  @Prop({ default: 0 })
  averageSessionDuration: number; // Average session duration in seconds

  @Prop({ default: 0 })
  bounceRate: number; // Bounce rate percentage

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  topPages: Record<string, number>; // Top pages and their view counts

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  deviceBreakdown: Record<string, number>; // Device type breakdown

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  browserBreakdown: Record<string, number>; // Browser breakdown

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  countryBreakdown: Record<string, number>; // Country breakdown

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  referrerBreakdown: Record<string, number>; // Referrer breakdown

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  hourlyStats: any[]; // Hourly breakdown of stats

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const RealTimeStatsSchema = SchemaFactory.createForClass(RealTimeStats);