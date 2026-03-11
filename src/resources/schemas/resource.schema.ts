import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  duration: string;

  @Prop()
  studyTime: string;

  @Prop({ default: 'Beginner' })
  difficulty: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: 'draft' })
  status: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  downloadUrl: string;

  @Prop()
  externalUrl: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  downloads: number;

  @Prop({ default: 0 })
  students: number;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
