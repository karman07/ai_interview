import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AIUsageDocument = AIUsage & Document;

@Schema({ timestamps: true })
export class AIUsage {
    @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, index: true })
    sessionId: string;

    @Prop({ required: true })
    model: string;

    @Prop({ required: true, default: 0 })
    inputTokens: number;

    @Prop({ required: true, default: 0 })
    outputTokens: number;

    @Prop({ required: true, default: 0 })
    totalTokens: number;

    @Prop({ required: true, default: 0 })
    costUsd: number;

    @Prop({ default: 0 })
    inputCostUsd: number;

    @Prop({ default: 0 })
    outputCostUsd: number;

    @Prop({ required: true, enum: ['free', 'active', 'expired', 'trial'], default: 'free' })
    subscriptionStatus: string;

    @Prop({ enum: ['interview', 'resume', 'cv', 'tts', 'other'], default: 'interview', index: true })
    source: string;

    @Prop({ enum: ['technical', 'behavioral', 'problem', 'hr', 'general', ''], default: '' })
    interviewType: string;

    @Prop({ default: '' })
    role: string;

    @Prop({ default: '' })
    company: string;

    @Prop({ default: Date.now })
    timestamp: Date;

    @Prop({ default: 'unknown' })
    endReason: string;
}

export const AIUsageSchema = SchemaFactory.createForClass(AIUsage);
AIUsageSchema.index({ userId: 1, timestamp: -1 });
