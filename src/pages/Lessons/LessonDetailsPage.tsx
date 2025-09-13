import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLessons, SubLesson, Lesson } from "@/contexts/LessonsContext";
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
  TrendingUp
} from "lucide-react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import axios from "axios";
import { API_BASE_URL } from "@/api/http";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

interface ProgressState {
  [id: string]: {
    progress: number;
    quizScore?: number;
  };
}

interface StoredState {
  progress: ProgressState;
  lastLessonId: string | null;
  lastSubLessonId: string | null;
}

const LessonDetailsPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { lessons, fetchLessons, quizzes, fetchQuizzes, loading } = useLessons();

  const [progress, setProgress] = useState<ProgressState>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSubLesson, setCurrentSubLesson] = useState<SubLesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qid: string]: string }>({});
  const [quizResults, setQuizResults] = useState<{ correct: number; wrong: number } | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  // Load lessons
  useEffect(() => {
    if (subjectId) fetchLessons(subjectId);
  }, [subjectId]);

  // Initialize state from localStorage
  useEffect(() => {
    if (subjectId && lessons.length > 0) {
      const stored = localStorage.getItem(`lessonProgress-${subjectId}`);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        setProgress(parsed.progress || {});
        const lastLesson =
          lessons.find((l) => l._id === parsed.lastLessonId) || lessons[0];
        const lastSubLesson =
          lastLesson.subLessons.find((s) => s._id === parsed.lastSubLessonId) ||
          lastLesson.subLessons[0];
        setCurrentLesson(lastLesson);
        setCurrentSubLesson(lastSubLesson);
      } else {
        setCurrentLesson(lessons[0]);
        setCurrentSubLesson(lessons[0].subLessons[0]);
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

  const updateProgress = async (id: string, completed = false, score?: number) => {
    const newProgress = {
      ...progress,
      [id]: {
        ...progress[id],
        progress: completed
          ? 100
          : Math.min((progress[id]?.progress || 0) + 25, 100),
        quizScore: score ?? progress[id]?.quizScore,
      },
    };
    setProgress(newProgress);

    try {
      await axios.post(`${API_BASE_URL}/progress`, {
        subLessonId: id,
        progress: newProgress[id].progress,
        quizScore: score ?? null,
      });
    } catch (err) {
      console.error("❌ Failed to update progress API", err);
    }
  };

  const handleNext = () => {
    if (!currentLesson || !currentSubLesson) return;
    const subLessons = currentLesson.subLessons;
    const idx = subLessons.findIndex((s) => s._id === currentSubLesson._id);

    updateProgress(currentSubLesson._id, true);

    if (idx < subLessons.length - 1) {
      setCurrentSubLesson(subLessons[idx + 1]);
      setQuizMode(false);
    } else {
      setQuizMode(true);
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
    updateProgress(currentLesson._id, true, correct);
    setShowAnswers(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium animate-pulse">Loading your lessons...</p>
        </div>
      </div>
    );
  }

  if (!lessons.length || !currentLesson || !currentSubLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center justify-center h-96 space-y-6">

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">No lessons available</h2>
            <p className="text-gray-600">There are no lessons to display for this subject.</p>
          </div>
        </div>
      </div>
    );
  }

  const allSubLessons = lessons.flatMap((l) => l.subLessons);
  const completedCount = allSubLessons.filter((s) => progress[s._id]?.progress === 100).length;
  const quizBonus =
    quizResults && quizzes[currentLesson._id]?.length
      ? Math.round((quizResults.correct / quizzes[currentLesson._id].length) * 100)
      : 0;
  const overallProgress = Math.min(
    Math.round((completedCount / allSubLessons.length) * 100) + quizBonus,
    100
  );

  const quizData = quizResults
    ? [
        { name: "Correct", value: quizResults.correct, color: "#10b981" },
        { name: "Wrong", value: quizResults.wrong, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Sidebar */}
      <aside className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/50 shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:gap-3"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to subject
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {lessons.map((lesson, lessonIndex) => (
            <div key={lesson._id} className="space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="flex-1">{lesson.title}</span>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {lessonIndex + 1}
                </div>
              </h3>
              
              <div className="pl-4 space-y-2">
                {lesson.subLessons.map((sub, subIndex) => {
                  const isActive = currentSubLesson._id === sub._id;
                  const isCompleted = progress[sub._id]?.progress === 100;
                  return (
                    <div
                      key={sub._id}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        setCurrentSubLesson(sub);
                        setQuizMode(false);
                      }}
                      className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-200 shadow-md"
                          : "hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}>
                            {subIndex + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                            {sub.title}
                          </span>
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce" />
                        )}
                      </div>
                      {progress[sub._id]?.progress > 0 && progress[sub._id]?.progress < 100 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress[sub._id]?.progress || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Enhanced Quiz Link */}
                {quizzes[lesson._id] && quizzes[lesson._id].length > 0 && (
                  <div
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setQuizMode(true);
                    }}
                    className={`group p-4 mt-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 border ${
                      quizMode && currentLesson._id === lesson._id
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 shadow-md"
                        : "hover:bg-green-50 border-green-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <HelpCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                        Take Quiz
                      </span>
                      <div className="ml-auto text-xs px-2 py-1 rounded-full bg-green-200 text-green-700">
                        {quizzes[lesson._id].length} Q
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Enhanced Progress Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                Learning Progress
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{overallProgress}% Complete</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="absolute -top-1 transition-all duration-700 ease-out" style={{ left: `${overallProgress}%` }}>
                <TrendingUp className="h-5 w-5 text-blue-600 transform -translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {!quizMode ? (
              <>
                {/* Enhanced Lesson Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
                      <Play className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSubLesson.title}</h1>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Lesson {lessons.findIndex(l => l._id === currentLesson._id) + 1}</span>
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
                          src:
                            currentSubLesson.videoUrl ||
                            "https://www.youtube.com/watch?v=UmnCZ7-9yDY",
                          provider: currentSubLesson.videoUrl ? "html5" : "youtube",
                        },
                      ],
                    }}
                  />
                </div>

                {/* Enhanced Content Sections */}
                {currentSubLesson.content.map((block, i) => (
                  <div
                    key={i}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-6 hover:shadow-xl hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                      {block.heading.replace(/\*+/g, '').trim()}
                    </h2>
                    <ul className="space-y-3">
                      {block.points.map((pt, j) => (
                        <li key={j} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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
                    className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/50 hover:bg-white/90 hover:shadow-lg text-gray-700 font-medium transition-all duration-300 transform hover:-translate-y-0.5"
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
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                {!quizResults ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 inline-block mb-4">
                        <HelpCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Quiz Time: {currentLesson.title}
                      </h2>
                      <p className="text-gray-600">Test your knowledge and earn points!</p>
                    </div>

                    {quizzes[currentLesson._id]?.length > 0 ? (
                      <>
                        <div className="space-y-8">
                          {quizzes[currentLesson._id].map((q, i) => (
                            <div key={q._id} className="p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                              <p className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
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
                                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 shadow-md"
                                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        selectedAnswers[q._id] === opt
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : "border-gray-300"
                                      }`}>
                                        {selectedAnswers[q._id] === opt && <span className="text-xs">✓</span>}
                                      </div>
                                      <span className="font-medium">{opt}</span>
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
                            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
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
                        <p className="text-xl text-gray-500 font-medium">No quiz available for this lesson</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-8">
                    {/* Show Answers Section */}
                    {showAnswers && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Review</h3>
                          <p className="text-gray-600">Review your answers and see the correct ones</p>
                        </div>
                        
                        {quizzes[currentLesson._id].map((q, i) => (
                          <div key={q._id} className="p-6 rounded-xl border border-gray-200">
                            <p className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-sm font-bold">
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
                                        ? "bg-green-100 border-green-300 text-green-800"
                                        : isWrongSelection
                                        ? "bg-red-100 border-red-300 text-red-800"
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        isCorrect
                                          ? "bg-green-600 border-green-600 text-white"
                                          : isWrongSelection
                                          ? "bg-red-600 border-red-600 text-white"
                                          : "border-gray-300"
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
                                        <span className="ml-auto text-sm font-semibold text-green-600">
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
                    <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 inline-block mb-6">
                        <Award className="h-12 w-12 text-blue-600" />
                      </div>
                      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Quiz Results
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl p-6 shadow-md">
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

                        <div className="bg-white rounded-xl p-6 shadow-md">
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
                        <div className="p-4 rounded-xl bg-green-100 border border-green-200">
                          <div className="text-3xl font-bold text-green-700">{quizResults.correct}</div>
                          <div className="text-sm font-medium text-green-600">Correct Answers</div>
                        </div>
                        <div className="p-4 rounded-xl bg-red-100 border border-red-200">
                          <div className="text-3xl font-bold text-red-700">{quizResults.wrong}</div>
                          <div className="text-sm font-medium text-red-600">Wrong Answers</div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="text-6xl mb-4">
                          {quizResults.correct > quizResults.wrong ? "🎉" : quizResults.correct === quizResults.wrong ? "👍" : ""}
                        </div>
                        <p className="text-xl font-semibold text-gray-700">
                          {quizResults.correct > quizResults.wrong 
                            ? "Excellent work! You've mastered this topic!" 
                            : quizResults.correct === quizResults.wrong 
                            ? "Good effort! Keep learning to improve!"
                            : "Keep practicing! Review the lesson and try again."}
                        </p>
                        
                        <div className="mt-6">
                          <div className="text-lg font-medium text-gray-600 mb-2">
                            Your Score: {Math.round((quizResults.correct / (quizResults.correct + quizResults.wrong)) * 100)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-700"
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