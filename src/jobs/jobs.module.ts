import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job, JobSchema } from './schemas/job.schema';
import { JobApplication, JobApplicationSchema } from './schemas/job-application.schema';
import { EmployerRequest, EmployerRequestSchema } from './schemas/employer-request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AiMatcherService } from '../common/services/ai-matcher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: EmployerRequest.name, schema: EmployerRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HttpModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, AiMatcherService],
  exports: [JobsService],
})
export class JobsModule {}