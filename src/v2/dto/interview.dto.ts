import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ===========================
// Request DTOs
// ===========================

export class StartInterviewDto {
  @IsString()
  user_id: string;

  @IsString()
  session_id: string;

  @IsString()
  role: string;

  @IsString()
  company: string;

  @IsString()
  cv_text: string;

  @IsString()
  jd_text: string;
}

export class StartWithIdsDto {
  @IsString()
  user_id: string;

  @IsString()
  session_id: string;

  @IsString()
  role: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  cv_id?: string;

  @IsOptional()
  @IsString()
  jd_id?: string;

  @IsOptional()
  @IsString()
  cv_text?: string;

  @IsOptional()
  @IsString()
  jd_text?: string;
}

// ===========================
// Response DTOs
// ===========================

export class EvaluationDto {
  @IsNumber()
  clarity: number;

  @IsNumber()
  relevance: number;

  @IsNumber()
  depth: number;

  @IsString()
  feedback: string;
}

export class StartSessionResponseDto {
  @IsString()
  session_id: string;

  @IsEnum(['active', 'restored'])
  status: 'active' | 'restored';

  @IsString()
  question: string;

  @IsNumber()
  question_number: number;
}

export class AnswerResponseDto {
  @IsString()
  session_id: string;

  @IsEnum(['active', 'completed'])
  status: 'active' | 'completed';

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsNumber()
  question_number?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluationDto)
  evaluation?: EvaluationDto;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  total_questions?: number;
}

export class MessageMetadataDto {
  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluationDto)
  evaluation?: EvaluationDto;

  @IsOptional()
  voice_metrics?: any;
}

export class SessionMessageDto {
  @IsEnum(['interviewer', 'candidate'])
  role: 'interviewer' | 'candidate';

  @IsString()
  content: string;

  @IsNumber()
  timestamp: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageMetadataDto)
  metadata?: MessageMetadataDto;
}

export class SessionStateResponseDto {
  @IsString()
  session_id: string;

  @IsString()
  user_id: string;

  @IsString()
  role: string;

  @IsString()
  company: string;

  @IsNumber()
  question_count: number;

  @IsEnum(['intro', 'technical', 'behavioral', 'closing'])
  stage: 'intro' | 'technical' | 'behavioral' | 'closing';

  @IsBoolean()
  completed: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionMessageDto)
  messages: SessionMessageDto[];

  @IsNumber()
  avg_response_time: number;
}

export class ResponseTimesDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;

  @IsNumber()
  avg: number;

  @IsArray()
  all: number[];
}

export class PerformanceMetricsResponseDto {
  @IsString()
  session_id: string;

  @IsNumber()
  total_questions: number;

  @ValidateNested()
  @Type(() => ResponseTimesDto)
  response_times: ResponseTimesDto;

  @IsEnum(['active', 'not_cached'])
  cache_status: 'active' | 'not_cached';
}

export class OverallEvaluationDto {
  @IsNumber()
  overall_score: number;

  @IsEnum(['hire', 'maybe', 'no_hire'])
  recommendation: 'hire' | 'maybe' | 'no_hire';

  @IsNumber()
  clarity: number;

  @IsNumber()
  relevance: number;

  @IsNumber()
  depth: number;
}

export class ConversationItemDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @ValidateNested()
  @Type(() => EvaluationDto)
  evaluation: EvaluationDto;
}

export class CompleteInterviewResponseDto {
  @IsString()
  session_id: string;

  @IsEnum(['completed'])
  status: 'completed';

  @IsNumber()
  total_questions: number;

  @ValidateNested()
  @Type(() => OverallEvaluationDto)
  evaluation: OverallEvaluationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationItemDto)
  conversation: ConversationItemDto[];

  @ValidateNested()
  @Type(() => PerformanceMetricsResponseDto)
  performance_metrics: {
    avg_response_time: number;
    total_response_times: number[];
  };
}

export class MetricStatsDto {
  @IsNumber()
  total: number;

  @IsNumber()
  avg_duration: number;

  @IsNumber()
  min_duration: number;

  @IsNumber()
  max_duration: number;
}

export class CacheMetricsDto {
  @IsNumber()
  hits: number;

  @IsNumber()
  misses: number;

  @IsNumber()
  hit_rate: number;

  @IsString()
  hit_rate_percentage: string;
}

export class GlobalMetricsDto {
  @ValidateNested()
  @Type(() => MetricStatsDto)
  llm_calls: MetricStatsDto;

  @ValidateNested()
  @Type(() => MetricStatsDto)
  api_requests: MetricStatsDto;

  @ValidateNested()
  @Type(() => CacheMetricsDto)
  cache: CacheMetricsDto;
}

export class GlobalMetricsResponseDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => GlobalMetricsDto)
  metrics: GlobalMetricsDto;

  @IsNumber()
  timestamp: number;
}

export class MetricsResetResponseDto {
  @IsString()
  status: string;

  @IsString()
  message: string;
}

export class ErrorResponseDto {
  @IsString()
  detail: string;
}

export class StreamChunkDto {
  @IsOptional()
  @IsString()
  chunk?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsOptional()
  @IsString()
  error?: string;
}
