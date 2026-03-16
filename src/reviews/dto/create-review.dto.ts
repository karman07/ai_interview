import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  experienceRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  resultRating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  comment?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  interviewType?: string;
}
