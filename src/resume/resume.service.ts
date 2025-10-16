import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData = require('form-data');

@Injectable()
export class ResumeService {
  private aiBaseUrl: string;
  private appBaseUrl: string;

  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {
    this.aiBaseUrl = process.env.AI_BASE_URL || 'http://82.112.231.134:8000';
    this.appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'; // ✅ use env for frontend
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

    // ✅ Always call CV evaluation API
    const evalForm = new FormData();
    evalForm.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: 'application/pdf',
    });

    let stats: any;
    try {
      const evalRes = await axios.post(
        `${this.aiBaseUrl}/upload/cv_evaluate`,
        evalForm,
        {
          headers: { ...evalForm.getHeaders(), accept: 'application/json' },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );
      stats = evalRes.data;
    } catch (err) {
      console.error('Error calling cv_evaluate:', err.message);
      throw new BadRequestException('Failed to evaluate CV');
    }

    let improvement_resume: any = null;

    // ✅ If JD is provided, also call cv_improvement API
    if (jdFile || jdText) {
      const improveForm = new FormData();
      improveForm.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: 'application/pdf',
      });
      improveForm.append('jd_text', jdText || '');
      if (jdFile) {
        improveForm.append('jd_file', fs.createReadStream(jdFile.path), {
          filename: jdFile.originalname,
          contentType: jdFile.mimetype,
        });
      }

      try {
        const improveRes = await axios.post(
          `${this.aiBaseUrl}/upload/cv_improvement`,
          improveForm,
          {
            headers: { ...improveForm.getHeaders(), accept: 'application/json' },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          },
        );
        improvement_resume = improveRes.data;
      } catch (err) {
        console.error('Error calling cv_improvement:', err.message);
        throw new BadRequestException('Failed to improve CV');
      }
    }

    const normalizedPath = file.path.replace(/\\/g, '/');

    const resume = new this.resumeModel({
      filename: file.originalname,
      path: normalizedPath,
      url: this.buildFileUrl(normalizedPath), // ✅ add file URL
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

    const formData = new FormData();
    formData.append('file', fs.createReadStream(resume.path), {
      filename: resume.filename,
      contentType: 'application/pdf',
    });
    formData.append('jd_text', jdText || '');
    if (jdFile) {
      formData.append('jd_file', fs.createReadStream(jdFile.path), {
        filename: jdFile.originalname,
        contentType: jdFile.mimetype,
      });
    }

    try {
      const response = await axios.post(
        `${this.aiBaseUrl}/upload/cv_improvement`,
        formData,
        {
          headers: { ...formData.getHeaders(), accept: 'application/json' },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      resume.improvement_resume = response.data;
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
