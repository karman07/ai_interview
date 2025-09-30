import React from "react";
import { useSubjects } from "@/contexts/SubjectsContext";
import { useLessons } from "@/contexts/LessonsContext";
import { useInterview } from "@/contexts/InterviewContext";
import { useResults } from "@/contexts/ResultsContext";
import type { Difficulty } from "@/api/interviews";

// Loading indicator component
const LoadingIndicator: React.FC<{ 
  show: boolean; 
  message: string; 
  type: "loading" | "static" | "error" | "none";
  onRetry?: () => void;
}> = ({ show, message, type, onRetry }) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "loading":
        return "🔄";
      case "static":
        return "📋";
      case "error":
        return "❌";
      default:
        return "";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "loading":
        return "bg-blue-100 border-blue-300";
      case "static":
        return "bg-yellow-100 border-yellow-300";
      case "error":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <div className={`p-3 mb-4 border rounded-md ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIcon()}</span>
          <span className="text-sm font-medium">{message}</span>
        </div>
        {type === "error" && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// Example component using Subjects context with lazy loading
export const SubjectsExample: React.FC = () => {
  const {
    subjects,
    filters,
    loadingIndicator,
    isShowingStatic,
    hasRealData,
    setSearch,
    setCategoryFilter,
    retry,
  } = useSubjects();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Subjects with Lazy Loading</h2>
      
      <LoadingIndicator
        show={loadingIndicator.show}
        message={loadingIndicator.message}
        type={loadingIndicator.type}
        onRetry={retry}
      />

      {isShowingStatic && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            📋 Showing sample data while loading real content...
          </p>
        </div>
      )}

      {hasRealData && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            ✅ Real data loaded successfully!
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search subjects..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
        <select
          value={filters.categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Categories</option>
          <option value="Programming">Programming</option>
          <option value="Frontend">Frontend</option>
          <option value="System Design">System Design</option>
        </select>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject._id} className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">{subject.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{subject.description}</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {subject.category}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {subject.level}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {subject.lessons?.length || 0} lessons
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example component using Lessons context
export const LessonsExample: React.FC = () => {
  const {
    lessons,
    quizzes,
    loadingIndicator,
    isLoading,
    hasRealData,
    fetchLessons,
    fetchQuizzes,
    retry,
  } = useLessons();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lessons with Lazy Loading</h2>
      
      <LoadingIndicator
        show={loadingIndicator.show}
        message={loadingIndicator.message}
        type={loadingIndicator.type}
        onRetry={retry}
      />

      <div className="mb-4">
        <button
          onClick={() => fetchLessons("mock-1")}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Load Lessons for Subject
        </button>
      </div>

      {hasRealData && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">✅ Real lessons loaded!</p>
        </div>
      )}

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{lesson.title}</h3>
            <p className="text-gray-600 text-sm">{lesson.description}</p>
            
            <button
              onClick={() => fetchQuizzes(lesson._id)}
              className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Load Quizzes ({quizzes[lesson._id]?.length || 0})
            </button>
            
            {quizzes[lesson._id] && (
              <div className="mt-3 space-y-2">
                {quizzes[lesson._id].map((quiz) => (
                  <div key={quiz._id} className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">{quiz.question}</p>
                    <div className="mt-1 flex gap-2">
                      {quiz.options.map((option, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs rounded ${
                            option === quiz.correctAnswer
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example component using Interview context
export const InterviewExample: React.FC = () => {
  const {
    generatedQuestions,
    loadingIndicator,
    isShowingStatic,
    hasRealData,
    setDraft,
    generateQuestions,
    retry,
  } = useInterview();

  const handleGenerateQuestions = async () => {
    const sampleDraft = {
      jobDescription: "React developer with TypeScript experience",
      difficulty: "medium" as Difficulty,
      positionTitle: "Frontend Developer",
      count: 5,
    };
    
    setDraft(sampleDraft);
    await generateQuestions(sampleDraft);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Interview Questions with Lazy Loading</h2>
      
      <LoadingIndicator
        show={loadingIndicator.show}
        message={loadingIndicator.message}
        type={loadingIndicator.type}
        onRetry={retry}
      />

      <div className="mb-4">
        <button
          onClick={handleGenerateQuestions}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Generate Interview Questions
        </button>
      </div>

      {isShowingStatic && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            📋 Showing sample questions while generating...
          </p>
        </div>
      )}

      {hasRealData && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">✅ Custom questions generated!</p>
        </div>
      )}

      {generatedQuestions && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">
            Generated Questions ({generatedQuestions.length})
          </h3>
          {generatedQuestions.map((q, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <p className="font-medium">{q.question}</p>
              {q.answer && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Sample Answer:</strong> {q.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example component using Results context
export const ResultsExample: React.FC = () => {
  const {
    results,
    loadingIndicator,
    isShowingStatic,
    hasRealData,
    fetchMine,
    retry,
  } = useResults();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Results with Lazy Loading</h2>
      
      <LoadingIndicator
        show={loadingIndicator.show}
        message={loadingIndicator.message}
        type={loadingIndicator.type}
        onRetry={retry}
      />

      <div className="mb-4">
        <button
          onClick={fetchMine}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Load My Results
        </button>
      </div>

      {isShowingStatic && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            📋 Showing sample results while loading...
          </p>
        </div>
      )}

      {hasRealData && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">✅ Real results loaded!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result) => (
          <div key={result._id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{result.jobDescription}</h3>
            <div className="mt-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {result.difficulty}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-lg font-bold text-green-600">
                Score: {result.overall.overallScore}%
              </p>
              <p className="text-sm text-gray-600">
                {result.questions.length} questions • {result.items.length} answered
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {result.overall.summary}
            </p>
            {result.createdAt && (
              <p className="text-xs text-gray-500 mt-2">
                {new Date(result.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main demo component
export const LazyLoadingDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Lazy Loading Context Examples
        </h1>
        
        <div className="space-y-8">
          <SubjectsExample />
          <hr className="my-8" />
          <LessonsExample />
          <hr className="my-8" />
          <InterviewExample />
          <hr className="my-8" />
          <ResultsExample />
        </div>
      </div>
    </div>
  );
};