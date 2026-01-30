import http from "./http";

// Dashboard Summary
export interface DashboardSummary {
  userId: string;
  summary: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    totalQuestionsAnswered: number;
    lastInterviewDate: string;
  };
  roundBreakdown: Array<{
    roundType: string;
    count: number;
    averageScore: number;
    lastAttempted: string;
  }>;
  performanceTrend: {
    technical: number[];
    behavioral: number[];
    hr: number[];
    "problem-solving": number[];
  };
  topSkills: Array<{
    skill: string;
    score: number;
  }>;
  recentInterviews: Array<{
    sessionId: string;
    roundType: string;
    companyName: string;
    roleTitle: string;
    totalQuestions: number;
    overallScore: number;
    completedAt: string;
  }>;
}

// Interview History
export interface InterviewHistoryItem {
  sessionId: string;
  userId: string;
  roundType: string;
  totalQuestions: number;
  scores: {
    overall: number;
    technical: number;
    clarity: number;
    confidence: number;
    communication: number;
  };
  roleTitle: string;
  companyName: string;
  industry: string;
  completedAt: string;
}

export interface InterviewHistoryResponse {
  data: InterviewHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Session Details
export interface SessionQuestion {
  questionNumber: number;
  question: string;
  answer: string;
  totalScore: number;
  technicalDepth: number;
  clarity: number;
  feedback: string;
  suggestions: string[];
}

export interface SessionDetail {
  sessionId: string;
  userId: string;
  roundType: string;
  totalQuestions: number;
  scores: {
    overall: number;
    technical: number;
    clarity: number;
    confidence: number;
    communication: number;
  };
  voiceMetrics: {
    avgClarity: number;
    avgConfidence: number;
    avgPace: number;
  };
  questions: SessionQuestion[];
  roleTitle: string;
  companyName: string;
  industry: string;
}

// Voice Analytics
export interface VoiceAnalysis {
  questionNumber: number;
  question: string;
  audioAnalysis: {
    speechClarity: number;
    confidenceLevel: number;
    paceScore: number;
    transcription: string;
  };
  communicationScore: number;
}

export interface VoiceAnalyticsResponse {
  sessionId: string;
  roundType: string;
  totalQuestions: number;
  overallVoiceMetrics: {
    avgSpeechClarity: number;
    avgConfidenceLevel: number;
    avgPaceScore: number;
    avgCommunicationScore: number;
  };
  questionWiseAnalysis: VoiceAnalysis[];
  insights: {
    strengthAreas: string[];
    improvementAreas: string[];
    trend: string;
  };
}

// Performance Stats
export interface PerformanceStats {
  userId: string;
  timeRange: {
    days: number;
    from: string;
    to: string;
  };
  overallStats: {
    totalInterviews: number;
    totalQuestions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    scoreImprovement: number;
  };
  roundWisePerformance: {
    [key: string]: {
      attempts: number;
      averageScore: number;
      averageTechnicalDepth: number;
      averageClarity: number;
      trend: string;
      scoreProgression: number[];
    };
  };
  skillAnalysis: {
    [key: string]: {
      average: number;
      trend: string;
      topPerformance: number;
      needsImprovement: boolean;
    };
  };
  timeBasedInsights: {
    mostProductiveDay: string;
    mostProductiveTime: string;
    interviewsThisWeek: number;
    interviewsLastWeek: number;
  };
  recommendations: string[];
}

// Company Analytics
export interface CompanyAnalytics {
  userId: string;
  companies: Array<{
    companyName: string;
    totalInterviews: number;
    rounds: {
      technical: number;
      behavioral: number;
      hr: number;
      "problem-solving": number;
    };
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    rolesTested: string[];
    lastInterviewDate: string;
    trend: string;
  }>;
  summary: {
    totalCompanies: number;
    bestPerformingCompany: string;
    mostInterviewedCompany: string;
    averageScoreAcrossAll: number;
  };
}

// Role Analytics
export interface RoleAnalytics {
  userId: string;
  roles: Array<{
    roleTitle: string;
    totalInterviews: number;
    companies: string[];
    rounds: {
      technical: number;
      behavioral: number;
      hr: number;
      "problem-solving": number;
    };
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    lastInterviewDate: string;
    skillsEvaluated: {
      technicalDepth: number;
      clarity: number;
      confidence: number;
      communication: number;
    };
  }>;
  summary: {
    totalRoles: number;
    bestPerformingRole: string;
    mostInterviewedRole: string;
    averageScoreAcrossAll: number;
  };
}

export const interviewResultsAPI = {
  // Get dashboard analytics
  getDashboard: async (): Promise<DashboardSummary> => {
    const response = await http.get("/interview-results/dashboard");
    return response.data;
  },

  // Get interview history with pagination
  getHistory: async (
    page = 1,
    limit = 10,
    roundType?: string
  ): Promise<InterviewHistoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (roundType) params.append("roundType", roundType);

    const response = await http.get(`/interview-results/history?${params}`);
    return response.data;
  },

  // Get session details with all questions
  getSessionDetails: async (sessionId: string): Promise<SessionDetail> => {
    const response = await http.get(`/interview-results/session/${sessionId}`);
    return response.data;
  },

  // Get only questions for a session
  getSessionQuestions: async (sessionId: string) => {
    const response = await http.get(`/interview-results/session/${sessionId}/questions`);
    return response.data;
  },

  // Get voice analytics for a session
  getVoiceAnalytics: async (sessionId: string): Promise<VoiceAnalyticsResponse> => {
    const response = await http.get(`/interview-results/session/${sessionId}/voice-analytics`);
    return response.data;
  },

  // Get performance statistics
  getPerformanceStats: async (days = 30, roundType?: string): Promise<PerformanceStats> => {
    const params = new URLSearchParams({ days: days.toString() });
    if (roundType) params.append("roundType", roundType);

    const response = await http.get(`/interview-results/stats/performance?${params}`);
    return response.data;
  },

  // Get company-wise analytics
  getCompanyAnalytics: async (): Promise<CompanyAnalytics> => {
    const response = await http.get("/interview-results/stats/by-company");
    return response.data;
  },

  // Get role-wise analytics
  getRoleAnalytics: async (): Promise<RoleAnalytics> => {
    const response = await http.get("/interview-results/stats/by-role");
    return response.data;
  },

  // Delete a session
  deleteSession: async (sessionId: string) => {
    const response = await http.delete(`/interview-results/session/${sessionId}`);
    return response.data;
  },
};
