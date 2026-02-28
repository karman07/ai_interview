import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
const FormData = require('form-data');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() { }

  /**
   * Universal method to send email via Mailgun API
   */
  private async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    const apiKey = process.env.MAILGUN_API_KEY;
    const apiUrl = process.env.MAILGUN_API_URL;
    const from = process.env.MAILGUN_FROM || 'AIForJob.ai <postmaster@aiforjob.ai>';

    const form = new FormData();
    form.append('from', from);
    form.append('to', to);
    form.append('subject', subject);
    form.append('text', text);
    if (html) {
      form.append('html', html);
    }

    try {
      const response = await axios.post(apiUrl, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
      });

      this.logger.log(`Email sent to ${to}: ${response.data.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async sendWelcomeEmail(to: string): Promise<boolean> {
    const subject = '🎉 Welcome to AIForJob.ai - Subscription Confirmed!';
    const text = `Thank you for subscribing to AIForJob.ai! You'll receive updates about new opportunities.`;
    const html = this.getWelcomeEmailTemplate();

    return this.sendEmail(to, subject, text, html);
  }

  async sendPaymentSuccessEmail(to: string, planName: string, amount: number): Promise<boolean> {
    const subject = '💳 Payment Successful - AIForJob.ai';
    const text = `Success! Your payment for ${planName} of ₹${amount / 100} was successful. Your account is now upgraded.`;
    return this.sendEmail(to, subject, text);
  }

  async sendSubscriptionCancelledEmail(to: string): Promise<boolean> {
    const subject = '⚠️ Subscription Cancelled - AIForJob.ai';
    const text = `Your subscription has been cancelled. You will continue to have access until your current period ends.`;
    return this.sendEmail(to, subject, text);
  }

  async sendDailyUpdateEmail(to: string): Promise<boolean> {
    const subject = '🚀 Daily Update from AIForJob.ai';
    const text = `Hello! Check out the latest opportunities at AIForJob.ai. Visit https://aiforjob.ai now!`;
    const html = this.getDailyUpdateEmailTemplate();

    return this.sendEmail(to, subject, text, html);
  }

  async sendBulkDailyEmails(emails: string[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const success = await this.sendDailyUpdateEmail(email);
      if (success) {
        sent++;
      } else {
        failed++;
      }
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(`Bulk email sent: ${sent} successful, ${failed} failed`);
    return { sent, failed };
  }

  private getWelcomeEmailTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #667eea;">Welcome to AIForJob.ai!</h1>
    <p>Thank you for subscribing. You're now on your way to mastering your interviews with AI.</p>
    <a href="https://aiforjob.ai" style="display: inline-block; background: #667eea; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
  </div>
</body>
</html>
    `;
  }

  private getDailyUpdateEmailTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #764ba2;">Daily AI Career Update</h1>
    <p>We found some new opportunities that match your professional profile!</p>
    <p>Log in to your dashboard to see your personalized matches.</p>
    <a href="https://aiforjob.ai" style="display: inline-block; background: #764ba2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check Matches</a>
  </div>
</body>
</html>
    `;
  }
}
