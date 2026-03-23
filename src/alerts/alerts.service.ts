import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument, AlertType } from './schemas/alert.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Result, ResultDocument } from '../results/schemas/result.schema';
import { UpdateAlertDto } from './dto/alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  // ── Basic CRUD ────────────────────────────────────────────────────────────

  async findAllForTeacher(teacherId: string): Promise<any[]> {
    const alerts = await this.alertModel
      .find({ teacherId })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with student context where applicable
    const studentIds = alerts.map((a) => a.studentId).filter(Boolean);
    const students = await this.userModel
      .find({ _id: { $in: studentIds } })
      .select('name email profileImageUrl')
      .lean();

    const classIds = alerts.map((a) => a.classId).filter(Boolean);
    const classes = await this.classModel
      .find({ _id: { $in: classIds } })
      .select('name')
      .lean();

    const studentMap = new Map(students.map((s: any) => [s._id.toString(), s]));
    const classMap = new Map(classes.map((c: any) => [c._id.toString(), c]));

    return alerts.map((alert) => ({
      ...alert,
      student: alert.studentId ? studentMap.get(alert.studentId) : null,
      className: alert.classId ? classMap.get(alert.classId)?.name : null,
    }));
  }

  async getUnreadCount(teacherId: string): Promise<number> {
    return this.alertModel.countDocuments({ teacherId, isRead: false });
  }

  async markAsRead(alertId: string, teacherId: string, dto: UpdateAlertDto) {
    const alert = await this.alertModel.findOneAndUpdate(
      { _id: alertId, teacherId },
      { isRead: dto.isRead !== undefined ? dto.isRead : true },
      { new: true },
    );
    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }

  async markAllAsRead(teacherId: string) {
    await this.alertModel.updateMany({ teacherId, isRead: false }, { isRead: true });
    return { success: true };
  }

  // ── Alert Generators ──────────────────────────────────────────────────────

  /**
   * Scans all students under a teacher's classes.
   * If a student hasn't taken an interview in the last 7 days, generate an Engagement alert.
   */
  async checkEngagement(teacherId: string) {
    const classes = await this.classModel.find({ teacherId, isActive: true });
    const studentIds = new Set<string>();
    classes.forEach((c) => c.students.forEach((s) => studentIds.add(s)));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const studentId of Array.from(studentIds)) {
      // Find the most recent interview for the student
      const lastResult = await this.resultModel
        .findOne({ owner: studentId })
        .sort({ createdAt: -1 })
        .select('createdAt');

      let daysInactive = -1;
      let generateAlert = false;

      if (!lastResult) {
        // No interviews ever. Check if student was created > 7 days ago
        const student = await this.userModel.findById(studentId).select('createdAt');
        if (student && student.createdAt && student.createdAt < sevenDaysAgo) {
          generateAlert = true;
          daysInactive = Math.floor(
            (new Date().getTime() - student.createdAt.getTime()) / (1000 * 3600 * 24),
          );
        }
      } else if (lastResult.createdAt && lastResult.createdAt < sevenDaysAgo) {
        generateAlert = true;
        daysInactive = Math.floor(
          (new Date().getTime() - lastResult.createdAt.getTime()) / (1000 * 3600 * 24),
        );
      }

      if (generateAlert && daysInactive > 0) {
        // Ensure we don't spam the exact same alert repeatedly within 3 days
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const existingAlert = await this.alertModel.findOne({
          teacherId,
          studentId,
          type: AlertType.ENGAGEMENT,
          createdAt: { $gte: threeDaysAgo },
        });

        if (!existingAlert) {
          await this.alertModel.create({
            type: AlertType.ENGAGEMENT,
            message: `Student has been inactive for ${daysInactive} days.`,
            teacherId,
            studentId,
            metadata: { daysInactive },
          });
        }
      }
    }
    return { success: true, checkedStudents: studentIds.size };
  }

  /**
   * Scans recent interviews. If a student scores < 30% overall, generate a Performance alert.
   */
  async checkPerformance(teacherId: string) {
    const classes = await this.classModel.find({ teacherId, isActive: true });
    const studentIds = new Set<string>();
    classes.forEach((c) => c.students.forEach((s) => studentIds.add(s)));

    // Look at interviews from the last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentResults = await this.resultModel.find({
      owner: { $in: Array.from(studentIds) },
      createdAt: { $gte: threeDaysAgo },
      'summary.overall_score': { $lt: 40 }, // threshold
    });

    for (const res of recentResults) {
      // Don't spam duplicates for the same interview
      const existingAlert = await this.alertModel.findOne({
        teacherId,
        studentId: res.owner.toString(),
        type: AlertType.PERFORMANCE,
        'metadata.resultId': res._id.toString(),
      });

      if (!existingAlert) {
        await this.alertModel.create({
          type: AlertType.PERFORMANCE,
          message: `Student scored critically low (${res.summary?.overall_score}%) in a recent ${res.roundType} interview.`,
          teacherId,
          studentId: res.owner.toString(),
          metadata: {
            resultId: res._id.toString(),
            score: res.summary?.overall_score,
            topic: res.roundType,
          },
        });
      }
    }
    return { success: true, scannedResults: recentResults.length };
  }

  /**
   * Run all checks for a teacher
   */
  async runAllChecks(teacherId: string) {
    await this.checkEngagement(teacherId);
    await this.checkPerformance(teacherId);
    return { success: true, message: 'Checks completed' };
  }
}
