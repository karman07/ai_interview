import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import { AiCvApiService } from './ai-cv-api.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private appBaseUrl: string;

  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
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

    this.logger.log(`📄 Processing file: ${file.originalname} at ${file.path}`);

    // Ensure uploads folder exists
    const uploadDir = path.dirname(file.path);
    if (!fs.existsSync(uploadDir)) {
      this.logger.log(`📂 Creating upload directory: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Use AI CV API service to evaluate CV
    let stats: any;
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
      this.logger.error('Full error:', err);
      throw new BadRequestException('Failed to evaluate CV');
    }

    let improvement_resume: any = null;

    // ✅ If JD is provided, also call cv_improvement API
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
        this.logger.error('Full error:', err);
        throw new BadRequestException('Failed to improve CV');
      }
    }

    this.logger.log('💾 Saving resume to database...');
    const normalizedPath = file.path.replace(/\\/g, '/');

    const resume = new this.resumeModel({
      filename: file.originalname,
      path: normalizedPath,
      url: this.buildFileUrl(normalizedPath),
      stats,
      improvement_resume,
      user: userId,
    });

    await resume.save();
    this.logger.log('✅ Resume saved successfully to database');
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
      this.logger.error('Full error:', err);
      throw new BadRequestException('Failed to improve CV');
    }
  }
}