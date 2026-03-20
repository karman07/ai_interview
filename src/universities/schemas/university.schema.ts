import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UniversityDocument = University & Document;

@Schema({ timestamps: true })
export class University {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  domain: string; // e.g. "mit.edu", "iitb.ac.in"

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 5 })
  resumeLimit: number;

  @Prop({ default: 10 })
  interviewLimit: number;

  @Prop({ type: [String], default: [] })
  allowedFeatures: string[]; // e.g. ['jobAlerts', 'matchResume']

  @Prop()
  logoUrl?: string;

  @Prop()
  adminEmail?: string;

  @Prop()
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UniversitySchema = SchemaFactory.createForClass(University);
