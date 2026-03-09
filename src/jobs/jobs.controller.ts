import { Controller, Get, Post, Delete, Param, Query, Body, UseInterceptors, UploadedFile, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobService } from './job.service';
import { RagMatcherService } from './rag-matcher.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
const pdfParse = require('pdf-parse');

@Controller('jobs')
export class JobsController {
    constructor(
        private readonly jobService: JobService,
        private readonly ragMatcherService: RagMatcherService,
    ) { }

    @Get('sync-now')
    async forceSync() {
        // Temporary manual override to seed the Adzuna database locally.
        this.jobService.syncEngineeringJobs().catch(console.error);
        return { message: 'Sync started in background.' };
    }

    @Get('sync-country/:country')
    async forceSyncCountry(@Param('country') country: string) {
        // Run sync for a specific country in background to avoid long waiting times
        (async () => {
            const ENGINEERING_CONFIG = {
                'Software Engineer': 5,
                'Data Engineer': 5,
            };
            for (const [query, pages] of Object.entries(ENGINEERING_CONFIG)) {
                await this.jobService.syncJobsFromAdzuna('manual_subtask', pages, query, country).catch(console.error);
            }
        })();
        return { message: `Sync started for country ${country} in background.` };
    }

    @Get()
    async getJobs(
        @Query('min_stipend') minStipend: number,
        @Query('max_stipend') maxStipend: number,
        @Query('remote') remote: string,
        @Query('internship') internship: string,
        @Query('location') location: string,
        @Query('country') country: string,
        @Query('branch_type') branchType: string,
        @Query('skip') skip: number = 0,
        @Query('limit') limit: number = 50,
    ) {
        const filters: any = { remote, internship, location, country, category: branchType };
        if (!isNaN(minStipend) && minStipend !== undefined) filters.min_stipend = minStipend;
        if (!isNaN(maxStipend) && maxStipend !== undefined) filters.max_stipend = maxStipend;
        const [jobs, total] = await this.jobService.getJobsWithFilters(filters, skip, limit);

        const jobResponses = jobs.map(job => this.mapToJobResponse(job));
        return { total, jobs: jobResponses };
    }

