import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewResultDocument = InterviewResult & Document;

@Schema({ _id: false })
export class VoiceScores {
  @Prop({ default: 0 })
  fluency: number;

  @Prop({ default: 0 })
  clarity: number;

  @Prop({ default: 0 })
  confidence: number;

  @Prop({ default: 0 })
  pace: number;

  @Prop({ default: 0 })
  total: number;
}

@Schema({ _id: false })
export class VoiceMetrics {
  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: 0 })
  speech_rate: number;

  @Prop({ default: 0 })
  avg_pitch: number;

  @Prop({ default: 0 })
  pitch_variation: number;

  @Prop({ default: 0 })
  avg_energy: number;

  @Prop({ default: 0 })
  pause_ratio: number;

  @Prop({ default: 0 })
  speech_segments: number;
}

@Schema({ _id: false })
export class CommunicationEvaluation {
  @Prop({ type: VoiceScores })
  voice_scores: VoiceScores;

  @Prop({ type: VoiceMetrics })
  voice_metrics: VoiceMetrics;
}

@Schema({ _id: false })
export class TechnicalEvaluationRaw {
  @Prop({ default: 0 })
  clarity: number;

  @Prop({ default: 0 })
  confidence: number;

  @Prop({ default: 0 })
  technical_depth: number;

  @Prop()
  summary: string;
}

@Schema({ _id: false })
export class TechnicalEvaluation {
  @Prop({ default: 0 })
  technical_depth: number;

  @Prop()
  summary: string;

  @Prop({ type: TechnicalEvaluationRaw })
  raw: TechnicalEvaluationRaw;
}

@Schema({ _id: false })
export class QuestionEvaluation {
  @Prop({ default: 0 })
  total_score: number;

  @Prop()
  feedback: string;

  @Prop({ type: [String], default: [] })
  suggestions: string[];
}

@Schema({ _id: false })
export class HistoryItem {
  @Prop({ required: true })
  question: string;

  @Prop()
  answer: string;

  @Prop({ type: QuestionEvaluation })
  evaluation: QuestionEvaluation;

  @Prop()
  stage: string;

  @Prop()
  timestamp: string;

  @Prop({ type: TechnicalEvaluation })
  technical_evaluation: TechnicalEvaluation;

  @Prop({ type: CommunicationEvaluation })
  communication_evaluation: CommunicationEvaluation;

  @Prop()
  transcribed_text: string;
}

@Schema({ _id: false })
export class InterviewState {
  @Prop()
  user_id: string;

  @Prop()
  session_id: string;

  @Prop()
  role_title: string;

  @Prop()
  company_name: string;

  @Prop()
  industry: string;

  @Prop()
  jd: string;

  @Prop()
  cv: string;

  @Prop()
  round_type: string;

  @Prop()
  status: string;

  @Prop({ type: [HistoryItem], default: [] })
  history: HistoryItem[];

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ _id: false })
export class FaceMetrics {
  @Prop({ default: 0 })
  face_presence_percentage: number;

  @Prop({ default: 0 })
  multiple_faces_detected_percentage: number;

  @Prop({ default: 0 })
  face_detected_frames: number;
}

@Schema({ _id: false })
export class EyeContact {
  @Prop({ default: 0 })
  average_score: number;

  @Prop({ default: 0 })
  looking_away_percentage: number;

  @Prop()
  rating: string;
}

@Schema({ _id: false })
export class BlinkAnalysis {
  @Prop({ default: 0 })
  total_blinks: number;

  @Prop({ default: 0 })
  blinks_per_minute: number;

  @Prop()
  rating: string;
}

@Schema({ _id: false })
export class HeadMovement {
  @Prop({ default: 0 })
  stability_score: number;

  @Prop()
  rating: string;
}

@Schema({ _id: false })
export class CheatingDetection {
  @Prop()
  risk_level: string;

  @Prop({ default: 0 })
  risk_score: number;

  @Prop({ type: [String], default: [] })
  indicators: string[];

  @Prop({ default: false })
  is_suspicious: boolean;
}

@Schema({ _id: false })
export class OverallBehaviorScore {
  @Prop({ default: 0 })
  score: number;

  @Prop()
  rating: string;

  @Prop()
  confidence: string;

  @Prop()
  note: string;
}

@Schema({ _id: false })
export class VideoAnalysis {
  @Prop({ default: 0 })
  duration_seconds: number;

  @Prop({ default: 0 })
  total_frames: number;

  @Prop({ default: 0 })
  fps: number;

  @Prop({ type: FaceMetrics })
  face_metrics: FaceMetrics;

  @Prop({ type: EyeContact })
  eye_contact: EyeContact;

  @Prop({ type: BlinkAnalysis })
  blink_analysis: BlinkAnalysis;

  @Prop({ type: HeadMovement })
  head_movement: HeadMovement;

  @Prop({ type: CheatingDetection })
  cheating_detection: CheatingDetection;

  @Prop({ type: OverallBehaviorScore })
  overall_behavior_score: OverallBehaviorScore;
}

@Schema({ _id: false })
export class EvaluationScores {
  @Prop({ default: 0 })
  overall: number;

  @Prop({ default: 0 })
  communication: number;

  @Prop({ default: 0 })
  technical: number;

  @Prop({ default: 0 })
  behavioral: number;

  @Prop({ default: 0 })
  problemSolving: number;

  @Prop({ default: 0 })
  clarity: number;

  @Prop({ default: 0 })
  confidence: number;
}

@Schema({ _id: false })
export class AudioAnalysis {
  @Prop()
  transcription: string;

  @Prop({ default: 0 })
  speechClarity: number;

  @Prop({ default: 0 })
  paceScore: number;

  @Prop({ default: 0 })
  confidenceLevel: number;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: 0 })
  pauseCount: number;

  @Prop({ default: 0 })
  fillerWords: number;
}

@Schema({ _id: false })
export class VideoAnalysisData {
  @Prop()
  transcription: string;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: 0 })
  facePresence: number;

  @Prop({ default: 0 })
  eyeContact: number;

  @Prop({ default: 0 })
  headStability: number;

  @Prop()
  cheatingRisk: string;

  @Prop({ default: 0 })
  behaviorScore: number;
}

@Schema({ _id: false })
export class Analytics {
  @Prop({ type: EvaluationScores })
  scores: EvaluationScores;

  @Prop({ type: AudioAnalysis })
  audioAnalysis: AudioAnalysis;

  @Prop({ type: VideoAnalysisData })
  videoAnalysis: VideoAnalysisData;

  @Prop({ default: 0 })
  responseTime: number;

  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  improvements: string[];
}

@Schema({ timestamps: true })
export class InterviewResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  sessionId: string;

  @Prop()
  roundType: string;

  @Prop({ type: QuestionEvaluation })
  evaluation: QuestionEvaluation;

  @Prop()
  next_question: string;

  @Prop({ type: InterviewState })
  state: InterviewState;

  @Prop({ type: VideoAnalysis })
  video_analysis: VideoAnalysis;

  @Prop({ type: Analytics })
  analytics: Analytics;

  @Prop({ type: Object })
  rawResponse: any; // Complete raw response from AI service

  @Prop({ default: Date.now })
  completedAt: Date;

  // Timestamps (automatically added by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const InterviewResultSchema = SchemaFactory.createForClass(InterviewResult);

// Indexes for better query performance
InterviewResultSchema.index({ userId: 1, sessionId: 1 });
InterviewResultSchema.index({ userId: 1, completedAt: -1 });
InterviewResultSchema.index({ sessionId: 1 });
