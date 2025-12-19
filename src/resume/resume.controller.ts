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
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor';

@Controller('resume')
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);

  constructor(private resumeService: ResumeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 2, { dest: './uploads' }),
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

      this.logger.log('⏳ Starting resume processing...');
      const resume = await this.resumeService.uploadResume(
        resumeFile,
        jdFile,
        jdText,
        userId,
      );

      this.logger.log('✅ Resume uploaded and processed successfully');
      return { message: 'Resume uploaded successfully', resume };
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
  @Get('history')
  async getHistory(@Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    return resumes;
  }

  // ✅ PATCH API to improve resume with JD later
  @UseGuards(JwtAuthGuard)
  @Patch('improve/:id')
  @UseInterceptors(
    FilesInterceptor('files', 1, { dest: './uploads' }),
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
      return { message: 'Resume improved successfully', resume: updatedResume };
    } catch (error) {
      this.logger.error('💥 Resume improvement failed:', error.message);
      throw error;
    }
  }
}
