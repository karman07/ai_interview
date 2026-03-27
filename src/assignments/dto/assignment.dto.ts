import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  classId: string;

  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  numInterviews?: number;

  @IsNotEmpty()
  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedTo?: string[]; // if empty, assign to full class
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
