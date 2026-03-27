import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ required: true })
  title: string; // e.g. "DSA Practice Round 1"

  @Prop({ required: true })
  classId: string; // Ref to Class

  @Prop({ required: true })
  teacherId: string; // Created by

  @Prop({ required: true })
  universityId: string; // Teacher's university

  @Prop({ required: true })
  topic: string; // e.g. "DSA", "DBMS", "OS", "HR", "System Design"

  @Prop({ default: 'medium' })
  difficulty: string; // "easy", "medium", "hard"

  @Prop({ required: true, default: 1 })
  numInterviews: number; // Required # of interviews

  @Prop({ required: true })
  deadline: Date;

  @Prop({ type: [String], default: [] })
  assignedTo: string[]; // Student IDs

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
