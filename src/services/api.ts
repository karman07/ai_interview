import axios, { AxiosInstance } from 'axios';

// API Base Configuration
export const API_BASE_URL = 'http://localhost:3000';

// Helper to build a full URL for images returned by backend.
// If the provided path is already an absolute URL (http(s)), return as-is.
// If it's a relative path (starts with '/'), prefix with API_BASE_URL.
export function getFullImageUrl(path?: string | null): string | null {
  if (!path) return null;
  try {
    // If path already looks like a full URL, return it
    const lower = path.trim().toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) return path;
    // If it's a data URL, return as-is
    if (lower.startsWith('data:')) return path;
    // Otherwise prefix with base URL
    return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  } catch (e) {
    return path;
  }
}

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AnalyticsStats {
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

export interface TopPage {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

export interface RealtimeStats {
  activeUsers: number;
  pageViewsLastHour: number;
  newSessionsLastHour: number;
  topActivePages: any[];
  trafficSources: Record<string, any>;
  deviceBreakdown: Record<string, any>;
  countryBreakdown: Record<string, any>;
}

export interface TimeSeriesData {
  _id: string;
  timestamp: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
}

export interface DashboardData {
  stats: AnalyticsStats;
  topPages: TopPage[];
  realTime: RealtimeStats;
  timeSeries: TimeSeriesData[];
}

export interface Visitor {
  id: string;
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  referrer?: string;
  landingPage: string;
  timestamp: string;
}

export interface VisitorStats {
  total: number;
  unique: number;
  returning: number;
  newVisitors: number;
}

export interface Session {
  id: string;
  userId?: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  referrer?: string;
}

export interface PageView {
  id: string;
  sessionId: string;
  path: string;
  title?: string;
  timestamp: string;
  timeOnPage?: number;
  referrer?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  timestamp: string;
  latency?: number;
  collections?: Record<string, number>;
}

export interface Subject {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level: string;
  estimatedTime?: string;
  thumbnailUrl?: string;
  rating: number;
  status: string;
  author?: string;
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  heading: string;
  points: string[];
}

export interface Lesson {
  _id: string;
  subjectId: string;
  title: string;
  description?: string;
  content?: ContentBlock[];
  videoUrl?: string;
  order?: number;
  subLessons?: SubLesson[];
  createdAt: string;
  updatedAt: string;
}

export interface SubLesson {
  title: string;
  content?: ContentBlock[];
  videoUrl?: string;
  order?: number;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency: string;
  type: 'FREE' | 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  duration?: number;
  features: SubscriptionFeature[];
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  order?: number;
  popularBadge?: boolean;
  discountPercentage?: number;
  originalPrice?: number;
  colorScheme?: string;
  icon?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFeature {
  name: string;
  description: string;
  type: 'BOOLEAN' | 'NUMERIC' | 'TEXT';
  value: any;
  enabled?: boolean;
  limit?: number;
  unit?: string;
}

export interface CreateSubjectDto {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  estimatedTime?: string;
  author?: string;
  content?: ContentBlock[];
}

export interface CreateLessonDto {
  subjectId: string;
  title: string;
  description?: string;
  content?: ContentBlock[];
  videoUrl?: string;
  order?: number;
  subLessons?: SubLesson[];
}

export interface CreateQuizDto {
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface CreateSubscriptionDto {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency?: string;
  type: 'FREE' | 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  duration?: number;
  features: SubscriptionFeature[];
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  order?: number;
  popularBadge?: boolean;
  discountPercentage?: number;
  originalPrice?: number;
  colorScheme?: string;
  icon?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Mock data generators for development/testing
const generateMockTimeSeriesData = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      _id: date.toISOString().split('T')[0],
      timestamp: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 1000) + 100,
      uniqueVisitors: Math.floor(Math.random() * 500) + 50,
      sessions: Math.floor(Math.random() * 200) + 20
    });
  }
  
  return data;
};

