import axios from './http';

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
  voice_metrics?: Partial<VoiceMetrics>;
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
  role: string;
  company?: string;
  resume_file?: File;
  jd_file?: File;
  resume_text?: string;
  jd_text?: string;
}

export interface SubmitAnswerV2Request {
  answer?: string;
  answer_audio?: Blob | File;
}

export interface CompleteInterviewV2Request {
  final_notes?: string;
}

// ==================== Response Interfaces ====================

export interface StartInterviewV2Response {
  session_id: string;
  status: 'active';
  question: string;
  question_number: number;
  message: string;
}

export interface SubmitAnswerV2Response {
  session_id: string;
  status: 'active';
  question: string;
  question_number: number;
}

export interface InterviewStatusV2Response {
  session_id: string;
  status: 'active' | 'completed';
  question: string;
  question_number: number;
  history: ConversationMessage[];
}

export interface CompleteInterviewV2Response {
  session_id: string;
  status: 'completed';
  interview_duration_minutes: number;
  total_questions: number;
  role: string;
  company: string;
  evaluation: Evaluation;
  video_analytics: VideoAnalytics;
  voice_analytics: VoiceAnalytics;
  conversation: ConversationMessage[];
  metrics: {
    response_quality: number;
    technical_depth: number;
    communication: number;
    overall_performance: number;
  };
}

// ==================== API Functions ====================

/**
 * Start a new V2 interview session
 * @param data Interview start data with role, company, resume, and JD
 * @returns Session ID and first question
 */
export const startInterviewV2 = async (
  data: StartInterviewV2Request
): Promise<StartInterviewV2Response> => {
  const formData = new FormData();
  
  // Required field
  formData.append('role', data.role);
  
  // Optional fields
  if (data.company) {
    formData.append('company', data.company);
  }
  
  // Resume (file takes priority over text)
  if (data.resume_file) {
    formData.append('resume_file', data.resume_file);
  } else if (data.resume_text) {
    formData.append('resume_text', data.resume_text);
  }
  
  // Job Description (file takes priority over text)
  if (data.jd_file) {
    formData.append('jd_file', data.jd_file);
  } else if (data.jd_text) {
    formData.append('jd_text', data.jd_text);
  }
  
  const response = await axios.post('/v2/interview/start', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

/**
 * Submit an answer to the current interview question
 * @param sessionId The session ID from start interview
 * @param data Answer text or audio file
 * @returns Next question or completion status
 */
export const submitAnswerV2 = async (
  sessionId: string,
  data: SubmitAnswerV2Request
): Promise<SubmitAnswerV2Response> => {
  const formData = new FormData();
  
  // Audio takes priority over text
  if (data.answer_audio) {
    formData.append('answer_audio', data.answer_audio);
  } else if (data.answer) {
    formData.append('answer', data.answer);
  }
  
  const response = await axios.post(`/v2/interview/${sessionId}/answer`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

/**
 * Get current interview status and history
 * @param sessionId The session ID from start interview
 * @returns Current question, status, and conversation history
 */
export const getInterviewStatusV2 = async (
  sessionId: string
): Promise<InterviewStatusV2Response> => {
  const response = await axios.get(`/v2/interview/${sessionId}/status`);
  
  if (response.data.status === 'not_found') {
    throw new Error('Session not found');
  }
  
  return response.data;
};

/**
 * Complete the interview and get comprehensive report
 * @param sessionId The session ID from start interview
 * @param data Optional final notes
 * @returns Comprehensive evaluation report with analytics
 */
export const completeInterviewV2 = async (
  sessionId: string,
  data?: CompleteInterviewV2Request
): Promise<CompleteInterviewV2Response> => {
  const response = await axios.post(
    `/v2/interview/${sessionId}/complete`,
    data || {},
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
  
  return response.data;
};

// ==================== Helper Functions ====================

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
 * Validate file types for resume/JD uploads
 */
export const validateFile = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  return allowedTypes.includes(file.type);
};

/**
 * Validate audio file types
 */
export const validateAudioFile = (file: Blob | File): boolean => {
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
  return allowedTypes.some(allowed => type.includes(allowed));
};

/**
 * Format voice score interpretation
 */
export const getVoiceScoreInterpretation = (score: number): string => {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
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
