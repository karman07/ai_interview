import { ApiProperty } from '@nestjs/swagger';

export class UserVisitorDto {
  @ApiProperty({
    description: 'Unique visitor identifier',
    example: 'visitor_12345',
  })
  visitorId: string;

  @ApiProperty({
    description: 'Current session ID',
    example: 'session_67890',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Whether this is a returning visitor',
    example: true,
  })
  isReturning: boolean;

  @ApiProperty({
    description: 'Total number of sessions for this visitor',
    example: 5,
  })
  sessionCount: number;

  @ApiProperty({
    description: 'First visit timestamp',
    example: '2024-01-01T10:00:00.000Z',
  })
  firstVisit: Date;

  @ApiProperty({
    description: 'Last visit timestamp',
    example: '2024-01-10T15:30:00.000Z',
  })
  lastVisit: Date;

  @ApiProperty({
    description: 'Visitor country',
    example: 'United States',
    required: false,
  })
  country?: string;

  @ApiProperty({
    description: 'Device type',
    example: 'desktop',
    required: false,
  })
  device?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Total time spent across all sessions (seconds)',
    example: 1800,
  })
  totalTimeSpent: number;

  @ApiProperty({
    description: 'Total page views across all sessions',
    example: 25,
  })
  totalPageViews: number;
}

export class UserVisitorsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Visitor data and pagination info',
  })
  data: {
    visitors: UserVisitorDto[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export class UserVisitorStatsDto {
  @ApiProperty({
    description: 'Total number of unique visitors',
    example: 150,
  })
  totalVisitors: number;

  @ApiProperty({
    description: 'Number of new visitors',
    example: 45,
  })
  newVisitors: number;

  @ApiProperty({
    description: 'Number of returning visitors',
    example: 105,
  })
  returningVisitors: number;

  @ApiProperty({
    description: 'Total number of sessions',
    example: 380,
  })
  totalSessions: number;

  @ApiProperty({
    description: 'Average sessions per visitor',
    example: 2.53,
  })
  averageSessionsPerVisitor: number;

  @ApiProperty({
    description: 'Total time spent by all visitors (seconds)',
    example: 45600,
  })
  totalTimeSpent: number;

  @ApiProperty({
    description: 'Average time spent per visitor (seconds)',
    example: 304,
  })
  averageTimePerVisitor: number;
}

export class UserVisitorStatsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User visitor statistics',
    type: UserVisitorStatsDto,
  })
  data: UserVisitorStatsDto;
}