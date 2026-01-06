import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnhancedInterviewSessionDocument = EnhancedInterviewSession & Document;

export enum InterviewStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  PAUSED = 'paused'
}

export enum RoundType {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  HR = 'hr',
  PROBLEM_SOLVING = 'problem-solving',
  FULL = 'full'
}

@Schema({ _id: false })
export class SessionScores {
  @Prop({ min: 0, max: 10, default: 0 })
  overall: number;

  @Prop({ min: 0, max: 10, default: 0 })
  communication: number;

  @Prop({ min: 0, max: 10, default: 0 })
  technical: number;

  @Prop({ min: 0, max: 10, default: 0 })
  behavioral: number;

  @Prop({ min: 0, max: 10, default: 0 })
  problemSolving: number;

  @Prop({ min: 0, max: 10, default: 0 })
  leadership: number;

  @Prop({ min: 0, max: 10, default: 0 })
  clarity: number;

  @Prop({ min: 0, max: 10, default: 0 })
  confidence: number;
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

  @Prop({ default: 0 })
  pauseCount: number;

  @Prop({ default: 0 })
  fillerWordsTotal: number;

  @Prop({ default: 0 })
  averageSpeechClarity: number;

  @Prop({ default: 0 })
  averageConfidenceLevel: number;
}

@Schema({ _id: false })
export class JobContext {
  @Prop({ required: true })
  roleTitle: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ type: Types.ObjectId, ref: 'Resume' })
  resumeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobDescription' })
  jobDescriptionId?: Types.ObjectId;

  @Prop()
  experienceLevel?: string;
}

@Schema({ timestamps: true })
export class EnhancedInterviewSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ enum: RoundType, required: true })
  roundType: RoundType;

  @Prop({ enum: InterviewStatus, default: InterviewStatus.ACTIVE })
  status: InterviewStatus;

  @Prop({ type: JobContext, required: true })
  jobContext: JobContext;

  @Prop({ type: [Types.ObjectId], ref: 'InterviewQuestion', default: [] })
  questions: Types.ObjectId[];

  @Prop({ type: SessionScores })
  scores?: SessionScores;

  @Prop({ type: SessionMetrics, default: () => ({}) })
  metrics: SessionMetrics;

  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  areasForImprovement: string[];

  @Prop({ type: [String], default: [] })
  recommendations: string[];

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  pausedAt?: Date;

  @Prop()
  aiSessionId?: string; // External AI service session ID

  @Prop({ type: Object })
  finalReport?: any; // AI generated final report

  @Prop({ type: Object })
  aiState?: any; // Current AI session state

  @Prop({ type: Map, of: String })
  metadata?: Map<string, string>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const EnhancedInterviewSessionSchema = SchemaFactory.createForClass(EnhancedInterviewSession);