import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from '../universities/schemas/university.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { EmailService } from './email.service';

@Injectable()
export class UniversityReportSchedulerService {
  private readonly logger = new Logger(UniversityReportSchedulerService.name);

  constructor(
    @InjectModel(University.name)
    private universityModel: Model<UniversityDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  /**
   * Runs every Monday at 8:00 AM IST.
   * Sends a student analytics Excel report to all teachers of every active university.
   */
  @Cron('0 8 * * 1', { timeZone: 'Asia/Kolkata' })
  async sendWeeklyUniversityReports() {
    this.logger.log('Starting weekly university student report dispatch...');
    await this.dispatchAllUniversityReports();
  }

  /**
   * Can be called manually (e.g. from a controller endpoint) to trigger reports
   * for a specific university or all universities.
   */
  async dispatchAllUniversityReports(): Promise<{ universities: number; totalSent: number; totalFailed: number }> {
    const universities = await this.universityModel.find({ isActive: true }).lean();

    let totalSent = 0;
    let totalFailed = 0;

    for (const uni of universities) {
      try {
        const result = await this.dispatchReportForUniversity(uni._id.toString());
        totalSent += result.sent;
        totalFailed += result.failed;
      } catch (err) {
        this.logger.error(`Failed to dispatch report for university "${uni.name}": ${err.message}`);
      }
    }

    this.logger.log(`Weekly reports complete — ${universities.length} universities, ${totalSent} emails sent, ${totalFailed} failed`);
    return { universities: universities.length, totalSent, totalFailed };
  }

  async dispatchReportForUniversity(
    universityId: string,
  ): Promise<{ sent: number; failed: number }> {
    const uni = await this.universityModel.findById(universityId).lean();
    if (!uni) {
      this.logger.warn(`University ${universityId} not found, skipping`);
      return { sent: 0, failed: 0 };
    }

    // Fetch teachers and students in parallel
    const [teachers, students] = await Promise.all([
      this.userModel
        .find({ role: UserRole.UNIVERSITY_TEACHER, universityId })
        .select('email name')
        .lean(),
      this.userModel
        .find({ role: UserRole.STUDENT, universityId })
        .select('name email rollNumber interviewCount resumeCount createdAt')
        .lean(),
    ]);

    const teacherEmails = teachers.map((t) => t.email).filter(Boolean) as string[];

    if (!teacherEmails.length) {
      this.logger.warn(`No teachers found for university "${uni.name}", skipping`);
      return { sent: 0, failed: 0 };
    }

    if (!students.length) {
      this.logger.warn(`No students found for university "${uni.name}", skipping`);
      return { sent: 0, failed: 0 };
    }

    const studentPayload = students.map((s) => ({
      name: s.name,
      email: s.email,
      rollNumber: s.rollNumber,
      interviewCount: s.interviewCount ?? 0,
      resumeCount: s.resumeCount ?? 0,
      interviewLimit: uni.interviewLimit,
      resumeLimit: uni.resumeLimit,
      createdAt: s.createdAt,
    }));

    this.logger.log(
      `Sending report for "${uni.name}": ${students.length} students → ${teacherEmails.length} teachers`,
    );

    return this.emailService.sendUniversityStudentReport(uni.name, teacherEmails, studentPayload);
  }
}
