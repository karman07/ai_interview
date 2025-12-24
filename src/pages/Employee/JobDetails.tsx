import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Building2, CheckCircle, ArrowLeft } from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    setJob({
      _id: jobId,
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      salaryRange: { min: 120000, max: 180000 },
      jobType: 'full-time',
      experienceLevel: 'senior',
      skills: ['React', 'TypeScript', 'Node.js'],
      requirements: ['5+ years experience', 'Strong React skills', 'TypeScript proficiency'],
      benefits: ['Health Insurance', '401k', 'Remote Work'],
      description: 'We are looking for an experienced Frontend Developer...',
      companyInfo: 'Tech Corp is a leading technology company...',
      hasApplied: false,
      postedAt: new Date()
    });
  }, [jobId]);

  const handleApply = async () => {
    // API call here
    setShowApplyModal(false);
    navigate('/employee/applications');
  };

  if (!job) return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/employee/jobs')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{job.company}</p>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>${job.salaryRange.min / 1000}k - ${job.salaryRange.max / 1000}k</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{job.jobType}</span>
                </div>
              </div>
            </div>
            {!job.hasApplied && (
              <button onClick={() => setShowApplyModal(true)} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105">
                Apply Now
              </button>
            )}
            {job.hasApplied && (
              <div className="px-8 py-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Applied
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">{skill}</span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full font-medium">{benefit}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Apply for {job.title}</h2>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Cover Letter</label>
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={6} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-gray-900 dark:text-white transition-colors resize-none" placeholder="Tell us why you're a great fit..."></textarea>
            </div>
            <div className="flex gap-4">
              <button onClick={handleApply} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                Submit Application
              </button>
              <button onClick={() => setShowApplyModal(false)} className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
