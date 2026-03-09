import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Subject } from "@/contexts/SubjectsContext";
import { baseURL } from "@/api/http";
import {
  Clock,
  Tag,
  TrendingUp,
  BookOpen,
  Play,
  CheckCircle,
  Star,
} from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { motion, AnimatePresence } from "framer-motion";

interface SubjectCardProps {
  subject: Subject;
  onClick?: (subject: Subject) => void; // Optional callback
}

const renderFormattedText = (text?: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-slate-900 dark:text-white font-extrabold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const { getProgressForLesson, progress: apiProgress } = useProgress();
  const navigate = useNavigate();
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${baseURL}${url}`;
  };

  // Calculate overall progress for the subject based on all lessons
  const calculateSubjectProgress = useCallback(() => {
    if (!subject.lessons || subject.lessons.length === 0) return { percent: 0, status: 'not-started' as const };

    let completedCount = 0;
    let inProgressCount = 0;

    // Check each lesson's progress
    subject.lessons.forEach(lesson => {
      // First try API progress
      const apiProg = apiProgress.find(p => p.lessonId === lesson._id);

      if (apiProg) {
        if (apiProg.status === 'completed') completedCount++;
        else if (apiProg.status === 'in-progress') inProgressCount++;
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(`lessonProgress-${subject._id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const localProg = parsed.progress?.[lesson._id];
            if (localProg?.status === 'completed') completedCount++;
            else if (localProg?.status === 'in-progress') inProgressCount++;
          } catch (e) {
            console.error('Failed to parse localStorage progress', e);
          }
        }
      }
    });

    const percent = Math.round((completedCount / subject.lessons.length) * 100);
    const status = completedCount === subject.lessons.length ? 'completed' :
      (completedCount > 0 || inProgressCount > 0) ? 'in-progress' : 'not-started';

    return { percent, status };
  }, [apiProgress, subject]);

  // Recalculate progress when API progress changes
  useEffect(() => {
    const { percent, status } = calculateSubjectProgress();
    setProgressPercent(percent);
    setProgressStatus(status as 'not-started' | 'in-progress' | 'completed');
  }, [calculateSubjectProgress]);

  const progress = subject.lessons?.[0] ? getProgressForLesson(subject.lessons[0]._id) : null;

  // Default click handler → navigate to subject details
  const handleClick = () => {
    if (onClick) {
      onClick(subject);
    } else {
      navigate(`/subjects/${subject._id}`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "intermediate":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
      case "advanced":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "programming":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "math":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
      case "science":
        return "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-200 dark:border-teal-800";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    }
  };

  const getProgressStatus = () => {
    if (progressPercent === 0)
      return {
        text: "Start Learning",
        color: "text-gray-600 dark:text-gray-300",
        bgColor: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        icon: Play,
      };

    switch (progressStatus) {
      case "completed":
        return {
          text: "Completed",
          color: "text-emerald-700 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800",
          icon: CheckCircle,
        };
      case "in-progress":
        return {
          text: "Continue",
          color: "text-blue-700 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
          icon: Play,
        };
      default:
        return {
          text: "Start Learning",
          color: "text-gray-600 dark:text-gray-300",
          bgColor: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          icon: Play,
        };
    }
  };

  const statusInfo = getProgressStatus();

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Immersive Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={getImageUrl(subject.thumbnailUrl)}
          alt={subject.title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />

        {/* Category Overlay */}
        {subject.category && (
          <div className="absolute top-5 left-5">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.15em] shadow-2xl">
              {subject.category}
            </span>
          </div>
        )}

      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col gap-3">
          {/* Title - Fixed height for 2 lines */}
          <div className="h-14">
            <h3 className="text-[19px] font-black text-slate-900 dark:text-white leading-[1.3] group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
              {subject.title}
            </h3>
          </div>

          {/* Description - Fixed height for 3 lines */}
          <div className="h-[60px]">
            <div className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
              {renderFormattedText(subject.description || "Comprehensive curriculum designed for industry mastery.")}
            </div>
          </div>
        </div>

        {/* Progress System & Footer */}
        <div className="mt-auto pt-6 space-y-5">
          {/* Mastery Section - Only space-occupying if exists, but consistently placed */}
          <div className="min-h-[32px] flex flex-col justify-end">
            {(progress || progressPercent > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Subject Mastery</span>
                  <span className="text-blue-600">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-full ${progressStatus === "completed" ? "bg-emerald-500" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"}`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{subject.estimatedTime || "Async"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{subject.lessons?.length || 0} Lessons</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-500/20">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
