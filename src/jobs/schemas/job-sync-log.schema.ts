import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobSyncLogDocument = JobSyncLog & Document;

@Schema({ collection: 'job_sync_logs' })
export class JobSyncLog {
    @Prop({ required: true })
    sync_type: string; // daily_refresh, manual, initial

    @Prop({ default: 'pending' }) // pending, in_progress, completed, failed
    status: string;

    @Prop({ default: 0 })
    jobs_fetched: number;

    @Prop({ default: 0 })
    jobs_created: number;

    @Prop({ default: 0 })
    jobs_updated: number;

    @Prop({ default: 0 })
    jobs_deleted: number;

    @Prop({ default: 0 })
    jobs_failed: number;

    @Prop()
    error_message?: string;

    @Prop({ default: Date.now })
    started_at: Date;

    @Prop()
    completed_at?: Date;
}

export const JobSyncLogSchema = SchemaFactory.createForClass(JobSyncLog);

JobSyncLogSchema.index({ status: 1, started_at: -1 });
