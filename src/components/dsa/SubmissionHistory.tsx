import React from 'react';
import { RecentSubmission } from '@/types/dsa';
import { useNavigate } from 'react-router-dom';

interface SubmissionHistoryProps {
  submissions?: RecentSubmission[];
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions = [] }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved':
        return 'text-green-600 bg-green-50';
      case 'Attempted':
        return 'text-yellow-600 bg-yellow-50';
      case 'Failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
      
      {submissions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No submissions yet</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission, index) => (
            <div
              key={index}
              onClick={() => navigate(`/dsa/questions/${submission.questionId}`)}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                    {submission.questionTitle || submission.questionId}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {submission.difficulty && (
                      <span className={`text-xs font-medium ${getDifficultyColor(submission.difficulty)}`}>
                        {submission.difficulty}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{submission.language}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>
                    {submission.testCasesPassed}/{submission.totalTestCases} passed
                  </span>
                  <span>{submission.executionTime}ms</span>
                </div>
                <span className="text-xs">{formatDate(submission.submittedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
