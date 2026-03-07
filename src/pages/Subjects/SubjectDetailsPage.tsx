import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, baseURL } from "@/api/http";
import { useLessons } from "@/contexts/LessonsContext";
import { ArrowLeft, BookOpen, Clock, User, Tag, TrendingUp, Play, CheckCircle, ChevronDown, ChevronUp, CheckCircle2, Target } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/api/http";
import { cn } from "@/utils/cn";

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

const renderFormattedText = (text?: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

interface LessonCardProps {
  lesson: any;
  index: number;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getProgressForLesson } = useProgress();
  const lessonProgress = getProgressForLesson(lesson._id);
  const isCompleted = lessonProgress?.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 p-6 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col gap-6 active:scale-[0.98]"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex gap-4 items-start">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-blue-500/5 border-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20"
          )}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Part {index + 1}</span>
              {isCompleted && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] px-2 py-0.5 bg-emerald-500/10 rounded-full">Completed</span>}
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
              {renderFormattedText(lesson.title)}
            </h3>
          </div>
        </div>
      </div>

      {/* Description Content */}
      <div className="relative z-10">
        <div className={cn(
          "text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium transition-all duration-500",
          !isExpanded && "line-clamp-3"
        )}>
          {renderFormattedText(lesson.description)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
        >
          {isExpanded ? (
            <>Hide Overview <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Read Overview <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      </div>

      {/* Footer Stats */}
      <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between relative z-10">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">35 Min</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Interactive Video</span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </div>
      </div>
    </motion.div>
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

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${baseURL}${url}`;
  };

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
    <div className="min-h-screen bg-white dark:bg-[#0B0F19]">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="flex flex-col gap-16">

          {/* Top Section: Header & Image */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 space-y-10">
              {/* Breadcrumb & Navigation */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 group text-slate-400 hover:text-blue-600 font-bold transition-all text-[11px] uppercase tracking-widest"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Preparation Center
              </button>

              {/* Immersive Course Header */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                    Advanced Curriculum
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                    {subject.title}
                  </h1>
                </motion.div>

                {/* Action Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/50 max-w-2xl">
                  {[
                    { icon: Tag, label: "Category", val: subject.category || "General", color: "blue" },
                    { icon: Clock, label: "Commitment", val: subject.estimatedTime || "Self-paced", color: "emerald" },
                    { icon: User, label: "Curated By", val: subject.author || "Nexus AI", color: "blue" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{stat.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Start CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => lessons.length > 0 && navigate(`/lessons/${subject._id}`)}
                    disabled={lessons.length === 0}
                    className="px-10 py-5 rounded-[2rem] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    {lessons.length > 0 ? "Begin Learning Path" : "Syncing Curriculum..."}
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Thumbnail */}
            <div className="lg:w-[450px] shrink-0">
              <div className="rounded-[3rem] overflow-hidden aspect-[4/3] relative group shadow-2xl border-4 border-white dark:border-slate-800">
                <img
                  src={getImageUrl(subject.thumbnailUrl)}
                  alt={subject.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40" />
              </div>
            </div>
          </div>

          {/* Curriculum Breakdown */}
          {Array.isArray((subject as any).content) && (
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Curriculum Breakdown</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {(subject as any).content.map((block: { heading: string; points: string[] }, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/50 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                      <span className="text-8xl font-black text-slate-900 dark:text-white">0{i + 1}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 pr-10">
                      {block.heading.replace(/\*+/g, '').trim()}
                    </h3>
                    <div className="grid gap-3">
                      {block.points.map((pt, j) => (
                        <div key={j} className="flex gap-3 text-slate-600 dark:text-slate-400 items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="text-sm font-medium pr-2">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">About this Course</h2>
            </div>
            <div className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl font-medium whitespace-pre-wrap">
              {renderFormattedText(subject.description || "Master the core concepts of this subject with our expert-designed curriculum pathway.")}
            </div>
          </div>

          {/* Structured Lessons List: Now Full Width at the Bottom */}
          <div className="space-y-8 pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Structured Content</h3>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-widest">
                {lessons.length} Learning Modules
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => (
                <LessonCard key={lesson._id} lesson={lesson} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailsPage;