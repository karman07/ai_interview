import { IsMongoId, IsOptional, IsEnum, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLessonProgressDto {
  @ApiProperty({
    description: 'Lesson ID',
    example: '6730a1b2c3d4e5f6a7b8c9d0',
  })
  @IsMongoId()
  lessonId: string;

  @ApiPropertyOptional({
    description: 'Progress status',
    enum: ['not-started', 'in-progress', 'completed'],
    example: 'in-progress',
  })
  @IsOptional()
  @IsEnum(['not-started', 'in-progress', 'completed'])
  status?: 'not-started' | 'in-progress' | 'completed';

  @ApiPropertyOptional({
    description: 'Progress percentage',
    minimum: 0,
    maximum: 100,
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiPropertyOptional({
    description: 'Score achieved',
    example: 85,
  })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({
    description: 'Time spent in seconds',
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @ApiPropertyOptional({
    description: 'User notes',
    example: 'Completed all exercises',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
