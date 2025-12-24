# Frontend Integration Guide - Schema & Response Changes

## Overview
Complete guide for frontend developers covering all schema changes, API response modifications, and new endpoints for the enhanced AI Interview and Job Management system.

---

## 🔄 **API Response Changes for Frontend**

### 1. **Enhanced Interview Analytics**

#### **NEW: GET /interviews/dashboard-stats**
```typescript
interface InterviewDashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // in seconds
  recentSessions: Array<{
    id: string;
    round: 'technical' | 'behavioral' | 'problem-solving' | 'hr';
    score: number;
    date: string; // ISO date
    status: 'completed' | 'active' | 'abandoned';
  }>;
  roundStats: {
    technical: RoundStats;
    behavioral: RoundStats;
    problemSolving: RoundStats;
    hr: RoundStats;
  };
}

interface RoundStats {
  averageScore: number;
  totalSessions: number;
  bestScore: number;
}
```

#### **NEW: GET /interviews/analytics**
```typescript
interface UserAnalytics {
  userId: string;
  technical: DetailedRoundStats;
  behavioral: DetailedRoundStats;
  problemSolving: DetailedRoundStats;
  hr: DetailedRoundStats;
  overall: {
    totalInterviews: number;
    completedInterviews: number;
    overallAverageScore: number;
    bestOverallScore: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number;
    strengths: string[];
    areasForImprovement: string[];
    lastInterviewDate?: string;
  };
  monthlyProgress: Array<{
    month: string; // YYYY-MM format
    sessionsCount: number;
    averageScore: number;
    timeSpent: number;
  }>;
}

interface DetailedRoundStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  bestScore: number;
  improvementTrend: number; // positive = improving
  lastAttemptDate?: string;
}
```

#### **NEW: GET /interviews/performance-insights**
```typescript
interface PerformanceInsights {
  analytics: {
    overall: {
      totalInterviews: number;
      averageScore: number;
      improvementTrend: number;
    };
    recentPerformance: Array<{
      sessionId: string;
      score: number;
      round: string;
      date: string;
    }>;
  };
  insights: string[]; // AI-generated insights
  recommendations: string[]; // Improvement suggestions
  nextGoals: string[]; // Achievement goals
}
```

#### **NEW: GET /interviews/leaderboard**
```typescript
interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  totalInterviews: number;
  round: string;
  rank: number;
}

type Leaderboard = LeaderboardEntry[];
```

---

### 2. **Enhanced Job Management Responses**

#### **ENHANCED: GET /jobs/:jobId/best-candidates**
**OLD Response:**
```json
[
  {
    "user_id": "68edfb398df3bfece0f3daf5",
    "resume_id": "6949420a8ead30e52572f149",
    "resume_filename": "7d34e94dd82fa18bb07a8aa6c257bab0",
    "match_score": 50,
    "strengths": ["General programming experience"],
    "weaknesses": ["No specific weaknesses identified"]
  }
]
```

**NEW Response:**
```typescript
interface EnhancedCandidate {
  // AI Matcher Data
  userId: string;
  resumeId: string;
  resumeFilename: string;
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  
  // Complete User Profile
  userProfile: {
    id: string;
    name: string;
    email: string;
    role: 'employee' | 'employer';
    company?: string;
    industry?: string;
    jobDescription?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
  
  // Resume Details
  resumeDetails: {
    resumeId: string;
    resumeFilename: string;
    resumeUrl?: string;
    uploadedAt: string;
  };
  
  // Interview Performance
  interviewScores: {
    overall: number;
    technical: number;
    behavioral: number;
    problemSolving: number;
    hr: number;
    totalInterviews: number;
    lastInterviewDate?: string;
    currentStreak: number;
    averageScore: number;
    completedInterviews: number;
    totalTimeSpent: number;
  };
  
  // Application Status
  applicationStatus?: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    employerNotes?: string;
  };
  
  // Computed Fields
  hasApplied: boolean;
  overallRating: number; // Weighted: 60% AI match + 40% interview
  fetchedAt: string;
}
```

#### **NEW: GET /jobs/enhanced/dashboard-stats**
```typescript
interface EmployerDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  recentJobs: Array<{
    id: string;
    title: string;
    location: string;
    postedAt: string;
    isActive: boolean;
    applicationCount?: number;
    pendingApplications?: number;
  }>;
}
```

