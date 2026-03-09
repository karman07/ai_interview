import axios from 'axios';
import { tokenStore } from './http';

const API_URL = import.meta.env.VITE_AI_INTERVIEW_API || 'http://ai.aiforjob.ai';

const aiInterviewClient = axios.create({
  baseURL: API_URL,
});

aiInterviewClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== TypeScript Interfaces ====================

export interface VoiceMetrics {
  rate_wpm: number;
  fluency_score: number;
  clarity_score: number;
  confidence_score: number;
  pace_score: number;
  total_score: number;
  pitch_mean_hz: number;
  pitch_std_hz: number;
  pause_ratio: number;
}

export interface ConversationMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp?: number;
  voice_metrics?: Partial<VoiceMetrics>;
  metadata?: {
    stage?: string;
    evaluation?: {
      clarity: number;
      relevance: number;
      depth: number;
      feedback: string;
    };
  };
}

export interface SkillAssessment {
  score: number;
  assessment: string;
}

export interface Evaluation {
  overall_score: number;
  recommendation: 'hire' | 'maybe' | 'reject';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  technical_skills: SkillAssessment;
  communication_skills: SkillAssessment;
  problem_solving: SkillAssessment;
  cultural_fit: SkillAssessment;
  experience_relevance: SkillAssessment;
  detailed_feedback: string;
  improvement_areas: string[];
  key_highlights: string[];
  // V2 Extended fields
  clarity?: number;
  relevance?: number;
  depth?: number;
}

export interface VideoAnalytics {
  confidence_score: number;
  eye_contact_percentage: number;
  posture_score: number;
  engagement_level: 'low' | 'medium' | 'high';
  speech_pace: 'slow' | 'moderate' | 'fast';
  filler_words_count: number;
  smile_frequency: 'low' | 'appropriate' | 'high';
  facial_expressions: {
    positive: number;
    neutral: number;
    stressed: number;
  };
  body_language: {
    open: number;
    closed: number;
    neutral: number;
  };
  energy_level: string;
  professionalism_score: number;
  note: string;
}

export interface VoiceAnalytics {
  analysis_performed: boolean;
  total_voice_samples?: number;
  average_scores?: {
    fluency: number;
    clarity: number;
    confidence: number;
    pace: number;
    overall: number;
  };
  speaking_rate_wpm?: number;
  interpretation?: {
    fluency: string;
    clarity: string;
    confidence: string;
    pace: string;
  };
  detailed_scores?: VoiceMetrics[];
}

// ==================== Request Interfaces ====================

export interface StartInterviewV2Request {
  user_id: string;
  session_id: string;
  role: string;
  company?: string;
  cv_text: string;
  jd_text: string;
}

// NEW: Start with IDs/Files
export interface StartInterviewWithIDsRequest {
  user_id: string;
  session_id: string;
  role: string;
  company?: string;
  cv_file?: File;
  jd_file?: File;
  resume_file?: File;  // Alias for cv_file
  resume_jd?: File;    // Alias for jd_file
  cv_id?: string;
  jd_id?: string;
  cv_text?: string;
  jd_text?: string;
}

export interface SubmitAnswerV2Request {
  answer?: string;
  answer_audio?: Blob | File;
  session_id: string;
}

export interface CompleteInterviewV2Request {
  final_notes?: string;
}

// ==================== Response Interfaces ====================

export interface StartInterviewV2Response {
  session_id: string;
  status: 'active' | 'restored';
  question: string;
  question_number: number;
  message?: string;
}

export interface SubmitAnswerV2Response {
  session_id: string;
  status: 'active' | 'completed';
  question?: string;
  question_number?: number;
  message?: string;
  total_questions?: number;
  evaluation?: {
    clarity: number;
    relevance: number;
    depth: number;
    feedback: string;
  };
  voice_analysis?: {
    fluency_score: number;
    clarity_score: number;
    confidence_score: number;
    pace_score: number;
    rate_wpm: number;
    total_score: number;
  };
}

export interface InterviewStatusV2Response {
  session_id: string;
  status: 'active' | 'completed';
  question: string;
  question_number: number;
  history: ConversationMessage[];
}

