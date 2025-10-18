import http from './http';
import {
  DSAProgress,
  SubmitCodeDto,
  UpdateProgressDto,
  RecordHintDto,
  DSAProgressFilters,
  UserStatistics,
  RecentSubmission,
  ProgressWithQuestion,
  ApiResponse,
} from '@/types/dsa';

const DSA_PROGRESS_BASE = '/dsa-progress';

/**
 * DSA Progress Tracking API Service
 */
export const dsaProgressApi = {
  /**
   * Submit code solution for a question
   */
  submitCode: async (questionId: string, data: SubmitCodeDto): Promise<DSAProgress> => {
    const response = await http.post<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}/submit`,
      data
    );
    return response.data.data;
  },

  /**
   * Get all user progress with optional filters
   */
  getMyProgress: async (filters?: DSAProgressFilters): Promise<ProgressWithQuestion[]> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isBookmarked !== undefined) {
      params.append('isBookmarked', filters.isBookmarked.toString());
    }
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.category) params.append('category', filters.category);

    const response = await http.get<ApiResponse<ProgressWithQuestion[]>>(
      `${DSA_PROGRESS_BASE}/my-progress?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get solved questions
   */
  getSolvedQuestions: async (): Promise<ProgressWithQuestion[]> => {
    return dsaProgressApi.getMyProgress({ status: 'Solved' });
  },

  /**
   * Get attempted questions
   */
  getAttemptedQuestions: async (): Promise<ProgressWithQuestion[]> => {
    return dsaProgressApi.getMyProgress({ status: 'Attempted' });
  },

  /**
   * Get bookmarked questions
   */
  getBookmarkedQuestions: async (): Promise<ProgressWithQuestion[]> => {
    return dsaProgressApi.getMyProgress({ isBookmarked: true });
  },

  /**
   * Get user statistics
   */
  getStatistics: async (): Promise<UserStatistics> => {
    const response = await http.get<ApiResponse<UserStatistics>>(
      `${DSA_PROGRESS_BASE}/statistics`
    );
    return response.data.data;
  },

  /**
   * Get recent submissions
   */
  getRecentSubmissions: async (limit = 10): Promise<RecentSubmission[]> => {
    const response = await http.get<ApiResponse<RecentSubmission[]>>(
      `${DSA_PROGRESS_BASE}/recent-submissions?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Get progress for a specific question
   */
  getQuestionProgress: async (questionId: string): Promise<DSAProgress> => {
    const response = await http.get<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}`
    );
    return response.data.data;
  },

  /**
   * Get submission history for a question
   */
  getSubmissionHistory: async (questionId: string): Promise<DSAProgress> => {
    const response = await http.get<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}/submissions`
    );
    return response.data.data;
  },

  /**
   * Update progress metadata (bookmark, notes, rating)
   */
  updateProgress: async (
    questionId: string,
    data: UpdateProgressDto
  ): Promise<DSAProgress> => {
    const response = await http.patch<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Bookmark a question
   */
  bookmarkQuestion: async (questionId: string, bookmark = true): Promise<DSAProgress> => {
    return dsaProgressApi.updateProgress(questionId, { isBookmarked: bookmark });
  },

  /**
   * Add notes to a question
   */
  addNotes: async (questionId: string, notes: string): Promise<DSAProgress> => {
    return dsaProgressApi.updateProgress(questionId, { userNotes: notes });
  },

  /**
   * Rate a question
   */
  rateQuestion: async (questionId: string, rating: number): Promise<DSAProgress> => {
    return dsaProgressApi.updateProgress(questionId, { userRating: rating });
  },

  /**
   * Like a question (user-specific)
   */
  likeQuestion: async (questionId: string): Promise<DSAProgress> => {
    const response = await http.post<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}/like`
    );
    return response.data.data;
  },

  /**
   * Dislike a question (user-specific)
   */
  dislikeQuestion: async (questionId: string): Promise<DSAProgress> => {
    const response = await http.post<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}/dislike`
    );
    return response.data.data;
  },

  /**
   * Record hint usage
   */
  recordHint: async (questionId: string, data: RecordHintDto): Promise<DSAProgress> => {
    const response = await http.post<ApiResponse<DSAProgress>>(
      `${DSA_PROGRESS_BASE}/${questionId}/hint`,
      data
    );
    return response.data.data;
  },

  /**
   * Reset question progress
   */
  resetProgress: async (questionId: string): Promise<{ message: string }> => {
    const response = await http.delete<ApiResponse<{ message: string }>>(
      `${DSA_PROGRESS_BASE}/${questionId}`
    );
    return response.data.data;
  },

  /**
   * Delete all progress (WARNING: Destructive operation)
   */
  deleteAllProgress: async (): Promise<{ message: string }> => {
    const response = await http.delete<ApiResponse<{ message: string }>>(
      `${DSA_PROGRESS_BASE}/all`
    );
    return response.data.data;
  },
};

export default dsaProgressApi;
