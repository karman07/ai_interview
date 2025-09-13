import React from "react";
import { useNavigate } from "react-router-dom";
import { Subject } from "@/contexts/SubjectsContext";
import { baseURL } from "@/api/http";
import {
  Clock,
  Tag,
  TrendingUp,
  BookOpen,
  Award,
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
  const { getProgressForLesson } = useProgress();
  const navigate = useNavigate();

  const firstLessonId = subject.lessons?.[0]?._id;
  const progress = firstLessonId ? getProgressForLesson(firstLessonId) : null;

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
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "intermediate":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "advanced":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "programming":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white";
      case "math":
        return "bg-gradient-to-r from-purple-600 to-violet-600 text-white";
      case "science":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-600 to-slate-600 text-white";
    }
  };

  const getProgressStatus = () => {
    if (!progress)
      return {
        text: "Start Learning",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: Play,
      };

    switch (progress.status) {
      case "completed":
        return {
          text: "Completed",
          color: "text-green-700",
          bgColor: "bg-green-50",
          icon: CheckCircle,
        };
      case "in-progress":
        return {
          text: "Continue",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          icon: Play,
        };
      default:
        return {
          text: "Start Learning",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: Play,
        };
    }
  };

  const statusInfo = getProgressStatus();
  const progressPercent = progress ? progress.progressPercent : 0;

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden backdrop-blur-sm cursor-pointer"
    >
      {/* Gradient border hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
        <div className="w-full h-full bg-white rounded-2xl"></div>
      </div>

      {/* Thumbnail */}
      <div className="relative">
        {subject.thumbnailUrl ? (
          <div className="relative overflow-hidden h-52">
            <img
              src={`${baseURL}${subject.thumbnailUrl}`}
              alt={subject.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Circular Progress */}
            {progressPercent > 0 && (
              <div className="absolute top-4 right-4">
                <div className="relative w-14 h-14">
                  <svg
                    className="w-14 h-14 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={
                        progress?.status === "completed" ? "#10B981" : "#3B82F6"
                      }
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${progressPercent * 2.51} 251`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status badge */}
            <div
              className={`absolute top-4 left-4 px-3 py-1 rounded-full ${statusInfo.bgColor} backdrop-blur-sm`}
            >
              <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                {statusInfo.icon && <statusInfo.icon className="h-3 w-3" />}
                <span className="text-xs font-semibold">{statusInfo.text}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center relative">
            <BookOpen className="h-20 w-20 text-indigo-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Title + Rating */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {subject.title}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">(4.0)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {subject.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {subject.category && (
            <div
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${getCategoryColor(
                subject.category
              )} shadow-sm`}
            >
              <Tag className="h-3 w-3" />
              {subject.category}
            </div>
          )}
          {subject.level && (
            <div
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${getLevelColor(
                subject.level
              )} shadow-sm`}
            >
              <TrendingUp className="h-3 w-3" />
              {subject.level}
            </div>
          )}
        </div>

        {/* Progress Section */}
        {(progress || progressPercent >= 0) && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Learning Progress
              </span>
              <span className="text-sm font-bold text-gray-900">
                {progressPercent}%
              </span>
            </div>

            <div className="relative">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    progress?.status === "completed"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={{
                    width: `${progressPercent}%`,
                    boxShadow:
                      progressPercent > 0
                        ? "0 0 10px rgba(59, 130, 246, 0.5)"
                        : "none",
                  }}
                />
              </div>
            </div>

            {progress && progress.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {progress.badges.slice(0, 3).map((badge, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    <Award className="h-3 w-3" />
                    {badge}
                  </div>
                ))}
                {progress.badges.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{progress.badges.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Time + Lessons */}
        {subject.estimatedTime && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {subject.estimatedTime}
              </span>
            </div>
            {subject.lessons && subject.lessons.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {subject.lessons.length} lesson
                  {subject.lessons.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-2">
              {statusInfo.icon && <statusInfo.icon className="h-4 w-4" />}
              {statusInfo.text}
            </div>
          </button>
        </div>
      </div>

      {/* Shine hover effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
    </div>
  );
};
