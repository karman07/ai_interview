import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModelConfigDocument = ModelConfig & Document;

@Schema({ timestamps: true })
export class ModelConfig {
  /** One document per provider — upserted on each update */
  @Prop({ required: true, enum: ['gemini', 'groq'], unique: true })
  provider: 'gemini' | 'groq';

  /** Active model ID, e.g. "gemini-2.5-flash" or "llama-3.3-70b-versatile" */
  @Prop({ required: true })
  modelId: string;
}

export const ModelConfigSchema = SchemaFactory.createForClass(ModelConfig);
