import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  teacherId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: string;

  @Prop({ required: true, enum: ['interview', 'resume', 'general'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Result', required: false })
  resultId?: string;

  @Prop({ type: Types.ObjectId, ref: 'Assignment', required: false })
  assignmentId?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Number, min: 1, max: 5, required: false })
  rating?: number;

  @Prop({ type: [String], default: [] })
  suggestions: string[];

  @Prop({ default: false })
  isRead: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
FeedbackSchema.index({ studentId: 1, createdAt: -1 });
FeedbackSchema.index({ teacherId: 1, createdAt: -1 });
