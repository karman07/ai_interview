import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(@InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>) {}

  async create(dto: CreateLessonDto) {
    const lesson = new this.lessonModel({
      ...dto,
      subjectId: new Types.ObjectId(dto.subjectId),
    });
    return lesson.save();
  }

async findBySubject(subjectId: string) {
  // console.log('Finding lessons for subjectId:', subjectId);
  return this.lessonModel
    .find({ subjectId: new Types.ObjectId(subjectId) }) // cast to ObjectId
    .exec();
}

  async findOne(id: string) {
    const l = await this.lessonModel.findById(id).exec();
    if (!l) throw new NotFoundException('Lesson not found');
    return l;
  }

  async update(id: string, dto: CreateLessonDto) {
    const updated = await this.lessonModel
      .findByIdAndUpdate(id, { ...dto }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Lesson not found');
    return updated;
  }

  async remove(id: string) {
    const r = await this.lessonModel.findByIdAndDelete(id).exec();
    if (!r) throw new NotFoundException('Lesson not found');
    return { deleted: true };
  }
}
