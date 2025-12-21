import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  EMPLOYEE = 'employee',
  EMPLOYER = 'employer'
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop()
  passwordHash?: string; // optional for Google users

  @Prop({ enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

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
