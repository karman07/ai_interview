import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(teacherId: string, dto: CreateFeedbackDto): Promise<FeedbackDocument> {
    return this.feedbackModel.create({
      ...dto,
      teacherId,
    });
  }

  async findAllByStudent(studentId: string): Promise<FeedbackDocument[]> {
    return this.feedbackModel
      .find({ studentId })
      .sort({ createdAt: -1 })
      .populate('teacherId', 'name profileImageUrl')
      .exec();
  }

  async findAllByTeacher(teacherId: string): Promise<FeedbackDocument[]> {
    return this.feedbackModel
      .find({ teacherId })
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email profileImageUrl')
      .exec();
  }

  async findOne(id: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }

  async update(id: string, teacherId: string, dto: UpdateFeedbackDto): Promise<FeedbackDocument> {
    const feedback = await this.findOne(id);
    if (feedback.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only update your own feedback');
    }
    return this.feedbackModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async markAsRead(id: string, studentId: string): Promise<FeedbackDocument> {
    const feedback = await this.findOne(id);
    if (feedback.studentId.toString() !== studentId) {
      throw new ForbiddenException('You can only mark your own feedback as read');
    }
    return this.feedbackModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const feedback = await this.findOne(id);
    if (feedback.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only delete your own feedback');
    }
    await this.feedbackModel.findByIdAndDelete(id).exec();
  }
}
