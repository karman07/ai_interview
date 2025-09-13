// lesson.dto.ts
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContentBlockDto {
  @IsString()
  heading: string;

  @IsArray()
  @IsString({ each: true })
  points: string[];
}

class CreateSubLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  content?: ContentBlockDto[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateLessonDto {
  @IsMongoId()
  subjectId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  content?: ContentBlockDto[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubLessonDto)
  subLessons?: CreateSubLessonDto[];
}
