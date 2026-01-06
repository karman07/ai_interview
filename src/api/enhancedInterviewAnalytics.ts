import http from "./http";

export interface SessionQuestion {
  _id: string;
  questionText: string;
  answerText: string;
  audioAnalysis?: {
    transcription: string;
    speechClarity: number;
    paceScore: number;
    confidenceLevel: number;
    duration: number;
    pauseCount: number;
    fillerWords: number;
  };
  scores: {
    overall: number;
    relevance: number;
    depth: number;
    structure: number;
    examples: number;
    technical?: number;
    fluency: number;
    clarity: number;
    confidence: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  responseTime: number;
  questionAskedAt: string;
  answerSubmittedAt: string;
}

export interface SessionDetail {
  sessionId: string;
  userId: string;
  roundType: string;
  status: string;
  jobContext: {
    roleTitle: string;
    companyName: string;
    industry: string;
  };
  questions: SessionQuestion[];
  scores: {
    overall: number;
    communication: number;
    technical: number;
    behavioral: number;
  };
  metrics: {
    totalQuestions: number;
    answeredQuestions: number;
    averageResponseTime: number;
    totalDuration: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  createdAt: string;
  completedAt?: string;
}

export interface SessionListItem {
  sessionId: string;
  roundType: string;
  status: string;
  jobContext: {
    roleTitle: string;
    companyName: string;
    industry: string;
  };
  scores: {
    overall: number;
    communication: number;
    technical: number;
    behavioral: number;
    confidence: number;
  };
  metrics: {
    totalQuestions: number;
    answeredQuestions: number;
    averageResponseTime: number;
    totalDuration: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface EnhancedAnalytics {
  analytics: {
    technical: {
      totalSessions: number;
      completedSessions: number;
      averageScore: number;
      bestScore: number;
      latestScore: number;
      improvementTrend: number;
      totalTimeSpent: number;
      averageResponseTime: number;
    };
    behavioral: {
      totalSessions: number;
      completedSessions: number;
      averageScore: number;
      bestScore: number;
      improvementTrend: number;
    };
    problemSolving: {
      totalSessions: number;
      completedSessions: number;
      averageScore: number;
      bestScore: number;
      improvementTrend: number;
    };
    hr: {
      totalSessions: number;
      completedSessions: number;
      averageScore: number;
      bestScore: number;
      improvementTrend: number;
    };
    overall: {
      totalInterviews: number;
      completedInterviews: number;
      overallAverageScore: number;
      bestOverallScore: number;
      totalTimeSpent: number;
      currentStreak: number;
      strengths: string[];
      areasForImprovement: string[];
    };
    monthlyProgress: Array<{
      month: string;
      sessionsCount: number;
      averageScore: number;
      timeSpent: number;
    }>;
  };
  recentSessions: Array<{
    sessionId: string;
    roundType: string;
    scores: { overall: number };
    jobContext: {
      roleTitle: string;
      companyName: string;
    };
    createdAt: string;
  }>;
  summary: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
    currentStreak: number;
  };
}

export const EnhancedInterviewApi = {
  async getAnalytics(): Promise<EnhancedAnalytics> {
    const { data } = await http.get('/enhanced-interview/analytics');
    return data;
  },

  async getSessions(page = 1, limit = 10): Promise<{
    sessions: SessionListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { data } = await http.get('/enhanced-interview/sessions', {
      params: { page, limit }
    });
    return data;
  },

  async getSessionDetail(sessionId: string): Promise<SessionDetail> {
    const { data } = await http.get(`/enhanced-interview/session/${sessionId}`);
    return data;
  }
};
