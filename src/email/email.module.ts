import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { EmailController } from './email.controller';
import { EmailSubscription, EmailSubscriptionSchema } from './schemas/email-subscription.schema';
import { EmailLog, EmailLogSchema } from './schemas/email-log.schema';
import { MailConfig, MailConfigSchema } from './schemas/mail-config.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: EmailSubscription.name, schema: EmailSubscriptionSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
      { name: MailConfig.name, schema: MailConfigSchema },
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailSchedulerService],
  exports: [EmailService],
})
export class EmailModule {}
