import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InterviewRound } from './interview-session.schema';

export type UserInterviewAnalyticsDocument = UserInterviewAnalytics & Document;

@Schema({ _id: false })
export class RoundStats {
  @Prop({ default: 0 })
  totalSessions: number;

  @Prop({ default: 0 })
  completedSessions: number;

  @Prop({ min: 0, max: 10, default: 0 })
  averageScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  bestScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  latestScore: number;

  @Prop()
  bestSessionId?: string;

  @Prop()
  latestSessionId?: string;

  @Prop({ default: 0 })
  totalTimeSpent: number; // in seconds

  @Prop({ default: 0 })
  averageResponseTime: number; // in seconds

  @Prop()
  lastAttemptDate?: Date;

  @Prop({ default: 0 })
  improvementTrend: number; // positive = improving, negative = declining
}

@Schema({ _id: false })
export class OverallStats {
  @Prop({ default: 0 })
  totalInterviews: number;

  @Prop({ default: 0 })
  completedInterviews: number;

  @Prop({ min: 0, max: 10, default: 0 })
  overallAverageScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  bestOverallScore: number;

  @Prop()
  bestSessionId?: string;

  @Prop({ default: 0 })
  totalTimeSpent: number; // in seconds

  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  areasForImprovement: string[];

  @Prop()
  lastInterviewDate?: Date;

  @Prop({ default: 0 })
  currentStreak: number; // consecutive completed interviews

  @Prop({ default: 0 })
  longestStreak: number;
}

@Schema({ _id: false })
export class MonthlyProgress {
  @Prop({ required: true })
  month: string; // YYYY-MM format

  @Prop({ default: 0 })
  sessionsCount: number;

  @Prop({ min: 0, max: 10, default: 0 })
  averageScore: number;

  @Prop({ default: 0 })
  timeSpent: number; // in seconds
}

@Schema({ timestamps: true })
export class UserInterviewAnalytics {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Round-specific statistics
  @Prop({ type: RoundStats, default: () => ({}) })
  technical: RoundStats;

  @Prop({ type: RoundStats, default: () => ({}) })
  behavioral: RoundStats;

  @Prop({ type: RoundStats, default: () => ({}) })
  problemSolving: RoundStats;

  @Prop({ type: RoundStats, default: () => ({}) })
  hr: RoundStats;

  // Overall statistics
  @Prop({ type: OverallStats, default: () => ({}) })
  overall: OverallStats;

  // Progress tracking
  @Prop({ type: [MonthlyProgress], default: [] })
  monthlyProgress: MonthlyProgress[];

  // Recent sessions (last 10)
  @Prop({ type: [Types.ObjectId], ref: 'InterviewSession', default: [] })
  recentSessions: Types.ObjectId[];

  // Performance insights
  @Prop({ type: Map, of: Number })
  skillScores?: Map<string, number>; // skill -> average score

  @Prop()
  lastUpdated?: Date;
}

export const UserInterviewAnalyticsSchema = SchemaFactory.createForClass(UserInterviewAnalytics);