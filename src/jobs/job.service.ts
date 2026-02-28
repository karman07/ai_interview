import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { AdzunaService } from './adzuna/adzuna.service';
import { CtsService } from './cts/cts.service';

import { Job, JobDocument } from './schemas/job.schema';
import { JobSyncLog, JobSyncLogDocument } from './schemas/job-sync-log.schema';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import { EmailSubscription, EmailSubscriptionDocument } from './schemas/email-subscription.schema';

@Injectable()
export class JobService {
    private readonly logger = new Logger(JobService.name);

    constructor(
        @InjectModel(Job.name) public jobModel: Model<JobDocument>,
        @InjectModel(JobSyncLog.name) public syncLogModel: Model<JobSyncLogDocument>,
        @InjectModel(Favorite.name) public favoriteModel: Model<FavoriteDocument>,
        @InjectModel(Bookmark.name) public bookmarkModel: Model<BookmarkDocument>,
        @InjectModel(EmailSubscription.name) public emailSubscriptionModel: Model<EmailSubscriptionDocument>,
        private adzunaService: AdzunaService,
        private ctsService: CtsService,
        private configService: ConfigService,
    ) { }

    async syncJobsFromAdzuna(
        syncType: string = 'manual',
        maxPages: number = 20,
        searchQuery: string = null,
    ): Promise<any> {
        const syncLog = await this.syncLogModel.create({
            sync_type: syncType,
            status: 'in_progress',
        });

        try {
            this.logger.log(`Starting job sync: type=${syncType}`);
            const jobsData = await this.adzunaService.fetchAllJobs(maxPages, searchQuery);

            await this.syncLogModel.updateOne(
                { _id: syncLog._id },
                { $set: { jobs_fetched: jobsData.length } },
            );

            this.logger.log(`Fetched ${jobsData.length} jobs from Adzuna`);

            let jobsCreated = 0;
            let jobsUpdated = 0;
            let jobsFailed = 0;

            for (const jobData of jobsData) {
                try {
                    const parsedJob = this.adzunaService.parseJobData(jobData);
                    const existingJob = await this.jobModel.findOne({ adzuna_id: parsedJob.adzuna_id });

                    if (existingJob) {
                        await this._updateJob(existingJob, parsedJob);
                        jobsUpdated++;
                    } else {
                        await this._createJob(parsedJob);
                        jobsCreated++;
                    }
                } catch (error) {
                    this.logger.error(`Error processing job ${jobData.id}: ${error.message}`);
                    jobsFailed++;
                }
            }

            const expiredCount = await this._markExpiredJobs();

            await this.syncLogModel.updateOne(
                { _id: syncLog._id },
                {
                    $set: {
                        status: 'completed',
                        jobs_created: jobsCreated,
                        jobs_updated: jobsUpdated,
                        jobs_deleted: expiredCount,
                        jobs_failed: jobsFailed,
                        completed_at: new Date(),
                    },
                },
            );

            this.logger.log(`Sync completed: created=${jobsCreated}, updated=${jobsUpdated}, expired=${expiredCount}, failed=${jobsFailed}`);
            return await this.syncLogModel.findById(syncLog._id);

        } catch (error) {
            this.logger.error(`Job sync failed: ${error.message}`);
            await this.syncLogModel.updateOne(
                { _id: syncLog._id },
                {
                    $set: {
                        status: 'failed',
                        error_message: error.message,
                        completed_at: new Date(),
                    },
                },
            );
            throw error;
        }
    }

    private async _createJob(jobData: any) {
        const requisitionId = `req-${jobData.adzuna_id}-${uuidv4().substring(0, 8)}`;
        const expiryDays = this.configService.get<number>('JOB_EXPIRY_DAYS', 30);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // Try to create in CTS
        let ctsJobName = null;
        try {
            ctsJobName = await this.ctsService.createJob({ ...jobData, requisition_id: requisitionId });
        } catch (err) {
            this.logger.warn(`Failed to push job directly to CTS, keeping local only for now. Error: ${err.message}`);
        }

        const newJob = {
            adzuna_id: jobData.adzuna_id,
            cts_job_name: ctsJobName,
            requisition_id: requisitionId,
            title: jobData.title,
            description: jobData.description,
            company_display_name: jobData.company_display_name,
            location: jobData.location,
            location_structured: jobData.location_structured,
            employment_type: jobData.employmentType,
            job_level: jobData.jobLevel,
            salary_min: jobData.salary_min,
            salary_max: jobData.salary_max,
            salary_currency: jobData.salary_currency,
            category: jobData.category,
            contract_time: jobData.contract_time,
            redirect_url: jobData.redirect_url,
            is_internship: jobData.is_internship,
            is_remote: jobData.is_remote,
            status: 'active',
            expires_at: expiresAt,
            raw_data: jobData.raw_data,
        };

        await this.jobModel.create(newJob);
        this.logger.debug(`Created job: ${newJob.title}`);
    }

