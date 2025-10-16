import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsStatsDto {
  @ApiProperty({
    description: 'Date range start',
    example: '2023-10-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'Date range end',
    example: '2023-10-31',
  })
  endDate: string;

  @ApiProperty({
    description: 'Total unique visitors',
    example: 1250,
  })
  uniqueVisitors: number;

  @ApiProperty({
    description: 'Total page views',
    example: 5430,
  })
  totalPageViews: number;

  @ApiProperty({
    description: 'Total sessions',
    example: 1800,
  })
  totalSessions: number;

  @ApiProperty({
    description: 'Average session duration in seconds',
    example: 185,
  })
  averageSessionDuration: number;

  @ApiProperty({
    description: 'Bounce rate percentage',
    example: 42.5,
  })
  bounceRate: number;

  @ApiProperty({
    description: 'New visitors count',
    example: 850,
  })
  newVisitors: number;

  @ApiProperty({
    description: 'Returning visitors count',
    example: 400,
  })
  returningVisitors: number;

  @ApiProperty({
    description: 'Pages per session',
    example: 3.2,
  })
  pagesPerSession: number;
}

export class TopPagesDto {
  @ApiProperty({
    description: 'Page path',
    example: '/dashboard',
  })
  path: string;

  @ApiProperty({
    description: 'Page title',
    example: 'Dashboard',
  })
  title: string;

  @ApiProperty({
    description: 'Number of views',
    example: 1250,
  })
  views: number;

  @ApiProperty({
    description: 'Unique visitors',
    example: 980,
  })
  uniqueVisitors: number;

  @ApiProperty({
    description: 'Average time on page in seconds',
    example: 145,
  })
  averageTimeOnPage: number;

  @ApiProperty({
    description: 'Bounce rate for this page',
    example: 35.2,
  })
  bounceRate: number;
}

export class RealTimeStatsDto {
  @ApiProperty({
    description: 'Currently active users',
    example: 45,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Page views in last hour',
    example: 125,
  })
  pageViewsLastHour: number;

  @ApiProperty({
    description: 'New sessions in last hour',
    example: 35,
  })
  newSessionsLastHour: number;

  @ApiProperty({
    description: 'Top active pages',
    type: [TopPagesDto],
  })
  topActivePages: TopPagesDto[];

  @ApiProperty({
    description: 'Traffic sources breakdown',
    example: {
      direct: 45,
      organic: 30,
      social: 15,
      referral: 10,
    },
  })
  trafficSources: Record<string, number>;

  @ApiProperty({
    description: 'Device breakdown',
    example: {
      desktop: 60,
      mobile: 35,
      tablet: 5,
    },
  })
  deviceBreakdown: Record<string, number>;

  @ApiProperty({
    description: 'Geographic breakdown (countries)',
    example: {
      India: 45,
      'United States': 25,
      'United Kingdom': 15,
      Canada: 10,
      Australia: 5,
    },
  })
  countryBreakdown: Record<string, number>;
}

export class TimeSeriesDataDto {
  @ApiProperty({
    description: 'Date/time timestamp',
    example: '2023-10-01T10:00:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Page views at this time',
    example: 125,
  })
  pageViews: number;

  @ApiProperty({
    description: 'Unique visitors at this time',
    example: 85,
  })
  uniqueVisitors: number;

  @ApiProperty({
    description: 'Sessions at this time',
    example: 95,
  })
  sessions: number;
}

export class AnalyticsDashboardDto {
  @ApiProperty({
    description: 'Overall statistics',
    type: AnalyticsStatsDto,
  })
  stats: AnalyticsStatsDto;

  @ApiProperty({
    description: 'Real-time statistics',
    type: RealTimeStatsDto,
  })
  realTime: RealTimeStatsDto;

  @ApiProperty({
    description: 'Top performing pages',
    type: [TopPagesDto],
  })
  topPages: TopPagesDto[];

  @ApiProperty({
    description: 'Time series data for charts',
    type: [TimeSeriesDataDto],
  })
  timeSeries: TimeSeriesDataDto[];
}