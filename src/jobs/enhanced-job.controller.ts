import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { EnhancedJobService } from './enhanced-job.service';
import { ApplicationStatus } from './schemas/job-application.schema';

@Controller('jobs/enhanced')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnhancedJobController {
  constructor(private readonly enhancedJobService: EnhancedJobService) {}

  // ==================== JOB MANAGEMENT ====================

  @Post()
  @Roles(UserRole.EMPLOYER)
  async createJob(
    @CurrentUser() user: any,
    @Body() jobData: {
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
    }
  ) {
    return this.enhancedJobService.createJob(user.sub, jobData);
  }

  @Put(':jobId')
  @Roles(UserRole.EMPLOYER)
  async updateJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any,
    @Body() updateData: Partial<{
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
    }>
  ) {
    return this.enhancedJobService.updateJob(jobId, user.sub, updateData);
  }

  @Delete(':jobId')
  @Roles(UserRole.EMPLOYER)
  async deleteJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any
  ) {
    await this.enhancedJobService.deleteJob(jobId, user.sub);
    return { message: 'Job deleted successfully' };
  }

  @Get('my-jobs')
  @Roles(UserRole.EMPLOYER)
  async getMyJobs(
    @CurrentUser() user: any,
    @Query('isActive') isActive?: string,
    @Query('jobType') jobType?: string,
    @Query('experienceLevel') experienceLevel?: string
  ) {
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (jobType) filters.jobType = jobType;
    if (experienceLevel) filters.experienceLevel = experienceLevel;

    return this.enhancedJobService.getEmployerJobs(user.sub, filters);
  }

  // ==================== APPLICATION MANAGEMENT ====================

  @Get(':jobId/applications')
  @Roles(UserRole.EMPLOYER)
  async getJobApplications(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any
  ) {
    return this.enhancedJobService.getJobApplications(jobId, user.sub);
  }

  @Get(':jobId/top-candidates')
  @Roles(UserRole.EMPLOYER)
  async getTopCandidates(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any,
    @Query('limit') limit = 10
  ) {
    return this.enhancedJobService.getTopCandidates(jobId, user.sub, Number(limit));
  }

  @Put('applications/:applicationId/status')
  @Roles(UserRole.EMPLOYER)
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: any,
    @Body() updateData: {
      status: ApplicationStatus;
      notes?: string;
      rejectionReason?: string;
    }
  ) {
    const { status, notes, rejectionReason } = updateData;
    
    if (!Object.values(ApplicationStatus).includes(status)) {
      throw new BadRequestException('Invalid application status');
    }

    return this.enhancedJobService.updateApplicationStatus(
      applicationId, 
      user.sub, 
      status, 
      notes, 
      rejectionReason
    );
  }

  // ==================== ANALYTICS & INSIGHTS ====================

  @Get(':jobId/analytics')
  @Roles(UserRole.EMPLOYER)
  async getJobAnalytics(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any
  ) {
    const applications = await this.enhancedJobService.getJobApplications(jobId, user.sub);
    
    const analytics = {
      totalApplications: applications.length,
      statusBreakdown: {
        pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
        reviewed: applications.filter(app => app.status === ApplicationStatus.REVIEWED).length,
        shortlisted: applications.filter(app => app.status === ApplicationStatus.SHORTLISTED).length,
        rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
        hired: applications.filter(app => app.status === ApplicationStatus.HIRED).length,
      },
      averageAIMatch: applications.reduce((sum, app) => sum + (app.aiMatchingScore?.overallMatch || 0), 0) / applications.length || 0,
      averageInterviewScore: applications.reduce((sum, app) => sum + (app.interviewScores?.overall || 0), 0) / applications.length || 0,
      topSkills: this.extractTopSkills(applications),
      applicationTrend: this.calculateApplicationTrend(applications),
    };

    return analytics;
  }

  @Get('dashboard-stats')
  @Roles(UserRole.EMPLOYER)
  async getDashboardStats(@CurrentUser() user: any) {
    const jobs = await this.enhancedJobService.getEmployerJobs(user.sub);
    const activeJobs = jobs.filter(job => job.isActive);
    
    let totalApplications = 0;
    let pendingApplications = 0;
    
    for (const job of jobs) {
      const applications = await this.enhancedJobService.getJobApplications(job._id.toString(), user.sub);
      totalApplications += applications.length;
      pendingApplications += applications.filter(app => app.status === ApplicationStatus.PENDING).length;
    }

    return {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      totalApplications,
      pendingApplications,
      recentJobs: jobs.slice(0, 5).map(job => ({
        id: job._id,
        title: job.title,
        location: job.location,
        postedAt: job.postedAt,
        isActive: job.isActive,
      })),
    };
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk-update-status')
  @Roles(UserRole.EMPLOYER)
  async bulkUpdateApplicationStatus(
    @CurrentUser() user: any,
    @Body() bulkData: {
      applicationIds: string[];
      status: ApplicationStatus;
      notes?: string;
      rejectionReason?: string;
    }
  ) {
    const { applicationIds, status, notes, rejectionReason } = bulkData;
    
    const results = [];
    for (const applicationId of applicationIds) {
      try {
        const updated = await this.enhancedJobService.updateApplicationStatus(
          applicationId, 
          user.sub, 
          status, 
          notes, 
          rejectionReason
        );
        results.push({ applicationId, success: true, application: updated });
      } catch (error) {
        results.push({ applicationId, success: false, error: error.message });
      }
    }

    return {
      totalProcessed: applicationIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  @Post(':jobId/toggle-status')
  @Roles(UserRole.EMPLOYER)
  async toggleJobStatus(
    @Param('jobId') jobId: string,
    @CurrentUser() user: any
  ) {
    const job = await this.enhancedJobService.updateJob(jobId, user.sub, {});
    const newStatus = !job.isActive;
    
    return this.enhancedJobService.updateJob(jobId, user.sub, { isActive: newStatus });
  }

  // ==================== HELPER METHODS ====================

  private extractTopSkills(applications: any[]): { skill: string; count: number }[] {
    const skillCounts = new Map<string, number>();
    
    applications.forEach(app => {
      if (app.aiMatchingScore?.matchingKeywords) {
        app.aiMatchingScore.matchingKeywords.forEach((skill: string) => {
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
        });
      }
    });

    return Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateApplicationTrend(applications: any[]): { date: string; count: number }[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => ({
      date,
      count: applications.filter(app => 
        app.appliedAt && app.appliedAt.toISOString().split('T')[0] === date
      ).length,
    }));
  }
}