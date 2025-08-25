import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { Result, ResultDocument } from '../results/schemas/result.schema';

@Injectable()
export class InterviewService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {
    this.apiKey = process.env.GEMINI_API_KEY ?? '';
    this.model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
    this.baseUrl = process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta';
  }

  // Build prompt for generating questions
  private buildQuestionPrompt(dto: CreateInterviewDto) {
    return `You are an expert interviewer.
Job Description: ${dto.jobDescription}
Difficulty: ${dto.difficulty}
Format: ${dto.format === 'mcq' ? 'Multiple Choice Questions' : 'Text Questions'}

Generate 5 interview questions with answers.
Return JSON strictly in this format:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"], // only if MCQ
      "answer": "string"
    }
  ]
}`;
  }

  // Build prompt for evaluating answers
  private buildEvaluationPrompt(dto: CreateInterviewDto) {
    return `You are an AI interview evaluator.
Job Description: ${dto.jobDescription}
Difficulty: ${dto.difficulty}
Evaluate the following answers. Return JSON in this format:
{
  "items": [
    {
      "question": "string",
      "answer": "string",
      "isCorrect": boolean,
      "explanation": "string",
      "score": number
    }
  ],
  "overall": {
    "summary": "string",
    "overallScore": number
  }
}

Questions and Answers:
${dto.questions.map((q, i) => `${i + 1}. Q: ${q} A: ${dto.answers?.[i] ?? ''}`).join('\n')}
`;
  }

  // Generate interview questions
  async generate(ownerId: string, dto: CreateInterviewDto) {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const prompt = this.buildQuestionPrompt(dto);

    try {
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      const resp = await firstValueFrom(this.http.post(url, body));
      const text = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      let parsed: any = {};
      try {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        parsed = JSON.parse(match ? match[1] : text);
      } catch {
        parsed = { questions: [] };
      }

      return { raw: text, structured: parsed };
    } catch (e: any) {
      throw new InternalServerErrorException({
        message: 'Gemini question generation failed',
        details: e?.response?.data ?? e?.message ?? e,
      });
    }
  }

  // Run full interview (evaluation + save)
  async run(ownerId: string, dto: CreateInterviewDto) {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const prompt = this.buildEvaluationPrompt(dto);

    try {
      const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
      const resp = await firstValueFrom(this.http.post(url, body));
      const text = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      let parsed: any = {};
      try {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        parsed = JSON.parse(match ? match[1] : text);
      } catch {
        parsed = { items: [], overall: { summary: '', overallScore: 0 } };
      }

      const created = new this.resultModel({
        owner: new Types.ObjectId(ownerId),
        jobDescription: dto.jobDescription,
        questions: dto.questions,
        difficulty: dto.difficulty,
        items: parsed.items,
        overall: parsed.overall,
        rawOutput: text,
      });

      return created.save();
    } catch (e: any) {
      throw new InternalServerErrorException({
        message: 'Gemini evaluation failed',
        details: e?.response?.data ?? e?.message ?? e,
      });
    }
  }
}
