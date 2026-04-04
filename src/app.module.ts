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
import { ResourcesModule } from './resources/resources.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

// Other modules
import { DsaQuestionsModule } from './dsa-questions/dsa-questions.module';
import { PaymentModule } from './payments/payment.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PlaceholderModule } from './common/placeholder';
import { DiscountsModule } from './discounts/discounts.module';
import { CvModule } from './cv/cv.module';
import { SessionsModule } from './sessions/sessions.module';
import { AudioModule } from './audio/audio.module';
import { EmailModule } from './email/email.module';
import { JobsModule } from './jobs/jobs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AiConfigModule } from './ai-config/ai-config.module';
import { UniversitiesModule } from './universities/universities.module';
import { ClassesModule } from './classes/classes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AlertsModule } from './alerts/alerts.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BlogsModule } from './blogs/blogs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CoverLetterModule } from './cover-letter/cover-letter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }),
    MulterModule.register({
      dest: process.env.UPLOAD_DIR ?? 'uploads/resumes',
    }),
    AuthModule,
    UsersModule,
    ResumeModule,
    ResultsModule,
    LessonsModule,
    ProgressModule,
    SubjectsModule,
    QuizzesModule,
    ResourcesModule,
    KnowledgeModule,
    DsaQuestionsModule,
    PaymentModule,
    SubscriptionModule,
    AnalyticsModule,
    PlaceholderModule,
    DiscountsModule,
    CvModule,
    SessionsModule,
    AudioModule,
    EmailModule,
    JobsModule,
    ReviewsModule,
    BlogsModule,
    AiConfigModule,
    UniversitiesModule,
    ClassesModule,
    AssignmentsModule,
    AlertsModule,
    FeedbackModule,
    NotificationsModule,
    CoverLetterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
