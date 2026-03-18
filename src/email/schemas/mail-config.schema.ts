import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MailConfigDocument = MailConfig & Document;

@Schema({ timestamps: true })
export class MailConfig {
  @Prop({ default: '' })
  mailgunApiKey: string;

  @Prop({ default: '' })
  mailgunApiUrl: string;

  @Prop({ default: 'AIForJob.ai <postmaster@aiforjob.ai>' })
  mailgunFrom: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const MailConfigSchema = SchemaFactory.createForClass(MailConfig);
