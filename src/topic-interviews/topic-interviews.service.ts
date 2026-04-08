import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TopicInterview } from './schemas/topic-interview.schema';
import { CreateTopicInterviewDto, UpdateTopicInterviewDto } from './dto/topic-interview.dto';

@Injectable()
export class TopicInterviewsService {
  constructor(
    @InjectModel(TopicInterview.name) private topicInterviewModel: Model<TopicInterview>,
  ) {}

  async create(dto: CreateTopicInterviewDto): Promise<TopicInterview> {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Topic name is required');
    }

    const exists = await this.topicInterviewModel
      .findOne({ name: new RegExp(`^${this.escapeRegex(name)}$`, 'i') })
      .lean()
      .exec();

    if (exists) {
      throw new BadRequestException('A topic with this name already exists');
    }

    const topic = new this.topicInterviewModel({
      name,
      isPublished: dto.isPublished ?? true,
      links: (dto.links || []).filter(Boolean),
      logoUrl: dto.logoUrl || '',
    });

    return topic.save();
  }

  async findAllPublic(): Promise<TopicInterview[]> {
    return this.topicInterviewModel.find({ isPublished: true }).sort({ name: 1 }).exec();
  }

  async findAllAdmin(): Promise<TopicInterview[]> {
    return this.topicInterviewModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<TopicInterview> {
    const topic = await this.topicInterviewModel.findById(id).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async update(id: string, dto: UpdateTopicInterviewDto): Promise<TopicInterview> {
    const topic = await this.findById(id);

    if (dto.name !== undefined) {
      const nextName = dto.name.trim();
      if (!nextName) {
        throw new BadRequestException('Topic name cannot be empty');
      }
      const duplicate = await this.topicInterviewModel
        .findOne({
          _id: { $ne: id },
          name: new RegExp(`^${this.escapeRegex(nextName)}$`, 'i'),
        })
        .lean()
        .exec();

      if (duplicate) {
        throw new BadRequestException('A topic with this name already exists');
      }

      topic.name = nextName;
    }

    if (dto.links !== undefined) {
      topic.links = dto.links.filter(Boolean);
    }

    if (dto.logoUrl !== undefined) {
      topic.logoUrl = dto.logoUrl;
    }

    if (dto.isPublished !== undefined) {
      topic.isPublished = dto.isPublished;
    }

    return topic.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.topicInterviewModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }

  async updateLogo(id: string, logoUrl: string): Promise<TopicInterview> {
    const topic = await this.findById(id);
    topic.logoUrl = logoUrl;
    return topic.save();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
