import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { JobsController } from './jobs.controller';
import { JobService } from './job.service';
import { SyncScheduler } from './sync.scheduler';
import { EmailService } from './email.service';
import { MongooseModule } from '@nestjs/mongoose';

import { CtsService } from './cts/cts.service';
import { AdzunaService } from './adzuna/adzuna.service';
import { RagMatcherService } from './rag-matcher.service';

// Schemas
import { Job, JobSchema } from './schemas/job.schema';
import { Company, CompanySchema } from './schemas/company.schema';
import { JobSyncLog, JobSyncLogSchema } from './schemas/job-sync-log.schema';
import { ResumeSearchCache, ResumeSearchCacheSchema } from './schemas/resume-search-cache.schema';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { EmailSubscription, EmailSubscriptionSchema } from './schemas/email-subscription.schema';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get<string>('REDIS_HOST', 'localhost'),
                port: configService.get<number>('REDIS_PORT', 6379),
                ttl: 86400, // 24 hours caching for searches implicitly
            }),
        }),
        MongooseModule.forFeature([
            { name: Job.name, schema: JobSchema },
            { name: Company.name, schema: CompanySchema },
            { name: JobSyncLog.name, schema: JobSyncLogSchema },
            { name: ResumeSearchCache.name, schema: ResumeSearchCacheSchema },
            { name: Favorite.name, schema: FavoriteSchema },
            { name: Bookmark.name, schema: BookmarkSchema },
            { name: EmailSubscription.name, schema: EmailSubscriptionSchema },
        ]),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('SMTP_HOST', 'email-smtp.ap-south-1.amazonaws.com'),
                    port: configService.get<number>('SMTP_PORT', 587),
                    secure: configService.get<boolean>('SMTP_SECURE', false),
                    auth: {
                        user: configService.get('SMTP_USER', ''),
                        pass: configService.get('SMTP_PASS', ''),
                    },
                },
                defaults: {
                    from: configService.get('MAIL_FROM', '"No Reply" <noreply@aiforjob.ai>'),
                },
            }),
        }),
    ],
    controllers: [JobsController],
    providers: [
        JobService,
        SyncScheduler,
        EmailService,
        CtsService,
        AdzunaService,
        RagMatcherService,
    ],
})
export class JobsModule { }
