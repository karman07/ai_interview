import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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
   * Submit answer to a session question
   */
  @Post('session/:sessionId/answer')
  async submitSessionAnswer(
    @Param('sessionId') sessionId: string,
    @Body()
    payload: {
      question_id: string;
      text: string;
      audio_url?: string;
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
   * DELETE /ai-interview/session/:sessionId
   * Delete a session
   */
  @Delete('session/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    return this.aiInterviewApi.deleteSession(sessionId);
  }
}
