import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResultDocument = HydratedDocument<Result>;

@Schema({ timestamps: true, collection: 'results' })
export class Result {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ index: true })
  sessionId: string;

  @Prop()
  role: string;

  @Prop()
  roundType: string;

  @Prop({ required: true })
  jobDescription: string;

  @Prop({ type: [String], required: true })
  questions: string[];

  @Prop({ required: true })
  difficulty: string;

  @Prop({
    type: [
      {
        question: String,
        answer: String,
        isCorrect: Boolean,
        explanation: String,
        score: Number,
      },
    ],
    default: [],
  })
  items: {
    question: string;
    answer: string;
    isCorrect: boolean;
    explanation: string;
    score: number;
  }[];

  @Prop({
    type: {
      overall_score: Number,
      hire_recommendation: String,
      seniority_assessment: String,
      confidence_assessment: String,
      key_strengths: [String],
      key_areas_for_improvement: [String],
    },
  })
  summary: {
    overall_score: number;
    hire_recommendation: string;
    seniority_assessment: string;
    confidence_assessment: string;
    key_strengths: string[];
    key_areas_for_improvement: string[];
  };

  @Prop({ type: Object })
  dimension_scores: Record<string, number>;

  @Prop({
    type: {
      inputTokens: Number,
      outputTokens: Number,
      totalTokens: Number,
      costUsd: Number,
    },
  })
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
  };

  @Prop({ type: Array })
  question_wise_analysis: any[];

  @Prop({
    type: {
      critical_gaps: [String],
      moderate_gaps: [String],
      minor_gaps: [String],
    },
  })
  skill_gap_analysis: {
    critical_gaps: string[];
    moderate_gaps: string[];
    minor_gaps: string[];
  };

  @Prop({
    type: {
      communication_style: String,
      thinking_pattern: String,
      pressure_handling: String,
    },
  })
  behavioral_insights: {
    communication_style: string;
    thinking_pattern: string;
    pressure_handling: string;
  };

  @Prop({
    type: {
      immediate_actions: [String],
      plan_1_week: [String],
      plan_1_month: [String],
    },
  })
  improvement_plan: {
    immediate_actions: string[];
    plan_1_week: string[];
    plan_1_month: string[];
  };

  @Prop({
    type: {
      strengths_to_highlight: [String],
      areas_to_fix_before_next_interview: [String],
      final_recommendation_text: String,
    },
  })
  verdict: {
    strengths_to_highlight: string[];
    areas_to_fix_before_next_interview: string[];
    final_recommendation_text: string;
  };

  @Prop({ type: String })
  rawOutput: string;

  @Prop({ type: String, default: 'unknown' })
  endReason: string;

  @Prop({
    type: {
      experienceRating: { type: Number, min: 1, max: 5 },
      resultRating:     { type: Number, min: 1, max: 5 },
      comment:          String,
      submittedAt:      Date,
    },
    default: null,
  })
  feedback: {
    experienceRating: number; // how was the interview experience
    resultRating:     number; // how accurate/useful did the result feel
    comment:          string;
    submittedAt:      Date;
  } | null;
}
export const ResultSchema = SchemaFactory.createForClass(Result);
