import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResumeModule } from './resume/resume.module';

import { ResultsModule } from './results/results.module';

import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { SubjectsModule } from './subjects/subjects.module';
import { QuizzesModule } from './quizzes/quizzes.module';

// V2 Interview Module


// From dev/backend_dsa
import { DsaQuestionsModule } from './dsa-questions/dsa-questions.module';

// From dev/backend_fixed

import { PaymentModule } from './payments/payment.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PlaceholderModule } from './common/placeholder';

import { CvModule } from './cv/cv.module';
import { SessionsModule } from './sessions/sessions.module';

import { AudioModule } from './audio/audio.module';
import { EmailModule } from './email/email.module';
import { JobsModule } from './jobs/jobs.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({ isGlobal: true }),

    // Scheduling
    ScheduleModule.forRoot(),

    // MongoDB connection with optimized settings
    MongooseModule.forRoot(process.env.MONGO_URI, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }),

    // File uploads
    MulterModule.register({
      dest: process.env.UPLOAD_DIR ?? 'uploads/resumes',
    }),

    // App modules
    AuthModule,
    UsersModule,
    ResumeModule,
    ResultsModule,
    LessonsModule,
    ProgressModule,
    SubjectsModule,
    QuizzesModule,

    DsaQuestionsModule,
    PaymentModule,
    SubscriptionModule,
    AnalyticsModule,
    PlaceholderModule,
    CvModule,
    SessionsModule,
    AudioModule,
    EmailModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
