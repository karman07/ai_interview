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
    token?: string
  ) {
    if (!file) {
      throw new BadRequestException('No resume file uploaded');
    }

    // ✅ ENFORCE LIMIT: Check user's subscription or free tier limit
    const user = await this.userModel.findById(userId).populate('subscriptionPlan').exec();

    // Use the monthly counter on the user object
    const currentUsage = user?.resumeCount || 0;

    let limit = 5; // Default free limit
    if (user?.subscriptionPlan) {
      const plan = user.subscriptionPlan as any;
      const limitFeature = plan.features?.find(f => f.name === 'Resume Limit' || f.name === 'Resume Upload Limit');
      if (limitFeature) {
        limit = limitFeature.value ?? limitFeature.limit ?? 5;
      }
    }

    if (currentUsage >= limit) {
      throw new BadRequestException(`You have reached your monthly limit of ${limit} resumes. Your limit will reset on the 1st of next month.`);
    }

    // Ensure uploads folder exists
    const uploadDir = path.dirname(file.path);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Use AI CV API service to evaluate CV (optional)
    let stats: any = null;
    try {
      stats = await this.aiCvApiService.uploadAndEvaluateCv(
        file.path,
        file.originalname,
        jdText,
        jdFile?.path,
        jdFile?.originalname,
        token
      );
    } catch (err) {
      this.logger.error('💥 Error calling cv_evaluate:', err.message);
      stats = {};
    }

    let improvement_resume: any = null;

    // ✅ If JD is provided, also call cv_improvement API (optional)
    if (jdFile || jdText) {
      try {
        improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
          file.path,
          file.originalname,
          jdText,
          jdFile?.path,
          jdFile?.originalname,
          token
        );
      } catch (err) {
        this.logger.error('💥 Error calling cv_improvement:', err.message);
        improvement_resume = {};
      }
    } else {
      // ✅ NEW: Always call cv_improvement API even without JD for enhanced content
      try {
        improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
          file.path,
          file.originalname,
          '', // Empty JD text
          undefined, // No JD file
          undefined,
          token
        );
      } catch (err) {
        this.logger.error('💥 Error calling cv_improvement:', err.message);
        improvement_resume = {};
      }
    }

    const normalizedPath = file.path.replace(/\\/g, '/');
    const resumeUrl = this.buildFileUrl(normalizedPath);

    // Ensure we never pass null values
    const finalStats = stats || {};
    const finalImprovementResume = improvement_resume || {};

    const resume = new this.resumeModel({
      filename: file.originalname,
      path: normalizedPath,
      url: resumeUrl,
      stats: finalStats,
      improvement_resume: finalImprovementResume,
      user: userId,
    });

    try {
      await resume.save();
      // Increment monthly usage counter
      await this.userModel.findByIdAndUpdate(userId, { $inc: { resumeCount: 1 } });
    } catch (saveError) {
      this.logger.error('💥 Database save error:', saveError.message);
      throw saveError;
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
    token?: string
  ) {
    const resume = await this.resumeModel.findById(resumeId);
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    try {
      const improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
        resume.path,
        resume.filename,
        jdText,
        jdFile?.path,
        jdFile?.originalname,
        token
      );

      resume.improvement_resume = improvement_resume;
      await resume.save();

      return {
        ...resume.toObject(),
        url: this.buildFileUrl(resume.path),
      };
    } catch (err) {
      this.logger.error('💥 Error improving resume:', err.message);

      if (err.message.includes('ECONNREFUSED') || err.message.includes('connect')) {
        return {
          ...resume.toObject(),
          url: this.buildFileUrl(resume.path),
          improvement_status: 'AI service unavailable'
        };
      }

      throw new BadRequestException('Failed to improve CV');
    }
  }

  async deleteResume(resumeId: string, userId: string) {
    const resume = await this.resumeModel.findById(resumeId);
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Verify the resume belongs to the user
    if (resume.user.toString() !== userId) {
      throw new BadRequestException('Unauthorized to delete this resume');
    }

    try {
      // Delete the file from filesystem
      if (fs.existsSync(resume.path)) {
        fs.unlinkSync(resume.path);
      }

      // Delete from database
      await this.resumeModel.findByIdAndDelete(resumeId);

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