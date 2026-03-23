import axios from 'axios';
import { tokenStore } from './http';
import { Job, JobListResponse, ResumeMatchRequest, MatchResultResponse } from '../types/job';
export type { Job, JobListResponse, ResumeMatchRequest, MatchResultResponse };

const API_URL = import.meta.env.VITE_JOB_API_URL || 'http://localhost:8080';

// Persist job results in localStorage — TTL ~2.5 days so API is hit ≤3×/week
const CACHE_TTL_MS = 2.5 * 24 * 60 * 60 * 1000; // 60 hours
const LS_PREFIX = 'jobs_cache_';

function lsGet(key: string): JobListResponse | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { localStorage.removeItem(LS_PREFIX + key); return null; }
    return data as JobListResponse;
  } catch { return null; }
}

function lsSet(key: string, data: JobListResponse): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS }));
  } catch { /* storage full — skip caching */ }
}

// Create a dedicated axios instance for Job Service
const jobApiClient = axios.create({
  baseURL: `${API_URL}/jobs`,
});

// Add auth interceptor for Job Service
jobApiClient.interceptors.request.use((config) => {
  const token = tokenStore.get() || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchJobs = async (params: any = {}): Promise<JobListResponse> => {
  const queryParams = new URLSearchParams();
  if (params.location) queryParams.append('location', params.location);
  if (params.country) queryParams.append('country', params.country);
  if (params.min_stipend) queryParams.append('min_stipend', params.min_stipend.toString());
  if (params.remote !== undefined) queryParams.append('remote', params.remote.toString());
  if (params.internship !== undefined) queryParams.append('internship', params.internship.toString());
  if (params.skip) queryParams.append('skip', params.skip.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.engineering_type) queryParams.append('branch_type', params.engineering_type);

  const cacheKey = queryParams.toString();
  const cached = lsGet(cacheKey);
  if (cached) return cached;

  try {
    const response = await jobApiClient.get(`?${cacheKey}`);
    lsSet(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('fetchJobs Error:', error);
    throw error;
  }
};

export const getEngineeringTypes = async (): Promise<string[]> => {
  try {
    const response = await jobApiClient.get(`/engineering-types`);
    if (response.data && Array.isArray(response.data.engineering_types)) {
      return response.data.engineering_types;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.types)) {
      return response.data.types;
    }
    return [];
  } catch (error) {
    console.error("getEngineeringTypes Error:", error);
    return [];
  }
};

export const getLocations = async (): Promise<string[]> => {
  try {
    const response = await jobApiClient.get(`/locations`);
    if (response.data && Array.isArray(response.data.locations)) {
      return response.data.locations;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("getLocations Error:", error);
    return [];
  }
};

export const getCountries = async (): Promise<string[]> => {
  try {
    const response = await jobApiClient.get(`/countries`);
    if (response.data && Array.isArray(response.data.countries)) {
      return response.data.countries;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("getCountries Error:", error);
    return [];
  }
};

export const matchResume = async (data: ResumeMatchRequest): Promise<MatchResultResponse> => {
  const response = await jobApiClient.post(`/match/resume`, data);
  return response.data;
};

export const matchJD = async (data: { job_description: string; location?: string }): Promise<MatchResultResponse> => {
  const response = await jobApiClient.post(`/match/jd`, data);
  return response.data;
};

export const parseResume = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await jobApiClient.post(`/match/resume/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getJobById = async (jobId: string): Promise<Job> => {
  try {
    const response = await jobApiClient.get(`/${jobId}`);
    return response.data;
  } catch (error) {
    console.warn("Get Job By ID failed", error);
    throw error;
  }
};

// --- Favorites API ---

export interface UserJobInteractionResponse {
  message: string;
  status: string;
  is_active: boolean;
}

export const toggleFavoriteJob = async (jobId: string, userId: string): Promise<UserJobInteractionResponse> => {
  try {
    const response = await jobApiClient.post(`/${jobId}/favorite`, { user_id: userId });
    return response.data;
  } catch (error) {
    console.error("toggleFavoriteJob Error:", error);
    throw error;
  }
};

export const fetchFavoriteJobs = async (userId: string): Promise<JobListResponse> => {
  try {
    const response = await jobApiClient.get(`/favorites?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error("fetchFavoriteJobs Error:", error);
    throw error;
  }
};

// --- Bookmarks API ---

export const toggleBookmarkJob = async (jobId: string, userId: string): Promise<UserJobInteractionResponse> => {
  try {
    const response = await jobApiClient.post(`/${jobId}/bookmark`, { user_id: userId });
    return response.data;
  } catch (error) {
    console.error("toggleBookmarkJob Error:", error);
    throw error;
  }
};

export const fetchBookmarkJobs = async (userId: string): Promise<JobListResponse> => {
  try {
    const response = await jobApiClient.get(`/bookmarks?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error("fetchBookmarkJobs Error:", error);
    throw error;
  }
};