import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building2, ArrowLeft, ExternalLink } from 'lucide-react';
import { getJobById } from '../../api/jobService';
import { Job } from '../../types/job';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        // If the API doesn't support getJobById, we might need to handle it or pass state from the previous page.
        // Assuming implementation in jobService handles it (or we might fail here if backend is strict).
        const data = await getJobById(jobId);
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch job", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>;

  if (error || !job) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="text-xl text-red-500 mb-4">{error || "Job not found"}</div>
      <button onClick={() => navigate('/employee/jobs')} className="text-indigo-600 hover:underline">Back to Jobs</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/employee/jobs')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{job.company}</p>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k</span>
                </div>
                {job.employment_type && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{job.employment_type}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => job.redirect_url ? window.open(job.redirect_url, '_blank') : null}
              disabled={!job.redirect_url}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
