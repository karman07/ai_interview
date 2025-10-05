import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackVisitorDto {
  @ApiProperty({
    description: 'Unique visitor ID (UUID)',
    example: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  visitorId: string;

  @ApiProperty({
    description: 'Current session ID',
    example: 'session_xxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: 'Browser name',
    example: 'Chrome',
    required: false,
  })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiProperty({
    description: 'Browser version',
    example: '118.0.0.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  browserVersion?: string;

  @ApiProperty({
    description: 'Operating system',
    example: 'Windows 10',
    required: false,
  })
  @IsOptional()
  @IsString()
  operatingSystem?: string;

  @ApiProperty({
    description: 'Device type',
    example: 'desktop',
    required: false,
  })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({
    description: 'Country',
    example: 'India',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'City',
    example: 'Mumbai',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Timezone',
    example: 'Asia/Kolkata',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Language preference',
    example: 'en-US',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Screen resolution',
    example: '1920x1080',
    required: false,
  })
  @IsOptional()
  @IsString()
  screenResolution?: string;

  @ApiProperty({
    description: 'Referrer URL',
    example: 'https://google.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({
    description: 'UTM source',
    example: 'google',
    required: false,
  })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiProperty({
    description: 'UTM medium',
    example: 'cpc',
    required: false,
  })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiProperty({
    description: 'UTM campaign',
    example: 'summer-sale',
    required: false,
  })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiProperty({
    description: 'User ID if logged in',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Whether this is a returning visitor',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isReturning?: boolean;

  @ApiProperty({
    description: 'Additional metadata',
    example: { source: 'mobile_app' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class StartSessionDto {
  @ApiProperty({
    description: 'Visitor ID',
    example: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  visitorId: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'session_xxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Entry page URL',
    example: '/home',
  })
  @IsNotEmpty()
  @IsString()
  entryPage: string;

  @ApiProperty({
    description: 'User ID if logged in',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent string',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: 'Referrer URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({
    description: 'UTM parameters',
    required: false,
  })
  @IsOptional()
  utmSource?: string;

  @IsOptional()
  utmMedium?: string;

  @IsOptional()
  utmCampaign?: string;
}

export class EndSessionDto {
  @ApiProperty({
    description: 'Session ID',
    example: 'session_xxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Exit page URL',
    example: '/contact',
  })
  @IsNotEmpty()
  @IsString()
  exitPage: string;

  @ApiProperty({
    description: 'Total session duration in seconds',
    example: 300,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  duration: number;

  @ApiProperty({
    description: 'Total page views in session',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  pageViews: number;

  @ApiProperty({
    description: 'Total interactions in session',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interactions?: number;
}