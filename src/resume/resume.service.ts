import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumeService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

  async uploadResume(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Ensure uploads folder exists
    const uploadDir = path.dirname(file.path);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Full dummy stats (your JSON)
    const stats = {
      fit_index: {
        score: 54.71,
        band: "Weak",
      },
      cv_quality: {
        score: 42.5,
        band: "Weak",
        subscores: [
          {
            dimension: "ats_structure",
            score: 5.0,
            max_score: 10.0,
            evidence: "Contact info present (email, phone, LinkedIn)",
          },
          {
            dimension: "writing_clarity",
            score: 5.0,
            max_score: 15.0,
            evidence: "Some generic phrasing, lacks concise action statements",
          },
          {
            dimension: "quantified_impact",
            score: 4.0,
            max_score: 20.0,
            evidence: "Reduced API response time by 40%",
          },
          {
            dimension: "technical_depth",
            score: 15.0,
            max_score: 15.0,
            evidence: "Led development of microservices architecture serving 1M+ users",
          },
          {
            dimension: "projects_portfolio",
            score: 2.5,
            max_score: 10.0,
            evidence: "Certifications listed, limited project detail",
          },
          {
            dimension: "leadership_skills",
            score: 7.5,
            max_score: 10.0,
            evidence: "Led teams and mentored colleagues",
          },
          {
            dimension: "career_progression",
            score: 3.5,
            max_score: 10.0,
            evidence: "Some progression shown (Senior Engineer role)",
          },
          {
            dimension: "consistency",
            score: 0.0,
            max_score: 10.0,
            evidence: "Formatting/date consistency issues",
          },
        ],
      },
      jd_match: {
        score: 62.86,
        band: "Partial",
        subscores: [
          {
            dimension: "hard_skills",
            score: 30.0,
            max_score: 35.0,
            evidence: "Matched: Python, Java, Terraform, Kubernetes, Docker, Redis, PostgreSQL",
          },
          {
            dimension: "responsibilities",
            score: 12.86,
            max_score: 15.0,
            evidence: "Overlap: develop, implement, manage, design, mentor, collaborate",
          },
          {
            dimension: "domain_relevance",
            score: 7.5,
            max_score: 10.0,
            evidence: "E-commerce platform project in CV relevant to JD",
          },
          {
            dimension: "seniority",
            score: 0.0,
            max_score: 10.0,
            evidence: "No clear years-of-experience match to JD",
          },
          {
            dimension: "nice_to_haves",
            score: 2.5,
            max_score: 5.0,
            evidence: "Mention of Agile/Scrum",
          },
          {
            dimension: "education_certs",
            score: 0.0,
            max_score: 5.0,
            evidence: "No explicit education/cert evidence found",
          },
          {
            dimension: "recent_achievements",
            score: 0.0,
            max_score: 10.0,
            evidence: "No recent role-relevant wins highlighted",
          },
          {
            dimension: "constraints",
            score: 10.0,
            max_score: 10.0,
            evidence: "Location/remote constraints mentioned in JD",
          },
        ],
      },
    };

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
