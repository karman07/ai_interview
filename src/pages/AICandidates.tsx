import { useState, useEffect } from 'react';
import { Bot, Star, Send, Eye, Download } from 'lucide-react';
import { apiService } from '../services/api';

export const AICandidates = () => {
  const [selectedJob, setSelectedJob] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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
      const response = await apiService.getRecommendedEmployees(selectedJob, 25);
      setCandidates({
        matches: response.recommendations || [],
        total: response.totalCandidates || 0,
        showing: response.recommendations?.length || 0
      });
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
    setRequestMessage(`Hi ${candidate.candidateProfile?.name || 'there'},

I came across your profile and was impressed by your background. We have an exciting opportunity for a ${jobTitle} position that seems like a great match for your skills.

Based on our AI analysis, you have a ${candidate.matchScore.toFixed(1)}% match with this role, particularly in areas like ${candidate.matchingKeywords?.slice(0, 3).join(', ')}.

Would you be interested in learning more about this opportunity?

Best regards`);
    setShowRequestModal(true);
  };

  const sendRequest = async () => {
    try {
      await apiService.inviteCandidate(selectedJob, selectedCandidate?.userId, requestMessage);
      setShowRequestModal(false);
      setRequestMessage('');
      setSelectedCandidate(null);
      // Refresh candidates to update invite status
      fetchCandidates();
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
              <div key={candidate.userId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {candidate.candidateProfile?.name?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {candidate.candidateProfile?.name || 'Candidate'}
                    </h3>
                    <div className={`px-3 py-1 rounded-full ${getScoreBg(candidate.matchScore / 100)}`}>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className={`font-semibold ${getScoreColor(candidate.matchScore / 100)}`}>
                          {candidate.matchScore.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {candidate.candidateProfile?.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{candidate.candidateProfile.email}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Skills Match: </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {candidate.skillsMatch.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Experience: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {candidate.experienceMatch.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {candidate.interviewScores && candidate.interviewScores.totalInterviews > 0 && (
                    <div className="flex items-center space-x-4 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Interview: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {candidate.interviewScores.overall.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Technical: </span>
                        <span className="font-semibold">{candidate.interviewScores.technical.toFixed(1)}/10</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {candidate.interviewScores.totalInterviews} interviews
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchingKeywords?.slice(0, 6).map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {candidate.suggestions && candidate.suggestions.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                      💡 {candidate.suggestions[0]}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button 
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowViewModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="View Profile"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => window.open(candidate.candidateProfile?.profile?.resumeUrl || '#', '_blank')}
                  className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  title="Download Resume"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRequestCandidate(candidate)}
                  disabled={candidate.hasApplied}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {candidate.hasApplied ? 'Applied' : 'Request'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {candidate.missingSkills?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Skills to Develop:</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missingSkills.map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.hasApplied && (
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      Already Applied
                    </span>
                  </div>
                )}
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
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
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

      {showViewModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Candidate Profile
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedCandidate.candidateProfile?.name?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCandidate.candidateProfile?.name || 'Candidate'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCandidate.candidateProfile?.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCandidate.candidateProfile?.profile?.experience}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{selectedCandidate.matchScore.toFixed(1)}%</div>
                    <p className="text-sm text-gray-500">Match Score</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Match Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Skills Match:</span>
                        <span className="font-semibold text-green-600">{selectedCandidate.skillsMatch.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Experience Match:</span>
                        <span className="font-semibold text-blue-600">{selectedCandidate.experienceMatch.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {selectedCandidate.interviewScores && selectedCandidate.interviewScores.totalInterviews > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Interview Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Overall:</span>
                          <span className="font-semibold">{selectedCandidate.interviewScores.overall.toFixed(1)}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Technical:</span>
                          <span className="font-semibold">{selectedCandidate.interviewScores.technical.toFixed(1)}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Behavioral:</span>
                          <span className="font-semibold">{selectedCandidate.interviewScores.behavioral.toFixed(1)}/10</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          {selectedCandidate.interviewScores.totalInterviews} interviews completed
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.matchingKeywords?.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedCandidate.missingSkills?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.missingSkills.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.suggestions && selectedCandidate.suggestions.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Insights</h4>
                    <ul className="space-y-1">
                      {selectedCandidate.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                          💡 {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleRequestCandidate(selectedCandidate);
                    }}
                    disabled={selectedCandidate.hasApplied}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedCandidate.hasApplied ? 'Already Applied' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};