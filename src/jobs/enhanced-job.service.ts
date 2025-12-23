import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { JobApplication, JobApplicationDocument, ApplicationStatus } from './schemas/job-application.schema';
import { AiMatcherService } from '../common/services/ai-matcher.service';
import { EnhancedInterviewService } from '../interview_rounds/services/enhanced-interview.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EnhancedJobService {
  private readonly logger = new Logger(EnhancedJobService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobApplication.name) private applicationModel: Model<JobApplicationDocument>,
    private aiMatcherService: AiMatcherService,
    private interviewService: EnhancedInterviewService,
  ) {}

  async createJob(employerId: string, jobData: {
    title: string;
    description: string;
    requirements: string[];
    location: string;
    salaryRange?: { min: number; max: number };
    jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
    skills: string[];
    benefits?: string[];
    companyInfo?: string;
  }): Promise<JobDocument> {
    const job = new this.jobModel({
      ...jobData,
      employerId: new Types.ObjectId(employerId),
      postedAt: new Date(),
      isActive: true,
    });

    const savedJob = await job.save();

    // Generate PDF and send to AI matcher
    try {
      const pdfPath = await this.generateJobDescriptionPDF(savedJob);
      await this.aiMatcherService.uploadJobDescription(savedJob._id.toString(), pdfPath);
      this.logger.log(`Job ${savedJob._id} uploaded to AI matcher`);
    } catch (error) {
      this.logger.error(`Failed to upload job to AI matcher: ${error.message}`);
      // Don't fail job creation if AI upload fails
    }

    return savedJob;
  }

  async updateJob(jobId: string, employerId: string, updateData: Partial<{
    title: string;
    description: string;
    requirements: string[];
    location: string;
    salaryRange: { min: number; max: number };
    jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
    skills: string[];
    benefits: string[];
    companyInfo: string;
    isActive: boolean;
  }>): Promise<JobDocument> {
    const job = await this.jobModel.findOne({ 
      _id: new Types.ObjectId(jobId), 
      employerId: new Types.ObjectId(employerId) 
    });

    if (!job) {
      throw new NotFoundException('Job not found or unauthorized');
    }

    Object.assign(job, updateData);
    
    const savedJob = await job.save();

    // Regenerate PDF and update AI matcher
    try {
      const pdfPath = await this.generateJobDescriptionPDF(savedJob);
      await this.aiMatcherService.uploadJobDescription(savedJob._id.toString(), pdfPath);
      this.logger.log(`Updated job ${savedJob._id} in AI matcher`);
    } catch (error) {
      this.logger.error(`Failed to update job in AI matcher: ${error.message}`);
    }

    return savedJob;
  }

  async deleteJob(jobId: string, employerId: string): Promise<void> {
    const job = await this.jobModel.findOne({ 
      _id: new Types.ObjectId(jobId), 
      employerId: new Types.ObjectId(employerId) 
    });

    if (!job) {
      throw new NotFoundException('Job not found or unauthorized');
    }

    // Check if there are active applications
    const activeApplications = await this.applicationModel.countDocuments({
      jobId: new Types.ObjectId(jobId),
      status: { $in: [ApplicationStatus.PENDING, ApplicationStatus.REVIEWED, ApplicationStatus.SHORTLISTED] }
    });

    if (activeApplications > 0) {
      throw new BadRequestException(`Cannot delete job with ${activeApplications} active applications`);
    }

    await this.jobModel.deleteOne({ _id: new Types.ObjectId(jobId) });
    
    // Clean up text file
    try {
      const filePath = path.join('./uploads/job-descriptions', `${jobId}.txt`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete job description file: ${error.message}`);
    }

    this.logger.log(`Job ${jobId} deleted successfully`);
  }

  async getEmployerJobs(employerId: string, filters?: {
    isActive?: boolean;
    jobType?: string;
    experienceLevel?: string;
  }): Promise<JobDocument[]> {
    const query: any = { employerId: new Types.ObjectId(employerId) };
    
    if (filters) {
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.jobType) query.jobType = filters.jobType;
      if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
    }

    return this.jobModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getJobApplications(jobId: string, employerId: string): Promise<JobApplicationDocument[]> {
    // Verify job ownership
    const job = await this.jobModel.findOne({ 
      _id: new Types.ObjectId(jobId), 
      employerId: new Types.ObjectId(employerId) 
    });

    if (!job) {
      throw new NotFoundException('Job not found or unauthorized');
    }

    const applications = await this.applicationModel
      .find({ jobId: new Types.ObjectId(jobId) })
      .populate('applicantId', 'name email profile')
      .sort({ 'aiMatchingScore.overallMatch': -1, 'interviewScores.overall': -1, appliedAt: -1 })
      .exec();

    // Enrich with latest interview scores and AI match scores
    for (const application of applications) {
      try {
        // Get interview scores
        const analytics = await this.interviewService.getUserAnalytics(application.applicantId.toString());
        application.interviewScores = {
          overall: analytics.overall.bestOverallScore || 0,
          technical: analytics.technical.bestScore || 0,
          behavioral: analytics.behavioral.bestScore || 0,
          problemSolving: analytics.problemSolving.bestScore || 0,
          hr: analytics.hr.bestScore || 0,
          bestSessionId: analytics.overall.bestSessionId,
          totalInterviews: analytics.overall.totalInterviews || 0,
          lastInterviewDate: analytics.overall.lastInterviewDate,
        };

        // Get AI match score from AI matcher service
        try {
          const matchResult = await this.aiMatcherService.getMatchScore(
            application.applicantId.toString(),
            job.description // Pass job description as text
          );
          
          if (matchResult && matchResult.match_score) {
            application.aiMatchingScore = {
              overallMatch: matchResult.match_score,
              skillsMatch: matchResult.skills_match || 0,
              experienceMatch: matchResult.experience_match || 0,
              matchingKeywords: matchResult.matching_keywords || [],
              missingSkills: matchResult.missing_keywords || [],
              aiRecommendation: matchResult.suggestions?.join('. ') || '',
            };
          }
        } catch (aiError) {
          this.logger.warn(`Failed to get AI match score for application ${application._id}: ${aiError.message}`);
        }

        await application.save();
      } catch (error) {
        this.logger.warn(`Failed to enrich application data for ${application.applicantId}: ${error.message}`);
      }
    }

    return applications;
  }

  async updateApplicationStatus(
    applicationId: string, 
    employerId: string, 
    status: ApplicationStatus,
    notes?: string,
    rejectionReason?: string
  ): Promise<JobApplicationDocument> {
    const application = await this.applicationModel
      .findOne({ 
        _id: new Types.ObjectId(applicationId),
        employerId: new Types.ObjectId(employerId)
      })
      .populate('jobId');

    if (!application) {
      throw new NotFoundException('Application not found or unauthorized');
    }

    application.status = status;
    application.statusUpdatedAt = new Date();
    
    if (notes) application.employerNotes = notes;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    if (status === ApplicationStatus.REVIEWED) application.reviewedAt = new Date();

    return application.save();
  }

  async getTopCandidates(jobId: string, employerId: string, limit = 10): Promise<JobApplicationDocument[]> {
    const job = await this.jobModel.findOne({ 
      _id: new Types.ObjectId(jobId), 
      employerId: new Types.ObjectId(employerId) 
    });

    if (!job) {
      throw new NotFoundException('Job not found or unauthorized');
    }

    return this.applicationModel
      .find({ jobId: new Types.ObjectId(jobId) })
      .populate('applicantId', 'name email profile')
      .sort({ 
        'aiMatchingScore.overallMatch': -1, 
        'interviewScores.overall': -1 
      })
      .limit(limit)
      .exec();
  }

  private async generateJobDescriptionPDF(job: JobDocument): Promise<string> {
    const uploadsDir = './uploads/job-descriptions';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfPath = path.join(uploadsDir, `${job._id}.txt`);
    
    // Create a simple text file for now (can be enhanced with actual PDF generation later)
    const content = `
JOB TITLE: ${job.title}

LOCATION: ${job.location}
JOB TYPE: ${job.jobType}
EXPERIENCE LEVEL: ${job.experienceLevel}
${job.salaryRange ? `SALARY RANGE: $${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}` : ''}

JOB DESCRIPTION:
${job.description}

${job.requirements && job.requirements.length > 0 ? `REQUIREMENTS:
${job.requirements.map(req => `• ${req}`).join('\n')}` : ''}

${job.skills && job.skills.length > 0 ? `REQUIRED SKILLS:
${job.skills.join(', ')}` : ''}

${job.benefits && job.benefits.length > 0 ? `BENEFITS:
${job.benefits.map(benefit => `• ${benefit}`).join('\n')}` : ''}

${job.companyInfo ? `ABOUT THE COMPANY:
${job.companyInfo}` : ''}
    `;

    fs.writeFileSync(pdfPath, content, 'utf8');
    return pdfPath;
  }
}