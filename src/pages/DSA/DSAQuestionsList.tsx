import React, { useEffect, useState } from 'react';
import { useDSAQuestions } from '@/contexts/DSAQuestionsContext';
import { useDSAProgress } from '@/contexts/DSAProgressContext';
import QuestionCard from '@/components/dsa/QuestionCard';
import { Difficulty } from '@/types/dsa';
import { Search, Filter, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';

const DSAQuestionsList: React.FC = () => {
  const { questions, pagination, loading, error, fetchQuestions } = useDSAQuestions();
  const { myProgress, fetchMyProgress } = useDSAProgress();

  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'solved' | 'attempted' | 'unsolved' | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'difficulty' | 'likes'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const validPage = Math.max(1, currentPage);
    const validLimit = Math.max(1, limit);

    const filters: any = {
      page: validPage,
      limit: validLimit,
      sortBy,
      sortOrder,
    };

    if (difficulty) filters.difficulty = difficulty;
    if (topic) filters.topic = topic;
    if (search) filters.search = search;
    if (status) filters.status = status;

    console.log('[DSA Questions] Fetching with filters:', filters);
    fetchQuestions(filters);
  }, [difficulty, topic, search, status, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchMyProgress();
  }, []);

  const getUserProgress = (questionId: string) => {
    return myProgress?.find((p) => p.questionId === questionId);
  };

  const topics = [
    'arrays',
    'strings',
    'trees',
    'graphs',
    'dp',
    'hash-table',
    'sorting',
    'searching',
    'linked-list',
    'stack',
    'queue',
    'heap',
    'binary-search',
    'two-pointers',
    'sliding-window',
  ];

  const stats = {
    total: pagination?.totalItems || 0,
    solved: myProgress?.filter(p => p.status === 'solved').length || 0,
    attempted: myProgress?.filter(p => p.status === 'attempted').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-600" />
            DSA Practice
          </h1>
          <p className="text-gray-600 mb-6">
            Master data structures and algorithms with {stats.total}+ problems
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.solved}</p>
                  <p className="text-sm text-gray-600">Solved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.attempted}</p>
                  <p className="text-sm text-gray-600">Attempted</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Problems</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search questions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as Difficulty | '');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="solved">Solved</option>
                <option value="attempted">Attempted</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as any)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Newest</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="likes">Most Liked</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setDifficulty('');
                setTopic('');
                setSearch('');
                setStatus('');
                setSortBy('createdAt');
                setSortOrder('desc');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        )}

        {/* Questions List */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No questions found. Try adjusting your filters.</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              {questions.map((question) => {
                const progress = getUserProgress(question.questionId);
                return (
                  <QuestionCard
                    key={question._id || question.questionId}
                    question={question}
                    userStatus={progress?.status}
                    isBookmarked={progress?.isBookmarked}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Pagination Info */}
            {pagination && (
              <p className="text-center text-sm text-gray-600 mt-4">
                Showing {(currentPage - 1) * limit + 1} -{' '}
                {Math.min(currentPage * limit, pagination.totalItems)} of{' '}
                {pagination.totalItems} questions
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DSAQuestionsList;
