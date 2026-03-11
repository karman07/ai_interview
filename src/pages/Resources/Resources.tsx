import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen, Video, FileText, Download, ExternalLink, Clock, Star, TrendingUp, Award, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { resourcesApi, GetResourcesParams } from '../../api/resources';
import { baseURL } from '../../api/http';

export interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  duration?: string;
  studyTime?: string;
  downloads?: number;
  students?: number;
  rating?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  updatedAt?: string;
  createdAt?: string;
  featured?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
  externalUrl?: string;
}

const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('program') || cat.includes('web') || cat.includes('dev')) return <BookOpen className="w-5 h-5" />;
  if (cat.includes('math') || cat.includes('science')) return <FileText className="w-5 h-5" />;
  if (cat.includes('design') || cat.includes('career')) return <Award className="w-5 h-5" />;
  if (cat.includes('finance')) return <TrendingUp className="w-5 h-5" />;
  return <Video className="w-5 h-5" />;
};

const getCategoryColors = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('program')) return { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600' };
  if (cat.includes('design')) return { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600' };
  if (cat.includes('finance')) return { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600' };
  if (cat.includes('career')) return { bg: 'bg-slate-50 dark:bg-slate-900/30', text: 'text-slate-600' };
  return { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600' };
};

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const description = resource.description || '';
  const shouldShowReadMore = description.length > maxLength;
  const colors = getCategoryColors(resource.category);

  const handleClick = async (e: React.MouseEvent) => {
    const targetUrl = resource.downloadUrl
      ? (resource.downloadUrl.startsWith('/uploads') ? `${baseURL}${resource.downloadUrl}` : resource.downloadUrl)
      : resource.externalUrl;

    if (targetUrl && targetUrl !== '#') {
      if (resource.downloadUrl) {
        try {
          await resourcesApi.trackDownload(resource._id);
        } catch (e) { }
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const thumbnailUrl = resource.thumbnailUrl
    ? (resource.thumbnailUrl.startsWith('/uploads') ? `${baseURL}${resource.thumbnailUrl}` : resource.thumbnailUrl)
    : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop';

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-blue-500/50 hover:shadow-md cursor-pointer flex flex-col h-full overflow-hidden"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={thumbnailUrl}
          alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

        {resource.featured && (
          <div className="absolute top-4 right-4 bg-amber-400 text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            FEATURED
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/30`}>
              {resource.category || 'General'}
            </span>
            {resource.type && (
              <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-[10px] font-medium text-blue-100 uppercase tracking-wider">
                {resource.type}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${colors.bg} ${colors.text} border border-[${colors.bg.split(' ')[0]}]`}>
              {getCategoryIcon(resource.category)}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>{resource.rating || 'New'}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {resource.title}
        </h3>

        <div className="mb-6 flex-grow">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {isExpanded || !shouldShowReadMore
              ? description
              : `${description.substring(0, maxLength)}...`}
          </p>
          {shouldShowReadMore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-colors"
            >
              {isExpanded ? (
                <>Show less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Read more <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(resource.tags || []).slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-auto border-t border-slate-100 dark:border-slate-800 mt-6 pt-4">
          <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
            {resource.duration && (
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{resource.duration}</span>
              </div>
            )}
            <div className="flex items-center space-x-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>{(resource.downloads || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {(resource.externalUrl || resource.downloadUrl) && (
              <a
                href={resource.downloadUrl ? `${baseURL}${resource.downloadUrl}` : resource.externalUrl}
                onClick={(e) => {
                  e.stopPropagation();
                  if (resource.downloadUrl) {
                    resourcesApi.trackDownload(resource._id).catch(() => { });
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                title={resource.downloadUrl ? "Download" : "View Source"}
              >
                {resource.downloadUrl ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourcesHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResources, setTotalResources] = useState(0);

  const categories = ['All', 'Programming', 'Web Development', 'Mathematics', 'Data Science', 'Language', 'Finance', 'Design', 'Career'];
  const types = ['All', 'Interactive Course', 'Video Series', 'Study Guide', 'Practical Workshop', 'Technical Guide', 'Professional Course', 'Design Workshop', 'Reference PDF', 'Case Study'];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetResourcesParams = {
        page,
        limit: 12,
        sort: sortBy,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'All') params.type = selectedType;

      const res = await resourcesApi.getAll(params);
      setResources(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalResources(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCategory, selectedType, sortBy]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />
      <div className="relative pt-20 pb-12 border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Premium Resource <span className="text-blue-600">Library</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Access curated, industry-grade learning materials designed by experts to accelerate your professional growth.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-12">
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Search & Filters</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search titles, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-300 text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="min-w-[200px] relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="w-full appearance-none px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                </select>
                <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="min-w-[180px] relative">
                <select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                  className="w-full appearance-none px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                </select>
                <FileText className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="min-w-[180px] relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full appearance-none px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Updated</option>
                  <option value="rating">Highest Rated</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <TrendingUp className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Found <span className="text-blue-600 dark:text-blue-400">{totalResources}</span> resources
              </span>
              {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedType('All');
                    setPage(1);
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Available Resources
                {resources.length > 0 && (
                  <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                    ({totalResources})
                  </span>
                )}
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading resources...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {resources.map((resource) => (
                  <ResourceCard key={resource._id} resource={resource} />
                ))}
              </div>

              {resources.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No resources found</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-8">
                    Try adjusting your search criteria or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setSelectedType('All');
                    }}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <div className="flex space-x-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesHub;