import { Controller, Get, Post, Body, Param, UseGuards, Patch, UseInterceptors, UploadedFile, Query, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { CreateEmployerRequestDto, RespondToRequestDto } from './dto/employer-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApplicationStatus } from './schemas/job-application.schema';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @UseInterceptors(
    FileInterceptor('descriptionFile', {
      storage: diskStorage({
        destination: './uploads/job-descriptions',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  createJob(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const descriptionFileUrl = file ? `/uploads/job-descriptions/${file.filename}` : undefined;
    return this.jobsService.createJob(createJobDto, user.sub, descriptionFileUrl);
  }

  @Get()
  getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @Get('my-applications')
  getMyApplications(@CurrentUser() user: any) {
    return this.jobsService.getMyApplications(user.sub);
  }

  @Get('my-jobs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  getMyJobs(@CurrentUser() user: any) {
    return this.jobsService.getJobsByEmployer(user.sub);
  }

  @Post(':id/apply')
  applyForJob(@Param('id') jobId: string, @Body() applyJobDto: ApplyJobDto, @CurrentUser() user: any) {
    return this.jobsService.applyForJob(jobId, user.sub, applyJobDto);
  }

  @Get(':id/applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  getJobApplications(@Param('id') jobId: string, @CurrentUser() user: any) {
    return this.jobsService.getJobApplications(jobId, user.sub);
  }

  @Get(':id/best-candidates')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  getBestCandidates(@Param('id') jobId: string, @CurrentUser() user: any) {
    return this.jobsService.getBestCandidates(jobId, user.sub);
  }

  @Patch('applications/:id/status/:status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  updateApplicationStatus(
    @Param('id') applicationId: string,
    @Param('status') status: ApplicationStatus,
    @CurrentUser() user: any
  ) {
    return this.jobsService.updateApplicationStatus(applicationId, status, user.sub);
  }

  // Employer Request Routes
  @Post('request-employee')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  requestEmployee(@Body() dto: CreateEmployerRequestDto, @CurrentUser() user: any) {
    return this.jobsService.createEmployerRequest(dto, user.sub);
  }

  @Get('my-requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  getMyRequests(@CurrentUser() user: any) {
    return this.jobsService.getEmployerRequests(user.sub);
  }

  @Get('requests-for-me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  getRequestsForMe(@CurrentUser() user: any) {
    return this.jobsService.getRequestsForEmployee(user.sub);
  }

  // AI-powered job recommendations
  @Get('recommendations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  getBestJobsForUser(@CurrentUser() user: any, @Query('limit') limit = 10) {
    return this.jobsService.getBestJobsForUser(user.sub, Number(limit));
  }

  @Patch('requests/:id/respond')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  respondToRequest(
    @Param('id') requestId: string,
    @Body() dto: RespondToRequestDto,
    @CurrentUser() user: any
  ) {
    return this.jobsService.respondToEmployerRequest(requestId, dto, user.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @UseInterceptors(
    FileInterceptor('descriptionFile', {
      storage: diskStorage({
        destination: './uploads/job-descriptions',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  updateJob(
    @Param('id') jobId: string,
    @Body() updateJobDto: any,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const descriptionFileUrl = file ? `/uploads/job-descriptions/${file.filename}` : undefined;
    return this.jobsService.updateJob(jobId, updateJobDto, user.sub, descriptionFileUrl);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  deleteJob(@Param('id') jobId: string, @CurrentUser() user: any) {
    return this.jobsService.deleteJob(jobId, user.sub);
  }
}