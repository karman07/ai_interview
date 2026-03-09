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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleJobClick(job)}
            className="group bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
        >
            {/* Header: Badges & Actions */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                    <span className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full",
                        job.is_internship ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-[#ecfdf5] text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                        {job.is_internship ? 'Intern' : 'Full-time'}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(jobId); }}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current text-blue-600")} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(jobId); }}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <Heart className={cn("w-4 h-4", isFavorited && "fill-current text-rose-500")} />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex items-center gap-5 mb-5 space-x-1">
                <div className="w-[60px] h-[60px] bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0 text-2xl font-black text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                    {job.company?.charAt(0).toUpperCase() || 'J'}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-[#0B1426] dark:text-white leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-widest">
                        {job.company}
                    </p>
                </div>
            </div>

            {/* Meta Details */}
            <div className="flex flex-col gap-3 mb-5 px-1">
                {job.location && (
                    <div className="flex items-center gap-3 text-[#4B5563] dark:text-slate-400 text-sm font-semibold">
                        <MapPin className="w-4 h-4 text-slate-500 stroke-[1.5]" />
                        {job.location}
                    </div>
                )}
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-bold">
                    <DollarSign className="w-4 h-4 text-blue-600 stroke-[2]" />
                    {formatSalary(job.salary_min, job.salary_max)}
                </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 mt-2">
                {job.description || 'Join our innovative engineering team to solve complex problems and build state-of-the-art solutions.'}
            </p>

            {/* Footer Actions */}
            <div className="mt-auto pt-6">
                <button
                    onClick={(e) => { e.stopPropagation(); if (job.redirect_url) window.open(job.redirect_url, '_blank'); }}
                    disabled={!job.redirect_url}
                    className="w-full py-3 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    Apply Now
                </button>
            </div>
        </motion.div>
    );
});

export default JobCard;
