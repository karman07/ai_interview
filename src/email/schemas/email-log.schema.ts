import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailLogDocument = EmailLog & Document;

@Schema({ timestamps: true })
export class EmailLog {
  @Prop({ required: true })
  email: string;

  @Prop({
    required: true,
    enum: ['welcome', 'daily_update', 'payment_success', 'subscription_cancelled', 'other'],
    default: 'other',
  })
  type: string;

  @Prop({ required: true, enum: ['sent', 'failed'] })
  status: string;

  @Prop()
  error?: string;

  @Prop({ default: Date.now })
  sentAt: Date;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
