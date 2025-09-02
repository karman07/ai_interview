import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class ResumeService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

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

    // ✅ Prepare multipart form data for external API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: 'application/pdf',
    });

    if (jdText) {
      formData.append('jd_text', jdText);
    } else {
      formData.append('jd_text', '');
    }

    if (jdFile) {
      formData.append('jd_file', fs.createReadStream(jdFile.path), {
        filename: jdFile.originalname,
        contentType: jdFile.mimetype,
      });
    } else {
      formData.append('jd_file', '');
    }

    let stats: any;
    try {
      const response = await axios.post(
        'http://82.112.231.134:8000/upload/cv_evaluate',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            accept: 'application/json',
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );
      stats = response.data; // ✅ real API response
    } catch (err) {
      console.error('Error calling external CV API:', err.message);
      throw new BadRequestException('Failed to evaluate CV');
    }

    // ✅ Save resume with API stats
    const resume = new this.resumeModel({
      filename: file.originalname,
      path: file.path,
      stats,
      user: userId,
    });

    await resume.save();
    return resume;
  }

  async getUserResumes(userId: string) {
    return this.resumeModel.find({ user: userId }).sort({ createdAt: -1 });
  }
}
