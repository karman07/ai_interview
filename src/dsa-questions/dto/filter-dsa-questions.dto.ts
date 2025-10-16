import { IsOptional, IsString, IsEnum, IsArray, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DifficultyLevel, QuestionCategory } from '../schemas/dsa-question.schema';

export class FilterDsaQuestionsDto {
  @ApiPropertyOptional({ enum: DifficultyLevel, description: 'Filter by difficulty' })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: QuestionCategory, isArray: true, description: 'Filter by categories' })
  @IsOptional()
  @IsArray()
  @IsEnum(QuestionCategory, { each: true })
  categories?: QuestionCategory[];

  @ApiPropertyOptional({ description: 'Filter by tags', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Search query for title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['createdAt', 'difficulty', 'acceptanceRate', 'totalSubmissions'] })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
