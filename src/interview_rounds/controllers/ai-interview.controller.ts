import { Controller, Post, Get, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from '../../resume/resume.schema';
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
  ) {
    super(aiInterviewApi, resumeModel);
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
        audio_file_path: audioFile.path
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
  ) {
    super(aiInterviewApi, resumeModel);
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
      
      return await this.aiInterviewApi.startInterview(finalPayload);
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
      
      const aiResponse = await this.aiInterviewApi.submitVoiceAnswer({
        user_id: userId,
        session_id: payload.session_id,
        audio_file_path: audioFile.path
      });
      
      console.log('🔍 AI Response received:', JSON.stringify(aiResponse, null, 2));
      
      // Save analytics data
      if (aiResponse.evaluation) {
        console.log('💾 Saving evaluation data for analytics...');
        // TODO: Save to analytics collection
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
}