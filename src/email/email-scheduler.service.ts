import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailSubscription, EmailSubscriptionDocument } from './schemas/email-subscription.schema';
import { EmailService } from './email.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    @InjectModel(EmailSubscription.name) private subscriptionModel: Model<EmailSubscriptionDocument>,
    private emailService: EmailService,
  ) {}

  @Cron('25 9 * * *', { timeZone: 'Asia/Kolkata' })
  async sendDailyUpdates() {
    this.logger.log('Starting daily update email task...');

    try {
      const subscribers = await this.subscriptionModel.find({
        isSubscribed: true,
      });

      if (subscribers.length === 0) {
        this.logger.log('No subscribers found');
        return;
      }

      const emails = subscribers.map(sub => sub.email);
      this.logger.log(`Sending daily updates to ${emails.length} subscribers`);

      const result = await this.emailService.sendBulkDailyEmails(emails);

      await this.subscriptionModel.updateMany(
        { isSubscribed: true },
        { lastEmailSentAt: new Date() }
      );

      this.logger.log(`Daily update completed: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
      this.logger.error(`Failed to send daily updates: ${error.message}`);
    }
  }

  async triggerDailyEmail() {
    this.logger.log('Manually triggering daily email...');
    await this.sendDailyUpdates();
  }
}
