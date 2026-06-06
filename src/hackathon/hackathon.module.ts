import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';
import { HackathonEmail, HackathonEmailSchema } from './schemas/hackathon-email.schema';
import { HackathonConfig, HackathonConfigSchema } from './schemas/hackathon-config.schema';
import { HackathonResult, HackathonResultSchema } from './schemas/hackathon-result.schema';
import { HackathonForm, HackathonFormSchema } from './schemas/hackathon-form.schema';
import { UsersModule } from '../users/users.module';
import { Result, ResultSchema } from '../results/schemas/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HackathonEmail.name, schema: HackathonEmailSchema },
      { name: HackathonConfig.name, schema: HackathonConfigSchema },
      { name: HackathonResult.name, schema: HackathonResultSchema },
      { name: HackathonForm.name, schema: HackathonFormSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
    MulterModule.register({ storage: require('multer').memoryStorage() }),
    UsersModule,
  ],
  controllers: [HackathonController],
  providers: [HackathonService],
  exports: [HackathonService],
})
export class HackathonModule {}
