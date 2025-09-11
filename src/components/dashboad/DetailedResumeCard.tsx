// components/DetailedResumeCard.tsx
import React, { useState } from "react";
import {
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  StarIcon,
  BriefcaseIcon,
} from "../icons/Icons";

import ResumeDetails from "./ResumeDetails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../dialog/dialog";

interface DetailedResumeCardProps {
  resume: any; // using any because API returns improvement_resume
}

const DetailedResumeCard: React.FC<DetailedResumeCardProps> = ({ resume }) => {
  const [open, setOpen] = useState(false);

  const overallScore = Math.round(
    ((resume.stats?.cv_quality?.overall_score || 0) +
      (resume.stats?.jd_match?.overall_score || 0)) /
      2
  );

  return (
    <>
      {/* Resume Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {resume?.filename}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {resume?.createdAt
                    ? new Date(resume.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "CV Quality",
                value: resume.stats?.cv_quality?.overall_score ?? 0,
                band:
                  (resume.stats?.cv_quality?.overall_score ?? 0) >= 70
                    ? "Strong"
                    : (resume.stats?.cv_quality?.overall_score ?? 0) >= 50
                    ? "Good"
                    : "Needs Work",
                icon: DocumentTextIcon,
              },
              {
                label: "JD Match",
                value: resume.stats?.jd_match?.overall_score ?? 0,
                band:
                  (resume.stats?.jd_match?.overall_score ?? 0) >= 70
                    ? "Strong"
                    : (resume.stats?.jd_match?.overall_score ?? 0) >= 50
                    ? "Good"
                    : "Needs Work",
                icon: BriefcaseIcon,
              },
              {
                label: "Green Flags",
                value: resume.stats?.key_takeaways?.green_flags?.length ?? 0,
                band: "Total",
                icon: StarIcon,
              },
            ].map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-2">
                  <metric.icon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(metric.value || 0)}
                </p>
                <p className="text-xs text-gray-500 mb-2">{metric.label}</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBandColor(
                    metric.band
                  )}`}
                >
                  {metric.band || "N/A"}
                </span>
              </div>
            ))}
          </div>

          {/* Overall Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(overallScore, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Overall Score: {overallScore}/100
          </p>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Details</DialogTitle>
          </DialogHeader>
          <ResumeDetails resume={resume} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const getBandColor = (band?: string): string => {
  switch (band?.toLowerCase()) {
    case "strong":
      return "text-green-600 bg-green-100";
    case "good":
      return "text-blue-600 bg-blue-100";
    case "partial":
      return "text-yellow-600 bg-yellow-100";
    case "weak":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default DetailedResumeCard;
