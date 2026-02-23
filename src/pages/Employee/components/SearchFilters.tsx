import { motion } from 'framer-motion';
import { Search, X, Briefcase, MapPin, ChevronRight, DollarSign } from 'lucide-react';

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700/50 overflow-hidden"
        >
            <div className="p-8">
                <div className="relative group/search">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                        <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by role, company, or skills..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-20 pr-6 py-5 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 rounded-3xl outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium shadow-inner"
                    />
                    {keyword && (
                        <button
                            onClick={() => setKeyword('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Engineering Branch</label>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white focus:border-blue-500 transition-all font-medium appearance-none"
                                >
                                    <option value="">All Disciplines</option>
                                    {Array.isArray(engineeringTypes) && engineeringTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
                            <div className="relative">
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold appearance-none"
                                >
                                    <option value="">All Locations</option>
                                    {availableLocations.map((loc) => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Min Salary ($)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Min amount"
                                    value={minStipend}
                                    onChange={(e) => setMinStipend(e.target.value)}
                                    className="w-full pl-10 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder:font-normal"
                                />
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isRemote ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                    <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} className="sr-only" />
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isRemote ? 'translate-x-6' : ''}`} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Remote</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isInternship ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                    <input type="checkbox" checked={isInternship} onChange={(e) => setIsInternship(e.target.checked)} className="sr-only" />
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isInternship ? 'translate-x-6' : ''}`} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Intern</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SearchFilters;
