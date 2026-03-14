import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class SubmitFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  experienceRating: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  resultRating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}