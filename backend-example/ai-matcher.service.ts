import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface JobData {
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  descriptionFileUrl?: string;
}

@Injectable()
export class AiMatcherService {
  private readonly aiMatcherBaseUrl = process.env.AI_MATCHER_URL || 'http://localhost:5000';

  async uploadJob(jobId: string, jobData: JobData): Promise<any> {
    try {
      console.log('🔗 Uploading job to JD matcher:', jobId);
      
      const response = await axios.post(`${this.aiMatcherBaseUrl}/upload-job`, {
        jobId,
        ...jobData,
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Job uploaded to JD matcher successfully');
      return response.data;
    } catch (error) {
      console.error('💥 JD Matcher upload failed:', error.message);
      throw new HttpException(
        `Failed to upload job to JD matcher: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async deleteJob(jobId: string): Promise<any> {
    try {
      console.log('🗑️ Deleting job from JD matcher:', jobId);
      
      const response = await axios.delete(`${this.aiMatcherBaseUrl}/delete-job/${jobId}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Job deleted from JD matcher successfully');
      return response.data;
    } catch (error) {
      console.error('💥 JD Matcher delete failed:', error.message);
      // Log error but don't throw - deletion should continue even if JD matcher fails
      console.log('⚠️ Continuing with job deletion despite JD matcher failure');
    }
  }

  async getBestCandidates(jobId: string): Promise<any> {
    try {
      console.log('🔍 Getting best candidates for job:', jobId);
      
      const response = await axios.get(`${this.aiMatcherBaseUrl}/best-candidates/${jobId}`, {
        timeout: 15000, // 15 second timeout for candidate matching
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Best candidates retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 Failed to get best candidates:', error.message);
      throw new HttpException(
        `Failed to get best candidates: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}