import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'companies' })
export class Company {
    @Prop({ required: true, unique: true })
    cts_company_name: string;

    @Prop({ required: true })
    display_name: string;

    @Prop({ required: true, unique: true })
    external_id: string;

    @Prop()
    website_uri?: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
