import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewSessionDocument = InterviewSession & Document;

export enum InterviewRound {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PROBLEM_SOLVING = 'problem-solving',
  HR = 'hr'
}

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  PAUSED = 'paused'
}

@Schema({ _id: false })
export class QuestionAnswer {
  @Prop({ required: true })
  question: string;

  @Prop()
  answer?: string;

  @Prop()
  audioUrl?: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  responseDuration?: number; // in seconds

  @Prop()
  feedback?: string;

  @Prop({ min: 0, max: 10 })
  score?: number;

  @Prop()
  answeredAt?: Date;
}

@Schema({ _id: false })
export class SessionMetrics {
  @Prop({ default: 0 })
  totalQuestions: number;

  @Prop({ default: 0 })
  answeredQuestions: number;

  @Prop({ default: 0 })
  averageResponseTime: number; // in seconds

  @Prop({ default: 0 })
  totalDuration: number; // in seconds

  @Prop({ min: 0, max: 10, default: 0 })
  overallScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  communicationScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  technicalScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  problemSolvingScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  behavioralScore: number;
}

@Schema({ timestamps: true })
export class InterviewSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ enum: InterviewRound, required: true })
  round: InterviewRound;

  @Prop({ enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  // Job context
  @Prop()
  role?: string;

  @Prop()
  company?: string;

  @Prop()
  jobDescription?: string;

  @Prop()
  experience?: string;

  @Prop()
  industry?: string;

  // Session data
  @Prop({ type: [QuestionAnswer], default: [] })
  questionsAnswers: QuestionAnswer[];

  @Prop({ type: SessionMetrics, default: () => ({}) })
  metrics: SessionMetrics;

  // Timing
  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  pausedAt?: Date;

  // AI Integration
  @Prop()
  aiSessionId?: string;

  @Prop({ type: Object })
  finalReport?: any; // AI generated final report

  // Additional metadata
  @Prop({ type: Map, of: String })
  metadata?: Map<string, string>;

  // Timestamps (automatically added by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const InterviewSessionSchema = SchemaFactory.createForClass(InterviewSession);

// Ensure timestamps are properly typed
InterviewSessionSchema.set('timestamps', true);