import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicInterview, TopicInterviewSchema } from './schemas/topic-interview.schema';
import { TopicInterviewsService } from './topic-interviews.service';
import { TopicInterviewsController } from './topic-interviews.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TopicInterview.name, schema: TopicInterviewSchema },
    ]),
  ],
  controllers: [TopicInterviewsController],
  providers: [TopicInterviewsService],
  exports: [TopicInterviewsService],
})
export class TopicInterviewsModule {}
