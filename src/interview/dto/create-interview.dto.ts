import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  jobDescription: string;

  @IsString()
  difficulty: string;

  @IsOptional()
  @IsString()
  positionTitle?: string;

  @IsOptional()
  @IsString()
  candidateName?: string;

  @IsOptional()
  @IsString()
  format?: 'text' | 'mcq';

  @IsArray()
  @IsOptional()
  questions?: string[];

  @IsArray()
  @IsOptional()
  answers?: string[];
}
