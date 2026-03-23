import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Generate a unique 6-character alphanumeric class code */
  private async generateClassCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
    let code: string;
    let exists = true;
    while (exists) {
      code = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
      exists = !!(await this.classModel.findOne({ classCode: code }));
    }
    return code;
  }

  /** Verify the caller is the owner (teacher) of the class */
  private async verifyOwnership(
    classId: string,
    teacherId: string,
  ): Promise<ClassDocument> {
    const cls = await this.classModel.findById(classId);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId) {
      throw new ForbiddenException('You do not own this class');
    }
    return cls;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(
    teacherId: string,
    universityId: string,
    dto: CreateClassDto,
  ): Promise<ClassDocument> {
    
    let resolvedUniversityId = universityId;
    if (!resolvedUniversityId) {
      const teacher = await this.userModel.findById(teacherId);
      if (!teacher || !teacher.universityId) {
        throw new ForbiddenException('You are not associated with any university');
      }
      resolvedUniversityId = teacher.universityId.toString();
    }

    const classCode = await this.generateClassCode();
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3001';
    const inviteLink = `${frontendUrl}/join/${classCode}`;

    return this.classModel.create({
      ...dto,
      classCode,
      inviteLink,
      teacherId,
      universityId: resolvedUniversityId,
    });
  }

  async findAllByTeacher(teacherId: string): Promise<any[]> {
    const classes = await this.classModel
      .find({ teacherId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return classes.map((cls) => ({
      ...cls,
      studentCount: cls.students?.length || 0,
    }));
  }

  async findAllByStudent(studentId: string): Promise<any[]> {
    const classes = await this.classModel
      .find({ students: studentId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return classes.map((cls) => ({
      ...cls,
      studentCount: cls.students?.length || 0,
    }));
  }

  async findById(classId: string): Promise<any> {
    const cls = await this.classModel.findById(classId).lean();
    if (!cls) throw new NotFoundException('Class not found');

    // Fetch student details
    const studentList = await this.userModel
      .find({ _id: { $in: cls.students || [] } })
      .select('-passwordHash -refreshTokenHash')
      .sort({ name: 1 })
      .lean();

    // Calculate stats
    const totalStudents = studentList.length;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // "Active" = logged in (updatedAt) within last 7 days
    const activeStudents = studentList.filter(
      (s: any) => s.updatedAt && new Date(s.updatedAt) >= sevenDaysAgo,
    ).length;

    // Average interview count as a proxy for score (until real scoring exists)
    const totalInterviews = studentList.reduce(
      (sum: number, s: any) => sum + (s.interviewCount || 0),
      0,
    );
    const avgInterviewScore =
      totalStudents > 0 ? Math.round(totalInterviews / totalStudents) : 0;

    return {
      ...cls,
      stats: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        avgInterviewScore,
      },
      studentList,
    };
  }

  async update(
    classId: string,
    teacherId: string,
    dto: UpdateClassDto,
  ): Promise<ClassDocument> {
    await this.verifyOwnership(classId, teacherId);
    const updated = await this.classModel.findByIdAndUpdate(classId, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Class not found');
    return updated;
  }

  async remove(classId: string, teacherId: string): Promise<void> {
    await this.verifyOwnership(classId, teacherId);
    await this.classModel.findByIdAndUpdate(classId, { isActive: false });
  }

  // ── Enrollment ────────────────────────────────────────────────────────────

  async enrollStudents(
    classId: string,
    teacherId: string,
    studentIds: string[],
  ): Promise<ClassDocument> {
    await this.verifyOwnership(classId, teacherId);

    // Verify all IDs are valid students
    const validStudents = await this.userModel
      .find({ _id: { $in: studentIds }, role: UserRole.STUDENT })
      .select('_id');
    const validIds = validStudents.map((s) => s._id.toString());

    if (validIds.length === 0) {
      throw new NotFoundException('No valid students found');
    }

    const updated = await this.classModel.findByIdAndUpdate(
      classId,
      { $addToSet: { students: { $each: validIds } } },
      { new: true },
    );
    return updated;
  }

  async removeStudent(
    classId: string,
    teacherId: string,
    studentId: string,
  ): Promise<void> {
    await this.verifyOwnership(classId, teacherId);
    await this.classModel.findByIdAndUpdate(classId, {
      $pull: { students: studentId },
    });
  }

  // ── Join by code (for students) ───────────────────────────────────────────

  async findByCode(classCode: string): Promise<ClassDocument> {
    const cls = await this.classModel.findOne({
      classCode: classCode.toUpperCase(),
      isActive: true,
    });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async joinByCode(
    classCode: string,
    studentId: string,
  ): Promise<ClassDocument> {
    const cls = await this.findByCode(classCode);

    // Check if already enrolled
    if (cls.students.includes(studentId)) {
      throw new ConflictException('You are already enrolled in this class');
    }

    const updated = await this.classModel.findByIdAndUpdate(
      cls._id,
      { $addToSet: { students: studentId } },
      { new: true },
    );
    return updated;
  }
}
