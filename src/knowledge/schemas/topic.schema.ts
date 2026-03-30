import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

@Schema({ timestamps: true })
export class KnowledgeTopic extends MongooseDocument {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  logoUrl: string;

  @Prop({ type: String })
  jdFileId: string;

  @Prop()
  jdFileName: string;

  @Prop({ default: false })
  isPublished: boolean;
}

export const KnowledgeTopicSchema = SchemaFactory.createForClass(KnowledgeTopic);
