import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { JobApplication, JobApplicationDocument, ApplicationStatus } from './schemas/job-application.schema';
import { EmployerRequest, EmployerRequestDocument, RequestStatus } from './schemas/employer-request.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { CreateEmployerRequestDto, RespondToRequestDto } from './dto/employer-request.dto';
import { AiMatcherService } from '../common/services/ai-matcher.service';
import { EnhancedInterviewService } from '../interview_rounds/services/enhanced-interview.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobApplication.name) private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(EmployerRequest.name) private employerRequestModel: Model<EmployerRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private aiMatcherService: AiMatcherService,
    private enhancedInterviewService: EnhancedInterviewService,
  ) {}

  async createJob(createJobDto: CreateJobDto, employerId: string, descriptionFileUrl?: string): Promise<Job> {
    const job = new this.jobModel({
      ...createJobDto,
      employerId: new Types.ObjectId(employerId),
      descriptionFileUrl,
    });
    
    const savedJob = await job.save();
    
    // Upload to AI matcher service
    try {
      await this.aiMatcherService.uploadJob(
        savedJob,
        descriptionFileUrl ? `.${descriptionFileUrl}` : undefined,
        createJobDto.title,
        savedJob._id.toString()
      );
    } catch (error) {
      console.error('Failed to upload job to AI matcher:', error.message);
    }
    
    return savedJob;
  }

  async getMyApplications(userId: string): Promise<JobApplication[]> {
    return this.jobApplicationModel
      .find({ applicantId: new Types.ObjectId(userId) })
      .populate('jobId', 'title description salary location')
      .populate('employerId', 'name company')
      .sort({ appliedAt: -1 })
      .exec();
  }

  async getApplicationById(applicationId: string, userId: string): Promise<JobApplication> {
    const application = await this.jobApplicationModel
      .findOne({ 
        _id: new Types.ObjectId(applicationId),
        applicantId: new Types.ObjectId(userId)
      })
      .populate('jobId', 'title description salary location requirements skills benefits')
      .populate('employerId', 'name company')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    return this.jobModel.find({ employerId: new Types.ObjectId(employerId), isActive: true }).exec();
  }

  async getAllJobs(): Promise<Job[]> {
    return this.jobModel.find({ isActive: true }).populate('employerId', 'name company').exec();
  }

  async getJobById(jobId: string, userId?: string): Promise<Job> {
    const job = await this.jobModel
      .findOne({ _id: new Types.ObjectId(jobId), isActive: true })
      .populate('employerId', 'name company')
      .exec();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user has applied (if userId provided)
    let hasApplied = false;
    if (userId) {
      const application = await this.jobApplicationModel.findOne({
        jobId: new Types.ObjectId(jobId),
        applicantId: new Types.ObjectId(userId)
      });
      hasApplied = !!application;
    }

    return {
      ...job.toObject(),
      hasApplied
    } as any;
  }

  async applyForJob(jobId: string, employeeId: string, applyJobDto: ApplyJobDto): Promise<JobApplication> {
    const existingApplication = await this.jobApplicationModel.findOne({
      jobId: new Types.ObjectId(jobId),
      applicantId: new Types.ObjectId(employeeId),
    });

    if (existingApplication) {
      throw new BadRequestException('Already applied for this job');
    }

    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const user = await this.userModel.findById(employeeId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const application = new this.jobApplicationModel({
      jobId: new Types.ObjectId(jobId),
      applicantId: new Types.ObjectId(employeeId),
      employerId: new Types.ObjectId(job.employerId),
      coverLetter: applyJobDto.coverLetter,
      resumeUrl: user.resumeUrl,
      appliedAt: new Date(),
      applicationDetails: {
        phone: applyJobDto.phone,
        linkedinUrl: applyJobDto.linkedinUrl,
        portfolioUrl: applyJobDto.portfolioUrl,
        githubUrl: applyJobDto.githubUrl,
        currentSalary: applyJobDto.currentSalary,
        expectedSalary: applyJobDto.expectedSalary,
        noticePeriod: applyJobDto.noticePeriod,
        availability: applyJobDto.availability,
        skills: applyJobDto.skills || [],
        experience: applyJobDto.experience,
        education: applyJobDto.education,
        certifications: applyJobDto.certifications || [],
        languages: applyJobDto.languages || [],
        relocateWilling: applyJobDto.relocateWilling,
        remoteWork: applyJobDto.remoteWork,
        additionalInfo: applyJobDto.additionalInfo
      }
    });
    
    return application.save();
  }

  async getJobApplications(jobId: string, employerId: string): Promise<JobApplication[]> {
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Only allow job owner to see applications
    if (job.employerId.toString() !== employerId) {
      throw new NotFoundException('Job not found'); // Don't reveal job exists
    }

    return this.jobApplicationModel
      .find({ jobId: new Types.ObjectId(jobId) })
      .populate('applicantId', 'name email resumeUrl')
      .exec();
  }

  async getBestCandidates(jobId: string, employerId: string): Promise<any[]> {
    const job = await this.jobModel.findById(jobId);
    if (!job || job.employerId.toString() !== employerId) {
      throw new NotFoundException('Job not found');
    }

    try {
      // Get AI matcher results
      const aiResults = await this.aiMatcherService.getBestResumesForJob(
        job.description,
        job.descriptionFileUrl ? `.${job.descriptionFileUrl}` : undefined,
        20
      );
      
      const matches = aiResults.matches || [];
      
      // Enhance each match with comprehensive user data
      const enhancedCandidates = await Promise.all(
        matches.map(async (match: any) => {
          try {
            // Get user details
            const user = await this.userModel.findById(match.user_id).select('-passwordHash -refreshTokenHash');
            if (!user) {
              console.warn(`User not found: ${match.user_id}`);
              return null;
            }

            // Get interview analytics
            let interviewScores = null;
            try {
              const analytics = await this.enhancedInterviewService.getUserAnalytics(match.user_id);
              
              interviewScores = {
                overall: analytics.overall.bestOverallScore || 0,
                technical: analytics.technical.bestScore || 0,
                behavioral: analytics.behavioral.bestScore || 0,
                problemSolving: analytics.problemSolving.bestScore || 0,
                hr: analytics.hr.bestScore || 0,
                totalInterviews: analytics.overall.totalInterviews || 0,
                lastInterviewDate: analytics.overall.lastInterviewDate,
                currentStreak: analytics.overall.currentStreak || 0,
                averageScore: analytics.overall.overallAverageScore || 0,
                completedInterviews: analytics.overall.completedInterviews || 0,
                totalTimeSpent: analytics.overall.totalTimeSpent || 0
              };
            } catch (interviewError) {
              console.warn(`Failed to get interview scores for user ${match.user_id}:`, interviewError.message);
              // Set default interview scores
              interviewScores = {
                overall: 0,
                technical: 0,
                behavioral: 0,
                problemSolving: 0,
                hr: 0,
                totalInterviews: 0,
                lastInterviewDate: null,
                currentStreak: 0,
                averageScore: 0,
                completedInterviews: 0,
                totalTimeSpent: 0
              };
            }

            // Get resume details
            const resumeDetails = {
              resumeId: match.resume_id,
              resumeFilename: match.resume_filename,
              resumeUrl: user.resumeUrl,
              uploadedAt: user.updatedAt // Approximate upload time
            };

            // Check if user has applied to this job
            const existingApplication = await this.jobApplicationModel.findOne({
              jobId: new Types.ObjectId(jobId),
              applicantId: new Types.ObjectId(match.user_id)
            });

            return {
              // AI Matcher Data
              userId: match.user_id,
              resumeId: match.resume_id,
              resumeFilename: match.resume_filename,
              matchScore: match.match_score,
              strengths: match.strengths || [],
              weaknesses: match.weaknesses || [],
              
              // User Profile Data
              userProfile: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company,
                industry: user.industry,
                jobDescription: user.jobDescription,
                profileImageUrl: user.profileImageUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              },
              
              // Resume Details
              resumeDetails,
              
              // Interview Performance
              interviewScores,
              
              // Application Status
              applicationStatus: existingApplication ? {
                id: existingApplication._id,
                status: existingApplication.status,
                appliedAt: existingApplication.appliedAt,
                employerNotes: existingApplication.employerNotes
              } : null,
              
              // Computed Fields
              hasApplied: !!existingApplication,
              overallRating: this.calculateOverallRating(match.match_score, interviewScores),
              
              // Metadata
              fetchedAt: new Date()
            };
          } catch (error) {
            console.error(`Error enhancing candidate ${match.user_id}:`, error.message);
            return null;
          }
        })
      );
      
      // Filter out null results and sort by overall rating
      return enhancedCandidates
        .filter(candidate => candidate !== null)
        .sort((a, b) => b.overallRating - a.overallRating);
        
    } catch (error) {
      console.error('AI matcher failed, falling back to basic scoring:', error.message);
      return this.getFallbackBestCandidates(jobId, employerId);
    }
  }
  
  private calculateOverallRating(matchScore: number, interviewScores: any): number {
    if (!interviewScores || interviewScores.totalInterviews === 0) {
      return matchScore; // Only AI match score available
    }
    
    // Weighted average: 60% AI match, 40% interview performance
    const interviewWeight = 0.4;
    const matchWeight = 0.6;
    
    const normalizedInterviewScore = (interviewScores.overall / 10) * 100; // Convert 0-10 to 0-100
    
    return Math.round((matchScore * matchWeight) + (normalizedInterviewScore * interviewWeight));
  }

  private async getFallbackBestCandidates(jobId: string, employerId: string): Promise<any[]> {
    const applications = await this.getJobApplications(jobId, employerId);
    return applications
      .map(app => ({
        ...(app as any).toObject(),
        score: this.calculateCandidateScore(app),
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateCandidateScore(application: any): number {
    let score = 0;
    if (application.employeeId?.resumeUrl) score += 50;
    if (application.coverLetter) score += 30;
    if (application.employeeId?.name) score += 20;
    return score;
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, employerId: string): Promise<JobApplication> {
    const application = await this.jobApplicationModel
      .findById(applicationId)
      .populate('jobId')
      .exec();

    if (!application || (application.jobId as any).employerId.toString() !== employerId) {
      throw new NotFoundException('Application not found');
    }

    application.status = status;
    return application.save();
  }

  // Employer Request Methods
  async createEmployerRequest(dto: CreateEmployerRequestDto, employerId: string): Promise<EmployerRequest> {
    const request = new this.employerRequestModel({
      ...dto,
      employerId: new Types.ObjectId(employerId),
      employeeId: new Types.ObjectId(dto.employeeId),
      jobId: new Types.ObjectId(dto.jobId),
    });
    return request.save();
  }

  async getEmployerRequests(employerId: string): Promise<EmployerRequest[]> {
    return this.employerRequestModel
      .find({ employerId: new Types.ObjectId(employerId) })
      .populate('jobId', 'title')
      .populate('employeeId', 'name email')
      .exec();
  }

  async getRequestsForEmployee(employeeId: string): Promise<EmployerRequest[]> {
    return this.employerRequestModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('jobId', 'title description')
      .populate('employerId', 'name company')
      .exec();
  }

  async respondToEmployerRequest(requestId: string, dto: RespondToRequestDto, employeeId: string): Promise<EmployerRequest> {
    const request = await this.employerRequestModel.findOne({
      _id: requestId,
      employeeId: new Types.ObjectId(employeeId),
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.status = dto.status;
    if (dto.employeeResponse) {
      request.employeeResponse = dto.employeeResponse;
    }

    return request.save();
  }

  // AI-powered job recommendations
  async getBestJobsForUser(userId: string, limit = 10): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.resumeUrl) {
      throw new BadRequestException('User has not uploaded a resume yet');
    }

    try {
      // Use the user's latest resume URL from their profile
      const resumePath = user.resumeUrl.startsWith('http') 
        ? user.resumeUrl 
        : `.${user.resumeUrl}`;
        
      return await this.aiMatcherService.getBestJobsForResume(
        undefined,
        resumePath,
        limit
      );
    } catch (error) {
      throw new BadRequestException(`Failed to get job recommendations: ${error.message}`);
    }
  }

  async updateJob(jobId: string, updateJobDto: any, employerId: string, descriptionFileUrl?: string): Promise<Job> {
    const job = await this.jobModel.findById(jobId);
    if (!job || job.employerId.toString() !== employerId) {
      throw new NotFoundException('Job not found');
    }

    Object.assign(job, updateJobDto);
    if (descriptionFileUrl) {
      job.descriptionFileUrl = descriptionFileUrl;
    }

    const updatedJob = await job.save();

    // Re-upload to AI matcher service with job ID
    try {
      await this.aiMatcherService.uploadJob(
        updatedJob,
        descriptionFileUrl ? `.${descriptionFileUrl}` : (job.descriptionFileUrl ? `.${job.descriptionFileUrl}` : undefined),
        updateJobDto.title || job.title,
        jobId
      );
    } catch (error) {
      console.error('Failed to update job in AI matcher:', error.message);
    }

    return updatedJob;
  }

  async deleteJob(jobId: string, employerId: string): Promise<void> {
    const job = await this.jobModel.findById(jobId);
    if (!job || job.employerId.toString() !== employerId) {
      throw new NotFoundException('Job not found');
    }

    // Soft delete
    job.isActive = false;
    await job.save();

    // Call delete API for JD matcher
    try {
      await this.aiMatcherService.deleteJob(jobId);
    } catch (error) {
      console.error('Failed to delete job from AI matcher:', error.message);
    }
  }
}