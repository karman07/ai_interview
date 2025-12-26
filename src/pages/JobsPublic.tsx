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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-pink-100/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-5 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg mb-8 border border-indigo-200/50 dark:border-indigo-700/50">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Career Opportunities</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            Find Your Dream Job
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover amazing opportunities from top companies. Login to unlock full access and apply directly.
          </p>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 p-6 md:p-8 group hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{job.company}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{job.salary}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            {job.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Posted {job.postedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 md:ml-4">
                      <button
                        onClick={() => handleApply()}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                      >
                        {!isAuthenticated && <Lock className="w-4 h-4" />}
                        Apply Now
                      </button>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          View Details
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Login CTA */}
            {!isAuthenticated && (
              <div className="mt-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 text-center">
                  <Lock className="w-16 h-16 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Want to See More Jobs?
                  </h2>
                  <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                    Login to unlock hundreds of job opportunities and apply directly to companies.
                  </p>
                  <button
                    onClick={handleViewMore}
                    className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                  >
                    Login to View More Jobs
                  </button>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleViewMore}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  View All Jobs
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default JobsPublicPage;
