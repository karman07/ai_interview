import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  STUDENT = 'student',
  ADMIN = 'admin',
  UNIVERSITY_TEACHER = 'university_teacher',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop()
  passwordHash?: string; // optional for Google users

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop()
  company?: string;

  @Prop()
  industry?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  phoneNumber?: string;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop()
  profileImageUrl?: string;

  @Prop()
  bio?: string;


  @Prop()
  location?: string;

  @Prop()
  experienceLevel?: string;

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop()
  website?: string;

  @Prop()
  githubUrl?: string;

  @Prop()
  linkedinUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscriptionPlan?: Types.ObjectId;

  @Prop({ default: 'free' })
  subscriptionStatus?: string; // free, active, expired, trial

  @Prop()
  subscriptionExpiry?: Date;

  @Prop()
  razorpaySubscriptionId?: string;

  @Prop()
  refreshTokenHash?: string;

  @Prop({ default: 0 })
  resumeCount: number;

  @Prop({ default: 0 })
  interviewCount: number;

  @Prop()
  googleId?: string;

  @Prop({ type: String })
  universityId?: string; // ref to University._id (string for simplicity)

  @Prop({ type: String })
  rollNumber?: string; // university roll / registration number

  @Prop({ type: [String], default: [] })
  fcmTokens?: string[];

  // ── Plan usage limits (stamped at purchase time) ───────────────────────────
  @Prop({ default: 5 })
  resumeLimit?: number;               // Max resumes per month for current plan

  @Prop({ default: 3 })
  interviewLimit?: number;            // Max interviews per month for current plan

  // ── Pay-as-you-go plan fields ──────────────────────────────────────────────
  @Prop()
  paygMonthlyBudget?: number;         // User-set monthly budget in paisa (smallest unit)

  @Prop({ default: 0 })
  paygInterviewsUsed?: number;        // Interviews consumed this billing cycle

  @Prop({ default: 0 })
  paygResumesUsed?: number;           // Resume analyses consumed this billing cycle

  @Prop()
  paygInterviewsLimit?: number;       // Max interviews allowed (derived from budget ÷ price)

  @Prop()
  paygResumesLimit?: number;          // Max resumes allowed (derived from budget ÷ price)

  @Prop()
  paygBillingCycleStart?: Date;       // When the current billing period started

  @Prop()
  paygBillingCycleEnd?: Date;         // When the current billing period ends

  @Prop()
  paygRazorpaySubscriptionId?: string; // The recurring Razorpay subscription for PAYG billing

  // Timestamps (automatically added by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure timestamps are properly typed
UserSchema.set('timestamps', true);

// Ensure google users are always verified
UserSchema.pre('save', function (next) {
  if (this.googleId) {
    this.isEmailVerified = true;
  }
  next();
});
