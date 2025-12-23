import { IsString, IsArray, IsNumber, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { JobDescriptionType } from '../schemas/job.schema';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(JobDescriptionType)
  descriptionType?: JobDescriptionType;

  @IsOptional()
  @IsString()
  descriptionFileUrl?: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsNumber()
  salary: number;

  @IsString()
  @IsNotEmpty()
  location: string;
}