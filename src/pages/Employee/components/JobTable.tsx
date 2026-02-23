import React from 'react';
import { MapPin, DollarSign, Heart, Bookmark, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Job } from '../../../api/jobService';

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
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Opportunity</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compensation</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Branch</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ops</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {jobs.map((job) => {
                        const jobId = job.job_id || (job as any)._id;
                        const isFavorited = favorites.has(jobId);
                        const isBookmarked = bookmarks.has(jobId);

                        return (
                            <React.Fragment key={jobId}>
                                <tr
                                    className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
                                    onClick={() => handleJobClick(job)}
                                >
                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-110">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">{job.company?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">{job.title}</h3>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBookmark(jobId);
                                                            }}
                                                            className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors ${isBookmarked ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400'}`}
                                                        >
                                                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(jobId);
                                                            }}
                                                            className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors ${isFavorited ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-400'}`}
                                                        >
                                                            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400 mt-0.5 uppercase tracking-wider font-bold text-[8px] sm:text-[10px]">
                                                    {job.company} {job.is_internship && <span className="ml-1 sm:ml-2 text-blue-500">• Intern</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm">
                                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                                            {job.location || 'Global'}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                                            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {formatSalary(job.salary_min, job.salary_max)}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-lg">
                                            {job.category || 'Engineering'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDescription(jobId);
                                                }}
                                                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all font-bold"
                                            >
                                                {expandedDesc.has(jobId) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (job.redirect_url) window.open(job.redirect_url, '_blank');
                                                }}
                                                className="p-2 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedDesc.has(jobId) && (
                                    <tr className="bg-blue-50/20 dark:bg-blue-900/5">
                                        <td colSpan={5} className="px-12 py-6">
                                            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl whitespace-pre-wrap font-medium">
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
