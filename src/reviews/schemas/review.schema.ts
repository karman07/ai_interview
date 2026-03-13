import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

export enum ReviewFlag {
  CLEAN = 'clean',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden',
}

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** AI session id from the interview service (optional — not all interviews store one) */
  @Prop({ index: true })
  sessionId?: string;

  /** e.g. "behavioral", "technical", "dsa", "system_design" */
  @Prop()
  interviewType?: string;

  /** Star rating 1–5 */
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  /** Optional written review */
  @Prop({ maxlength: 1200, default: '' })
  comment: string;

  /** Admin moderation flag */
  @Prop({ enum: ReviewFlag, default: ReviewFlag.CLEAN })
  flag: ReviewFlag;

  /** Pinned reviews appear at the top of public widgets */
  @Prop({ default: false })
  isPinned: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Compound index — one review per user per session
ReviewSchema.index({ userId: 1, sessionId: 1 }, { unique: false });
