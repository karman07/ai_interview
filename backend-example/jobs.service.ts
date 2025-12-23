import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from './schemas/job.schema';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { AiMatcherService } from './ai-matcher.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private aiMatcherService: AiMatcherService,
  ) {}

  async createJob(createJobDto: CreateJobDto, employerId: string, descriptionFileUrl?: string): Promise<Job> {
    const job = new this.jobModel({
      ...createJobDto,
      employerId,
      descriptionFileUrl,
      isActive: true,
    });

    const savedJob = await job.save();

    // 🔗 Sync with JD Matcher
    try {
      await this.aiMatcherService.uploadJob(savedJob._id.toString(), {
        title: savedJob.title,
        description: savedJob.description,
        requirements: savedJob.requirements,
        salary: savedJob.salary,
        location: savedJob.location,
        descriptionFileUrl: savedJob.descriptionFileUrl,
      });
      console.log('✅ Job uploaded to JD matcher successfully');
    } catch (error) {
      console.error('💥 Failed to upload job to JD matcher:', error.message);
      // Continue without failing the job creation
    }

    return savedJob;
  }

  async updateJob(jobId: string, updateJobDto: UpdateJobDto, employerId: string, descriptionFileUrl?: string): Promise<Job> {
    const job = await this.jobModel.findById(jobId);
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    if (job.employerId.toString() !== employerId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    // Update job data
    Object.assign(job, updateJobDto);
    if (descriptionFileUrl) {
      job.descriptionFileUrl = descriptionFileUrl;
    }
    
    const updatedJob = await job.save();

    // 🔗 Re-sync with JD Matcher
    try {
      await this.aiMatcherService.uploadJob(updatedJob._id.toString(), {
        title: updatedJob.title,
        description: updatedJob.description,
        requirements: updatedJob.requirements,
        salary: updatedJob.salary,
        location: updatedJob.location,
        descriptionFileUrl: updatedJob.descriptionFileUrl,
      });
      console.log('✅ Job updated in JD matcher successfully');
    } catch (error) {
      console.error('💥 Failed to update job in JD matcher:', error.message);
      // Continue without failing the job update
    }

    return updatedJob;
  }

  async deleteJob(jobId: string, employerId: string): Promise<{ message: string }> {
    const job = await this.jobModel.findById(jobId);
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    if (job.employerId.toString() !== employerId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    // Soft delete - set isActive to false
    job.isActive = false;
    await job.save();

    // 🗑️ Remove from JD Matcher
    try {
      await this.aiMatcherService.deleteJob(jobId);
      console.log('✅ Job removed from JD matcher successfully');
    } catch (error) {
      console.error('💥 Failed to remove job from JD matcher:', error.message);
      // Continue without failing the job deletion
    }

    return { message: 'Job deleted successfully' };
  }

  async getMyJobs(employerId: string): Promise<Job[]> {
    return this.jobModel.find({ employerId, isActive: true }).sort({ createdAt: -1 });
  }

  async getJobById(jobId: string): Promise<Job> {
    const job = await this.jobModel.findById(jobId);
    if (!job || !job.isActive) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}