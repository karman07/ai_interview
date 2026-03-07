import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Bookmark, Filter, Grid3x3, List, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PortalActionsProps {
    setShowSubscriptionModal: (v: boolean) => void;
    isResumeFiltered: boolean;
    clearResumeFilter: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    showFavorites: boolean;
    setShowFavorites: (v: boolean) => void;
    showBookmarks: boolean;
    setShowBookmarks: (v: boolean) => void;
    showFilters: boolean;
    setShowFilters: (v: boolean) => void;
    viewMode: 'grid' | 'table';
    setViewMode: (v: 'grid' | 'table') => void;
    handleResumeFilterUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PortalActions = ({
    setShowSubscriptionModal,
    isResumeFiltered,
    clearResumeFilter,
    fileInputRef,
    showFavorites,
    setShowFavorites,
    showBookmarks,
    setShowBookmarks,
    showFilters,
    setShowFilters,
    viewMode,
    setViewMode,
    handleResumeFilterUpload
}: PortalActionsProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-2.5 p-1.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
            <div className="flex items-center gap-2 pr-2.5 border-r border-slate-200 dark:border-slate-800/60 ml-1">
                <button
                    onClick={() => isResumeFiltered ? clearResumeFilter() : fileInputRef.current?.click()}
                    className={cn(
                        "px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 font-black text-[10px] uppercase tracking-widest border shadow-sm",
                        isResumeFiltered
                            ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-900/30"
                            : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                    )}
                >
                    {isResumeFiltered ? <X className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isResumeFiltered ? 'Clear Match' : 'Match Resume'}
                    {!isResumeFiltered && (
                        <span className="ml-1 px-1 py-0.5 bg-white/20 rounded text-[7px] border border-white/20">BETA</span>
                    )}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleResumeFilterUpload} className="hidden" accept=".pdf,.doc,.docx" />
            </div>

            <div className="flex items-center gap-1.5 px-1">
                <button
                    onClick={() => { setShowBookmarks(!showBookmarks); if (!showBookmarks) setShowFavorites(false); }}
                    className={cn(
                        "p-2.5 rounded-xl transition-all duration-300 border",
                        showBookmarks ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                    )}
                >
                    <Bookmark className={cn("w-4 h-4", showBookmarks && "fill-current")} />
                </button>

                <button
                    onClick={() => { setShowFavorites(!showFavorites); if (!showFavorites) setShowBookmarks(false); }}
                    className={cn(
                        "p-2.5 rounded-xl transition-all duration-300 border",
                        showFavorites ? "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-500" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                    )}
                >
                    <Heart className={cn("w-4 h-4", showFavorites && "fill-current")} />
                </button>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "p-2.5 rounded-xl transition-all duration-300 border",
                        showFilters ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                    )}
                >
                    <Filter className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1"></div>

                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                    <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400 opacity-60")}>
                        <Grid3x3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setViewMode('table')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'table' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400 opacity-60")}>
                        <List className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PortalActions;
