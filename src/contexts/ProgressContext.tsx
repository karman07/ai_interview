import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "@/api/http";
import { API_BASE_URL } from "@/api/http";
import { useAuth } from "@/contexts/AuthContext";

export interface Progress {
  _id: string;
  userId?: string;
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  progressPercent: number;
  score?: number;
  timeSpent: number;
  lastAccessed: string;
  badges?: string[];
  notes?: string;
}

interface ProgressContextType {
  progress: Progress[];
  loading: boolean;
  error: string | null;
  refreshProgress: () => void;
  getProgressForLesson: (lessonId: string) => Progress | null;
  updateProgress: (lessonId: string, status: Progress["status"], progressPercent: number, score?: number) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "ai_interview_progress";

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load from localStorage on initial mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Failed to parse local progress", e);
      }
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/progress`);
      const apiProgress = res.data.data || res.data || [];

      setProgress(prevProgress => {
        // Merge API progress with local progress
        // API progress takes precedence for logged in users
        const mergedMap = new Map<string, Progress>();

        // Start with local progress
        prevProgress.forEach(p => mergedMap.set(p.lessonId, p));

        // Override/Add with API progress
        apiProgress.forEach((p: Progress) => mergedMap.set(p.lessonId, p));

        const merged = Array.from(mergedMap.values());
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load progress from server");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = async (
    lessonId: string,
    status: Progress["status"],
    progressPercent: number,
    score?: number
  ) => {
    const newEntry: Progress = {
      _id: "temp-" + Date.now(),
      lessonId,
      status,
      progressPercent: Math.round(progressPercent),
      score,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
    };

    // Update local state and localStorage immediately (Optimistic)
    setProgress(prev => {
      const idx = prev.findIndex(p => p.lessonId === lessonId);
      let updated;
      if (idx > -1) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...newEntry, _id: updated[idx]._id };
      } else {
        updated = [...prev, newEntry];
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Sync with API if user is logged in
    if (user) {
      try {
        await axios.post(`${API_BASE_URL}/progress`, {
          lessonId,
          status,
          progressPercent: Math.round(progressPercent),
          score: score || null,
          timeSpent: 0
        });
      } catch (err) {
        console.error("Failed to sync progress with server", err);
      }
    }
  };

  const getProgressForLesson = (lessonId: string): Progress | null => {
    const entry = progress.find((p) => p.lessonId === lessonId);
    if (!entry) {
      return {
        _id: "temp",
        lessonId,
        status: "not-started",
        progressPercent: 0,
        score: 0,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
      };
    }
    return entry;
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        error,
        refreshProgress: fetchProgress,
        getProgressForLesson,
        updateProgress
      }}
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
