import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  Get,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('resume')
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 2, { dest: './uploads' }))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jd_text') jdText: string,
    @Req() req,
  ) {
    if (!files || files.length === 0) {
      throw new Error('At least one file (resume) is required');
    }

    const userId = req.user.sub;

    // First file is resume, second (optional) is JD file
    const resumeFile = files[0];
    const jdFile = files.length > 1 ? files[1] : undefined;

    const resume = await this.resumeService.uploadResume(
      resumeFile,
      jdFile,
      jdText,
      userId,
    );

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
