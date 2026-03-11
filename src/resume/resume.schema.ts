import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';

export type ResumeDocument = Resume & Document;

@Schema({ timestamps: true })
export class Resume {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  url: string;

  // ✅ CV evaluation stats (optional since AI service might be unavailable)
  @Prop({ type: Object, required: false, default: {} })
  stats: Record<string, any>;

  // ✅ New improvement_resume field
  @Prop({ type: Object, required: false, default: {} })
  improvement_resume: Record<string, any>;

  // ✅ Extracted resume text for future use (e.g. AI Interview without re-upload)
  @Prop({ required: false, default: "" })
  text: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  createdAt: Date;
  updatedAt: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
