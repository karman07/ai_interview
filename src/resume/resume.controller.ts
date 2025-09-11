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

  // ✅ PATCH API to improve resume with JD later
  @UseGuards(JwtAuthGuard)
  @Patch('improve/:id')
  @UseInterceptors(FilesInterceptor('files', 1, { dest: './uploads' }))
  async improveResume(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jd_text') jdText: string,
  ) {
    const jdFile = files?.[0];
    const updatedResume = await this.resumeService.improveResume(
      id,
      jdFile,
      jdText,
    );
    return { message: 'Resume improved successfully', resume: updatedResume };
  }
}
