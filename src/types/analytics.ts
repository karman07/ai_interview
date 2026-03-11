// Analytics Types and DTOs per Documentation

export interface TrackVisitorDto {
  visitorId: string;
  userId?: string;
  userAgent: string;
  country: string;
  device: string;
  isAdmin: boolean;
}

export interface StartSessionDto {
  sessionId: string;
  visitorId: string;
  userId?: string;
  landingPage: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  device?: string;
}

export interface TrackPageViewDto {
  sessionId: string;
  visitorId: string;
  userId?: string;
  path: string;
  title: string;
  timeOnPage?: number;
  scrollDepth?: number;
}

export interface HeartbeatDto {
  sessionId: string;
  visitorId: string;
  path: string;
}

// Admin Analytics Types
export interface DashboardStatsResponse {
  overview: {
    totalUsers: number;
    totalRevenueINR: number;
    totalInterviews: number;
    totalResumes: number;
  };
  growth: {
    newSignupsLast7Days: number;
    conversionRate: number;
  };
  activityChart: Array<{
    date: string;
    sessions: number;
  }>;
  metrics: {
    userRoleDistribution: Record<string, number>;
    popularTopics: string[];
    trafficSources: Record<string, number>;
  };
}

export interface AnalyticsSummary {
  totalVisitors: number;
  activeSessions: number;
  avgTimeOnSite: number;
  bounceRate: number;
}

// Response Types
export interface AnalyticsApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

// WebSocket types
export interface WebSocketConnectParams {
  visitorId: string;
  sessionId: string;
  userId?: string;
  userAgent: string;
  country: string;
  device: string;
  isAdmin: boolean;
}