import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Programming language',
    enum: SupportedLanguage,
    example: SupportedLanguage.JAVASCRIPT,
  })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({
    description: 'Source code to execute',
    example: 'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Run only specific test case indices (0-based). If not provided, runs all test cases.',
    example: [0, 1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  testCaseIndices?: number[];

  @ApiPropertyOptional({
    description: 'Include hidden test cases',
    example: false,
    default: false,
  })
  @IsOptional()
  includeHiddenTests?: boolean;

  @ApiPropertyOptional({
    description: 'Enable complexity analysis',
    example: true,
    default: true,
  })
  @IsOptional()
  analyzeComplexity?: boolean;
}

export class TestCaseInputDto {
  @ApiProperty({
    description: 'Test case input as string',
    example: '[2,7,11,15], 9',
  })
  @IsString()
  input: string;

  @ApiProperty({
    description: 'Expected output as string',
    example: '[0,1]',
  })
  @IsString()
  expectedOutput: string;
}

export class RunCustomTestDto {
  @ApiProperty({
    description: 'Programming language',
    enum: SupportedLanguage,
    example: SupportedLanguage.JAVASCRIPT,
  })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({
    description: 'Source code to execute',
    example: 'function twoSum(nums, target) { return [0, 1]; }',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Custom test cases to run',
    type: [TestCaseInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseInputDto)
  testCases: TestCaseInputDto[];
}

export class ValidateSolutionDto {
  @ApiProperty({
    description: 'Programming language',
    enum: SupportedLanguage,
    example: SupportedLanguage.JAVASCRIPT,
  })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({
    description: 'Source code to validate',
    example: 'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }',
  })
  @IsString()
  code: string;
}