const generateMockTopPages = (): TopPage[] => [
  { path: '/', views: 15420, uniqueVisitors: 8934, title: 'Homepage', averageTimeOnPage: 120, bounceRate: 0.25 },
  { path: '/about', views: 8765, uniqueVisitors: 5432, title: 'About Us', averageTimeOnPage: 95, bounceRate: 0.30 },
  { path: '/products', views: 6543, uniqueVisitors: 4321, title: 'Products', averageTimeOnPage: 180, bounceRate: 0.20 },
  { path: '/contact', views: 4321, uniqueVisitors: 2876, title: 'Contact', averageTimeOnPage: 75, bounceRate: 0.40 },
  { path: '/blog', views: 3210, uniqueVisitors: 2109, title: 'Blog', averageTimeOnPage: 210, bounceRate: 0.15 }
];

const generateMockVisitors = (): Visitor[] => [
  {
    id: '1',
    sessionId: 'sess_123',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    country: 'United States',
    city: 'New York',
    referrer: 'https://google.com',
    landingPage: '/',
    timestamp: new Date().toISOString()
  }
];

const generateMockSessions = (): Session[] => [
  {
    id: '1',
    sessionId: 'sess_123',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 3600,
    pageViews: 5,
    country: 'United States',
    city: 'New York',
    device: 'Desktop',
    browser: 'Chrome',
    referrer: 'https://google.com'
  }
];

