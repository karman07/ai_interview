import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import * as multer from 'multer';
import * as path from 'path';

// Configure multer for audio/video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('audio/') ? './uploads/audio' : './uploads/video';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

@Controller('ai-interview')
@UseGuards(JwtAuthGuard)
export class AiInterviewController {
  constructor(private readonly aiInterviewApi: AiInterviewApiService) {}

  /**
   * POST /ai-interview/start
   * Start a new interview session
   */
  @Post('start')
  async startInterview(
    @Request() req,
    @Body()
    payload: {
      user_id: string;
      session_id: string;
      role_title: string;
      company_name: string;
      industry: string;
      jd: string;
      cv: string;
      round_type: 'technical' | 'behavioral' | 'hr' | 'full';
    },
  ) {
    const userId = req.user?.userId || req.user?.sub || payload.user_id;
    return this.aiInterviewApi.startInterview({ ...payload, user_id: userId });
  }

  /**
   * POST /ai-interview/answer
   * Submit an answer to the current question
   */
  @Post('answer')
  async submitAnswer(
    @Request() req,
    @Body()
    payload: {
      user_id: string;
      session_id: string;
      answer: string;
    },
  ) {
    const userId = req.user?.userId || req.user?.sub || payload.user_id;
    return this.aiInterviewApi.submitAnswer({ ...payload, user_id: userId });
  }

  /**
   * GET /ai-interview/state/:userId/:sessionId
   * Get current interview state
   */
  @Get('state/:userId/:sessionId')
  async getState(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiInterviewApi.getInterviewState(userId, sessionId);
  }

  /**
   * GET /ai-interview/report/:userId/:sessionId
   * Get final interview report
   */
  @Get('report/:userId/:sessionId')
  async getReport(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiInterviewApi.getInterviewReport(userId, sessionId);
  }

  /**
   * GET /ai-interview/sessions/:userId
   * List all sessions for a user
   */
  @Get('sessions/:userId')
  async listSessions(@Param('userId') userId: string) {
    return this.aiInterviewApi.listUserSessions(userId);
  }

  /**
   * GET /ai-interview/sessions
   * List all sessions
   */
  @Get('sessions')
  async listAllSessions() {
    return this.aiInterviewApi.listAllSessions();
  }

  /**
   * POST /ai-interview/session/create
   * Create a new session
   */
  @Post('session/create')
  async createSession(
    @Request() req,
    @Body()
    payload: {
      role: string;
      industry: string;
      company: string;
      cv_file_id?: string;
      jd_file_id?: string;
    },
  ) {
    return this.aiInterviewApi.createSession(payload);
  }

  /**
   * GET /ai-interview/session/:sessionId
   * Get session details
   */
  @Get('session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return this.aiInterviewApi.getSessionDetails(sessionId);
  }

  /**
   * GET /ai-interview/session/:sessionId/next-question
   * Get next question in session
   */
  @Get('session/:sessionId/next-question')
  async getNextQuestion(@Param('sessionId') sessionId: string) {
    return this.aiInterviewApi.getNextQuestion(sessionId);
  }

  /**
   * POST /ai-interview/session/:sessionId/answer
   * Submit answer to a session question with optional audio/video
   */
  @Post('session/:sessionId/answer')
  async submitSessionAnswer(
    @Param('sessionId') sessionId: string,
    @Body()
    payload: {
      question_id: string;
      text: string;
      audio_url?: string;
      video_url?: string;
      response_duration?: number;
    },
  ) {
    return this.aiInterviewApi.submitSessionAnswer(sessionId, payload);
  }

  /**
   * GET /ai-interview/session/:sessionId/report
   * Get session report
   */
  @Get('session/:sessionId/report')
  async getSessionReport(@Param('sessionId') sessionId: string) {
    return this.aiInterviewApi.getSessionReport(sessionId);
  }

  /**
   * POST /ai-interview/session/:sessionId/upload-response
   * Upload audio/video response for a question
   */
  @Post('session/:sessionId/upload-response')
  @UseInterceptors(
    FilesInterceptor('files', 2, { storage }),
    new TimeoutInterceptor(300000) // 5 minutes for media upload
  )
  async uploadResponse(
    @Param('sessionId') sessionId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() payload: {
      question_id: string;
      text?: string;
      response_duration?: number;
    },
  ) {
    const audioFile = files?.find(f => f.mimetype.startsWith('audio/'));
    const videoFile = files?.find(f => f.mimetype.startsWith('video/'));
    
    const response = {
      question_id: payload.question_id,
      text: payload.text || '',
      audio_url: audioFile ? `/uploads/audio/${audioFile.filename}` : undefined,
      video_url: videoFile ? `/uploads/video/${videoFile.filename}` : undefined,
      response_duration: payload.response_duration ? parseInt(payload.response_duration.toString()) : undefined,
    };
    
    return this.aiInterviewApi.submitSessionAnswer(sessionId, response);
  }

  /**
   * DELETE /ai-interview/session/:sessionId
   * Delete a session
   */
  @Delete('session/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    return this.aiInterviewApi.deleteSession(sessionId);
  }
}
