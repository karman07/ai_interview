import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'adzuna_jobs' })
export class Job {
    @Prop({ required: true, unique: true })
    adzuna_id: string;

    @Prop()
    cts_job_name?: string;

    @Prop({ required: true, unique: true })
    requisition_id: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop()
    company_id?: string;

    @Prop()
    company_display_name?: string;

    @Prop()
    location?: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    location_structured?: any;

    @Prop()
    employment_type?: string;

    @Prop()
    job_level?: string;

    @Prop()
    salary_min?: number;

    @Prop()
    salary_max?: number;

    @Prop({ default: 'USD' })
    salary_currency: string;

    @Prop()
    category?: string;

    @Prop()
    contract_time?: string;

    @Prop()
    redirect_url?: string;

    @Prop({ default: 'active' }) // active, expired, deleted
    status: string;

    @Prop({ default: false })
    is_internship: boolean;

    @Prop({ default: false })
    is_remote: boolean;

    @Prop()
    expires_at?: Date;

    @Prop()
    last_synced_to_cts?: Date;

    @Prop({ type: MongooseSchema.Types.Mixed })
    raw_data?: any;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Defining Indexes Manually
JobSchema.index({ adzuna_id: 1 }, { unique: true });
JobSchema.index({ requisition_id: 1 }, { unique: true });
JobSchema.index({ status: 1 });
JobSchema.index({ expires_at: 1 });
JobSchema.index({ location: 1, status: 1 });
JobSchema.index({ is_internship: 1, status: 1 });
JobSchema.index({ created_at: 1 });
JobSchema.index(
    { title: 'text', description: 'text', company_display_name: 'text' },
    { name: 'job_text_search' },
);
