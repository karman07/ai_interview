import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = Alert & Document;

export enum AlertType {
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  RISK = 'risk',
  USAGE = 'usage',
}

@Schema({ timestamps: true })
export class Alert {
  @Prop({ type: String, enum: AlertType, required: true })
  type: AlertType;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, index: true })
  teacherId: string; // The teacher who should see this alert

  @Prop()
  universityId?: string;

  @Prop()
  classId?: string; // If applicable to a specific class

  @Prop()
  studentId?: string; // If applicable to a specific student

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object })
  metadata?: any; // e.g. { assignmentId: '123', daysInactive: 8 }

  createdAt?: Date;
  updatedAt?: Date;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
