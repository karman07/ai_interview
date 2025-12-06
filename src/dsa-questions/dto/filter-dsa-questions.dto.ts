import { IsOptional, IsString, IsEnum, IsArray, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel, QuestionCategory } from '../schemas/dsa-question.schema';

export class FilterDsaQuestionsDto {
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @IsOptional()
  @IsArray()
  @IsEnum(QuestionCategory, { each: true })
  categories?: QuestionCategory[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
