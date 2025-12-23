import { useState, useEffect } from 'react';
import { Bot, Star, Send, Eye, Download } from 'lucide-react';
import { apiService } from '../services/api';

export const AICandidates = () => {
  const [selectedJob, setSelectedJob] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any>({ matches: [], total: 0, showing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchCandidates();
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const jobsData = await apiService.getMyJobs();
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const candidatesData = await apiService.getBestCandidates(selectedJob);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      setCandidates({ matches: [], total: 0, showing: 0 });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 dark:text-green-400';
    if (score >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (score >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 0.8) return 'bg-blue-100 dark:bg-blue-900/20';
    if (score >= 0.7) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const handleRequestCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    const jobTitle = jobs.find((j: any) => j._id === selectedJob)?.title || 'this position';
    setRequestMessage(`Hi,

I came across your profile and was impressed by your experience. Your background seems like a perfect fit for our ${jobTitle} position.

Would you be interested in learning more about this opportunity?

Best regards`);
    setShowRequestModal(true);
  };

  const sendRequest = async () => {
    try {
      await apiService.requestEmployee(selectedJob, selectedCandidate?.resume_id, requestMessage);
      setShowRequestModal(false);
      setRequestMessage('');
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bot className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
            AI-Powered Candidates
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Discover the best candidates using AI-powered resume matching
          </p>
        </div>
        
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {jobs.map((job: any) => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Matching Results</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Found {candidates.total} candidates, showing top {candidates.showing} matches
        </p>
      </div>

      <div className="grid gap-6">
        {Array.isArray(candidates.matches) && candidates.matches.length > 0 ? (
          candidates.matches.map((candidate: any) => (
          <div key={candidate.resume_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {candidate.resume_filename?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {candidate.resume_filename?.replace('.pdf', '').replace(/_/g, ' ') || 'Candidate'}
                    </h3>
                    <div className={`px-3 py-1 rounded-full ${getScoreBg(candidate.match_score)}`}>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className={`font-semibold ${getScoreColor(candidate.match_score)}`}>
                          {Math.round(candidate.match_score * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Resume Summary:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {candidate.resume_content || 'No resume content available'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRequestCandidate(candidate)}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Request
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {candidate.missing_keywords?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Missing Keywords:</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missing_keywords.map((keyword: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">AI Suggestions:</h4>
                  <ul className="space-y-1">
                    {candidate.suggestions?.slice(0, 2).map((suggestion: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No candidates found for this job.</p>
          </div>
        )}
      </div>

      {showRequestModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Request Candidate
                </h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personal Message
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={sendRequest}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};