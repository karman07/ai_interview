import React, { useEffect } from 'react';
import { useDSAProgress } from '@/contexts/DSAProgressContext';
import { useDSAQuestions } from '@/contexts/DSAQuestionsContext';
import DSAStatCard from '@/components/dsa/DSAStatCard';
import SubmissionHistory from '@/components/dsa/SubmissionHistory';
import { useNavigate } from 'react-router-dom';

const DSADashboard: React.FC = () => {
  const {
    statistics,
    recentSubmissions,
    myProgress,
    fetchStatistics,
    fetchRecentSubmissions,
    fetchMyProgress,
  } = useDSAProgress();
  const { statistics: globalStats, fetchStatistics: fetchGlobalStats } = useDSAQuestions();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
    fetchRecentSubmissions(10);
    fetchMyProgress();
    fetchGlobalStats();
  }, []);

  const solvedQuestions = myProgress?.filter((p) => p.status === 'Solved') || [];
  const bookmarkedQuestions = myProgress?.filter((p) => p.isBookmarked) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DSA Dashboard</h1>
          <p className="text-gray-600">Track your progress and improve your coding skills</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/dsa/questions')}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 font-medium text-left"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-bold">Browse Questions</div>
            <div className="text-sm opacity-90">Explore all DSA problems</div>
          </button>
          <button
            onClick={async () => {
              // Fetch a random question and navigate to it
              const response = await fetch('http://localhost:3000/dsa-questions/random');
              const data = await response.json();
              if (data.data) {
                navigate(`/dsa/questions/${data.data.questionId}`);
              }
            }}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-medium text-left"
          >
            <div className="text-2xl mb-2">🎲</div>
            <div className="font-bold">Random Question</div>
            <div className="text-sm opacity-90">Practice something new</div>
          </button>
          <button
            onClick={() => navigate('/dsa/questions?status=bookmarked')}
            className="bg-yellow-600 text-white px-6 py-4 rounded-lg hover:bg-yellow-700 font-medium text-left"
          >
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-bold">Bookmarked</div>
            <div className="text-sm opacity-90">
              {bookmarkedQuestions.length} saved questions
            </div>
          </button>
        </div>

        {/* Statistics Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DSAStatCard
              title="Total Questions"
              value={statistics?.totalQuestions || 0}
              subtitle={`${globalStats?.totalQuestions || 0} available`}
              icon="📊"
              color="blue"
            />
            <DSAStatCard
              title="Solved"
              value={statistics?.solvedQuestions || 0}
              subtitle={`${
                statistics?.solvedQuestions
                  ? ((statistics.solvedQuestions / (statistics.totalQuestions || 1)) * 100).toFixed(1)
                  : 0
              }% complete`}
              icon="✅"
              color="green"
            />
            <DSAStatCard
              title="Attempted"
              value={statistics?.attemptedQuestions || 0}
              subtitle="In progress"
              icon="🔄"
              color="yellow"
            />
            <DSAStatCard
              title="Success Rate"
              value={`${statistics?.successRate?.toFixed(1) || 0}%`}
              subtitle={`${statistics?.successfulSubmissions || 0}/${
                statistics?.totalSubmissions || 0
              } submissions`}
              icon="🎯"
              color="purple"
            />
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">By Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DSAStatCard
              title="Easy"
              value={`${statistics?.easySolved || 0} / ${globalStats?.easyCount || 0}`}
              subtitle={`${
                statistics?.easySolved
                  ? ((statistics.easySolved / (globalStats?.easyCount || 1)) * 100).toFixed(1)
                  : 0
              }% solved`}
              icon="🟢"
              color="green"
            />
            <DSAStatCard
              title="Medium"
              value={`${statistics?.mediumSolved || 0} / ${globalStats?.mediumCount || 0}`}
              subtitle={`${
                statistics?.mediumSolved
                  ? ((statistics.mediumSolved / (globalStats?.mediumCount || 1)) * 100).toFixed(1)
                  : 0
              }% solved`}
              icon="🟡"
              color="yellow"
            />
            <DSAStatCard
              title="Hard"
              value={`${statistics?.hardSolved || 0} / ${globalStats?.hardCount || 0}`}
              subtitle={`${
                statistics?.hardSolved
                  ? ((statistics.hardSolved / (globalStats?.hardCount || 1)) * 100).toFixed(1)
                  : 0
              }% solved`}
              icon="🔴"
              color="red"
            />
          </div>
        </div>

        {/* Category Progress */}
        {statistics?.categoriesProgress && Object.keys(statistics.categoriesProgress).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Progress by Category</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {Object.entries(statistics.categoriesProgress).map(([category, progress]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">{category}</span>
                      <span className="text-sm text-gray-600">
                        {progress.solved} / {progress.total} ({progress.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Time Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Time Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">Total Time Spent</span>
                <span className="font-semibold">
                  {Math.floor((statistics?.totalTimeSpent || 0) / 60)} min
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">Average Time per Question</span>
                <span className="font-semibold">
                  {Math.floor((statistics?.averageTimePerQuestion || 0) / 60)} min
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Current Streak</span>
                <span className="font-semibold">
                  {statistics?.recentActivity?.currentStreak || 0} days
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {statistics?.recentActivity?.lastSolved && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Last Solved</span>
                  <span className="font-semibold text-green-600">
                    {new Date(statistics.recentActivity.lastSolved).toLocaleDateString()}
                  </span>
                </div>
              )}
              {statistics?.recentActivity?.lastAttempted && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Last Attempted</span>
                  <span className="font-semibold text-blue-600">
                    {new Date(statistics.recentActivity.lastAttempted).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Bookmarked Questions</span>
                <span className="font-semibold">
                  {statistics?.bookmarkedQuestions || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <SubmissionHistory submissions={recentSubmissions} />

        {/* Solved Questions List */}
        {solvedQuestions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Solved Questions ({solvedQuestions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {solvedQuestions.slice(0, 12).map((progress) => (
                <button
                  key={progress.questionId}
                  onClick={() => navigate(`/dsa/questions/${progress.questionId}`)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow transition-all"
                >
                  <div className="font-medium text-gray-900">
                    {progress.question?.title || progress.questionId}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {progress.question?.difficulty && (
                      <span
                        className={
                          progress.question.difficulty === 'Easy'
                            ? 'text-green-600'
                            : progress.question.difficulty === 'Medium'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {progress.question.difficulty}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {solvedQuestions.length > 12 && (
              <button
                onClick={() => navigate('/dsa/questions?status=solved')}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                View all {solvedQuestions.length} solved questions →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSADashboard;
