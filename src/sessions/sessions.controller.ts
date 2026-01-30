import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface SessionCreate {
  role: string;
  industry: string;
  company: string;
  cv_file_id?: string;
  jd_file_id?: string;
  jd_text?: string;
}

interface AnswerCreate {
  text?: string;
  audio_url?: string;
  question_id: string;
  session_id: string;
}

@Controller('v1/sessions')
export class SessionsController {
  private readonly logger = new Logger(SessionsController.name);

  @Get()
  async listSessions() {
    this.logger.log('📋 List sessions API called');
    return { sessions: [] };
  }

  @Post()
  async createSession(@Body() payload: SessionCreate) {
    this.logger.log('🆕 Create session API called');
    return {
      id: 'session_' + Date.now(),
      ...payload,
      status: 'active',
      current_question_index: 0,
      total_questions: 10,
      created_at: new Date().toISOString()
    };
  }

  @Get(':session_id')
  async getSession(@Param('session_id') sessionId: string) {
    this.logger.log(`🔍 Get session API called: ${sessionId}`);
    return {
      id: sessionId,
      status: 'active',
      current_question_index: 0,
      total_questions: 10
    };
  }

  @Delete(':session_id')
  async deleteSession(@Param('session_id') sessionId: string) {
    this.logger.log(`🗑️ Delete session API called: ${sessionId}`);
    return { message: 'Session deleted successfully' };
  }

  @Get(':session_id/next-question')
  async getNextQuestion(@Param('session_id') sessionId: string) {
    this.logger.log(`❓ Get next question API called: ${sessionId}`);
    return {
      question_id: 'q_' + Date.now(),
      text: 'Tell me about yourself.',
      competency: 'communication',
      difficulty: 'easy'
    };
  }

  @Post(':session_id/answer')
  async submitAnswer(
    @Param('session_id') sessionId: string,
    @Body() payload: AnswerCreate
  ) {
    this.logger.log(`💬 Submit answer API called: ${sessionId}`);
    return {
      evaluation: { score: 8.5 },
      next_question: 'What are your strengths?',
      feedback: 'Good answer!'
    };
  }

  @Get(':session_id/report')
  async getSessionReport(@Param('session_id') sessionId: string) {
    this.logger.log(`📊 Get session report API called: ${sessionId}`);
    return {
      id: 'report_' + Date.now(),
      session_id: sessionId,
      overall_score: 8.5,
      strengths: ['Good communication'],
      areas_for_improvement: ['Technical depth'],
      recommendations: ['Practice coding questions'],
      created_at: new Date().toISOString()
    };
  }

  @Post(':session_id/jd-text')
  async addJdText(
    @Param('session_id') sessionId: string,
    @Body() jdData: any
  ) {
    this.logger.log(`📝 Add JD text API called: ${sessionId}`);
    return { message: 'JD text added successfully' };
  }

  @Get('resume/:resume_id')
  async getResumeDetails(@Param('resume_id') resumeId: string) {
    this.logger.log(`📄 Get resume details API called: ${resumeId}`);
    return {
      id: resumeId,
      filename: 'resume.pdf',
      content: 'Resume content...'
    };
  }

  @Get('debug/resumes')
  async listAllResumes() {
    this.logger.log('🐛 Debug list all resumes API called');
    return { resumes: [] };
  }

  @Get('debug/resume/:resume_id')
  async debugGetResume(@Param('resume_id') resumeId: string) {
    this.logger.log(`🐛 Debug get resume API called: ${resumeId}`);
    return {
      id: resumeId,
      debug_info: 'Debug information...'
    };
  }
}