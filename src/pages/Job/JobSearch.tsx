import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, Star, Heart, ExternalLink, Filter,Clock, Building } from 'lucide-react';

// Type definitions
interface FormData {
  jobTitle: string;
  skills: string;
  location: string;
  experience: string;
  jobType: string;
  salaryRange: string;
  industry: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  match: number;
  skills: string[];
  description: string;
  logo: string;
}

const JobSearchApp: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    skills: '',
    location: '',
    experience: '',
    jobType: '',
    salaryRange: '',
    industry: ''
  });
  
  const [showResults, setShowResults] = useState<boolean>(false);
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());

  // Mock job data that would typically come from an API
  const mockJobs: Job[] = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechFlow Inc",
      location: "San Francisco, CA",
      salary: "$120K - $150K",
      type: "Full-time",
      posted: "2 days ago",
      match: 95,
      skills: ["React", "TypeScript", "Node.js"],
      description: "We're looking for a passionate frontend developer to join our growing team...",
      logo: "🚀"
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Creative Studios",
      location: "Remote",
      salary: "$90K - $110K",
      type: "Full-time",
      posted: "1 day ago",
      match: 88,
      skills: ["Figma", "Adobe XD", "Prototyping"],
      description: "Join our design team to create beautiful user experiences...",
      logo: "🎨"
    },
    {
      id: 3,
      title: "Full Stack Engineer",
      company: "StartupHub",
      location: "New York, NY",
      salary: "$100K - $130K",
      type: "Full-time",
      posted: "3 days ago",
      match: 85,
      skills: ["Python", "React", "PostgreSQL"],
      description: "Build scalable applications that impact millions of users...",
      logo: "⚡"
    },
    {
      id: 4,
      title: "Product Manager",
      company: "InnovateCorp",
      location: "Austin, TX",
      salary: "$110K - $140K",
      type: "Full-time",
      posted: "1 week ago",
      match: 82,
      skills: ["Strategy", "Analytics", "Leadership"],
      description: "Lead product development from conception to launch...",
      logo: "📊"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (): void => {
    setShowResults(true);
  };

  const toggleSaveJob = (jobId: number): void => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const getMatchColor = (match: number): string => {
    if (match >= 90) return 'text-green-600 bg-green-100';
    if (match >= 80) return 'text-blue-600 bg-blue-100';
    if (match >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          /* Search Form */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Your Dream Job
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tell us about your skills and preferences, and we'll find the perfect opportunities that match your career goals
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Search className="h-4 w-4 text-indigo-600" />
                      <span>Job Title / Role</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Developer, Product Manager"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Star className="h-4 w-4 text-indigo-600" />
                      <span>Skills</span>
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., React, Python, Design, Leadership"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <span>Location</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., San Francisco, Remote, New York"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span>Experience Level</span>
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <option value="">Select Experience</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior Level (5-10 years)</option>
                      <option value="lead">Lead/Principal (10+ years)</option>
                    </select>
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <span>Job Type</span>
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <option value="">Select Type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-indigo-600" />
                      <span>Desired Salary</span>
                    </label>
                    <select
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <option value="">Select Range</option>
                      <option value="40-60k">$40K - $60K</option>
                      <option value="60-80k">$60K - $80K</option>
                      <option value="80-100k">$80K - $100K</option>
                      <option value="100-150k">$100K - $150K</option>
                      <option value="150k+">$150K+</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-3"
                  >
                    <Search className="h-5 w-5" />
                    <span>Find My Perfect Jobs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Perfect Matches for You</h2>
                <p className="text-gray-600 mt-2">Found {mockJobs.length} jobs that match your criteria</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-6 py-3 text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Modify Search</span>
                </button>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-6">
              {mockJobs.map((job: Job, index: number) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                        {job.logo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(job.match)}`}>
                            {job.match}% Match
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">{job.company}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.posted}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill: string, skillIndex: number) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-3 rounded-xl transition-all duration-200 ${
                          savedJobs.has(job.id)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2">
                        <span>Apply Now</span>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchApp;