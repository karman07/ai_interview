import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";
import { useLazyLoading, LoadingState, createLoadingIndicator } from "@/hooks/useLazyLoading";
import { mockLessonsDetail, mockQuizzes } from "@/constants/mockData";

export interface ContentBlock {
  heading: string;
  points: string[];
}

export interface SubLesson {
  _id: string;
  title: string;
  content: ContentBlock[];
  videoUrl?: string;
  order: number;
}

export interface Lesson {
  _id: string;
  subjectId: string;
  title: string;
  description: string;
  content: ContentBlock[];
  videoUrl?: string;
  subLessons: SubLesson[];
  order: number;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface LessonsContextProps {
  lessons: Lesson[];
  quizzes: Record<string, Quiz[]>;
  loadingState: LoadingState;
  quizzesLoadingState: Record<string, LoadingState>;
  error: string | null;
  quizzesError: Record<string, string | null>;
  isLoading: boolean;
  hasRealData: boolean;
  loadingIndicator: ReturnType<typeof createLoadingIndicator>;
  
  fetchLessons: (subjectId: string) => Promise<void>;
  fetchQuizzes: (lessonId: string) => Promise<void>;
  retry: () => void;
  reset: () => void;
}

const LessonsContext = createContext<LessonsContextProps>({
  lessons: [],
  quizzes: {},
  loadingState: LoadingState.IDLE,
  quizzesLoadingState: {},
  error: null,
  quizzesError: {},
  isLoading: false,
  hasRealData: false,
  loadingIndicator: { show: false, message: "", type: "none" },
  fetchLessons: async () => {},
  fetchQuizzes: async () => {},
  retry: () => {},
  reset: () => {},
});

export const useLessons = () => useContext(LessonsContext);

export const LessonsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSubjectId, setCurrentSubjectId] = useState<string>("");
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
  const [quizzesLoadingState, setQuizzesLoadingState] = useState<Record<string, LoadingState>>({});
  const [quizzesError, setQuizzesError] = useState<Record<string, string | null>>({});

  // Lazy loading for lessons
  const fetchLessonsFunction = async (): Promise<Lesson[]> => {
    if (!currentSubjectId) {
      throw new Error("No subject ID provided");
    }
    console.log("📡 Fetching lessons for subject:", currentSubjectId);
    const res = await axios.get<Lesson[]>(`${API_BASE_URL}/lessons/subject/${currentSubjectId}`);
    console.log("✅ Lessons fetched:", res.data);
    return res.data;
  };

  const {
    data: lessons,
    loadingState,
    error,
    isLoading,
    hasRealData,
    load,
    retry,
    reset,
  } = useLazyLoading(fetchLessonsFunction, mockLessonsDetail, {
    showStaticDelay: 1000,
    retryDelay: 3000,
    maxRetries: 3,
    autoLoad: false, // We'll manually trigger loading when subjectId changes
  });

  const fetchLessons = async (subjectId: string) => {
    setCurrentSubjectId(subjectId);
    // Trigger the lazy loading
    await load();
  };

  const fetchQuizzes = async (lessonId: string) => {
    try {
      setQuizzesLoadingState(prev => ({ ...prev, [lessonId]: LoadingState.LOADING }));
      setQuizzesError(prev => ({ ...prev, [lessonId]: null }));

      // Show static data after delay if loading takes too long
      const staticTimeout = setTimeout(() => {
        if (quizzesLoadingState[lessonId] === LoadingState.LOADING) {
          setQuizzesLoadingState(prev => ({ ...prev, [lessonId]: LoadingState.SHOWING_STATIC }));
          setQuizzes(prev => ({ ...prev, [lessonId]: mockQuizzes[lessonId] || [] }));
        }
      }, 1000);

      const res = await axios.get<Quiz[]>(`${API_BASE_URL}/quizzes/lesson/${lessonId}`, {
        withCredentials: true, // 🔹 ensures cookie (refresh_token) is sent
      });

      clearTimeout(staticTimeout);
      setQuizzes(prev => ({ ...prev, [lessonId]: res.data }));
      setQuizzesLoadingState(prev => ({ ...prev, [lessonId]: LoadingState.SUCCESS }));
    } catch (err) {
      console.error("❌ Failed to fetch quizzes", err);
      
      // Set error state and fallback to static data
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch quizzes";
      setQuizzesError(prev => ({ ...prev, [lessonId]: errorMessage }));
      setQuizzesLoadingState(prev => ({ ...prev, [lessonId]: LoadingState.ERROR }));
      setQuizzes(prev => ({ ...prev, [lessonId]: mockQuizzes[lessonId] || [] }));
    }
  };

  const loadingIndicator = createLoadingIndicator(loadingState, error);

  return (
    <LessonsContext.Provider 
      value={{ 
        lessons, 
        quizzes, 
        loadingState,
        quizzesLoadingState,
        error,
        quizzesError,
        isLoading,
        hasRealData,
        loadingIndicator,
        fetchLessons, 
        fetchQuizzes,
        retry,
        reset,
      }}
    >
      {children}
    </LessonsContext.Provider>
  );
};
