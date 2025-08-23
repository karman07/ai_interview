import http from './http';
import { Resume } from '@/types/Resume';

export const resumeService = {
  getResumes: async (): Promise<Resume[]> => {
    const res = await http.get('/resume/history');
    return res.data;
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await http.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.resume as Resume;
  },
};
