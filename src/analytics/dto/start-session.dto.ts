import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class StartSessionDto {
  @ApiProperty({ example: 'session_1759377952761_aozn7jswc' })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: 'visitor_1759377739126_e7a874oyk' })
  @IsString()
  visitorId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  landingPage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device?: string;
}
