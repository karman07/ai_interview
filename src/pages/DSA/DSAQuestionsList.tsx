import React, { useEffect, useState } from 'react';
import { useDSAQuestions } from '@/contexts/DSAQuestionsContext';
import { useDSAProgress } from '@/contexts/DSAProgressContext';
import QuestionCard from '@/components/dsa/QuestionCard';
import { Difficulty } from '@/types/dsa';

const DSAQuestionsList: React.FC = () => {
  const { questions, pagination, loading, error, fetchQuestions } = useDSAQuestions();
  const { myProgress, fetchMyProgress } = useDSAProgress();

  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'difficulty' | 'likes' | 'acceptanceRate'>('difficulty');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    // Ensure page and limit are always valid numbers >= 1
    const validPage = Math.max(1, currentPage);
    const validLimit = Math.max(1, limit);

    const filters: any = {
      page: validPage,
      limit: validLimit,
      sortBy,
      sortOrder,
    };

    if (difficulty) filters.difficulty = difficulty;
    if (category) filters.category = category;
    if (search) filters.search = search;

    console.log('Fetching DSA questions with filters:', filters);
    fetchQuestions(filters);
  }, [difficulty, category, search, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchMyProgress();
  }, []);

  const getUserProgress = (questionId: string) => {
    // Add safety check for undefined myProgress
    return myProgress?.find((p) => p.questionId === questionId);
  };

  const categories = [
    'Array',
    'String',
    'HashTable',
    'Tree',
    'Graph',
    'Dynamic Programming',
    'Sorting',
    'Searching',
    'LinkedList',
    'Stack',
    'Queue',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DSA Problems</h1>
          <p className="text-gray-600">
            Practice data structures and algorithms to ace your interviews
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'difficulty' | 'likes' | 'acceptanceRate')
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="difficulty">Difficulty</option>
                  <option value="likes">Likes</option>
                  <option value="acceptanceRate">Acceptance Rate</option>
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
                setCategory('');
                setSearch('');
                setSortBy('difficulty');
                setSortOrder('asc');
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