#### **ENHANCED: GET /jobs/enhanced/:jobId/applications**
```typescript
interface EnhancedJobApplication {
  _id: string;
  jobId: string;
  applicantId: {
    _id: string;
    name: string;
    email: string;
    profile?: any;
  };
  employerId: string;
  status: ApplicationStatus;
  
  // NEW: AI Matching Scores
  aiMatchingScore?: {
    overallMatch: number; // 0-100
    skillsMatch: number;
    experienceMatch: number;
    matchingKeywords: string[];
    missingSkills: string[];
    aiRecommendation: string;
  };
  
  // NEW: Interview Performance
  interviewScores?: {
    overall: number; // 0-10
    technical: number;
    behavioral: number;
    problemSolving: number;
    hr: number;
    bestSessionId?: string;
    totalInterviews: number;
    lastInterviewDate?: string;
  };
  
  // Application Data
  resumeUrl?: string;
  coverLetter?: string;
  employerNotes?: string;
  rejectionReason?: string;
  
  // Timeline
  appliedAt: string;
  reviewedAt?: string;
  interviewScheduledAt?: string;
  statusUpdatedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  HIRED = 'hired'
}
```

#### **NEW: GET /jobs/enhanced/:jobId/analytics**
```typescript
interface JobAnalytics {
  totalApplications: number;
  statusBreakdown: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  };
  averageAIMatch: number;
  averageInterviewScore: number;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  applicationTrend: Array<{
    date: string; // YYYY-MM-DD
    count: number;
  }>;
  scoreDistribution: {
    aiMatch: Array<{
      range: string; // e.g., "90-100"
      count: number;
    }>;
    interview: Array<{
      range: string; // e.g., "8-10"
      count: number;
    }>;
  };
}
```

---

### 3. **Enhanced Job Schema for Frontend**

#### **ENHANCED: Job Object**
```typescript
interface EnhancedJob {
  _id: string;
  title: string;
  description: string;
  
  // NEW FIELDS
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits: string[];
  companyInfo?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  
  // Existing fields
  requirements: string[];
  salary: number;
  location: string;
  employerId: string;
  isActive: boolean;
  
  // NEW TIMESTAMPS
  postedAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields (for frontend)
  applicationCount?: number;
  viewCount?: number;
  avgAIMatch?: number;
  pendingApplications?: number;
}
```

---

### 4. **Interview Session Schema for Frontend**

#### **NEW: Interview Session Object**
```typescript
interface InterviewSession {
  sessionId: string;
  userId: string;
  round: 'technical' | 'behavioral' | 'problem-solving' | 'hr';
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  
  // Job Context
  role?: string;
  company?: string;
  jobDescription?: string;
  experience?: string;
  industry?: string;
  
  // Questions & Answers
  questionsAnswers: Array<{
    question: string;
    answer?: string;
    audioUrl?: string;
    videoUrl?: string;
    responseDuration?: number; // seconds
    feedback?: string;
    score?: number; // 0-10
    answeredAt?: string;
  }>;
  
  // Session Metrics
  metrics: {
    totalQuestions: number;
    answeredQuestions: number;
    averageResponseTime: number; // seconds
    totalDuration: number; // seconds
    overallScore: number; // 0-10
    communicationScore: number;
    technicalScore: number;
    problemSolvingScore: number;
    behavioralScore: number;
  };
  
  // Timing
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // AI Integration
  aiSessionId?: string;
  finalReport?: {
    overall_score: number;
    communication_score?: number;
    behavioral_score?: number;
    technical_score?: number;
    problem_solving_score?: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}
```

---

## 🆕 **New API Endpoints for Frontend**

### **Interview System**
```typescript
// Dashboard & Analytics
GET /interviews/dashboard-stats → InterviewDashboardStats
GET /interviews/analytics → UserAnalytics
GET /interviews/performance-insights → PerformanceInsights
GET /interviews/monthly-progress → { monthlyProgress: MonthlyProgress[] }
GET /interviews/round-comparison → RoundComparison
GET /interviews/leaderboard?round=technical&limit=10 → Leaderboard

// Session Management
GET /interviews/my-sessions?round=technical&limit=20&offset=0 → InterviewSession[]
GET /interviews/session/:sessionId → InterviewSession
POST /interviews/start → InterviewSession
POST /interviews/:sessionId/complete → InterviewSession
```

### **Enhanced Job Management**
```typescript
// Job CRUD
POST /jobs/enhanced → EnhancedJob
PUT /jobs/enhanced/:jobId → EnhancedJob
DELETE /jobs/enhanced/:jobId → { message: string }
GET /jobs/enhanced/my-jobs?isActive=true → EnhancedJob[]

// Application Management
GET /jobs/enhanced/:jobId/applications → EnhancedJobApplication[]
GET /jobs/enhanced/:jobId/top-candidates?limit=10 → EnhancedCandidate[]
PUT /jobs/enhanced/applications/:id/status → EnhancedJobApplication
POST /jobs/enhanced/bulk-update-status → BulkUpdateResult

// Analytics
GET /jobs/enhanced/:jobId/analytics → JobAnalytics
GET /jobs/enhanced/dashboard-stats → EmployerDashboardStats
```

---

## 🎨 **Frontend Component Data Requirements**

