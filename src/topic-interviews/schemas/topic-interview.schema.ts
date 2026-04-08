import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TopicInterview extends Document {
  @Prop({ required: true, trim: true, unique: true, index: true })
  name: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop()
  logoUrl?: string;

  @Prop({ type: [String], default: [] })
  links: string[];
}

export const TopicInterviewSchema = SchemaFactory.createForClass(TopicInterview);
TopicInterviewSchema.index({ name: 1 });
