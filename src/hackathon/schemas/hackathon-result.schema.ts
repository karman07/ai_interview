import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HackathonResultDocument = HackathonResult & Document;

@Schema({ timestamps: true })
export class HackathonResult {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, lowercase: true })
  userEmail: string;

  @Prop()
  userImage?: string;

  // Overall score (0-100)
  @Prop({ required: true })
  overallScore: number;

  // Breakdown metrics
  @Prop({ type: Object, default: {} })
  metrics: {
    technicalAccuracy?: number;
    communicationClarity?: number;
    problemSolving?: number;
    codeQuality?: number;
    systemDesign?: number;
    behavioural?: number;
  };

  // Session ID from the actual interview
  @Prop()
  sessionId?: string;

  // Whether the post-interview form has been filled
  @Prop({ default: false })
  formFilled: boolean;

  // CV genuineness verification result
  @Prop({ default: false })
  cvVerified: boolean;

  @Prop({ type: Object, default: {} })
  rawData: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const HackathonResultSchema = SchemaFactory.createForClass(HackathonResult);
