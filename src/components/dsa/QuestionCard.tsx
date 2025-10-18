import React from 'react';
import { DSAQuestion } from '@/types/dsa';
import { useNavigate } from 'react-router-dom';

interface QuestionCardProps {
  question: DSAQuestion;
  userStatus?: 'Not Started' | 'Attempted' | 'Solved' | 'Failed';
  isBookmarked?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, userStatus, isBookmarked }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Solved':
        return 'text-green-600';
      case 'Attempted':
        return 'text-yellow-600';
      case 'Failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const handleClick = () => {
    navigate(`/dsa/questions/${question.questionId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {question.title}
            </h3>
            {isBookmarked && (
              <span className="text-yellow-500" title="Bookmarked">
                ⭐
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{question.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            question.difficulty
          )}`}
        >
          {question.difficulty}
        </span>
        {userStatus && (
          <span className={`text-xs font-medium ${getStatusColor(userStatus)}`}>
            {userStatus}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {question.categories?.slice(0, 3).map((category, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
          >
            {category}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span title="Likes">👍 {question.likes || 0}</span>
          <span title="Dislikes">👎 {question.dislikes || 0}</span>
          <span title="Submissions">📊 {question.submissions || 0}</span>
        </div>
        {question.acceptanceRate !== undefined && (
          <span className="text-green-600 font-medium">
            {question.acceptanceRate.toFixed(1)}% Accepted
          </span>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
