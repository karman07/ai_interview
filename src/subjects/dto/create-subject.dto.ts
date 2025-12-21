import { IsString, IsOptional, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

class ContentBlockDto {
  @IsString()
  heading: string;

  @IsArray()
  @IsString({ each: true })
  points: string[];
}

export class CreateSubjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  level?: string; // Beginner | Intermediate | Advanced

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  content?: ContentBlockDto[];
}
