import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Programming language used',
    enum: SubmissionLanguage,
    example: SubmissionLanguage.JAVASCRIPT,
  })
  @IsEnum(SubmissionLanguage)
  language: SubmissionLanguage;

  @ApiProperty({
    description: 'User submitted code',
    example: 'function twoSum(nums, target) { ... }',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Submission status',
    enum: SubmissionStatus,
    example: SubmissionStatus.SOLVED,
  })
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @ApiProperty({
    description: 'Number of test cases passed',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  testCasesPassed: number;

  @ApiProperty({
    description: 'Total number of test cases',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  totalTestCases: number;

  @ApiPropertyOptional({
    description: 'Code execution time in milliseconds',
    example: 42,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  executionTime?: number;

  @ApiPropertyOptional({
    description: 'Memory used in MB',
    example: 15.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  memoryUsed?: number;

  @ApiPropertyOptional({
    description: 'Error message if submission failed',
    example: 'TypeError: Cannot read property of undefined',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Time spent on this question in seconds',
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}

export class UpdateProgressDto {
  @ApiPropertyOptional({
    description: 'Bookmark status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isBookmarked?: boolean;

  @ApiPropertyOptional({
    description: 'User personal notes',
    example: 'Remember to use hash map for O(n) solution',
  })
  @IsOptional()
  @IsString()
  userNotes?: string;

  @ApiPropertyOptional({
    description: 'User rating of the question',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  userRating?: number;
}

export class AddHintDto {
  @ApiProperty({
    description: 'Hint content that was revealed',
    example: 'Try using a hash map to store complements',
  })
  @IsString()
  hintContent: string;
}
