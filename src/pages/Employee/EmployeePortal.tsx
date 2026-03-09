import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Search,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { fetchJobs, Job, parseResume, getEngineeringTypes, getLocations, getCountries, toggleFavoriteJob, fetchFavoriteJobs, toggleBookmarkJob, fetchBookmarkJobs } from '../../api/jobService';
import { useAuth } from '@/contexts/AuthContext';
import { useResume } from '@/contexts/ResumeContext';
import { subscriptionService } from '@/api/subscriptionService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// New Components
import JobCard from './components/JobCard';
import JobTable from './components/JobTable';
import SearchFilters from './components/SearchFilters';
import JobDetailsPortal from './components/JobDetailsPortal';
import PortalActions from './components/PortalActions';
import SubscriptionModal from './components/SubscriptionModal';

const EmployeePortal = () => {
  const { user } = useAuth();
  const { resumes } = useResume();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [minStipend, setMinStipend] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [isInternship, setIsInternship] = useState(false);

  const [engineeringTypes, setEngineeringTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Load local data on mount
  useEffect(() => {
    const localFavs = localStorage.getItem('ai_portal_favorites');
    const localBooks = localStorage.getItem('ai_portal_bookmarks');
    if (localFavs) setFavorites(new Set(JSON.parse(localFavs)));
    if (localBooks) setBookmarks(new Set(JSON.parse(localBooks)));
  }, []);

  const [showFavorites, setShowFavorites] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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

  // Additional Subscription Filters
  const [subLocation, setSubLocation] = useState('');
  const [subMinSalary, setSubMinSalary] = useState('');
  const [subInternship, setSubInternship] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      const locs = await getLocations();
      setAvailableLocations(locs);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  }, []);

  const loadCountries = useCallback(async () => {
    try {
      const c = await getCountries();
      setAvailableCountries(c);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  }, []);

  const loadEngineeringTypes = useCallback(async () => {
    try {
      const types = await getEngineeringTypes();
      types.sort();
      setEngineeringTypes(types);
    } catch (error) {
      console.error('Failed to load engineering types:', error);
    }
  }, []);

  // These functions are now redundant as favorites/bookmarks are loaded from localStorage on initial mount
  // and updated via localStorage in toggleFavorite/toggleBookmark.
  // The API calls for fetching all favorites/bookmarks are now only used when explicitly filtering by them.
  const loadFavoriteIds = useCallback(async () => {
    const userId = user?._id || (user as any)?.id;
    if (!userId) return;
    try {
      const data = await fetchFavoriteJobs(userId);
      if (data && data.jobs) {
        const remoteFavs = data.jobs.map(j => j.job_id || (j as any)._id);
        setFavorites(prev => {
          const newSet = new Set([...Array.from(prev), ...remoteFavs]);
          localStorage.setItem('ai_portal_favorites', JSON.stringify(Array.from(newSet)));
          return newSet;
        });
      }
    } catch (error) {
      console.error("[EmployeePortal] Failed to sync favorite job IDs:", error);
    }
  }, [user]);

  const loadBookmarkIds = useCallback(async () => {
    const userId = user?._id || (user as any)?.id;
    if (!userId) return;
    try {
      const data = await fetchBookmarkJobs(userId);
      if (data && data.jobs) {
        const remoteBooks = data.jobs.map(j => j.job_id || (j as any)._id);
        setBookmarks(prev => {
          const newSet = new Set([...Array.from(prev), ...remoteBooks]);
          localStorage.setItem('ai_portal_bookmarks', JSON.stringify(Array.from(newSet)));
          return newSet;
        });
      }
    } catch (error) {
      console.error("[EmployeePortal] Failed to sync bookmark job IDs:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setSubscriptionEmail(user.email);
    }
    loadEngineeringTypes();
    loadLocations();
    loadCountries();
    loadFavoriteIds();
    loadBookmarkIds();
  }, [user, loadEngineeringTypes, loadLocations, loadCountries, loadFavoriteIds, loadBookmarkIds]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!subscriptionEmail) return;
    try {
      try {
        const mySub = await subscriptionService.getMySubscription();
        if (mySub.subscription && mySub.subscription.isSubscribed) {
          setIsSubscribed(true);
          setFrequency(mySub.subscription.frequency || 'daily');
          return;
        }
      } catch (e) {
        console.warn('getMySubscription failed, falling back to email check');
      }

      const status = await subscriptionService.getStatus(subscriptionEmail);
      if (status && status.isSubscribed) {
        setIsSubscribed(true);
        if (status.frequency) {
          setFrequency(status.frequency);
        }
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [subscriptionEmail]);

  useEffect(() => {
    if (showSubscriptionModal && subscriptionEmail) {
      checkSubscriptionStatus();
    }
  }, [showSubscriptionModal, subscriptionEmail, checkSubscriptionStatus]);

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

  const toggleFavorite = async (jobId: string) => {
    const userId = user?._id || (user as any)?.id;

    const isCurrentlyFavorited = favorites.has(jobId);

    setFavorites(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFavorited) newSet.delete(jobId);
      else newSet.add(jobId);
      localStorage.setItem('ai_portal_favorites', JSON.stringify(Array.from(newSet)));
      return newSet;
    });

    try {
      if (userId) {
        await toggleFavoriteJob(jobId, userId);
      }
      toast.success(isCurrentlyFavorited ? "Removed from favorites" : "Added to favorites");

      if (showFavorites && isCurrentlyFavorited) {
        setJobs(prev => prev.filter(j => (j.job_id || (j as any)._id) !== jobId));
      }
    } catch (error) {
      console.error("Failed to toggle favorite API", error);
      // We keep local state even if API fails as per user request for local handling
    }
  };

  const toggleBookmark = async (jobId: string) => {
    const userId = user?._id || (user as any)?.id;

    const isCurrentlyBookmarked = bookmarks.has(jobId);

    setBookmarks(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) newSet.delete(jobId);
      else newSet.add(jobId);
      localStorage.setItem('ai_portal_bookmarks', JSON.stringify(Array.from(newSet)));
      return newSet;
    });

    try {
      if (userId) {
        await toggleBookmarkJob(jobId, userId);
      }
      toast.success(isCurrentlyBookmarked ? "Removed from bookmarks" : "Added to bookmarks");

      if (showBookmarks && isCurrentlyBookmarked) {
        setJobs(prev => prev.filter(j => (j.job_id || (j as any)._id) !== jobId));
      }
    } catch (error) {
      console.error("Failed to toggle bookmark API", error);
      // Keep local state
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

  const [skip, setSkip] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const LIMIT = 20;


  const [isResumeFiltered, setIsResumeFiltered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadJobs = useCallback(async (skipValue: number) => {
    const userId = user?._id || (user as any)?.id;
    if (isResumeFiltered) return;

    try {
      setLoading(true);

      if (showFavorites) {
        if (userId) {
          try {
            const data = await fetchFavoriteJobs(userId);
            setJobs(data.jobs);
            setTotalJobs(data.total || data.jobs.length);
            return;
          } catch (err) {
            console.error("Remote favorites fetch failed, falling back to local filter", err);
          }
        }
        setJobs(prev => prev.filter(j => favorites.has(j.job_id || (j as any)._id)));
        setTotalJobs(favorites.size);
        return;
      }

      if (showBookmarks) {
        if (userId) {
          try {
            const data = await fetchBookmarkJobs(userId);
            setJobs(data.jobs);
            setTotalJobs(data.total || data.jobs.length);
            return;
          } catch (err) {
            console.error("Remote bookmarks fetch failed, falling back to local filter", err);
          }
        }
        setJobs(prev => prev.filter(j => bookmarks.has(j.job_id || (j as any)._id)));
        setTotalJobs(bookmarks.size);
        return;
      }

      const params: any = {
        limit: LIMIT,
        skip: skipValue,
      };

      if (location) params.location = location;
      if (country) params.country = country;
      if (minStipend) params.min_stipend = Number(minStipend);
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
  }, [user, isResumeFiltered, showFavorites, showBookmarks, location, country, minStipend, isRemote, isInternship, selectedCategory]);

  // Reset skip only when filters change
  useEffect(() => {
    setSkip(0);
  }, [keyword, location, country, minStipend, isRemote, isInternship, selectedCategory, showFavorites, showBookmarks]);

  // Load jobs when skip or filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isResumeFiltered) {
        loadJobs(skip);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [skip, keyword, location, country, minStipend, isRemote, isInternship, selectedCategory, showFavorites, showBookmarks, loadJobs, isResumeFiltered]);

  const handleResumeFilterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      await filterJobsByResume(file);
    }
  };

  const filterJobsByResume = async (file: File) => {
    try {
      setLoading(true);
      const data = await parseResume(file);

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

    setIsResumeFiltered(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadJobs(0);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (resumes.length > 0 && !selectedResumeId) {
      toast.error('Please select a resume to tailor your alerts.');
      return;
    }

    try {
      setSubscribing(true);
      let parsedData = null;
      if (resumeFile) {
        try {
          const result = await parseResume(resumeFile);
          parsedData = result;
        } catch (err) {
          console.error("Resume parsing failed", err);
        }
      }

      await subscriptionService.subscribe({
        email: subscriptionEmail,
        userId: user?._id,
        frequency,
        resumeData: parsedData,
      });
      setIsSubscribed(true);
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
      setIsSubscribed(false);
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
      return `${formatter.format(min)} +`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    return 'Competitive Salary';
  };
  return (
    <div className="h-screen overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500 custom-scrollbar">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 relative">
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />

        {!selectedJob ? (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100/50 dark:border-blue-800/50">
                  <Sparkles className="w-3 h-3" />
                  <span>Personalized for you</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                  Find Your <span className="text-blue-600 dark:text-blue-500">Perfect Match</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Discover career-defining opportunities precisely matched with your unique <span className="text-blue-600 dark:text-blue-400 font-bold italic">engineering DNA</span>.
                </p>
              </motion.div>

              <PortalActions
                setShowSubscriptionModal={setShowSubscriptionModal}
                isResumeFiltered={isResumeFiltered}
                clearResumeFilter={clearResumeFilter}
                fileInputRef={fileInputRef}
                handleResumeFilterUpload={handleResumeFilterUpload}
                showFavorites={showFavorites}
                setShowFavorites={setShowFavorites}
                showBookmarks={showBookmarks}
                setShowBookmarks={setShowBookmarks}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>

            <SearchFilters
              keyword={keyword}
              setKeyword={setKeyword}
              showFilters={showFilters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              engineeringTypes={engineeringTypes}
              country={country}
              setCountry={setCountry}
              availableCountries={availableCountries}
              location={location}
              setLocation={setLocation}
              availableLocations={availableLocations}
              minStipend={minStipend}
              setMinStipend={setMinStipend}
              isRemote={isRemote}
              setIsRemote={setIsRemote}
              isInternship={isInternship}
              setIsInternship={setIsInternship}
            />

            {loading ? (
              <div className="text-center py-24">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Decrypting Opportunities...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, idx) => (
                      <JobCard
                        key={job.job_id || (job as any)._id}
                        job={job}
                        idx={idx}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        bookmarks={bookmarks}
                        toggleBookmark={toggleBookmark}
                        handleJobClick={handleJobClick}
                        formatSalary={formatSalary}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase italic">No Matches Found</h3>
                      <p className="text-gray-500 font-medium">Try adjusting your filters or search keywords.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <JobTable
                jobs={filteredJobs}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                bookmarks={bookmarks}
                toggleBookmark={toggleBookmark}
                handleJobClick={handleJobClick}
                formatSalary={formatSalary}
                expandedDesc={expandedDesc}
                toggleDescription={toggleDescription}
              />
            )}

            {totalJobs > 0 && (
              <div className="flex justify-center items-center mt-12 gap-4 pb-12">
                <button
                  onClick={() => setSkip(Math.max(0, skip - LIMIT))}
                  disabled={skip === 0 || loading}
                  className="px-6 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(totalJobs / LIMIT);
                    const currentPage = Math.floor(skip / LIMIT) + 1;
                    const pages = [];
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, currentPage + 2);

                    if (totalPages <= 5) {
                      startPage = 1;
                      endPage = totalPages;
                    } else {
                      if (currentPage <= 3) { endPage = 5; }
                      else if (currentPage >= totalPages - 2) { startPage = totalPages - 4; }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setSkip((i - 1) * LIMIT)}
                          className={`w-12 h-12 rounded-2xl font-black transition-all ${currentPage === i
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10'
                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => setSkip(skip + LIMIT)}
                  disabled={skip + LIMIT >= totalJobs || loading}
                  className="px-6 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <JobDetailsPortal
            selectedJob={selectedJob}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            setSelectedJob={setSelectedJob}
            formatSalary={formatSalary}
            navigate={navigate}
          />
        )}

        <SubscriptionModal
          showSubscriptionModal={showSubscriptionModal}
          setShowSubscriptionModal={setShowSubscriptionModal}
          subscriptionEmail={subscriptionEmail}
          setSubscriptionEmail={setSubscriptionEmail}
          isSubscribed={isSubscribed}
          frequency={frequency}
          setFrequency={setFrequency}
          subLocation={subLocation}
          setSubLocation={setSubLocation}
          subMinSalary={subMinSalary}
          setSubMinSalary={setSubMinSalary}
          subInternship={subInternship}
          setSubInternship={setSubInternship}
          availableLocations={availableLocations}
          subFile={resumeFile}
          setSubFile={setResumeFile}
          selectedResumeId={selectedResumeId}
          setSelectedResumeId={setSelectedResumeId}
          resumes={resumes}
          handleSubscribeSubmit={handleSubscribeSubmit}
          handleTriggerUpdate={handleTriggerUpdate}
          handleUnsubscribe={handleUnsubscribe}
          subscribing={subscribing}
        />
      </div>
    </div >
  );
};

export default EmployeePortal;
