import http from './http';
import { User } from '@/types/user';

export interface ResumeHistory {
    _id: string;
    filename: string;
    resumeUrl: string;
    jdText?: string;
    timestamp: string;
}

export const ResumeApi = {
    /**
     * Upload a PDF/Word resume for AI analysis.
     */
    upload: async (file: File, jdText?: string): Promise<User> => {
        const form = new FormData();
        form.append('resume', file);
        if (jdText) form.append('jdText', jdText);

        const { data } = await http.post<User>('/resume/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /**
     * Get history of uploaded resumes.
     */
    list: async (): Promise<ResumeHistory[]> => {
        const { data } = await http.get<ResumeHistory[]>('/resume');
        return data;
    },

    /**
     * Delete a specific resume record.
     */
    delete: async (id: string): Promise<{ success: boolean }> => {
        const { data } = await http.delete(`/resume/${id}`);
        return data;
    },
};
