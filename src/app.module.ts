import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

// Core modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResumeModule } from './resume/resume.module';
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

const logger = new Logger('MongoDB');

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ MongoDB connection with timeout and logging
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGO_URI;
        if (!uri) {
          logger.error('❌ MONGO_URI not set in environment!');
          throw new Error('MONGO_URI not set');
        }

        logger.log(`🔗 Connecting to MongoDB at: ${uri}`);

        return {
          uri,
          serverSelectionTimeoutMS: 5000, // fail fast if DB unreachable
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('✅ MongoDB connected successfully');
            });
            connection.on('error', (err) => {
              logger.error('❌ MongoDB connection error:', err);
            });
            connection.on('disconnected', () => {
              logger.warn('⚠️ MongoDB disconnected');
            });
            return connection;
          },
        };
      },
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
    InterviewModule,
    LessonsModule,
    ProgressModule,
    SubjectsModule,
    QuizzesModule,
    DsaQuestionsModule,
    InterviewRoundsModule,
    // PaymentModule,
    SubscriptionModule,
    AnalyticsModule,
    PlaceholderModule,
  ],
})
export class AppModule {}
