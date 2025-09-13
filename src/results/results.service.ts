import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from './schemas/result.schema';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  // Get all results for logged-in user
  async getMyResults(userId: string) {
    // console.log('Fetching results for user:', userId);
    return this.resultModel
      .find({ owner: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get single result (only if belongs to user)
  async getResultById(userId: string, id: string) {
    const result = await this.resultModel.findById(id).exec();
    if (!result) throw new NotFoundException('Result not found');
    if (result.owner.toString() !== userId.toString()) {
      throw new NotFoundException('Result not found for this user');
    }
    return result;
  }
}
