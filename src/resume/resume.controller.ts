import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Req, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('resume')
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads', // folder where files are stored
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new Error('File is required');

    // req.user.sub comes from JwtAuthGuard
    const userId = req.user.sub; 
    const resume = await this.resumeService.uploadResume(file, userId);
    return { message: 'Resume uploaded successfully', resume };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req) {
    const userId = req.user.sub;
    const resumes = await this.resumeService.getUserResumes(userId);
    return resumes;
  }
}
