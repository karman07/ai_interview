import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsController } from './sessions.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Result, ResultSchema } from '../results/schemas/result.schema';
import { UniversitiesModule } from '../universities/universities.module';

@Module({
  imports: [
    UniversitiesModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
  ],
  controllers: [SessionsController],
})
export class SessionsModule { }