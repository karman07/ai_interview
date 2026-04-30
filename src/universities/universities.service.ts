import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from './schemas/university.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateUniversityDto, UpdateUniversityDto, CreateTeacherDto } from './dto/university.dto';
import * as bcrypt from 'bcryptjs';
import { Result, ResultDocument } from '../results/schemas/result.schema';
import { Resume, ResumeDocument } from '../resume/resume.schema';
import { Types } from 'mongoose';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectModel(University.name)
    private universityModel: Model<UniversityDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Result.name)
    private resultModel: Model<ResultDocument>,
    @InjectModel(Resume.name)
    private resumeModel: Model<ResumeDocument>,
  ) { }

  async create(dto: CreateUniversityDto): Promise<UniversityDocument> {
    const domain = dto.domain.toLowerCase().trim();
    const exists = await this.universityModel.findOne({ domain });
    if (exists) throw new ConflictException(`Domain "${domain}" is already registered`);
    return this.universityModel.create({ ...dto, domain });
  }

  async findAll(): Promise<UniversityDocument[]> {
    return this.universityModel.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<UniversityDocument> {
    const uni = await this.universityModel.findById(id);
    if (!uni) throw new NotFoundException('University not found');
    return uni;
  }

  async findByDomain(domain: string): Promise<UniversityDocument | null> {
    return this.universityModel.findOne({ domain: domain.toLowerCase().trim(), isActive: true });
  }

  async update(id: string, dto: UpdateUniversityDto): Promise<UniversityDocument> {
    if (dto.domain) dto.domain = dto.domain.toLowerCase().trim();
    const uni = await this.universityModel.findByIdAndUpdate(id, dto, { new: true });
    if (!uni) throw new NotFoundException('University not found');
    return uni;
  }

  async remove(id: string): Promise<void> {
    const res = await this.universityModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('University not found');
  }

  // ── Teacher management ──────────────────────────────────────────────────────

  async createTeacher(universityId: string, dto: CreateTeacherDto): Promise<UserDocument> {
    await this.findById(universityId); // ensures university exists
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase().trim() });
    if (existing) throw new ConflictException('A user with that email already exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: UserRole.UNIVERSITY_TEACHER,
      universityId,
      isEmailVerified: true, // admin-created — no Firebase verification needed
      resumeCount: 0,
      interviewCount: 0,
    });
  }

  async getTeachers(universityId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: UserRole.UNIVERSITY_TEACHER, universityId })
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 });
  }

  async removeTeacher(universityId: string, teacherId: string): Promise<void> {
    const teacher = await this.userModel.findOne({
      _id: teacherId,
      universityId,
      role: UserRole.UNIVERSITY_TEACHER,
    });
    if (!teacher) throw new NotFoundException('Teacher not found for this university');
    await this.userModel.findByIdAndDelete(teacherId);
  }

  /** Returns true if the user (by sub) is an admin OR a teacher of the given university */
  async checkTeacherAccess(userSub: string, universityId: string): Promise<boolean> {
    const user = await this.userModel.findById(userSub).select('role universityId');
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.UNIVERSITY_TEACHER && user.universityId === universityId) return true;
    return false;
  }

  // ── University student analytics ─────────────────────────────────────────────

  async getUniversityStudents(universityId: string) {
    const uni = await this.universityModel.findById(universityId);
    if (!uni) throw new NotFoundException('University not found');

    const students = await this.userModel.aggregate([
      { $match: { role: UserRole.STUDENT, universityId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'results',
          localField: '_id',
          foreignField: 'owner',
          as: 'results'
        }
      },
      // Try lookup with ObjectId
      {
        $lookup: {
          from: 'resumes',
          localField: '_id',
          foreignField: 'user',
          as: 'resumes_obj'
        }
      },
      // Try lookup with String ID (in case they are stored as strings)
      {
        $addFields: { studentIdStr: { $toString: '$_id' } }
      },
      {
        $lookup: {
          from: 'resumes',
          localField: 'studentIdStr',
          foreignField: 'user',
          as: 'resumes_str'
        }
      },
      {
        $addFields: {
          resumes: { $setUnion: ['$resumes_obj', '$resumes_str'] }
        }
      },
      {
        $addFields: {
          normalizedResults: {
            $map: {
              input: '$results',
              as: 'r',
              in: {
                score: { $ifNull: ['$$r.summary.overall_score', '$$r.score', 0] },
                date: '$$r.createdAt',
                job: '$$r.jobDescription'
              }
            }
          },
          normalizedResumes: {
            $map: {
              input: '$resumes',
              as: 'cv',
              in: {
                score: { $ifNull: ['$$cv.stats.cv_quality.overall_score', '$$cv.stats.score', 0] },
                filename: '$$cv.filename',
                date: '$$cv.createdAt'
              }
            }
          }
        }
      },
      {
        $addFields: {
          avgScore: { $avg: '$normalizedResults.score' },
          bestInterviewScore: { $max: '$normalizedResults.score' },
          allScores: '$normalizedResults',
          avgCvScore: { $avg: '$normalizedResumes.score' },
          bestCvScore: { $max: '$normalizedResumes.score' },
          cvList: '$normalizedResumes'
        }
      },
      {
        $project: {
          results: 0,
          resumes: 0,
          resumes_obj: 0,
          resumes_str: 0,
          studentIdStr: 0,
          normalizedResults: 0,
          normalizedResumes: 0,
          passwordHash: 0,
          refreshTokenHash: 0
        }
      }
    ]);

    return {
      university: uni,
      students: students.map(s => ({
        ...s,
        resumeUsage: { used: s.resumeCount, limit: uni.resumeLimit },
        interviewUsage: { used: s.interviewCount, limit: uni.interviewLimit },
      })),
    };
  }

  async getUniversityAnalytics(universityId: string) {
    const [uni, totalStudents, totalTeachers] = await Promise.all([
      this.universityModel.findById(universityId),
      this.userModel.countDocuments({ role: UserRole.STUDENT, universityId }),
      this.userModel.countDocuments({ role: UserRole.UNIVERSITY_TEACHER, universityId }),
    ]);
    if (!uni) throw new NotFoundException('University not found');
    const agg = await this.userModel.aggregate([
      { $match: { role: UserRole.STUDENT, universityId } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: '$interviewCount' },
          totalResumes: { $sum: '$resumeCount' },
        },
      },
    ]);
    const totals = agg[0] ?? { totalInterviews: 0, totalResumes: 0 };
    return {
      university: uni,
      stats: {
        totalStudents,
        totalTeachers,
        totalInterviews: totals.totalInterviews,
        totalResumes: totals.totalResumes,
        interviewLimit: uni.interviewLimit,
        resumeLimit: uni.resumeLimit,
      },
    };
  }
}
