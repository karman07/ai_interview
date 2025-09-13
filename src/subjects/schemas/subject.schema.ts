import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ _id: false })
export class ContentBlock {
  @Prop({ required: true })
  heading: string;

  @Prop({ type: [String], default: [] })
  points: string[];
}

export const ContentBlockSchema = SchemaFactory.createForClass(ContentBlock);

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop({ default: 'Beginner' })
  level: string;

  @Prop()
  estimatedTime: string;

  @Prop()
  thumbnailUrl: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 'draft' })
  status: string;

  @Prop()
  author: string;

  @Prop({ type: [ContentBlockSchema], default: [] })
  content: ContentBlock[];
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
