import { useState, useEffect } from 'react';
import { Eye, Check, X, Star, Download, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';

export const ApplicationManagement = () => {
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jobsData = await apiService.getMyJobs();
      setJobs([{ _id: 'all', title: 'All Jobs' }, ...jobsData]);
      
      if (Array.isArray(jobsData) && jobsData.length > 0) {
        const allApplications = [];
        for (const job of jobsData) {
          try {
            const jobApplications = await apiService.getJobApplications(job._id);
            if (Array.isArray(jobApplications)) {
              allApplications.push(...jobApplications.map((app: any) => ({
                ...app,
                jobTitle: job.title,
                jobId: job._id
              })));
            }
          } catch (error) {
            console.error(`Failed to fetch applications for job ${job._id}:`, error);
          }
        }
        setApplications(allApplications);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setJobs([{ _id: 'all', title: 'All Jobs' }]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = selectedJob === 'all' 
    ? applications 
    : applications.filter((app: any) => app.jobId === selectedJob);

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setUpdating(applicationId);
    try {
      await apiService.updateApplicationStatus(applicationId, status);
      // Update local state instead of refetching all data
      setApplications(prev => prev.map((app: any) => 
        app._id === applicationId 
          ? { ...app, status, updatedAt: new Date().toISOString() }
          : app
      ));
    } catch (error) {
      console.error('Failed to update application status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Application Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Review and manage job applications with AI insights
          </p>
        </div>
        
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {jobs.map((job: any) => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {Array.isArray(filteredApplications) && filteredApplications.length > 0 ? (
          filteredApplications.map((application: any) => (
            <div key={application._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {application.employeeId?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {application.employeeId?.name || 'Unknown Candidate'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{application.employeeId?.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Applied for: {application.jobTitle}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                  <div className="flex items-center space-x-4">
                  <div className="text-right">
                    {application.aiMatchingScore && (
                      <div className="mb-2">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`font-semibold ${getScoreColor(application.aiMatchingScore.overallMatch)}`}>
                            {application.aiMatchingScore.overallMatch}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">AI Match</p>
                      </div>
                    )}
                    {application.interviewScores && (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {application.interviewScores.overall.toFixed(1)}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Interview</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedApplication(selectedApplication === application._id ? null : application._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'accepted')}
                          disabled={updating === application._id}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50"
                        >
                          {updating === application._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          disabled={updating === application._id}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    
                    <button className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {selectedApplication === application._id && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cover Letter</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {application.coverLetter || 'No cover letter provided.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resume Details</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Email:</strong> {application.employeeId?.email}
                          </p>
                          {application.employeeId?.resumeUrl && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Resume:</strong> 
                              <a href={application.employeeId.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                                View Resume
                              </a>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Candidate
                        </button>
                        <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Resume
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No applications found for the selected job.</p>
          </div>
        )}
      </div>
    </div>
  );
};