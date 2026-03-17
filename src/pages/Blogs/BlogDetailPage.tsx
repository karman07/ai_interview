import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

interface Blog {
  title: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  coverImage: string;
  content: string;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await axios.get(`${API_URL}/blogs/${slug}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to fetch blog content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-center py-20 text-gray-800 dark:text-white">
        <h2 className="text-2xl font-bold">Article Not Found</h2>
        <Link to="/blogs" className="text-blue-500 hover:underline mt-4 inline-block">
          &larr; Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-slate-100 p-6 sm:p-10 mb-20 pt-10">
      {blog && (
        <Helmet>
          <title>{blog.title} | AI for Job</title>
          <meta name="description" content={blog.excerpt} />
          <meta property="og:title" content={blog.title} />
          <meta property="og:description" content={blog.excerpt} />
          <meta property="og:image" content={blog.coverImage || '/images/fallback_blog.jpg'} />
          <meta property="og:type" content="article" />
          <meta property="article:author" content={blog.author} />
          <meta property="article:section" content={blog.category} />
        </Helmet>
      )}

      {/* Absolute Navbar Spacer */}
      <div className="h-28 md:h-32 w-full"></div>

      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link to="/blogs" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Hub
        </Link>

        {/* Header Ribbon */}
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-600/90 text-white px-2.5 py-1 rounded-lg">
            {blog.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-4 text-gray-900 dark:text-white leading-tight">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 mt-4 text-gray-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500" />
              <span>By {blog.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{new Date(blog.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>4 min read</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 border border-gray-200 dark:border-slate-800 shadow-xl shadow-blue-500/5">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/fallback_blog.jpg"; }}
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        {/* Markdown Rendered Content */}
        <div className="max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-slate-800 pb-2" {...props} />,
              h2: ({ ...props }) => <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mt-6 mb-3 flex items-center gap-2" {...props} />,
              h3: ({ ...props }) => <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mt-5 mb-2" {...props} />,
              p: ({ ...props }) => <p className="text-base text-gray-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-slate-300" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-slate-300" {...props} />,
              li: ({ ...props }) => <li className="text-gray-700 dark:text-slate-300 text-base" {...props} />,
              strong: ({ ...props }) => <strong className="font-bold text-blue-600 dark:text-blue-400" {...props} />,
              em: ({ ...props }) => <em className="italic text-gray-800 dark:text-slate-200" {...props} />,
              blockquote: ({ ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-100 dark:bg-slate-800/50 rounded-r-xl text-gray-700 dark:text-slate-300 italic" {...props} />,
              code: ({ ...props }) => <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-indigo-300 text-sm font-mono border border-gray-200 dark:border-slate-700" {...props} />,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
