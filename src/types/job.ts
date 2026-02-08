// Job Types based on BACKEND_CONTRACT.md
export enum JobLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  MID_LEVEL = 'MID_LEVEL',
  SENIOR_LEVEL = 'SENIOR_LEVEL',
  EXECUTIVE = 'EXECUTIVE',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTOR = 'CONTRACTOR',
  INTERNSHIP = 'INTERNSHIP',
}

export interface Job {
  job_id: string;
  adzuna_id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: EmploymentType | string | null;
  salary_min: number;
  salary_max: number;
  description: string;
  redirect_url: string | null;
  relevance_score?: number;
  is_internship: boolean;
  // Optional for frontend display
  postedAt?: Date;
}

export interface JobListResponse {
  total: number;
  jobs: Job[];
}

export interface ResumeMatchRequest {
  resume_text: string;
  location?: string;
  internship_only?: boolean;
  job_level?: JobLevel;
  stipend_min?: number;
}

export interface MatchResultResponse {
  total_matches: number;
  search_time_ms: number;
  jobs: Job[];
  metadata: any;
}

// Keeping DashboardStats for now if used elsewhere, but marked as legacy
export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  totalInterviews: number;
  averageInterviewScore: number;
  bestInterviewScore: number;
  jobRecommendations: number;
  unreadMessages: number;
  recentApplications: {
    _id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedAt: Date;
  }[];
  upcomingInterviews: {
    _id: string;
    type: string;
    scheduledAt: Date;
  }[];
}
