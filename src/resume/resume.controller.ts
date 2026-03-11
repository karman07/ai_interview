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
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';

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
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage,
      limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit for 7+ pages and JD
    }),
    new TimeoutInterceptor(300000) // 5 minutes timeout for processing
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jd_text') jdText: string,
    @Req() req,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new Error('At least one file (resume) is required');
      }

      const userId = req.user.sub;
      const resumeFile = files[0];
      const jdFile = files.length > 1 ? files[1] : undefined;

      let resume;
      try {
        const token = req.headers?.authorization;
        resume = await this.resumeService.uploadResume(
          resumeFile,
          jdFile,
          jdText,
          userId,
          token
        );
      } catch (serviceError) {
        throw new Error(`Resume validation failed: ${serviceError.message}`);
      }

      const stats = resume.stats || {};
      const improvement = resume.improvement_resume || {};

      return {
        message: 'Resume uploaded successfully',
        resume: {
          id: resume._id,
          filename: resume.filename,
          url: this.buildFileUrl(resume.path),
          text: resume.text || "",
          createdAt: resume.createdAt,
          analytics: {
            cv_quality: stats.cv_quality || null,
            jd_match: stats.jd_match || null,
            key_takeaways: stats.key_takeaways || null,
            overall_score: stats.cv_quality?.overall_score || null
          },
          enhancement: {
            tailored_resume: improvement.tailored_resume || null,
            top_1_percent_gap: improvement.top_1_percent_gap || null,
            cover_letter: improvement.cover_letter || null
          }
        }
      };
    } catch (error) {
      this.logger.error('💥 Resume upload failed:', error.message);
      throw error;
    }
  }

  @Get('health')
  async healthCheck() {
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
    return {
      resumes: resumes.map(resume => ({
        id: resume._id,
        name: resume.filename,
        url: resume.url,
        text: resume.text || "",
        createdAt: resume.createdAt
      })),
      jobDescriptions: []
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);

    return resumes.map(resume => {
      const stats = resume.stats || {};
      const improvement = resume.improvement_resume || {};

      return {
        id: resume._id,
        filename: resume.filename,
        url: resume.url,
        text: resume.text || "",
        createdAt: resume.createdAt,
        analytics: {
          cv_quality: stats.cv_quality || null,
          jd_match: stats.jd_match || null,
          key_takeaways: stats.key_takeaways || null,
          overall_score: stats.cv_quality?.overall_score || null
        },
        enhancement: {
          tailored_resume: improvement.tailored_resume || null,
          top_1_percent_gap: improvement.top_1_percent_gap || null,
          cover_letter: improvement.cover_letter || null
        }
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/:id')
  async getResumeAnalytics(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    const targetResume = resumes.find(r => r._id.toString() === id);

    if (!targetResume) throw new Error('Resume not found');

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

  @UseGuards(JwtAuthGuard)
  @Get('enhancement/:id')
  async getResumeEnhancement(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    const targetResume = resumes.find(r => r._id.toString() === id);

    if (!targetResume) throw new Error('Resume not found');

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
    const appBaseUrl = process.env.APP_BASE_URL || process.env.APP_URL || 'http://api.aiforjob.ai';
    const normalized = filePath.replace(/\\/g, '/');
    return `${appBaseUrl}/${normalized}`;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('improve/:id')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }
    }),
    new TimeoutInterceptor(300000)
  )
  async improveResume(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jd_text') jdText: string,
    @Req() req: any,
  ) {
    try {
      const jdFile = files?.[0];
      const token = req.headers?.authorization;
      const updatedResume = await this.resumeService.improveResume(
        id,
        jdFile,
        jdText,
        token
      );

      const stats = updatedResume.stats || {};
      const improvement = updatedResume.improvement_resume || {};

      return {
        message: 'Resume improved successfully',
        resume: {
          id: updatedResume._id,
          filename: updatedResume.filename,
          url: updatedResume.url,
          analytics: {
            cv_quality: stats.cv_quality || null,
            jd_match: stats.jd_match || null,
            key_takeaways: stats.key_takeaways || null,
            overall_score: stats.cv_quality?.overall_score || null
          },
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteResume(@Param('id') id: string, @Req() req) {
    try {
      const userId = req.user.sub;
      return await this.resumeService.deleteResume(id, userId);
    } catch (error) {
      this.logger.error('💥 Resume deletion failed:', error.message);
      throw error;
    }
  }

  @Post('final-enhanced')
  async createFinalEnhanced(@Body() body: any) {
    try {
      if (!body.resume) throw new BadRequestException('Resume data is required');

      return {
        message: body.message || 'Resume processed successfully',
        resume: {
          id: body.resume.id,
          filename: body.resume.filename,
          url: body.resume.url,
          analytics: {
            cv_quality: body.resume.analytics?.cv_quality || null,
            jd_match: body.resume.analytics?.jd_match || null,
            key_takeaways: body.resume.analytics?.key_takeaways || null,
            overall_score: body.resume.analytics?.overall_score || null
          },
          enhancement: {
            tailored_resume: body.resume.enhancement?.tailored_resume || null,
            top_1_percent_gap: body.resume.enhancement?.top_1_percent_gap || null,
            cover_letter: body.resume.enhancement?.cover_letter || null
          }
        }
      };
    } catch (error) {
      this.logger.error('💥 Final-enhanced processing failed:', error.message);
      throw error;
    }
  }
}