    private async _updateJob(existingJob: any, jobData: any) {
        const expiryDays = this.configService.get<number>('JOB_EXPIRY_DAYS', 30);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        await this.jobModel.updateOne(
            { _id: existingJob._id },
            {
                $set: {
                    title: jobData.title,
                    description: jobData.description,
                    company_display_name: jobData.company_display_name,
                    location: jobData.location,
                    location_structured: jobData.location_structured,
                    employment_type: jobData.employmentType,
                    job_level: jobData.jobLevel,
                    salary_min: jobData.salary_min,
                    salary_max: jobData.salary_max,
                    category: jobData.category,
                    redirect_url: jobData.redirect_url,
                    is_internship: jobData.is_internship,
                    is_remote: jobData.is_remote,
                    status: 'active',
                    expires_at: expiresAt,
                    raw_data: jobData.raw_data,
                },
            },
        );

        if (existingJob.cts_job_name) {
            await this.ctsService.updateJob(existingJob.cts_job_name, jobData);
        }

        this.logger.debug(`Updated job: ${jobData.title}`);
    }

    private async _markExpiredJobs(): Promise<number> {
        const result = await this.jobModel.updateMany(
            { status: 'active', expires_at: { $lt: new Date() } },
            { $set: { status: 'expired' } },
        );
        if (result.modifiedCount > 0) {
            this.logger.log(`Marked ${result.modifiedCount} jobs as expired`);
        }
        return result.modifiedCount;
    }

    async syncEngineeringJobs(): Promise<any> {
        const ENGINEERING_CONFIG = {
            'Software Engineer': 10,
            'Data Engineer': 10,
            'Civil Engineer': 10,
            'Mechanical Engineer': 10,
            'Electrical Engineer': 10,
            'Electronics Engineer': 10,
            'Computer Engineer': 10,
            'Chemical Engineer': 10,
            'Aerospace Engineer': 10,
            'Industrial Engineer': 10,
        };

        const startTime = new Date();
        this.logger.log(`Starting daily engineering sync at ${startTime}`);

        let totalCreated = 0;
        let totalUpdated = 0;
        let totalFailed = 0;

        const syncLog = await this.syncLogModel.create({
            sync_type: 'daily_engineering_mass_sync',
            status: 'in_progress',
        });

        try {
            for (const [query, pages] of Object.entries(ENGINEERING_CONFIG)) {
                try {
                    this.logger.log(`Mass Sync: Processing ${query} (maxPages=${pages})`);
                    const singleLog = await this.syncJobsFromAdzuna('manual_subtask', pages, query);
                    totalCreated += singleLog.jobs_created || 0;
                    totalUpdated += singleLog.jobs_updated || 0;
                    totalFailed += singleLog.jobs_failed || 0;
                } catch (e) {
                    this.logger.error(`Failed sub-sync for ${query}: ${e.message}`);
                    totalFailed++;
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }

            await this.jobModel.deleteMany({ updated_at: { $lt: startTime } });

            await this.syncLogModel.updateOne(
                { _id: syncLog._id },
                {
                    $set: {
                        status: 'completed',
                        jobs_created: totalCreated,
                        jobs_updated: totalUpdated,
                        jobs_failed: totalFailed,
                        completed_at: new Date(),
                    },
                },
            );

            return await this.syncLogModel.findById(syncLog._id);
        } catch (error) {
            this.logger.error(`Mass sync failed: ${error.message}`);
            await this.syncLogModel.updateOne(
                { _id: syncLog._id },
                {
                    $set: {
                        status: 'failed',
                        error_message: error.message,
                        completed_at: new Date(),
                    },
                },
            );
            throw error;
        }
    }

    async getJobsWithFilters(filters: any, skip: number = 0, limit: number = 50): Promise<[any[], number]> {
        const query: any = { status: 'active' };

        if (filters.min_stipend !== undefined && filters.max_stipend !== undefined) {
            query.$or = [
                { salary_min: { $gte: parseFloat(filters.min_stipend), $lte: parseFloat(filters.max_stipend) } },
                { salary_max: { $gte: parseFloat(filters.min_stipend), $lte: parseFloat(filters.max_stipend) } },
            ];
        } else if (filters.min_stipend !== undefined) {
            query.$or = [
                { salary_min: { $gte: parseFloat(filters.min_stipend) } },
                { salary_max: { $gte: parseFloat(filters.min_stipend) } },
            ]
        }

        if (filters.remote !== undefined) {
            query.is_remote = filters.remote === 'true' || filters.remote === true;
        }
        if (filters.internship !== undefined) {
            query.is_internship = filters.internship === 'true' || filters.internship === true;
        }
        if (filters.location) {
            query.location = { $regex: filters.location, $options: 'i' };
        }
        if (filters.category) {
            query.$or = query.$or || [];
            query.$or.push({ category: { $regex: filters.category, $options: 'i' } });
            query.$or.push({ title: { $regex: filters.category, $options: 'i' } });
        }

        const total = await this.jobModel.countDocuments(query);
        const jobs = await this.jobModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).exec();

        return [jobs, total];
    }

