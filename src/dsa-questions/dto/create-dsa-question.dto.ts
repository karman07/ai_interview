import { IsString, IsEnum, IsArray, IsOptional, IsBoolean, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel, QuestionCategory } from '../schemas/dsa-question.schema';

export class TestCaseDto {
  @ApiProperty({ description: 'Input as JSON string', example: '{"nums": [2,7,11,15], "target": 9}' })
  @IsString()
  input: string;

  @ApiProperty({ description: 'Expected output', example: '[0,1]' })
  @IsString()
  expectedOutput: string;

  @ApiPropertyOptional({ description: 'Is this a hidden test case', default: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: 'Explanation for the test case' })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class FunctionSignatureDto {
  @ApiProperty({ description: 'Programming language', example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'Function template code', example: 'function twoSum(nums, target) {\n  // Your code here\n}' })
  @IsString()
  code: string;
}

export class CodeConstraintsDto {
  @ApiPropertyOptional({ description: 'Time limit in milliseconds', example: 5000 })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Memory limit in MB', example: 256 })
  @IsOptional()
  @IsNumber()
  memoryLimit?: number;

  @ApiPropertyOptional({ description: 'Allowed libraries', example: ['math', 'collections'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedLibraries?: string[];
}

export class HintDto {
  @ApiProperty({ description: 'Hint order', example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Hint text', example: 'Try using a hash map to store complements' })
  @IsString()
  text: string;
}

export class SolutionDto {
  @ApiProperty({ description: 'Programming language', example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'Solution code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Explanation of the solution' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Time complexity', example: 'O(n)' })
  @IsOptional()
  @IsString()
  timeComplexity?: string;

  @ApiPropertyOptional({ description: 'Space complexity', example: 'O(n)' })
  @IsOptional()
  @IsString()
  spaceComplexity?: string;
}

export class CreateDsaQuestionDto {
  @ApiProperty({ description: 'Unique question identifier', example: 'two-sum' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Question title', example: 'Two Sum' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Problem description in markdown', example: 'Given an array of integers...' })
  @IsString()
  description: string;

  @ApiProperty({ enum: DifficultyLevel, description: 'Difficulty level' })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty({ enum: QuestionCategory, isArray: true, description: 'Question categories' })
  @IsArray()
  @IsEnum(QuestionCategory, { each: true })
  @ArrayMinSize(1)
  categories: QuestionCategory[];

  @ApiPropertyOptional({ description: 'Additional tags', example: ['Amazon', 'Google', 'Array'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ type: [TestCaseDto], description: 'Test cases for the question' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  @ArrayMinSize(1)
  testCases: TestCaseDto[];

  @ApiProperty({ type: [FunctionSignatureDto], description: 'Function signatures for different languages' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FunctionSignatureDto)
  @ArrayMinSize(1)
  functionSignatures: FunctionSignatureDto[];

  @ApiPropertyOptional({ type: CodeConstraintsDto, description: 'Code execution constraints' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeConstraintsDto)
  constraints?: CodeConstraintsDto;

  @ApiPropertyOptional({ type: [HintDto], description: 'Hints for solving the problem' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HintDto)
  hints?: HintDto[];

  @ApiPropertyOptional({ type: [SolutionDto], description: 'Official solutions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SolutionDto)
  solutions?: SolutionDto[];

  @ApiPropertyOptional({ description: 'Example inputs and outputs', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Related question IDs', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedQuestions?: string[];
}
