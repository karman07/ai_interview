export type Role = 'user' | 'admin' | string;

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: Role;
  company?: string;
  industry?: string;
  jobDescription?: string;
  resumeUrl?: string;
  profileImageUrl?: string;
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
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  company?: string;
  industry?: string;
  jobDescription?: string;
}
