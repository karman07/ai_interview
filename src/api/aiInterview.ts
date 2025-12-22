import axios from './http';

export interface StartInterviewRequest {
  user_id: string;
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  jd: string;
  cv?: string;
  round_type: 'technical' | 'behavioral' | 'hr' | 'full';
}

export interface StartInterviewWithResumeRequest {
  resume: File;
  jd_file?: File;
  user_id: string;
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  jd: string;
  round_type: 'technical' | 'behavioral' | 'hr' | 'full';
}

export interface SubmitAnswerRequest {
  user_id: string;
  session_id: string;
  answer: string;
}

export interface Evaluation {
  clarity: number;
  confidence: number;
  technical_depth: number;
  summary: string;
}

export interface HistoryItem {
  question: string;
  answer: string | null;
  evaluation: Evaluation | null;
  stage: string;
  is_followup: boolean;
}

export interface InterviewState {
  stage: string;
  session_config: StartInterviewRequest;
  history: HistoryItem[];
  should_follow_up: boolean;
  completed: boolean;
}

export interface StartInterviewResponse {
  session_id: string;
  user_id: string;
  first_question: string;
  state: InterviewState;
}

export interface SubmitAnswerResponse {
  evaluation: Evaluation;
  next_question: string | null;
  state: InterviewState;
}

export interface AverageScores {
  technical_depth: number;
  relevance: number;
  communication: number;
  behavioral: number;
  overall: 'Hire' | 'No Hire' | 'Strong Hire' | 'Strong No Hire';
}

export interface InterviewReport {
  session_id: string;
  user_id: string;
  role: string;
  company: string;
  industry: string;
  avg_scores: AverageScores;
  history: HistoryItem[];
}

/**
 * Start a new AI interview session with CV text
 */
export const startInterview = async (
  data: StartInterviewRequest
): Promise<StartInterviewResponse> => {
  const response = await axios.post('/ai-interview/start', data);
  return response.data;
};

/**
 * Start interview with CV text (alternative endpoint)
 */
export const startInterviewWithCVText = async (
  data: StartInterviewRequest
): Promise<StartInterviewResponse> => {
  const response = await axios.post('/ai-interview/start-with-cv-text', data);
  return response.data;
};

/**
 * Start a new AI interview session with resume file upload
 */
export const startInterviewWithResume = async (
  data: StartInterviewWithResumeRequest
): Promise<StartInterviewResponse> => {
  const formData = new FormData();
  formData.append('resume', data.resume);
  if (data.jd_file) {
    formData.append('jd_file', data.jd_file);
  }
  formData.append('user_id', data.user_id);
  formData.append('session_id', data.session_id);
  formData.append('role_title', data.role_title);
  formData.append('company_name', data.company_name);
  formData.append('industry', data.industry);
  formData.append('jd', data.jd);
  formData.append('round_type', data.round_type);
  
  const response = await axios.post('/ai-interview/start-with-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Submit an answer to the current question
 */
export const submitAnswer = async (
  data: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> => {
  const response = await axios.post('/ai-interview/answer', data);
  return response.data;
};

/**
 * Get current interview state
 */
export const getInterviewState = async (
  userId: string,
  sessionId: string
): Promise<InterviewState> => {
  const response = await axios.get(`/ai-interview/state/${userId}/${sessionId}`);
  return response.data;
};

/**
 * Upload audio/video response
 */
export const uploadResponse = async (data: {
  sessionId: string;
  questionId: string;
  files: File[];
  text?: string;
  responseDuration?: number;
}) => {
  const formData = new FormData();
  
  data.files.forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('question_id', data.questionId);
  if (data.text) formData.append('text', data.text);
  if (data.responseDuration) formData.append('response_duration', data.responseDuration.toString());
  
  const response = await axios.post(`/ai-interview/session/${data.sessionId}/upload-response`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

/**
 * Submit answer with media URLs
 */
export const submitAnswerWithMedia = async (data: {
  sessionId: string;
  questionId: string;
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  responseDuration?: number;
}) => {
  const response = await axios.post(`/ai-interview/session/${data.sessionId}/answer`, {
    question_id: data.questionId,
    text: data.text,
    audio_url: data.audioUrl,
    video_url: data.videoUrl,
    response_duration: data.responseDuration
  });
  
  return response.data;
};

/**
 * Get interview report/results
 */
export const getInterviewReport = async (
  userId: string,
  sessionId: string
): Promise<InterviewReport> => {
  const response = await axios.get(`/ai-interview/report/${userId}/${sessionId}`);
  return response.data;
};

/**
 * List all sessions for a user
 */
export const getUserSessions = async (
  userId: string
): Promise<Record<string, InterviewState>> => {
  const response = await axios.get(`/ai-interview/sessions/${userId}`);
  return response.data;
};

/**
 * List all sessions (admin)
 */
export const getAllSessions = async (): Promise<Record<string, InterviewState>> => {
  const response = await axios.get('/ai-interview/sessions');
  return response.data;
};

/**
 * Create a new interview session
 */
export const createSession = async (data: {
  role: string;
  industry: string;
  company: string;
  cv_file_id?: string;
  jd_file_id?: string;
}) => {
  const response = await axios.post('/ai-interview/session/create', data);
  return response.data;
};

/**
 * Get session details
 */
export const getSessionDetails = async (sessionId: string) => {
  const response = await axios.get(`/ai-interview/session/${sessionId}`);
  return response.data;
};

/**
 * Get next question in session
 */
export const getNextQuestion = async (sessionId: string) => {
  const response = await axios.get(`/ai-interview/session/${sessionId}/next-question`);
  return response.data;
};

/**
 * Get session report
 */
export const getSessionReport = async (sessionId: string) => {
  const response = await axios.get(`/ai-interview/session/${sessionId}/report`);
  return response.data;
};

/**
 * Delete session
 */
export const deleteSession = async (sessionId: string) => {
  const response = await axios.delete(`/ai-interview/session/${sessionId}`);
  return response.data;
};
