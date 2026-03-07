import { motion } from 'framer-motion';
import { Search, X, MapPin, DollarSign } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchFiltersProps {
    keyword: string;
    setKeyword: (v: string) => void;
    showFilters: boolean;
    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    engineeringTypes: string[];
    location: string;
    setLocation: (v: string) => void;
    availableLocations: string[];
    minStipend: string;
    setMinStipend: (v: string) => void;
    isRemote: boolean;
    setIsRemote: (v: boolean) => void;
    isInternship: boolean;
    setIsInternship: (v: boolean) => void;
}

const SearchFilters = ({
    keyword,
    setKeyword,
    showFilters,
    selectedCategory,
    setSelectedCategory,
    engineeringTypes,
    location,
    setLocation,
    availableLocations,
    minStipend,
    setMinStipend,
    isRemote,
    setIsRemote,
    isInternship,
    setIsInternship,
}: SearchFiltersProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden"
        >
            <div className="p-6 sm:p-10">
                <div className="relative group/search max-w-4xl">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                        <Search className="w-5 h-5 text-blue-600" />
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for roles, companies, or keywords..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-medium"
                    />
                    {keyword && (
                        <button
                            onClick={() => setKeyword('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engineering Branch</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-all font-bold text-xs"
                            >
                                <option value="">All Disciplines</option>
                                {Array.isArray(engineeringTypes) && engineeringTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-all font-bold text-xs"
                            >
                                <option value="">All Locations</option>
                                {availableLocations.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Salary ($)</label>
                            <input
                                type="number"
                                placeholder="Min amount"
                                value={minStipend}
                                onChange={(e) => setMinStipend(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-all font-bold text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn("w-10 h-5 rounded-full relative transition-all duration-300", isRemote ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800")}>
                                    <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} className="sr-only" />
                                    <div className={cn("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300", isRemote ? "translate-x-5" : "")} />
                                </div>
                                <span className={cn("text-[11px] font-black uppercase tracking-widest", isRemote ? "text-blue-600" : "text-slate-400")}>Remote</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn("w-10 h-5 rounded-full relative transition-all duration-300", isInternship ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800")}>
                                    <input type="checkbox" checked={isInternship} onChange={(e) => setIsInternship(e.target.checked)} className="sr-only" />
                                    <div className={cn("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300", isInternship ? "translate-x-5" : "")} />
                                </div>
                                <span className={cn("text-[11px] font-black uppercase tracking-widest", isInternship ? "text-blue-600" : "text-slate-400")}>Intern</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SearchFilters;
