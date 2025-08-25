import { IsArray, IsEnum, IsMongoId, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class SaveResultDto {
  @IsString()
  jobDescription: string;

  @IsArray()
  questions: string[];

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsArray()
  items: {
    question: string;
    answer: string;
  }[];
}

class AnswerDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class CheckAnswersDto {
  @IsMongoId()
  interviewId: string; // not strictly required, but useful if linking

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
