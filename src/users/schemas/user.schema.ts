import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop()
  passwordHash?: string; // optional for Google users

  @Prop()
  role?: string;

  @Prop()
  company?: string;

  @Prop()
  industry?: string;

  @Prop()
  jobDescription?: string;

  @Prop()
  resumeUrl?: string;

  @Prop()
  profileImageUrl?: string;

  @Prop()
  refreshTokenHash?: string;

  @Prop()
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
