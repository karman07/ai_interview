import axios from './http';

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  employerId: string;
  employer: {
    name: string;
    email: string;
    company?: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  employeeId: string;
  coverLetter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  employee: {
    name: string;
    email: string;
    resumeUrl?: string;
    profileImageUrl?: string;
  };
  createdAt: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
}

export interface ApplyJobRequest {
  coverLetter?: string;
}

export interface BestCandidate {
  applicationId: string;
  employee: {
    name: string;
    email: string;
    resumeUrl?: string;
    profileImageUrl?: string;
  };
  score: number;
  matchingSkills: string[];
  coverLetter?: string;
}

// Job browsing (Public)
export const getAllJobs = async (): Promise<Job[]> => {
  const response = await axios.get('/jobs');
  return response.data;
};

export const getJobById = async (jobId: string): Promise<Job> => {
  const response = await axios.get(`/jobs/${jobId}`);
  return response.data;
};

// Job application (Employee only)
export const applyForJob = async (jobId: string, data: ApplyJobRequest): Promise<void> => {
  await axios.post(`/jobs/${jobId}/apply`, data);
};

// Job creation (Employer only)
export const createJob = async (data: CreateJobRequest): Promise<Job> => {
  const response = await axios.post('/jobs', data);
  return response.data;
};

// Employer job management
export const getMyJobs = async (): Promise<Job[]> => {
  const response = await axios.get('/jobs/my-jobs');
  return response.data;
};

export const updateJob = async (jobId: string, data: Partial<CreateJobRequest>): Promise<Job> => {
  const response = await axios.patch(`/jobs/${jobId}`, data);
  return response.data;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await axios.delete(`/jobs/${jobId}`);
};

// Job applications management (Employer only)
export const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  const response = await axios.get(`/jobs/${jobId}/applications`);
  return response.data;
};

export const getBestCandidates = async (jobId: string): Promise<BestCandidate[]> => {
  const response = await axios.get(`/jobs/${jobId}/best-candidates`);
  return response.data;
};

export const acceptApplication = async (applicationId: string): Promise<void> => {
  await axios.patch(`/jobs/applications/${applicationId}/status/accepted`);
};

export const rejectApplication = async (applicationId: string): Promise<void> => {
  await axios.patch(`/jobs/applications/${applicationId}/status/rejected`);
};

// Employee application tracking
export const getMyApplications = async (): Promise<JobApplication[]> => {
  const response = await axios.get('/jobs/my-applications');
  return response.data;
};