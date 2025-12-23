import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobApplicationDocument = JobApplication & Document;

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  HIRED = 'hired'
}

@Schema({ _id: false })
export class InterviewScores {
  @Prop({ min: 0, max: 10, default: 0 })
  overall: number;

  @Prop({ min: 0, max: 10, default: 0 })
  technical: number;

  @Prop({ min: 0, max: 10, default: 0 })
  behavioral: number;

  @Prop({ min: 0, max: 10, default: 0 })
  problemSolving: number;

  @Prop({ min: 0, max: 10, default: 0 })
  hr: number;

  @Prop()
  bestSessionId?: string;

  @Prop()
  totalInterviews?: number;

  @Prop()
  lastInterviewDate?: Date;
}

@Schema({ _id: false })
export class AIMatchingScore {
  @Prop({ min: 0, max: 100, default: 0 })
  overallMatch: number;

  @Prop({ min: 0, max: 100, default: 0 })
  skillsMatch: number;

  @Prop({ min: 0, max: 100, default: 0 })
  experienceMatch: number;

  @Prop({ type: [String], default: [] })
  matchingKeywords: string[];

  @Prop({ type: [String], default: [] })
  missingSkills: string[];

  @Prop()
  aiRecommendation?: string;
}

@Schema({ timestamps: true })
export class JobApplication {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  applicantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employerId: Types.ObjectId;

  @Prop({ enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  // Resume and Cover Letter
  @Prop()
  resumeUrl?: string;

  @Prop()
  coverLetter?: string;

  // AI Matching Results
  @Prop({ type: AIMatchingScore })
  aiMatchingScore?: AIMatchingScore;

  // Interview Performance
  @Prop({ type: InterviewScores })
  interviewScores?: InterviewScores;

  // Application Notes
  @Prop()
  employerNotes?: string;

  @Prop()
  rejectionReason?: string;

  // Timeline
  @Prop()
  appliedAt: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  interviewScheduledAt?: Date;

  @Prop()
  statusUpdatedAt?: Date;

  // Additional Data
  @Prop({ type: Object })
  additionalData?: any;
}

export const JobApplicationSchema = SchemaFactory.createForClass(JobApplication);

// Indexes for better query performance
JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
JobApplicationSchema.index({ employerId: 1, status: 1 });
JobApplicationSchema.index({ 'aiMatchingScore.overallMatch': -1 });
JobApplicationSchema.index({ 'interviewScores.overall': -1 });