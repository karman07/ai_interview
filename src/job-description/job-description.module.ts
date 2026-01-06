import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobDescriptionController } from './job-description.controller';
import { JobDescriptionService } from './job-description.service';
import { JobDescription, JobDescriptionSchema } from './job-description.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobDescription.name, schema: JobDescriptionSchema },
    ]),
  ],
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService],
  exports: [JobDescriptionService],
})
export class JobDescriptionModule {}