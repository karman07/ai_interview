import React from "react";
import { useSubjects } from "@/contexts/SubjectsContext";
import { SubjectCard } from "./SubjectCard";
import { Search, Filter, BookOpen } from "lucide-react";

export const SubjectsList: React.FC = () => {
  const {
    subjects,
    filters,
    isLoading,
    loadingIndicator,
    setSearch,
    setCategoryFilter,
    setLevelFilter,
  } = useSubjects();

  // Extract individual filter values from the filters object
  const { search, categoryFilter, levelFilter } = filters;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (loadingIndicator.type === "error") {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-semibold">Error loading subjects</p>
          <p className="text-red-500 text-sm mt-2">{loadingIndicator.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters Section */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Search & Filter</h2>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700"
            />
          </div>

          {/* Category Filter */}
          <div className="min-w-[200px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 bg-white"
            >
              <option value="">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="min-w-[180px]">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 bg-white"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Available Subjects
              {subjects.length > 0 && (
                <span className="ml-2 text-lg font-normal text-gray-500">
                  ({subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'})
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Subjects Grid or Empty State */}
        {subjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <SubjectCard key={subject._id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};