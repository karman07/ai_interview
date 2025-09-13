import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResumeModule } from './resume/resume.module';
import { ResultsModule } from './results/results.module';
import { InterviewModule } from './interview/interview.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { SubjectsModule } from './subjects/subjects.module';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MulterModule.register({
      dest: process.env.UPLOAD_DIR ?? 'uploads/resumes',
    }),
    AuthModule,
    UsersModule,
    ResumeModule,
    ResultsModule,
    InterviewModule, 
    LessonsModule,
    ProgressModule,
    SubjectsModule,
    QuizzesModule
  ],
})
export class AppModule {}