// NEW: Session State Response
export interface SessionStateResponse {
  session_id: string;
  user_id: string;
  role: string;
  company: string;
  question_count: number;
  stage: 'intro' | 'technical' | 'behavioral' | 'closing';
  completed: boolean;
  messages: ConversationMessage[];
  avg_response_time: number;
}

// NEW: Performance Metrics Response
export interface PerformanceMetricsResponse {
  session_id: string;
  total_questions: number;
  response_times: {
    min: number;
    max: number;
    avg: number;
    all: number[];
  };
  cache_status: 'active' | 'not_cached';
}

// NEW: Global Metrics Response
export interface GlobalMetricsResponse {
  status: 'success';
  metrics: {
    llm_calls: {
      total: number;
      avg_duration: number;
      min_duration: number;
      max_duration: number;
    };
    api_requests: {
      total: number;
      avg_duration: number;
      min_duration: number;
      max_duration: number;
    };
    cache: {
      hits: number;
      misses: number;
      hit_rate: number;
      hit_rate_percentage: string;
    };
  };
  timestamp: number;
}

export interface CompleteInterviewV2Response {
  session_id: string;
  status: 'completed';
  interview_duration_minutes: number;
  total_questions: number;
  role: string;
  company: string;
  evaluation: Evaluation;
  video_analytics?: VideoAnalytics;
  voice_analytics?: VoiceAnalytics;
  conversation: ConversationMessage[];
  metrics?: {
    response_quality: number;
    technical_depth: number;
    communication: number;
    overall_performance: number;
  };
  performance_metrics?: {
    avg_response_time: number;
    total_response_times: number[];
  };
}

// ==================== New V2 Report Interface ====================

export interface QuestionAnalysis {
  question_id: number;
  question: string;
  user_answer_summary: string;
  score: number;
  evaluation: {
    strengths: string[];
    weaknesses: string[];
    ideal_answer_outline: string[];
  };
}

export interface InterviewV2Report {
  session_id?: string;
  summary: {
    overall_score: number;
    hire_recommendation: string;
    seniority_assessment: string;
    confidence_assessment: string;
    key_strengths: string[];
    key_areas_for_improvement: string[];
  };
  dimension_scores: {
    technical_depth: number;
    problem_solving: number;
    system_design: number;
    communication: number;
    role_fit: number;
  };
  question_wise_analysis: QuestionAnalysis[];
  skill_gap_analysis: {
    critical_gaps: string[];
    moderate_gaps: string[];
    minor_gaps: string[];
  };
  behavioral_insights: {
    communication_style: string;
    thinking_pattern: string;
    pressure_handling: string;
  };
  improvement_plan: {
    immediate_actions: string[];
    plan_1_week: string[];
    plan_1_month: string[];
  };
  verdict: {
    strengths_to_highlight: string[];
    areas_to_fix_before_next_interview: string[];
    final_recommendation_text: string;
  };
  conversation?: Array<{ role: string; content: string }>;
}

// ==================== API Functions ====================

/**
 * ROUTE 1: POST /interview/v2/start
 * Start interview with direct CV/JD text (JSON body)
 * @param data Interview start data with user_id, session_id, role, company, cv_text, jd_text
 * @returns Session ID and first question
 */
