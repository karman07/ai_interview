import { IsString, IsOptional } from 'class-validator';

export class StartSessionDto {
  @IsString()
  sessionId: string;

  @IsString()
  visitorId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  landingPage?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  device?: string;
}
