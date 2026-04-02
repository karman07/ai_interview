// components/DetailedResumeCard.tsx
import React from "react";
import {
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  StarIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
} from "../icons/Icons";
import { generateResumeReport } from "@/utils/pdfGenerator";

interface DetailedResumeCardProps {
  resume: any;
  isPremium: boolean;
  onViewDetails: () => void;
  onEnhance?: () => void;
  onUpgrade?: () => void;
}

const DetailedResumeCard: React.FC<DetailedResumeCardProps> = ({ resume, isPremium, onViewDetails, onEnhance, onUpgrade }) => {
  const cvScore  = Math.round(resume.analytics?.cv_quality?.overall_score || 0);
  const jdScore  = Math.round(resume.analytics?.jd_match?.overall_score   || 0);
  const greenFlags = resume.analytics?.key_takeaways?.green_flags?.length ?? 0;
  const overallScore = Math.round((cvScore + jdScore) / 2);
  const isPlatformGenerated = !!resume?.is_platform_generated;
  const hasEnhancement = Boolean(resume?.enhancement);
  const hasBuilderData  = Boolean(resume?.builder_data);
  const cvBand  = cvScore  >= 70 ? "Strong" : cvScore  >= 50 ? "Good" : "Needs Work";
  const jdBand  = jdScore  >= 70 ? "Strong" : jdScore  >= 50 ? "Good" : "Needs Work";

  return (
    <div
      onClick={onViewDetails}
      className="bg-white dark:bg-slate-900/70 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >

      {/* Thin blue top accent */}
      <div className="h-[3px] w-full bg-blue-600" />

      {/* Body */}
      <div className="px-5 pt-4 pb-5 flex-1 flex flex-col gap-4">

        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          {/* File icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Name + date */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate leading-snug">
              {resume?.filename}
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <CalendarIcon className="w-3 h-3 flex-shrink-0" />
              {resume?.createdAt
                ? new Date(resume.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                : "N/A"}
            </p>
            {isPlatformGenerated && (
              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                ✦ AIForJob™
              </span>
            )}
          </div>

        </div>

        {/* ── Metrics ── */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700/80">
          {[
            { label: "CV Quality",  value: cvScore,    band: cvBand  },
            { label: "JD Match",    value: jdScore,    band: jdBand  },
            { label: "Green Flags", value: greenFlags, band: "Total" },
          ].map((m, i) => (
            <div key={i} className={`text-center ${i === 0 ? "pr-3" : i === 1 ? "px-3" : "pl-3"}`}>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{m.value}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 mb-1">{m.label}</p>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${getBandColor(m.band)}`}>
                {m.band}
              </span>
            </div>
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-gray-400 dark:text-slate-400 font-medium">Overall</span>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{overallScore}/100</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(overallScore, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Action footer ── */}
      <div className="border-t border-gray-100 dark:border-slate-700/80 grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700/80">
        {/* View */}
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
          title="View full analysis"
        >
          <EyeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors" />
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors">View</span>
        </button>

        {/* Enhance */}
        {hasBuilderData ? (
          // Enhanced resume exists → open builder directly
          <button
            onClick={(e) => { e.stopPropagation(); (onEnhance ?? onViewDetails)(); }}
            className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
            title="Open enhanced resume in builder"
          >
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover/btn:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 group-hover/btn:text-blue-600 transition-colors">Enhanced</span>
          </button>
        ) : isPlatformGenerated ? (
          <div
            className="flex flex-col items-center gap-1.5 py-3.5 opacity-70 cursor-not-allowed"
            title="Already generated by AIForJob"
          >
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold text-blue-500">AI Enhanced</span>
          </div>
        ) : hasEnhancement ? (
          // Enhancement data exists but builder not yet generated → disabled
          <div
            className="flex flex-col items-center gap-1.5 py-3.5 opacity-40 cursor-not-allowed"
            title="Enhancement already applied — open details to view"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-400">Enhance</span>
          </div>
        ) : isPremium ? (
          <button
            onClick={(e) => { e.stopPropagation(); (onEnhance ?? onViewDetails)(); }}
            className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
            title="Enhance with AI"
          >
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors">Enhance</span>
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
            className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors group/btn"
            title="Upgrade to unlock AI Enhancement"
          >
            <div className="relative">
              <svg className="w-4 h-4 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {/* lock badge */}
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-gray-400 dark:bg-slate-500 rounded-full flex items-center justify-center">
                <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-300 dark:text-slate-500">Enhance</span>
          </button>
        )}

        {/* Export */}
        <button
          onClick={(e) => { e.stopPropagation(); generateResumeReport(resume); }}
          className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
          title="Export PDF report"
        >
          <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors" />
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors">Export</span>
        </button>
      </div>
    </div>
  );
};

const getBandColor = (band?: string): string => {
  switch (band?.toLowerCase()) {
    case "strong": return "text-emerald-600 dark:text-emerald-400";
    case "good":   return "text-blue-600 dark:text-blue-400";
    case "partial": return "text-amber-500 dark:text-amber-400";
    case "weak":   return "text-rose-500 dark:text-rose-400";
    default:       return "text-gray-400 dark:text-slate-400";
  }
};

export default DetailedResumeCard;
