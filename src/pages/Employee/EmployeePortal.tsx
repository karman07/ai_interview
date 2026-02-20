import { useState, useEffect, useRef } from 'react';
import { Briefcase, MapPin, DollarSign, Grid3x3, List, Bookmark, ArrowLeft, ExternalLink, Filter, Search, Bell, X, Play, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJobs, Job, parseResume, getEngineeringTypes, getLocations, toggleFavoriteJob, fetchFavoriteJobs } from '../../api/jobService';
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

  const [engineeringTypes, setEngineeringTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false); // New state for Favorites view
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
    loadEngineeringTypes();
    loadLocations();
  }, [user]);

  const loadLocations = async () => {
    try {
      const locs = await getLocations();
      setAvailableLocations(locs);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const loadEngineeringTypes = async () => {
    try {
      const types = await getEngineeringTypes();
      setEngineeringTypes(types);
    } catch (error) {
      console.error('Failed to load engineering types:', error);
    }
  };

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

  const toggleBookmark = async (jobId: string) => {
    if (!user?._id) {
      toast.error("Please login to manage favorites");
      return;
    }

    // Optimistic update
    const isCurrentlyBookmarked = bookmarked.has(jobId);
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });

    try {
      await toggleFavoriteJob(jobId, user._id);
      toast.success(isCurrentlyBookmarked ? "Removed from favorites" : "Added to favorites");

      // If we are in "Favorites Only" mode and unbookmarking, we might want to reload or remove from list?
      // But for now, let's just keep the list as is until reload or filter change.
      if (showFavorites && isCurrentlyBookmarked) {
        // Optional: remove from current view instantly if strictly viewing favorites
        setJobs(prev => prev.filter(j => j.job_id !== jobId));
      }

    } catch (error) {
      // Revert on failure
      console.error("Failed to toggle favorite", error);
      toast.error("Failed to update favorite status");
      setBookmarked(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyBookmarked) newSet.add(jobId);
        else newSet.delete(jobId);
        return newSet;
      });
    }
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
      if (!isResumeFiltered) {
        setSkip(0);
        loadJobs(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, location, minStipend, maxStipend, isRemote, isInternship, selectedCategory, showFavorites]);

  useEffect(() => {
    if (!isResumeFiltered) {
      loadJobs(skip);
    }
  }, [skip]);

  // ... (keeping existing functions) -> This comment was a mistake in previous turn, restoring code now.

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

      if (data.jobs) {
        setJobs(data.jobs);
        setTotalJobs(data.total_matches || data.jobs.length);
        setIsResumeFiltered(true);
        setSkip(0);
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
    console.log("loadJobs called. isResumeFiltered:", isResumeFiltered, "showFavorites:", showFavorites, "skip:", skipValue);
    if (isResumeFiltered) {
      console.log("Skipping loadJobs because resume is filtered");
      return;
    }

    try {
      setLoading(true);

      if (showFavorites && user?._id) {
        const data = await fetchFavoriteJobs(user._id);
        setJobs(data.jobs);
        setTotalJobs(data.total || data.jobs.length);
        return;
      }

      const params: any = {
        limit: LIMIT,
        skip: skipValue,
      };

      if (location) params.location = location;
      if (minStipend) params.min_stipend = Number(minStipend);
      if (maxStipend) params.max_stipend = Number(maxStipend);
      if (isRemote) params.remote = true;
      if (isInternship) params.internship = true;
      if (selectedCategory) params.engineering_type = selectedCategory;

      const data = await fetchJobs(params);
      setJobs(data.jobs);
      if (data.total !== undefined) {
        setTotalJobs(data.total);
      } else {
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

  const formatSalary = (min?: number | null, max?: number | null) => {
    if ((min === undefined || min === null || min === 0) && (max === undefined || max === null || max === 0)) {
      return 'Competitive Salary';
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
    return 'Competitive Salary';
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 scrollbar-hide">
      {/* Header removed as requested */}

      <div className="max-w-7xl mx-auto p-6 relative">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />

        {!selectedJob && (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalized for you</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                  Find Your <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Perfect Match
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="4" fill="none" className="text-blue-500/20" />
                    </svg>
                  </span>
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                  Discover career-defining opportunities precisely matched with your unique <span className="text-blue-600 dark:text-blue-400 font-bold">engineering DNA</span>.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-3xl p-2.5 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              >
                {/* Primary Action Group */}
                <div className="flex items-center gap-2 pr-4 border-r border-gray-100 dark:border-gray-700/50">
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-5 py-3 rounded-2xl flex items-center gap-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-extrabold text-xs uppercase tracking-wider">Alerts</span>
                  </button>

                  <div className="relative group/match">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFilterUpload}
                    />
                    <button
                      onClick={() => isResumeFiltered ? clearResumeFilter() : fileInputRef.current?.click()}
                      className={`px-5 py-3 rounded-2xl flex items-center gap-2.5 transition-all duration-300 font-extrabold text-xs uppercase tracking-wider border relative overflow-hidden ${isResumeFiltered
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                        : 'bg-blue-600 text-white shadow-xl shadow-blue-500/25 border-blue-500 hover:bg-blue-700 hover:-translate-y-0.5'
                        }`}
                    >
                      {/* Premium AI Spotlight */}
                      {!isResumeFiltered && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover/match:opacity-100 transition-opacity duration-700" />
                      )}

                      {isResumeFiltered ? <X className="w-5 h-5" /> : <Sparkles className="w-4.5 h-4.5" />}
                      <span className="relative z-10">{isResumeFiltered ? 'Clear Match' : 'AI Match'}</span>

                      {/* AI Feature Badge */}
                      {!isResumeFiltered && (
                        <div className="ml-1.5 px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[8px] font-black tracking-tighter uppercase border border-white/30">
                          Beta
                        </div>
                      )}
                    </button>
                    {resumeFilterFile && !isResumeFiltered && (
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover/match:opacity-100 transition-opacity">
                        {resumeFilterFile.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Tools Group */}
                <div className="flex items-center gap-1.5 pl-2">
                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`p-3 rounded-2xl transition-all duration-300 ${showFavorites
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500 border border-pink-100 dark:border-pink-900/30'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-2xl transition-all duration-300 ${showFilters
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-900/30'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>

                  <div className="w-px h-6 bg-gray-100 dark:bg-gray-700/50 mx-2"></div>

                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600' : 'text-gray-400 opacity-50'}`}>
                      <Grid3x3 className="w-4.5 h-4.5" />
                    </button>
                    <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600' : 'text-gray-400 opacity-50'}`}>
                      <List className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>



            {/* Premium Search & Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="p-8">
                <div className="relative group/search">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                    <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by role, company, or skills..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-20 pr-6 py-5 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 rounded-3xl outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium shadow-inner"
                  />
                  {keyword && (
                    <button
                      onClick={() => setKeyword('')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showFilters && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Engineering Branch</label>
                      <div className="relative">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white focus:border-blue-500 transition-all font-medium appearance-none"
                        >
                          <option value="">All Disciplines</option>
                          {Array.isArray(engineeringTypes) && engineeringTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
                      <div className="relative">
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold appearance-none"
                        >
                          <option value="">All Locations</option>
                          {availableLocations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                      </div>
                    </div>

                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Min Salary ($)</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Min amount"
                          value={minStipend}
                          onChange={(e) => setMinStipend(e.target.value)}
                          className="w-full pl-10 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder:font-normal"
                        />
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-6">
                      <label className="flex items-center gap-3 cursor-pointer group/toggle">
                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isRemote ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                          <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} className="sr-only" />
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isRemote ? 'translate-x-6' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Remote</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group/toggle">
                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isInternship ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                          <input type="checkbox" checked={isInternship} onChange={(e) => setIsInternship(e.target.checked)} className="sr-only" />
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isInternship ? 'translate-x-6' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Intern</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, idx) => {
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                          key={job.job_id}
                          className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-all duration-700 flex flex-col overflow-hidden"
                        >
                          {/* Premium Spotlight Blur */}
                          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors duration-700" />

                          {/* Status Badge */}
                          <div className="absolute top-8 left-8 z-10">
                            {job.is_internship ? (
                              <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50/90 dark:bg-blue-900/40 backdrop-blur-xl text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Intern
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50/90 dark:bg-emerald-900/40 backdrop-blur-xl text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Full-time
                              </span>
                            )}
                          </div>

                          {/* Favorite Button Overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(job.job_id);
                            }}
                            className={`absolute top-8 right-8 z-10 p-3 rounded-2xl transition-all duration-500 backdrop-blur-xl ${bookmarked.has(job.job_id)
                              ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-500 shadow-md ring-2 ring-pink-100 dark:ring-pink-900/50'
                              : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-pink-500 border border-white/50 dark:border-gray-700/50 hover:scale-110 active:scale-95'
                              }`}
                          >
                            <Heart className={`w-5.5 h-5.5 ${bookmarked.has(job.job_id) ? 'fill-current' : ''}`} />
                          </button>

                          <div className="p-10 pt-24 flex-1 relative z-10">
                            <div className="flex items-start gap-5 mb-8">
                              <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-[1.5rem] flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-[0_10px_25px_rgba(0,0,0,0.03)] group-hover:shadow-[0_15px_35px_rgba(37,99,235,0.15)] group-hover:-translate-y-1.5 transition-all duration-700">
                                <span className="text-blue-600 dark:text-blue-400 font-black text-2xl tracking-tighter">{job.company?.charAt(0).toUpperCase() || 'J'}</span>
                              </div>
                              <div className="flex-1 min-w-0 pt-1">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-500" title={job.title}>
                                  {job.title}
                                </h3>
                                <p className="text-gray-400 dark:text-gray-500 font-bold text-[11px] uppercase tracking-[0.15em] mt-2">
                                  {job.company}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5 mb-8">
                              {job.location && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 text-[11px] font-black border border-gray-200/30 dark:border-gray-700/30 shadow-sm group-hover:bg-blue-50/50 transition-colors">
                                  <MapPin className="w-4 h-4 text-blue-500" />{job.location}
                                </div>
                              )}
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-100/20 dark:border-emerald-800/20 shadow-sm group-hover:bg-emerald-50/50 transition-colors">
                                <DollarSign className="w-4 h-4" />{formatSalary(job.salary_min, job.salary_max)}
                              </div>
                            </div>

                            <div className="relative group-hover:translate-x-1 transition-transform duration-700">
                              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                {job.description || 'Join our innovative engineering team to solve complex problems and build state-of-the-art solutions.'}
                              </p>
                            </div>
                          </div>

                          <div className="p-8 pt-0 flex gap-4 relative z-10">
                            <button
                              onClick={() => handleJobClick(job)}
                              className="flex-1 px-5 py-3.5 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-extrabold uppercase tracking-widest rounded-2xl transition-all border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1 active:scale-95"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => job.redirect_url ? window.open(job.redirect_url, '_blank') : null}
                              disabled={!job.redirect_url}
                              className="flex-[2] px-6 py-3.5 bg-gray-900 dark:bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-[0_15px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_30px_rgba(37,99,235,0.2)] hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group/apply relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/apply:translate-x-full transition-transform duration-1000" />
                              <span className="relative z-10">Apply Now</span>
                              <ChevronRight className="w-4 h-4 relative z-10 group-hover/apply:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">Try adjusting your filters or search keywords to find more opportunities.</p>
                      <button
                        onClick={() => {
                          setKeyword('');
                          setLocation('');
                          setMinStipend('');
                          setMaxStipend('');
                          setIsRemote(false);
                          setIsInternship(false);
                        }}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
                      >
                        Reset all filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
        )
        }

        {/* Subscription Modal */}
        {
          showSubscriptionModal && (
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
          )
        }

        {
          selectedJob && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-400 max-w-5xl mx-auto">
              <button
                onClick={() => setSelectedJob(null)}
                className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-semibold p-2 mb-6"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" />
                <span>Back to Listings</span>
              </button>

              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800 flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-3xl">{selectedJob.company?.charAt(0)}</span>
                        </div>
                        <div>
                          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">{selectedJob.title}</h1>
                          <p className="text-xl text-gray-500 dark:text-gray-400 font-semibold">{selectedJob.company}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{selectedJob.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="w-5 h-5" />
                          <span className="font-bold">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Job Description</h3>
                        <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">
                          {selectedJob.description || 'No description provided.'}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-80 space-y-4">
                      <button
                        onClick={() => selectedJob.redirect_url ? window.open(selectedJob.redirect_url, '_blank') : null}
                        disabled={!selectedJob.redirect_url}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Apply Now <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate('/interview/start/technical', {
                          state: { role: selectedJob.title, company: selectedJob.company, jobDescription: selectedJob.description }
                        })}
                        className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" /> Mock Interview
                      </button>
                      <button onClick={() => toggleBookmark(selectedJob.job_id)} className="w-full py-4 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                        <Bookmark className={`w-5 h-5 ${bookmarked.has(selectedJob.job_id) ? 'fill-current text-blue-600' : ''}`} />
                        {bookmarked.has(selectedJob.job_id) ? 'Saved' : 'Save Job'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default EmployeePortal;
