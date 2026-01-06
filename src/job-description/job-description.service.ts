import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobDescription, JobDescriptionDocument } from './job-description.schema';
import * as fs from 'fs';

@Injectable()
export class JobDescriptionService {
  private readonly logger = new Logger(JobDescriptionService.name);
  private appBaseUrl: string;

  constructor(
    @InjectModel(JobDescription.name) private jdModel: Model<JobDescriptionDocument>,
  ) {
    this.appBaseUrl = process.env.APP_BASE_URL || process.env.APP_URL || 'http://localhost:3000';
  }

  private buildFileUrl(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/');
    return `${this.appBaseUrl}/${normalized}`;
  }

  async uploadJobDescription(
    file: Express.Multer.File | undefined,
    jdText: string | undefined,
    userId: string,
  ) {
    this.logger.log('📋 JobDescriptionService.uploadJobDescription called');

    let filePath: string;
    let filename: string;
    let content: string | undefined;

    if (file) {
      // File upload
      filePath = file.path.replace(/\\/g, '/');
      filename = file.originalname;
      this.logger.log(`📄 JD file uploaded: ${filename}`);
    } else if (jdText && jdText.trim() !== '') {
      // Text content
      const jdDir = `./uploads/job-descriptions/${userId}`;
      if (!fs.existsSync(jdDir)) {
        fs.mkdirSync(jdDir, { recursive: true });
      }
      filename = `${Date.now()}-job-description.txt`;
      filePath = `${jdDir}/${filename}`;
      fs.writeFileSync(filePath, jdText);
      content = jdText;
      this.logger.log(`📝 JD text saved to: ${filePath}`);
    } else {
      throw new Error('Either JD file or text is required');
    }

    const jd = new this.jdModel({
      filename,
      path: filePath,
      content,
      user: userId,
    });

    await jd.save();
    this.logger.log('✅ Job description saved to database');

    return {
      ...jd.toObject(),
      url: this.buildFileUrl(filePath),
    };
  }

  async getUserJobDescriptions(userId: string) {
    const jds = await this.jdModel.find({ user: userId }).sort({ createdAt: -1 });

    return jds.map((jd) => ({
      ...jd.toObject(),
      url: this.buildFileUrl(jd.path),
    }));
  }
}