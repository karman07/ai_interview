import { SubscriptionPlan } from './subscription';

export type Role = 'user' | 'admin' | string;

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: Role;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  bio?: string;
  phone?: string;
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
  googleId?: string;
  company?: string;
  industry?: string;
  createdAt?: string;
  updatedAt?: string;
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
  phone?: string;
  location?: string;
  experienceLevel?: string;
  skills?: string[];
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  company?: string;
  industry?: string;
}
