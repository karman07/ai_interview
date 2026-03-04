import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Heart, Bookmark, ChevronRight } from 'lucide-react';
import { Job } from '../../../api/jobService';

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
            className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(37,99,235,0.12)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-all duration-700 flex flex-col overflow-hidden"
        >
            {/* Premium Spotlight Blur */}
            <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors duration-700" />

            {/* Status Badge */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10">
                {job.is_internship ? (
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50/90 dark:bg-blue-900/40 backdrop-blur-xl text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Intern
                    </span>
                ) : (
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50/90 dark:bg-emerald-900/40 backdrop-blur-xl text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Full-time
                    </span>
                )}
            </div>

            {/* Actions Bar (Top Right) */}
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-30 flex items-center gap-2">
                {/* Bookmark Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(jobId);
                    }}
                    type="button"
                    className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-500 backdrop-blur-xl ${isBookmarked
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800/50 scale-110'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-blue-500 border border-white/50 dark:border-gray-700/50 hover:scale-110 active:scale-95'
                        }`}
                >
                    <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isBookmarked ? 'fill-current text-blue-500' : 'group-hover:text-blue-400'}`} />
                </button>

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(jobId);
                    }}
                    type="button"
                    className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-500 backdrop-blur-xl ${isFavorited
                        ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-500 shadow-lg ring-2 ring-pink-200 dark:ring-pink-800/50 scale-110'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-pink-500 border border-white/50 dark:border-gray-700/50 hover:scale-110 active:scale-95'
                        }`}
                >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isFavorited ? 'fill-current text-pink-500' : 'group-hover:text-pink-400'}`} />
                </button>
            </div>

            <div className="p-6 sm:p-10 pt-20 sm:pt-24 flex-1 relative z-10">
                <div className="flex items-start gap-4 sm:gap-5 mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-gray-900 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-[0_10px_25px_rgba(0,0,0,0.03)] group-hover:shadow-[0_15px_35px_rgba(37,99,235,0.15)] group-hover:-translate-y-1.5 transition-all duration-700 flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-xl sm:text-2xl tracking-tighter">{job.company?.charAt(0).toUpperCase() || 'J'}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-500" title={job.title}>
                            {job.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-[0.15em] mt-2">
                            {job.company}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2.5 mb-8">
                    {job.location && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[11px] font-black border border-blue-100/50 dark:border-blue-800/50 shadow-sm group-hover:bg-blue-100/50 transition-colors">
                            <MapPin className="w-4 h-4 text-blue-500" />{job.location}
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 text-[11px] font-black border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm group-hover:bg-emerald-100/50 transition-colors">
                        <DollarSign className="w-4 h-4" />{formatSalary(job.salary_min, job.salary_max)}
                    </div>
                </div>

                <div className="relative group-hover:translate-x-1 transition-transform duration-700">
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                        {job.description || 'Join our innovative engineering team to solve complex problems and build state-of-the-art solutions.'}
                    </p>
                </div>
            </div>

            <div className="p-6 sm:p-8 pt-0 flex gap-3 sm:gap-4 relative z-10">
                <button
                    onClick={() => handleJobClick(job)}
                    className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 active:scale-95"
                >
                    Details
                </button>
                <button
                    onClick={() => job.redirect_url ? window.open(job.redirect_url, '_blank') : null}
                    disabled={!job.redirect_url}
                    className="flex-[2] px-4 py-3 sm:px-6 sm:py-3.5 bg-blue-600 dark:bg-blue-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:bg-blue-700 dark:hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 group/apply relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/apply:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">Apply Now</span>
                    <ChevronRight className="w-4 h-4 relative z-10 group-hover/apply:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
});

export default JobCard;
