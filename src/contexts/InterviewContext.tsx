import React, { createContext, useContext, useState } from "react";
import { CreateInterviewDto } from "@/api/interviews";
import { InterviewApi } from "@/api/interviews";
import { useLazyLoading, LoadingState, createLoadingIndicator } from "@/hooks/useLazyLoading";
import { mockInterviewQuestions } from "@/constants/mockData";

export type InterviewQuestion = { question: string; options?: string[]; answer?: string };

type InterviewState = {
  draft: CreateInterviewDto | null;
  generatedQuestions: InterviewQuestion[] | null;
  loadingState: LoadingState;
  error: string | null;
  isLoading: boolean;
  isShowingStatic: boolean;
  hasRealData: boolean;
  loadingIndicator: ReturnType<typeof createLoadingIndicator>;
  
  setDraft: (d: CreateInterviewDto) => void;
  generateQuestions: (d?: CreateInterviewDto) => Promise<InterviewQuestion[]>;
  retry: () => void;
  reset: () => void;
};

const InterviewContext = createContext<InterviewState | null>(null);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraftState] = useState<CreateInterviewDto | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[] | null>(null);

  // Create the fetch function for lazy loading
  const fetchQuestions = async (): Promise<InterviewQuestion[]> => {
    if (!draft) throw new Error("No draft interview");

    const res = await InterviewApi.generate(draft);
    // backend returns { raw, structured }
    const structured = res.data?.structured ?? res.data;
    const questions = structured?.questions ?? structured?.generatedQuestions ?? [];

    // Normalize: accept array of {question, options?, answer?} or strings
    const normalized: InterviewQuestion[] = questions.map((q: string | InterviewQuestion) =>
      typeof q === "string" ? { question: q } : q
    );

    return normalized;
  };

  const {
    data: lazyQuestions,
    loadingState,
    error,
    isLoading,
    isShowingStatic,
    hasRealData,
    load,
    retry: retryLoading,
    reset: resetLoading,
  } = useLazyLoading(fetchQuestions, mockInterviewQuestions, {
    showStaticDelay: 1000,
    retryDelay: 3000,
    maxRetries: 3,
    autoLoad: false, // We'll manually trigger loading
  });

  const setDraft = (d: CreateInterviewDto) => {
    setDraftState(d);
  };

  const generateQuestions = async (d?: CreateInterviewDto): Promise<InterviewQuestion[]> => {
    const payload = d ?? draft;
    if (!payload) throw new Error("No draft interview");

    // Update draft first
    setDraftState(payload);

    try {
      // Trigger lazy loading
      await load();
      
      // Update generated questions with real data if successful
      if (hasRealData) {
        setGeneratedQuestions(lazyQuestions);
        setDraftState({ ...payload, questions: lazyQuestions.map((q) => q.question) });
        return lazyQuestions;
      } else {
        // Fallback to static data
        setGeneratedQuestions(mockInterviewQuestions);
        setDraftState({ ...payload, questions: mockInterviewQuestions.map((q) => q.question) });
        return mockInterviewQuestions;
      }
    } catch (err) {
      // On error, use static data as fallback
      setGeneratedQuestions(mockInterviewQuestions);
      setDraftState({ ...payload, questions: mockInterviewQuestions.map((q) => q.question) });
      return mockInterviewQuestions;
    }
  };

  const retry = () => {
    retryLoading();
  };

  const reset = () => {
    setDraftState(null);
    setGeneratedQuestions(null);
    resetLoading();
  };

  const loadingIndicator = createLoadingIndicator(loadingState, error);

  // Use real data if available, otherwise use generated questions or fallback to static
  const currentQuestions = hasRealData ? lazyQuestions : (generatedQuestions || mockInterviewQuestions);

  return (
    <InterviewContext.Provider 
      value={{ 
        draft, 
        generatedQuestions: currentQuestions,
        loadingState,
        error,
        isLoading,
        isShowingStatic,
        hasRealData,
        loadingIndicator,
        setDraft, 
        generateQuestions, 
        retry,
        reset 
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be used within InterviewProvider");
  return ctx;
};
