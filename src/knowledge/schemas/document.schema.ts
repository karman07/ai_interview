import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class KnowledgeDocument extends MongooseDocument {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeTopic', required: true })
  topicId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ default: 'pending' }) // pending, indexing, indexed, error
  status: string;

  @Prop()
  errorDetails: string;

  @Prop()
  chunkCount: number;
}

export const KnowledgeDocumentSchema = SchemaFactory.createForClass(KnowledgeDocument);
