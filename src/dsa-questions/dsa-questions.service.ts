import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DsaQuestion, DsaQuestionDocument } from './schemas/dsa-question.schema';
import { CreateDsaQuestionDto } from './dto/create-dsa-question.dto';
import { UpdateDsaQuestionDto } from './dto/update-dsa-question.dto';
import { FilterDsaQuestionsDto } from './dto/filter-dsa-questions.dto';

@Injectable()
export class DsaQuestionsService {
  constructor(
    @InjectModel(DsaQuestion.name)
    private dsaQuestionModel: Model<DsaQuestionDocument>,
  ) {}

  async create(createDto: CreateDsaQuestionDto, userId: string): Promise<DsaQuestionDocument> {
    // Check if question ID already exists
    const existing = await this.dsaQuestionModel.findOne({ questionId: createDto.questionId });
    if (existing) {
      throw new ConflictException(`Question with ID '${createDto.questionId}' already exists`);
    }

    const question = new this.dsaQuestionModel({
      ...createDto,
      createdBy: new Types.ObjectId(userId),
    });

    return question.save();
  }

  async findAll(filterDto: FilterDsaQuestionsDto): Promise<{
    questions: DsaQuestionDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      difficulty,
      categories,
      tags,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const query: any = { isActive: true };

    // Apply filters
    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (categories && categories.length > 0) {
      query.categories = { $in: categories };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { questionId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [questions, total] = await Promise.all([
      this.dsaQuestionModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-solutions') // Don't return solutions in list view
        .exec(),
      this.dsaQuestionModel.countDocuments(query),
    ]);

    return {
      questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(questionId: string, includeSolutions: boolean = false): Promise<DsaQuestionDocument> {
    const selectFields = includeSolutions ? {} : { solutions: 0 };
    
    const question = await this.dsaQuestionModel
      .findOne({ questionId, isActive: true })
      .select(selectFields)
      .exec();

    if (!question) {
      throw new NotFoundException(`Question with ID '${questionId}' not found`);
    }

    return question;
  }

  async findById(id: string, includeSolutions: boolean = false): Promise<DsaQuestionDocument> {
    const selectFields = includeSolutions ? {} : { solutions: 0 };
    
    const question = await this.dsaQuestionModel
      .findById(id)
      .select(selectFields)
      .exec();

    if (!question) {
      throw new NotFoundException(`Question not found`);
    }

    return question;
  }

  async update(questionId: string, updateDto: UpdateDsaQuestionDto): Promise<DsaQuestionDocument> {
    const question = await this.dsaQuestionModel.findOneAndUpdate(
      { questionId },
      { $set: updateDto },
      { new: true, runValidators: true },
    );

    if (!question) {
      throw new NotFoundException(`Question with ID '${questionId}' not found`);
    }

    return question;
  }

  async remove(questionId: string): Promise<{ message: string }> {
    // Soft delete by setting isActive to false
    const question = await this.dsaQuestionModel.findOneAndUpdate(
      { questionId },
      { $set: { isActive: false } },
      { new: true },
    );

    if (!question) {
      throw new NotFoundException(`Question with ID '${questionId}' not found`);
    }

    return { message: 'Question deleted successfully' };
  }

  async hardDelete(questionId: string): Promise<{ message: string }> {
    const result = await this.dsaQuestionModel.deleteOne({ questionId });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Question with ID '${questionId}' not found`);
    }

    return { message: 'Question permanently deleted' };
  }

  async getStatistics(): Promise<any> {
    const [total, byDifficulty, byCategory, topAcceptance] = await Promise.all([
      this.dsaQuestionModel.countDocuments({ isActive: true }),
      this.dsaQuestionModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      this.dsaQuestionModel.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.dsaQuestionModel
        .find({ isActive: true })
        .sort({ acceptanceRate: -1 })
        .limit(10)
        .select('questionId title acceptanceRate totalSubmissions')
        .exec(),
    ]);

    return {
      totalQuestions: total,
      byDifficulty,
      byCategory,
      topAcceptanceRate: topAcceptance,
    };
  }

  async incrementSubmission(questionId: string, isSuccess: boolean): Promise<void> {
    const update: any = {
      $inc: { totalSubmissions: 1 },
    };

    if (isSuccess) {
      update.$inc.successfulSubmissions = 1;
    }

    await this.dsaQuestionModel.findOneAndUpdate(
      { questionId },
      update,
    );

    // Update acceptance rate
    const question = await this.dsaQuestionModel.findOne({ questionId });
    if (question && question.totalSubmissions > 0) {
      const acceptanceRate = (question.successfulSubmissions / question.totalSubmissions) * 100;
      await this.dsaQuestionModel.updateOne(
        { questionId },
        { $set: { acceptanceRate: parseFloat(acceptanceRate.toFixed(2)) } },
      );
    }
  }

  async likeQuestion(questionId: string): Promise<{ likes: number }> {
    const question = await this.dsaQuestionModel.findOneAndUpdate(
      { questionId },
      { $inc: { likes: 1 } },
      { new: true },
    );

    if (!question) {
      throw new NotFoundException(`Question with ID '${questionId}' not found`);
    }

    return { likes: question.likes };
  }

  async dislikeQuestion(questionId: string): Promise<{ dislikes: number }> {
    const question = await this.dsaQuestionModel.findOneAndUpdate(
      { questionId },
      { $inc: { dislikes: 1 } },
      { new: true },
    );

    if (!question) {
      throw new NotFoundException(`Question with ID '${questionId}' not found`);
    }

    return { dislikes: question.dislikes };
  }

  async getRandomQuestion(difficulty?: string): Promise<DsaQuestionDocument> {
    const query: any = { isActive: true };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const count = await this.dsaQuestionModel.countDocuments(query);
    if (count === 0) {
      throw new NotFoundException('No questions found with the specified criteria');
    }

    const random = Math.floor(Math.random() * count);
    const question = await this.dsaQuestionModel
      .findOne(query)
      .skip(random)
      .select('-solutions')
      .exec();

    return question;
  }
}
