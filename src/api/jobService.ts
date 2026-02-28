import axios from 'axios';
import { Job, JobListResponse, ResumeMatchRequest, MatchResultResponse } from '../types/job';
export type { Job, JobListResponse, ResumeMatchRequest, MatchResultResponse };

const API_URL = import.meta.env.VITE_JOB_API_URL || 'http://localhost:8080'; // Recruitment Backend Service URL

// Create a dedicated axios instance for Job Service to avoid conflicts with main app auth interceptors
const jobApiClient = axios.create({
  baseURL: API_URL,
});

export const fetchJobs = async (params: any = {}): Promise<JobListResponse> => {
  const queryParams = new URLSearchParams();
  if (params.location) queryParams.append('location', params.location);
  if (params.min_stipend) queryParams.append('min_stipend', params.min_stipend.toString());
  if (params.remote !== undefined) queryParams.append('remote', params.remote.toString());
  if (params.internship !== undefined) queryParams.append('internship', params.internship.toString());
  if (params.skip) queryParams.append('skip', params.skip.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.engineering_type) queryParams.append('branch_type', params.engineering_type);

  try {
    console.log(`[jobService] Fetching jobs from ${API_URL}/jobs with params:`, params);
    const response = await jobApiClient.get(`/jobs?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("fetchJobs Error:", error);
    throw error;
  }
};

export const getEngineeringTypes = async (): Promise<string[]> => {
  try {
    const response = await jobApiClient.get(`/jobs/engineering-types`);
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
    const response = await jobApiClient.get(`/jobs/locations`);
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
    const response = await jobApiClient.get(`/jobs/${jobId}`);
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
    console.log(`[jobService] Toggling favorite for jobId: ${jobId}, userId: ${userId}`);
    const response = await jobApiClient.post(`/${jobId}/favorite`, { user_id: userId });
    console.log(`[jobService] Toggle response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("toggleFavoriteJob Error:", error);
    throw error;
  }
};

export const fetchFavoriteJobs = async (userId: string): Promise<JobListResponse> => {
  try {
    console.log(`[jobService] Fetching favorites for userId: ${userId}`);
    const response = await jobApiClient.get(`/favorites?user_id=${userId}`);
    console.log(`[jobService] Fetch response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("fetchFavoriteJobs Error:", error);
    throw error;
  }
};

// --- Bookmarks API ---

export const toggleBookmarkJob = async (jobId: string, userId: string): Promise<UserJobInteractionResponse> => {
  try {
    console.log(`[jobService] Toggling bookmark for jobId: ${jobId}, userId: ${userId}`);
    const response = await jobApiClient.post(`/${jobId}/bookmark`, { user_id: userId });
    console.log(`[jobService] Toggle response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("toggleBookmarkJob Error:", error);
    throw error;
  }
};

export const fetchBookmarkJobs = async (userId: string): Promise<JobListResponse> => {
  try {
    console.log(`[jobService] Fetching bookmarks for userId: ${userId}`);
    const response = await jobApiClient.get(`/bookmarks?user_id=${userId}`);
    console.log(`[jobService] Fetch response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("fetchBookmarkJobs Error:", error);
    throw error;
  }
};