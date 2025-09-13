import { IsMongoId, IsOptional, IsEnum, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsMongoId()
  lessonId: string;

  @IsOptional()
  @IsEnum(['not-started', 'in-progress', 'completed'])
  status?: 'not-started' | 'in-progress' | 'completed';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
