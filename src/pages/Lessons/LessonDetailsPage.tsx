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
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import axios from "@/api/http";
import { cn } from "@/utils/cn";

interface StoredState {
  lastLessonId: string | null;
  lastSubLessonId: string | null;
}

const renderFormattedText = (text?: string) => {
  if (!text) return null;
  // First cleanse image markdown if any
  const cleansed = text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
  const parts = cleansed.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const LessonDetailsPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSubLesson, setCurrentSubLesson] = useState<SubLesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qid: string]: string }>({});
  const [quizResults, setQuizResults] = useState<{ correct: number; wrong: number } | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);

  const { lessons, fetchLessons, fetchQuizzes, quizzes, isLoading } = useLessons();
  const { updateProgress, progress: globalProgress } = useProgress();

  // Fetch subject-wide data
  useEffect(() => {
    if (subjectId) {
      fetchLessons(subjectId);
    }
  }, [subjectId, fetchLessons]);

  // Load session state once lessons are available
  useEffect(() => {
    if (subjectId && lessons.length > 0 && !currentLesson) {
      const stored = localStorage.getItem(`lessonSession-${subjectId}`);
      if (stored) {
        try {
          const parsed: StoredState = JSON.parse(stored);
          const lastLesson = lessons.find((l) => l._id === parsed.lastLessonId) || lessons[0];
          const subLessons = lastLesson.subLessons?.length > 0
            ? lastLesson.subLessons
            : [{ _id: lastLesson._id, title: lastLesson.title, content: lastLesson.content, order: 1 }];
          const lastSubLesson = subLessons.find((s: any) => s._id === parsed.lastSubLessonId) || subLessons[0];

          setCurrentLesson({ ...lastLesson, subLessons });
          setCurrentSubLesson(lastSubLesson);
        } catch (e) {
          console.error("Failed to parse session", e);
        }
      } else {
        const firstLesson = lessons[0];
        const subLessons = firstLesson.subLessons?.length > 0
          ? firstLesson.subLessons
          : [{ _id: firstLesson._id, title: firstLesson.title, content: firstLesson.content, order: 1 }];
        setCurrentLesson({ ...firstLesson, subLessons });
        setCurrentSubLesson(subLessons[0]);
      }
    }
  }, [lessons, subjectId, currentLesson]);

  // Fetch quizzes and reset state on lesson change
  useEffect(() => {
    if (currentLesson?._id) {
      fetchQuizzes(currentLesson._id);
      setQuizResults(null);
      setSelectedAnswers({});
      setShowAnswers(false);
    }
  }, [currentLesson?._id, fetchQuizzes]);

  // Convert global progress array to map for easy access
  const progressMap = React.useMemo(() => {
    const map: { [key: string]: any } = {};
    globalProgress.forEach(p => {
      map[p.lessonId] = p;
    });
    return map;
  }, [globalProgress]);

  // Persist session state to localStorage
  useEffect(() => {
    if (subjectId && currentLesson?._id && currentSubLesson?._id) {
      const state = {
        lastLessonId: currentLesson._id,
        lastSubLessonId: currentSubLesson._id,
      };
      localStorage.setItem(`lessonSession-${subjectId}`, JSON.stringify(state));
    }
  }, [currentLesson?._id, currentSubLesson?._id, subjectId]);

  const handleNext = async () => {
    if (!currentLesson?._id || !currentSubLesson?._id) return;
    const subLessons = currentLesson.subLessons;
    const idx = subLessons.findIndex((s) => s._id === currentSubLesson._id);

    const newProgress = Math.min(((idx + 1) / subLessons.length) * 100, 100);
    await updateProgress(currentLesson._id, 'in-progress', newProgress);

    if (idx < subLessons.length - 1) {
      setCurrentSubLesson(subLessons[idx + 1]);
      setQuizMode(false);
    } else {
      // Check if quiz exists for this lesson
      const lessonQuizzes = quizzes[currentLesson._id] || [];
      if (lessonQuizzes.length > 0) {
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

  const completedCount = lessons.filter((l) => progressMap[l._id]?.status === 'completed').length;
  const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const quizData = quizResults
    ? [
      { name: "Correct", value: quizResults.correct, color: "#10b981" },
      { name: "Wrong", value: quizResults.wrong, color: "#ef4444" },
    ]
    : [];

  return (
    <div className="flex h-screen bg-white dark:bg-[#0B0F19]">
      {/* Enhanced Sidebar */}
      <aside className="w-80 bg-slate-50 dark:bg-slate-900/40 border-r border-slate-100 dark:border-slate-800/50 flex flex-col h-full shadow-2xl shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all text-[10px] uppercase tracking-widest mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to subjects
          </button>

          {/* Progress Overview */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-blue-600" />
                <h3 className="font-black text-slate-900 dark:text-white text-[9px] uppercase tracking-widest">
                  Course Progress
                </h3>
              </div>
              <span className="text-xs font-black text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lessons.map((lesson, lessonIndex) => {
            const lessonProgress = progressMap[lesson._id];
            const isCurrentLesson = currentLesson?._id === lesson._id;
            const isCompleted = lessonProgress?.status === 'completed';
            const isInProgress = lessonProgress?.status === 'in-progress';

            return (
              <div key={lesson._id} className="space-y-1">
                <div className={cn(
                  "p-3 rounded-2xl border transition-all duration-500",
                  isCurrentLesson
                    ? "bg-white dark:bg-slate-900 border-blue-500/30 shadow-md shadow-blue-500/5"
                    : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                )}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : isInProgress
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                    )}>
                      {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0">
                        <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">Part {lessonIndex + 1}</span>
                      </div>
                      <h3 className="font-black text-[11px] text-slate-900 dark:text-white truncate">{lesson.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {(lesson.subLessons?.length > 0
                      ? lesson.subLessons
                      : [{ _id: lesson._id, title: lesson.title, content: lesson.content, order: 1 }]
                    ).map((sub, subIndex) => {
                      const isActive = currentSubLesson?._id === sub._id;
                      return (
                        <button
                          key={sub._id}
                          onClick={() => {
                            const subLessons = lesson.subLessons?.length > 0
                              ? lesson.subLessons
                              : [{ _id: lesson._id, title: lesson.title, content: lesson.content, order: 1 }];
                            setCurrentLesson({ ...lesson, subLessons });
                            setCurrentSubLesson(sub);
                            setQuizMode(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 p-1.5 rounded-lg transition-all duration-300 group/item",
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black transition-all",
                            isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400 group-hover/item:bg-blue-500/10 group-hover/item:text-blue-600"
                          )}>
                            {subIndex + 1}
                          </div>
                          <span className="text-[9px] font-bold text-left flex-1 truncate">{sub.title}</span>
                          {isActive && <Play className="h-2 w-2 fill-current" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizzes[lesson._id] && quizzes[lesson._id].length > 0 && (
                    <button
                      onClick={() => {
                        setCurrentLesson(lesson);
                        setQuizMode(true);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 p-1.5 mt-1.5 rounded-lg border-2 border-dashed transition-all duration-300",
                        quizMode && currentLesson._id === lesson._id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-blue-500/20 dark:border-blue-500/10 text-blue-600 hover:bg-blue-500/10"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-md flex items-center justify-center transition-all",
                        quizMode && currentLesson._id === lesson._id ? "bg-white/20" : "bg-blue-500/10"
                      )}>
                        <HelpCircle className="h-2 w-2" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest flex-1 text-left">Practice Quiz</span>
                    </button>
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

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19]">
        {/* Enhanced Progress Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 p-4 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Target className="h-4 w-4" />
              </div>
              <h1 className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">Learning Progress</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-600 uppercase tracking-widest">
                  <Award className="h-2.5 w-2.5" />
                  {overallProgress}% Complete
                </div>
                <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-0.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            {!quizMode ? (
              <>
                {/* Immersive Lesson Header */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 p-8 mb-6 shadow-sm">
                  <div className="flex items-start gap-5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Play className="h-5 w-5 fill-current" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest">
                          Lesson {lessons.findIndex(l => l._id === currentLesson._id) + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                          {currentLesson.subLessons?.length || 1} Parts
                        </span>
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
                        {currentSubLesson.title}
                      </h1>

                      {currentLesson.description && (
                        <div>
                          <div className={cn(
                            "text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap",
                            !expandedDescription && "line-clamp-1"
                          )}>
                            {renderFormattedText(currentLesson.description)}
                          </div>
                          <button
                            onClick={() => setExpandedDescription(!expandedDescription)}
                            className="mt-2 flex items-center gap-2 text-blue-600 text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                          >
                            {expandedDescription ? (
                              <>Show Less <ChevronUp className="h-2.5 w-2.5" /></>
                            ) : (
                              <>Detailed Description <ChevronDown className="h-2.5 w-2.5" /></>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Video Player */}
                {/* Video player with validation and error boundary */}
                <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-white/50 bg-black">
                  {
                    (() => {
                      const rawUrl = currentSubLesson.videoUrl || currentLesson.videoUrl || "";
                      let videoSrc = rawUrl;
                      let provider: "youtube" | "html5" = "html5";

                      if (!rawUrl) {
                        videoSrc = "UmnCZ7-9yDY"; // sensible default
                        provider = "youtube";
                      } else if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
                        const match = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
                        videoSrc = match ? match[1] : rawUrl;
                        provider = "youtube";
                      } else {
                        videoSrc = rawUrl;
                        provider = "html5";
                      }

                      const isYouTube = provider === "youtube";
                      const isValidYoutubeId = isYouTube ? /^[A-Za-z0-9_-]{11}$/.test(videoSrc) : true;

                      if (isYouTube && !isValidYoutubeId) {
                        console.warn("Invalid YouTube ID detected for lesson video:", videoSrc);
                        return (
                          <div className="p-8 text-center bg-black text-white">
                            <h3 className="text-lg font-bold">Invalid video</h3>
                            <p className="text-sm mt-2">The configured YouTube video ID is invalid. Please check the lesson settings.</p>
                          </div>
                        );
                      }

                      return (
                        <ErrorBoundary>
                          <Plyr
                            source={{
                              type: "video",
                              sources: [
                                {
                                  src: videoSrc,
                                  provider,
                                },
                              ],
                            }}
                          />
                        </ErrorBoundary>
                      );
                    })()
                  }
                </div>

                {/* Content Sections */}
                <div className="space-y-6 mb-8">
                  {currentSubLesson.content.map((block, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                          {block.heading.replace(/\*+/g, '').trim()}
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {block.points.map((pt, j) => (
                          <div key={j} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                            <div className="text-[15px] flex-1">
                              {renderFormattedText(pt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

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
                    className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-xl hover:shadow-2xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
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
                      <div className="p-4 rounded-xl bg-blue-500/10 dark:bg-blue-900/30 inline-block mb-4">
                        <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">
                        Quiz Time: {currentLesson.title}
                      </h2>
                      <p className="text-slate-600 dark:text-gray-400">Test your knowledge and earn points!</p>
                    </div>

                    {quizzes[currentLesson._id]?.length > 0 ? (
                      <>
                        <div className="space-y-10">
                          {quizzes[currentLesson._id].map((q, i) => (
                            <div key={q._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 p-10 shadow-sm transition-all duration-500">
                              <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-600/20">
                                  {i + 1}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                  {q.question}
                                </h3>
                              </div>

                              <div className="grid gap-4">
                                {q.options.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() =>
                                      setSelectedAnswers((prev) => ({ ...prev, [q._id]: opt }))
                                    }
                                    className={cn(
                                      "group text-left p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
                                      selectedAnswers[q._id] === opt
                                        ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]"
                                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-blue-500/50 text-slate-700 dark:text-slate-300"
                                    )}
                                  >
                                    <div className="flex items-center gap-4 relative z-10">
                                      <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedAnswers[q._id] === opt
                                          ? "bg-white border-white text-blue-600"
                                          : "border-slate-300 dark:border-slate-600"
                                      )}>
                                        {selectedAnswers[q._id] === opt && <CheckCircle2 className="h-3.5 w-3.5" />}
                                      </div>
                                      <span className="font-bold text-[15px]">{opt}</span>
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
                            className="group px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
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
                                    className={`py-3 px-4 rounded-lg border-2 ${isCorrect
                                      ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-800 dark:text-green-300"
                                      : isWrongSelection
                                        ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-800 dark:text-red-300"
                                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
                                      }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isCorrect
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
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-sm border border-slate-100 dark:border-slate-800/50 text-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-blue-500/10 flex items-center justify-center text-blue-600 mx-auto mb-10">
                        <Award className="h-12 w-12" />
                      </div>

                      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">Quiz Performance</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">Congratulations on completing the assessment module.</p>

                      <div className="grid lg:grid-cols-2 gap-10 mb-12">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 flex items-center justify-center shadow-inner">
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

                        <div className="flex flex-col gap-6 justify-center">
                          <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <div className="text-5xl font-black text-emerald-600 mb-2">{quizResults.correct}</div>
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct Answers</div>
                          </div>
                          <div className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-center">
                            <div className="text-5xl font-black text-rose-600 mb-2">{quizResults.wrong}</div>
                            <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wrong Points</div>
                          </div>
                        </div>
                      </div>

                      <div className="max-w-2xl mx-auto border-t border-slate-100 dark:border-slate-800/50 pt-12">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Final Mastery Score</span>
                          <span className="text-2xl font-black text-blue-600">
                            {Math.round((quizResults.correct / (quizResults.correct + quizResults.wrong)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            style={{
                              width: `${Math.round((quizResults.correct / (quizResults.correct + quizResults.wrong)) * 100)}%`
                            }}
                          ></div>
                        </div>

                        <div className="mt-12">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                            {quizResults.correct > quizResults.wrong
                              ? "Excellent work! You've mastered this topic!"
                              : "Keep practicing! Review the lesson and try again."}
                          </h3>
                          <button
                            onClick={() => setQuizMode(false)}
                            className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all hover:shadow-xl hover:shadow-blue-600/20"
                          >
                            Return to lesson content
                          </button>
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