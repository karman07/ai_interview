import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, baseURL } from "@/api/http";
import { useLessons } from "@/contexts/LessonsContext";
import { ArrowLeft, BookOpen, Clock, User, Tag, TrendingUp, Play, CheckCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import axios from "@/api/http";

interface Subject {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  estimatedTime?: string;
  author?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface LessonCardProps {
  lesson: any;
  index: number;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getProgressForLesson } = useProgress();
  const lessonProgress = getProgressForLesson(lesson._id);
  const isCompleted = lessonProgress?.status === 'completed';

  const maxLength = 150;
  const shouldShowReadMore = lesson.description && lesson.description.length > maxLength;

  return (
    <div className="group p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {lesson.title}
            </h3>
            {isCompleted && (
              <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {isExpanded || !shouldShowReadMore
              ? lesson.description
              : `${lesson.description.substring(0, maxLength)}...`}
          </p>
          {shouldShowReadMore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex-shrink-0">
          {isCompleted ? (
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SubjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lessons, fetchLessons } = useLessons();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Subject>(`${API_BASE_URL}/subjects/${id}`);
        setSubject(res.data);
      } catch (err) {
        console.error("Failed to load subject", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchSubject();
      fetchLessons(id);
    }
  }, [id, fetchLessons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">📚</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subject not found</h2>
            <p className="text-gray-500 dark:text-gray-400">The subject you're looking for doesn't exist.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to subjects
        </button>

        {/* Subject Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {subject.thumbnailUrl && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={`${baseURL}${subject.thumbnailUrl}`}
                alt={subject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-3xl font-bold text-white drop-shadow-md">{subject.title}</h1>
              </div>
            </div>
          )}

          <div className="p-8 space-y-6">
            {!subject.thumbnailUrl && (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {subject.title}
              </h1>
            )}

            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {subject.description}
            </p>

            {/* Enhanced Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              {subject.category && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                  <div className="text-blue-600 dark:text-blue-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{subject.category}</p>
                  </div>
                </div>
              )}

              {subject.level && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                  <div className="text-amber-600 dark:text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Level</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{subject.level}</p>
                  </div>
                </div>
              )}

              {subject.estimatedTime && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{subject.estimatedTime}</p>
                  </div>
                </div>
              )}

              {subject.author && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                  <div className="text-purple-600 dark:text-purple-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Author</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{subject.author}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  if (lessons.length > 0) {
                    navigate(`/lessons/${subject._id}`);
                  }
                }}
                disabled={lessons.length === 0}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Play className="h-5 w-5" />
                <span>
                  {lessons.length > 0 ? "Start Your Learning Journey" : "Loading Lessons..."}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {Array.isArray((subject as any).content) && (
          <div className="space-y-6">
            {(subject as any).content.map((block: { heading: string; points: string[] }, i: number) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  {block.heading.replace(/\*+/g, '').trim()}
                </h2>
                <ul className="space-y-2">
                  {block.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Lessons Section */}
        {lessons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Lessons</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold border border-gray-200 dark:border-gray-700">
                {lessons.length}
              </span>
            </div>

            <div className="grid gap-3">
              {lessons.map((lesson, index) => (
                <LessonCard key={lesson._id} lesson={lesson} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetailsPage;