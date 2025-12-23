const API_BASE_URL = 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    throw new Error('No authentication token found');
  }
  console.log('Using token:', token.substring(0, 20) + '...');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const apiService = {
  // Authentication Routes
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: 'employer' })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  // User Profile Routes
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },

  updateProfile: async (formData: FormData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  // Job Management Routes
  createJob: async (formData: FormData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No token found when creating job');
      throw new Error('No authentication token found. Please login again.');
    }
    console.log('Creating job with token:', token.substring(0, 20) + '...');
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Job creation failed:', error);
      throw new Error(error.message || 'Failed to create job');
    }
    return response.json();
  },

  getMyJobs: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/my-jobs`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get jobs');
    return response.json();
  },

  updateJob: async (jobId: string, formData: FormData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update job');
    }
    return response.json();
  },

  deleteJob: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete job');
    }
    return response.json();
  },

  getAllJobs: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) throw new Error('Failed to get all jobs');
    return response.json();
  },

  // Application Management Routes
  getJobApplications: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get applications');
    return response.json();
  },

  getBestCandidates: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/best-candidates`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get candidates');
    return response.json();
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/applications/${applicationId}/status/${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // Employer Request System Routes
  requestEmployee: async (jobId: string, employeeId: string, message?: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/request-employee`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId, employeeId, message })
    });
    if (!response.ok) throw new Error('Failed to send request');
    return response.json();
  },

  getMyRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/my-requests`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get requests');
    return response.json();
  }
};
