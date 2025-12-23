import { useState, useEffect } from 'react';
import { Briefcase, Users, FileText, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export const DashboardOverview = ({ onSectionChange }: DashboardOverviewProps) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, requestsData] = await Promise.all([
          apiService.getMyJobs().catch(() => []),
          apiService.getMyRequests().catch(() => [])
        ]);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setJobs([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeJobs = Array.isArray(jobs) ? jobs.filter((job: any) => job.isActive).length : 0;
  const totalApplications = Array.isArray(jobs) ? jobs.reduce((sum: number, job: any) => sum + (job.applicationCount || 0), 0) : 0;
  const pendingRequests = Array.isArray(requests) ? requests.filter((req: any) => req.status === 'pending').length : 0;

  return (
    <div className="space-y-8">
      {/* <AuthDebug /> */}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your jobs and applications
          </p>
        </div>
        <button
          onClick={() => onSectionChange('jobs')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Jobs</h2>
            <button
              onClick={() => onSectionChange('jobs')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {Array.isArray(jobs) && jobs.slice(0, 3).map((job: any) => (
              <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.applicationCount || 0} applications
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {job.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Requests</h2>
            <button
              onClick={() => onSectionChange('requests')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {Array.isArray(requests) && requests.slice(0, 3).map((request: any) => (
              <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{request.employeeId?.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.jobId?.title}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'accepted' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : request.status === 'rejected'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};