### **Interview Dashboard Components**
```typescript
// Dashboard Stats Cards
interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: string;
  color: string;
  clickable?: boolean;
  onClick?: () => void;
}

// Performance Chart Data
interface ChartData {
  monthlyProgress: Array<{
    month: string;
    sessionsCount: number;
    averageScore: number;
    timeSpent: number;
  }>;
}

// Round Comparison Radar Chart
interface RadarChartData {
  technical: number;
  behavioral: number;
  problemSolving: number;
  hr: number;
}
```

### **Job Management Components**
```typescript
// Job Card Component
interface JobCardProps {
  job: EnhancedJob;
  onEdit: (jobId: string) => void;
  onToggle: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onViewApplications: (jobId: string) => void;
}

// Application Card Component
interface ApplicationCardProps {
  application: EnhancedJobApplication;
  onSelect: (applicationId: string) => void;
  onViewProfile: (candidateId: string) => void;
  onUpdateStatus: (applicationId: string, status: ApplicationStatus) => void;
  onAddNotes: (applicationId: string) => void;
}

// Candidate Card Component
interface CandidateCardProps {
  candidate: EnhancedCandidate;
  onViewProfile: (candidateId: string) => void;
  onShortlist: (candidateId: string) => void;
  onContact: (candidateId: string) => void;
}
```

---

## 🔄 **State Management Updates**

### **Redux/Context State Structure**
```typescript
interface AppState {
  // Interview State
  interviews: {
    dashboardStats: InterviewDashboardStats | null;
    analytics: UserAnalytics | null;
    sessions: InterviewSession[];
    currentSession: InterviewSession | null;
    leaderboard: Leaderboard;
    insights: PerformanceInsights | null;
    loading: boolean;
    error: string | null;
  };
  
  // Job Management State
  jobs: {
    myJobs: EnhancedJob[];
    currentJob: EnhancedJob | null;
    applications: EnhancedJobApplication[];
    candidates: EnhancedCandidate[];
    analytics: JobAnalytics | null;
    dashboardStats: EmployerDashboardStats | null;
    loading: boolean;
    error: string | null;
  };
  
  // UI State
  ui: {
    selectedApplications: string[];
    filters: {
      jobType?: string;
      experienceLevel?: string;
      applicationStatus?: ApplicationStatus;
    };
    modals: {
      bulkActions: boolean;
      jobForm: boolean;
      candidateProfile: boolean;
    };
  };
}
```

---

## 📱 **API Integration Examples**

### **Fetching Interview Analytics**
```typescript
// Dashboard Stats
const fetchDashboardStats = async (): Promise<InterviewDashboardStats> => {
  const response = await api.get('/interviews/dashboard-stats');
  return response.data;
};

// User Analytics
const fetchUserAnalytics = async (): Promise<UserAnalytics> => {
  const response = await api.get('/interviews/analytics');
  return response.data;
};

// Performance Insights
const fetchInsights = async (): Promise<PerformanceInsights> => {
  const response = await api.get('/interviews/performance-insights');
  return response.data;
};
```

### **Job Management API Calls**
```typescript
// Get Enhanced Candidates
const fetchBestCandidates = async (jobId: string): Promise<EnhancedCandidate[]> => {
  const response = await api.get(`/jobs/${jobId}/best-candidates`);
  return response.data;
};

// Get Job Applications with AI Scores
const fetchJobApplications = async (jobId: string): Promise<EnhancedJobApplication[]> => {
  const response = await api.get(`/jobs/enhanced/${jobId}/applications`);
  return response.data;
};

// Update Application Status
const updateApplicationStatus = async (
  applicationId: string, 
  status: ApplicationStatus,
  notes?: string
): Promise<EnhancedJobApplication> => {
  const response = await api.put(`/jobs/enhanced/applications/${applicationId}/status`, {
    status,
    notes
  });
  return response.data;
};
```

---

## 🎯 **Key Frontend Integration Points**

### **1. Enhanced Data Display**
- **AI Match Scores**: Display 0-100% compatibility scores
- **Interview Performance**: Show 0-10 scores across all rounds
- **Comprehensive Profiles**: Full user data with resume details
- **Application Timeline**: Complete status tracking

### **2. Real-time Updates**
- **WebSocket Integration**: Live interview session updates
- **Analytics Refresh**: Real-time performance metrics
- **Status Changes**: Live application status updates

### **3. Advanced Filtering & Sorting**
- **Multi-criteria Sorting**: AI match + interview performance
- **Advanced Filters**: Skills, experience, interview scores
- **Bulk Operations**: Multi-selection and batch updates

### **4. Rich Visualizations**
- **Performance Charts**: Line charts, radar charts, histograms
- **Progress Tracking**: Monthly trends and improvements
- **Score Distributions**: Visual score breakdowns

This comprehensive guide provides all the schema changes, API response modifications, and integration requirements needed for frontend development of the enhanced AI Interview and Job Management system.