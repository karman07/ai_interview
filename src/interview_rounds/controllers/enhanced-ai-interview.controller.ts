import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile, 
  HttpException, 
  HttpStatus, 
  Logger,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { EnhancedInterviewAnalyticsService } from '../services/enhanced-interview-analytics.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from '../../resume/resume.schema';
import { JobDescription, JobDescriptionDocument } from '../../job-description/job-description.schema';
import { RoundType } from '../schemas/enhanced-interview-session.schema';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/audio';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/') || 
      file.originalname.match(/\.(wav|mp3|m4a|ogg|webm|flac)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

@Controller('enhanced-interview')
@UseGuards(JwtAuthGuard)
export class EnhancedAiInterviewController {
  private readonly logger = new Logger(EnhancedAiInterviewController.name);

  constructor(
    private readonly aiInterviewApi: AiInterviewApiService,
    private readonly analyticsService: EnhancedInterviewAnalyticsService,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(JobDescription.name) private jdModel: Model<JobDescriptionDocument>,
  ) {}

  /**
   * Get user's best CV based on highest overall score
   */
  private async getBestUserCV(userId: string): Promise<{ id: string; path: string; filename: string } | null> {
    try {
      const resumes = await this.resumeModel.find({ user: userId }).sort({ createdAt: -1 });
      
      if (!resumes.length) return null;
      
      let bestResume = resumes[0];
      let highestScore = 0;
      
      for (const resume of resumes) {
        const overallScore = resume.stats?.overall_score || resume.stats?.score || 0;
        if (overallScore > highestScore) {
          highestScore = overallScore;
          bestResume = resume;
        }
      }
      
      if (fs.existsSync(bestResume.path)) {
        return {
          id: bestResume._id.toString(),
          path: bestResume.path,
          filename: bestResume.filename
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error getting best CV:', error);
      return null;
    }
  }

  /**
   * Get user's job descriptions (only user's own JDs)
   */
  private async fetchUserJobDescriptions(userId: string): Promise<any[]> {
    try {
      const jds = await this.jdModel.find({ user: userId }).sort({ createdAt: -1 });
      return jds.map(jd => ({
        id: jd._id.toString(),
        filename: jd.filename,
        path: jd.path,
        content: jd.content
      }));
    } catch (error) {
      this.logger.error('Error getting user JDs:', error);
      return [];
    }
  }

  /**
   * POST /enhanced-interview/start
   * Start a new interview session with comprehensive tracking
   */
  @Post('start')
  async startInterview(
    @Request() req,
    @Body() payload: {
      session_id: string;
      role_title: string;
      company_name: string;
      industry: string;
      round_type: 'technical' | 'behavioral' | 'hr' | 'problem-solving' | 'full';
      jd_id?: string; // Optional JD ID
      resume_id?: string; // Optional resume ID
    },
  ) {
    const userId = req.user?.userId || req.user?.sub;
    this.logger.log(`🚀 Enhanced interview start for user: ${userId}`);
    this.logger.log(`📋 Payload:`, JSON.stringify(payload, null, 2));

    try {
      // Get best CV if no specific resume requested
      let resumeData = null;
      if (payload.resume_id) {
        const resume = await this.resumeModel.findOne({ 
          _id: payload.resume_id, 
          user: userId 
        });
        if (resume && fs.existsSync(resume.path)) {
          resumeData = {
            id: resume._id.toString(),
            path: resume.path,
            filename: resume.filename
          };
        }
      } else {
        resumeData = await this.getBestUserCV(userId);
      }

      // Get JD if specified (only user's own JDs)
      let jdData = null;
      if (payload.jd_id) {
        const jd = await this.jdModel.findOne({ 
          _id: payload.jd_id, 
          user: userId 
        });
        if (jd) {
          jdData = {
            id: jd._id.toString(),
            filename: jd.filename,
            path: jd.path,
            content: jd.content
          };
        }
      }

      // Create session in analytics
      const sessionData = {
        userId,
        sessionId: payload.session_id,
        roundType: payload.round_type as RoundType,
        jobContext: {
          roleTitle: payload.role_title,
          companyName: payload.company_name,
          industry: payload.industry,
          resumeId: resumeData?.id,
          jobDescriptionId: jdData?.id
        }
      };

      const session = await this.analyticsService.startSession(sessionData);

      // Start AI interview
      const aiPayload = {
        user_id: userId,
        session_id: payload.session_id,
        role_title: payload.role_title,
        company_name: payload.company_name,
        industry: payload.industry,
        round_type: payload.round_type === 'problem-solving' ? 'full' : payload.round_type as 'technical' | 'behavioral' | 'hr' | 'full',
        cv: resumeData?.path || '',
        jd: jdData?.content || ''
      };

      const aiResponse = await this.aiInterviewApi.startInterview(aiPayload);

      // Record first question if provided
      if (aiResponse.first_question) {
        await this.analyticsService.recordQuestion({
          sessionId: payload.session_id,
          userId,
          questionText: aiResponse.first_question,
          questionType: payload.round_type,
          questionAskedAt: new Date()
        });
      }

      return {
        ...aiResponse,
        session: {
          id: session._id,
          sessionId: payload.session_id,
          status: session.status,
          jobContext: session.jobContext
        },
        resume: resumeData ? {
          id: resumeData.id,
          filename: resumeData.filename
        } : null,
        jobDescription: jdData ? {
          id: jdData.id,
          filename: jdData.filename
        } : null
      };

    } catch (error) {
      this.logger.error('Enhanced interview start failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to start enhanced interview', 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * POST /enhanced-interview/answer
   * Submit answer with comprehensive analytics tracking
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
    @Body() payload: {
      session_id: string;
      text_answer?: string; // Optional text fallback
    },
  ) {
    const userId = req.user?.userId || req.user?.sub;
    this.logger.log(`🎤 Enhanced answer submission for user: ${userId}`);

    try {
      if (!audioFile && !payload.text_answer) {
        throw new HttpException(
          'Either audio file or text answer is required', 
          HttpStatus.BAD_REQUEST
        );
      }

      const startTime = Date.now();

      // Submit to AI service
      let aiResponse;
      if (audioFile) {
        aiResponse = await this.aiInterviewApi.submitVoiceAnswer({
          user_id: userId,
          session_id: payload.session_id,
          audio_file_path: audioFile.path
        });
      } else {
        aiResponse = await this.aiInterviewApi.submitAnswer({
          user_id: userId,
          session_id: payload.session_id,
          answer: payload.text_answer
        });
      }

      const responseTime = Math.floor((Date.now() - startTime) / 1000);

      // Extract scores and analysis from AI response
      const scores = {
        overall: aiResponse.evaluation?.overall_score || 0,
        communication: aiResponse.evaluation?.communication_score || 0,
        technical: aiResponse.evaluation?.technical_score || 0,
        behavioral: aiResponse.evaluation?.behavioral_score || 0,
        problemSolving: aiResponse.evaluation?.problem_solving_score || 0,
        clarity: aiResponse.evaluation?.clarity_score || 0,
        confidence: aiResponse.evaluation?.confidence_score || 0
      };

      const audioAnalysis = audioFile ? {
        transcription: aiResponse.transcription || '',
        speechClarity: aiResponse.audio_analysis?.speech_clarity || 0,
        paceScore: aiResponse.audio_analysis?.pace_score || 0,
        confidenceLevel: aiResponse.audio_analysis?.confidence_level || 0,
        duration: aiResponse.audio_analysis?.duration || 0,
        pauseCount: aiResponse.audio_analysis?.pause_count || 0,
        fillerWords: aiResponse.audio_analysis?.filler_words || 0
      } : undefined;

      // Record answer in analytics
      await this.analyticsService.recordAnswer({
        sessionId: payload.session_id,
        userId,
        answerText: payload.text_answer || aiResponse.transcription,
        audioFilePath: audioFile?.path,
        audioUrl: audioFile ? `/uploads/audio/${audioFile.filename}` : undefined,
        audioAnalysis,
        scores,
        feedback: aiResponse.feedback,
        strengths: aiResponse.strengths || [],
        improvements: aiResponse.improvements || [],
        responseTime,
        aiResponse
      });

      // Record next question if provided
      if (aiResponse.next_question) {
        await this.analyticsService.recordQuestion({
          sessionId: payload.session_id,
          userId,
          questionText: aiResponse.next_question,
          questionType: aiResponse.question_type,
          competency: aiResponse.competency,
          difficulty: aiResponse.difficulty,
          questionAskedAt: new Date()
        });
      }

      // Check if interview is complete
      if (aiResponse.interview_complete || aiResponse.continue_interview === false) {
        await this.analyticsService.completeSession(
          payload.session_id,
          scores,
          aiResponse
        );
      }

      return {
        ...aiResponse,
        analytics: {
          scores,
          audioAnalysis,
          responseTime,
          feedback: aiResponse.feedback,
          strengths: aiResponse.strengths || [],
          improvements: aiResponse.improvements || []
        }
      };

    } catch (error) {
      this.logger.error('Enhanced answer submission failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to submit enhanced answer', 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET /enhanced-interview/session/:sessionId
   * Get detailed session information with all questions and analytics
   */
  @Get('session/:sessionId')
  async getSessionDetails(@Param('sessionId') sessionId: string, @Request() req) {
    const userId = req.user?.userId || req.user?.sub;
    
    try {
      const sessionDetails = await this.analyticsService.getSessionDetails(sessionId);
      
      // Verify user owns this session
      if (sessionDetails.userId.toString() !== userId) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      }

      return sessionDetails;
    } catch (error) {
      this.logger.error('Get session details failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get session details', 
        HttpStatus.NOT_FOUND
      );
    }
  }

  /**
   * GET /enhanced-interview/sessions
   * Get user's interview sessions with pagination
   */
  @Get('sessions')
  async getUserSessions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const userId = req.user?.userId || req.user?.sub;
    
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      return await this.analyticsService.getUserSessions(userId, pageNum, limitNum);
    } catch (error) {
      this.logger.error('Get user sessions failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get user sessions', 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET /enhanced-interview/analytics
   * Get comprehensive user analytics dashboard
   */
  @Get('analytics')
  async getAnalyticsDashboard(@Request() req) {
    const userId = req.user?.userId || req.user?.sub;
    
    try {
      return await this.analyticsService.getAnalyticsDashboard(userId);
    } catch (error) {
      this.logger.error('Get analytics dashboard failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get analytics dashboard', 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET /enhanced-interview/job-descriptions
   * Get user's job descriptions (filtered by user)
   */
  @Get('job-descriptions')
  async getJobDescriptions(@Request() req) {
    const userId = req.user?.userId || req.user?.sub;
    
    try {
      const jds = await this.fetchUserJobDescriptions(userId);
      return {
        jobDescriptions: jds.map(jd => ({
          id: jd.id,
          filename: jd.filename,
          // Don't expose file paths for security
        }))
      };
    } catch (error) {
      this.logger.error('Get user job descriptions failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get job descriptions', 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET /enhanced-interview/resumes
   * Get user's resumes with scores
   */
  @Get('resumes')
  async getUserResumes(@Request() req) {
    const userId = req.user?.userId || req.user?.sub;
    
    try {
      const resumes = await this.resumeModel.find({ user: userId })
        .sort({ createdAt: -1 });

      return {
        resumes: resumes.map(resume => ({
          id: resume._id,
          filename: resume.filename,
          score: resume.stats?.overall_score || resume.stats?.score || 0,
          createdAt: (resume as any).createdAt
        }))
      };
    } catch (error) {
      this.logger.error('Get user resumes failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get resumes', 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET /enhanced-interview/report/:sessionId
   * Get comprehensive interview report
   */
  @Get('report/:sessionId')
  async getInterviewReport(@Param('sessionId') sessionId: string, @Request() req) {
    const userId = req.user?.userId || req.user?.sub;
    
    try {
      const sessionDetails = await this.analyticsService.getSessionDetails(sessionId);
      
      // Verify user owns this session
      if (sessionDetails.userId.toString() !== userId) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      }

      // Get AI report if available
      let aiReport = null;
      try {
        aiReport = await this.aiInterviewApi.getInterviewReport(userId, sessionId);
      } catch (error) {
        this.logger.warn('AI report not available:', error.message);
      }

      return {
        session: sessionDetails,
        aiReport,
        analytics: {
          totalQuestions: sessionDetails.questions.length,
          averageScore: sessionDetails.scores?.overall || 0,
          strengths: sessionDetails.strengths || [],
          improvements: sessionDetails.areasForImprovement || [],
          recommendations: sessionDetails.recommendations || []
        }
      };
    } catch (error) {
      this.logger.error('Get interview report failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get interview report', 
        HttpStatus.NOT_FOUND
      );
    }
  }
}