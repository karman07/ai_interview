// src/contexts/SubjectsContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";

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

interface SubjectsContextType {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (q: string) => void;
  levelFilter: string;
  setLevelFilter: (q: string) => void;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

export const SubjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        // 👇 API should return subjects along with lessons inside them
        const res = await axios.get<Subject[]>(`${API_BASE_URL}/subjects?include=lessons`);
        setSubjects(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // 🔎 Filter logic
  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      (sub.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "" || sub.category === categoryFilter;
    const matchesLevel = levelFilter === "" || sub.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <SubjectsContext.Provider
      value={{
        subjects: filteredSubjects,
        loading,
        error,
        search,
        setSearch,
        categoryFilter,
        setCategoryFilter,
        levelFilter,
        setLevelFilter,
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
