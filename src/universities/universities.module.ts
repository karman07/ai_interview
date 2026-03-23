import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { University, UniversitySchema } from './schemas/university.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';
import { Result, ResultSchema } from '../results/schemas/result.schema';
import { Resume, ResumeSchema } from '../resume/resume.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
      { name: Resume.name, schema: ResumeSchema },
    ]),
  ],
  providers: [UniversitiesService],
  controllers: [UniversitiesController],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
