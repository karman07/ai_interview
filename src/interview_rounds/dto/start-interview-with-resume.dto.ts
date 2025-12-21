import { IsString, IsOptional, IsEnum } from 'class-validator';

export class StartInterviewWithResumeDto {
  @IsString()
  user_id: string;

  @IsString()
  session_id: string;

  @IsString()
  role_title: string;

  @IsString()
  company_name: string;

  @IsString()
  industry: string;

  @IsString()
  jd: string;

  @IsOptional()
  @IsString()
  cv?: string;

  @IsEnum(['technical', 'behavioral', 'hr', 'full'])
  round_type: 'technical' | 'behavioral' | 'hr' | 'full';
}