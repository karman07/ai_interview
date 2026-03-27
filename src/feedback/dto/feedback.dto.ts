import { IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsArray, IsMongoId } from 'class-validator';

export class CreateFeedbackDto {
  @IsMongoId()
  studentId: string;

  @IsEnum(['interview', 'resume', 'general'])
  type: string;

  @IsOptional()
  @IsMongoId()
  resultId?: string;

  @IsOptional()
  @IsMongoId()
  assignmentId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];
}

export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @IsOptional()
  isRead?: boolean;
}
