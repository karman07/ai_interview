import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Assignment,
  AssignmentDocument,
} from './schemas/assignment.schema';
import {
  StudentAssignment,
  StudentAssignmentDocument,
  StudentAssignmentStatus,
} from './schemas/student-assignment.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Result, ResultDocument } from '../results/schemas/result.schema';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(StudentAssignment.name)
    private studentAssignmentModel: Model<StudentAssignmentDocument>,
    @InjectModel(Class.name)
    private classModel: Model<ClassDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Result.name)
    private resultModel: Model<ResultDocument>,
  ) {}

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async verifyOwnership(
    assignmentId: string,
    teacherId: string,
  ): Promise<AssignmentDocument> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You do not own this assignment');
    }
    return assignment;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(
    teacherId: string,
    universityId: string,
    dto: CreateAssignmentDto,
  ): Promise<any> {
    let resolvedUniversityId = universityId;
    if (!resolvedUniversityId) {
      const teacher = await this.userModel.findById(teacherId);
      if (!teacher || !teacher.universityId) {
        throw new ForbiddenException(
          'You are not associated with any university',
        );
      }
      resolvedUniversityId = teacher.universityId.toString();
    }

    // Verify class exists and belongs to teacher
    const cls = await this.classModel.findById(dto.classId);
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId) {
      throw new ForbiddenException('You do not own this class');
    }
    // Determine target students
    const targetStudents =
      dto.assignedTo && dto.assignedTo.length > 0
        ? dto.assignedTo
        : cls.students || [];

    // Create the assignment
    const assignment = await this.assignmentModel.create({
      title: dto.title,
      classId: dto.classId,
      teacherId,
      universityId: resolvedUniversityId,
      topic: dto.topic,
      difficulty: dto.difficulty || 'medium',
      numInterviews: dto.numInterviews || 1,
      deadline: new Date(dto.deadline),
      assignedTo: targetStudents,
    });

    // Create StudentAssignment records for each student
    const studentAssignments = targetStudents.map((studentId) => ({
      assignmentId: assignment._id.toString(),
      studentId,
      status: StudentAssignmentStatus.ASSIGNED,
      completedInterviews: 0,
      scores: [],
      avgScore: 0,
    }));

    if (studentAssignments.length > 0) {
      await this.studentAssignmentModel.insertMany(studentAssignments, {
        ordered: false,
      }).catch(() => {
        // Ignore duplicate key errors (student already assigned)
      });
    }

    return {
      ...assignment.toObject(),
      studentCount: targetStudents.length,
    };
  }

  async findAllByTeacher(teacherId: string): Promise<any[]> {
    const assignments = await this.assignmentModel
      .find({ teacherId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with progress stats
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const studentAssignments = await this.studentAssignmentModel
          .find({ assignmentId: a._id.toString() })
          .lean();

        const total = studentAssignments.length;
        const completed = studentAssignments.filter(
          (sa) =>
            sa.status === StudentAssignmentStatus.COMPLETED ||
            sa.status === StudentAssignmentStatus.EVALUATED,
        ).length;
        const allScores = studentAssignments
          .filter((sa) => sa.avgScore > 0)
          .map((sa) => sa.avgScore);
        const avgScore =
          allScores.length > 0
            ? Math.round(
                allScores.reduce((s, v) => s + v, 0) / allScores.length,
              )
            : 0;

        // Get class name
        const cls = await this.classModel
          .findById(a.classId)
          .select('name')
          .lean();

        return {
          ...a,
          className: cls?.name || 'Unknown',
          studentCount: total,
          completedCount: completed,
          completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
          avgScore,
        };
      }),
    );

    return enriched;
  }

  async findAllByStudent(studentId: string): Promise<any[]> {
    // 1. Find all classes the student is enrolled in
    const enrolledClasses = await this.classModel
      .find({ students: studentId, isActive: true })
      .select('_id')
      .lean();
    const classIds = enrolledClasses.map((c) => c._id.toString());

    // 2. Find all active assignments for these classes
    const activeAssignments = await this.assignmentModel
      .find({ classId: { $in: classIds }, isActive: true })
      .lean();

    // 3. Find existing StudentAssignment records
    const existingSAs = await this.studentAssignmentModel
      .find({ studentId })
      .lean();
    const existingAssignmentIds = new Set(existingSAs.map((sa) => sa.assignmentId));

    // 4. Create missing StudentAssignment records
    const missingAssignments = activeAssignments.filter(
      (a) => !existingAssignmentIds.has(a._id.toString()),
    );

    if (missingAssignments.length > 0) {
      const newSAs = missingAssignments.map((a) => ({
        assignmentId: a._id.toString(),
        studentId,
        status: StudentAssignmentStatus.ASSIGNED,
        completedInterviews: 0,
        scores: [],
        avgScore: 0,
      }));
      await this.studentAssignmentModel.insertMany(newSAs, { ordered: false }).catch(() => {});
    }

    // 5. Fetch all (including newly created) and return enriched
    const allSAs = await this.studentAssignmentModel
      .find({ studentId })
      .lean();

    const assignmentMap = new Map(
      activeAssignments.map((a) => [a._id.toString(), a]),
    );

    return allSAs
      .map((sa) => {
        const a = assignmentMap.get(sa.assignmentId);
        if (!a) return null;
        return {
          ...sa,
          title: a.title,
          topic: a.topic,
          difficulty: a.difficulty,
          numInterviews: a.numInterviews,
          deadline: a.deadline,
          teacherId: a.teacherId,
          classId: a.classId,
        };
      })
      .filter((item) => item !== null)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByStudentAssignmentId(
    assignmentId: string,
    studentId: string,
  ): Promise<any> {
    const sa = await this.studentAssignmentModel
      .findOne({ assignmentId, studentId })
      .lean();
    if (!sa) throw new NotFoundException('Assignment not found for student');

    const assignment = await this.assignmentModel.findById(assignmentId).lean();
    if (!assignment || !assignment.isActive) {
      throw new NotFoundException('Assignment no longer active');
    }

    return {
      ...sa,
      assignmentInfo: assignment,
    };
  }

  async findById(assignmentId: string): Promise<any> {
    const assignment = await this.assignmentModel
      .findById(assignmentId)
      .lean();
    if (!assignment) throw new NotFoundException('Assignment not found');

    // Get class info
    const cls = await this.classModel
      .findById(assignment.classId)
      .select('name')
      .lean();

    // Get per-student progress with user details
    const studentAssignments = await this.studentAssignmentModel
      .find({ assignmentId: assignment._id.toString() })
      .lean();

    // Fetch student details
    const studentIds = studentAssignments.map((sa) => sa.studentId);
    const students = await this.userModel
      .find({ _id: { $in: studentIds } })
      .select('-passwordHash -refreshTokenHash')
      .lean();

    const studentMap = new Map(
      students.map((s: any) => [s._id.toString(), s]),
    );

    const studentProgress = studentAssignments.map((sa) => {
      const student = studentMap.get(sa.studentId) as any;
      return {
        ...sa,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || '',
        profileImageUrl: student?.profileImageUrl || null,
      };
    });

    // Aggregate stats
    const total = studentAssignments.length;
    const completed = studentAssignments.filter(
      (sa) =>
        sa.status === StudentAssignmentStatus.COMPLETED ||
        sa.status === StudentAssignmentStatus.EVALUATED,
    ).length;
    const inProgress = studentAssignments.filter(
      (sa) => sa.status === StudentAssignmentStatus.IN_PROGRESS,
    ).length;
    const allScores = studentAssignments
      .filter((sa) => sa.avgScore > 0)
      .map((sa) => sa.avgScore);
    const avgScore =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((s, v) => s + v, 0) / allScores.length,
          )
        : 0;

    return {
      ...assignment,
      className: cls?.name || 'Unknown',
      stats: {
        totalStudents: total,
        completed,
        inProgress,
        notStarted: total - completed - inProgress,
        completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgScore,
      },
      studentProgress,
    };
  }

  async update(
    assignmentId: string,
    teacherId: string,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentDocument> {
    await this.verifyOwnership(assignmentId, teacherId);
    const updateData: any = { ...dto };
    if (dto.deadline) updateData.deadline = new Date(dto.deadline);

    const updated = await this.assignmentModel.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Assignment not found');
    return updated;
  }

  async remove(assignmentId: string, teacherId: string): Promise<void> {
    await this.verifyOwnership(assignmentId, teacherId);
    await this.assignmentModel.findByIdAndUpdate(assignmentId, {
      isActive: false,
    });
  }

  // ── Interview Completion Hook ─────────────────────────────────────────────

  /**
   * Called when an interview result is saved. Checks if the student has any
   * active assignments matching the topic, and updates progress accordingly.
   */
  async recordInterviewCompletion(
    studentId: string,
    roundType: string,
    score: number,
  ): Promise<void> {
    // Find active assignments for this student that match the topic
    const now = new Date();
    const assignments = await this.assignmentModel
      .find({
        assignedTo: studentId,
        topic: { $regex: new RegExp(roundType, 'i') },
        deadline: { $gte: now },
        isActive: true,
      })
      .lean();

    for (const assignment of assignments) {
      const sa = await this.studentAssignmentModel.findOne({
        assignmentId: assignment._id.toString(),
        studentId,
      });

      if (!sa) continue;

      // Update scores and count
      sa.scores.push(score);
      sa.completedInterviews += 1;
      sa.avgScore =
        sa.scores.length > 0
          ? Math.round(sa.scores.reduce((s, v) => s + v, 0) / sa.scores.length)
          : 0;

      // Update status
      if (sa.status === StudentAssignmentStatus.ASSIGNED) {
        sa.status = StudentAssignmentStatus.IN_PROGRESS;
      }
      if (sa.completedInterviews >= assignment.numInterviews) {
        sa.status = StudentAssignmentStatus.COMPLETED;
        sa.completedAt = now;
      }

      await sa.save();
    }
  }
}
