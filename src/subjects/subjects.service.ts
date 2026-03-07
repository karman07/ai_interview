import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(@InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>) { }

  async create(dto: CreateSubjectDto, thumbnailUrl?: string) {
    if (thumbnailUrl) dto.thumbnailUrl = thumbnailUrl;
    const created = new this.subjectModel(dto);
    return created.save();
  }

  private getDummyImage(subject: any) {
    const category = subject.category?.toLowerCase() || '';
    const title = subject.title?.toLowerCase() || '';
    if (category.includes('program') || category.includes('cse') || category.includes('tech') || title.includes('java') || title.includes('python')) {
      return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";
    }
    if (category.includes('ai') || category.includes('machine') || category.includes('intelligence') || title.includes('ml') || title.includes('ai')) {
      return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop";
    }
    if (category.includes('data') || category.includes('sql') || category.includes('analyt') || title.includes('sql') || title.includes('database')) {
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop";
  }

  async findAll() {
    const subjects = await this.subjectModel.find().sort({ createdAt: -1 }).exec();
    return subjects.map(s => {
      const obj = s.toObject();
      if (!obj.thumbnailUrl) {
        obj.thumbnailUrl = this.getDummyImage(obj);
      }
      return obj;
    });
  }

  async findOne(id: string) {
    const sub = await this.subjectModel.findById(id).exec();
    if (!sub) throw new NotFoundException('Subject not found');
    const obj = sub.toObject();
    if (!obj.thumbnailUrl) {
      obj.thumbnailUrl = this.getDummyImage(obj);
    }
    return obj;
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