export const startInterviewV2 = async (
  data: StartInterviewV2Request
): Promise<StartInterviewV2Response> => {
  // For text-based start, use JSON body (as per cURL examples)
  const response = await aiInterviewClient.post('/interview/v2/start', {
    user_id: data.user_id,
    session_id: data.session_id,
    role: data.role,
    company: data.company,
    cv_text: data.cv_text,
    jd_text: data.jd_text
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data;
};

/**
 * ROUTE 2: POST /interview/v2/start-with-ids ⭐ RECOMMENDED
 * Start interview with file uploads, MongoDB IDs, or text
 * Priority: Files > MongoDB IDs > Text
 * @param data Interview start data with files/IDs/text
 * @returns Session ID and first question
 */
export const startInterviewWithIDs = async (
  data: StartInterviewWithIDsRequest
): Promise<StartInterviewV2Response> => {
  const formData = new FormData();

  // Required fields
  formData.append('user_id', data.user_id);
  formData.append('session_id', data.session_id);
  formData.append('role', data.role);

  // Optional company
  if (data.company) {
    formData.append('company', data.company);
  }

  // CV - Priority: File > MongoDB ID > Text
  // Support both cv_file and resume_file naming
  const cvFile = data.cv_file || data.resume_file;
  if (cvFile) {
    formData.append('cv_file', cvFile);
  } else if (data.cv_id) {
    formData.append('cv_id', data.cv_id);
  } else if (data.cv_text) {
    formData.append('cv_text', data.cv_text);
  }

  // JD - Priority: File > MongoDB ID > Text
  // Support both jd_file and resume_jd naming
  const jdFile = data.jd_file || data.resume_jd;
  if (jdFile) {
    formData.append('jd_file', jdFile);
  } else if (data.jd_id) {
    formData.append('jd_id', data.jd_id);
  } else if (data.jd_text) {
    formData.append('jd_text', data.jd_text);
  }

  const response = await aiInterviewClient.post('/interview/v2/start-with-ids', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};

/**
 * ROUTE 3: POST /interview/v2/answer
 * Submit candidate's answer with audio or video recording
 * @param sessionId The session ID from start interview
 * @param data Answer text or audio file
 * @returns Next question or completion status with evaluation
 */
export const submitAnswerV2 = async (
  _sessionId: string,
  data: SubmitAnswerV2Request
): Promise<SubmitAnswerV2Response> => {
  const formData = new FormData();

  formData.append('session_id', data.session_id);

  // Audio takes priority over text
  if (data.answer_audio) {
    formData.append('audio_file', data.answer_audio);
  } else if (data.answer) {
    formData.append('answer', data.answer);
  }

  const response = await aiInterviewClient.post('/interview/v2/answer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};

/**
 * ROUTE 4: GET /interview/v2/stream/:session_id ⭐ REAL-TIME STREAMING
 * Stream next question generation using Server-Sent Events
 * First chunk arrives in 0.5-1s (vs 2-3s for complete)
 * @param sessionId The session ID
 * @param onChunk Callback for each text chunk
 * @param onComplete Callback when streaming is complete
 * @param onError Callback for errors
 * @returns Cancel function to stop streaming
 */
export const streamQuestion = (
  sessionId: string,
  onChunk: (chunk: string, fullText: string) => void,
  onComplete: (fullQuestion: string) => void,
  onError: (error: Error) => void
): (() => void) => {
  const eventSource = new EventSource(`${API_URL}/interview/v2/stream/${sessionId}`);

  let fullQuestion = '';

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.chunk) {
        // Received a text chunk
        fullQuestion += data.chunk;
        onChunk(data.chunk, fullQuestion);
      }

      if (data.done) {
        // Streaming complete
        eventSource.close();
        onComplete(fullQuestion);
      }

      if (data.error) {
        // Error occurred
        eventSource.close();
        onError(new Error(data.error));
      }
    } catch (error) {
      eventSource.close();
      onError(error as Error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
    onError(new Error('Streaming connection failed'));
  };

  // Return function to cancel streaming
  return () => eventSource.close();
};

/**
 * ROUTE 5: GET /interview/v2/state/:session_id
 * Get complete session state and conversation history
 * Use to resume interrupted interviews or show history
 * @param sessionId The session ID
 * @returns Complete session state with messages
 */
export const getSessionState = async (
  sessionId: string
): Promise<SessionStateResponse> => {
  const response = await aiInterviewClient.get(`/interview/v2/state/${sessionId}`);

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data;
};

/**
 * ROUTE 6: GET /interview/v2/performance/:session_id
 * Get performance metrics for session
 * Monitor interview performance, debug slow responses
 * @param sessionId The session ID
 * @returns Performance metrics including response times and cache status
 */
export const getPerformanceMetrics = async (
  sessionId: string
): Promise<PerformanceMetricsResponse> => {
  const response = await aiInterviewClient.get(`/interview/v2/performance/${sessionId}`);

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data;
};

/**
 * ROUTE 7: POST /interview/v2/complete/:session_id
 * Complete interview and get full evaluation
 * Call after interview status becomes "completed"
 * @param sessionId The session ID from start interview
 * @param data Optional final notes
 * @returns Comprehensive evaluation report with analytics
 */
export const completeInterviewV2 = async (
  sessionId: string,
  data?: CompleteInterviewV2Request
): Promise<CompleteInterviewV2Response> => {
  const response = await aiInterviewClient.post(
    `/interview/v2/complete/${sessionId}`,
    data || {},
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return response.data;
};

/**
 * ROUTE 8: GET /interview/v2/metrics/global
 * Get system-wide performance metrics
 * For admin dashboard, monitoring, performance analysis
 * @returns Global metrics including LLM calls, API requests, cache stats
 */
export const getGlobalMetrics = async (): Promise<GlobalMetricsResponse> => {
  const response = await aiInterviewClient.get('/interview/v2/metrics/global');

  return response.data;
};

/**
 * ROUTE 9: POST /interview/v2/metrics/reset
 * Reset all performance metrics (Admin only)
 * For testing environments and development
 * @returns Success status
 */
export const resetMetrics = async (): Promise<{ status: string; message: string }> => {
  const response = await aiInterviewClient.post('/interview/v2/metrics/reset');

  return response.data;
};

/**
 * Get current interview status and history (Legacy route - use getSessionState instead)
 * @param sessionId The session ID from start interview
 * @returns Current question, status, and conversation history
 */
export const getInterviewStatusV2 = async (
  sessionId: string
): Promise<InterviewStatusV2Response> => {
  const response = await aiInterviewClient.get(`/v2/interview/${sessionId}/status`);

  if (response.data.status === 'not_found') {
    throw new Error('Session not found');
  }

  return response.data;
};

// ==================== Helper Functions ====================

/**
 * Start interview with resume and JD files (simplified helper)
 * @param userId User ID
 * @param resumeFile Resume file (PDF, DOCX, or TXT)
 * @param jdFile Job description file (PDF, DOCX, or TXT)
 * @param role Job role/title
 * @param company Company name (optional)
 * @returns Session data with first question
 */
export const startInterviewWithFiles = async (
  userId: string,
  resumeFile: File,
  jdFile: File,
  role: string,
  company?: string
): Promise<StartInterviewV2Response> => {
  // Generate session ID
  const sessionId = generateSessionId(userId);

  // Validate files
  const validation = validateFiles(resumeFile, jdFile);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  // Call API
  return startInterviewWithIDs({
    user_id: userId,
    session_id: sessionId,
    role,
    company,
    cv_file: resumeFile,
    jd_file: jdFile
  });
};

/**
 * Convert audio blob to file with proper naming
 */
export const createAudioFile = (blob: Blob, sessionId: string): File => {
  const timestamp = Date.now();
  return new File([blob], `answer_${sessionId}_${timestamp}.wav`, {
    type: blob.type || 'audio/wav'
  });
};

/**
 * Validate resume/JD file - supports PDF, DOCX, TXT
 * Max size: 10MB
 */
export const validateFile = (file: File, fieldName: string = 'File'): { valid: boolean; error?: string } => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: `${fieldName} is required` };
  }

  // Check file type
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const fileName = file.name.toLowerCase();
  const isValidType = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!isValidType) {
    return { valid: false, error: `${fieldName} must be PDF, DOCX, or TXT file` };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `${fieldName} must be less than 10MB` };
  }

  // Check if file has content
  if (file.size === 0) {
    return { valid: false, error: `${fieldName} appears to be empty` };
  }

  return { valid: true };
};

