import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSolutionDto {
  @ApiProperty({ description: 'Question ID', example: 'two-sum' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Programming language', example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'User submitted code' })
  @IsString()
  code: string;
}
