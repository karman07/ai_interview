import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageViewDocument = PageView & Document;

@Schema({ timestamps: true })
export class PageView {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ required: true, index: true })
  visitorId: string;

  @Prop()
  userId?: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  title?: string;

  @Prop()
  referrer?: string;

  @Prop({ type: Date })
  timestamp: Date;

  @Prop()
  timeOnPage?: number;

  @Prop()
  scrollDepth?: number;
}

export const PageViewSchema = SchemaFactory.createForClass(PageView);
