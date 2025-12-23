import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployerRequestDocument = EmployerRequest & Document;

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

@Schema({ timestamps: true })
export class EmployerRequest {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop({ enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Prop()
  message?: string; // employer's message to the employee

  @Prop()
  employeeResponse?: string; // employee's response message
}

export const EmployerRequestSchema = SchemaFactory.createForClass(EmployerRequest);