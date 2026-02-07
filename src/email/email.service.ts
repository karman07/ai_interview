import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      },
    });
  }

  async sendWelcomeEmail(to: string): Promise<boolean> {
    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@aiforjob.ai',
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: '🎉 Welcome to AIForJob.ai - Subscription Confirmed!',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.getWelcomeEmailTemplate(),
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Thank you for subscribing to AIForJob.ai! You'll receive daily updates about new opportunities.`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Welcome email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendDailyUpdateEmail(to: string): Promise<boolean> {
    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@aiforjob.ai',
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: '🚀 Daily Update from AIForJob.ai',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.getDailyUpdateEmailTemplate(),
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Hello! Check out the latest opportunities at AIForJob.ai. Visit https://aiforjob.ai now!`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Daily update email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
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
      await this.delay(100);
    }

    this.logger.log(`Bulk email sent: ${sent} successful, ${failed} failed`);
    return { sent, failed };
  }

  private getWelcomeEmailTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AIForJob.ai</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Career Partner</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">🎉 Thank You for Subscribing!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Welcome to AIForJob.ai! We're excited to have you on board.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                You'll now receive daily updates about exciting opportunities and features on our platform.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://aiforjob.ai" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Visit AIForJob.ai
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                You're receiving this because you subscribed at AIForJob.ai
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                <a href="https://aiforjob.ai/unsubscribe" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getDailyUpdateEmailTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Opportunities</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AIForJob.ai</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Career Partner</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">🚀 Your Daily Update</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Hello! Here's your daily update from AIForJob.ai.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Our AI-powered platform helps you:
              </p>
              
              <ul style="color: #666666; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>Find opportunities that match your skills</li>
                <li>Practice with AI-powered interview simulations</li>
                <li>Get real-time feedback on your performance</li>
                <li>Track your progress and improve continuously</li>
              </ul>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://aiforjob.ai" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Visit AIForJob.ai
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                You're receiving this because you subscribed at AIForJob.ai
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                <a href="https://aiforjob.ai/unsubscribe" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
