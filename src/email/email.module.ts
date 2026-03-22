import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { UniversityReportSchedulerService } from './university-report-scheduler.service';
import { EmailController } from './email.controller';
import { EmailSubscription, EmailSubscriptionSchema } from './schemas/email-subscription.schema';
import { EmailLog, EmailLogSchema } from './schemas/email-log.schema';
import { MailConfig, MailConfigSchema } from './schemas/mail-config.schema';
import { University, UniversitySchema } from '../universities/schemas/university.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: EmailSubscription.name, schema: EmailSubscriptionSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
      { name: MailConfig.name, schema: MailConfigSchema },
      { name: University.name, schema: UniversitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailSchedulerService, UniversityReportSchedulerService],
  exports: [EmailService],
})
export class EmailModule {}