    @Post('match/resume/upload')
    @UseInterceptors(FileInterceptor('file'))
    async matchResumeByUpload(
        @UploadedFile() file: any,
        @Query('location') location: string,
        @Query('internship_only') internshipOnly: boolean,
        @Query('job_level') jobLevel: string,
        @Query('stipend_min') stipendMin: number,
    ) {
        if (!file) throw new HttpException('File is required', HttpStatus.BAD_REQUEST);

        let resumeText = '';
        if (file.mimetype === 'application/pdf') {
            try {
                const pdfData = await pdfParse(file.buffer);
                resumeText = pdfData.text;
            } catch (e) {
                resumeText = file.buffer.toString('utf-8').replace(/[^a-zA-Z\s]/g, "");
            }
        } else {
            resumeText = file.buffer.toString('utf-8');
        }

        const [candidateJobs] = await this.jobService.getJobsWithFilters({}, 0, 5000);

        let filteredCandidates = candidateJobs;
        if (internshipOnly) filteredCandidates = filteredCandidates.filter(j => j.is_internship);
        if (jobLevel) filteredCandidates = filteredCandidates.filter(j => j.job_level === jobLevel);
        if (stipendMin) filteredCandidates = filteredCandidates.filter(j => (j.salary_min && j.salary_min >= stipendMin) || (j.salary_max && j.salary_max >= stipendMin));
        if (location) filteredCandidates = filteredCandidates.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));

        const scoredJobsResult = await this.ragMatcherService.matchResumeToJobsBatch(resumeText, filteredCandidates);
        const scoredJobs = scoredJobsResult.filter(item => item.score > 0.05).sort((a, b) => b.score - a.score).slice(0, 50);

        return {
            total_matches: scoredJobs.length,
            search_time_ms: 100, // mock time
            jobs: scoredJobs.map(item => ({ ...this.mapToJobResponse(item.job), relevance_score: item.score })),
            metadata: { filename: file.originalname, location, internship_only: internshipOnly, job_level: jobLevel, stipend_min: stipendMin }
        };
    }

    @Post('match/resume')
    async matchResume(@Body() body: any) {
        const { resume_text, location, internship_only, job_level, stipend_min } = body;

        const [candidateJobs] = await this.jobService.getJobsWithFilters({}, 0, 5000);
        let filteredCandidates = candidateJobs;
        if (internship_only) filteredCandidates = filteredCandidates.filter(j => j.is_internship);
        if (job_level) filteredCandidates = filteredCandidates.filter(j => j.job_level === job_level);
        if (stipend_min) filteredCandidates = filteredCandidates.filter(j => (j.salary_min && j.salary_min >= stipend_min) || (j.salary_max && j.salary_max >= stipend_min));
        if (location) filteredCandidates = filteredCandidates.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));

        const scoredJobsResult = await this.ragMatcherService.matchResumeToJobsBatch(resume_text, filteredCandidates);
        const scoredJobs = scoredJobsResult.filter(item => item.score > 0.05).sort((a, b) => b.score - a.score).slice(0, 50);

        return {
            total_matches: scoredJobs.length,
            search_time_ms: 100,
            jobs: scoredJobs.map(item => ({ ...this.mapToJobResponse(item.job), relevance_score: item.score })),
            metadata: { location, internship_only, job_level, stipend_min }
        };
    }

    @Post('match/jd')
    async matchJd(@Body() body: any) {
        // Implement similarly via text similarity against description
        const { job_description, location, job_type } = body;

        const [candidateJobs] = await this.jobService.getJobsWithFilters({}, 0, 5000);
        let filteredCandidates = candidateJobs;
        if (location) filteredCandidates = filteredCandidates.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));
        if (job_type) filteredCandidates = filteredCandidates.filter(j => j.employment_type === job_type);

        const scoredJobsResult = await this.ragMatcherService.matchResumeToJobsBatch(job_description, filteredCandidates);
        const scoredJobs = scoredJobsResult.filter(item => item.score > 0.05).sort((a, b) => b.score - a.score).slice(0, 50);

        return {
            total_matches: scoredJobs.length,
            search_time_ms: 100,
            jobs: scoredJobs.map(item => ({ ...this.mapToJobResponse(item.job), relevance_score: item.score })),
            metadata: { location, job_type }
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('favorites')
    async getFavorites(@Req() req: any, @Query('user_id') queryUserId: string) {
        const userId = req.user?.sub || req.user?.id || queryUserId;
        const favorites = await this.jobService.getUserFavorites(userId);
        return {
            total: favorites.length,
            jobs: favorites.map(j => this.mapToJobResponse(j))
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post(':jobId/favorite')
    async toggleFavorite(@Param('jobId') jobId: string, @Body() body: any, @Req() req: any) {
        const userId = req.user?.sub || req.user?.id || body.user_id;
        const isFavorite = await this.jobService.toggleFavorite(userId, jobId);
        return {
            message: `Job ${isFavorite ? 'added' : 'removed'} to favorites`,
            status: 'success',
            is_active: isFavorite
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('bookmarks')
    async getBookmarks(@Req() req: any, @Query('user_id') queryUserId: string) {
        const userId = req.user?.sub || req.user?.id || queryUserId;
        const bookmarks = await this.jobService.getUserBookmarks(userId);
        return {
            total: bookmarks.length,
            jobs: bookmarks.map(j => this.mapToJobResponse(j))
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post(':jobId/bookmark')
    async toggleBookmark(@Param('jobId') jobId: string, @Body() body: any, @Req() req: any) {
        const userId = req.user?.sub || req.user?.id || body.user_id;
        const isBookmarked = await this.jobService.toggleBookmark(userId, jobId);
        return {
            message: `Job ${isBookmarked ? 'added' : 'removed'} to bookmarks`,
            status: 'success',
            is_active: isBookmarked
        };
    }

    @Post('subscribe')
    @UseInterceptors(FileInterceptor('file'))
    async subscribeEmail(
        @UploadedFile() file: any,
        @Body() body: any
    ) {
        const { email, frequency, is_enabled, location, internship_only, job_level, stipend_min } = body;
        let resumeText = file ? file.buffer.toString('utf-8') : '';

        const isNew = await this.jobService['emailSubscriptionModel'].updateOne(
            { email: email.toLowerCase() },
            {
                resume_text: resumeText, frequency: frequency || 'biweekly',
                is_enabled: is_enabled !== 'false', location,
                internship_only: internship_only === 'true', job_level, stipend_min
            },
            { upsert: true }
        );

        return {
            message: isNew.upsertedCount > 0 ? `Successfully subscribed with resume!` : `Subscription preferences updated successfully`,
            status: "success",
            is_active: is_enabled !== 'false'
        };
    }

    @Get('subscriptions')
    async getSubscriptions() {
        return await this.jobService['emailSubscriptionModel'].find({}).exec();
    }

    @Delete('subscribe')
    async unsubscribeEmail(@Query('email') email: string) {
        await this.jobService['emailSubscriptionModel'].deleteOne({ email });
        return { message: 'Successfully unsubscribed', status: 'success', is_active: false };
    }

    @Get('engineering-types')
    async getEngineeringTypes() {
        const types = await this.jobService.jobModel.distinct('category', { status: 'active' });
        return { engineering_types: types.filter(t => !!t).sort() };
    }

    @Get('locations')
    async getLocations() {
        const locs = await this.jobService.jobModel.distinct('location', { status: 'active' });
        return { locations: locs.filter(l => !!l).sort() };
    }

    @Get('countries')
    async getCountries() {
        const countries = await this.jobService.jobModel.distinct('location_structured.country', { status: 'active' });
        return { countries: countries.filter(c => !!c).sort() };
    }

    @Get(':jobId')
    async getJobById(@Param('jobId') jobId: string) {
        let job = await this.jobService.getJobById(jobId);
        if (!job) {
            // Let's try matching Adzuna ID
            job = await this.jobService.getJobByAdzunaId(jobId);
        }
        if (!job) throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
        return this.mapToJobResponse(job);
    }

    private mapToJobResponse(job: any): any {

        const desc = job.description || '';
        const truncatedDesc = desc.length > 500 ? desc.substring(0, 500) + '...' : desc;

        return {
            job_id: job._id.toString(),
            adzuna_id: job.adzuna_id,
            title: job.title,
            company: job.company_display_name || 'Unknown',
            location: job.location,
            employment_type: job.employment_type,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            description: truncatedDesc,
            redirect_url: job.redirect_url,
            relevance_score: 0.0,
            is_internship: job.is_internship || false,
        };
    }
}
