import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Lesson' })
  lessonId: Types.ObjectId;

  @Prop({ enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' })
  status: 'not-started' | 'in-progress' | 'completed';

  @Prop({ min: 0, max: 100, default: 0 })
  progressPercent: number; // 0 to 100 %

  @Prop()
  score?: number; // quiz/exam score

  @Prop({ default: 0 })
  timeSpent: number; // in minutes

  @Prop({ default: Date.now })
  lastAccessed: Date;

  @Prop({ type: [String], default: [] })
  badges: string[]; // e.g., ["fast-learner", "perfect-score"]

  @Prop()
  notes?: string; // user’s personal notes for UI
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
