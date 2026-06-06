import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HackathonEmailDocument = HackathonEmail & Document;

@Schema({ timestamps: true })
export class HackathonEmail {
  @Prop({ required: true, lowercase: true, index: true })
  email: string;

  @Prop({ default: false })
  interviewTaken: boolean;

  @Prop({ default: false })
  formSubmitted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const HackathonEmailSchema = SchemaFactory.createForClass(HackathonEmail);
