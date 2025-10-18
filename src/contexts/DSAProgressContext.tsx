import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  DSAProgress,
  SubmitCodeDto,
  UpdateProgressDto,
  RecordHintDto,
  DSAProgressFilters,
  UserStatistics,
  RecentSubmission,
  ProgressWithQuestion,
} from '@/types/dsa';
import { dsaProgressApi } from '@/api/dsaProgress';

interface DSAProgressContextType {
  // State
  myProgress: ProgressWithQuestion[];
  currentProgress: DSAProgress | null;
  statistics: UserStatistics | null;
  recentSubmissions: RecentSubmission[];
  loading: boolean;
  error: string | null;

  // Actions
  submitCode: (questionId: string, data: SubmitCodeDto) => Promise<DSAProgress | null>;
  fetchMyProgress: (filters?: DSAProgressFilters) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchRecentSubmissions: (limit?: number) => Promise<void>;
  fetchQuestionProgress: (questionId: string) => Promise<void>;
  fetchSubmissionHistory: (questionId: string) => Promise<void>;
  updateProgress: (questionId: string, data: UpdateProgressDto) => Promise<void>;
  bookmarkQuestion: (questionId: string, bookmark?: boolean) => Promise<void>;
  addNotes: (questionId: string, notes: string) => Promise<void>;
  rateQuestion: (questionId: string, rating: number) => Promise<void>;
  likeQuestion: (questionId: string) => Promise<void>;
  dislikeQuestion: (questionId: string) => Promise<void>;
  recordHint: (questionId: string, data: RecordHintDto) => Promise<void>;
  resetProgress: (questionId: string) => Promise<void>;
  deleteAllProgress: () => Promise<void>;
  clearError: () => void;
}

const DSAProgressContext = createContext<DSAProgressContextType | undefined>(undefined);

export const useDSAProgress = () => {
  const context = useContext(DSAProgressContext);
  if (!context) {
    throw new Error('useDSAProgress must be used within a DSAProgressProvider');
  }
  return context;
};

interface DSAProgressProviderProps {
  children: ReactNode;
}

export const DSAProgressProvider: React.FC<DSAProgressProviderProps> = ({ children }) => {
  const [myProgress, setMyProgress] = useState<ProgressWithQuestion[]>([]);
  const [currentProgress, setCurrentProgress] = useState<DSAProgress | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitCode = useCallback(async (
    questionId: string,
    data: SubmitCodeDto
  ): Promise<DSAProgress | null> => {
    try {
      setLoading(true);
      setError(null);
      const progress = await dsaProgressApi.submitCode(questionId, data);
      setCurrentProgress(progress);
      
      // Update progress list if it exists
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
      
      return progress;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit code');
      console.error('Error submitting code:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyProgress = useCallback(async (filters?: DSAProgressFilters) => {
    try {
      setLoading(true);
      setError(null);
      const progress = await dsaProgressApi.getMyProgress(filters);
      setMyProgress(progress);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch progress');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dsaProgressApi.getStatistics();
      setStatistics(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentSubmissions = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const submissions = await dsaProgressApi.getRecentSubmissions(limit);
      setRecentSubmissions(submissions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recent submissions');
      console.error('Error fetching recent submissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuestionProgress = useCallback(async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const progress = await dsaProgressApi.getQuestionProgress(questionId);
      setCurrentProgress(progress);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch question progress');
      console.error('Error fetching question progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubmissionHistory = useCallback(async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const progress = await dsaProgressApi.getSubmissionHistory(questionId);
      setCurrentProgress(progress);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch submission history');
      console.error('Error fetching submission history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (questionId: string, data: UpdateProgressDto) => {
    try {
      const progress = await dsaProgressApi.updateProgress(questionId, data);
      setCurrentProgress(progress);
      
      // Update progress list if it exists
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
      console.error('Error updating progress:', err);
    }
  }, []);

  const bookmarkQuestion = useCallback(async (questionId: string, bookmark = true) => {
    try {
      const progress = await dsaProgressApi.bookmarkQuestion(questionId, bookmark);
      setCurrentProgress(progress);
      
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to bookmark question');
      console.error('Error bookmarking question:', err);
    }
  }, []);

  const addNotes = useCallback(async (questionId: string, notes: string) => {
    try {
      const progress = await dsaProgressApi.addNotes(questionId, notes);
      setCurrentProgress(progress);
      
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add notes');
      console.error('Error adding notes:', err);
    }
  }, []);

  const rateQuestion = useCallback(async (questionId: string, rating: number) => {
    try {
      const progress = await dsaProgressApi.rateQuestion(questionId, rating);
      setCurrentProgress(progress);
      
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rate question');
      console.error('Error rating question:', err);
    }
  }, []);

  const likeQuestion = useCallback(async (questionId: string) => {
    try {
      const progress = await dsaProgressApi.likeQuestion(questionId);
      setCurrentProgress(progress);
      
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to like question');
      console.error('Error liking question:', err);
    }
  }, []);

  const dislikeQuestion = useCallback(async (questionId: string) => {
    try {
      const progress = await dsaProgressApi.dislikeQuestion(questionId);
      setCurrentProgress(progress);
      
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dislike question');
      console.error('Error disliking question:', err);
    }
  }, []);

  const recordHint = useCallback(async (questionId: string, data: RecordHintDto) => {
    try {
      const progress = await dsaProgressApi.recordHint(questionId, data);
      setCurrentProgress(progress);
      
      setMyProgress(prev => {
        const index = prev.findIndex(p => p.questionId === questionId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...progress };
          return updated;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record hint');
      console.error('Error recording hint:', err);
    }
  }, []);

  const resetProgress = useCallback(async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await dsaProgressApi.resetProgress(questionId);
      
      setMyProgress(prev => prev.filter(p => p.questionId !== questionId));
      if (currentProgress?.questionId === questionId) {
        setCurrentProgress(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset progress');
      console.error('Error resetting progress:', err);
    } finally {
      setLoading(false);
    }
  }, [currentProgress]);

  const deleteAllProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await dsaProgressApi.deleteAllProgress();
      
      setMyProgress([]);
      setCurrentProgress(null);
      setStatistics(null);
      setRecentSubmissions([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete all progress');
      console.error('Error deleting all progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: DSAProgressContextType = {
    myProgress,
    currentProgress,
    statistics,
    recentSubmissions,
    loading,
    error,
    submitCode,
    fetchMyProgress,
    fetchStatistics,
    fetchRecentSubmissions,
    fetchQuestionProgress,
    fetchSubmissionHistory,
    updateProgress,
    bookmarkQuestion,
    addNotes,
    rateQuestion,
    likeQuestion,
    dislikeQuestion,
    recordHint,
    resetProgress,
    deleteAllProgress,
    clearError,
  };

  return (
    <DSAProgressContext.Provider value={value}>
      {children}
    </DSAProgressContext.Provider>
  );
};

export default DSAProgressContext;
