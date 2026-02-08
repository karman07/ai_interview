import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Search } from 'lucide-react';
import { fetchJobs } from '../../api/jobService';
import { Job } from '../../types/job';

const EmployeeJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs({
          limit: 20,
          location: search // Basic search mapping 
        });
        setJobs(data.jobs);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce or simple effect for now
    const timeout = setTimeout(loadJobs, 500);
    return () => clearTimeout(timeout);
  }, [search, filter]); // Re-fetch when search/filter changes

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Browse Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400">Find your next opportunity</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-gray-900 dark:text-white transition-colors"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors">
            <option value="all">All Jobs</option>
            <option value="full-time">Full Time</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <div
                key={job.job_id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 p-6 group hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/employee/jobs/${job.job_id}`)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k</span>
                          </div>
                          {job.employment_type && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.employment_type}</span>
                            </div>
                          )}
                        </div>
                        {/* Description snippet instead of skills */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.redirect_url) window.open(job.redirect_url, '_blank');
                        else navigate(`/employee/jobs/${job.job_id}`);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeJobs;
