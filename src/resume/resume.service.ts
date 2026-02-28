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

    // ✅ ENFORCE LIMIT: Check user's subscription or free tier limit
    const user = await this.userModel.findById(userId).populate('subscriptionPlan').exec();
    const resumeCount = await this.resumeModel.countDocuments({ user: userId });

    let limit = 5; // Default free limit
    if (user?.subscriptionPlan) {
      const plan = user.subscriptionPlan as any;
      const limitFeature = plan.features?.find(f => f.name === 'Resume Upload Limit');
      if (limitFeature) {
        limit = limitFeature.value ?? limitFeature.limit ?? 50;
      }
    }

    if (resumeCount >= limit) {
      this.logger.warn(`🚫 User ${userId} reached resume limit of ${limit} (current: ${resumeCount})`);
      throw new BadRequestException(`You have reached your limit of ${limit} resumes. Please upgrade your plan to upload more.`);
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
        jdFile?.path,
        jdFile?.originalname,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`✅ CV evaluation completed in ${duration}ms`);
      this.logger.log('📊 AI CV Evaluation Response:', JSON.stringify(stats, null, 2));
    } catch (err) {
      this.logger.error('💥 Error calling cv_evaluate:', err.message);
      this.logger.warn('⚠️ CV evaluation failed, continuing without evaluation');
      this.logger.log('📊 Setting stats to empty object due to AI failure');
      stats = {};
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
        this.logger.log('🔄 AI CV Improvement Response:', JSON.stringify(improvement_resume, null, 2));
      } catch (err) {
        this.logger.error('💥 Error calling cv_improvement:', err.message);
        this.logger.warn('⚠️ CV improvement failed, continuing without improvement');
        this.logger.log('🔄 Setting improvement_resume to empty object due to AI failure');
        improvement_resume = {};
        // Continue without improvement instead of throwing error
      }
    } else {
      // ✅ NEW: Always call cv_improvement API even without JD for enhanced content
      try {
        this.logger.log('🔄 Calling AI CV improvement API (without JD)...');
        const startTime = Date.now();

        improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
          file.path,
          file.originalname,
          '', // Empty JD text
          undefined, // No JD file
          undefined,
        );

        const duration = Date.now() - startTime;
        this.logger.log(`✅ CV improvement completed in ${duration}ms`);
        this.logger.log('🔄 AI CV Improvement Response (no JD):', JSON.stringify(improvement_resume, null, 2));
      } catch (err) {
        this.logger.error('💥 Error calling cv_improvement:', err.message);
        this.logger.warn('⚠️ CV improvement failed, continuing without improvement');
        this.logger.log('🔄 Setting improvement_resume to empty object due to AI failure');
        improvement_resume = {};
        // Continue without improvement instead of throwing error
      }
    }

    this.logger.log('💾 Saving resume to database...');
    const normalizedPath = file.path.replace(/\\/g, '/');
    const resumeUrl = this.buildFileUrl(normalizedPath);

    // Ensure we never pass null values
    const finalStats = stats || {};
    const finalImprovementResume = improvement_resume || {};

    this.logger.log('📋 Final data being saved to database:');
    this.logger.log('  - filename:', file.originalname);
    this.logger.log('  - path:', normalizedPath);
    this.logger.log('  - url:', resumeUrl);
    this.logger.log('  - stats type:', typeof finalStats, 'value:', JSON.stringify(finalStats));
    this.logger.log('  - improvement_resume type:', typeof finalImprovementResume, 'value:', JSON.stringify(finalImprovementResume));
    this.logger.log('  - user:', userId);

    const resume = new this.resumeModel({
      filename: file.originalname,
      path: normalizedPath,
      url: resumeUrl,
      stats: finalStats,
      improvement_resume: finalImprovementResume,
      user: userId,
    });

    this.logger.log('💾 About to save resume to database...');
    try {
      await resume.save();
      this.logger.log('✅ Resume saved successfully to database');
    } catch (saveError) {
      this.logger.error('💥 Database save error:', saveError.message);
      this.logger.error('Full error:', JSON.stringify(saveError, null, 2));
      throw saveError;
    }

    this.logger.log('📋 Saved resume object:', JSON.stringify({
      _id: resume._id,
      filename: resume.filename,
      stats: resume.stats,
      improvement_resume: resume.improvement_resume
    }, null, 2));

    // Resume is saved in the Resume collection, 
    // we no longer maintain a redundant resumeUrl in the User profile.



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

  // ✅ DELETE API: delete resume and its stats
  async deleteResume(resumeId: string, userId: string) {
    this.logger.log(`🗑️ Deleting resume with ID: ${resumeId}`);

    const resume = await this.resumeModel.findById(resumeId);
    if (!resume) {
      this.logger.error(`❌ Resume not found: ${resumeId}`);
      throw new NotFoundException('Resume not found');
    }

    // Verify the resume belongs to the user
    if (resume.user.toString() !== userId) {
      this.logger.error(`❌ Unauthorized delete attempt: User ${userId} trying to delete resume ${resumeId}`);
      throw new BadRequestException('Unauthorized to delete this resume');
    }

    try {
      // Delete the file from filesystem
      if (fs.existsSync(resume.path)) {
        fs.unlinkSync(resume.path);
        this.logger.log(`✅ File deleted from filesystem: ${resume.path}`);
      } else {
        this.logger.warn(`⚠️ File not found in filesystem: ${resume.path}`);
      }

      // Delete from database
      await this.resumeModel.findByIdAndDelete(resumeId);
      this.logger.log('✅ Resume deleted from database');

      return {
        message: 'Resume deleted successfully',
        id: resumeId
      };
    } catch (err) {
      this.logger.error('💥 Error deleting resume:', err.message);
      throw new BadRequestException('Failed to delete resume');
    }
  }
}