/**
 * Validate audio file - supports WAV, MP3, WEBM, M4A, OGG, FLAC
 */
export const validateAudioFile = (file: Blob | File): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/m4a',
    'audio/ogg',
    'audio/flac',
    'audio/webm'
  ];

  const type = file.type || '';
  const isValid = allowedTypes.some(allowed => type.includes(allowed));

  if (!isValid) {
    return { valid: false, error: 'Audio file must be WAV, MP3, WEBM, M4A, OGG, or FLAC format' };
  }

  // Check if file has content
  if (file.size === 0) {
    return { valid: false, error: 'Audio file is empty' };
  }

  // Check minimum size (1KB)
  if (file.size < 1000) {
    return { valid: false, error: 'Audio recording is too short' };
  }

  return { valid: true };
};

/**
 * Validate both resume and JD files together
 */
export const validateFiles = (
  resumeFile: File | null,
  jdFile: File | null
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!resumeFile) {
    errors.push('Resume file is required');
  } else {
    const resumeValidation = validateFile(resumeFile, 'Resume');
    if (!resumeValidation.valid && resumeValidation.error) {
      errors.push(resumeValidation.error);
    }
  }

  if (!jdFile) {
    errors.push('Job description file is required');
  } else {
    const jdValidation = validateFile(jdFile, 'Job Description');
    if (!jdValidation.valid && jdValidation.error) {
      errors.push(jdValidation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format voice score interpretation
 */
export const getVoiceScoreInterpretation = (score: number): string => {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Needs improvement';
};

/**
 * Get recommendation color for UI
 */
export const getRecommendationColor = (recommendation: 'hire' | 'maybe' | 'reject'): string => {
  const colors = {
    hire: 'green',
    maybe: 'yellow',
    reject: 'red'
  };
  return colors[recommendation];
};

/**
 * Get engagement level color for UI
 */
export const getEngagementColor = (level: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'red',
    medium: 'yellow',
    high: 'green'
  };
  return colors[level];
};

/**
 * Generate unique session ID
 */
export const generateSessionId = (userId: string): string => {
  return `sess_${Date.now()}_${userId}`;
};

/**
 * Session Manager - Handle localStorage operations
 */
export const SessionManager = {
  /**
   * Save session data to localStorage
   */
  save(sessionId: string, data: any): void {
    localStorage.setItem('current_session', sessionId);
    localStorage.setItem('session_data', JSON.stringify(data));
    localStorage.setItem('session_timestamp', Date.now().toString());
  },

  /**
   * Get session data from localStorage
   * Returns null if expired (24 hours)
   */
  get(): { sessionId: string; data: any; timestamp: number } | null {
    const sessionId = localStorage.getItem('current_session');
    const dataStr = localStorage.getItem('session_data');
    const timestamp = localStorage.getItem('session_timestamp');

    if (!sessionId || !dataStr || !timestamp) {
      return null;
    }

    // Check if session is expired (24 hours)
    const isExpired = Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000;
    if (isExpired) {
      this.clear();
      return null;
    }

    return {
      sessionId,
      data: JSON.parse(dataStr),
      timestamp: parseInt(timestamp)
    };
  },

  /**
   * Clear session data
   */
  clear(): void {
    localStorage.removeItem('current_session');
    localStorage.removeItem('session_data');
    localStorage.removeItem('session_timestamp');
  },

  /**
   * Update current question number
   */
  updateQuestionNumber(questionNumber: number): void {
    const data = this.get();
    if (data) {
      data.data.questionNumber = questionNumber;
      localStorage.setItem('session_data', JSON.stringify(data.data));
    }
  }
};

/**
 * Check browser support for required features
 */
export const checkBrowserSupport = (): { supported: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errors.push('Your browser does not support audio/video recording');
  }

  // Check FormData support
  if (!window.FormData) {
    errors.push('Your browser does not support file uploads');
  }

  // Check EventSource support for streaming
  if (!window.EventSource) {
    console.warn('Streaming not supported, falling back to polling');
  }

  return {
    supported: errors.length === 0,
    errors
  };
};

/**
 * Format timestamp to readable time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString();
};

/**
 * Calculate interview duration
 */
export const calculateDuration = (startTime: Date): string => {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);
  return `${elapsed} min`;
};

/**
 * Error handler for API calls
 */
export const handleAPIError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
