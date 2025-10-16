import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  round: string; // technical, behavioral, problem-solving, hr

  // Job / interview context (optional, filled when interview started)
  @Prop()
  role?: string;

  @Prop()
  company?: string;

  @Prop()
  jobDescription?: string;

  @Prop()
  experience?: string;

  @Prop()
  question?: string;

  @Prop()
  answer?: string;

  @Prop()
  feedback?: string;

  @Prop({ default: 'pending' })
  status: string; // pending | completed
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
