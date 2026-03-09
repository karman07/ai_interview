import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData = require('form-data');
import * as fs from 'fs';

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
    this.baseUrl = this.configService.get<string>('AI_INTERVIEW_API_BASE_URL', 'http://localhost:8001');
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
      (config) => config,
      (error) => {
        this.logger.error('AI CV API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
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

  async scoreCv(cvText: string, token?: string): Promise<CvScoreResponse> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_SCORE_ENDPOINT', '/api/v1/cv/score');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const response = await this.axiosInstance.post(endpoint, {
        cv_text: cvText
      }, { headers });
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to score CV', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async calculateFitIndex(cvText: string, jdText: string, token?: string): Promise<CvFitIndexResponse> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_FIT_INDEX_ENDPOINT', '/api/v1/cv/fit-index');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const response = await this.axiosInstance.post(endpoint, {
        cv_text: cvText,
        jd_text: jdText
      }, { headers });
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to calculate fit index', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getImprovementSuggestions(cvText: string, jdText: string, token?: string): Promise<CvImprovementResponse> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_IMPROVEMENT_ENDPOINT', '/api/v1/cv/improvement');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const response = await this.axiosInstance.post(endpoint, {
        cv_text: cvText,
        jd_text: jdText
      }, { headers });
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to get improvement suggestions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadAndEvaluateCv(
    filePath: string,
    originalName: string,
    jdText?: string,
    jdFilePath?: string,
    jdFileName?: string,
    token?: string
  ): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_EVALUATE_UPLOAD_ENDPOINT', '/api/v1/upload/cv_evaluate');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName,
        contentType: 'application/pdf',
      });

      const jdTextValue = jdText || '';
      formData.append('jd_text', jdTextValue);

      if (jdFilePath && jdFileName) {
        if (!fs.existsSync(jdFilePath)) {
          throw new Error(`JD file not found: ${jdFilePath}`);
        }
        formData.append('jd_file', fs.createReadStream(jdFilePath), {
          filename: jdFileName,
          contentType: 'application/pdf',
        });
      }

      const headers: any = {
        ...formData.getHeaders(),
        'Accept': 'application/json',
      };
      if (token) headers['Authorization'] = token;

      const response = await this.axiosInstance.post(endpoint, formData, {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const detail = error.response.data?.detail || error.response.data?.message;
        if (detail) {
          throw new HttpException(detail, HttpStatus.BAD_REQUEST);
        }
      }

      throw new HttpException(
        `Failed to upload and evaluate CV: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadAndGetImprovements(
    filePath: string,
    originalName: string,
    jdText?: string,
    jdFilePath?: string,
    jdFileName?: string,
    token?: string
  ): Promise<any> {
    try {
      const endpoint = this.configService.get<string>('AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT', '/api/v1/upload/cv_improvement');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName,
        contentType: 'application/pdf',
      });

      const jdTextValue = jdText || '';
      formData.append('jd_text', jdTextValue);

      if (jdFilePath && jdFileName) {
        if (!fs.existsSync(jdFilePath)) {
          throw new Error(`JD file not found: ${jdFilePath}`);
        }
        formData.append('jd_file', fs.createReadStream(jdFilePath), {
          filename: jdFileName,
          contentType: 'application/pdf',
        });
      }

      const headers: any = {
        ...formData.getHeaders(),
        'Accept': 'application/json',
      };
      if (token) headers['Authorization'] = token;

      const response = await this.axiosInstance.post(endpoint, formData, {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const detail = error.response.data?.detail || error.response.data?.message;
        if (detail) {
          throw new HttpException(detail, HttpStatus.BAD_REQUEST);
        }
      }

      throw new HttpException(
        `Failed to upload and get improvements: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

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
      throw new HttpException('Failed to evaluate CV vs JD', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
      throw new HttpException('Failed to upload CV artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
      throw new HttpException('Failed to upload JD artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getArtifactInfo(artifactId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/uploads/${artifactId}`);
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to get artifact info', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteArtifact(artifactId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/uploads/${artifactId}`);
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to delete artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
