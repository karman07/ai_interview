import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsNotEmpty } from 'class-validator';

export class CreateUniversityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  domain: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  resumeLimit?: number;

  @IsOptional()
  @IsNumber()
  interviewLimit?: number;

  @IsOptional()
  @IsNumber()
  coverLetterLimit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFeatures?: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  adminEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateUniversityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  resumeLimit?: number;

  @IsOptional()
  @IsNumber()
  interviewLimit?: number;

  @IsOptional()
  @IsNumber()
  coverLetterLimit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFeatures?: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  adminEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
