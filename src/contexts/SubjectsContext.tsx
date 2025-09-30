// src/contexts/SubjectsContext.tsx
import React, { createContext, useContext } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";
import { useLazyFilteredData, LoadingState, createLoadingIndicator } from "@/hooks/useLazyLoading";
import { mockSubjects } from "@/constants/mockData";

export interface Lesson {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  estimatedTime?: string;
  author?: string;
  status?: "draft" | "published";
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;

  // 👇 Add lessons array
  lessons?: Lesson[];
}

interface SubjectsFilters {
  search: string;
  categoryFilter: string;
  levelFilter: string;
}

interface SubjectsContextType {
  subjects: Subject[];
  rawSubjects: Subject[];
  filters: SubjectsFilters;
  loadingState: LoadingState;
  error: string | null;
  retryCount: number;
  isLoading: boolean;
  isShowingStatic: boolean;
  isSuccess: boolean;
  isError: boolean;
  hasRealData: boolean;
  loadingIndicator: ReturnType<typeof createLoadingIndicator>;
  
  // Filter methods
  setSearch: (q: string) => void;
  setCategoryFilter: (q: string) => void;
  setLevelFilter: (q: string) => void;
  updateFilter: (key: keyof SubjectsFilters, value: string) => void;
  resetFilters: () => void;
  
  // Loading methods
  load: () => void;
  retry: () => void;
  reset: () => void;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

// Filter function for subjects
const filterSubjects = (subjects: Subject[], filters: SubjectsFilters): Subject[] => {
  return subjects.filter((subject) => {
    const matchesSearch =
      subject.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (subject.description || "").toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.categoryFilter === "" || subject.category === filters.categoryFilter;
    const matchesLevel = filters.levelFilter === "" || subject.level === filters.levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });
};

export const SubjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fetchSubjects = async (): Promise<Subject[]> => {
    // 👇 API should return subjects along with lessons inside them
    const res = await axios.get<Subject[]>(`${API_BASE_URL}/subjects?include=lessons`);
    return res.data;
  };

  const initialFilters: SubjectsFilters = {
    search: "",
    categoryFilter: "",
    levelFilter: "",
  };

  const {
    data: subjects,
    rawData: rawSubjects,
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
  } = useLazyFilteredData(
    fetchSubjects,
    mockSubjects,
    filterSubjects,
    initialFilters,
    {
      showStaticDelay: 1000,
      retryDelay: 3000,
      maxRetries: 3,
      autoLoad: true,
    }
  );

  // Convenience setters for individual filters
  const setSearch = (search: string) => updateFilter("search", search);
  const setCategoryFilter = (categoryFilter: string) => updateFilter("categoryFilter", categoryFilter);
  const setLevelFilter = (levelFilter: string) => updateFilter("levelFilter", levelFilter);

  const loadingIndicator = createLoadingIndicator(loadingState, error);

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        rawSubjects,
        filters,
        loadingState,
        error,
        retryCount,
        isLoading,
        isShowingStatic,
        isSuccess,
        isError,
        hasRealData,
        loadingIndicator,
        setSearch,
        setCategoryFilter,
        setLevelFilter,
        updateFilter,
        resetFilters,
        load,
        retry,
        reset,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
};

export const useSubjects = () => {
  const ctx = useContext(SubjectsContext);
  if (!ctx) throw new Error("useSubjects must be inside SubjectsProvider");
  return ctx;
};
