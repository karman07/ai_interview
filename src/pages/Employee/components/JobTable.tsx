import React from 'react';
import { MapPin, DollarSign, Heart, Bookmark, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Job } from '../../../api/jobService';
import { cn } from '@/utils/cn';

interface JobTableProps {
    jobs: Job[];
    favorites: Set<string>;
    toggleFavorite: (jobId: string) => void;
    bookmarks: Set<string>;
    toggleBookmark: (jobId: string) => void;
    handleJobClick: (job: Job) => void;
    formatSalary: (min?: number | null, max?: number | null) => string;
    expandedDesc: Set<string>;
    toggleDescription: (jobId: string) => void;
}

const JobTable = ({
    jobs,
    favorites,
    toggleFavorite,
    bookmarks,
    toggleBookmark,
    handleJobClick,
    formatSalary,
    expandedDesc,
    toggleDescription,
}: JobTableProps) => {
    return (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/40 shadow-xl shadow-slate-200/10 dark:shadow-none overflow-hidden overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                <colgroup>
                    <col className="w-[48%]" />
                    <col className="w-[22%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[6%]" />
                </colgroup>
                <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/60">
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Opportunity</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Deployment</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Compensation</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Branch</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Ops</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {jobs.map((job) => {
                        const jobId = job.job_id || (job as any)._id;
                        const isFavorited = favorites.has(jobId);
                        const isBookmarked = bookmarks.has(jobId);

                        return (
                            <React.Fragment key={jobId}>
                                <tr
                                    className={cn(
                                        "group transition-all duration-300 cursor-pointer border-b border-transparent",
                                        expandedDesc.has(jobId) 
                                            ? "bg-blue-500/[0.03] dark:bg-blue-400/[0.02] border-slate-200 dark:border-slate-800/60" 
                                            : "hover:bg-blue-500/[0.04] dark:hover:bg-blue-400/[0.03]"
                                    )}
                                    onClick={() => handleJobClick(job)}
                                >
                                    <td className="px-4 sm:px-8 py-5 sm:py-7 align-top">
                                        <div className="flex items-center gap-4 sm:gap-5 min-h-[72px]">
                                            <div className={cn(
                                                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-sm group-hover:scale-105",
                                                expandedDesc.has(jobId)
                                                    ? "bg-white dark:bg-slate-900 border-blue-500/30 shadow-blue-500/10"
                                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/50 group-hover:border-blue-500/30 group-hover:shadow-blue-500/10"
                                            )}>
                                                <span className="text-blue-600 dark:text-blue-400 font-black text-base sm:text-lg">{job.company?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start gap-3">
                                                    <h3 className={cn(
                                                        "font-bold text-sm sm:text-[15px] leading-snug transition-colors line-clamp-2 break-words max-w-[42ch]",
                                                        expandedDesc.has(jobId) ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                                    )}>{job.title}</h3>
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBookmark(jobId);
                                                            }}
                                                            className={cn(
                                                                "p-1.5 rounded-lg transition-all duration-300",
                                                                isBookmarked 
                                                                    ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm" 
                                                                    : "text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                            )}
                                                        >
                                                            <Bookmark className={cn("w-3.5 h-3.5", isBookmarked && "fill-current")} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(jobId);
                                                            }}
                                                            className={cn(
                                                                "p-1.5 rounded-lg transition-all duration-300",
                                                                isFavorited 
                                                                    ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10 shadow-sm" 
                                                                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                            )}
                                                        >
                                                            <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest font-bold text-[8px] sm:text-[10px] min-w-0">
                                                    <span className="truncate max-w-[28ch]">{job.company}</span>
                                                    {job.is_internship && (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10">
                                                            <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                                                            Internship
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-5 sm:py-7 align-top">
                                        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 font-semibold text-xs sm:text-[13px] min-w-0">
                                            <div className="p-1 rounded-md bg-slate-50 dark:bg-slate-800/50">
                                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                            </div>
                                            <span className="line-clamp-2 break-words max-w-[26ch]">{job.location || 'Global'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-5 sm:py-7 align-top">
                                        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-[13px] whitespace-nowrap">
                                            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10">
                                                <DollarSign className="w-3.5 h-3.5" />
                                            </div>
                                            {formatSalary(job.salary_min, job.salary_max)}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-5 sm:py-7 align-top">
                                        <span className="inline-flex max-w-full truncate px-3 py-1 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700/50">
                                            {job.category || 'Engineering'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-8 py-5 sm:py-7 align-top">
                                        <div className="flex items-center gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDescription(jobId);
                                                }}
                                                className={cn(
                                                    "p-2.5 rounded-xl transition-all font-bold border",
                                                    expandedDesc.has(jobId)
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                )}
                                            >
                                                {expandedDesc.has(jobId) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (job.redirect_url) window.open(job.redirect_url, '_blank');
                                                }}
                                                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedDesc.has(jobId) && (
                                    <tr className="bg-blue-500/[0.03] dark:bg-blue-400/[0.02]">
                                        <td colSpan={5} className="px-12 py-8 sm:px-24">
                                            <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl whitespace-pre-wrap font-medium">
                                                {job.description}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default JobTable;
