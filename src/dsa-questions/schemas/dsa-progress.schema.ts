import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DsaProgressDocument = DsaProgress & Document;

export enum SubmissionStatus {
  ATTEMPTED = 'Attempted',
  SOLVED = 'Solved',
  FAILED = 'Failed',
}

export enum SubmissionLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  TYPESCRIPT = 'typescript',
  GO = 'go',
  RUST = 'rust',
  CSHARP = 'csharp',
}

export class Submission {
  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ required: true, enum: SubmissionLanguage })
  language: SubmissionLanguage;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: SubmissionStatus })
  status: SubmissionStatus;

  @Prop({ default: 0 })
  testCasesPassed: number;

  @Prop({ default: 0 })
  totalTestCases: number;

  @Prop()
  executionTime?: number; // in milliseconds

  @Prop()
  memoryUsed?: number; // in MB

  @Prop()
  errorMessage?: string;

  @Prop({ default: false })
  isAccepted: boolean;
}

@Schema({ timestamps: true })
export class DsaProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  questionId: string; // Reference to DsaQuestion.questionId

  @Prop({ type: Types.ObjectId, ref: 'DsaQuestion' })
  questionRef: Types.ObjectId;

  // Status tracking
  @Prop({ required: true, enum: SubmissionStatus })
  status: SubmissionStatus;

  @Prop({ default: false })
  isBookmarked: boolean;

  @Prop({ default: false })
  isLiked: boolean;

  @Prop({ default: false })
  isDisliked: boolean;

  // Attempt tracking
  @Prop({ default: 0 })
  totalAttempts: number;

  @Prop({ default: 0 })
  successfulAttempts: number;

  @Prop()
  firstAttemptDate?: Date;

  @Prop()
  lastAttemptDate?: Date;

  @Prop()
  solvedDate?: Date;

  // Time tracking
  @Prop({ default: 0 })
  totalTimeSpent: number; // in seconds

  @Prop()
  bestExecutionTime?: number; // in milliseconds

  // Submissions history
  @Prop({ type: [Submission], default: [] })
  submissions: Submission[];

  // Notes and hints
  @Prop({ type: [String], default: [] })
  hintsUsed: string[]; // Track which hints were revealed

  @Prop()
  userNotes?: string; // User's personal notes

  // Languages used
  @Prop({ type: [String], default: [] })
  languagesAttempted: string[];

  // Best submission
  @Prop()
  bestSubmissionId?: string;

  // Score/Rating (optional)
  @Prop({ min: 0, max: 100 })
  userRating?: number; // User's personal rating of the question
}

export const DsaProgressSchema = SchemaFactory.createForClass(DsaProgress);

// Create compound unique index for userId + questionId
DsaProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });

// Other indexes for queries
DsaProgressSchema.index({ userId: 1, status: 1 });
DsaProgressSchema.index({ userId: 1, isBookmarked: 1 });
DsaProgressSchema.index({ userId: 1, solvedDate: 1 });
DsaProgressSchema.index({ questionId: 1 });
