import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://api.aiforjob.ai';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`
});

export const employeeService = {
  getProfile: () => axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeaders() }),

  getMyApplications: () => axios.get(`${API_BASE}/jobs/applications/my`, { headers: getAuthHeaders() }),

  getUnreadCount: () => axios.get(`${API_BASE}/chat/unread/count`, { headers: getAuthHeaders() }),

  getAnalytics: (userId: string) => axios.get(`${API_BASE}/interview-rounds/analytics/${userId}`, { headers: getAuthHeaders() }),

  getJobs: () => axios.get(`${API_BASE}/jobs`, { headers: getAuthHeaders() }),

  getJobById: (jobId: string) => axios.get(`${API_BASE}/jobs/${jobId}`, { headers: getAuthHeaders() }),

  applyToJob: (jobId: string, applicationData: any) => axios.post(`${API_BASE}/jobs/${jobId}/apply`, applicationData, { headers: getAuthHeaders() })
};
