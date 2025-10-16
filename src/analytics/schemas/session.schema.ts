import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ required: true, index: true })
  visitorId: string;

  @Prop()
  userId?: string;

  @Prop({ type: Date })
  startTime: Date;

  @Prop({ type: Date })
  endTime?: Date;

  @Prop({ default: 0 })
  pageCount: number;

  @Prop()
  landingPage?: string;

  @Prop()
  exitPage?: string;

  @Prop()
  referrer?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  country?: string;

  @Prop()
  device?: string;

  @Prop({ default: false })
  isActive: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
