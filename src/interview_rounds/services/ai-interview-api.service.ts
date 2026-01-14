import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData = require('form-data');
import * as fs from 'fs';

export interface StartInterviewPayload {
  user_id: string;
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  cv: string;      // CV ID (renamed from cv_id)
  jd: string;      // JD ID (renamed from jd_id)
  round_type: 'technical' | 'behavioral' | 'hr' | 'full';
}

export interface SubmitAnswerPayload {
  user_id: string;
  session_id: string;
  answer: string;
}

export interface SubmitVoiceAnswerPayload {
  user_id: string;
  session_id: string;
  audio_buffer?: Buffer;
  audio_mimetype?: string;
  audio_originalname?: string;
  audio_file_path?: string; // Fallback for file path
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
    this.baseUrl = this.configService.get<string>('AI_INTERVIEW_API_BASE_URL', 'http://localhost:8080');
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
   * Start a new interview session with required CV/JD IDs
   */
  async startInterview(payload: StartInterviewPayload): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_START_ENDPOINT', '/interview/start');
      
      console.log('🔍 === AI INTERVIEW START DEBUG ===');
      console.log('📍 Base URL:', this.baseUrl);
      console.log('📍 Endpoint:', endpoint);
      console.log('📍 Full URL:', `${this.baseUrl}${endpoint}`);
      console.log('📋 Input Payload:', JSON.stringify(payload, null, 2));
      
      // Send only IDs and metadata - no file attachments
      const requestPayload = {
        user_id: payload.user_id,
        session_id: payload.session_id,
        role_title: payload.role_title,
        company_name: payload.company_name,
        industry: payload.industry,
        round_type: payload.round_type,
        cv: payload.cv,
        jd: payload.jd
      };
      
      console.log('📋 Final Request Payload:', JSON.stringify(requestPayload, null, 2));
      console.log('🚀 Sending JSON request...');
      
      const response = await this.axiosInstance.post(endpoint, requestPayload);
      console.log('✅ AI Service Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log('❌ === AI INTERVIEW START ERROR ===');
      console.log('Error details:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      console.log('Headers:', error.response?.headers);
      this.logger.error('Failed to start interview session', error);
      throw new HttpException(
        'Failed to start interview session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Submit a voice answer with audio file
   */
  async submitVoiceAnswer(payload: SubmitVoiceAnswerPayload): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_INTERVIEW_ANSWER_ENDPOINT', '/interview/answer');
      
      console.log('🔍 === AI VOICE ANSWER SUBMISSION DEBUG ===');
      console.log('📍 Base URL:', this.baseUrl);
      console.log('📍 Endpoint:', endpoint);
      console.log('📍 Full URL:', `${this.baseUrl}${endpoint}`);
      console.log('📋 Input Payload:', JSON.stringify({ user_id: payload.user_id, session_id: payload.session_id }, null, 2));
      
      const formData = new FormData();
      formData.append('user_id', payload.user_id);
      formData.append('session_id', payload.session_id);
      
      console.log('📝 FormData fields:');
      console.log('  - user_id:', payload.user_id);
      console.log('  - session_id:', payload.session_id);
      
      let filename = 'audio.wav';
      
      // Append audio from buffer or file path
      if (payload.audio_buffer) {
        filename = payload.audio_originalname || 'audio.wav';
        formData.append('audio_file', payload.audio_buffer, {
          filename: filename,
          contentType: payload.audio_mimetype || 'audio/wav',
        });
        console.log('  - audio_file:', filename, '(buffer attached, size:', payload.audio_buffer.length, 'bytes)');
      } else if (payload.audio_file_path && fs.existsSync(payload.audio_file_path)) {
        filename = payload.audio_file_path.split('/').pop() || 'audio.wav';
        formData.append('audio_file', fs.createReadStream(payload.audio_file_path), {
          filename: filename,
          contentType: 'audio/wav',
        });
        console.log('  - audio_file:', filename, '(file stream attached)');
      } else {
        throw new Error('No audio data provided');
      }
      
      console.log('🚀 Sending FormData request to AI service...');
      
      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 180000,
      });
      
      console.log('✅ AI Service Response Status:', response.status);
      console.log('✅ AI Service Response Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.log('❌ === AI VOICE ANSWER ERROR ===');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      this.logger.error('Failed to submit voice answer', error);
      throw new HttpException(
        'Failed to submit voice answer',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Submit a text answer (fallback for gateways)
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
      console.log('🔍 listUserSessions called for userId:', userId);
      console.log('🔍 Endpoint:', endpoint);
      console.log('🔍 Full URL:', `${this.baseUrl}${endpoint}/${userId}`);
      const response = await this.axiosInstance.get(`${endpoint}/${userId}`);
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log('❌ listUserSessions error:', error.message);
      if (error.response) {
        console.log('❌ Response status:', error.response.status);
        console.log('❌ Response data:', JSON.stringify(error.response.data, null, 2));
      }
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
