import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsUrl, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageViewType, DeviceType } from '../schemas/pageview.schema';

export class TrackPageViewDto {
  @ApiProperty({
    description: 'Visitor ID (UUID)',
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
    description: 'Page URL',
    example: 'https://example.com/dashboard',
  })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Page path',
    example: '/dashboard',
  })
  @IsNotEmpty()
  @IsString()
  path: string;

  @ApiProperty({
    description: 'Page title',
    example: 'Dashboard - AI Interview',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Page view type',
    enum: PageViewType,
    example: PageViewType.PAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PageViewType)
  type?: PageViewType;

  @ApiProperty({
    description: 'Time spent on page in seconds',
    example: 45,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiProperty({
    description: 'Scroll depth percentage (0-100)',
    example: 75,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scrollDepth?: number;

  @ApiProperty({
    description: 'Number of clicks on page',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  clicks?: number;

  @ApiProperty({
    description: 'Page load time in milliseconds',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loadTime?: number;

  @ApiProperty({
    description: 'Previous page URL',
    example: '/home',
    required: false,
  })
  @IsOptional()
  @IsString()
  previousPage?: string;

  @ApiProperty({
    description: 'Device type',
    enum: DeviceType,
    example: DeviceType.DESKTOP,
  })
  @IsNotEmpty()
  @IsEnum(DeviceType)
  device: DeviceType;

  @ApiProperty({
    description: 'Browser name',
    example: 'Chrome',
    required: false,
  })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiProperty({
    description: 'Operating system',
    example: 'Windows 10',
    required: false,
  })
  @IsOptional()
  @IsString()
  operatingSystem?: string;

  @ApiProperty({
    description: 'Screen resolution',
    example: '1920x1080',
    required: false,
  })
  @IsOptional()
  @IsString()
  screenResolution?: string;

  @ApiProperty({
    description: 'Viewport size',
    example: '1200x800',
    required: false,
  })
  @IsOptional()
  @IsString()
  viewportSize?: string;

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
    description: 'Whether this is a bounce (single page session)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isBounce?: boolean;

  @ApiProperty({
    description: 'Whether this is an exit page',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isExit?: boolean;

  @ApiProperty({
    description: 'Whether this is an entry page',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEntry?: boolean;

  @ApiProperty({
    description: 'Custom events data',
    example: [{ event: 'button_click', value: 'signup' }],
    required: false,
  })
  @IsOptional()
  customEvents?: any[];

  @ApiProperty({
    description: 'Additional metadata',
    example: { campaign: 'holiday-2023' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}