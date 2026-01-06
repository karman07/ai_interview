import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobDescriptionService } from './job-description.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configure multer for JD uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as any).user?.sub || 'unknown';
    const uploadPath = `./uploads/job-descriptions/${userId}`;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    cb(null, `${timestamp}-${nameWithoutExt}${ext}`);
  }
});

@Controller('job-description')
export class JobDescriptionController {
  private readonly logger = new Logger(JobDescriptionController.name);

  constructor(private jdService: JobDescriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { storage }),
    new TimeoutInterceptor(180000)
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('jd_text') jdText: string,
    @Req() req,
  ) {
    this.logger.log('🚀 JD upload API called');
    this.logger.log(`📁 File received: ${!!file}`);
    this.logger.log(`📝 JD text provided: ${!!jdText}`);

    try {
      const userId = req.user.sub;
      const jd = await this.jdService.uploadJobDescription(file, jdText, userId);

      this.logger.log('✅ Job description uploaded successfully');
      return { message: 'Job description uploaded successfully', jobDescription: jd };
    } catch (error) {
      this.logger.error('💥 JD upload failed:', error.message);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getUserJobDescriptions(@Req() req) {
    const userId = req.user.sub;
    const jds = await this.jdService.getUserJobDescriptions(userId);
    
    return {
      jobDescriptions: jds.map(jd => ({
        id: jd._id,
        name: jd.filename,
        url: jd.url
      }))
    };
  }
}