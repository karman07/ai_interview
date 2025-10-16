import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class TrackVisitorDto {
  @ApiProperty({ example: 'visitor_1759377739126_e7a874oyk' })
  @IsString()
  visitorId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
