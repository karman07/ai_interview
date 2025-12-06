import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import { AiCvApiService } from './ai-cv-api.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumeService {
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
    if (!file) {
      throw new BadRequestException('No resume file uploaded');
    }

    // Ensure uploads folder exists
    const uploadDir = path.dirname(file.path);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Use AI CV API service to evaluate CV
    let stats: any;
    try {
      stats = await this.aiCvApiService.uploadAndEvaluateCv(
        file.path,
        file.originalname,
        jdText,
      );
    } catch (err) {
      console.error('Error calling cv_evaluate:', err.message);
      throw new BadRequestException('Failed to evaluate CV');
    }

    let improvement_resume: any = null;

    // ✅ If JD is provided, also call cv_improvement API
    if (jdFile || jdText) {
      try {
        improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
          file.path,
          file.originalname,
          jdText,
          jdFile?.path,
          jdFile?.originalname,
        );
      } catch (err) {
        console.error('Error calling cv_improvement:', err.message);
        throw new BadRequestException('Failed to improve CV');
      }
    }

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
    const resume = await this.resumeModel.findById(resumeId);
    if (!resume) throw new NotFoundException('Resume not found');

    try {
      const improvement_resume = await this.aiCvApiService.uploadAndGetImprovements(
        resume.path,
        resume.filename,
        jdText,
        jdFile?.path,
        jdFile?.originalname,
      );

      resume.improvement_resume = improvement_resume;
      await resume.save();

      return {
        ...resume.toObject(),
        url: this.buildFileUrl(resume.path),
      };
    } catch (err) {
      console.error('Error improving resume:', err.message);
      throw new BadRequestException('Failed to improve CV');
    }
  }
}