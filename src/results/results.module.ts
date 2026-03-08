import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { Result, ResultSchema } from './schemas/result.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ResultsService],
  controllers: [ResultsController],
})
export class ResultsModule { }
