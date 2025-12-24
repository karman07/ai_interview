import { useState, useEffect } from 'react';
import { Briefcase, FileText, Calendar, MessageSquare, Mail, TrendingUp, Award, Clock, CheckCircle, MapPin, DollarSign, Building2, ArrowLeft, Search, Filter, Bookmark, Grid3x3, List } from 'lucide-react';
import { employeeService } from '../../services/employeeService';

const EmployeePortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showApplyPage, setShowApplyPage] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [expandedDesc, setExpandedDesc] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<any>({
    coverLetter: '',
    phone: '',
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    availability: '',
    skills: [],
    experience: '',
    education: '',
    certifications: [],
    languages: [],
    relocateWilling: false,
    remoteWork: false,
    additionalInfo: ''
  });

  const toggleBookmark = (jobId: string) => {
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  const toggleDescription = (jobId: string) => {
    setExpandedDesc(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appsRes, messagesRes, jobsRes] = await Promise.all([
        employeeService.getProfile(),
        employeeService.getMyApplications(),
        employeeService.getUnreadCount(),
        employeeService.getJobs()
      ]);
      
      const analyticsRes = await employeeService.getAnalytics(profileRes.data._id);
      
      setStats({
        totalApplications: appsRes.data.length,
        pendingApplications: appsRes.data.filter((app: any) => app.status === 'pending').length,
        interviewsScheduled: appsRes.data.filter((app: any) => app.status === 'interview_scheduled').length,
        unreadMessages: messagesRes.data.count || 0,
        availableJobs: jobsRes.data.length,
        averageInterviewScore: analyticsRes.data.overall?.averageScore || 0,
        recentApplications: appsRes.data.slice(0, 2).map((app: any) => ({
          _id: app._id,
          jobTitle: app.jobId.title,
          company: app.jobId.company,
          status: app.status,
          appliedAt: new Date(app.appliedAt)
        }))
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setStats({
        totalApplications: 0,
        pendingApplications: 0,
        interviewsScheduled: 0,
        unreadMessages: 0,
        availableJobs: 0,
        averageInterviewScore: 0,
        recentApplications: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await employeeService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await employeeService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = async (job: any) => {
    setSelectedJob(job);
  };

  const handleApply = async (jobId: string) => {
    try {
      setLoading(true);
      await employeeService.applyToJob(jobId, formData);
      setShowApplyModal(false);
      setFormData({
        coverLetter: '', phone: '', linkedinUrl: '', portfolioUrl: '', githubUrl: '',
        currentSalary: '', expectedSalary: '', noticePeriod: '', availability: '',
        skills: [], experience: '', education: '', certifications: [], languages: [],
        relocateWilling: false, remoteWork: false, additionalInfo: ''
      });
      setError(null);
      await fetchJobs();
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Error applying:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'invitations', label: 'Invitations', icon: Mail },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'shortlisted': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedJob(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[
                { icon: Briefcase, label: 'Available Jobs', value: stats?.availableJobs || 0, gradient: 'from-blue-500 to-blue-600', textColor: 'text-blue-600 dark:text-blue-400' },
                { icon: FileText, label: 'Applications', value: stats?.totalApplications || 0, gradient: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-600 dark:text-indigo-400' },
                { icon: Clock, label: 'Pending', value: stats?.pendingApplications || 0, gradient: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600 dark:text-yellow-400' },
                { icon: Calendar, label: 'Interviews', value: stats?.interviewsScheduled || 0, gradient: 'from-green-500 to-green-600', textColor: 'text-green-600 dark:text-green-400' },
                { icon: MessageSquare, label: 'Messages', value: stats?.unreadMessages || 0, gradient: 'from-purple-500 to-purple-600', textColor: 'text-purple-600 dark:text-purple-400' },
              ].map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && !selectedJob && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Browse Jobs</h1>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 outline-none text-gray-900 dark:text-white" />
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => {
                  const isExpanded = expandedDesc.has(job._id);
                  const descPreview = job.description?.length > 150 ? job.description.slice(0, 150) + '...' : job.description;
                  return (
                    <div key={job._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all flex flex-col">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                          <button onClick={() => toggleBookmark(job._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Bookmark className={`w-5 h-5 ${bookmarked.has(job._id) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                          </button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{job.employerId?.company}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" />{job.location}</span>
                          <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><DollarSign className="w-4 h-4" />${(job.salary / 83).toFixed(0)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">{job.jobType}</span>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">{job.experienceLevel}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <p>{isExpanded ? job.description : descPreview}</p>
                          {job.description?.length > 150 && (
                            <button onClick={() => toggleDescription(job._id)} className="text-indigo-600 dark:text-indigo-400 hover:underline mt-1">
                              {isExpanded ? 'Read less' : 'Read more'}
                            </button>
                          )}
                        </div>
                        {job.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.skills.slice(0, 3).map((skill: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{skill}</span>
                            ))}
                            {job.skills.length > 3 && <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">+{job.skills.length - 3}</span>}
                          </div>
                        )}
                      </div>
                      <div className="p-6 pt-0 flex gap-2">
                        <button onClick={() => handleJobClick(job)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">View Details</button>
                        <button onClick={() => { setSelectedJob(job); setShowApplyPage(true); }} className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">Apply</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Job Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Salary</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {jobs.map((job) => {
                      const isExpanded = expandedDesc.has(job._id);
                      const descPreview = job.description?.length > 100 ? job.description.slice(0, 100) + '...' : job.description;
                      return (
                        <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">{job.title}</h3>
                                <button onClick={() => toggleBookmark(job._id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                  <Bookmark className={`w-4 h-4 ${bookmarked.has(job._id) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                                </button>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <p>{isExpanded ? job.description : descPreview}</p>
                                {job.description?.length > 100 && (
                                  <button onClick={() => toggleDescription(job._id)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    {isExpanded ? 'Read less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{job.employerId?.company}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{job.location}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">${(job.salary / 83).toFixed(0)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">{job.jobType}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleJobClick(job)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">View</button>
                              <button onClick={() => { setSelectedJob(job); setShowApplyPage(true); }} className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg">Apply</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && selectedJob && (
          <div>
            <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />Back
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{selectedJob.title}</h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300">{selectedJob.employerId?.company}</p>
                </div>
                <button onClick={() => toggleBookmark(selectedJob._id)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Bookmark className={`w-6 h-6 ${bookmarked.has(selectedJob._id) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3 mb-6 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-5 h-5" />{selectedJob.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-5 h-5" />${(selectedJob.salary / 83).toFixed(0)}/month</span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">{selectedJob.jobType}</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">{selectedJob.experienceLevel}</span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedJob.description}</p>
              </div>
              {selectedJob.skills?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.requirements?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {selectedJob.requirements.map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedJob.companyInfo && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About Company</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedJob.companyInfo}</p>
                </div>
              )}
              <button onClick={() => setShowApplyPage(true)} disabled={selectedJob.hasApplied} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {selectedJob.hasApplied ? 'Already Applied' : 'Apply Now'}
              </button>
            </div>
          </div>
        )}



        {activeTab === 'applications' && (
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">My Applications</h1>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{app.jobId?.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{app.jobId?.company}</p>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {['interviews', 'messages', 'invitations'].includes(activeTab) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No {activeTab} yet</p>
          </div>
        )}
      </div>

      {showApplyPage && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button onClick={() => setShowApplyPage(false)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
                  <ArrowLeft className="w-5 h-5" />Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Apply for {selectedJob?.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedJob?.employerId?.company}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Letter</label>
                    <textarea value={formData.coverLetter} onChange={(e) => setFormData({...formData, coverLetter: e.target.value})} rows={4} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Why are you interested in this position?"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                      <input value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="https://linkedin.com/in/yourprofile" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Portfolio URL</label>
                      <input value={formData.portfolioUrl} onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="https://yourportfolio.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">GitHub URL</label>
                    <input value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="https://github.com/yourusername" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Salary ($)</label>
                      <input type="number" value={formData.currentSalary} onChange={(e) => setFormData({...formData, currentSalary: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="50000" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Salary ($)</label>
                      <input type="number" value={formData.expectedSalary} onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="60000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notice Period</label>
                      <select value={formData.noticePeriod} onChange={(e) => setFormData({...formData, noticePeriod: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500">
                        <option value="">Select notice period</option>
                        <option value="immediate">Immediate</option>
                        <option value="2-weeks">2 Weeks</option>
                        <option value="1-month">1 Month</option>
                        <option value="2-months">2 Months</option>
                        <option value="3-months">3 Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Availability</label>
                      <input value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="When can you start?" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills (comma separated)</label>
                    <input value={formData.skills.join(', ')} onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="React, Node.js, TypeScript" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Experience Summary</label>
                    <textarea value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Brief summary of your experience"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Education</label>
                    <textarea value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} rows={2} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Your educational background"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Certifications (comma separated)</label>
                    <input value={formData.certifications.join(', ')} onChange={(e) => setFormData({...formData, certifications: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="AWS Certified, Google Cloud" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Languages (comma separated)</label>
                    <input value={formData.languages.join(', ')} onChange={(e) => setFormData({...formData, languages: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="English, Spanish" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.relocateWilling} onChange={(e) => setFormData({...formData, relocateWilling: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                      <span className="text-gray-700 dark:text-gray-300">Willing to relocate</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.remoteWork} onChange={(e) => setFormData({...formData, remoteWork: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                      <span className="text-gray-700 dark:text-gray-300">Open to remote work</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Information</label>
                    <textarea value={formData.additionalInfo} onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Any additional information you'd like to share"></textarea>
                  </div>
                </div>
                {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
                <div className="flex gap-4 mt-6">
                  <button onClick={() => handleApply(selectedJob._id)} disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50">
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button onClick={() => setShowApplyPage(false)} className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[98vh] overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Apply: {selectedJob?.title}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cover Letter</label>
                  <textarea value={formData.coverLetter} onChange={(e) => setFormData({...formData, coverLetter: e.target.value})} rows={3} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Why interested?"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="+1 555-1234" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
                    <input value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="linkedin.com/in/you" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Portfolio</label>
                    <input value={formData.portfolioUrl} onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="portfolio.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
                  <input value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="github.com/you" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current ($)</label>
                    <input type="number" value={formData.currentSalary} onChange={(e) => setFormData({...formData, currentSalary: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected ($)</label>
                    <input type="number" value={formData.expectedSalary} onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="60000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notice Period</label>
                    <select value={formData.noticePeriod} onChange={(e) => setFormData({...formData, noticePeriod: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500">
                      <option value="">Select</option>
                      <option value="immediate">Immediate</option>
                      <option value="2-weeks">2 Weeks</option>
                      <option value="1-month">1 Month</option>
                      <option value="2-months">2 Months</option>
                      <option value="3-months">3 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="When?" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
                  <input value={formData.skills.join(', ')} onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="React, Node" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                  <textarea value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} rows={2} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Summary"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Education</label>
                  <textarea value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} rows={2} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Background"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Certifications</label>
                  <input value={formData.certifications.join(', ')} onChange={(e) => setFormData({...formData, certifications: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="AWS, etc" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Languages</label>
                  <input value={formData.languages.join(', ')} onChange={(e) => setFormData({...formData, languages: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500" placeholder="English" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={formData.relocateWilling} onChange={(e) => setFormData({...formData, relocateWilling: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Relocate</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={formData.remoteWork} onChange={(e) => setFormData({...formData, remoteWork: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Remote</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Additional Info</label>
                  <textarea value={formData.additionalInfo} onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})} rows={2} className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white resize-none focus:border-indigo-500" placeholder="Anything else?"></textarea>
                </div>
              </div>
            </div>
            {error && <p className="px-3 sm:px-4 lg:px-6 py-2 text-red-600 text-xs flex-shrink-0">{error}</p>}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-shrink-0">
              <button onClick={() => handleApply(selectedJob._id)} disabled={loading} className="flex-1 px-3 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button onClick={() => setShowApplyModal(false)} className="px-3 py-2 text-xs sm:text-sm font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
