import { IsString, IsEnum, IsArray, IsOptional, IsBoolean, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel, QuestionCategory } from '../schemas/dsa-question.schema';

export class TestCaseDto {
  @IsString()
  input: string;

  @IsString()
  expectedOutput: string;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class FunctionSignatureDto {
  @IsString()
  language: string;

  @IsString()
  code: string;
}

export class CodeConstraintsDto {
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsOptional()
  @IsNumber()
  memoryLimit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedLibraries?: string[];
}

export class HintDto {
  @IsNumber()
  order: number;

  @IsString()
  text: string;
}

export class SolutionDto {
  @IsString()
  language: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  timeComplexity?: string;

  @IsOptional()
  @IsString()
  spaceComplexity?: string;
}

export class CreateDsaQuestionDto {
  @IsString()
  questionId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsArray()
  @IsEnum(QuestionCategory, { each: true })
  @ArrayMinSize(1)
  categories: QuestionCategory[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  @ArrayMinSize(1)
  testCases: TestCaseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FunctionSignatureDto)
  @ArrayMinSize(1)
  functionSignatures: FunctionSignatureDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CodeConstraintsDto)
  constraints?: CodeConstraintsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HintDto)
  hints?: HintDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SolutionDto)
  solutions?: SolutionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedQuestions?: string[];
}
