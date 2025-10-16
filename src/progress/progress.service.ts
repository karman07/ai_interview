import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { UpdateLessonProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(@InjectModel(Progress.name) private progressModel: Model<ProgressDocument>) {}

  async update(userId: string, dto: UpdateLessonProgressDto) {
    const userObj = new Types.ObjectId(userId);
    const lessonObj = new Types.ObjectId(dto.lessonId);

    let progress = await this.progressModel.findOne({ userId: userObj, lessonId: lessonObj }).exec();

    if (!progress) {
      progress = new this.progressModel({
        userId: userObj,
        lessonId: lessonObj,
        status: dto.status || 'in-progress',
        progressPercent: dto.progressPercent || 0,
        score: dto.score,
        timeSpent: dto.timeSpent || 0,
        notes: dto.notes,
      });
    } else {
      if (dto.status) progress.status = dto.status;
      if (dto.progressPercent !== undefined) progress.progressPercent = dto.progressPercent;
      if (dto.score !== undefined) progress.score = dto.score;
      if (dto.timeSpent !== undefined) progress.timeSpent += dto.timeSpent; // accumulate
      if (dto.notes !== undefined) progress.notes = dto.notes;

      progress.lastAccessed = new Date();
    }

    return progress.save();
  }

  async findByUser(userId: string) {
    return this.progressModel.find({ userId }).populate('lessonId').sort({ updatedAt: -1 }).exec();
  }

  async findByUserAndLesson(userId: string, lessonId: string) {
    const progress = await this.progressModel.findOne({ userId, lessonId }).exec();
    if (!progress) throw new NotFoundException('Progress not found');
    return progress;
  }

  async remove(userId: string, lessonId: string) {
    return this.progressModel.findOneAndDelete({ userId, lessonId }).exec();
  }

  async findAll() {
    return this.progressModel.find().populate('userId').populate('lessonId').exec();
  }
}
