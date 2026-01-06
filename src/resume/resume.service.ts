import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AiCvApiService } from './ai-cv-api.service';
import { AiMatcherService } from '../common/services/ai-matcher.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private appBaseUrl: string;

  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly aiCvApiService: AiCvApiService,
    private readonly aiMatcherService: AiMatcherService,
  ) {
    this.appBaseUrl = process.env.APP_BASE_URL || process.env.APP_URL || 'http://localhost:3000';
  }

  private buildFileUrl(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/'); // Windows fix
    return `${this.appBaseUrl}/${normalized}`;
  }

  async uploadResume(
    file: Express.Multer.File,
    jdFile: Express.Multer.File | undefined,
    jdText: string,
    userId: string,
  ) {
    this.logger.log('📁 ResumeService.uploadResume called');
    
    if (!file) {
      this.logger.error('❌ No resume file provided');
      throw new BadRequestException('No resume file uploaded');
    }

    this.logger.log(`📄 Processing file: ${file.originalname} at ${file.path}`);

    // Ensure uploads folder exists
    const uploadDir = path.dirname(file.path);
    if (!fs.existsSync(uploadDir)) {
      this.logger.log(`📂 Creating upload directory: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Use AI CV API service to evaluate CV (optional)
    let stats: any = null;
    try {
      this.logger.log('🤖 Calling AI CV evaluation API...');
      const startTime = Date.now();
      
      stats = await this.aiCvApiService.uploadAndEvaluateCv(
        file.path,
        file.originalname,
        jdText,
      );
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ CV evaluation completed in ${duration}ms`);
    } catch (err) {
      this.logger.error('💥 Error calling cv_evaluate:', err.message);
      this.logger.warn('⚠️ CV evaluation failed, continuing without evaluation');
      // Continue without evaluation instead of throwing error
    }

    let improvement_resume: any = null;

    // ✅ If JD is provided, also call cv_improvement API (optional)
    if (jdFile || jdText) {
      try {
        this.logger.log('🔄 Calling AI CV improvement API...');
        const startTime = Date.now();
        
        improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
          file.path,
          file.originalname,
          jdText,
          jdFile?.path,
          jdFile?.originalname,
        );
        
        const duration = Date.now() - startTime;
        this.logger.log(`✅ CV improvement completed in ${duration}ms`);
      } catch (err) {
        this.logger.error('💥 Error calling cv_improvement:', err.message);
        this.logger.warn('⚠️ CV improvement failed, continuing without improvement');
        // Continue without improvement instead of throwing error
      }
    }

    this.logger.log('💾 Saving resume to database...');
    const normalizedPath = file.path.replace(/\\/g, '/');
    const resumeUrl = this.buildFileUrl(normalizedPath);

    const resume = new this.resumeModel({
      filename: file.originalname,
      path: normalizedPath,
      url: resumeUrl,
      stats,
      improvement_resume,
      user: userId,
    });

    await resume.save();
    this.logger.log('✅ Resume saved successfully to database');

    // Update user's resumeUrl to the latest uploaded resume
    try {
      await this.userModel.findByIdAndUpdate(userId, { resumeUrl });
      this.logger.log('✅ User resumeUrl updated');
    } catch (err) {
      this.logger.error('⚠️ Failed to update user resumeUrl:', err.message);
    }

    // Upload to AI matcher service with user ID
    try {
      this.logger.log('🔗 Uploading resume to AI matcher service...');
      await this.aiMatcherService.uploadResume(userId, undefined, file.path);
      this.logger.log('✅ Resume uploaded to AI matcher service');
    } catch (err) {
      this.logger.error('⚠️ Failed to upload to AI matcher service:', err.message);
      // Don't throw error, continue with normal flow
    }

    return resume;
  }

  async getUserResumes(userId: string) {
    const resumes = await this.resumeModel.find({ user: userId }).sort({
      createdAt: -1,
    });

    // Attach URL to each
    return resumes.map((r) => ({
      ...r.toObject(),
      url: this.buildFileUrl(r.path),
    }));
  }

  // ✅ PATCH API: improve resume later
  async improveResume(
    resumeId: string,
    jdFile?: Express.Multer.File,
    jdText?: string,
  ) {
    this.logger.log(`🔄 Improving resume with ID: ${resumeId}`);
    
    const resume = await this.resumeModel.findById(resumeId);
    if (!resume) {
      this.logger.error(`❌ Resume not found: ${resumeId}`);
      throw new NotFoundException('Resume not found');
    }

    try {
      this.logger.log('🤖 Calling AI CV improvement API...');
      const startTime = Date.now();
      
      const improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
        resume.path,
        resume.filename,
        jdText,
        jdFile?.path,
        jdFile?.originalname,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`✅ Resume improvement completed in ${duration}ms`);

      resume.improvement_resume = improvement_resume;
      await resume.save();
      
      this.logger.log('✅ Resume improvement saved to database');

      return {
        ...resume.toObject(),
        url: this.buildFileUrl(resume.path),
      };
    } catch (err) {
      this.logger.error('💥 Error improving resume:', err.message);
      
      if (err.message.includes('ECONNREFUSED') || err.message.includes('connect')) {
        this.logger.warn('⚠️ AI service unavailable, returning resume without improvement');
        return {
          ...resume.toObject(),
          url: this.buildFileUrl(resume.path),
          improvement_status: 'AI service unavailable'
        };
      }
      
      throw new BadRequestException('Failed to improve CV');
    }
  }
}