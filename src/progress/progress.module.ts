import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Progress.name, schema: ProgressSchema }]), LessonsModule],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
