// Job Types
export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits: string[];
  companyInfo: string;
  employerId: {
    _id: string;
    name: string;
    company: string;
  };
  isActive: boolean;
  postedAt: Date;
  applicationCount: number;
  hasApplied: boolean;
}

// Application Types
export interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
  };
  employerId: {
    _id: string;
    name: string;
    company: string;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired';
  coverLetter: string;
  aiMatchingScore: {
    overallMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    matchingKeywords: string[];
    missingSkills: string[];
    aiRecommendation: string;
  };
  interviewScores: {
    overall: number;
    technical: number;
    behavioral: number;
    problemSolving: number;
    hr: number;
    totalInterviews: number;
    lastInterviewDate: Date;
  };
  employerNotes: string;
  rejectionReason: string;
  appliedAt: Date;
  statusUpdatedAt: Date;
}

// Interview Types
export interface InterviewSession {
  _id: string;
  userId: string;
  type: 'technical' | 'behavioral' | 'hr' | 'problem-solving';
  status: 'in-progress' | 'completed' | 'abandoned';
  questions: {
    questionId: string;
    question: string;
    answer: string;
    score: number;
    feedback: string;
    timeSpent: number;
  }[];
  overallScore: number;
  feedback: string;
  duration: number;
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

// Invitation Types
export interface Invitation {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salaryRange: {
      min: number;
      max: number;
    };
  };
  employerId: {
    _id: string;
    name: string;
    company: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message: string;
  employeeResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Stats
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
