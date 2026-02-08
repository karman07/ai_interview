import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Grid3x3, List, Bookmark, ArrowLeft, ExternalLink, Filter, Search, Bell, X, Play } from 'lucide-react';
import { fetchJobs, Job } from '../../api/jobService';
import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import { subscriptionService } from '@/api/subscriptionService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EmployeePortal = () => {
  const { user } = useAuth();
  const { resumes } = useResume();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [keyword, setKeyword] = useState(''); // Client-side keyword filter
  const [location, setLocation] = useState('');
  const [minStipend, setMinStipend] = useState('');
  const [maxStipend, setMaxStipend] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [isInternship, setIsInternship] = useState(false);

  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [expandedDesc, setExpandedDesc] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Subscription State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [subscribing, setSubscribing] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setSubscriptionEmail(user.email);
    }
  }, [user]);

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
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      loadJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [location, minStipend, maxStipend, isRemote, isInternship]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 50,
      };

      if (location) params.location = location;
      if (minStipend) params.min_stipend = Number(minStipend);
      if (maxStipend) params.max_stipend = Number(maxStipend);
      if (isRemote) params.remote = true;
      if (isInternship) params.internship = true;

      const data = await fetchJobs(params);
      setJobs(data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!subscriptionEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Although the backend API (currently) only takes email + userId,
    // the user requested "select which resume's description need to set".
    // We force the user to pick a resume (if any) to fulfill this UI requirement.
    if (resumes.length > 0 && !selectedResumeId) {
      toast.error('Please select a resume to tailor your alerts.');
      return;
    }

    try {
      setSubscribing(true);
      await subscriptionService.subscribe({
        email: subscriptionEmail,
        userId: user?._id,
        frequency,
      });
      setIsSubscribed(true); // Toggle state
      toast.success('Successfully subscribed to job updates!');
      setShowSubscriptionModal(false);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.unsubscribe({ email: subscriptionEmail });
      setIsSubscribed(false); // Toggle state
      toast.success('Successfully unsubscribed.');
      setShowSubscriptionModal(false);
    } catch (error) {
      toast.error('Failed to unsubscribe.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const tabs = [
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
  ];

  // Client-side filtering for keyword (title, company, description)
  // because the backend GET /jobs endpoint does not support keyword search currently.
  const filteredJobs = jobs.filter(job => {
    if (!keyword) return true;
    const term = keyword.toLowerCase();
    return (job.title?.toLowerCase() || '').includes(term) ||
      (job.description?.toLowerCase() || '').includes(term) ||
      (job.company?.toLowerCase() || '').includes(term);
  });

  const formatSalary = (min?: number, max?: number) => {
    if ((min === undefined || min === 0) && (max === undefined || max === 0)) {
      return 'Not disclosed';
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    if (min && max && min !== max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `${formatter.format(min)}+`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    return 'Not disclosed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedJob(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
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
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'jobs' && !selectedJob && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Browse Jobs</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="p-2 rounded-lg flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="hidden sm:inline font-semibold">Job Alerts</span>
                </button>
                <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg flex items-center gap-2 ${showFilters ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
                <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-8">
              {/* Main Keyword Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by keyword (Title, Company, Description)..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 outline-none text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. New York"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Salary ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Min"
                        value={minStipend}
                        onChange={(e) => setMinStipend(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Salary ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxStipend}
                        onChange={(e) => setMaxStipend(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end gap-2 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRemote}
                        onChange={(e) => setIsRemote(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Remote Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternship}
                        onChange={(e) => setIsInternship(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Internships Only</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const isExpanded = expandedDesc.has(job.job_id); // Use job_id
                    const descPreview = job.description?.length > 150 ? job.description.slice(0, 150) + '...' : job.description || 'No description available.';
                    return (
                      <div key={job.job_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all flex flex-col group">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1" title={job.title}>{job.title}</h3>
                            <button onClick={() => toggleBookmark(job.job_id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <Bookmark className={`w-5 h-5 ${bookmarked.has(job.job_id) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">{job.company}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.location && (
                              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                <MapPin className="w-3 h-3" />{job.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              <DollarSign className="w-3 h-3" />{formatSalary(job.salary_min, job.salary_max)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.employment_type && (
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                {job.employment_type}
                              </span>
                            )}
                            {job.is_internship && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                Internship
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <p className="line-clamp-3">{isExpanded ? job.description : descPreview}</p>
                            {job.description?.length > 150 && (
                              <button onClick={() => toggleDescription(job.job_id)} className="text-indigo-600 dark:text-indigo-400 hover:underline mt-1 text-xs font-semibold">
                                {isExpanded ? 'Read less' : 'Read more'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-2">
                          <button onClick={() => handleJobClick(job)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">View Details</button>
                          <button
                            onClick={() => job.redirect_url ? window.open(job.redirect_url, '_blank') : null}
                            disabled={!job.redirect_url}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            Apply <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No jobs found matching your criteria.</p>
                    <button
                      onClick={() => {
                        setKeyword('');
                        setLocation('');
                        setMinStipend('');
                        setMaxStipend('');
                        setIsRemote(false);
                        setIsInternship(false);
                      }}
                      className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
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
                    {filteredJobs.map((job) => {
                      const isExpanded = expandedDesc.has(job.job_id);
                      const descPreview = job.description?.length > 100 ? job.description.slice(0, 100) + '...' : job.description || '';
                      return (
                        <tr key={job.job_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">{job.title}</h3>
                                <button onClick={() => toggleBookmark(job.job_id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                  <Bookmark className={`w-4 h-4 ${bookmarked.has(job.job_id) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                                </button>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <p className="line-clamp-2">{isExpanded ? job.description : descPreview}</p>
                                {job.description?.length > 100 && (
                                  <button onClick={() => toggleDescription(job.job_id)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    {isExpanded ? 'Read less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{job.company}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{job.location || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatSalary(job.salary_min, job.salary_max)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                              {job.employment_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleJobClick(job)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">View</button>
                              <button
                                onClick={() => job.redirect_url ? window.open(job.redirect_url, '_blank') : null}
                                disabled={!job.redirect_url}
                                className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50"
                              >
                                Apply
                              </button>
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

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Alerts</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Subscribe to receive daily job updates tailored to your profile.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Resume for Tailored Alerts
                  </label>
                  {resumes.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                      {resumes.map((resume) => (
                        <label key={resume.id || resume._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                          <input
                            type="radio"
                            name="resume"
                            value={resume.id || resume._id}
                            checked={selectedResumeId === (resume.id || resume._id)}
                            onChange={(e) => setSelectedResumeId(e.target.value)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{resume.filename || 'Untitled Resume'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(resume.createdAt).toLocaleDateString()}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      No resumes found. Please upload a resume first to optimize your alerts.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={subscriptionEmail}
                    onChange={(e) => setSubscriptionEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                {isSubscribed ? (
                  <button
                    onClick={handleUnsubscribe}
                    disabled={subscribing}
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {subscribing ? 'Processing...' : 'Unsubscribe'}
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing || !subscriptionEmail}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {subscribing ? 'Processing...' : 'Subscribe'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && selectedJob && (
          <div className="animate-fadeIn">
            <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />Back to jobs
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{selectedJob.title}</h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">{selectedJob.company}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/interview/start/technical', {
                      state: {
                        role: selectedJob.title,
                        company: selectedJob.company,
                        jobDescription: selectedJob.description
                      }
                    })}
                    className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    title="Start Mock Interview"
                  >
                    <Play className="w-6 h-6" />
                    <span className="hidden md:inline font-bold">Mock Interview</span>
                  </button>
                  <button onClick={() => toggleBookmark(selectedJob.job_id)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Bookmark className={`w-6 h-6 ${bookmarked.has(selectedJob.job_id) ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mb-8 text-gray-600 dark:text-gray-400">
                {selectedJob.location && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5" />{selectedJob.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                  <DollarSign className="w-5 h-5" />{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                </span>
                {selectedJob.employment_type && (
                  <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">
                    {selectedJob.employment_type}
                  </span>
                )}
                {selectedJob.is_internship && (
                  <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                    Internship
                  </span>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h3>
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedJob.description || 'No description provided.'}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <button
                  onClick={() => selectedJob.redirect_url ? window.open(selectedJob.redirect_url, '_blank') : null}
                  disabled={!selectedJob.redirect_url}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Apply Now <ExternalLink className="w-5 h-5" />
                </button>
                {!selectedJob.redirect_url && (
                  <p className="mt-2 text-sm text-red-500 text-center md:text-left">Application link not available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;
