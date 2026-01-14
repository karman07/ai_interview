import http from "./http";

export interface DashboardAnalytics {
  _id: string;
  userId: string;
  recentSessions: Array<{
    session_id: string;
    role_title: string;
    company_name: string;
    status: string;
    round_type: string;
    overall_score: number;
    created_at: string;
    question_count: number;
  }>;
  technical: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    latestScore: number;
    totalTimeSpent: number;
    averageResponseTime: number;
    improvementTrend: number;
  };
  behavioral: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    latestScore: number;
    totalTimeSpent: number;
    averageResponseTime: number;
    improvementTrend: number;
  };
  problemSolving: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    latestScore: number;
    totalTimeSpent: number;
    averageResponseTime: number;
    improvementTrend: number;
  };
  hr: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    latestScore: number;
    totalTimeSpent: number;
    averageResponseTime: number;
    improvementTrend: number;
  };
  overall: {
    totalInterviews: number;
    completedInterviews: number;
    overallAverageScore: number;
    bestOverallScore: number;
    totalTimeSpent: number;
    strengths: string[];
    areasForImprovement: string[];
    currentStreak: number;
    longestStreak: number;
  };
  monthlyProgress: any[];
  createdAt: string;
  updatedAt: string;
}

export const DashboardApi = {
  async getDashboard(userId: string): Promise<DashboardAnalytics> {
    const { data } = await http.get(`/ai-interview/dashboard/${userId}`);
    return data;
  }
};
