import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

interface SubjectCardProps {
  subject: Subject;
  onClick?: (subject: Subject) => void; // Optional callback
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const { getProgressForLesson, progress: apiProgress } = useProgress();
  const navigate = useNavigate();
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

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

    console.log(`Subject ${subject.title}: ${completedCount}/${subject.lessons.length} completed = ${percent}%`);

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
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-900">
        {subject.thumbnailUrl ? (
          <>
            <img
              src={`${baseURL}${subject.thumbnailUrl}`}
              alt={subject.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Status badge */}
            <div
              className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} flex items-center gap-1.5 shadow-sm`}
            >
              {statusInfo.icon && <statusInfo.icon className="h-3.5 w-3.5" />}
              <span>{statusInfo.text}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <div
              className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} flex items-center gap-1.5 shadow-sm`}
            >
              {statusInfo.icon && <statusInfo.icon className="h-3.5 w-3.5" />}
              <span>{statusInfo.text}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col space-y-4">
        {/* Title + Rating */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {subject.title}
          </h3>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < 4 ? "text-amber-400 fill-current" : "text-gray-200 dark:text-gray-700"
                  }`}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-medium">(4.0)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
          {subject.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {subject.category && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(
                subject.category
              )}`}
            >
              <Tag className="h-3 w-3" />
              {subject.category}
            </div>
          )}
          {subject.level && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getLevelColor(
                subject.level
              )}`}
            >
              <TrendingUp className="h-3 w-3" />
              {subject.level}
            </div>
          )}
        </div>

        {/* Progress Logic - Simplified Linear Bar */}
        {(progress || progressPercent > 0) && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Progress</span>
              <span className="text-gray-900 dark:text-white font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressStatus === "completed"
                  ? "bg-emerald-500"
                  : "bg-blue-600"
                  }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Time + Lessons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          {subject.estimatedTime && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{subject.estimatedTime}</span>
            </div>
          )}
          {subject.lessons && subject.lessons.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{subject.lessons.length} lessons</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
