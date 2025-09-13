import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";

export interface Progress {
  _id: string;
  userId: string;
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  progressPercent: number;
  score?: number;
  timeSpent: number;
  lastAccessed: string;
  badges: string[];
  notes?: string;
}

interface ProgressContextType {
  progress: Progress[];
  loading: boolean;
  error: string | null;
  refreshProgress: () => void;
  getProgressForLesson: (lessonId: string) => Progress | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token"); 
      const res = await axios.get(`${API_BASE_URL}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgress(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const getProgressForLesson = (lessonId: string): Progress | null => {
    const entry = progress.find((p) => p.lessonId === lessonId);
    if (!entry) {
      return {
        _id: "temp",
        userId: "temp",
        lessonId,
        status: "not-started",
        progressPercent: 0,
        score: 0,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        badges: [],
        notes: "",
      };
    }
    return entry;
  };

  return (
    <ProgressContext.Provider
      value={{ progress, loading, error, refreshProgress: fetchProgress, getProgressForLesson }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider");
  return context;
};
