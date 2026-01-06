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

@Schema({ timestamps: true })
export class InterviewQuestion {
  @Prop({ type: Types.ObjectId, ref: 'InterviewSession', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

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

  @Prop({ type: AudioAnalysis })
  audioAnalysis?: AudioAnalysis;

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