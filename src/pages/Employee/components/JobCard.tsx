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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: idx * 0.03 }}
            onClick={() => handleJobClick(job)}
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 hover:border-blue-500/30 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 active:scale-[0.98]"
        >
            {/* Header: Badges & Actions */}
            <div className="p-6 pb-0 flex items-start justify-between relative z-10">
                <div className="flex gap-2">
                    {job.is_internship ? (
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100 dark:border-blue-800/50">
                            Intern
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                            Full-time
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(jobId);
                        }}
                        className={cn(
                            "p-2 rounded-xl transition-all duration-300 border",
                            isBookmarked
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600"
                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-200"
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
                            "p-2 rounded-xl transition-all duration-300 border",
                            isFavorited
                                ? "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-500"
                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200"
                        )}
                    >
                        <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-500">
                        <span className="text-xl font-black tracking-tighter">
                            {job.company?.charAt(0).toUpperCase() || 'J'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
                            {job.company}
                        </p>
                    </div>
                </div>

                {/* Meta Details */}
                <div className="flex flex-wrap gap-2">
                    {job.location && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800/50">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                        <DollarSign className="w-3 h-3" />
                        {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                </div>

                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {job.description || 'Join our innovative engineering team to solve complex problems and build state-of-the-art solutions.'}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto p-6 pt-0 flex gap-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (job.redirect_url) window.open(job.redirect_url, '_blank');
                    }}
                    disabled={!job.redirect_url}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    Apply Now
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
});

export default JobCard;
