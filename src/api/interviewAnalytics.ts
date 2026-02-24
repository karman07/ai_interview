import http from "./http";

export interface InterviewSession {
  sessionId: string;
  round: 'technical' | 'behavioral' | 'problem-solving' | 'hr';
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  role?: string;
  company?: string;
  metrics: {
    overallScore: number;
    totalDuration: number;
    questionsAnswered: number;
  };
  startedAt: string;
  completedAt?: string;
}

export interface RoundStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  bestScore: number;
  improvementTrend: number;
}

export interface Analytics {
  userId: string;
  technical: RoundStats;
  behavioral: RoundStats;
  problemSolving: RoundStats;
  hr: RoundStats;
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
  };
  monthlyProgress: Array<{
    month: string;
    sessionsCount: number;
    averageScore: number;
    timeSpent: number;
  }>;
}

export interface DashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  recentSessions: Array<{
    id: string;
    round: string;
    score: number;
    date: string;
    status: string;
  }>;
  roundStats: {
    [key: string]: {
      averageScore: number;
      totalSessions: number;
      bestScore: number;
    };
  };
  externalAnalytics?: any[]; // The new array of payloads saved from the external AI backend
}

export const InterviewAnalyticsApi = {
  async getMySessions(params?: { round?: string; limit?: number; offset?: number }): Promise<InterviewSession[]> {
    const { data } = await http.get('/interviews/my-sessions', { params });
    return data;
  },

  async getAnalytics(): Promise<Analytics> {
    const { data } = await http.get('/interviews/analytics');
    return data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await http.get('/interviews/dashboard-stats');
    return data;
  },

  async getMonthlyProgress() {
    const { data } = await http.get('/interviews/monthly-progress');
    return data;
  },

  async getRoundComparison() {
    const { data } = await http.get('/interviews/round-comparison');
    return data;
  },

  async getPerformanceInsights() {
    const { data } = await http.get('/interviews/performance-insights');
    return data;
  },

  async getBestSessions(params?: { round?: string; limit?: number }) {
    const { data } = await http.get('/interviews/best-sessions', { params });
    return data;
  },

  async getStatistics() {
    const { data } = await http.get('/interviews/statistics');
    return data;
  },

  async getSessionDetails(sessionId: string) {
    const { data } = await http.get(`/interviews/session/${sessionId}`);
    return data;
  }
};
