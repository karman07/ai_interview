import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobService } from './job.service';
import { EmailService } from './email.service';

@Injectable()
export class SyncScheduler {
    private readonly logger = new Logger(SyncScheduler.name);

    constructor(
        private readonly jobService: JobService,
        private readonly emailService: EmailService,
    ) { }

    @Cron('0 2 * * 1,3,5') // 2:00 AM UTC on Monday, Wednesday, Friday (3×/week)
    async handleDailyJobSync() {
        this.logger.log('Starting engineering job sync (3×/week)...');
        try {
            await this.jobService.syncEngineeringJobs();
            this.logger.log('Engineering job sync completed successfully.');
        } catch (error) {
            this.logger.error(`Engineering job sync failed: ${error.message}`);
        }
    }

    @Cron('0 10 * * *') // 10:00 AM UTC daily
    async handleDailyEmails() {
        this.logger.log('Starting daily personalized emails...');
        await this.emailService.sendPersonalizedEmails('daily');
    }

    @Cron('0 10 * * 2') // 10:00 AM UTC on Tuesday
    async handleWeeklyEmails() {
        this.logger.log('Starting weekly personalized emails...');
        await this.emailService.sendPersonalizedEmails('weekly');
    }

    @Cron('0 10 * * 2,4') // 10:00 AM UTC on Tuesday and Thursday
    async handleBiweeklyEmails() {
        this.logger.log('Starting biweekly personalized emails...');
        await this.emailService.sendPersonalizedEmails('biweekly');
    }
}
