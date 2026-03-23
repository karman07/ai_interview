import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentAssignmentDocument = StudentAssignment & Document;

export enum StudentAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EVALUATED = 'evaluated',
}

@Schema({ timestamps: true })
export class StudentAssignment {
  @Prop({ required: true })
  assignmentId: string; // Ref to Assignment

  @Prop({ required: true })
  studentId: string; // Ref to User

  @Prop({
    type: String,
    enum: StudentAssignmentStatus,
    default: StudentAssignmentStatus.ASSIGNED,
  })
  status: StudentAssignmentStatus;

  @Prop({ default: 0 })
  completedInterviews: number; // Count of matching interviews done

  @Prop({ type: [Number], default: [] })
  scores: number[]; // Array of overall_score from matched Results

  @Prop({ default: 0 })
  avgScore: number; // Computed average

  @Prop()
  completedAt?: Date; // When status changed to completed

  createdAt?: Date;
  updatedAt?: Date;
}

export const StudentAssignmentSchema =
  SchemaFactory.createForClass(StudentAssignment);

// Compound unique index — one record per student per assignment
StudentAssignmentSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true },
);
