import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<QuizDocument>) {}

  async create(dto: CreateQuizDto) {
    const q = new this.quizModel({
      ...dto,
      lessonId: new Types.ObjectId(dto.lessonId),
    });
    return q.save();
  }

  async findByLesson(lessonId: string) {
    console.log(lessonId)
    return this.quizModel.find({ lessonId: new Types.ObjectId(lessonId) }).exec();
  }

  async findOne(id: string) {
    const q = await this.quizModel.findById(id).exec();
    if (!q) throw new NotFoundException('Quiz not found');
    return q;
  }

  async checkAnswer(quizId: string, answer: string) {
    const q = await this.findOne(quizId);
    return { correct: q.correctAnswer === answer, correctAnswer: q.correctAnswer };
  }

  async remove(id: string) {
    const r = await this.quizModel.findByIdAndDelete(id).exec();
    if (!r) throw new NotFoundException('Quiz not found');
    return { deleted: true };
  }
}
