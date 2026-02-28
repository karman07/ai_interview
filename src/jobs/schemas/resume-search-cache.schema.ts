import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ResumeSearchCacheDocument = ResumeSearchCache & Document;

@Schema({ collection: 'resume_search_cache' })
export class ResumeSearchCache {
    @Prop({ required: true, index: true })
    resume_hash: string;

    @Prop()
    location?: string;

    @Prop()
    internship_only?: boolean;

    @Prop()
    job_level?: string;

    @Prop()
    stipend_min?: number;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    matched_jobs: Record<string, any>[];

    @Prop({ default: Date.now })
    created_at: Date;

    @Prop({ required: true })
    expires_at: Date;
}

export const ResumeSearchCacheSchema = SchemaFactory.createForClass(ResumeSearchCache);

ResumeSearchCacheSchema.index({ expires_at: 1 });
ResumeSearchCacheSchema.index({ resume_hash: 1, expires_at: 1 });
