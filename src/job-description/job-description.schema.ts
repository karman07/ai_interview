import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';

export type JobDescriptionDocument = JobDescription & Document;

@Schema({ timestamps: true })
export class JobDescription {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  content?: string; // For text-based JDs

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;
}

export const JobDescriptionSchema = SchemaFactory.createForClass(JobDescription);