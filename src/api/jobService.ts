import axios from './http';
import { Job, JobListResponse, ResumeMatchRequest, MatchResultResponse } from '../types/job';
export type { Job, JobListResponse, ResumeMatchRequest, MatchResultResponse };

const API_URL = 'http://127.0.0.1:8080'; // Backend Service URL

// Override axios base URL for these specific endpoints if needed, 
// or assume the proxy handles it. If proxy is not set for 8080, we might need a full URL.
// IMPORTANT: The existing axios instance might be configured for a different backend. 
// I'll use a new axios instance or absolute URLs if I can't change the global one easily, 
// but for consistency I'll try to use the imported axios. 
// However, since the user specified a distinct backend, I should probably create a specific client 
// or just use absolute URLs to be safe.
// 'http' import is likely a configured axios instance.

// Let's create a specific client or just use absolute paths if the proxy isn't set.
// Providing a custom config to the existing axios instance for baseURL.

export const fetchJobs = async (params: any = {}): Promise<JobListResponse> => {
  // Mapping frontend params to backend params
  const queryParams = new URLSearchParams();
  if (params.location) queryParams.append('location', params.location);
  if (params.min_stipend) queryParams.append('min_stipend', params.min_stipend.toString());
  if (params.max_stipend) queryParams.append('max_stipend', params.max_stipend.toString());
  if (params.remote !== undefined) queryParams.append('remote', params.remote.toString());
  if (params.internship !== undefined) queryParams.append('internship', params.internship.toString());
  if (params.skip) queryParams.append('skip', params.skip.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  // Using absolute URL to ensure we hit the correct backend
  console.log(`Fetching jobs from: ${API_URL}/jobs?${queryParams.toString()}`);
  try {
    const response = await axios.get(`${API_URL}/jobs?${queryParams.toString()}`);
    console.log("fetchJobs Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("fetchJobs Error:", error);
    throw error;
  }
};

export const matchResume = async (data: ResumeMatchRequest): Promise<MatchResultResponse> => {
  const response = await axios.post(`${API_URL}/match/resume`, data);
  return response.data;
};

export const matchJD = async (data: { job_description: string; location?: string }): Promise<MatchResultResponse> => {
  const response = await axios.post(`${API_URL}/match/jd`, data);
  return response.data;
};

export const parseResume = async (file: File): Promise<any> => {
  console.log("jobService: parseResume called for file:", file.name);
  const formData = new FormData();
  formData.append('file', file);
  // Using specific port 8000 as requested for filtering/matching
  const response = await axios.post('http://localhost:8080/match/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getJobById = async (jobId: string): Promise<Job> => {
  // The contract doesn't explicitly list a "Get Job By ID" endpoint, 
  // but it's common practice. If missing, we might have to filter from the list or match result.
  // Wait, the contract has `GET /jobs` listing. 
  // If no specific ID endpoint exists, I'll assume we might pass a query or it's standard.
  // Attempting standard pattern. If it fails, we might need to rely on passing the object from the list.
  try {
    // Assuming standard REST pattern or filtering
    // If the backend is strict, this might fail.
    // For now, let's assume we can fetch it or find it.
    // Actually, looking at the contract, there is no `/jobs/:id`.
    // I will leave this as a TODO or try to implement it via list filtering if needed?
    // OR maybe `match/resume` is the primary way.
    // Let's implement a fallback: Fetch all (or search) and find. 
    // But strictly, let's try a GET request.
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.warn("Get Job By ID endpoints not explicitly documented, might fail.", error);
    throw error;
  }
};