import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { University, UniversitySchema } from './schemas/university.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [UniversitiesService],
  controllers: [UniversitiesController],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
