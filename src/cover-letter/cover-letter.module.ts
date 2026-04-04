import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoverLetterController } from './cover-letter.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UniversitiesModule } from '../universities/universities.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UniversitiesModule,
  ],
  controllers: [CoverLetterController],
})
export class CoverLetterModule {}
