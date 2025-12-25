import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFiles, UploadedFile, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { StartInterviewWithResumeDto } from '../dto/start-interview-with-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from '../../resume/resume.schema';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

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

// Configure multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/resumes';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
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
  private readonly logger = new Logger(AiInterviewController.name);
  
  constructor(
    private readonly aiInterviewApi: AiInterviewApiService,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

  // Get user's best CV based on highest overall score
  private async getBestUserCV(userId: string): Promise<{ path: string; filename: string } | null> {
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
    console.log(`🤖 AI Interview API started - start endpoint called for user: ${userId}`);
    console.log('📋 Request data:', JSON.stringify(payload, null, 2));
    try {
      // Always get best CV from database
      const bestCV = await this.getBestUserCV(userId);
      let cvContent = '';
      
      if (bestCV) {
        cvContent = bestCV.path;
        console.log('📄 Using best CV from database:', bestCV.filename);
      }
      
      return await this.aiInterviewApi.startInterview({ 
        ...payload, 
        user_id: userId,
        cv: cvContent
      });
    } catch (error) {
      this.logger.error('Start interview failed:', error.message);
      throw new HttpException(error.message || 'Failed to start interview', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * POST /ai-interview/start-with-resume
   * Start a new interview session with resume upload
   */
  @Post('start-with-resume')
  @UseInterceptors(
    FileInterceptor('resume', { storage: resumeStorage }),
    new TimeoutInterceptor(180000) // 3 minutes timeout for resume upload
  )
  async startInterviewWithResume(
    @Request() req,
    @UploadedFile() resumeFile: Express.Multer.File,
    @Body() payload: StartInterviewWithResumeDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || payload.user_id;
    console.log(`🤖 AI Interview API started - start-with-resume endpoint called for user: ${userId}`);
    console.log('📋 Request data:', JSON.stringify(payload, null, 2));
    console.log('📄 Resume file:', resumeFile ? resumeFile.originalname : 'No file uploaded');
    try {
      let cvContent = '';
      
      if (resumeFile) {
        cvContent = resumeFile.path;
        console.log('📄 Using uploaded resume file:', resumeFile.originalname);
      } else {
        // Get best CV from database if no file uploaded
        const bestCV = await this.getBestUserCV(userId);
        if (bestCV) {
          cvContent = bestCV.path;
          console.log('📄 Using best CV from database:', bestCV.filename);
        }
      }
      
      return await this.aiInterviewApi.startInterview({
        ...payload,
        user_id: userId,
        cv: cvContent
      });
    } catch (error) {
      this.logger.error('Start interview with resume failed:', error.message);
      throw new HttpException(error.message || 'Failed to start interview with resume', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * POST /ai-interview/start-with-cv-text
   * Start a new interview session with CV text in request body
   */
  @Post('start-with-cv-text')
  async startInterviewWithCvText(
    @Request() req,
    @Body() payload: StartInterviewWithResumeDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || payload.user_id;
    console.log(`🤖 AI Interview API started - start-with-cv-text endpoint called for user: ${userId}`);
    console.log('📋 Request data:', JSON.stringify(payload, null, 2));
    try {
      // Always get best CV from database
      const bestCV = await this.getBestUserCV(userId);
      let cvContent = '';
      
      if (bestCV) {
        cvContent = bestCV.path;
        console.log('📄 Using best CV from database:', bestCV.filename);
      }
      
      return await this.aiInterviewApi.startInterview({
        ...payload,
        user_id: userId,
        cv: cvContent
      });
    } catch (error) {
      this.logger.error('Start interview with CV text failed:', error.message);
      throw new HttpException(error.message || 'Failed to start interview', HttpStatus.BAD_REQUEST);
    }
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
    try {
      const userId = req.user?.userId || req.user?.sub || payload.user_id;
      return await this.aiInterviewApi.submitAnswer({ ...payload, user_id: userId });
    } catch (error) {
      this.logger.error('Submit answer failed:', error.message);
      throw new HttpException(error.message || 'Failed to submit answer', HttpStatus.BAD_REQUEST);
    }
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
    try {
      return await this.aiInterviewApi.getInterviewState(userId, sessionId);
    } catch (error) {
      this.logger.error('Get interview state failed:', error.message);
      throw new HttpException(error.message || 'Failed to get interview state', HttpStatus.NOT_FOUND);
    }
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
    try {
      return await this.aiInterviewApi.getInterviewReport(userId, sessionId);
    } catch (error) {
      this.logger.error('Get interview report failed:', error.message);
      throw new HttpException(error.message || 'Failed to get interview report', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /ai-interview/sessions/:userId
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

  /**
   * GET /ai-interview/sessions
   * List all sessions
   */
  @Get('sessions')
  async listAllSessions() {
    try {
      return await this.aiInterviewApi.listAllSessions();
    } catch (error) {
      this.logger.error('List all sessions failed:', error.message);
      throw new HttpException(error.message || 'Failed to list all sessions', HttpStatus.BAD_REQUEST);
    }
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
    console.log(`🤖 AI Interview API started - session/create endpoint called`);
    console.log('📋 Request data:', JSON.stringify(payload, null, 2));
    try {
      return await this.aiInterviewApi.createSession(payload);
    } catch (error) {
      this.logger.error('Create session failed:', error.message);
      throw new HttpException(error.message || 'Failed to create session', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /ai-interview/session/:sessionId
   * Get session details
   */
  @Get('session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    try {
      return await this.aiInterviewApi.getSessionDetails(sessionId);
    } catch (error) {
      this.logger.error('Get session failed:', error.message);
      throw new HttpException(error.message || 'Failed to get session', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * GET /ai-interview/session/:sessionId/next-question
   * Get next question in session
   */
  @Get('session/:sessionId/next-question')
  async getNextQuestion(@Param('sessionId') sessionId: string) {
    try {
      return await this.aiInterviewApi.getNextQuestion(sessionId);
    } catch (error) {
      this.logger.error('Get next question failed:', error.message);
      throw new HttpException(error.message || 'Failed to get next question', HttpStatus.BAD_REQUEST);
    }
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
    try {
      return await this.aiInterviewApi.submitSessionAnswer(sessionId, payload);
    } catch (error) {
      this.logger.error('Submit session answer failed:', error.message);
      throw new HttpException(error.message || 'Failed to submit session answer', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * GET /ai-interview/session/:sessionId/report
   * Get session report
   */
  @Get('session/:sessionId/report')
  async getSessionReport(@Param('sessionId') sessionId: string) {
    try {
      return await this.aiInterviewApi.getSessionReport(sessionId);
    } catch (error) {
      this.logger.error('Get session report failed:', error.message);
      throw new HttpException(error.message || 'Failed to get session report', HttpStatus.NOT_FOUND);
    }
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
    try {
      const audioFile = files?.find(f => f.mimetype.startsWith('audio/'));
      const videoFile = files?.find(f => f.mimetype.startsWith('video/'));
      
      const response = {
        question_id: payload.question_id,
        text: payload.text || '',
        audio_url: audioFile ? `/uploads/audio/${audioFile.filename}` : undefined,
        video_url: videoFile ? `/uploads/video/${videoFile.filename}` : undefined,
        response_duration: payload.response_duration ? parseInt(payload.response_duration.toString()) : undefined,
      };
      
      return await this.aiInterviewApi.submitSessionAnswer(sessionId, response);
    } catch (error) {
      this.logger.error('Upload response failed:', error.message);
      throw new HttpException(error.message || 'Failed to upload response', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * DELETE /ai-interview/session/:sessionId
   * Delete a session
   */
  @Delete('session/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    try {
      return await this.aiInterviewApi.deleteSession(sessionId);
    } catch (error) {
      this.logger.error('Delete session failed:', error.message);
      throw new HttpException(error.message || 'Failed to delete session', HttpStatus.BAD_REQUEST);
    }
  }
}
