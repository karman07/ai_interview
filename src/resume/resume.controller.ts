import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { JobDescriptionService } from '../job-description/job-description.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configure multer to preserve file extensions and organize by user
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as any).user?.sub || 'unknown';
    const uploadPath = `./uploads/users/${userId}`;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Preserve original filename with extension
    const timestamp = Date.now();
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    cb(null, `${timestamp}-${nameWithoutExt}${ext}`);
  }
});

@Controller(['resume', 'v1/resume'])
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);

  constructor(
    private resumeService: ResumeService,
    private jdService: JobDescriptionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 2, { storage }),
    new TimeoutInterceptor(180000) // 3 minutes timeout for file upload
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jd_text') jdText: string,
    @Req() req,
  ) {
    this.logger.log('🚀 Resume upload API called');
    this.logger.log(`📁 Files received: ${files?.length || 0}`);
    this.logger.log(`📝 JD text provided: ${!!jdText}`);
    
    // Log FormData received from frontend
    this.logger.log('📦 FormData received from frontend:');
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        this.logger.log(`  File ${index + 1}:`);
        this.logger.log(`    - fieldname: ${file.fieldname}`);
        this.logger.log(`    - originalname: ${file.originalname}`);
        this.logger.log(`    - mimetype: ${file.mimetype}`);
        this.logger.log(`    - size: ${file.size} bytes`);
        this.logger.log(`    - path: ${file.path}`);
      });
    }
    this.logger.log(`  jd_text: ${jdText ? `${jdText.length} characters` : 'not provided'}`);
    
    try {
      if (!files || files.length === 0) {
        this.logger.error('❌ No files uploaded');
        throw new Error('At least one file (resume) is required');
      }

      const userId = req.user.sub;
      this.logger.log(`👤 User ID: ${userId}`);

      const resumeFile = files[0];
      const jdFile = files.length > 1 ? files[1] : undefined;
      
      this.logger.log(`📄 Resume file: ${resumeFile.originalname} (${resumeFile.size} bytes)`);
      if (jdFile) {
        this.logger.log(`📋 JD file: ${jdFile.originalname} (${jdFile.size} bytes)`);
      }

      // Save JD to separate collection if provided
      if (jdText && jdText.trim() !== '') {
        try {
          await this.jdService.uploadJobDescription(undefined, jdText, userId);
          this.logger.log('✅ JD text saved to separate collection');
        } catch (jdError) {
          this.logger.warn('⚠️ Failed to save JD to separate collection:', jdError.message);
        }
      } else if (jdFile) {
        try {
          await this.jdService.uploadJobDescription(jdFile, undefined, userId);
          this.logger.log('✅ JD file saved to separate collection');
        } catch (jdError) {
          this.logger.warn('⚠️ Failed to save JD file to separate collection:', jdError.message);
        }
      }

      this.logger.log('⏳ Starting resume processing...');
      this.logger.log('📊 About to call resumeService.uploadResume');
      
      let resume;
      try {
        resume = await this.resumeService.uploadResume(
          resumeFile,
          jdFile,
          jdText,
          userId,
        );
      } catch (serviceError) {
        this.logger.error('💥 ResumeService.uploadResume failed:', serviceError.message);
        this.logger.error('Service error stack:', serviceError.stack);
        throw new Error(`Resume validation failed: ${serviceError.message}`);
      }

      this.logger.log('✅ Resume uploaded and processed successfully');
      this.logger.log('📋 Resume object received:', JSON.stringify({
        id: resume._id,
        filename: resume.filename,
        stats: resume.stats,
        improvement_resume: resume.improvement_resume
      }, null, 2));
      
      // Return response with basic resume info and analytics data
      const stats = resume.stats || {};
      const improvement = resume.improvement_resume || {};
      
      return {
        message: 'Resume uploaded successfully',
        resume: {
          id: resume._id,
          filename: resume.filename,
          url: this.buildFileUrl(resume.path),
          // Analytics data from cv_evaluate API
          analytics: {
            cv_quality: stats.cv_quality || null,
            jd_match: stats.jd_match || null,
            key_takeaways: stats.key_takeaways || null,
            overall_score: stats.cv_quality?.overall_score || null
          },
          // Enhancement data from cv_improvement API
          enhancement: {
            tailored_resume: improvement.tailored_resume || null,
            top_1_percent_gap: improvement.top_1_percent_gap || null,
            cover_letter: improvement.cover_letter || null
          }
        }
      };
    } catch (error) {
      this.logger.error('💥 Resume upload failed:', error.message);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  @Get('health')
  async healthCheck() {
    this.logger.log('💚 Resume service health check called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'resume-service'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('files')
  async getUserFiles(@Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    
    // Get JDs from separate service
    let jobDescriptions = [];
    try {
      const jds = await this.jdService.getUserJobDescriptions(userId);
      jobDescriptions = jds.map(jd => ({
        id: jd._id,
        name: jd.filename,
        url: jd.url
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch job descriptions:', error.message);
    }
    
    return {
      resumes: resumes.map(resume => ({
        id: resume._id,
        name: resume.filename,
        url: resume.url
      })),
      jobDescriptions
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    
    // Transform resumes to include separated analytics and enhancement data
    const transformedResumes = resumes.map(resume => {
      const stats = resume.stats || {};
      const improvement = resume.improvement_resume || {};
      
      return {
        id: resume._id,
        filename: resume.filename,
        url: resume.url,
        // Analytics data from cv_evaluate API
        analytics: {
          cv_quality: stats.cv_quality || null,
          jd_match: stats.jd_match || null,
          key_takeaways: stats.key_takeaways || null,
          overall_score: stats.cv_quality?.overall_score || null
        },
        // Enhancement data from cv_improvement API
        enhancement: {
          tailored_resume: improvement.tailored_resume || null,
          top_1_percent_gap: improvement.top_1_percent_gap || null,
          cover_letter: improvement.cover_letter || null
        }
      };
    });
    
    return transformedResumes;
  }

  // Get resume analytics data
  @UseGuards(JwtAuthGuard)
  @Get('analytics/:id')
  async getResumeAnalytics(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    const targetResume = resumes.find(r => r._id.toString() === id);
    
    if (!targetResume) {
      throw new Error('Resume not found');
    }
    
    const stats = targetResume.stats || {};
    
    return {
      analytics: {
        cv_quality: stats.cv_quality || null,
        jd_match: stats.jd_match || null,
        key_takeaways: stats.key_takeaways || null,
        overall_score: stats.cv_quality?.overall_score || null
      }
    };
  }

  // Get AI enhancement data
  @UseGuards(JwtAuthGuard)
  @Get('enhancement/:id')
  async getResumeEnhancement(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    const targetResume = resumes.find(r => r._id.toString() === id);
    
    if (!targetResume) {
      throw new Error('Resume not found');
    }
    
    const improvement = targetResume.improvement_resume || {};
    
    return {
      enhancement: {
        tailored_resume: improvement.tailored_resume || null,
        top_1_percent_gap: improvement.top_1_percent_gap || null,
        cover_letter: improvement.cover_letter || null
      }
    };
  }

  private buildFileUrl(filePath: string): string {
    const appBaseUrl = process.env.APP_BASE_URL || process.env.APP_URL || 'http://localhost:3000';
    const normalized = filePath.replace(/\\/g, '/');
    return `${appBaseUrl}/${normalized}`;
  }

  // ✅ PATCH API to improve resume with JD later
  @UseGuards(JwtAuthGuard)
  @Patch('improve/:id')
  @UseInterceptors(
    FilesInterceptor('files', 1, { storage }),
    new TimeoutInterceptor(180000) // 3 minutes timeout for improvement
  )
  async improveResume(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jd_text') jdText: string,
  ) {
    this.logger.log(`🔄 Resume improvement API called for ID: ${id}`);
    
    try {
      const jdFile = files?.[0];
      const updatedResume = await this.resumeService.improveResume(
        id,
        jdFile,
        jdText,
      );
      
      this.logger.log('✅ Resume improved successfully');
      
      const stats = updatedResume.stats || {};
      const improvement = updatedResume.improvement_resume || {};
      
      return {
        message: 'Resume improved successfully',
        resume: {
          id: updatedResume._id,
          filename: updatedResume.filename,
          url: updatedResume.url,
          // Analytics data from cv_evaluate API
          analytics: {
            cv_quality: stats.cv_quality || null,
            jd_match: stats.jd_match || null,
            key_takeaways: stats.key_takeaways || null,
            overall_score: stats.cv_quality?.overall_score || null
          },
          // Enhancement data from cv_improvement API
          enhancement: {
            tailored_resume: improvement.tailored_resume || null,
            top_1_percent_gap: improvement.top_1_percent_gap || null,
            cover_letter: improvement.cover_letter || null
          }
        }
      };
    } catch (error) {
      this.logger.error('💥 Resume improvement failed:', error.message);
      throw error;
    }
  }

  // \u2705 DELETE API to delete resume and its stats
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteResume(@Param('id') id: string, @Req() req) {
    this.logger.log(`🗑️ Resume delete API called for ID: ${id}`);
    
    try {
      const userId = req.user.sub;
      const result = await this.resumeService.deleteResume(id, userId);
      
      this.logger.log('✅ Resume deleted successfully');
      return result;
    } catch (error) {
      this.logger.error('💥 Resume deletion failed:', error.message);
      throw error;
    }
  }
}
