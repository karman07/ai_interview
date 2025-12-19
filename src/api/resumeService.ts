import http from './http';
import { Resume } from '@/types/Resume';

export const resumeService = {
  getResumes: async (): Promise<Resume[]> => {
    const res = await http.get('/resume/history');
    return res.data;
  },
  /**
   * Upload resume and optional JD file, with optional JD text
   * @param files Array of File objects: [resumeFile, jdFile?]
   * @param jdText Optional JD text
   */
  uploadResume: async (files: File[], jdText?: string) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (jdText) formData.append('jd_text', jdText);
    const res = await http.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.resume as Resume;
  },
  
  improveResume: async (resumeId: string, jdText?: string, jdFile?: File) => {
    console.log('Improving resume:', { resumeId, jdText: !!jdText, jdFile: !!jdFile });
    
    const formData = new FormData();
    if (jdText) {
      formData.append('jd_text', jdText);
      console.log('Added JD text to form data');
    }
    if (jdFile) {
      formData.append('files', jdFile);
      console.log('Added JD file to form data:', jdFile.name, jdFile.size);
    }
    
    try {
      const res = await http.patch(`/resume/improve/${resumeId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Improve resume response:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Improve resume error:', error.response?.data || error.message);
      throw error;
    }
  },
};
