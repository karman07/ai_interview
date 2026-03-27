import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
  ExternalLink,
  Briefcase,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/constants/routes';
import {
  fetchJobs,
  type Job,
} from '@/api/jobService';

import NotificationPrompt from '@/components/common/NotificationPrompt';

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('United States');
  // Debounced value — API is only called when this changes
  const [debouncedLocation, setDebouncedLocation] = useState('United States');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedLocation(value), 600);
  };

  const handleApply = (url: string | null) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate(routes.login);
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const jobsData = await fetchJobs({
        limit: 50,
        location: debouncedLocation || undefined,
        country: debouncedLocation.toLowerCase().includes('united states') || debouncedLocation.toLowerCase() === 'us' || debouncedLocation.toLowerCase() === 'usa' ? 'us' : undefined,
      });
      setJobs(jobsData.jobs || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side filtering for title/description — no API needed
  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      job.title.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term)
    );
  });

  const formatSalary = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Search</h1>
          <p className="text-gray-600 dark:text-gray-400">Find and apply for your dream job</p>
        </div>

        {/* Search Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Jobs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title, company or keywords"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="City, state, or remote"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}\
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.job_id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 font-medium">
                        <Building2 className="h-3.5 w-3.5 mr-1.5" />
                        {job.company}
                      </div>
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {job.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </div>
                      {job.employment_type && (
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {job.employment_type}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                  </div>
                  <button
                    onClick={() => handleApply(job.redirect_url)}
                    disabled={!job.redirect_url}
                    className="ml-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                  >
                    Apply <ExternalLink className="h-3.5 w-3.5 ml-2" />
                  </button>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
      <NotificationPrompt userId={user?._id} />
    </div>
  );
};

export default JobSearch;