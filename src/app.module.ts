import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

// Core modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResumeModule } from './resume/resume.module';
import { JobDescriptionModule } from './job-description/job-description.module';
import { ResultsModule } from './results/results.module';
import { InterviewModule } from './interview/interview.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { SubjectsModule } from './subjects/subjects.module';
import { QuizzesModule } from './quizzes/quizzes.module';

// From dev/backend_dsa
import { DsaQuestionsModule } from './dsa-questions/dsa-questions.module';

// From dev/backend_fixed
import { InterviewRoundsModule } from './interview_rounds/interview.module';
import { PaymentModule } from './payments/payment.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PlaceholderModule } from './common/placeholder';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({ isGlobal: true }),

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
    JobDescriptionModule,
    ResultsModule,
    InterviewModule,
    LessonsModule,
    ProgressModule,
    SubjectsModule,
    QuizzesModule,
    DsaQuestionsModule,
    InterviewRoundsModule,
    PaymentModule,
    SubscriptionModule,
    AnalyticsModule,
    PlaceholderModule,
    JobsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
