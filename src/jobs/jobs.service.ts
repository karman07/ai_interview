import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { JobApplication, JobApplicationDocument, ApplicationStatus } from './schemas/job-application.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobApplication.name) private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createJob(createJobDto: CreateJobDto, employerId: string): Promise<Job> {
    const job = new this.jobModel({
      ...createJobDto,
      employerId: new Types.ObjectId(employerId),
    });
    return job.save();
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
      employeeId: new Types.ObjectId(employeeId),
    });

    if (existingApplication) {
      throw new BadRequestException('Already applied for this job');
    }

    const application = new this.jobApplicationModel({
      jobId: new Types.ObjectId(jobId),
      employeeId: new Types.ObjectId(employeeId),
      ...applyJobDto,
    });
    return application.save();
  }

  async getJobApplications(jobId: string, employerId: string): Promise<JobApplication[]> {
    const job = await this.jobModel.findOne({ _id: jobId, employerId });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.jobApplicationModel
      .find({ jobId: new Types.ObjectId(jobId) })
      .populate('employeeId', 'name email resumeUrl')
      .exec();
  }

  async getBestCandidates(jobId: string, employerId: string): Promise<any[]> {
    const applications = await this.getJobApplications(jobId, employerId);
    
    // Simple scoring based on resume presence and application completeness
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
}