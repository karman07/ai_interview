import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData = require('form-data');
import * as fs from 'fs';

export interface CvScorePayload {
  cv_text: string;
}

export interface CvFitIndexPayload {
  cv_text: string;
  jd_text: string;
}

export interface CvImprovementPayload {
  cv_text: string;
  jd_text: string;
}

export interface CvScoreResponse {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface CvFitIndexResponse {
  fit_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
}

export interface CvImprovementResponse {
  suggestions: string[];
  rewritten_sections: any;
  overall_improvement_score: number;
}

@Injectable()
export class AiCvApiService {
  private readonly logger = new Logger(AiCvApiService.name);
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
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`AI CV API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('AI CV API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`AI CV API Response: ${response.status} ${response.config.url}`);
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
        `AI CV API Error Response: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      this.logger.error(`AI CV API No Response: ${error.message}`);
    } else {
      this.logger.error(`AI CV API Request Setup Error: ${error.message}`);
    }
  }

  /**
   * Score CV quality
   */
  async scoreCv(cvText: string): Promise<CvScoreResponse> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_SCORE_ENDPOINT', '/v1/cv/score');
      const response = await this.axiosInstance.post(endpoint, { cv_text: cvText }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to score CV', error);
      throw new HttpException(
        'Failed to score CV',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Calculate CV fit index with job description
   */
  async calculateFitIndex(cvText: string, jdText: string): Promise<CvFitIndexResponse> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_FIT_INDEX_ENDPOINT', '/v1/cv/fit-index');
      const response = await this.axiosInstance.post(endpoint, {
        cv_text: cvText,
        jd_text: jdText
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to calculate fit index', error);
      throw new HttpException(
        'Failed to calculate fit index',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get CV improvement suggestions
   */
  async getImprovementSuggestions(cvText: string, jdText: string): Promise<CvImprovementResponse> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_IMPROVEMENT_ENDPOINT', '/v1/cv/improvement');
      const response = await this.axiosInstance.post(endpoint, {
        cv_text: cvText,
        jd_text: jdText
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get improvement suggestions', error);
      throw new HttpException(
        'Failed to get improvement suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Upload and evaluate CV file
   */
  async uploadAndEvaluateCv(filePath: string, originalName: string, jdText?: string): Promise<any> {
    const startTime = Date.now();
    this.logger.log(`🚀 Starting CV evaluation for: ${originalName}`);
    
    try {
      const endpoint = this.configService.get<string>('AI_CV_EVALUATE_UPLOAD_ENDPOINT', '/upload/cv_evaluate');
      this.logger.log(`🎯 Endpoint: ${this.baseUrl}${endpoint}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const fileStats = fs.statSync(filePath);
      this.logger.log(`📄 File size: ${fileStats.size} bytes`);
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName,
        contentType: 'application/pdf',
      });
      
      if (jdText) {
        this.logger.log(`📝 JD text length: ${jdText.length} characters`);
        formData.append('jd_text', jdText);
      }

      this.logger.log('📤 Sending request to AI service...');
      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000, // 2 minutes timeout
      });
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ CV evaluation successful in ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`💥 CV evaluation failed after ${duration}ms`);
      
      if (error.code === 'ECONNABORTED') {
        this.logger.error('⏰ Request timeout - AI service took too long to respond');
      } else if (error.code === 'ECONNREFUSED') {
        this.logger.error('🚫 Connection refused - AI service might be down');
      } else if (error.response) {
        this.logger.error(`📊 Response status: ${error.response.status}`);
        this.logger.error(`📊 Response data: ${JSON.stringify(error.response.data)}`);
      }
      
      this.logger.error('Full error details:', error.message);
      throw new HttpException(
        `Failed to upload and evaluate CV: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Upload and get CV improvement suggestions
   */
  async uploadAndGetImprovements(
    filePath: string,
    originalName: string,
    jdText?: string,
    jdFilePath?: string,
    jdFileName?: string
  ): Promise<any> {
    const startTime = Date.now();
    this.logger.log(`🔄 Starting CV improvement for: ${originalName}`);
    
    try {
      const endpoint = this.configService.get<string>('AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT', '/upload/cv_improvement');
      this.logger.log(`🎯 Endpoint: ${this.baseUrl}${endpoint}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName,
        contentType: 'application/pdf',
      });
      
      if (jdText) {
        this.logger.log(`📝 JD text length: ${jdText.length} characters`);
        formData.append('jd_text', jdText);
      }

      if (jdFilePath && jdFileName) {
        this.logger.log(`📋 JD file: ${jdFileName}`);
        if (!fs.existsSync(jdFilePath)) {
          throw new Error(`JD file not found: ${jdFilePath}`);
        }
        formData.append('jd_file', fs.createReadStream(jdFilePath), {
          filename: jdFileName,
        });
      }

      this.logger.log('📤 Sending improvement request to AI service...');
      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000, // 2 minutes timeout
      });
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ CV improvement successful in ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`💥 CV improvement failed after ${duration}ms`);
      
      if (error.code === 'ECONNABORTED') {
        this.logger.error('⏰ Request timeout - AI service took too long to respond');
      } else if (error.code === 'ECONNREFUSED') {
        this.logger.error('🚫 Connection refused - AI service might be down');
      } else if (error.response) {
        this.logger.error(`📊 Response status: ${error.response.status}`);
        this.logger.error(`📊 Response data: ${JSON.stringify(error.response.data)}`);
      }
      
      this.logger.error('Full error details:', error.message);
      throw new HttpException(
        `Failed to upload and get improvements: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Evaluate CV vs JD
   */
  async evaluateCvVsJd(cvText: string, jdText: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/evaluation/cv', {
        cv_text: cvText,
        jd_text: jdText
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to evaluate CV vs JD', error);
      throw new HttpException(
        'Failed to evaluate CV vs JD',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Upload CV artifact
   */
  async uploadCvArtifact(filePath: string, originalName: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName,
        contentType: 'application/pdf',
      });

      const response = await this.axiosInstance.post('/uploads/cv', formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to upload CV artifact', error);
      throw new HttpException(
        'Failed to upload CV artifact',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Upload JD artifact
   */
  async uploadJdArtifact(filePath: string, originalName: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName,
      });

      const response = await this.axiosInstance.post('/uploads/jd', formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to upload JD artifact', error);
      throw new HttpException(
        'Failed to upload JD artifact',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get artifact info
   */
  async getArtifactInfo(artifactId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/uploads/${artifactId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get artifact info', error);
      throw new HttpException(
        'Failed to get artifact info',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete artifact
   */
  async deleteArtifact(artifactId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/uploads/${artifactId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to delete artifact', error);
      throw new HttpException(
        'Failed to delete artifact',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
