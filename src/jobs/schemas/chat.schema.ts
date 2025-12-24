import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  SYSTEM = 'system'
}

@Schema({ _id: false })
export class Message {
  @Prop({ required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Prop()
  fileUrl?: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: false })
  isRead: boolean;
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job' })
  jobId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployerRequest' })
  requestId?: Types.ObjectId;

  @Prop({ type: [Message], default: [] })
  messages: Message[];

  @Prop({ default: Date.now })
  lastMessageAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Indexes for better performance
ChatSchema.index({ employerId: 1, employeeId: 1 });
ChatSchema.index({ jobId: 1 });
ChatSchema.index({ requestId: 1 });
ChatSchema.index({ lastMessageAt: -1 });