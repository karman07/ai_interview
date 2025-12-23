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

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobApplication.name) private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(EmployerRequest.name) private employerRequestModel: Model<EmployerRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private aiMatcherService: AiMatcherService,
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
      .exec();
  }

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    return this.jobModel.find({ employerId: new Types.ObjectId(employerId), isActive: true }).exec();
  }

  async getAllJobs(): Promise<Job[]> {
    return this.jobModel.find({ isActive: true }).populate('employerId', 'name company').exec();
  }

  async applyForJob(jobId: string, employeeId: string, applyJobDto: ApplyJobDto): Promise<JobApplication> {
    const existingApplication = await this.jobApplicationModel.findOne({
      jobId: new Types.ObjectId(jobId),
      applicantId: new Types.ObjectId(employeeId),
    });

    if (existingApplication) {
      throw new BadRequestException('Already applied for this job');
    }

    const application = new this.jobApplicationModel({
      jobId: new Types.ObjectId(jobId),
      applicantId: new Types.ObjectId(employeeId),
      employerId: new Types.ObjectId((await this.jobModel.findById(jobId)).employerId),
      ...applyJobDto,
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
      const aiResults = await this.aiMatcherService.getBestResumesForJob(
        job.description,
        job.descriptionFileUrl ? `.${job.descriptionFileUrl}` : undefined,
        20
      );
      return aiResults.matches || [];
    } catch (error) {
      console.error('AI matcher failed, falling back to basic scoring:', error.message);
      return this.getFallbackBestCandidates(jobId, employerId);
    }
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