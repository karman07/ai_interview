import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
  ExternalLink,
  Briefcase,
  Clock,
} from 'lucide-react';
import {
  fetchJobs,
  type Job,
} from '@/api/jobService';

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [searchTerm, locationFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetching with basic filters mapped from UI
      const jobsData = await fetchJobs({
        limit: 50,
        // Passing search term as location for now if it looks like a location, 
        // or just fetching all and filtering client side if the API is limited.
        // The contract supports 'location'. 
        location: locationFilter || undefined
      });
      setJobs(jobsData.jobs);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for title/description if API doesn't support keyword search
  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const titleMatch = job.title.toLowerCase().includes(term);
    const descMatch = job.description.toLowerCase().includes(term);
    const companyMatch = job.company.toLowerCase().includes(term);

    // Location is already filtered by API if provided, but double check
    const locMatch = !locationFilter || (job.location?.toLowerCase().includes(locationFilter.toLowerCase()) ?? false);

    return (titleMatch || descMatch || companyMatch) && locMatch;
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
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
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="City, state, or remote"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
              <div key={job.job_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </div>
                      {job.employment_type && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.employment_type}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{job.description}</p>
                  </div>
                  <button
                    onClick={() => job.redirect_url ? window.open(job.redirect_url, '_blank') : null}
                    disabled={!job.redirect_url}
                    className="ml-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply <ExternalLink className="h-3 w-3 ml-2" />
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
    </div>
  );
};

export default JobSearch;