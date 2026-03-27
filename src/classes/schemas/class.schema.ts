import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true })
  name: string; // e.g. "CSE 4th Year A"

  @Prop()
  department?: string; // e.g. "Computer Science"

  @Prop()
  semester?: string; // e.g. "8th Semester"

  @Prop({ required: true, unique: true, index: true })
  classCode: string; // Auto-generated 6-char alphanumeric

  @Prop()
  inviteLink?: string; // Generated URL for easy sharing

  @Prop({ required: true })
  teacherId: string; // ObjectId ref to User (teacher)

  @Prop({ required: true })
  universityId: string; // ObjectId ref to University

  @Prop({ type: [String], default: [] })
  students: string[]; // Array of student User IDs

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
