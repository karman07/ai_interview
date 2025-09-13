import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(@InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>) {}

  async create(dto: CreateSubjectDto, thumbnailUrl?: string) {
    if (thumbnailUrl) dto.thumbnailUrl = thumbnailUrl;
    const created = new this.subjectModel(dto);
    return created.save();
  }

  async findAll() {
    return this.subjectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const sub = await this.subjectModel.findById(id).exec();
    if (!sub) throw new NotFoundException('Subject not found');
    return sub;
  }

  async update(id: string, dto: UpdateSubjectDto, thumbnailUrl?: string) {
    if (thumbnailUrl) dto.thumbnailUrl = thumbnailUrl;
    const updated = await this.subjectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Subject not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.subjectModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Subject not found');
    return { deleted: true };
  }
}
