import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Building2, ExternalLink, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/constants/routes';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  description: string;
  postedDate: string;
  url?: string;
}

const JobsPublicPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/jobs?limit=5');
      const data = await response.json();
      setJobs(data.slice(0, 5)); // Show only 5 jobs
    } catch (error) {
      // Fallback mock data
      setJobs([
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          salary: '$120k - $180k',
          type: 'Full-time',
          description: 'We are looking for an experienced Frontend Developer to join our team...',
          postedDate: '2 days ago',
          url: 'https://example.com/job1'
        },
        {
          id: '2',
          title: 'Backend Engineer',
          company: 'StartupXYZ',
          location: 'Remote',
          salary: '$100k - $150k',
          type: 'Full-time',
          description: 'Join our backend team to build scalable microservices...',
          postedDate: '1 week ago',
          url: 'https://example.com/job2'
        },
        {
          id: '3',
          title: 'Full Stack Developer',
          company: 'Innovation Labs',
          location: 'New York, NY',
          salary: '$110k - $160k',
          type: 'Full-time',
          description: 'Looking for a versatile developer comfortable with both frontend and backend...',
          postedDate: '3 days ago',
          url: 'https://example.com/job3'
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'Cloud Solutions Inc',
          location: 'Austin, TX',
          salary: '$130k - $170k',
          type: 'Full-time',
          description: 'Seeking a DevOps engineer to manage our cloud infrastructure...',
          postedDate: '5 days ago',
          url: 'https://example.com/job4'
        },
        {
          id: '5',
          title: 'UI/UX Designer',
          company: 'Design Studio',
          location: 'Los Angeles, CA',
          salary: '$90k - $130k',
          type: 'Full-time',
          description: 'Creative designer needed to craft beautiful user experiences...',
          postedDate: '1 week ago',
          url: 'https://example.com/job5'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/jobs');
      navigate(routes.login);
    } else {
      // Navigate to authenticated jobs page or open application
      navigate(routes.jobListings);
    }
  };

  const handleViewMore = () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/jobs');
      navigate(routes.login);
    } else {
      navigate(routes.jobListings);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-6">
            <Briefcase className="w-3.5 h-3.5 mr-2" />
            Career Opportunities
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover amazing opportunities from top companies. Login to unlock full access and apply directly.
          </p>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Loading jobs...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">{job.company}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{job.location}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{job.salary}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{job.type}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-sm line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 font-medium">
                            <span>Posted {job.postedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:w-40 md:flex-shrink-0">
                      <button
                        onClick={() => handleApply()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        {!isAuthenticated && <Lock className="w-3.5 h-3.5" />}
                        Apply Now
                      </button>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          View Details
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Login CTA */}
            {!isAuthenticated && (
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 dark:text-gray-400">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Want to See More Jobs?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                  Login to unlock hundreds of job opportunities and apply directly to companies.
                </p>
                <button
                  onClick={handleViewMore}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Login to View More Jobs
                </button>
              </div>
            )}

            {isAuthenticated && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleViewMore}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  View All Jobs
                </button>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
};

export default JobsPublicPage;
