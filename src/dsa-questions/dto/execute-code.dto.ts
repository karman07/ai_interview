import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum SupportedLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  TYPESCRIPT = 'typescript',
  GO = 'go',
  RUST = 'rust',
  CSHARP = 'csharp',
}

export class ExecuteCodeDto {
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @IsString()
  code: string;

  @IsOptional()
  @IsArray()
  testCaseIndices?: number[];

  @IsOptional()
  includeHiddenTests?: boolean;

  @IsOptional()
  analyzeComplexity?: boolean;
}

export class TestCaseInputDto {
  @IsString()
  input: string;

  @IsString()
  expectedOutput: string;
}

export class RunCustomTestDto {
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @IsString()
  code: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseInputDto)
  testCases: TestCaseInputDto[];
}

export class ValidateSolutionDto {
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @IsString()
  code: string;
}
