import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";

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
  loading: boolean;
  fetchLessons: (subjectId: string) => Promise<void>;
  fetchQuizzes: (lessonId: string) => Promise<void>;
}

const LessonsContext = createContext<LessonsContextProps>({
  lessons: [],
  quizzes: {},
  loading: false,
  fetchLessons: async () => {},
  fetchQuizzes: async () => {},
});

export const useLessons = () => useContext(LessonsContext);

export const LessonsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchLessons = async (subjectId: string) => {
    setLoading(true);
    try {
      console.log("📡 Fetching lessons for subject:", subjectId);
      const res = await axios.get<Lesson[]>(`${API_BASE_URL}/lessons/subject/${subjectId}`);
      console.log("✅ Lessons fetched:", res.data);
      setLessons(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch lessons", err);
    } finally {
      setLoading(false);
    }
  };

const fetchQuizzes = async (lessonId: string) => {
  try {
    const res = await axios.get<Quiz[]>(`${API_BASE_URL}/quizzes/lesson/${lessonId}`, {
      withCredentials: true, // 🔹 ensures cookie (refresh_token) is sent
    });
    setQuizzes(prev => ({ ...prev, [lessonId]: res.data }));
  } catch (err) {
    console.error("❌ Failed to fetch quizzes", err);
    setQuizzes(prev => ({ ...prev, [lessonId]: [] })); // fallback to empty
  }
};

  return (
    <LessonsContext.Provider value={{ lessons, quizzes, loading, fetchLessons, fetchQuizzes }}>
      {children}
    </LessonsContext.Provider>
  );
};
