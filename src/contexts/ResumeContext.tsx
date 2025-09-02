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
   */
  uploadResume: (files: File[], jdText?: string) => Promise<void>;
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

  const fetchResumes = async () => {
    if (!user) return;
    const data = await resumeService.getResumes();
    setResumes(data);
  };

  const uploadResume = async (files: File[], jdText?: string) => {
    if (!user) return;
    const newResume = await resumeService.uploadResume(files, jdText);
    setResumes((prev) => [newResume, ...prev]);
  };

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line
  }, [user]);

  return (
    <ResumeContext.Provider value={{ resumes, fetchResumes, uploadResume }}>
      {children}
    </ResumeContext.Provider>
  );
}
