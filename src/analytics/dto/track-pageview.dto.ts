import { IsString, IsOptional, IsNumber } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  sessionId: string;

  @IsString()
  visitorId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsNumber()
  timeOnPage?: number;

  @IsOptional()
  @IsNumber()
  scrollDepth?: number;
}
