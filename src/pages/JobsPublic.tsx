import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Building2, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/constants/routes';
import Button from '@/components/ui/button';
import { fetchJobs, type Job } from '@/api/jobService';

const JobsPublicPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const resp = await fetchJobs({ limit: 10 });
      setJobs(resp.jobs || []);
    } catch (err) {
      console.error("Failed to load public jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAction = (url?: string | null) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate(routes.login);
    } else if (url) {
      window.open(url, '_blank');
    } else {
      navigate(routes.jobListings);
    }
  };

  const handleViewMore = () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', routes.jobListings);
      navigate(routes.login);
    } else {
      navigate(routes.jobListings);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-blue-500/30 transition-colors duration-500">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium tracking-wide">CAREER OPPORTUNITIES</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">Dream Job</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Discover opportunities from top companies. Filter by your engineering discipline and apply directly.
          </p>


        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium">Loading opportunities...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-500/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-800">
                          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3">{job.company}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {job.location && (
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            {(job.salary_min > 0 || job.salary_max > 0) && (
                              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>${job.salary_min} - ${job.salary_max}</span>
                              </div>
                            )}
                            {job.employment_type && (
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{job.employment_type}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4 text-sm line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 font-medium">
                            {job.postedAt && <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:w-40 md:flex-shrink-0">
                      <Button
                        variant="primary"
                        onClick={() => handleAction(job.redirect_url)}
                        className="w-full justify-center"
                      >
                        {!isAuthenticated && <Lock className="w-3.5 h-3.5 mr-2" />}
                        Apply Now
                      </Button>

                      {job.redirect_url && (
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                          onClick={() => handleAction(job.redirect_url)}
                        >
                          Details
                          <ExternalLink className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No jobs found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your category filter to see more results.</p>
              </div>
            )}
          </div>
        )}

        {/* Login CTA */}
        {!isAuthenticated && !loading && jobs.length > 0 && (
          <div className="mt-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Unlock Full Access
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
              Login to view hundreds of exclusive job opportunities and apply directly to top companies.
            </p>
            <Button
              variant="primary"
              onClick={handleViewMore}
              className="px-8 py-3 h-auto text-lg"
            >
              Login to View More
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobsPublicPage;
