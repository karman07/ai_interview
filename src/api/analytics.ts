import http from "./http";
import type {
  TrackVisitorDto,
  StartSessionDto,
  TrackPageViewDto,
  HeartbeatDto,
  AnalyticsApiResponse,
  AnalyticsSummary,
} from "@/types/analytics";

export class AnalyticsApi {
  private static readonly BASE_URL = "/analytics";

  /**
   * Initializes or updates a persistent visitor profile.
   */
  static async trackVisitor(data: TrackVisitorDto): Promise<AnalyticsApiResponse> {
    try {
      const response = await http.post(`${this.BASE_URL}/visitors`, data);
      return response.data;
    } catch (error) {
      console.error("📊 Analytics: Error tracking visitor:", error);
      throw error;
    }
  }

  /**
   * Starts a new browsing session for a visitor.
   */
  static async startSession(data: StartSessionDto): Promise<AnalyticsApiResponse> {
    try {
      const response = await http.post(`${this.BASE_URL}/sessions/start`, data);
      return response.data;
    } catch (error) {
      console.error("📊 Analytics: Error starting session:", error);
      throw error;
    }
  }

  /**
   * Logs every page the user visits.
   */
  static async trackPageView(data: TrackPageViewDto): Promise<AnalyticsApiResponse> {
    try {
      const response = await http.post(`${this.BASE_URL}/pageviews`, data);
      return response.data;
    } catch (error) {
      console.error("📊 Analytics: Error tracking page view:", error);
      throw error;
    }
  }

  /**
   * Maintains the session's active status.
   */
  static async heartbeat(data: HeartbeatDto): Promise<AnalyticsApiResponse> {
    try {
      const response = await http.post(`${this.BASE_URL}/heartbeat`, data);
      return response.data;
    } catch (error) {
      console.error("📊 Analytics: Error sending heartbeat:", error);
      throw error;
    }
  }

  /**
   * Quick stats summary (Admin Only).
   */
  static async getSummary(): Promise<AnalyticsApiResponse<AnalyticsSummary>> {
    try {
      const response = await http.get(`${this.BASE_URL}/summary`);
      return response.data;
    } catch (error) {
      console.error("📊 Analytics: Error fetching summary:", error);
      throw error;
    }
  }
}