import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailSubscriptionDocument = EmailSubscription & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'email_subscriptions' })
export class EmailSubscription {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    resume_text: string;

    @Prop({ default: 'biweekly' }) // daily, weekly, biweekly
    frequency: string;

    @Prop({ default: true })
    is_enabled: boolean;

    @Prop()
    location?: string;

    @Prop({ default: false })
    internship_only: boolean;

    @Prop()
    job_level?: string;

    @Prop()
    stipend_min?: number;
}

export const EmailSubscriptionSchema = SchemaFactory.createForClass(EmailSubscription);
