import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailSubscriptionDocument = EmailSubscription & Document;

@Schema({ timestamps: true })
export class EmailSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: true })
  isSubscribed: boolean;

  @Prop({ type: [String], default: ['job_updates'] })
  subscriptionTypes: string[];

  @Prop()
  unsubscribeToken?: string;

  @Prop({ type: Date })
  lastEmailSentAt?: Date;
}

export const EmailSubscriptionSchema = SchemaFactory.createForClass(EmailSubscription);
