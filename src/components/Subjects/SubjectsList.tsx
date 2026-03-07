import React from "react";
import { useSubjects } from "@/contexts/SubjectsContext";
import { SubjectCard } from "./SubjectCard";
import { Search, Filter, BookOpen, TrendingUp } from "lucide-react";

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
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (loadingIndicator.type === "error") {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error loading subjects</p>
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">{loadingIndicator.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search and Filters Section */}
      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Search & Filters</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Design, Machine Learning, React..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-300 text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="min-w-[200px] relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
              </select>
              <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Level Filter */}
            <div className="min-w-[180px] relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full appearance-none px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <TrendingUp className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Available Subjects
              {subjects.length > 0 && (
                <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                  ({subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'})
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Subjects Grid or Empty State */}
        {subjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No subjects found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
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