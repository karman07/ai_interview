import React, { createContext, useContext, useState } from "react";
import { ResultsApi } from "@/api/results";
import { InterviewApi } from '@/api/interviews';
import { Result } from "@/types/results";
import { useLazyLoading, LoadingState, createLoadingIndicator } from "@/hooks/useLazyLoading";
import { mockResults } from "@/constants/mockData";

type ResultsState = {
  results: Result[];
  loadingState: LoadingState;
  error: string | null;
  isLoading: boolean;
  isShowingStatic: boolean;
  hasRealData: boolean;
  loadingIndicator: ReturnType<typeof createLoadingIndicator>;
  
  fetchMine: () => Promise<void>;
  submitRun: (dto: any) => Promise<Result>;
  retry: () => void;
  reset: () => void;
};

const ResultsContext = createContext<ResultsState | null>(null);

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [submitLoading, setSubmitLoading] = useState(false);

  // Create the fetch function for lazy loading
  const fetchResults = async (): Promise<Result[]> => {
    const res = await ResultsApi.mine();
    return res.data;
  };

  const {
    data: results,
    loadingState,
    error,
    isLoading,
    isShowingStatic,
    hasRealData,
    load,
    retry: retryLoading,
    reset: resetLoading,
  } = useLazyLoading(fetchResults, mockResults, {
    showStaticDelay: 1000,
    retryDelay: 3000,
    maxRetries: 3,
    autoLoad: false, // We'll manually trigger loading
  });

  const fetchMine = async () => {
    await load();
  };

  const submitRun = async (dto: any): Promise<Result> => {
    try {
      setSubmitLoading(true);
      const res = await InterviewApi.run(dto);
      
      // Refresh results after successful submission
      await fetchMine();
      
      return res.data;
    } finally {
      setSubmitLoading(false);
    }
  };

  const retry = () => {
    retryLoading();
  };

  const reset = () => {
    resetLoading();
  };

  const loadingIndicator = createLoadingIndicator(loadingState, error);

  // Enhance loading indicator to show submit loading as well
  const enhancedLoadingIndicator = {
    ...loadingIndicator,
    show: loadingIndicator.show || submitLoading,
    message: submitLoading ? "Submitting interview..." : loadingIndicator.message,
    type: submitLoading ? "loading" as const : loadingIndicator.type,
  };

  return (
    <ResultsContext.Provider 
      value={{ 
        results,
        loadingState,
        error,
        isLoading: isLoading || submitLoading,
        isShowingStatic,
        hasRealData,
        loadingIndicator: enhancedLoadingIndicator,
        fetchMine, 
        submitRun,
        retry,
        reset,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};

export const useResults = () => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error("useResults must be used within ResultsProvider");
  return ctx;
};
