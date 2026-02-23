import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, DollarSign, Briefcase, Play, Heart, Bookmark } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { Job } from '../../../api/jobService';

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
            className="max-w-6xl mx-auto"
        >
            <button
                onClick={() => setSelectedJob(null)}
                className="mb-8 flex items-center gap-3 text-gray-500 hover:text-blue-600 transition-all font-bold group"
            >
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </div>
                Back to Opportunity Discovery
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-blue-500/5 overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900/80 dark:to-gray-900" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-800" />
                </div>

                <div className="px-12 pb-12 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div className="flex items-end gap-8">
                            <div className="w-40 h-40 bg-white dark:bg-gray-900 rounded-[2.5rem] flex items-center justify-center border-8 border-white dark:border-gray-800 shadow-2xl relative">
                                <span className="text-blue-600 dark:text-blue-400 font-black text-6xl tracking-tighter">
                                    {selectedJob.company?.charAt(0).toUpperCase()}
                                </span>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white dark:border-gray-800 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                </div>
                            </div>
                            <div className="pb-4">
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                                    {selectedJob.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{selectedJob.company}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{selectedJob.employment_type || 'Opportunity'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pb-4">
                            <button
                                onClick={() => selectedJob.redirect_url && window.open(selectedJob.redirect_url, '_blank')}
                                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-xl shadow-blue-500/20 flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-widest"
                            >
                                Apply for position <ExternalLink className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-12">
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Mission Briefing</h2>
                                </div>
                                <div className="prose prose-blue dark:prose-invert max-w-none">
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                                        {selectedJob.description}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="p-10 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 backdrop-blur-xl">
                                <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8">Snapshot Info</h3>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg group-hover:scale-110 transition-transform border border-gray-100 dark:border-gray-700">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Work Location</p>
                                            <p className="text-gray-900 dark:text-white font-bold">{selectedJob.location || 'Remote Discovery'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg group-hover:scale-110 transition-transform border border-gray-100 dark:border-gray-700">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Compensation Range</p>
                                            <p className="text-gray-900 dark:text-white font-bold">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 group">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg group-hover:scale-110 transition-transform border border-gray-100 dark:border-gray-700">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Engineering Branch</p>
                                            <p className="text-gray-900 dark:text-white font-bold">{selectedJob.category || 'Multidisciplinary'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
                                    <button
                                        onClick={() => navigate('/interview/start/technical', {
                                            state: { role: selectedJob.title, company: selectedJob.company, jobDescription: selectedJob.description }
                                        })}
                                        className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center justify-center gap-3"
                                    >
                                        <Play className="w-5 h-5" /> Mock Interview
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => toggleBookmark(jobId)}
                                            className={`py-4 font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${isBookmarked
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800'
                                                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                        </button>
                                        <button
                                            onClick={() => toggleFavorite(jobId)}
                                            className={`py-4 font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${isFavorited
                                                ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 border-pink-200 dark:border-pink-800'
                                                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                                            {isFavorited ? 'Favorited' : 'Favorite'}
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
