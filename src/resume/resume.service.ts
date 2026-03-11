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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _pdfParseModule = require('pdf-parse');
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = _pdfParseModule.default || _pdfParseModule;
import * as mammoth from 'mammoth';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private appBaseUrl: string;

  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly aiCvApiService: AiCvApiService,
  ) {
    this.appBaseUrl = process.env.APP_BASE_URL || process.env.APP_URL || 'http://api.aiforjob.ai';
  }

  private buildFileUrl(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/'); // Windows fix
    return `${this.appBaseUrl}/${normalized}`;
  }

  /**
   * Extract plain text from a PDF, DOCX, or TXT file.
   */
  private async extractTextFromFile(filePath: string): Promise<string> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf') {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        const text = data.text?.trim() || '';
        this.logger.log(`📄 Extracted ${text.length} chars from PDF: ${path.basename(filePath)}`);
        return text;
      } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value?.trim() || '';
        this.logger.log(`📄 Extracted ${text.length} chars from DOCX: ${path.basename(filePath)}`);
        return text;
      } else if (ext === '.txt') {
        const text = fs.readFileSync(filePath, 'utf8');
        this.logger.log(`📄 Extracted ${text.length} chars from TXT: ${path.basename(filePath)}`);
        return text;
      }
    } catch (err) {
      this.logger.error(`💥 Failed to extract text from ${filePath}: ${err.message}`);
    }
    return '';
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

    // ✅ Extract text from file for future use in AI interview
    let extractedText = stats?.cv_text || improvement_resume?.cv_text || '';
    if (!extractedText || extractedText.length < 50) {
      this.logger.log('📄 cv_text from AI service missing or short. Extracting text from file...');
      extractedText = await this.extractTextFromFile(file.path);
    }
    this.logger.log(`✅ Resume text ready: ${extractedText.length} chars`);
    if (extractedText) {
      this.logger.log(`📃 RESUME PREVIEW: ${extractedText.substring(0, 300)}`);
    }

    // Ensure we never pass null values
    const finalStats = stats || {};
    let finalImprovementResume = improvement_resume || {};

    // ✅ ENHANCEMENT: If the AI failed to extract the name, inject the name from the User's DB record
    if (finalImprovementResume.tailored_resume) {
      if (!finalImprovementResume.tailored_resume.personal_info) {
        finalImprovementResume.tailored_resume.personal_info = {};
      }

      const pInfo = finalImprovementResume.tailored_resume.personal_info;
      const namePlaceholder = (pInfo.name || '').toLowerCase();
      const isPlaceholder = !pInfo.name ||
        namePlaceholder.includes('your name') ||
        namePlaceholder.includes('full name') ||
        namePlaceholder.includes('placeholder') ||
        pInfo.name.includes('[') || // Detects [Your Name]
        pInfo.name.includes(']');

      if (isPlaceholder) {
        pInfo.name = user?.name || 'Your Name';
      }

      // Also sync user email if missing
      if (!pInfo.email && user?.email) {
        pInfo.email = user.email;
      }
    }

    const resume = new this.resumeModel({
      filename: file.originalname,
      path: normalizedPath,
      url: resumeUrl,
      stats: finalStats,
      improvement_resume: finalImprovementResume,
      text: extractedText,
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
    return resumes.map((r) => {
      const obj = r.toObject();
      return {
        ...obj,
        url: this.buildFileUrl(obj.path),
      };
    });
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

      const finalImprovementResume = improvement_resume || {};

      // ✅ ENHANCEMENT: Inject the name from the User's DB record
      const user = await this.userModel.findById(resume.user).exec();
      if (finalImprovementResume.tailored_resume) {
        if (!finalImprovementResume.tailored_resume.personal_info) {
          finalImprovementResume.tailored_resume.personal_info = {};
        }

        const pInfo = finalImprovementResume.tailored_resume.personal_info;
        const namePlaceholder = (pInfo.name || '').toLowerCase();
        const isPlaceholder = !pInfo.name ||
          namePlaceholder.includes('your name') ||
          namePlaceholder.includes('full name') ||
          namePlaceholder.includes('placeholder') ||
          pInfo.name.includes('[') || // Detects [Your Name]
          pInfo.name.includes(']');

        if (isPlaceholder) {
          pInfo.name = user?.name || 'Your Name';
        }

        if (!pInfo.email && user?.email) {
          pInfo.email = user.email;
        }
      }

      resume.improvement_resume = finalImprovementResume;
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