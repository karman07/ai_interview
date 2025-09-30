import { useEffect, useState, useRef } from "react";

// Loading states enum
export enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  SHOWING_STATIC = "showing_static", 
  SUCCESS = "success",
  ERROR = "error",
}

// Hook for managing lazy loading with static fallback
export function useLazyLoading<T>(
  fetchFunction: () => Promise<T>,
  staticData: T,
  options?: {
    showStaticDelay?: number;
    retryDelay?: number;
    maxRetries?: number;
    autoLoad?: boolean;
  }
) {
  const {
    showStaticDelay = 1000,
    retryDelay = 3000,
    maxRetries = 3,
    autoLoad = true
  } = options || {};

  const [data, setData] = useState<T>(staticData);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const load = async (force = false) => {
    if (loadingState === LoadingState.LOADING && !force) return;

    setLoadingState(LoadingState.LOADING);
    setError(null);

    // Set timer to show static data if loading takes too long
    timeoutRef.current = setTimeout(() => {
      if (loadingState === LoadingState.LOADING) {
        setLoadingState(LoadingState.SHOWING_STATIC);
        setData(staticData);
      }
    }, showStaticDelay);

    try {
      const result = await fetchFunction();
      
      // Clear timeout since we got real data
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setData(result);
      setLoadingState(LoadingState.SUCCESS);
      setRetryCount(0);
    } catch (err) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      setLoadingState(LoadingState.ERROR);

      // Show static data as fallback
      setData(staticData);

      // Auto-retry logic
      if (retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          load(true);
        }, retryDelay);
      }
    }
  };

  const retry = () => {
    setRetryCount(0);
    load(true);
  };

  const reset = () => {
    setData(staticData);
    setLoadingState(LoadingState.IDLE);
    setError(null);
    setRetryCount(0);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
  };

  useEffect(() => {
    if (autoLoad) {
      load();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  return {
    data,
    loadingState,
    error,
    retryCount,
    isLoading: loadingState === LoadingState.LOADING,
    isShowingStatic: loadingState === LoadingState.SHOWING_STATIC,
    isSuccess: loadingState === LoadingState.SUCCESS,
    isError: loadingState === LoadingState.ERROR,
    hasRealData: loadingState === LoadingState.SUCCESS,
    load,
    retry,
    reset,
  };
}

// Hook for managing filtered data with lazy loading
export function useLazyFilteredData<T, F = Record<string, any>>(
  fetchFunction: () => Promise<T[]>,
  staticData: T[],
  filterFunction: (items: T[], filters: F) => T[],
  initialFilters: F,
  options?: Parameters<typeof useLazyLoading>[2]
) {
  const [filters, setFilters] = useState<F>(initialFilters);
  
  const {
    data: rawData,
    loadingState,
    error,
    retryCount,
    isLoading,
    isShowingStatic,
    isSuccess,
    isError,
    hasRealData,
    load,
    retry,
    reset,
  } = useLazyLoading(fetchFunction, staticData, options);

  const filteredData = filterFunction(rawData, filters);

  const updateFilter = (key: keyof F, value: F[keyof F]) => {
    setFilters((prev: F) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    data: filteredData,
    rawData,
    filters,
    loadingState,
    error,
    retryCount,
    isLoading,
    isShowingStatic,
    isSuccess,
    isError,
    hasRealData,
    load,
    retry,
    reset,
    updateFilter,
    resetFilters,
    setFilters,
  };
}

// Utility function to create loading indicators
export const createLoadingIndicator = (loadingState: LoadingState, error?: string | null) => {
  switch (loadingState) {
    case LoadingState.LOADING:
      return {
        show: true,
        message: "Loading...",
        type: "loading" as const,
      };
    case LoadingState.SHOWING_STATIC:
      return {
        show: true,
        message: "Showing sample data while loading...",
        type: "static" as const,
      };
    case LoadingState.ERROR:
      return {
        show: true,
        message: error || "Failed to load data",
        type: "error" as const,
      };
    default:
      return {
        show: false,
        message: "",
        type: "none" as const,
      };
  }
};

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}