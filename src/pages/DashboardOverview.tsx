import { useState, useEffect } from 'react';
import { Briefcase, FileText, Plus, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export const DashboardOverview = ({ onSectionChange }: DashboardOverviewProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardStats = await apiService.getEnhancedDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
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

  const activeJobs = stats?.activeJobs || 0;
  const totalApplications = stats?.totalApplications || 0;
  const pendingApplications = stats?.pendingApplications || 0;
  const recentJobs = stats?.recentJobs || [];

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalJobs || 0}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingApplications}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

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
          {recentJobs.length > 0 ? (
            recentJobs.map((job: any) => (
              <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.location}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.applicationCount || 0} applications
                    </p>
                    {job.pendingApplications > 0 && (
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        {job.pendingApplications} pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No jobs posted yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
