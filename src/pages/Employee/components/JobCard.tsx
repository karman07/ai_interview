import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Heart, Bookmark, ChevronRight } from 'lucide-react';
import { Job } from '../../../api/jobService';
import { cn } from '@/utils/cn';

interface JobCardProps {
    job: Job;
    idx: number;
    favorites: Set<string>;
    toggleFavorite: (jobId: string) => void;
    bookmarks: Set<string>;
    toggleBookmark: (jobId: string) => void;
    handleJobClick: (job: Job) => void;
    formatSalary: (min?: number | null, max?: number | null) => string;
}

const JobCard = forwardRef<HTMLDivElement, JobCardProps>(({
    job,
    idx,
    favorites,
    toggleFavorite,
    bookmarks,
    toggleBookmark,
    handleJobClick,
    formatSalary
}, ref) => {
    const jobId = job.job_id || (job as any)._id;
    const isFavorited = favorites.has(jobId);
    const isBookmarked = bookmarks.has(jobId);

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => handleJobClick(job)}
            className="group bg-slate-900/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[1.5rem] p-6 border border-slate-200/40 dark:border-slate-800/40 hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:bg-slate-900/60 dark:hover:bg-slate-800/40 transition-all duration-300 cursor-pointer flex flex-col h-[280px] w-full relative overflow-hidden"
        >
            {/* Subtle Overlay on Hover */}
            <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Header: Badges & Actions */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex gap-2">
                    <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border",
                        job.is_internship 
                            ? "bg-blue-500/5 text-blue-500 border-blue-500/20" 
                            : "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                    )}>
                        {job.is_internship ? 'Internship' : 'Full-time'}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(jobId); }}
                        className={cn(
                            "p-2 rounded-xl transition-all duration-200",
                            isBookmarked 
                                ? "text-blue-500 bg-blue-500/10" 
                                : "text-slate-500 hover:text-blue-500 hover:bg-slate-800"
                        )}
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(jobId); }}
                        className={cn(
                            "p-2 rounded-xl transition-all duration-200",
                            isFavorited 
                                ? "text-rose-500 bg-rose-500/10" 
                                : "text-slate-500 hover:text-rose-500 hover:bg-slate-800"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex items-center gap-5 mb-5 relative z-10">
                <div className="w-14 h-14 bg-slate-950/40 rounded-xl flex items-center justify-center border border-slate-800/40 shrink-0 text-xl font-black text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-300 shadow-sm">
                    {job.company?.charAt(0).toUpperCase() || 'J'}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="h-[44px]"> {/* Fixed height for 2 lines of title */}
                        <h3 className="text-[17px] font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {job.title}
                        </h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest truncate w-full">
                        {job.company}
                    </p>
                </div>
            </div>

            {/* Meta Details */}
            <div className="flex flex-col gap-2.5 mb-4 relative z-10 px-1">
                {job.location && (
                    <div className="flex items-center gap-2.5 text-slate-400 text-xs font-bold truncate">
                        <MapPin className="w-3.5 h-3.5 text-blue-500/70 shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-2.5 text-emerald-500/80 text-xs font-bold">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    {formatSalary(job.salary_min, job.salary_max)}
                </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 overflow-hidden text-ellipsis mb-6 relative z-10 px-1 h-[32px]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {job.description || 'Join our innovative engineering team to solve complex problems and build state-of-the-art solutions.'}
            </p>

            {/* Footer Actions */}
            <div className="mt-auto relative z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); if (job.redirect_url) window.open(job.redirect_url, '_blank'); }}
                    disabled={!job.redirect_url}
                    className="w-full py-3 bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-30"
                >
                    View Details
                </button>
            </div>
        </motion.div>
    );
});

export default JobCard;
