import { useState, useEffect, useRef } from 'react';
import { Briefcase, MapPin, DollarSign, Grid3x3, List, Bookmark, ArrowLeft, ExternalLink, Filter, Search, Bell, X, Play } from 'lucide-react';
import { fetchJobs, Job, parseResume } from '../../api/jobService';
import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import { subscriptionService } from '@/api/subscriptionService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EmployeePortal = () => {
  const { user } = useAuth();
  const { resumes } = useResume();
  const navigate = useNavigate();


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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setSubscriptionEmail(user.email);
    }
  }, [user]);

  // Check subscription status when modal opens or email changes
  useEffect(() => {
    if (showSubscriptionModal && subscriptionEmail) {
      checkSubscriptionStatus();
    }
  }, [showSubscriptionModal, subscriptionEmail]);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('Checking subscription status for:', subscriptionEmail);
      // First try to get full subscription details (might need auth)
      try {
        const mySub = await subscriptionService.getMySubscription();
        console.log('getMySubscription response:', mySub);
        if (mySub.subscription && mySub.subscription.isSubscribed) {
          setIsSubscribed(true);
          setFrequency(mySub.subscription.frequency || 'daily');
          console.log('Set isSubscribed to true from mySubscription');
          return;
        }
      } catch (e) {
        console.warn('getMySubscription failed, falling back to email check:', e);
      }

      const status = await subscriptionService.getStatus(subscriptionEmail);
      console.log('getStatus response:', status);

      // The getStatus endpoint returns: { isSubscribed: boolean, email: string, subscriptionTypes: string[] }
      if (status && status.isSubscribed) {
        setIsSubscribed(true);
        // If frequency is not in the response, we might default or keep current state.
        if (status.frequency) {
          setFrequency(status.frequency);
        }
        console.log('Set isSubscribed to true from getStatus');
      } else {
        setIsSubscribed(false);
        console.log('Set isSubscribed to false');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Don't set isSubscribed to false here blindly, keep previous state or default
    }
  };

  const handleTriggerUpdate = async () => {
    if (!isSubscribed) {
      toast.error("You must be subscribed to trigger an update.");
      return;
    }
    try {
      await subscriptionService.triggerJobUpdate({ email: subscriptionEmail });
      toast.success("Job update triggered! Check your inbox shortly.");
    } catch (error) {
      toast.error("Failed to trigger update.");
    }
  };

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

  // Pagination State
  const [skip, setSkip] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const LIMIT = 20;

  // Resume Filter State
  const [resumeFilterFile, setResumeFilterFile] = useState<File | null>(null);
  const [isResumeFiltered, setIsResumeFiltered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      // If we are filtering by resume, we don't want to trigger the normal loadJobs 
      // unless the user changes other filters, but even then, how do we combine?
      // For now, if resume filtered, we might explicitly just rely on that.
      // But if the user changes keyword/location, should we re-run the resume match with params?
      // The current upload endpoint might not support query params mixed with file?
      // Let's assume for now: Normal load triggers if NOT resume filtered OR if we handle it differently.
      // Actually, let's keep it simple: If not resume filtered, load normal jobs.
      if (!isResumeFiltered) {
        setSkip(0);
        loadJobs(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, location, minStipend, maxStipend, isRemote, isInternship]);

  useEffect(() => {
    if (!isResumeFiltered) {
      loadJobs(skip);
    }
  }, [skip]);

  const handleResumeFilterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleResumeFilterUpload triggered");
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      console.log("File selected:", file.name);
      setResumeFilterFile(file);
      await filterJobsByResume(file);
    } else {
      console.log("No file selected in event target");
    }
  };

  const filterJobsByResume = async (file: File) => {
    try {
      console.log("Starting filterJobsByResume for:", file.name);
      setLoading(true);
      const data = await parseResume(file);
      console.log("Resume Filter Response:", data);

      // Assuming the response structure. 
      // If it returns a list of jobs directly or inside a property.
      // Based on matchJD/matchResume, it usually returns { jobs: [], total_matches: ... }
      // If the user said "Global job result" vs "Filter option with resume", 
      // I expect this endpoint returns the filtered list.

      if (data.jobs) {
        setJobs(data.jobs);
        setTotalJobs(data.total_matches || data.jobs.length);
        setIsResumeFiltered(true);
        setSkip(0); // Reset pagination (though backend might not support pagination for this match yet)
      } else if (Array.isArray(data)) {
        setJobs(data);
        setTotalJobs(data.length);
        setIsResumeFiltered(true);
        setSkip(0);
      } else {
        toast.error("Format returned by resume filter not recognized.");
      }
    } catch (error) {
      console.error("Error filtering by resume:", error);
      toast.error("Failed to filter jobs by resume.");
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const clearResumeFilter = () => {
    setResumeFilterFile(null);
    setIsResumeFiltered(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadJobs(0);
  };

  const loadJobs = async (skipValue = skip) => {
    console.log("loadJobs called. isResumeFiltered:", isResumeFiltered, "skip:", skipValue);
    if (isResumeFiltered) {
      console.log("Skipping loadJobs because resume is filtered");
      return;
    }

    try {
      setLoading(true);
      const params: any = {
        limit: LIMIT,
        skip: skipValue,
      };

      if (location) params.location = location;
      if (minStipend) params.min_stipend = Number(minStipend);
      if (maxStipend) params.max_stipend = Number(maxStipend);
      if (isRemote) params.remote = true;
      if (isInternship) params.internship = true;

      const data = await fetchJobs(params);
      setJobs(data.jobs);
      if (data.total !== undefined) {
        setTotalJobs(data.total);
      } else {
        // Fallback if total is not returned: if full page, assume more? 
        // But strict numbered pagination needs total. 
        // If no total, we'll just stick to simplified view or try to infer.
        // For now, let's set a default or use length.
        // If we got jobs, we have at least (skip + jobs.length)
        setTotalJobs(skipValue + data.jobs.length + (data.jobs.length === LIMIT ? LIMIT : 0));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setTotalJobs(0);
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

      let parsedData = null;
      if (resumeFile) {
        try {
          // parseResume is imported from jobService
          const result = await parseResume(resumeFile);
          parsedData = result;
        } catch (err) {
          console.error("Resume parsing failed", err);
          toast.error("Failed to parse resume for alerts. Proceeding with basic subscription.");
        }
      }

      await subscriptionService.subscribe({
        email: subscriptionEmail,
        userId: user?._id,
        frequency,
        resumeData: parsedData,
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
    <div className="h-screen overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 scrollbar-hide">
      {/* Header removed as requested */}

      <div className="max-w-7xl mx-auto p-6">
        {!selectedJob && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Browse Jobs</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="p-2 rounded-lg flex items-center gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="hidden sm:inline font-semibold">Job Alerts</span>
                </button>
                <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>

                {/* Resume Filter Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFilterUpload}
                />
                <button
                  onClick={() => {
                    if (isResumeFiltered) {
                      clearResumeFilter();
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-all ${isResumeFiltered
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100'
                    }`}
                  title={resumeFilterFile ? `Filtered by: ${resumeFilterFile.name}` : 'Filter jobs by resume match'}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">
                    {isResumeFiltered && resumeFilterFile
                      ? `Clear: ${resumeFilterFile.name.substring(0, 15)}...`
                      : (isResumeFiltered ? 'Clear Resume Filter' : 'Filter with Resume')}
                  </span>
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
                      <div key={job.job_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col group">
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
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
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

            {/* Pagination Controls */}
            {totalJobs > 0 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  onClick={() => setSkip(Math.max(0, skip - LIMIT))}
                  disabled={skip === 0 || loading}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = Math.ceil(totalJobs / LIMIT);
                  const currentPage = Math.floor(skip / LIMIT) + 1;
                  const pages = [];

                  // Logic to show a window of pages, e.g., 1 2 ... 5 6 7 ... 10
                  // For simplicity, let's show up to 5 surrounding pages for now, or all if few.

                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, currentPage + 2);

                  if (totalPages <= 5) {
                    startPage = 1;
                    endPage = totalPages;
                  } else {
                    if (currentPage <= 3) {
                      startPage = 1;
                      endPage = 5;
                    } else if (currentPage >= totalPages - 2) {
                      startPage = totalPages - 4;
                      endPage = totalPages;
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setSkip((i - 1) * LIMIT)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentPage === i
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}

                <button
                  onClick={() => setSkip(skip + LIMIT)}
                  disabled={skip + LIMIT >= totalJobs || loading}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                >
                  Next
                </button>
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
                {isSubscribed && (
                  <button
                    onClick={handleTriggerUpdate}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-semibold underline"
                  >
                    Trigger Instant Job Update
                  </button>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Resume for Tailored Alerts
                  </label>
                  {resumes.length > 0 ? (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => {
                        setSelectedResumeId(e.target.value);
                        setResumeFile(null); // Deselect uploaded file if selecting existing
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select an existing resume</option>
                      {resumes.map((resume) => {
                        let dateStr = '';
                        try {
                          if (resume.createdAt) {
                            const d = new Date(resume.createdAt);
                            if (!isNaN(d.getTime())) {
                              dateStr = ` (${d.toLocaleDateString()})`;
                            }
                          }
                        } catch (e) { /* ignore */ }
                        return (
                          <option key={resume.id || resume._id} value={resume.id || resume._id}>
                            {resume.filename || 'Untitled Resume'}{dateStr}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-2">
                      No existing resumes found.
                    </p>
                  )}

                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Or Upload New</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setResumeFile(e.target.files[0]);
                          setSelectedResumeId(''); // Deselect existing if uploading new
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                    />
                  </div>
                  {resumeFile && (
                    <p className="text-xs text-green-600 mt-1">Selected: {resumeFile.name}</p>
                  )}
                </div>
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
                <label className="block text-sm mt-2 font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <div className="flex gap-3 flex-col sm:flex-row mt-6">
                {isSubscribed && (
                  <button
                    onClick={handleUnsubscribe}
                    disabled={subscribing}
                    className="w-full sm:w-1/2 px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                  >
                    {subscribing ? 'Processing...' : 'Unsubscribe'}
                  </button>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={subscribing || !subscriptionEmail}
                  className={`w-full ${isSubscribed ? 'sm:w-1/2' : ''} px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm`}
                >
                  {subscribing ? 'Processing...' : (isSubscribed ? 'Update Subscription' : 'Subscribe')}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedJob && (
          <div className="animate-fadeIn">
            <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />Back to jobs
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
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
                    className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2"
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
                  className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
    </div >
  );
};

export default EmployeePortal;
