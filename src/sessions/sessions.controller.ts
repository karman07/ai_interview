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
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Result, ResultDocument } from '../results/schemas/result.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

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

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listSessions() {
    this.logger.log('📋 List sessions API called');
    return { sessions: [] };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSession(@Body() payload: SessionCreate, @Req() req) {
    this.logger.log('🆕 Create session API called');

    const userId = req.user.sub;
    const user = await this.userModel.findById(userId).populate('subscriptionPlan').exec();

    // Count completed interviews (results)
    const interviewCount = await this.resultModel.countDocuments({ owner: new Types.ObjectId(userId) });

    let limit = 5; // Default free limit
    if (user?.subscriptionPlan) {
      const plan = user.subscriptionPlan as any;
      const limitFeature = plan.features?.find(f => f.name === 'Interview Limit');
      if (limitFeature) {
        limit = limitFeature.value ?? limitFeature.limit ?? 50;
      }
    }

    if (interviewCount >= limit) {
      this.logger.warn(`🚫 User ${userId} reached interview limit of ${limit} (current: ${interviewCount})`);
      throw new BadRequestException(`You have reached your limit of ${limit} interviews. Please upgrade your plan to take more.`);
    }

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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async deleteSession(@Param('session_id') sessionId: string) {
    this.logger.log(`🗑️ Delete session API called: ${sessionId}`);
    return { message: 'Session deleted successfully' };
  }

  @Get(':session_id/next-question')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async addJdText(
    @Param('session_id') sessionId: string,
    @Body() jdData: any
  ) {
    this.logger.log(`📝 Add JD text API called: ${sessionId}`);
    return { message: 'JD text added successfully' };
  }
}