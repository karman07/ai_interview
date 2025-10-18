import http from "./http";
import type {
  TrackVisitorDto,
  StartSessionDto,
  EndSessionDto,
  TrackPageViewDto,
  AnalyticsStatsDto,
  TopPagesDto,
  RealTimeStatsDto,
  TimeSeriesDataDto,
  AnalyticsDashboardDto,
  UserVisitorsResponseDto,
  UserVisitorStatsResponseDto,
  AnalyticsApiResponse,
  TrackVisitorResponse,
  StartSessionResponse,
  EndSessionResponse,
  TrackPageViewResponse,
  UpdateTimeSpentResponse,
  ConnectDto,
  ConnectResponse,
  HeartbeatDto,
  HeartbeatResponse,
  DisconnectDto,
  DisconnectResponse,
  SessionDto,
  SessionsResponseDto,
  SessionPageViewsResponseDto,
  HealthCheckResponse,
} from "@/types/analytics";

export class AnalyticsApi {
  private static readonly BASE_URL = "/analytics";

  // ===== WebSocket Connection Management APIs =====
  
  // Connect (register a client)
  static async connect(data: ConnectDto): Promise<AnalyticsApiResponse<ConnectResponse>> {
    const response = await http.post(`${this.BASE_URL}/connect`, data);
    return response.data;
  }

  // Heartbeat (keep session alive)
  static async heartbeat(data: HeartbeatDto): Promise<AnalyticsApiResponse<HeartbeatResponse>> {
    const response = await http.post(`${this.BASE_URL}/heartbeat`, data);
    return response.data;
  }

  // Disconnect (end session via HTTP)
  static async disconnect(data: DisconnectDto): Promise<AnalyticsApiResponse<DisconnectResponse>> {
    const response = await http.post(`${this.BASE_URL}/disconnect`, data);
    return response.data;
  }

  // ===== Visitor & Session Lifecycle APIs =====

  // Track visitor
  static async trackVisitor(data: TrackVisitorDto): Promise<AnalyticsApiResponse<TrackVisitorResponse>> {
    const response = await http.post(`${this.BASE_URL}/visitors`, data);
    return response.data;
  }

  // Start session
  static async startSession(data: StartSessionDto): Promise<AnalyticsApiResponse<StartSessionResponse>> {
    const response = await http.post(`${this.BASE_URL}/sessions/start`, data);
    return response.data;
  }

  // End session
  static async endSession(data: EndSessionDto): Promise<AnalyticsApiResponse<EndSessionResponse>> {
    const response = await http.post(`${this.BASE_URL}/sessions/end`, data);
    return response.data;
  }

  // ===== Read Endpoints (require JWT) =====

  // Get session by ID
  static async getSessionById(sessionId: string): Promise<AnalyticsApiResponse<SessionDto>> {
    const response = await http.get(`${this.BASE_URL}/sessions/${sessionId}`);
    return response.data;
  }

  // List sessions for current user (limit & offset optional)
  static async getSessions(
    limit: number = 20,
    offset: number = 0
  ): Promise<SessionsResponseDto> {
    const response = await http.get(`${this.BASE_URL}/sessions`, {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
    return response.data;
  }

  // Get pageviews for a session
  static async getSessionPageViews(sessionId: string): Promise<SessionPageViewsResponseDto> {
    const response = await http.get(`${this.BASE_URL}/sessions/${sessionId}/pageviews`);
    return response.data;
  }

  // ===== Pageviews & Time Spent APIs =====

  // Track page view
  static async trackPageView(data: TrackPageViewDto): Promise<AnalyticsApiResponse<TrackPageViewResponse>> {
    const response = await http.post(`${this.BASE_URL}/pageviews`, data);
    return response.data;
  }

  // Update time spent on page
  static async updateTimeSpent(
    sessionId: string,
    path: string,
    timeSpent: number
  ): Promise<AnalyticsApiResponse<UpdateTimeSpentResponse>> {
    const encodedPath = encodeURIComponent(path);
    const response = await http.post(
      `${this.BASE_URL}/pageviews/${sessionId}/${encodedPath}/time-spent`,
      { timeSpent }
    );
    return response.data;
  }

  // ===== Analytics Reports (require JWT) =====

  // Get stats for date range
  static async getStats(
    startDate: string,
    endDate: string
  ): Promise<AnalyticsApiResponse<AnalyticsStatsDto>> {
    const response = await http.get(`${this.BASE_URL}/stats`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // Get top pages
  static async getTopPages(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<AnalyticsApiResponse<TopPagesDto[]>> {
    const response = await http.get(`${this.BASE_URL}/pages/top`, {
      params: { startDate, endDate, limit: limit.toString() },
    });
    return response.data;
  }

  // Get real-time statistics
  static async getRealTimeStats(): Promise<AnalyticsApiResponse<RealTimeStatsDto>> {
    const response = await http.get(`${this.BASE_URL}/realtime`);
    return response.data;
  }

  // Get time series data
  static async getTimeSeriesData(
    startDate: string,
    endDate: string,
    interval: 'hour' | 'day' = 'day'
  ): Promise<AnalyticsApiResponse<TimeSeriesDataDto[]>> {
    const response = await http.get(`${this.BASE_URL}/timeseries`, {
      params: { startDate, endDate, interval },
    });
    return response.data;
  }

  // Get dashboard data
  static async getDashboard(
    startDate: string,
    endDate: string
  ): Promise<AnalyticsApiResponse<AnalyticsDashboardDto>> {
    const response = await http.get(`${this.BASE_URL}/dashboard`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // ===== Visitor Management APIs =====

  // Get visitors for current user (paginated)
  static async getUserVisitors(
    limit: number = 50,
    offset: number = 0
  ): Promise<UserVisitorsResponseDto> {
    const response = await http.get(`${this.BASE_URL}/visitors/me`, {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
    return response.data;
  }

  // Get visitor stats for current user
  static async getUserVisitorStats(): Promise<UserVisitorStatsResponseDto> {
    const response = await http.get(`${this.BASE_URL}/visitors/me/stats`);
    return response.data;
  }

  // ===== Misc APIs =====

  // Health check
  static async healthCheck(): Promise<AnalyticsApiResponse<HealthCheckResponse>> {
    const response = await http.get(`${this.BASE_URL}/health`);
    return response.data;
  }

  // Utility method to validate date format
  static isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Format date to YYYY-MM-DD
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Get date range for common periods
  static getDateRange(period: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year'): {
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          startDate: this.formatDate(today),
          endDate: this.formatDate(today),
        };
        
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: this.formatDate(yesterday),
          endDate: this.formatDate(yesterday),
        };
        
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        return {
          startDate: this.formatDate(weekStart),
          endDate: this.formatDate(today),
        };
        
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(monthStart.getDate() - 30);
        return {
          startDate: this.formatDate(monthStart),
          endDate: this.formatDate(today),
        };
        
      case 'quarter':
        const quarterStart = new Date(today);
        quarterStart.setDate(quarterStart.getDate() - 90);
        return {
          startDate: this.formatDate(quarterStart),
          endDate: this.formatDate(today),
        };
        
      case 'year':
        const yearStart = new Date(today);
        yearStart.setFullYear(yearStart.getFullYear() - 1);
        return {
          startDate: this.formatDate(yearStart),
          endDate: this.formatDate(today),
        };
        
      default:
        return {
          startDate: this.formatDate(new Date(today.setDate(today.getDate() - 7))),
          endDate: this.formatDate(new Date()),
        };
    }
  }
}