import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true })
export class ApiKey {
  @Prop({ required: true, enum: ['gemini', 'groq'] })
  provider: 'gemini' | 'groq';

  @Prop({ required: true })
  label: string;

  /** Full key value — never sent to frontend raw */
  @Prop({ required: true })
  value: string;

  /** Only one key per provider can be active at a time */
  @Prop({ default: false })
  isActive: boolean;

  /** Marks the key seeded from env vars — cannot be deleted */
  @Prop({ default: false })
  isDefault: boolean;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
