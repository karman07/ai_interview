import React, { createContext, useContext, useState, useEffect } from "react";
import { Resume } from "@/types/Resume";
import { resumeService } from "@/api/resumeService";
import { useAuth } from "@/contexts/AuthContext";

interface ResumeContextType {
  resumes: Resume[];
  fetchResumes: () => Promise<void>;
  /**
   * Upload resume and optional JD file/text
   * @param files Array of File objects: [resumeFile, jdFile?]
   * @param jdText Optional JD text
   * @returns The uploaded resume with analytics
   */
  uploadResume: (files: File[], jdText?: string) => Promise<Resume>;
  isLoading: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchResumes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (files: File[], jdText?: string): Promise<Resume> => {
    if (!user) throw new Error('User not authenticated');
    setIsLoading(true);
    try {
      const newResume = await resumeService.uploadResume(files, jdText);
      setResumes((prev) => [newResume, ...prev]);
      return newResume;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line
  }, [user]);

  return (
    <ResumeContext.Provider value={{ resumes, fetchResumes, uploadResume, isLoading }}>
      {children}
    </ResumeContext.Provider>
  );
}
