// Analytics Types and DTOs

export interface AnalyticsStatsDto {
  startDate: string;
  endDate: string;
  uniqueVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  newVisitors: number;
  returningVisitors: number;
  pagesPerSession: number;
}

export interface TopPagesDto {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

export interface RealTimeStatsDto {
  activeUsers: number;
  pageViewsLastHour: number;
  newSessionsLastHour: number;
  topActivePages: TopPagesDto[];
  trafficSources: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

export interface TimeSeriesDataDto {
  timestamp: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
}

export interface AnalyticsDashboardDto {
  stats: AnalyticsStatsDto;
  realTime: RealTimeStatsDto;
  topPages: TopPagesDto[];
  timeSeries: TimeSeriesDataDto[];
}

export enum PageViewType {
  PAGE = 'page',
  EVENT = 'event',
  SCREEN = 'screen',
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

export interface TrackPageViewDto {
  visitorId: string;
  sessionId: string;
  url: string;
  path: string;
  title?: string;
  type?: PageViewType;
  timeSpent?: number;
  scrollDepth?: number;
  clicks?: number;
  loadTime?: number;
  previousPage?: string;
  device: DeviceType;
  browser?: string;
  operatingSystem?: string;
  screenResolution?: string;
  viewportSize?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  city?: string;
  isBounce?: boolean;
  isExit?: boolean;
  isEntry?: boolean;
  customEvents?: any[];
  metadata?: Record<string, any>;
}

export interface TrackVisitorDto {
  visitorId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  operatingSystem?: string;
  device?: string;
  country?: string;
  city?: string;
  timezone?: string;
  language?: string;
  screenResolution?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userId?: string;
  isReturning?: boolean;
  metadata?: Record<string, any>;
}

export interface StartSessionDto {
  visitorId: string;
  sessionId: string;
  entryPage: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface EndSessionDto {
  sessionId: string;
  exitPage: string;
  duration: number;
  pageViews: number;
  interactions?: number;
}

export interface UserVisitorDto {
  visitorId: string;
  sessionId: string;
  isReturning: boolean;
  sessionCount: number;
  firstVisit: Date;
  lastVisit: Date;
  country?: string;
  device?: string;
  userAgent?: string;
  totalTimeSpent: number;
  totalPageViews: number;
}

export interface UserVisitorsResponseDto {
  success: boolean;
  data: {
    visitors: UserVisitorDto[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export interface UserVisitorStatsDto {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  totalSessions: number;
  averageSessionsPerVisitor: number;
  totalTimeSpent: number;
  averageTimePerVisitor: number;
}

export interface UserVisitorStatsResponseDto {
  success: boolean;
  data: UserVisitorStatsDto;
}

export interface AnalyticsApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface TrackVisitorResponse {
  visitorId: string;
  sessionId: string;
  isReturning: boolean;
  sessionCount: number;
}

export interface StartSessionResponse {
  sessionId: string;
  startTime: string;
  entryPage: string;
}

export interface EndSessionResponse {
  sessionId: string;
  duration: number;
  pageViews: number;
  endTime: string;
}

export interface TrackPageViewResponse {
  path: string;
  timestamp: string;
  sessionId: string;
}

export interface UpdateTimeSpentResponse {
  sessionId: string;
  path: string;
  timeSpent: number;
}

// New WebSocket connection management DTOs
export interface ConnectDto {
  visitorId: string;
  sessionId: string;
  userId?: string;
  country?: string;
  device?: string;
}

export interface ConnectResponse {
  sessionId: string;
  visitorId: string;
  connected: boolean;
  timestamp: string;
}

export interface HeartbeatDto {
  sessionId: string;
}

export interface HeartbeatResponse {
  sessionId: string;
  lastActivity: string;
  isActive: boolean;
}

export interface DisconnectDto {
  sessionId: string;
  exitPage?: string;
}

export interface DisconnectResponse {
  sessionId: string;
  duration: number;
  disconnected: boolean;
  timestamp: string;
}

// Enhanced session DTOs
export interface SessionDto {
  sessionId: string;
  visitorId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  entryPage: string;
  exitPage?: string;
  pageViews: number;
  interactions?: number;
  isActive: boolean;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  device?: string;
}

export interface SessionsResponseDto {
  success: boolean;
  data: {
    sessions: SessionDto[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export interface SessionPageViewDto {
  pageViewId: string;
  sessionId: string;
  path: string;
  title?: string;
  timestamp: string;
  timeSpent?: number;
  scrollDepth?: number;
  clicks?: number;
  isEntry: boolean;
  isExit: boolean;
  isBounce: boolean;
}

export interface SessionPageViewsResponseDto {
  success: boolean;
  data: {
    pageViews: SessionPageViewDto[];
    sessionInfo: {
      sessionId: string;
      totalPageViews: number;
      totalTimeSpent: number;
    };
  };
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  uptime?: number;
  checks?: {
    database: 'healthy' | 'unhealthy';
    redis?: 'healthy' | 'unhealthy';
    websocket?: 'healthy' | 'unhealthy';
  };
}