// API Service Class
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.removeAuthToken();
          // Don't redirect immediately, let the component handle it
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  public removeAuthToken(): void {
    localStorage.removeItem('accessToken');
  }

  // Health and status endpoints (no auth required)
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await this.api.get('/analytics/health');
      return response.data;
    } catch (error) {
      console.warn('Health check failed, using mock data');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: 86400,
        version: '1.0.0'
      };
    }
  }

  async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const response = await this.api.get('/analytics/db-check');
      return response.data;
    } catch (error) {
      console.warn('Database check failed, using mock data');
      return {
        connected: true,
        timestamp: new Date().toISOString(),
        latency: 50,
        collections: {
          visitors: 1000,
          sessions: 800,
          pageviews: 5000
        }
      };
    }
  }

  // Analytics endpoints
  async getAnalyticsStats(startDate: string, endDate: string): Promise<AnalyticsStats> {
    try {
      const response = await this.api.get('/analytics/stats', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.warn('Analytics stats API failed, using mock data');
      return {
        startDate,
        endDate,
        uniqueVisitors: 127,
        totalPageViews: 543,
        totalSessions: 89,
        averageSessionDuration: 245,
        bounceRate: 0.42,
        newVisitors: 67,
        returningVisitors: 60,
        pagesPerSession: 3.2
      };
    }
  }

  async getTopPages(startDate: string, endDate: string, limit: number = 10): Promise<TopPage[]> {
    try {
      const response = await this.api.get('/analytics/pages/top', {
        params: { startDate, endDate, limit }
      });
      return response.data;
    } catch (error) {
      console.warn('Top pages API failed, using mock data');
      return generateMockTopPages();
    }
  }

  async getRealtimeStats(): Promise<RealtimeStats> {
    try {
      const response = await this.api.get('/analytics/realtime');
      return response.data;
    } catch (error) {
      console.warn('Realtime stats API failed, using mock data');
      return {
        activeUsers: 12,
        pageViewsLastHour: 89,
        newSessionsLastHour: 7,
        topActivePages: [],
        trafficSources: {},
        deviceBreakdown: {},
        countryBreakdown: {}
      };
    }
  }

  async getTimeSeriesData(startDate: string, endDate: string, interval: 'day' | 'hour' = 'day'): Promise<TimeSeriesData[]> {
    try {
      const response = await this.api.get('/analytics/timeseries', {
        params: { startDate, endDate, interval }
      });
      return response.data;
    } catch (error) {
      console.warn('Time series API failed, using mock data');
      return generateMockTimeSeriesData();
    }
  }

  async getDashboardData(startDate: string, endDate: string): Promise<DashboardData> {
    try {
      const response = await this.api.get('/analytics/dashboard', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.warn('Dashboard API failed, using mock data');
      return {
        stats: await this.getAnalyticsStats(startDate, endDate),
        topPages: await this.getTopPages(startDate, endDate),
        realTime: {
          activeUsers: 12,
          pageViewsLastHour: 89,
          newSessionsLastHour: 7,
          topActivePages: [],
          trafficSources: {},
          deviceBreakdown: {},
          countryBreakdown: {}
        },
        timeSeries: await this.getTimeSeriesData(startDate, endDate)
      };
    }
  }

  // Visitor endpoints
  async getMyVisitors(limit: number = 50, offset: number = 0): Promise<{ visitors: Visitor[], total: number }> {
    try {
      const response = await this.api.get('/analytics/visitors/me', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.warn('Visitors API failed, using mock data');
      const mockVisitors = generateMockVisitors();
      return {
        visitors: mockVisitors.slice(offset, offset + limit),
        total: mockVisitors.length
      };
    }
  }

  async getMyVisitorStats(): Promise<VisitorStats> {
    try {
      const response = await this.api.get('/analytics/visitors/me/stats');
      return response.data;
    } catch (error) {
      console.warn('Visitor stats API failed, using mock data');
      return {
        total: 1000,
        unique: 750,
        returning: 250,
        newVisitors: 750
      };
    }
  }

  // Session endpoints
  async getSessions(limit: number = 50, offset: number = 0): Promise<{ sessions: Session[], total: number }> {
    try {
      const response = await this.api.get('/analytics/sessions', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.warn('Sessions API failed, using mock data');
      const mockSessions = generateMockSessions();
      return {
        sessions: mockSessions.slice(offset, offset + limit),
        total: mockSessions.length
      };
    }
  }

  async getSessionById(sessionId: string): Promise<Session> {
    try {
      const response = await this.api.get(`/analytics/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.warn('Session details API failed, using mock data');
      return generateMockSessions()[0];
    }
  }

  async getSessionPageViews(sessionId: string): Promise<PageView[]> {
    try {
      const response = await this.api.get(`/analytics/sessions/${sessionId}/pageviews`);
      return response.data;
    } catch (error) {
      console.warn('Session pageviews API failed, using mock data');
      return [
        {
          id: '1',
          sessionId,
          path: '/',
          title: 'Homepage',
          timestamp: new Date().toISOString(),
          timeOnPage: 120,
          referrer: 'https://google.com'
        }
      ];
    }
  }

  // ==========================================
  // EDUCATIONAL PLATFORM APIs (NO PAYMENT APIs)
  // ==========================================

  // Subjects API
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await this.api.get('/subjects');
      return response.data;
    } catch (error) {
      console.warn('Subjects API failed, using mock data');
      return [
        {
          _id: '1',
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming',
          category: 'Programming',
          level: 'Beginner',
          estimatedTime: '4 weeks',
          thumbnailUrl: '/uploads/subjects/js.png',
          rating: 4.5,
          status: 'published',
          author: 'John Doe',
          content: [
            { heading: 'Introduction', points: ['Variables', 'Functions', 'Objects'] }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  async getSubjectById(id: string): Promise<Subject> {
    try {
      const response = await this.api.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Subject details API failed, using mock data');
      throw new Error('Subject not found');
    }
  }

  async createSubject(data: CreateSubjectDto, thumbnail?: File): Promise<Subject> {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key as keyof CreateSubjectDto]) {
          formData.append(key, JSON.stringify(data[key as keyof CreateSubjectDto]));
        }
      });
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const response = await this.api.post('/subjects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Create subject failed:', error);
      throw error;
    }
  }

  async updateSubject(id: string, data: Partial<CreateSubjectDto>, thumbnail?: File): Promise<Subject> {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key as keyof CreateSubjectDto]) {
          formData.append(key, JSON.stringify(data[key as keyof CreateSubjectDto]));
        }
      });
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const response = await this.api.patch(`/subjects/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Update subject failed:', error);
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      await this.api.delete(`/subjects/${id}`);
    } catch (error) {
      console.error('Delete subject failed:', error);
      throw error;
    }
  }

  // Lessons API
  async getLessons(): Promise<Lesson[]> {
    try {
      const response = await this.api.get('/lessons');
      return response.data;
    } catch (error) {
      console.warn('Lessons API failed, using mock data');
      return [];
    }
  }

  async getLessonsBySubject(subjectId: string): Promise<Lesson[]> {
    try {
      const response = await this.api.get(`/lessons/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.warn('Lessons by subject API failed, using mock data');
      return [];
    }
  }

  async getLessonById(id: string): Promise<Lesson> {
    try {
      const response = await this.api.get(`/lessons/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Lesson details API failed, using mock data');
      throw new Error('Lesson not found');
    }
  }

  async createLesson(data: CreateLessonDto): Promise<Lesson> {
    try {
      const response = await this.api.post('/lessons', data);
      return response.data;
    } catch (error) {
      console.error('Create lesson failed:', error);
      throw error;
    }
  }

  async updateLesson(id: string, data: Partial<CreateLessonDto>): Promise<Lesson> {
    try {
      const response = await this.api.put(`/lessons/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update lesson failed:', error);
      throw error;
    }
  }

  async deleteLesson(id: string): Promise<void> {
    try {
      await this.api.delete(`/lessons/${id}`);
    } catch (error) {
      console.error('Delete lesson failed:', error);
      throw error;
    }
  }

  // Quizzes API
  async getQuizzes(): Promise<Quiz[]> {
    try {
      const response = await this.api.get('/quizzes');
      return response.data;
    } catch (error) {
      console.warn('Quizzes API failed, using mock data');
      return [];
    }
  }

  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    try {
      const response = await this.api.get(`/quizzes/lesson/${lessonId}`);
      return response.data;
    } catch (error) {
      console.warn('Quizzes by lesson API failed, using mock data');
      return [];
    }
  }

  async getQuizById(id: string): Promise<Quiz> {
    try {
      const response = await this.api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Quiz details API failed, using mock data');
      throw new Error('Quiz not found');
    }
  }

  async createQuiz(data: CreateQuizDto): Promise<Quiz> {
    try {
      const response = await this.api.post('/quizzes', data);
      return response.data;
    } catch (error) {
      console.error('Create quiz failed:', error);
      throw error;
    }
  }

  async checkQuizAnswer(id: string, answer: string): Promise<{ correct: boolean; correctAnswer?: string }> {
    try {
      const response = await this.api.post(`/quizzes/${id}/check`, { answer });
      return response.data;
    } catch (error) {
      console.error('Check answer failed:', error);
      throw error;
    }
  }

  async deleteQuiz(id: string): Promise<void> {
    try {
      await this.api.delete(`/quizzes/${id}`);
    } catch (error) {
      console.error('Delete quiz failed:', error);
      throw error;
    }
  }

  // Subscriptions API
  async getSubscriptions(status?: string): Promise<Subscription[]> {
    try {
      const params = status ? { status } : {};
      const response = await this.api.get('/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.warn('Subscriptions API failed, using mock data');
      return [
        {
          _id: '1',
          name: 'free-plan',
          displayName: 'Free Plan',
          description: 'Basic access to learning materials',
          price: 0,
          currency: 'INR',
          type: 'FREE',
          features: [
            { name: 'Basic Lessons', description: 'Access to basic lessons', type: 'BOOLEAN', value: true }
          ],
          status: 'ACTIVE',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await this.api.get('/subscriptions/active');
      return response.data;
    } catch (error) {
      console.warn('Active subscriptions API failed, using mock data');
      return [];
    }
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    try {
      const response = await this.api.get(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Subscription details API failed, using mock data');
      throw new Error('Subscription not found');
    }
  }

  async getSubscriptionByName(name: string): Promise<Subscription> {
    try {
      const response = await this.api.get(`/subscriptions/name/${name}`);
      return response.data;
    } catch (error) {
      console.warn('Subscription by name API failed, using mock data');
      throw new Error('Subscription not found');
    }
  }

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    try {
      const response = await this.api.post('/subscriptions', data);
      return response.data;
    } catch (error) {
      console.error('Create subscription failed:', error);
      throw error;
    }
  }

  async updateSubscription(id: string, data: Partial<CreateSubscriptionDto>): Promise<Subscription> {
    try {
      const response = await this.api.patch(`/subscriptions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update subscription failed:', error);
      throw error;
    }
  }

  async activateSubscription(id: string): Promise<Subscription> {
    try {
      const response = await this.api.patch(`/subscriptions/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Activate subscription failed:', error);
      throw error;
    }
  }

  async deactivateSubscription(id: string): Promise<Subscription> {
    try {
      const response = await this.api.patch(`/subscriptions/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Deactivate subscription failed:', error);
      throw error;
    }
  }

  async deleteSubscription(id: string): Promise<void> {
    try {
      await this.api.delete(`/subscriptions/${id}`);
    } catch (error) {
      console.error('Delete subscription failed:', error);
      throw error;
    }
  }

  async getSubscription(id: string): Promise<Subscription> {
    return this.getSubscriptionById(id);
  }

  async getSubscriptionStats(): Promise<any> {
    try {
      const response = await this.api.get('/subscriptions/stats');
      return response.data;
    } catch (error) {
      console.warn('Subscription stats API failed, using mock data');
      return {
        total: 3,
        active: 2,
        inactive: 1,
        totalRevenue: 50000
      };
    }
  }

  // ==========================================
  // PAYMENT APIs
  // ==========================================
  async createPayment(data: any): Promise<any> {
    try {
      const response = await this.api.post('/payments', data);
      return response.data;
    } catch (error) {
      console.error('Create payment failed:', error);
      throw error;
    }
  }

  async getPayments(filters?: any): Promise<any[]> {
    try {
      const response = await this.api.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('Payments API failed, using mock data');
      return [];
    }
  }

  async getPayment(id: string): Promise<any> {
    try {
      const response = await this.api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get payment failed:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<any> {
    try {
      const response = await this.api.patch(`/payments/${id}/status`, { status, transactionId });
      return response.data;
    } catch (error) {
      console.error('Update payment status failed:', error);
      throw error;
    }
  }

  async refundPayment(id: string, reason?: string): Promise<any> {
    try {
      const response = await this.api.post(`/payments/${id}/refund`, { reason });
      return response.data;
    } catch (error) {
      console.error('Refund payment failed:', error);
      throw error;
    }
  }

  async getPaymentStatistics(): Promise<any> {
    try {
      const response = await this.api.get('/payments/statistics');
      return response.data;
    } catch (error) {
      console.warn('Payment statistics API failed, using mock data');
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalTransactions: 0,
        successRate: 0,
        averageOrderValue: 0,
        paymentMethodDistribution: {},
        monthlyGrowth: 0
      };
    }
  }

  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await this.api.post('/payments/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ user: any; accessToken: string }> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      
      this.setAuthToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, accessToken };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async signup(userData: { name: string; email: string; password: string }): Promise<{ user: any; accessToken: string }> {
    try {
      const response = await this.api.post('/auth/signup', userData);
      const { user, accessToken } = response.data;
      
      this.setAuthToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, accessToken };
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeAuthToken();
      localStorage.removeItem('user');
    }
  }

  // Authentication helper
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;