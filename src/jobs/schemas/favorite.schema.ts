import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ collection: 'favorites' })
export class Favorite {
    @Prop({ required: true, index: true })
    user_id: string;

    @Prop({ required: true })
    job_id: string;

    @Prop()
    adzuna_id?: string;

    @Prop({ default: Date.now })
    created_at: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index({ user_id: 1, job_id: 1 }, { unique: true });