    async getJobById(jobId: string): Promise<any> {
        try {
            return await this.jobModel.findOne({ _id: jobId, status: 'active' });
        } catch (err) {
            return null;
        }
    }

    async getJobByAdzunaId(adzunaId: string): Promise<any> {
        return await this.jobModel.findOne({ adzuna_id: adzunaId });
    }

    async toggleFavorite(userId: string, jobId: string): Promise<boolean> {
        const job = await this.getJobById(jobId);
        if (!job) throw new Error(`Job not found: ${jobId}`);

        const existing = await this.favoriteModel.findOne({ user_id: userId, job_id: jobId });
        if (existing) {
            await this.favoriteModel.deleteOne({ _id: existing._id });
            return false;
        } else {
            await this.favoriteModel.create({
                user_id: userId,
                job_id: jobId,
                adzuna_id: job.adzuna_id,
            });
            return true;
        }
    }

    async getUserFavorites(userId: string): Promise<any[]> {
        const favorites = await this.favoriteModel.find({ user_id: userId }).exec();
        if (!favorites || favorites.length === 0) return [];

        const adzunaIds = favorites.map(f => f.adzuna_id).filter(id => id != null);
        const rawIds = favorites.filter(f => !f.adzuna_id).map(f => f.job_id);

        const queryParts: any[] = [];
        if (adzunaIds.length > 0) queryParts.push({ adzuna_id: { $in: adzunaIds } });
        if (rawIds.length > 0) queryParts.push({ _id: { $in: rawIds } });

        if (queryParts.length === 0) return [];

        const query = queryParts.length > 1 ? { $or: queryParts } : queryParts[0];
        return await this.jobModel.find(query).exec();
    }

    async toggleBookmark(userId: string, jobId: string): Promise<boolean> {
        const job = await this.getJobById(jobId);
        if (!job) throw new Error(`Job not found: ${jobId}`);

        const existing = await this.bookmarkModel.findOne({ user_id: userId, job_id: jobId });
        if (existing) {
            await this.bookmarkModel.deleteOne({ _id: existing._id });
            return false;
        } else {
            await this.bookmarkModel.create({
                user_id: userId,
                job_id: jobId,
                adzuna_id: job.adzuna_id,
            });
            return true;
        }
    }

    async getUserBookmarks(userId: string): Promise<any[]> {
        const bookmarks = await this.bookmarkModel.find({ user_id: userId }).exec();
        if (!bookmarks || bookmarks.length === 0) return [];

        const adzunaIds = bookmarks.map(b => b.adzuna_id).filter(id => id != null);
        const rawIds = bookmarks.filter(b => !b.adzuna_id).map(b => b.job_id);

        const queryParts: any[] = [];
        if (adzunaIds.length > 0) queryParts.push({ adzuna_id: { $in: adzunaIds } });
        if (rawIds.length > 0) queryParts.push({ _id: { $in: rawIds } });

        if (queryParts.length === 0) return [];

        const query = queryParts.length > 1 ? { $or: queryParts } : queryParts[0];
        return await this.jobModel.find(query).exec();
    }
}
