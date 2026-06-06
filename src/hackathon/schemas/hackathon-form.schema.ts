import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HackathonFormDocument = HackathonForm & Document;

@Schema({ timestamps: true })
export class HackathonForm {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  experience: string; // how did the interview go?

  @Prop({ required: true })
  feedback: string; // feedback on the platform / hackathon

  @Prop({ required: true })
  collegeName: string;

  @Prop({ required: true })
  yearOfStudy: string;

  @Prop({ required: true })
  branch: string;

  @Prop()
  linkedinUrl?: string;

  @Prop()
  githubUrl?: string;

  @Prop()
  lookingForOpportunities?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const HackathonFormSchema = SchemaFactory.createForClass(HackathonForm);
