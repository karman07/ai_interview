import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdzunaConfigDocument = AdzunaConfig & Document;

@Schema({ timestamps: true })
export class AdzunaConfig {
    @Prop({ required: true })
    appId: string;

    @Prop({ required: true })
    appKey: string;

    @Prop({ default: 'us' })
    country: string;

    @Prop({ default: 50 })
    resultsPerPage: number;
}

export const AdzunaConfigSchema = SchemaFactory.createForClass(AdzunaConfig);
