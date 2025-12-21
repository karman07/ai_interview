import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
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
  createJob(@Body() createJobDto: CreateJobDto, @CurrentUser() user: any) {
    return this.jobsService.createJob(createJobDto, user.sub);
  }

  @Get()
  getAllJobs() {
    return this.jobsService.getAllJobs();
  }

  @Get('my-jobs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  getMyJobs(@CurrentUser() user: any) {
    return this.jobsService.getJobsByEmployer(user.sub);
  }

  @Post(':id/apply')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
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
}