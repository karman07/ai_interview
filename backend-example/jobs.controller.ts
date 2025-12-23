import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles('employer')
  @UseInterceptors(
    FileInterceptor('descriptionFile', {
      storage: diskStorage({
        destination: './uploads/job-descriptions',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(pdf|markdown)$/)) {
          cb(null, true);
        } else {
          cb(new HttpException('Only PDF and Markdown files are allowed', HttpStatus.BAD_REQUEST), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const descriptionFileUrl = file ? `/uploads/job-descriptions/${file.filename}` : undefined;
    
    return this.jobsService.createJob(createJobDto, req.user.userId, descriptionFileUrl);
  }

  @Patch(':id')
  @Roles('employer')
  @UseInterceptors(
    FileInterceptor('descriptionFile', {
      storage: diskStorage({
        destination: './uploads/job-descriptions',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(pdf|markdown)$/)) {
          cb(null, true);
        } else {
          cb(new HttpException('Only PDF and Markdown files are allowed', HttpStatus.BAD_REQUEST), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async updateJob(
    @Param('id') jobId: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const descriptionFileUrl = file ? `/uploads/job-descriptions/${file.filename}` : undefined;
    
    return this.jobsService.updateJob(jobId, updateJobDto, req.user.userId, descriptionFileUrl);
  }

  @Delete(':id')
  @Roles('employer')
  async deleteJob(@Param('id') jobId: string, @Request() req) {
    return this.jobsService.deleteJob(jobId, req.user.userId);
  }

  @Get('my-jobs')
  @Roles('employer')
  async getMyJobs(@Request() req) {
    return this.jobsService.getMyJobs(req.user.userId);
  }

  @Get(':id')
  async getJobById(@Param('id') jobId: string) {
    return this.jobsService.getJobById(jobId);
  }

  @Get(':id/applications')
  @Roles('employer')
  async getJobApplications(@Param('id') jobId: string, @Request() req) {
    // Implementation for getting job applications
    // This would integrate with your applications service
    return { message: 'Job applications endpoint' };
  }

  @Get(':id/best-candidates')
  @Roles('employer')
  async getBestCandidates(@Param('id') jobId: string, @Request() req) {
    // This would use the AI matcher service to get best candidates
    return { message: 'Best candidates endpoint' };
  }
}