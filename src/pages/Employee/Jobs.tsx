import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter } from 'lucide-react';

const EmployeeJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    setJobs([
      { _id: '1', title: 'Senior Frontend Developer', company: 'Tech Corp', location: 'San Francisco, CA', salaryRange: { min: 120000, max: 180000 }, jobType: 'full-time', skills: ['React', 'TypeScript'], hasApplied: false, postedAt: new Date() },
      { _id: '2', title: 'Backend Engineer', company: 'StartupXYZ', location: 'Remote', salaryRange: { min: 100000, max: 150000 }, jobType: 'full-time', skills: ['Node.js', 'MongoDB'], hasApplied: true, postedAt: new Date() },
      { _id: '3', title: 'Full Stack Developer', company: 'Innovation Labs', location: 'New York, NY', salaryRange: { min: 110000, max: 160000 }, jobType: 'full-time', skills: ['React', 'Node.js'], hasApplied: false, postedAt: new Date() },
    ]);
  }, []);

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
            <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-gray-900 dark:text-white transition-colors" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors">
            <option value="all">All Jobs</option>
            <option value="full-time">Full Time</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div className="space-y-6">
          {jobs.map((job, index) => (
            <div key={job._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 p-6 group hover:scale-[1.02] cursor-pointer" onClick={() => navigate(`/employee/jobs/${job._id}`)} style={{ animationDelay: `${index * 100}ms` }}>
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
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${job.salaryRange.min / 1000}k - ${job.salaryRange.max / 1000}k</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.jobType}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {job.hasApplied ? (
                    <span className="px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold rounded-xl text-center">Applied</span>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/employee/jobs/${job._id}`); }} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeJobs;
