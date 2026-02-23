import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Sparkles, Heart, Bookmark, Filter, Grid3x3, List, X } from 'lucide-react';

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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-3xl p-2 sm:p-2.5 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
        >
            {/* Primary Action Group */}
            <div className="flex items-center gap-2 pr-2 sm:pr-4 border-r border-gray-100 dark:border-gray-700/50">
                <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="p-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 bg-gray-900 dark:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                >
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline font-black text-xs uppercase tracking-wider">Alerts</span>
                </button>

                <div className="relative group/match">
                    <button
                        onClick={() => isResumeFiltered ? clearResumeFilter() : fileInputRef.current?.click()}
                        className={`p-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 font-extrabold text-xs uppercase tracking-wider border relative overflow-hidden ${isResumeFiltered
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                            : 'bg-blue-600 text-white shadow-xl shadow-blue-500/25 border-blue-500 hover:bg-blue-700 hover:-translate-y-0.5'
                            }`}
                    >
                        {!isResumeFiltered && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover/match:opacity-100 transition-opacity duration-700" />
                        )}

                        {isResumeFiltered ? <X className="w-5 h-5" /> : <Sparkles className="w-4.5 h-4.5" />}
                        <span className="hidden sm:inline relative z-10">{isResumeFiltered ? 'Clear' : 'Match'}</span>

                        {!isResumeFiltered && (
                            <div className="hidden lg:block ml-1.5 px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[8px] font-black tracking-tighter uppercase border border-white/30">
                                Beta
                            </div>
                        )}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleResumeFilterUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                    />
                </div>
            </div>

            {/* Secondary Tools Group */}
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2">
                {/* Bookmarks Toggle */}
                <button
                    onClick={() => {
                        setShowBookmarks(!showBookmarks);
                        if (!showBookmarks) setShowFavorites(false);
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 ${showBookmarks
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 border border-blue-100 dark:border-blue-900/30'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <Bookmark className={`w-5 h-5 ${showBookmarks ? 'fill-current' : ''}`} />
                </button>

                {/* Favorites Toggle */}
                <button
                    onClick={() => {
                        setShowFavorites(!showFavorites);
                        if (!showFavorites) setShowBookmarks(false);
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 ${showFavorites
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500 border border-pink-100 dark:border-pink-900/30'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
                </button>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 ${showFilters
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-900/30'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <Filter className="w-5 h-5" />
                </button>

                <div className="hidden sm:block w-px h-6 bg-gray-100 dark:bg-gray-700/50 mx-1 sm:mx-2"></div>

                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600' : 'text-gray-400 opacity-50'}`}>
                        <Grid3x3 className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                    </button>
                    <button onClick={() => setViewMode('table')} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600' : 'text-gray-400 opacity-50'}`}>
                        <List className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PortalActions;
