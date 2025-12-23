import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, baseURL } from "@/api/http";
import { useLessons } from "@/contexts/LessonsContext";
import { ArrowLeft, BookOpen, Clock, User, Tag, TrendingUp, Play, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

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
  const maxLength = 150;
  const shouldShowReadMore = lesson.description && lesson.description.length > maxLength;

  return (
    <div className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">
            {lesson.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
              className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
    fetchSubject();
    fetchLessons(id!); // fetch lessons from LessonsContext
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center justify-center h-96 space-y-6">
          <div className="text-6xl opacity-20">📚</div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Subject not found</h2>
            <p className="text-slate-600">The subject you're looking for doesn't exist or has been moved.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:gap-3"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to subjects
        </button>

        {/* Subject Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
          {subject.thumbnailUrl && (
            <div className="relative h-80 overflow-hidden">
              <img
                src={`${baseURL}${subject.thumbnailUrl}`}
                alt={subject.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-white">
                  <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">{subject.title}</h1>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-8 space-y-6">
            {!subject.thumbnailUrl && (
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {subject.title}
              </h1>
            )}
            
            <p className="text-gray-700 dark:text-gray-300 text-xl leading-relaxed font-light">
              {subject.description}
            </p>

            {/* Enhanced Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {subject.category && (
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/50 transition-colors duration-200">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{subject.category}</p>
                  </div>
                </div>
              )}
              
              {subject.level && (
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-800/50 group-hover:bg-orange-200 dark:group-hover:bg-orange-700/50 transition-colors duration-200">
                    <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Level</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{subject.level}</p>
                  </div>
                </div>
              )}
              
              {subject.estimatedTime && (
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800/50 group-hover:bg-green-200 dark:group-hover:bg-green-700/50 transition-colors duration-200">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{subject.estimatedTime}</p>
                  </div>
                </div>
              )}
              
              {subject.author && (
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-800/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-700/50 transition-colors duration-200">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Author</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{subject.author}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Start Button */}
            <div className="pt-8">
              <button
                onClick={() => {
                  if (lessons.length > 0) {
                    navigate(`/lessons/${subject._id}`);
                  }
                }}
                disabled={lessons.length === 0}
                className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Play className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                <span className="relative z-10">
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
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-1"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  {block.heading.replace(/\*+/g, '').trim()}
                </h2>
                <ul className="space-y-3">
                  {block.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-lg">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Lessons Section */}
        {lessons.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-8 hover:shadow-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Course Lessons</h2>
              <div className="ml-auto px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                {lessons.length} lessons
              </div>
            </div>
            
            <div className="grid gap-4">
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