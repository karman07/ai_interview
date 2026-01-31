import { Controller, Post, Get, Param, Body, UploadedFile, UploadedFiles, UseInterceptors, Req, Res, HttpStatus, Query } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { memoryStorage } from 'multer';

@Controller('v2/interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('start')
  @UseInterceptors(AnyFilesInterceptor({
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 5, // Max 5 files
    },
  }))
  async startInterview(@Req() req, @Res() res) {
    // Accepts multipart/form-data: role, company, resume_file, jd_file, resume_text, jd_text
    try {
      const result = await this.interviewService.startInterview(req);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  @Post(':session_id/answer')
  @UseInterceptors(AnyFilesInterceptor({
    storage: memoryStorage(),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB max for audio files
      files: 3,
    },
  }))
  async submitAnswer(@Param('session_id') sessionId: string, @Req() req, @Res() res) {
    // Accepts multipart/form-data: answer, answer_audio
    try {
      const result = await this.interviewService.submitAnswer(sessionId, req);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  @Get(':session_id/status')
  async getStatus(@Param('session_id') sessionId: string, @Res() res) {
    try {
      const result = await this.interviewService.getStatus(sessionId);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ status: 'not_found' });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  @Post(':session_id/complete')
  async completeInterview(@Param('session_id') sessionId: string, @Body() body, @Res() res) {
    try {
      const result = await this.interviewService.completeInterview(sessionId, body);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status === 404) {
        return res.status(HttpStatus.NOT_FOUND).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }
}
