import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewQuestionDocument = InterviewQuestion & Document;

@Schema({ _id: false })
export class QuestionScores {
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
  clarity: number;

  @Prop({ min: 0, max: 10, default: 0 })
  confidence: number;
}

@Schema({ _id: false })
export class AudioAnalysis {
  @Prop()
  transcription?: string;

  @Prop({ min: 0, max: 10, default: 0 })
  speechClarity: number;

  @Prop({ min: 0, max: 10, default: 0 })
  paceScore: number;

  @Prop({ min: 0, max: 10, default: 0 })
  confidenceLevel: number;

  @Prop()
  duration?: number; // in seconds

  @Prop()
  pauseCount?: number;

  @Prop()
  fillerWords?: number;
}

@Schema({ _id: false })
export class VideoAnalysis {
  @Prop()
  transcription?: string;

  @Prop()
  duration?: number; // in seconds

  @Prop({ min: 0, max: 100, default: 0 })
  facePresence: number;

  @Prop({ min: 0, max: 10, default: 0 })
  eyeContact: number;

  @Prop({ min: 0, max: 10, default: 0 })
  headStability: number;

  @Prop()
  cheatingRisk?: string; // NONE, LOW, MEDIUM, HIGH

  @Prop({ min: 0, max: 10, default: 0 })
  behaviorScore: number;
}

@Schema({ timestamps: true })
export class InterviewQuestion {
  @Prop({ type: Types.ObjectId, ref: 'InterviewSession', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  questionNumber: number;

  @Prop({ required: true })
  questionText: string;

  @Prop()
  questionType?: string; // technical, behavioral, hr, problem-solving

  @Prop()
  competency?: string; // leadership, communication, problem-solving, etc.

  @Prop()
  difficulty?: string; // easy, medium, hard

  @Prop()
  answerText?: string;

  @Prop()
  audioFilePath?: string;

  @Prop()
  audioUrl?: string;

  @Prop()
  videoFilePath?: string;

  @Prop()
  videoUrl?: string;

  @Prop({ type: AudioAnalysis })
  audioAnalysis?: AudioAnalysis;

  @Prop({ type: VideoAnalysis })
  videoAnalysis?: VideoAnalysis;

  @Prop({ type: QuestionScores })
  scores?: QuestionScores;

  @Prop()
  feedback?: string;

  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  improvements: string[];

  @Prop()
  responseTime?: number; // in seconds

  @Prop()
  questionAskedAt?: Date;

  @Prop()
  answerSubmittedAt?: Date;

  @Prop({ type: Object })
  aiResponse?: any; // Raw AI response for debugging

  createdAt?: Date;
  updatedAt?: Date;
}

export const InterviewQuestionSchema = SchemaFactory.createForClass(InterviewQuestion);

// Prevent duplicate saves - unique combination of sessionId and questionNumber
InterviewQuestionSchema.index({ sessionId: 1, questionNumber: 1 }, { unique: true });