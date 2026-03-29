import http from './http';

export interface KnowledgeTopic {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  logoUrl?: string;
  jdFileId?: string;
  jdFileName?: string;
}

export interface KnowledgeDocument {
  _id: string;
  topicId: string;
  fileName: string;
  originalName: string;
  status: 'indexing' | 'indexed' | 'error';
  chunkCount?: number;
}

export const knowledgeApi = {
  getTopics: () => http.get<KnowledgeTopic[]>('/knowledge/topics'),
  createTopic: (data: Partial<KnowledgeTopic>) => http.post<KnowledgeTopic>('/knowledge/topics', data),
  updateTopic: (id: string, data: Partial<KnowledgeTopic>) => http.patch<KnowledgeTopic>(`/knowledge/topics/${id}`, data),
  deleteTopic: (id: string) => http.delete(`/knowledge/topics/${id}`),
  
  getDocuments: (topicId: string) => http.get<KnowledgeDocument[]>(`/knowledge/topics/${topicId}/documents`),
  uploadDocument: (topicId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<KnowledgeDocument>(`/knowledge/topics/${topicId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadJd: (topicId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<KnowledgeDocument>(`/knowledge/topics/${topicId}/jd`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadLogo: (topicId: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return http.post<{ logoUrl: string }>(`/knowledge/topics/${topicId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (id: string) => http.delete(`/knowledge/documents/${id}`),
  getViewUrl: (id: string) => `/knowledge/documents/${id}/view`,
};
