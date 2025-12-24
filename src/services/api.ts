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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  // Enhanced Job Management Routes
  createJob: async (formData: FormData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create job');
    }
    return response.json();
  },

  updateJob: async (jobId: string, formData: FormData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update job');
    }
    return response.json();
  },

  deleteJob: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  },

  getMyJobs: async (isActive?: boolean) => {
    const url = isActive !== undefined 
      ? `${API_BASE_URL}/jobs/enhanced/employer?isActive=${isActive}`
      : `${API_BASE_URL}/jobs/enhanced/employer`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to get jobs');
    return response.json();
  },

  getEnhancedDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/dashboard-stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get dashboard stats');
    return response.json();
  },

  // Application Management Routes
  getJobApplications: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}/applications`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get applications');
    return response.json();
  },

  getBestCandidates: async (jobId: string, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}/top-candidates?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get candidates');
    return response.json();
  },

  updateApplicationStatus: async (applicationId: string, status: string, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  getJobAnalytics: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}/analytics`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get job analytics');
    return response.json();
  },

  // Employer Request System Routes
  requestEmployee: async (jobId: string, employeeId: string, message?: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/employer-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId, employeeId, message })
    });
    if (!response.ok) throw new Error('Failed to send request');
    return response.json();
  },

  getMyRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/employer-requests/sent`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get requests');
    return response.json();
  },

  // AI Recommendations
  getRecommendedEmployees: async (jobId: string, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}/recommended-employees?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get recommendations');
    return response.json();
  },

  inviteCandidate: async (jobId: string, candidateId: string, message?: string, autoApply = false) => {
    const response = await fetch(`${API_BASE_URL}/jobs/enhanced/${jobId}/invite-candidate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ candidateId, message, autoApply })
    });
    if (!response.ok) throw new Error('Failed to invite candidate');
    return response.json();
  },

  getReceivedRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/employer-requests/received`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get received requests');
    return response.json();
  },

  respondToRequest: async (requestId: string, status: string, employeeResponse?: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/employer-requests/${requestId}/respond`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, employeeResponse })
    });
    if (!response.ok) throw new Error('Failed to respond to request');
    return response.json();
  }
};
