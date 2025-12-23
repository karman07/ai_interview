import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLessons, SubLesson, Lesson } from "@/contexts/LessonsContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  Play,
  Clock,
  Award,
  Target,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

interface ProgressData {
  _id: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progressPercent: number;
  score?: number;
  timeSpent: number;
  lastAccessed: Date;
}

interface ProgressState {
  [id: string]: ProgressData;
}

interface StoredState {
  progress: ProgressState;
  lastLessonId: string | null;
  lastSubLessonId: string | null;
}

const LessonDetailsPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { lessons, fetchLessons, quizzes, fetchQuizzes, isLoading } = useLessons();
  const { refreshProgress } = useProgress();

  const [progress, setProgress] = useState<ProgressState>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSubLesson, setCurrentSubLesson] = useState<SubLesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qid: string]: string }>({});
  const [quizResults, setQuizResults] = useState<{ correct: number; wrong: number } | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);

  // Fetch progress from API
  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/progress`);
      const progressData = response.data.data || [];
      const progressMap: ProgressState = {};
      progressData.forEach((p: ProgressData) => {
        progressMap[p.lessonId] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  // Load lessons and progress
  useEffect(() => {
    if (subjectId) {
      fetchLessons(subjectId);
      fetchProgress();
    }
  }, [subjectId]);

  // Initialize state from localStorage
  useEffect(() => {
    if (subjectId && lessons.length > 0) {
      console.log('📚 Lessons loaded:', lessons);
      const stored = localStorage.getItem(`lessonProgress-${subjectId}`);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        setProgress(parsed.progress || {});
        const lastLesson =
          lessons.find((l) => l._id === parsed.lastLessonId) || lessons[0];
        // Create subLessons from lessons if they don't exist
        const subLessons = lastLesson.subLessons?.length > 0 
          ? lastLesson.subLessons 
          : [{ _id: lastLesson._id, title: lastLesson.title, content: lastLesson.content, order: 1 }];
        const lastSubLesson = subLessons.find((s) => s._id === parsed.lastSubLessonId) || subLessons[0];
        setCurrentLesson({ ...lastLesson, subLessons });
        setCurrentSubLesson(lastSubLesson);
      } else {
        const firstLesson = lessons[0];
        const subLessons = firstLesson.subLessons?.length > 0 
          ? firstLesson.subLessons 
          : [{ _id: firstLesson._id, title: firstLesson.title, content: firstLesson.content, order: 1 }];
        setCurrentLesson({ ...firstLesson, subLessons });
        setCurrentSubLesson(subLessons[0]);
      }
    }
  }, [lessons, subjectId]);

  // Persist state to localStorage
  useEffect(() => {
    if (subjectId) {
      const state: StoredState = {
        progress,
        lastLessonId: currentLesson?._id || null,
        lastSubLessonId: currentSubLesson?._id || null,
      };
      localStorage.setItem(`lessonProgress-${subjectId}`, JSON.stringify(state));
    }
  }, [progress, currentLesson, currentSubLesson, subjectId]);

  // Fetch quizzes on lesson change
  useEffect(() => {
    if (currentLesson) fetchQuizzes(currentLesson._id);
    setQuizResults(null);
    setSelectedAnswers({});
    setShowAnswers(false);
  }, [currentLesson]);

  const updateProgress = async (lessonId: string, status: 'not-started' | 'in-progress' | 'completed', progressPercent: number, score?: number) => {
    try {
      // Optimistically update local state
      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          _id: prev[lessonId]?._id || 'temp',
          lessonId,
          status,
          progressPercent: Math.round(progressPercent),
          score: score || prev[lessonId]?.score,
          timeSpent: prev[lessonId]?.timeSpent || 0,
          lastAccessed: new Date()
        }
      }));

      await axios.post(`${API_BASE_URL}/progress`, {
        lessonId,
        status,
        progressPercent: Math.round(progressPercent),
        score: score || null,
        timeSpent: 0
      });
      
      // Refresh from API to ensure sync
      await fetchProgress();
      // Also refresh global progress context
      refreshProgress();
    } catch (err) {
      console.error("❌ Failed to update progress API", err);
      // Revert on error
      await fetchProgress();
    }
  };

  const handleNext = async () => {
    if (!currentLesson || !currentSubLesson) return;
    const subLessons = currentLesson.subLessons;
    const idx = subLessons.findIndex((s) => s._id === currentSubLesson._id);

    const newProgress = Math.min(((idx + 1) / subLessons.length) * 100, 100);
    await updateProgress(currentLesson._id, 'in-progress', newProgress);

    if (idx < subLessons.length - 1) {
      setCurrentSubLesson(subLessons[idx + 1]);
      setQuizMode(false);
    } else {
      // Check if quiz exists for this lesson
      if (quizzes[currentLesson._id] && quizzes[currentLesson._id].length > 0) {
        setQuizMode(true);
      } else {
        // No quiz, move to next lesson
        await updateProgress(currentLesson._id, 'completed', 100);
        const lessonIdx = lessons.findIndex((l) => l._id === currentLesson._id);
        if (lessonIdx < lessons.length - 1) {
          const nextLesson = lessons[lessonIdx + 1];
          const nextSubLessons = nextLesson.subLessons?.length > 0 
            ? nextLesson.subLessons 
            : [{ _id: nextLesson._id, title: nextLesson.title, content: nextLesson.content, order: 1 }];
          setCurrentLesson({ ...nextLesson, subLessons: nextSubLessons });
          setCurrentSubLesson(nextSubLessons[0]);
          setQuizMode(false);
        }
      }
    }
  };

  const handlePrev = () => {
    if (!currentLesson || !currentSubLesson) return;
    const subLessons = currentLesson.subLessons;
    const idx = subLessons.findIndex((s) => s._id === currentSubLesson._id);

    if (idx > 0) {
      setCurrentSubLesson(subLessons[idx - 1]);
      setQuizMode(false);
    } else {
      const lessonIdx = lessons.findIndex((l) => l._id === currentLesson._id);
      if (lessonIdx > 0) {
        const prevLesson = lessons[lessonIdx - 1];
        setCurrentLesson(prevLesson);
        setCurrentSubLesson(prevLesson.subLessons[prevLesson.subLessons.length - 1] || null);
        setQuizMode(false);
      }
    }
  };

  const handleQuizSubmit = () => {
    if (!currentLesson) return;
    const quiz = quizzes[currentLesson._id] || [];
    let correct = 0;
    let wrong = 0;

    quiz.forEach((q) => {
      if (selectedAnswers[q._id] === q.correctAnswer) correct++;
      else wrong++;
    });

    setQuizResults({ correct, wrong });
    const score = Math.round((correct / quiz.length) * 100);
    updateProgress(currentLesson._id, 'completed', 100, score);
    setShowAnswers(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">Loading your lessons...</p>
        </div>
      </div>
    );
  }

  if (!lessons.length || !currentLesson || !currentSubLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center justify-center h-96 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No lessons available</h2>
            <p className="text-gray-600 dark:text-gray-400">There are no lessons to display for this subject.</p>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter((l) => progress[l._id]?.status === 'completed').length;
  const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const quizData = quizResults
    ? [
        { name: "Correct", value: quizResults.correct, color: "#10b981" },
        { name: "Wrong", value: quizResults.wrong, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Sidebar */}
      <aside className="w-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-white/50 dark:border-gray-700/50 shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-200/50 dark:border-gray-700/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-all duration-200 hover:gap-4 mb-4"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Subjects
          </button>
          
          {/* Progress Overview */}
          <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-gray-600/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Course Progress
              </h3>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {completedCount} of {lessons.length} lessons completed
            </p>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {lessons.map((lesson, lessonIndex) => {
            const lessonProgress = progress[lesson._id];
            const isCurrentLesson = currentLesson?._id === lesson._id;
            const isCompleted = lessonProgress?.status === 'completed';
            const isInProgress = lessonProgress?.status === 'in-progress';
            
            return (
              <div key={lesson._id} className="space-y-2">
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  isCurrentLesson 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-md" 
                    : "bg-white/60 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600 hover:bg-white/80 dark:hover:bg-gray-700/60"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-md ${
                      isCompleted 
                        ? "bg-green-100 dark:bg-green-900/50" 
                        : isInProgress 
                        ? "bg-yellow-100 dark:bg-yellow-900/50" 
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ) : isInProgress ? (
                        <Clock className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex-1 truncate">{lesson.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-gray-300 font-medium">
                        #{lessonIndex + 1}
                      </div>
                      {lessonProgress?.score && (
                        <div className="text-xs px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 font-medium">
                          {lessonProgress.score}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {lesson.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 leading-relaxed">{lesson.description}</p>
                  )}
              
                  <div className="space-y-1.5 mt-2">
                    {(lesson.subLessons?.length > 0 
                      ? lesson.subLessons 
                      : [{ _id: lesson._id, title: lesson.title, content: lesson.content, order: 1 }]
                    ).map((sub, subIndex) => {
                      const isActive = currentSubLesson?._id === sub._id;
                      return (
                        <div
                          key={sub._id}
                          onClick={() => {
                            const subLessons = lesson.subLessons?.length > 0 
                              ? lesson.subLessons 
                              : [{ _id: lesson._id, title: lesson.title, content: lesson.content, order: 1 }];
                            setCurrentLesson({ ...lesson, subLessons });
                            setCurrentSubLesson(sub);
                            setQuizMode(false);
                          }}
                          className={`group p-2 rounded-md cursor-pointer transition-all duration-200 ${
                            isActive
                              ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-600"
                              : "hover:bg-gray-50 dark:hover:bg-gray-600/40 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                            }`}>
                              {subIndex + 1}
                            </div>
                            <span className="text-xs font-medium text-slate-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex-1 truncate">
                              {sub.title}
                            </span>
                            {isActive && (
                              <Play className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                {quizzes[lesson._id] && quizzes[lesson._id].length > 0 && (
                  <div
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setQuizMode(true);
                    }}
                    className={`group p-2 mt-2 rounded-md cursor-pointer transition-all duration-200 border ${
                      quizMode && currentLesson._id === lesson._id
                        ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-600"
                        : "hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-green-100 dark:bg-green-800">
                        <HelpCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors flex-1">
                        Quiz
                      </span>
                      <div className="text-xs px-1.5 py-0.5 rounded-md bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-300 font-medium">
                        {quizzes[lesson._id].length}Q
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Keep Learning!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">You are doing great</p>
          </div>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Enhanced Progress Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/50 dark:border-gray-700/50 shadow-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Learning Progress
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900">
                  <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{overallProgress}% Complete</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="absolute -top-1 transition-all duration-700 ease-out" style={{ left: `${overallProgress}%` }}>
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 transform -translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {!quizMode ? (
              <>
                {/* Enhanced Lesson Header */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-8 mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                      <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{currentSubLesson.title}</h1>
                      {currentLesson.description && (
                        <div className="mb-4">
                          <p className={`text-lg text-slate-600 dark:text-gray-400 ${!expandedDescription ? 'line-clamp-2' : ''}`}>
                            {currentLesson.description}
                          </p>
                          {currentLesson.description.length > 150 && (
                            <button
                              onClick={() => setExpandedDescription(!expandedDescription)}
                              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                            >
                              {expandedDescription ? (
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
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Lesson {lessons.findIndex(l => l._id === currentLesson._id) + 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{currentLesson.subLessons?.length || 1} Parts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Video Player */}
                <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-white/50 bg-black">
                  <Plyr
                    source={{
                      type: "video",
                      sources: [
                        {
                          src: (() => {
                            const url = currentSubLesson.videoUrl || currentLesson.videoUrl || "UmnCZ7-9yDY";
                            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                              const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
                              return match ? match[1] : url;
                            }
                            return url;
                          })(),
                          provider: (() => {
                            const url = currentSubLesson.videoUrl || currentLesson.videoUrl || "";
                            return url.includes('youtube.com') || url.includes('youtu.be') || !url.startsWith('http') ? "youtube" : "html5";
                          })(),
                        },
                      ],
                    }}
                  />
                </div>

                {/* Enhanced Content Sections */}
                {currentSubLesson.content.map((block, i) => (
                  <div
                    key={i}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-8 mb-6 hover:shadow-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-full"></div>
                      {block.heading.replace(/\*+/g, '').trim()}
                    </h2>
                    <ul className="space-y-3">
                      {block.points.map((pt, j) => (
                        <li key={j} className="flex items-start gap-3 text-slate-700 dark:text-gray-300 leading-relaxed">
                          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-lg">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Enhanced Navigation */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handlePrev}
                    className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-lg text-slate-700 dark:text-gray-300 font-medium transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                  >
                    Continue Learning
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300">
                {!quizResults ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 inline-block mb-4">
                        <HelpCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        Quiz Time: {currentLesson.title}
                      </h2>
                      <p className="text-slate-600 dark:text-gray-400">Test your knowledge and earn points!</p>
                    </div>

                    {quizzes[currentLesson._id]?.length > 0 ? (
                      <>
                        <div className="space-y-8">
                          {quizzes[currentLesson._id].map((q, i) => (
                            <div key={q._id} className="p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 border border-slate-200 dark:border-gray-600">
                              <p className="font-bold text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                                  {i + 1}
                                </div>
                                {q.question}
                              </p>
                              <div className="grid gap-3 mt-4">
                                {q.options.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() =>
                                      setSelectedAnswers((prev) => ({ ...prev, [q._id]: opt }))
                                    }
                                    className={`text-left py-4 px-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-102 ${
                                      selectedAnswers[q._id] === opt
                                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-blue-300 dark:border-blue-600 shadow-md"
                                        : "border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        selectedAnswers[q._id] === opt
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : "border-slate-300 dark:border-gray-500"
                                      }`}>
                                        {selectedAnswers[q._id] === opt && <span className="text-xs">✓</span>}
                                      </div>
                                      <span className="font-medium text-slate-900 dark:text-white">{opt}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-center mt-8">
                          <button
                            onClick={handleQuizSubmit}
                            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <Award className="h-6 w-6" />
                              Submit Quiz & See Results
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl opacity-20 mb-4">📝</div>
                        <p className="text-xl text-slate-500 dark:text-gray-400 font-medium">No quiz available for this lesson</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-8">
                    {/* Show Answers Section */}
                    {showAnswers && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Review</h3>
                          <p className="text-slate-600 dark:text-gray-400">Review your answers and see the correct ones</p>
                        </div>
                        
                        {quizzes[currentLesson._id].map((q, i) => (
                          <div key={q._id} className="p-6 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <p className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-gray-600 text-white flex items-center justify-center text-sm font-bold">
                                {i + 1}
                              </div>
                              {q.question}
                            </p>
                            
                            <div className="grid gap-3">
                              {q.options.map((opt) => {
                                const isSelected = selectedAnswers[q._id] === opt;
                                const isCorrect = opt === q.correctAnswer;
                                const isWrongSelection = isSelected && !isCorrect;
                                
                                return (
                                  <div
                                    key={opt}
                                    className={`py-3 px-4 rounded-lg border-2 ${
                                      isCorrect
                                        ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-800 dark:text-green-300"
                                        : isWrongSelection
                                        ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-800 dark:text-red-300"
                                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        isCorrect
                                          ? "bg-green-600 border-green-600 text-white"
                                          : isWrongSelection
                                          ? "bg-red-600 border-red-600 text-white"
                                          : "border-gray-300 dark:border-gray-500"
                                      }`}>
                                        {isCorrect && <span className="text-xs">✓</span>}
                                        {isWrongSelection && <span className="text-xs">✗</span>}
                                      </div>
                                      <span className="font-medium">{opt}</span>
                                      {isSelected && (
                                        <span className="ml-auto text-sm font-semibold">
                                          Your Answer
                                        </span>
                                      )}
                                      {isCorrect && (
                                        <span className="ml-auto text-sm font-semibold text-green-600 dark:text-green-400">
                                          Correct Answer
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Results Section */}
                    <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-8">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 inline-block mb-6">
                        <Award className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Quiz Results
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                          <PieChart width={300} height={250}>
                            <Pie data={quizData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {quizData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                          <BarChart width={300} height={250} data={quizData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </div>
                      </div>
                      
                      <div className="mt-8 grid grid-cols-2 gap-6 max-w-md mx-auto">
                        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700">
                          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{quizResults.correct}</div>
                          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Correct Answers</div>
                        </div>
                        <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700">
                          <div className="text-3xl font-bold text-red-700 dark:text-red-400">{quizResults.wrong}</div>
                          <div className="text-sm font-medium text-red-600 dark:text-red-300">Wrong Answers</div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="text-6xl mb-4">
                          {quizResults.correct > quizResults.wrong ? "🎉" : quizResults.correct === quizResults.wrong ? "👍" : ""}
                        </div>
                        <p className="text-xl font-semibold text-slate-700 dark:text-gray-300">
                          {quizResults.correct > quizResults.wrong 
                            ? "Excellent work! You've mastered this topic!" 
                            : quizResults.correct === quizResults.wrong 
                            ? "Good effort! Keep learning to improve!"
                            : "Keep practicing! Review the lesson and try again."}
                        </p>
                        
                        <div className="mt-6">
                          <div className="text-lg font-medium text-slate-600 dark:text-gray-400 mb-2">
                            Your Score: {Math.round((quizResults.correct / (quizResults.correct + quizResults.wrong)) * 100)}%
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-4">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-green-600 h-4 rounded-full transition-all duration-700"
                              style={{ 
                                width: `${Math.round((quizResults.correct / (quizResults.correct + quizResults.wrong)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonDetailsPage;