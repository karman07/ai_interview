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

  // ✅ Tell Mongoose this is a plain object
  @Prop({ type: Object, required: true })
  stats: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
