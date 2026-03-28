import { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, Calendar, User } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { API_BASE_URL } from '@/api/http';

interface BlogMeta {
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  coverImage: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogMeta[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/blogs`, {
          timeout: 15000,
          params: {
            category: categoryFromUrl || undefined,
            search: search || undefined,
          }
        });
        setBlogs(res.data);
        
        if (categories.length === 0 && res.data.length > 0) {
          const cats = Array.from(new Set(res.data.map((b: BlogMeta) => b.category))) as string[];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
        setError('Unable to fetch blogs from server. Please try again in a moment.');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [categoryFromUrl, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-slate-100 p-6 sm:p-10 pt-10">
      <Helmet>
        <title>Knowledge Hub | AI for Job</title>
        <meta name="description" content="Expert insights, interview strategies, and career growth techniques to ace your Ai for jobs." />
        <link rel="canonical" href={`${window.location.origin}/blogs`} />
        <meta property="og:title" content="Knowledge Hub | AI for Job" />
        <meta property="og:description" content="Expert insights, interview strategies, and career growth techniques." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blogs`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Knowledge Hub | AI for Job" />
        <meta name="twitter:description" content="Expert insights, interview strategies, and career growth techniques." />
      </Helmet>

      {/* Absolute Navbar Spacer */}
      <div className="h-28 md:h-32 w-full"></div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-500">
            Knowledge Hub
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Expert insights, interview strategies, and career growth techniques.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-slate-200 text-sm w-full shadow-sm"
            />
          </div>

          {/* Elegant Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 transition-all text-sm text-gray-700 dark:text-slate-300 w-full sm:w-48 shadow-sm"
            >
              <span className="truncate">{categoryFromUrl || 'All Categories'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden z-20">
                <ul className="text-gray-700 dark:text-slate-300 text-sm">
                  <li
                    onClick={() => { setSearchParams({}); setDropdownOpen(false); }}
                    className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer border-b border-gray-100 dark:border-slate-700/50"
                  >
                    All Categories
                  </li>
                  {categories.map((cat, idx) => (
                    <li
                      key={idx}
                      onClick={() => { setSearchParams({ category: cat }); setDropdownOpen(false); }}
                      className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-rose-500 dark:text-rose-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-rose-300 dark:text-rose-700" />
            <h3 className="text-lg font-semibold">Could not load blogs</h3>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <Link 
                key={index}
                to={`/blogs/${blog.slug}`}
                className="group flex flex-col rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-500/5 transition-all overflow-hidden shadow-sm"
              >
                {/* Cover Image */}
                <div className="h-48 overflow-hidden bg-gray-100 dark:bg-slate-700 relative">
                  {blog.coverImage ? (
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/fallback_blog.jpg"; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-800">
                      <BookOpen className="w-12 h-12 text-slate-500/50" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider bg-blue-600/90 text-white px-2.5 py-1 rounded-lg">
                    {blog.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  {/* Meta */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between text-gray-400 dark:text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(blog.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 dark:text-slate-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold">No articles found</h3>
            <p className="text-sm mt-1">Try adjusting your category or search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
