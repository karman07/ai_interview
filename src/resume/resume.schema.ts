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

  // ✅ CV evaluation stats
  @Prop({ type: Object, required: true })
  stats: Record<string, any>;

  // ✅ New improvement_resume field
  @Prop({ type: Object, default: null })
  improvement_resume: Record<string, any> | null;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
