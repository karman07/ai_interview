import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @IsString()
  @IsOptional()
  githubUrl?: string;

  @IsNumber()
  @IsOptional()
  currentSalary?: number;

  @IsNumber()
  @IsOptional()
  expectedSalary?: number;

  @IsString()
  @IsOptional()
  noticePeriod?: string;

  @IsString()
  @IsOptional()
  availability?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsBoolean()
  @IsOptional()
  relocateWilling?: boolean;

  @IsBoolean()
  @IsOptional()
  remoteWork?: boolean;

  @IsString()
  @IsOptional()
  additionalInfo?: string;
}