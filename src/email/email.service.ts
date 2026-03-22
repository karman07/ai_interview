import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
const FormData = require('form-data');
import { EmailLog, EmailLogDocument } from './schemas/email-log.schema';
import { MailConfig, MailConfigDocument } from './schemas/mail-config.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectModel(EmailLog.name) private emailLogModel: Model<EmailLogDocument>,
    @InjectModel(MailConfig.name) private mailConfigModel: Model<MailConfigDocument>,
  ) { }

  /** Reads config from DB first, falls back to env vars */
  async getMailConfig(): Promise<{ apiKey: string; apiUrl: string; from: string; isActive: boolean }> {
    const config = await this.mailConfigModel.findOne().sort({ updatedAt: -1 }).lean();
    return {
      apiKey: config?.mailgunApiKey || process.env.MAILGUN_API_KEY || '',
      apiUrl: config?.mailgunApiUrl || process.env.MAILGUN_API_URL || '',
      from: config?.mailgunFrom || process.env.MAILGUN_FROM || 'AIForJob.ai <postmaster@aiforjob.ai>',
      isActive: config?.isActive ?? true,
    };
  }

  /**
   * Universal method to send email via Mailgun API — reads config from DB, logs result
   */
  private async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    type: string = 'other',
    attachments?: Array<{ filename: string; data: Buffer; contentType: string }>,
  ): Promise<boolean> {
    const cfg = await this.getMailConfig();

    if (!cfg.isActive) {
      this.logger.warn('Mail sending is disabled in config');
      return false;
    }
    if (!cfg.apiKey || !cfg.apiUrl) {
      this.logger.error('Mailgun API key or URL not configured');
      await this.emailLogModel.create({ email: to, type, status: 'failed', error: 'Mailgun not configured' });
      return false;
    }

    const form = new FormData();
    form.append('from', cfg.from);
    form.append('to', to);
    form.append('subject', subject);
    form.append('text', text);
    if (html) {
      form.append('html', html);
    }
    if (attachments?.length) {
      for (const att of attachments) {
        form.append('attachment', att.data, { filename: att.filename, contentType: att.contentType });
      }
    }

    try {
      await axios.post(cfg.apiUrl, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Basic ${Buffer.from(`api:${cfg.apiKey}`).toString('base64')}`,
        },
      });
      await this.emailLogModel.create({ email: to, type, status: 'sent' });
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      this.logger.error(`Failed to send email to ${to}: ${errMsg}`);
      await this.emailLogModel.create({ email: to, type, status: 'failed', error: errMsg });
      return false;
    }
  }

  async sendWelcomeEmail(to: string): Promise<boolean> {
    const subject = '🎉 Welcome to AIForJob.ai - Subscription Confirmed!';
    const text = `Thank you for subscribing to AIForJob.ai! You'll receive updates about new opportunities.`;
    const html = this.getWelcomeEmailTemplate();
    return this.sendEmail(to, subject, text, html, 'welcome');
  }

  async sendPaymentSuccessEmail(to: string, planName: string, amount: number): Promise<boolean> {
    const subject = '💳 Payment Successful - AIForJob.ai';
    const text = `Success! Your payment for ${planName} of ₹${amount / 100} was successful. Your account is now upgraded.`;
    return this.sendEmail(to, subject, text, undefined, 'payment_success');
  }

  async sendSubscriptionCancelledEmail(to: string): Promise<boolean> {
    const subject = '⚠️ Subscription Cancelled - AIForJob.ai';
    const text = `Your subscription has been cancelled. You will continue to have access until your current period ends.`;
    return this.sendEmail(to, subject, text, undefined, 'subscription_cancelled');
  }

  async sendDailyUpdateEmail(to: string): Promise<boolean> {
    const subject = '🚀 Daily Update from AIForJob.ai';
    const text = `Hello! Check out the latest opportunities at AIForJob.ai. Visit https://aiforjob.ai now!`;
    const html = this.getDailyUpdateEmailTemplate();
    return this.sendEmail(to, subject, text, html, 'daily_update');
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

  // ── University student analytics report ─────────────────────────────────────

  /**
   * Builds in-memory Excel (.xlsx) buffer for a university's student analytics
   * and emails it to every teacher in the recipients list.
   */
  async sendUniversityStudentReport(
    universityName: string,
    teacherEmails: string[],
    students: Array<{
      name: string;
      email: string;
      rollNumber?: string;
      interviewCount: number;
      resumeCount: number;
      interviewLimit: number;
      resumeLimit: number;
      createdAt?: Date;
    }>,
  ): Promise<{ sent: number; failed: number }> {
    if (!teacherEmails.length) return { sent: 0, failed: 0 };

    // ── Build Excel workbook ──────────────────────────────────────────────────
    const XLSX = await import('xlsx');

    // Compute composite score: 60% interview usage + 40% resume usage
    const withScores = students.map((s, idx) => {
      const interviewPct = s.interviewLimit > 0 ? Math.min((s.interviewCount / s.interviewLimit) * 100, 100) : 0;
      const resumePct = s.resumeLimit > 0 ? Math.min((s.resumeCount / s.resumeLimit) * 100, 100) : 0;
      const score = Math.round(interviewPct * 0.6 + resumePct * 0.4);
      return { ...s, interviewPct: Math.round(interviewPct), resumePct: Math.round(resumePct), score };
    });

    // Sort by score desc for ranking
    withScores.sort((a, b) => b.score - a.score);

    // Sheet 1 — Ranked student list
    const rankRows = withScores.map((s, i) => ({
      Rank: i + 1,
      'Roll Number': s.rollNumber || '—',
      'Student Name': s.name,
      'Email': s.email,
      'Interviews Done': s.interviewCount,
      'Interview Limit': s.interviewLimit,
      'Interview Usage %': `${s.interviewPct}%`,
      'Resumes Created': s.resumeCount,
      'Resume Limit': s.resumeLimit,
      'Resume Usage %': `${s.resumePct}%`,
      'Composite Score': s.score,
      'Joined On': s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—',
    }));

    // Sheet 2 — Summary stats
    const totalStudents = students.length;
    const avgInterviews = totalStudents ? Math.round(students.reduce((a, s) => a + s.interviewCount, 0) / totalStudents) : 0;
    const avgResumes = totalStudents ? Math.round(students.reduce((a, s) => a + s.resumeCount, 0) / totalStudents) : 0;
    const avgScore = totalStudents ? Math.round(withScores.reduce((a, s) => a + s.score, 0) / totalStudents) : 0;
    const nearLimitCount = withScores.filter(s => s.interviewPct >= 90 || s.resumePct >= 90).length;

    const summaryRows = [
      { Metric: 'Institute', Value: universityName },
      { Metric: 'Report Generated On', Value: new Date().toLocaleString('en-IN') },
      { Metric: 'Total Students', Value: totalStudents },
      { Metric: 'Avg. Interviews Per Student', Value: avgInterviews },
      { Metric: 'Avg. Resumes Per Student', Value: avgResumes },
      { Metric: 'Avg. Composite Score', Value: avgScore },
      { Metric: 'Students Near Limit (≥90%)', Value: nearLimitCount },
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(rankRows);
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);

    // Set column widths for readability
    ws1['!cols'] = [
      { wch: 6 }, { wch: 14 }, { wch: 24 }, { wch: 30 }, { wch: 16 }, { wch: 14 },
      { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
    ];
    ws2['!cols'] = [{ wch: 30 }, { wch: 36 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Student Rankings');
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    const reportDate = new Date().toISOString().slice(0, 10);
    const filename = `${universityName.replace(/\s+/g, '_')}_Student_Report_${reportDate}.xlsx`;

    // ── Send to all teachers ─────────────────────────────────────────────────
    const subject = `📊 Weekly Student Analytics Report — ${universityName}`;
    const text = `Dear Teacher,\n\nPlease find attached the weekly student analytics report for ${universityName}.\n\nThis report includes:\n• Student rankings by composite score (60% interview + 40% resume usage)\n• Individual interview and resume usage statistics\n• Roll numbers and registration details\n\nReport generated on: ${new Date().toLocaleString('en-IN')}\n\nBest regards,\nAIForJob.ai Platform`;
    const html = this.getUniversityReportEmailTemplate(universityName, totalStudents, avgScore, nearLimitCount, reportDate);

    const attachment = { filename, data: excelBuffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

    let sent = 0;
    let failed = 0;
    for (const email of teacherEmails) {
      const ok = await this.sendEmail(email, subject, text, html, 'university_report', [attachment]);
      if (ok) sent++; else failed++;
      await new Promise(r => setTimeout(r, 150)); // rate-limit guard
    }

    this.logger.log(`University report for "${universityName}": ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  private getUniversityReportEmailTemplate(
    universityName: string,
    totalStudents: number,
    avgScore: number,
    nearLimit: number,
    reportDate: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f0f4ff; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">📊 Weekly Student Report</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">${universityName}</p>
    </div>
    <!-- Body -->
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">Dear Teacher,</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Your weekly student analytics report is ready. Please find the Excel file attached to this email.
      </p>
      <!-- Stats row -->
      <div style="display: flex; gap: 12px; margin-bottom: 28px;">
        <div style="flex: 1; background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #667eea;">${totalStudents}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Total Students</div>
        </div>
        <div style="flex: 1; background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #10b981;">${avgScore}%</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Avg. Score</div>
        </div>
        <div style="flex: 1; background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${nearLimit}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Near Limit</div>
        </div>
      </div>
      <!-- What's included -->
      <div style="background: #eff6ff; border-left: 4px solid #667eea; border-radius: 4px; padding: 16px 20px; margin-bottom: 28px;">
        <p style="font-weight: 600; color: #1e40af; margin: 0 0 8px; font-size: 14px;">📎 Report includes:</p>
        <ul style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Student rankings by composite score</li>
          <li>Individual interview &amp; resume usage</li>
          <li>Roll numbers for all students</li>
          <li>Students approaching usage limits</li>
        </ul>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Report generated on: ${reportDate} &nbsp;|&nbsp; AIForJob.ai Platform</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
