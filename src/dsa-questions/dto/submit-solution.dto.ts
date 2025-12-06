import { IsString, IsEnum } from 'class-validator';

export class SubmitSolutionDto {
  @IsString()
  questionId: string;

  @IsString()
  language: string;

  @IsString()
  code: string;
}
