// lesson.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ _id: false })
export class ContentBlock {
  @Prop({ required: true })
  heading: string; // e.g. "*** Heading ***"

  @Prop({ type: [String], default: [] })
  points: string[]; // list of bullet points under heading
}

export const ContentBlockSchema = SchemaFactory.createForClass(ContentBlock);

@Schema({ timestamps: true })
export class SubLesson {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [ContentBlockSchema], default: [] })
  content: ContentBlock[]; // structured content

  @Prop()
  videoUrl?: string;

  @Prop({ default: 0 })
  order: number;
}

export const SubLessonSchema = SchemaFactory.createForClass(SubLesson);

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [ContentBlockSchema], default: [] })
  content: ContentBlock[]; // structured content

  @Prop()
  videoUrl?: string;

  @Prop({ type: [SubLessonSchema], default: [] })
  subLessons: SubLesson[];

  @Prop({ default: 0 })
  order: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
