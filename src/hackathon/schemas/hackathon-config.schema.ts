import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HackathonConfigDocument = HackathonConfig & Document;

@Schema({ timestamps: true })
export class HackathonConfig {
  @Prop({ default: 'default' })
  key: string; // singleton doc identified by key='default'

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  jdText: string; // full job description text

  @Prop({ default: 'hard' })
  difficulty: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const HackathonConfigSchema = SchemaFactory.createForClass(HackathonConfig);
