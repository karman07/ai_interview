import { Controller, Post, Get, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { InterviewSessionService } from '../services/interview-session.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from '../../resume/resume.schema';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configure multer for audio uploads - no disk storage, just pass through
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept audio files
  if (file.mimetype.startsWith('audio/') || 
      file.originalname.match(/\.(wav|mp3|m4a|ogg|webm|flac)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

// Base class with shared methods
class BaseInterviewController {
  protected readonly logger = new Logger(BaseInterviewController.name);
  
  constructor(
    protected readonly aiInterviewApi: AiInterviewApiService,
    protected readonly resumeModel: Model<ResumeDocument>,
    protected readonly sessionService: InterviewSessionService,
  ) {}

  // Get user's best CV based on highest overall score
  protected async getBestUserCV(userId: string): Promise<{ path: string; filename: string } | null> {
    try {
      const resumes = await this.resumeModel.find({ user: userId }).sort({ createdAt: -1 });
      
      if (!resumes.length) return null;
      
      // Find resume with highest overall score
      let bestResume = resumes[0];
      let highestScore = 0;
      
      for (const resume of resumes) {
        const overallScore = resume.stats?.overall_score || resume.stats?.score || 0;
        if (overallScore > highestScore) {
          highestScore = overallScore;
          bestResume = resume;
        }
      }
      
      // Check if file exists
      if (fs.existsSync(bestResume.path)) {
        return {
          path: bestResume.path,
          filename: bestResume.filename
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting best CV:', error);
      return null;
    }
  }
}

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class AiInterviewController extends BaseInterviewController {
  constructor(
    aiInterviewApi: AiInterviewApiService,
    @InjectModel(Resume.name) resumeModel: Model<ResumeDocument>,
    sessionService: InterviewSessionService,
  ) {
    super(aiInterviewApi, resumeModel, sessionService);
  }

  /**
   * POST /interview/start
   * Start a new interview session with CV/JD IDs
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
      cv_id: string;  // Required MongoDB ObjectId for resume
      jd_id: string;  // Required MongoDB ObjectId for job description
      round_type: 'technical' | 'behavioral' | 'hr' | 'full';
    },
  ) {
    const userId = req.user?.userId || req.user?.sub || payload.user_id;
    console.log(`🤖 Interview API started - start endpoint called for user: ${userId}`);
    console.log('📋 Request data:', JSON.stringify(payload, null, 2));
    try {
      // Fetch CV content by cv_id
      const bestCV = await this.getBestUserCV(userId);
      let cvContent = '';
      
      if (bestCV) {
        cvContent = bestCV.path;
        console.log('📄 Using best CV from database:', bestCV.filename);
      }
      
      // TODO: Implement JD content fetching by jd_id
      // For now, use empty JD content
      const jdContent = '';
      
      return await this.aiInterviewApi.startInterview({ 
        ...payload, 
        user_id: userId,
        cv: cvContent,
        jd: jdContent
      });
    } catch (error) {
      this.logger.error('Start interview failed:', error.message);
      throw new HttpException(error.message || 'Failed to start interview', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * POST /interview/answer
   * Submit an answer with audio file (voice analysis integration)
   */
  @Post('answer')
  @UseInterceptors(
    FileInterceptor('audio_file', { 
      storage,
      fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
      }
    }),
    new TimeoutInterceptor(180000) // 3 minutes timeout for audio processing
  )
  async submitAnswer(
    @Request() req,
    @UploadedFile() audioFile: Express.Multer.File,
    @Body()
    payload: {
      user_id: string;
      session_id: string;
    },
  ) {
    try {
      const userId = req.user?.userId || req.user?.sub || payload.user_id;
      console.log(`🎤 Audio answer submission for user: ${userId}`);
      console.log('📁 Audio file details:', {
        originalname: audioFile?.originalname,
        mimetype: audioFile?.mimetype,
        size: audioFile?.size,
        path: audioFile?.path
      });
      
      if (!audioFile) {
        throw new HttpException('Audio file is required for voice analysis', HttpStatus.BAD_REQUEST);
      }
      
      // Validate audio file
      if (!audioFile.mimetype.startsWith('audio/') && 
          !audioFile.originalname.match(/\.(wav|mp3|m4a|ogg|webm|flac)$/i)) {
        throw new HttpException('Invalid audio file format. Supported: wav, mp3, m4a, ogg, webm, flac', HttpStatus.BAD_REQUEST);
      }
      
      return await this.aiInterviewApi.submitVoiceAnswer({
        user_id: userId,
        session_id: payload.session_id,
        audio_buffer: audioFile.buffer,
        audio_mimetype: audioFile.mimetype,
        audio_originalname: audioFile.originalname
      });
    } catch (error) {
      this.logger.error('Submit voice answer failed:', error.message);
      throw new HttpException(error.message || 'Failed to submit voice answer', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /interview/state/:userId/:sessionId
   * Get current interview state
   */
  @Get('state/:userId/:sessionId')
  async getState(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      return await this.aiInterviewApi.getInterviewState(userId, sessionId);
    } catch (error) {
      this.logger.error('Get interview state failed:', error.message);
      throw new HttpException(error.message || 'Failed to get interview state', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /interview/report/:userId/:sessionId
   * Get final interview report
   */
  @Get('report/:userId/:sessionId')
  async getReport(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      return await this.aiInterviewApi.getInterviewReport(userId, sessionId);
    } catch (error) {
      this.logger.error('Get interview report failed:', error.message);
      throw new HttpException(error.message || 'Failed to get interview report', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /interview/sessions/:userId
   * List all sessions for a user
   */
  @Get('sessions/:userId')
  async listSessions(@Param('userId') userId: string) {
    try {
      return await this.aiInterviewApi.listUserSessions(userId);
    } catch (error) {
      this.logger.error('List user sessions failed:', error.message);
      throw new HttpException(error.message || 'Failed to list sessions', HttpStatus.BAD_REQUEST);
    }
  }
}

// Backward compatibility controller for old /ai-interview/ endpoints
@Controller('ai-interview')
@UseGuards(JwtAuthGuard)
export class AiInterviewLegacyController extends BaseInterviewController {
  constructor(
    aiInterviewApi: AiInterviewApiService,
    @InjectModel(Resume.name) resumeModel: Model<ResumeDocument>,
    sessionService: InterviewSessionService,
  ) {
    super(aiInterviewApi, resumeModel, sessionService);
  }

  /**
   * POST /ai-interview/start (Legacy endpoint)
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
      cv: string;  // CV ID
      jd: string;  // JD ID
      round_type: 'technical' | 'behavioral' | 'hr' | 'full';
    },
  ) {
    const userId = req.user?.userId || req.user?.sub || payload.user_id;
    console.log('🤖 === LEGACY INTERVIEW START DEBUG ===');
    console.log('👤 User ID from request:', userId);
    console.log('📋 Frontend payload:', JSON.stringify(payload, null, 2));
    
    try {
      const finalPayload = { 
        ...payload, 
        user_id: userId
      };
      
      console.log('🚀 Sending to AI service:', JSON.stringify(finalPayload, null, 2));
      
      const response = await this.aiInterviewApi.startInterview(finalPayload);
      
      // Save initial session to database
      await this.sessionService.saveSession({
        user_id: userId,
        session_id: payload.session_id,
        role_title: payload.role_title,
        company_name: payload.company_name,
        industry: payload.industry,
        round_type: payload.round_type,
        status: 'active',
        total_questions: 0,
        answered_questions: 0,
        created_at: new Date()
      });
      
      return response;
    } catch (error) {
      console.log('❌ Legacy start interview error:', error.message);
      this.logger.error('Start interview failed:', error.message);
      
      throw new HttpException(error.message || 'Failed to start interview', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * POST /ai-interview/session/:sessionId/next-question (Legacy endpoint)
   */
  @Post('session/:sessionId/next-question')
  async getNextQuestion(@Param('sessionId') sessionId: string) {
    try {
      return await this.aiInterviewApi.getNextQuestion(sessionId);
    } catch (error) {
      this.logger.error('Get next question failed:', error.message);
      throw new HttpException(error.message || 'Failed to get next question', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * POST /ai-interview/answer (Legacy endpoint)
   */
  @Post('answer')
  @UseInterceptors(
    FileInterceptor('audio_file', { 
      storage,
      fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
      }
    }),
    new TimeoutInterceptor(180000)
  )
  async submitAnswer(
    @Request() req,
    @UploadedFile() audioFile: Express.Multer.File,
    @Body()
    payload: {
      user_id: string;
      session_id: string;
    },
  ) {
    try {
      const userId = req.user?.userId || req.user?.sub || payload.user_id;
      console.log(`🎤 Legacy audio answer submission for user: ${userId}`);
      console.log('📁 Audio file details:', {
        originalname: audioFile?.originalname,
        mimetype: audioFile?.mimetype,
        size: audioFile?.size,
        path: audioFile?.path,
        hasBuffer: !!audioFile?.buffer,
        bufferLength: audioFile?.buffer?.length
      });
      
      if (!audioFile) {
        throw new HttpException('Audio file is required for voice analysis', HttpStatus.BAD_REQUEST);
      }
      
      if (!audioFile.buffer) {
        throw new HttpException('Audio buffer is missing', HttpStatus.BAD_REQUEST);
      }
      
      // Validate audio file
      if (!audioFile.mimetype.startsWith('audio/') && 
          !audioFile.originalname.match(/\.(wav|mp3|m4a|ogg|webm|flac)$/i)) {
        throw new HttpException('Invalid audio file format. Supported: wav, mp3, m4a, ogg, webm, flac', HttpStatus.BAD_REQUEST);
      }
      
      const aiResponse = await this.aiInterviewApi.submitVoiceAnswer({
        user_id: userId,
        session_id: payload.session_id,
        audio_buffer: audioFile.buffer,
        audio_mimetype: audioFile.mimetype,
        audio_originalname: audioFile.originalname
      });
      
      console.log('🔍 AI Response received:', JSON.stringify(aiResponse, null, 2));
      
      // Save only answered questions (those with evaluation) to avoid duplicates
      if (aiResponse.state?.history && Array.isArray(aiResponse.state.history)) {
        const answeredQuestions = aiResponse.state.history.filter(item => item.evaluation && item.answer);
        console.log('💾 Saving', answeredQuestions.length, 'answered questions from history');
        
        // Clear existing questions for this session to avoid duplicates
        const session = await this.sessionService.getSession(payload.session_id);
        if (session) {
          await this.sessionService.clearSessionQuestions(session._id);
        }
        
        for (const item of answeredQuestions) {
          await this.sessionService.saveQuestionAnswer({
            user_id: userId,
            session_id: payload.session_id,
            question: item.question,
            transcription: item.evaluation?.transcribed_text || item.transcribed_text,
            evaluation: item.evaluation,
            voice_metrics: item.evaluation?.communication_evaluation?.voice_metrics
          });
        }
      }
      
      // Save session state with proper status and scores
      let avgScores = null;
      if (aiResponse.state) {
        // Calculate average score from history if avg_scores not provided
        avgScores = aiResponse.state.avg_scores;
        if (!avgScores && aiResponse.state.history) {
          const answeredQuestions = aiResponse.state.history.filter(h => h.evaluation?.total_score);
          if (answeredQuestions.length > 0) {
            const totalScore = answeredQuestions.reduce((sum, h) => sum + (h.evaluation.total_score || 0), 0);
            const avgScore = totalScore / answeredQuestions.length;
            avgScores = {
              overall: Number(avgScore.toFixed(2)),
              communication: Number((answeredQuestions.reduce((sum, h) => sum + (h.evaluation.communication_evaluation?.voice_scores?.total || 0), 0) / answeredQuestions.length).toFixed(2)),
              technical: Number((answeredQuestions.reduce((sum, h) => sum + (h.evaluation.technical_evaluation?.technical_depth || 0), 0) / answeredQuestions.length).toFixed(2))
            };
          }
        }
        
        const sessionData = {
          user_id: userId,
          session_id: payload.session_id,
          role_title: aiResponse.state.role_title,
          company_name: aiResponse.state.company_name,
          industry: aiResponse.state.industry,
          round_type: aiResponse.state.round_type,
          status: aiResponse.state.completed === true || aiResponse.continue_interview === false || !aiResponse.next_question ? 'completed' : 'active',
          total_questions: aiResponse.state.history?.filter(h => h.evaluation).length || 0,
          answered_questions: aiResponse.state.history?.filter(h => h.evaluation).length || 0,
          avg_scores: avgScores,
          created_at: aiResponse.state.created_at || new Date()
        };
        
        console.log('💾 Saving session with data:');
        console.log('  - status:', sessionData.status);
        console.log('  - completed flag:', aiResponse.state.completed);
        console.log('  - continue_interview:', aiResponse.continue_interview);
        console.log('  - avg_scores:', JSON.stringify(sessionData.avg_scores));
        console.log('  - total_questions:', sessionData.total_questions);
        
        await this.sessionService.saveSession(sessionData);
      }
      
      // Check if interview is complete and update session accordingly
      if (aiResponse.continue_interview === false || !aiResponse.next_question) {
        console.log('🏁 Interview completed - updating session status');
        
        // Update session to completed status
        const session = await this.sessionService.getSession(payload.session_id);
        if (session && session.status !== 'completed') {
          await this.sessionService.saveSession({
            user_id: userId,
            session_id: payload.session_id,
            role_title: aiResponse.state.role_title,
            company_name: aiResponse.state.company_name,
            industry: aiResponse.state.industry,
            round_type: aiResponse.state.round_type,
            status: 'completed',
            total_questions: aiResponse.state.history?.filter(h => h.evaluation).length || 0,
            answered_questions: aiResponse.state.history?.filter(h => h.evaluation).length || 0,
            avg_scores: avgScores,
            created_at: aiResponse.state.created_at || new Date()
          });
        }
      }
      
      // Handle next question or completion
      const response = {
        ...aiResponse,
        has_next_question: !!aiResponse.next_question,
        interview_status: aiResponse.continue_interview === false ? 'completed' : 'active'
      };
      
      console.log('📤 Sending response to frontend:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      this.logger.error('Submit voice answer failed:', error.message);
      
      const userId = req.user?.userId || req.user?.sub || payload.user_id;
      
      throw new HttpException(error.message || 'Failed to submit voice answer', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /ai-interview/state/:userId/:sessionId (Legacy endpoint)
   */
  @Get('state/:userId/:sessionId')
  async getState(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      return await this.aiInterviewApi.getInterviewState(userId, sessionId);
    } catch (error) {
      this.logger.error('Get interview state failed:', error.message);
      throw new HttpException(error.message || 'Failed to get interview state', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /ai-interview/report/:userId/:sessionId (Legacy endpoint)
   */
  @Get('report/:userId/:sessionId')
  async getReport(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      return await this.aiInterviewApi.getInterviewReport(userId, sessionId);
    } catch (error) {
      this.logger.error('Get interview report failed:', error.message);
      throw new HttpException(error.message || 'Failed to get interview report', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /ai-interview/sessions/:userId (Legacy endpoint)
   */
  @Get('sessions/:userId')
  async listSessions(@Param('userId') userId: string) {
    try {
      return await this.aiInterviewApi.listUserSessions(userId);
    } catch (error) {
      this.logger.error('List user sessions failed:', error.message);
      throw new HttpException(error.message || 'Failed to list sessions', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /ai-interview/history/:userId - Get interview history with analytics
   */
  @Get('history/:userId')
  async getInterviewHistory(@Param('userId') userId: string) {
    return await this.sessionService.getHistory(userId);
  }

  /**
   * GET /ai-interview/dashboard/:userId - Get dashboard analytics
   */
  @Get('dashboard/:userId')
  async getDashboard(@Param('userId') userId: string) {
    return await this.sessionService.getDashboard(userId);
  }

  /**
   * GET /ai-interview/debug/:sessionId - Debug endpoint to check saved data
   */
  @Get('debug/:sessionId')
  async debugSession(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.getSession(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }
    
    const questions = await this.sessionService.getSessionQuestions(session._id);
    
    return {
      session: {
        sessionId: session.sessionId,
        status: session.status,
        scores: session.scores,
        metrics: session.metrics,
        questionCount: session.questions.length
      },
      questions: questions.map(q => ({
        question: q.questionText,
        answer: q.answerText,
        score: q.scores?.overall,
        feedback: q.feedback
      }))
    };
  }

  /**
   * GET /ai-interview/session-report/:sessionId - Get detailed session report
   */
  @Get('session-report/:sessionId')
  async getSessionReport(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.getSession(sessionId);
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
    
    const questions = await this.sessionService.getSessionQuestions(session._id);
    
    // Calculate overall statistics
    const totalScore = questions.reduce((sum, q) => sum + (q.scores?.overall || 0), 0);
    const avgScore = questions.length > 0 ? totalScore / questions.length : 0;
    
    // Collect all feedback and suggestions
    const allFeedback = questions.map(q => q.feedback).filter(f => f);
    const allSuggestions = questions.flatMap(q => q.improvements || []);
    
    // Get unique suggestions
    const uniqueSuggestions = [...new Set(allSuggestions)];
    
    return {
      sessionId: session.sessionId,
      roleTitle: session.jobContext.roleTitle,
      companyName: session.jobContext.companyName,
      industry: session.jobContext.industry,
      roundType: session.roundType,
      status: session.status,
      overallScore: Number(avgScore.toFixed(2)),
      totalQuestions: questions.length,
      completedAt: session.completedAt,
      
      scores: {
        overall: Number(avgScore.toFixed(2)),
        communication: Number((questions.reduce((sum, q) => sum + (q.scores?.communication || 0), 0) / questions.length).toFixed(2)),
        technical: Number((questions.reduce((sum, q) => sum + (q.scores?.technical || 0), 0) / questions.length).toFixed(2))
      },
      
      areasForImprovement: uniqueSuggestions,
      
      questions: questions.map(q => ({
        question: q.questionText,
        answer: q.answerText,
        transcription: q.audioAnalysis?.transcription,
        score: q.scores?.overall || 0,
        feedback: q.feedback,
        suggestions: q.improvements || [],
        voiceMetrics: q.audioAnalysis ? {
          clarity: q.audioAnalysis.speechClarity,
          pace: q.audioAnalysis.paceScore,
          confidence: q.audioAnalysis.confidenceLevel,
          duration: q.audioAnalysis.duration
        } : null
      }))
    };
  }
}