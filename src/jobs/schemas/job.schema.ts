import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

export enum JobDescriptionType {
  TEXT = 'text',
  PDF = 'pdf',
  MARKDOWN = 'markdown'
}

@Schema({ _id: false })
export class SalaryRange {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: JobDescriptionType, default: JobDescriptionType.TEXT })
  descriptionType: JobDescriptionType;

  @Prop()
  descriptionFileUrl?: string; // for PDF files

  @Prop({ required: true, type: [String] })
  requirements: string[];

  @Prop({ required: true })
  salary: number;

  @Prop({ type: SalaryRange })
  salaryRange?: SalaryRange;

  @Prop({ required: true })
  location: string;

  @Prop({ enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' })
  jobType: string;

  @Prop({ enum: ['entry', 'mid', 'senior', 'executive'], default: 'mid' })
  experienceLevel: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop()
  companyInfo?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employerId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  postedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);