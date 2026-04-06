import { SubscriptionPlan } from './subscription';

export type Role = 'user' | 'admin' | 'student' | string;

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: Role;
  isEmailVerified?: boolean;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  bio?: string;
  location?: string;
  experienceLevel?: string;
  skills?: string[];
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  profileImageUrl?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired' | 'free' | 'trial';
  subscriptionPlan?: string | SubscriptionPlan;
  subscriptionExpiry?: string | Date;
  razorpaySubscriptionId?: string;
  resumeCount?: number;
  interviewCount?: number;
  // ── Plan limits (stamped from plan at purchase time) ──────────────────
  resumeLimit?: number;
  interviewLimit?: number;
  // ── PAYG fields ───────────────────────────────────────────────────────
  paygMonthlyBudget?: number;
  paygInterviewsUsed?: number;
  paygResumesUsed?: number;
  paygInterviewsLimit?: number;
  paygResumesLimit?: number;
  paygBillingCycleStart?: string | Date;
  paygBillingCycleEnd?: string | Date;
  paygRazorpaySubscriptionId?: string;
  googleId?: string;
  company?: string;
  industry?: string;
  universityId?: string;
  rollNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  limitsNextReset?: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}

export interface SignupDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  bio?: string;
  location?: string;
  experienceLevel?: string;
  skills?: string[];
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  company?: string;
  industry?: string;
  rollNumber?: string;
}
