import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData = require('form-data');
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class AiMatcherService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('AI_MATCHER_BASE_URL', 'http://localhost:8000');
  }

  async uploadResume(userId: string, resumeText?: string, resumeFilePath?: string) {
    try {
      console.log('🔗 AI Matcher - uploadResume called with:', {
        userId,
        resumeFilePath,
        fileExists: resumeFilePath ? fs.existsSync(resumeFilePath) : false,
        baseUrl: this.baseUrl
      });

      const formData = new FormData();
      formData.append('user_id', userId);

      if (resumeFilePath && fs.existsSync(resumeFilePath)) {
        console.log('📄 Adding resume file to form data:', resumeFilePath);
        formData.append('resume_file', fs.createReadStream(resumeFilePath));
      } else if (resumeText) {
        console.log('📝 Adding resume text to form data');
        formData.append('resume_text', resumeText);
      } else {
        console.log('⚠️ No resume file or text provided');
        return { success: false, message: 'No resume data provided' };
      }

      console.log('🚀 Sending request to AI matcher:', `${this.baseUrl}/upload-resume`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/upload-resume`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000, // 30 second timeout
        }),
      );

      console.log('✅ AI Matcher response:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 AI Matcher upload failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/upload-resume`
      });
      throw new HttpException(
        `Failed to upload resume: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMatchScore(applicantId: string, jobDescription: string, jobFilePath?: string) {
    try {
      console.log('🎯 AI Matcher - getMatchScore called with:', {
        applicantId,
        jobDescription: jobDescription ? 'provided' : 'not provided',
        jobFilePath,
        baseUrl: this.baseUrl
      });

      const formData = new FormData();
      formData.append('applicant_id', applicantId);

      if (jobFilePath && fs.existsSync(jobFilePath)) {
        console.log('📄 Adding job file to form data:', jobFilePath);
        formData.append('jd_file', fs.createReadStream(jobFilePath));
      } else if (jobDescription) {
        console.log('📝 Adding job description text to form data');
        formData.append('jd_text', jobDescription);
      } else {
        console.log('⚠️ No job description or file provided');
        return { success: false, message: 'No job description provided' };
      }

      console.log('🚀 Sending match score request to AI matcher:', `${this.baseUrl}/match-score`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/match-score`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000, // 30 second timeout
        }),
      );

      console.log('✅ AI Matcher match score response:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 AI Matcher match score failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/match-score`
      });
      // Don't throw error, just return null so job application listing doesn't fail
      return null;
    }
  }

  async uploadJobDescription(jobId: string, jobFilePath: string) {
    try {
      console.log('🔗 AI Matcher - uploadJobDescription called with:', {
        jobId,
        jobFilePath,
        fileExists: fs.existsSync(jobFilePath),
        baseUrl: this.baseUrl
      });

      const formData = new FormData();
      formData.append('job_id', jobId);

      if (fs.existsSync(jobFilePath)) {
        console.log('📄 Adding job description file to form data:', jobFilePath);
        formData.append('job_file', fs.createReadStream(jobFilePath));
      } else {
        console.log('⚠️ Job description file not found:', jobFilePath);
        return { success: false, message: 'Job description file not found' };
      }

      console.log('🚀 Sending job description to AI matcher:', `${this.baseUrl}/upload-job-description`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/upload-job-description`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000, // 30 second timeout
        }),
      );

      console.log('✅ AI Matcher job description upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 AI Matcher job description upload failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/upload-job-description`
      });
      // Don't throw error, just log it since job creation should not fail if AI upload fails
      return { success: false, message: error.message };
    }
  }

  async uploadJob(jobData?: any, jobFilePath?: string, jobTitle?: string, jobId?: string) {
    try {
      let pdfPath: string;
      
      if (jobFilePath && fs.existsSync(jobFilePath)) {
        pdfPath = jobFilePath;
      } else if (jobData) {
        // Generate PDF from job data
        pdfPath = await this.generateJobPDF(jobData, jobTitle, jobId);
      } else {
        throw new Error('No job data provided');
      }

      const formData = new FormData();
      formData.append('job_id', jobId || 'temp_job_id');
      formData.append('job_file', fs.createReadStream(pdfPath));

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/upload-job-pdf`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000,
        }),
      );

      // Clean up generated PDF if it was created from data
      if (!jobFilePath && pdfPath) {
        fs.unlinkSync(pdfPath);
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to upload job: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateJobPDF(jobData: any, jobTitle?: string, jobId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const filename = `job_${jobId || Date.now()}.pdf`;
        const filepath = path.join(tempDir, filename);
        
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).fillColor('#2c3e50').text('JOB DESCRIPTION', { align: 'center' });
        doc.moveDown(0.5);
        doc.strokeColor('#3498db').lineWidth(2)
           .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Job Title
        if (jobTitle || jobData.title) {
          doc.fontSize(18).fillColor('#2c3e50')
             .text(jobTitle || jobData.title, { align: 'center' });
          doc.moveDown(1);
        }

        // Job Details Section
        this.addSection(doc, 'JOB DETAILS', [
          { label: 'Position', value: jobTitle || jobData.title || 'Not specified' },
          { label: 'Location', value: jobData.location || 'Not specified' },
          { label: 'Job Type', value: jobData.jobType || 'Full-time' },
          { label: 'Experience Level', value: jobData.experienceLevel || 'Mid-level' },
          { label: 'Salary', value: jobData.salary ? `$${jobData.salary.toLocaleString()}` : 'Competitive' },
          { label: 'Posted Date', value: new Date().toLocaleDateString() }
        ]);

        // Job Description
        if (jobData.description || (typeof jobData === 'string')) {
          this.addSection(doc, 'JOB DESCRIPTION', null, jobData.description || jobData);
        }

        // Requirements
        if (jobData.requirements && jobData.requirements.length > 0) {
          this.addSection(doc, 'REQUIREMENTS', jobData.requirements.map(req => ({ bullet: true, value: req })));
        }

        // Skills
        if (jobData.skills && jobData.skills.length > 0) {
          this.addSection(doc, 'REQUIRED SKILLS', jobData.skills.map(skill => ({ bullet: true, value: skill })));
        }

        // Benefits
        if (jobData.benefits && jobData.benefits.length > 0) {
          this.addSection(doc, 'BENEFITS', jobData.benefits.map(benefit => ({ bullet: true, value: benefit })));
        }

        // Company Information
        if (jobData.companyInfo) {
          this.addSection(doc, 'COMPANY INFORMATION', null, jobData.companyInfo);
        }

        // Salary Range
        if (jobData.salaryRange) {
          this.addSection(doc, 'SALARY RANGE', [
            { label: 'Minimum', value: `$${jobData.salaryRange.min.toLocaleString()}` },
            { label: 'Maximum', value: `$${jobData.salaryRange.max.toLocaleString()}` }
          ]);
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#7f8c8d')
           .text(`Job ID: ${jobId || 'N/A'}`, 50, doc.page.height - 100)
           .text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 85)
           .text('This document was automatically generated by the AI Interview Platform', 50, doc.page.height - 70, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private addSection(doc: any, title: string, items?: any[], description?: string) {
    // Section Title
    doc.fontSize(14).fillColor('#2c3e50').text(title, { underline: true });
    doc.moveDown(0.5);

    if (description) {
      // Description text
      doc.fontSize(11).fillColor('#34495e').text(description, {
        align: 'justify',
        width: 500,
        lineGap: 2
      });
      doc.moveDown(1);
    }

    if (items) {
      items.forEach(item => {
        if (item.bullet) {
          // Bullet point
          doc.fontSize(11).fillColor('#34495e')
             .text('• ' + item.value, { indent: 20, width: 480 });
        } else {
          // Label-value pair
          doc.fontSize(11).fillColor('#2c3e50').text(item.label + ':', { continued: true })
             .fillColor('#34495e').text(' ' + item.value);
        }
      });
      doc.moveDown(1);
    }
  }

  async getBestJobsForResume(resumeText?: string, resumeFilePath?: string, limit = 10) {
    try {
      const formData = new FormData();

      if (resumeFilePath && fs.existsSync(resumeFilePath)) {
        formData.append('resume_file', fs.createReadStream(resumeFilePath));
      } else if (resumeText) {
        formData.append('resume_text', resumeText);
      }

      formData.append('limit', limit.toString());

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/best-job-for-resume`, formData, {
          headers: formData.getHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to get best jobs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBestResumesForJob(jobText?: string, jobFilePath?: string, limit = 10) {
    try {
      const formData = new FormData();

      if (jobFilePath && fs.existsSync(jobFilePath)) {
        formData.append('job_file', fs.createReadStream(jobFilePath));
      } else if (jobText) {
        formData.append('job_text', jobText);
      }

      formData.append('limit', limit.toString());

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/best-resume-for-job`, formData, {
          headers: formData.getHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to get best resumes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteJob(jobId: string) {
    try {
      console.log('🗑️ AI Matcher - deleteJob called with:', {
        jobId,
        baseUrl: this.baseUrl
      });

      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/delete-job/${jobId}`, {
          timeout: 30000, // 30 second timeout
        }),
      );

      console.log('✅ AI Matcher delete job response:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 AI Matcher delete job failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.baseUrl}/delete-job/${jobId}`
      });
      throw new HttpException(
        `Failed to delete job: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}