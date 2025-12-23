import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface StartInterviewPayload {
  user_id: string;
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  jd: string;
  cv?: string;
  round_type: 'technical' | 'behavioral' | 'hr' | 'full';
}

export interface SubmitAnswerPayload {
  user_id: string;
  session_id: string;
  answer: string;
}

export interface InterviewState {
  user_id: string;
  session_id: string;
  current_question?: string;
  questions_asked: number;
  total_questions: number;
  status: string;
  round_type: string;
}

export interface InterviewReport {
  user_id: string;
  session_id: string;
  overall_score: number;
  communication_score?: number;
  behavioral_score?: number;
  technical_score?: number;
  problem_solving_score?: number;
  feedback: any;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

@Injectable()
export class AiInterviewApiService {
  private readonly logger = new Logger(AiInterviewApiService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AI_INTERVIEW_API_BASE_URL', 'http://34.27.237.113:8000');
    this.timeout = this.configService.get<number>('AI_INTERVIEW_API_TIMEOUT', 60000);

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`AI API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('AI API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`AI API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        this.handleAxiosError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleAxiosError(error: AxiosError): void {
    if (error.response) {
      this.logger.error(
        `AI API Error Response: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      this.logger.error(`AI API No Response: ${error.message}`);
    } else {
      this.logger.error(`AI API Request Setup Error: ${error.message}`);
    }
  }

  /**
   * Start a new interview session
   */
  async startInterview(payload: StartInterviewPayload): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_START_ENDPOINT', '/start');
      const response = await this.axiosInstance.post(endpoint, payload);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to start interview session', error);
      throw new HttpException(
        'Failed to start interview session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Submit an answer to the current question
   */
  async submitAnswer(payload: SubmitAnswerPayload): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_ANSWER_ENDPOINT', '/answer');
      const response = await this.axiosInstance.post(endpoint, payload);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to submit answer', error);
      throw new HttpException(
        'Failed to submit answer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get current interview state
   */
  async getInterviewState(userId: string, sessionId: string): Promise<InterviewState> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_STATE_ENDPOINT', '/state');
      const response = await this.axiosInstance.get(`${endpoint}/${userId}/${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get interview state', error);
      throw new HttpException(
        'Failed to get interview state',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get final interview report
   */
  async getInterviewReport(userId: string, sessionId: string): Promise<InterviewReport> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_REPORT_ENDPOINT', '/report');
      const response = await this.axiosInstance.get(`${endpoint}/${userId}/${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get interview report', error);
      throw new HttpException(
        'Failed to get interview report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * List all interview sessions for a user
   */
  async listUserSessions(userId: string): Promise<any[]> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.get(`${endpoint}/${userId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to list user sessions', error);
      throw new HttpException(
        'Failed to list user sessions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a session (mock endpoint)
   */
  async createSession(payload: {
    role: string;
    industry: string;
    company: string;
    cv_file_id?: string;
    jd_file_id?: string;
  }): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.post(`${endpoint}/`, payload);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create session', error);
      throw new HttpException(
        'Failed to create session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get next question in session
   */
  async getNextQuestion(sessionId: string): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.get(`${endpoint}/${sessionId}/next-question`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get next question', error);
      throw new HttpException(
        'Failed to get next question',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Submit answer to session (mock endpoint)
   */
  async submitSessionAnswer(sessionId: string, payload: {
    question_id: string;
    text: string;
    audio_url?: string;
  }): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.post(`${endpoint}/${sessionId}/answer`, payload);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to submit session answer', error);
      throw new HttpException(
        'Failed to submit session answer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get session report
   */
  async getSessionReport(sessionId: string): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.get(`${endpoint}/${sessionId}/report`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get session report', error);
      throw new HttpException(
        'Failed to get session report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.delete(`${endpoint}/${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to delete session', error);
      throw new HttpException(
        'Failed to delete session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get session details
   */
  async getSessionDetails(sessionId: string): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.get(`${endpoint}/${sessionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get session details', error);
      throw new HttpException(
        'Failed to get session details',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * List all sessions
   */
  async listAllSessions(): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_SESSIONS_ENDPOINT', '/sessions');
      const response = await this.axiosInstance.get(`${endpoint}/`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to list all sessions', error);
      throw new HttpException(
        'Failed to list all sessions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
