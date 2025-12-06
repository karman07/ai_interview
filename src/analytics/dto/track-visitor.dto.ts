import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class TrackVisitorDto {
  @IsString()
  visitorId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
