import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class TrackPageViewDto {
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

  @ApiProperty({ example: '/dsa' })
  @IsString()
  path: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  timeOnPage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  scrollDepth?: number;
}
