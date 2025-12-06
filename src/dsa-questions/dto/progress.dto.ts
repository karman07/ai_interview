import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { SubmissionStatus, SubmissionLanguage } from '../schemas/dsa-progress.schema';

export class RecordSubmissionDto {
  @IsEnum(SubmissionLanguage)
  language: SubmissionLanguage;

  @IsString()
  code: string;

  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @IsNumber()
  @Min(0)
  testCasesPassed: number;

  @IsNumber()
  @Min(0)
  totalTestCases: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  executionTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  memoryUsed?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}

export class UpdateProgressDto {
  @IsOptional()
  @IsBoolean()
  isBookmarked?: boolean;

  @IsOptional()
  @IsString()
  userNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  userRating?: number;
}

export class AddHintDto {
  @IsString()
  hintContent: string;
}
