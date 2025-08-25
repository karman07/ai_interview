import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResultDocument = HydratedDocument<Result>;

@Schema({ timestamps: true, collection: 'results' })
export class Result {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

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
      summary: String,
      overallScore: Number,
    },
  })
  overall: {
    summary: string;
    overallScore: number;
  };

  @Prop({ type: String })
  rawOutput: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
