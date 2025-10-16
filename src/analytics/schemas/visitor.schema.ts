import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitorDocument = Visitor & Document;

@Schema({ timestamps: true })
export class Visitor {
  @Prop({ required: true, unique: true, index: true })
  visitorId: string;

  @Prop()
  userId?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  country?: string;

  @Prop()
  device?: string;

  @Prop()
  isAdmin?: boolean;

  @Prop({ type: Date })
  firstVisit: Date;

  @Prop({ type: Date })
  lastVisit: Date;

  @Prop({ default: 0 })
  totalSessions: number;

  @Prop({ default: 0 })
  totalPageViews: number;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);
