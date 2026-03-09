import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, DollarSign, Briefcase, Play, Heart, Bookmark } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { Job } from '../../../api/jobService';
import { cn } from '@/utils/cn';

interface JobDetailsPortalProps {
    selectedJob: Job;
    favorites: Set<string>;
    toggleFavorite: (jobId: string) => void;
    bookmarks: Set<string>;
    toggleBookmark: (jobId: string) => void;
    setSelectedJob: (job: Job | null) => void;
    formatSalary: (min?: number | null, max?: number | null) => string;
    navigate: NavigateFunction;
}

const JobDetailsPortal = ({
    selectedJob,
    favorites,
    toggleFavorite,
    bookmarks,
    toggleBookmark,
    setSelectedJob,
    formatSalary,
    navigate,
}: JobDetailsPortalProps) => {
    const jobId = selectedJob.job_id || (selectedJob as any)._id;
    const isFavorited = favorites.has(jobId);
    const isBookmarked = bookmarks.has(jobId);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto"
        >
            <button
                onClick={() => setSelectedJob(null)}
                className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold group"
            >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Jobs</span>
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                {/* Header Gradient Background */}
                <div className="h-48 bg-gradient-to-b from-blue-600 to-white dark:from-blue-900 dark:to-slate-900 opacity-90" />

                <div className="px-8 sm:px-12 pb-12 -mt-20 relative z-10 w-full">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                            <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[24px] flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg shrink-0">
                                <span className="text-blue-600 dark:text-blue-500 font-black text-5xl">
                                    {selectedJob.company?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="pb-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                                    {selectedJob.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{selectedJob.company}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedJob.employment_type || 'FULL-TIME'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pb-2">
                            <button
                                onClick={() => selectedJob.redirect_url && window.open(selectedJob.redirect_url, '_blank')}
                                disabled={!selectedJob.redirect_url}
                                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                Apply for position <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-10">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Mission Briefing</h2>
                                </div>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                                        {selectedJob.description}
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Snapshot Info</h3>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-slate-100 dark:border-slate-700">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Location</p>
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">{selectedJob.location || 'Remote Discovery'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Compensation Range</p>
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-800/50">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Engineering Branch</p>
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">{selectedJob.category || 'Multidisciplinary'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <button
                                        onClick={() => navigate('/interview/start/technical', {
                                            state: { role: selectedJob.title, company: selectedJob.company, jobDescription: selectedJob.description }
                                        })}
                                        className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-colors"
                                    >
                                        <Play className="w-4 h-4" /> Mock Interview
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => toggleBookmark(jobId)}
                                            className={`flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest border ${isBookmarked
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                                            {isBookmarked ? 'Saved' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => toggleFavorite(jobId)}
                                            className={`px-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center border ${isFavorited
                                                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-rose-200 dark:border-rose-800'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default JobDetailsPortal;
