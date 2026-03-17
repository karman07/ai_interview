import { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, Book, Menu, X, ArrowLeft, FileText, DownloadCloud, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface Subtopic {
  name: string;
  slug: string;
}

interface Topic {
  topic: string;
  subtopics: Subtopic[];
  children?: any[];
}

export default function DocsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [activeSubtopic, setActiveSubtopic] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [selectedTopicTheme, setSelectedTopicTheme] = useState<string>('');
  const [headings, setHeadings] = useState<{ text: string; id: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All Topics');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${API_URL}/docs/tree`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTopics(res.data);
        // Expand the first topic by default
        if (res.data.length > 0) {
          setExpandedTopics([res.data[0].topic]);
          if (res.data[0].subtopics.length > 0) {
            handleSelect(res.data[0].topic, res.data[0].subtopics[0].slug);
          }
        }
      } catch (err) {
        console.error('Failed to load docs tree:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  const handleSelect = async (topic: string, slug: string) => {
    setActiveTopic(topic);
    setActiveSubtopic(slug);
    if (window.innerWidth < 1024) setSidebarOpen(false);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/docs/${encodeURIComponent(topic)}/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedContent(res.data.content);
    } catch (err) {
      console.error('Failed to load docs content:', err);
      setSelectedContent('# Error\nFailed to load content. Try refreshing.');
    }
  };

  useEffect(() => {
    if (selectedContent) {
      const matches = selectedContent.match(/^##\s+(.+)$/gm);
      if (matches) {
        const parsed = matches.map(m => {
          const text = m.replace(/^##\s+/, '').trim();
          const id = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
          return { text, id };
        });
        setHeadings(parsed);
      } else {
        setHeadings([]);
      }
    } else {
      setHeadings([]);
    }
  }, [selectedContent]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const filteredTopics = topics.map(topic => ({
    ...topic,
    subtopics: topic.subtopics.filter(sub => 
      sub.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(topic => topic.subtopics.length > 0);

  if (!selectedTopicTheme) {
    const landingFilteredTopics = topics.filter(t => {
      const matchesSearch = t.topic.toLowerCase().includes(search.toLowerCase());
      if (activeTab === 'All Topics') return matchesSearch;
      if (activeTab === 'Database') return matchesSearch && t.topic === 'Database';
      if (activeTab === 'Generative AI') return matchesSearch && t.topic === 'Generative AI';
      if (activeTab === 'RAG Systems') return matchesSearch && t.topic === 'RAG Systems';
      if (activeTab === 'Backend Engineering') return matchesSearch && t.topic === 'Backend Engineering';
      if (activeTab === 'Frontend Engineering') return matchesSearch && t.topic === 'Frontend Engineering';
      if (activeTab === 'Machine Learning') return matchesSearch && t.topic === 'Machine Learning';
      if (activeTab === 'Deep Learning') return matchesSearch && t.topic === 'Deep Learning';
      return matchesSearch;
    });

    const categoryTabs = ['All Topics', 'Backend Engineering', 'Frontend Engineering', 'Machine Learning', 'Deep Learning', 'Database', 'Generative AI', 'RAG Systems'];

    return (
      <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto flex flex-col items-center p-8 sm:p-12 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-colors-blue-500)_from-10%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_#1e3a8a_from-20%,_transparent_40%)]">
          <div className="max-w-5xl w-full flex flex-col items-center mt-6 mb-12">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Knowledge Core</h1>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 text-center mb-8">Select any category index below to view structured technical guides.</p>

            {/* Premium Toolbar with Filters & Search */}
            <div className="w-full max-w-xl flex flex-col gap-4 items-center">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search documentation across topics..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/5 dark:shadow-none border border-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium transition-all"
                />
              </div>

              {/* Tag Filters */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {categoryTabs.map((tab, tIdx) => (
                  <button 
                    key={tIdx}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 hover:border-blue-500/30'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
            {landingFilteredTopics.map((t, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setSelectedTopicTheme(t.topic);
                  setExpandedTopics([t.topic]);
                  if (t.subtopics.length > 0) handleSelect(t.topic, t.subtopics[0].slug);
                }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 shadow-lg shadow-blue-500/[0.03] dark:shadow-none hover:border-blue-500/30 hover:shadow-blue-500/[0.08] cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center mb-4 group-hover:bg-blue-600 shadow-inner transition-all duration-300">
                  <Book className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {idx + 1}. {t.topic}
                </h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-medium">{t.subtopics.length} core subtopics & docs</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Guides &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 overflow-hidden">
      {/* Mobile Toggle Trigger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-50 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all hover:scale-105"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* LEFT SIDEBAR navigation */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static top-0 bottom-0 left-0 w-80 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-transform duration-300 z-40 flex flex-col h-screen print:hidden
      `}>
        {/* Header toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 mb-2">
            <Book className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-lg tracking-tight">Documentation</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{topics.length} core topics available</p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rouded-lg text-sm bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
            />
          </div>
        </div>

        {/* Categories / Tree lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex flex-col gap-2 p-1">
              <div className="h-10 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
              <div className="h-10 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            </div>
          ) : filteredTopics
              .filter(item => item.topic === selectedTopicTheme)
              .map((item, index) => {
                // Keep expanded by default since it is the only one
                const isExpanded = true; 
                const isActiveTopic = activeTopic === item.topic;

                return (
                  <div key={index} className="space-y-1">
                    <button 
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-semibold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/10`}
                    >
                  <div className="flex flex-col items-start">
                    <span>{item.topic}</span>
                    <span className={`text-[10px] mt-0.5 ${isActiveTopic ? 'text-blue-100' : 'text-gray-400 dark:text-slate-500'}`}>
                      {item.subtopics.length} subtopics
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                    {/* Multi-Level Nested Navigation Sidebar */}
                    <div className="pl-1 mt-1 space-y-1 border-l border-blue-500/20 dark:border-slate-800 ml-2">
                      {item.children && item.children.map((child: any, cIdx: number) => {
                        const RecursiveNode = ({ node }: { node: any }) => {
                          const [isOpen, setIsOpen] = useState(true); // default expand inner folders
                          const isActive = activeTopic === item.topic && activeSubtopic === node.slug;

                          if (!node.isFolder) {
                            return (
                              <button
                                onClick={() => handleSelect(item.topic, node.slug)}
                                className={`w-full flex items-center gap-2 p-2 rounded-xl text-[13px] text-left transition-all ${
                                  isActive 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' 
                                    : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{node.name}</span>
                              </button>
                            );
                          }

                          return (
                            <div className="space-y-1">
                              <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-gray-700 dark:text-slate-200 font-bold text-[12px] hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group/folder"
                              >
                                <div className="flex items-center gap-2">
                                  <Folder className="w-3.5 h-3.5 text-blue-500 group-hover/folder:scale-110 transition-transform" />
                                  <span className="truncate">{node.name}</span>
                                </div>
                                <ChevronDown className={`w-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {isOpen && (
                                <div className="pl-3 border-l border-gray-100 dark:border-slate-800/80 ml-2 space-y-1">
                                    {node.children.map((subChild: any, idx: number) => (
                                        <RecursiveNode key={idx} node={subChild} />
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        };

                        return <RecursiveNode key={cIdx} node={child} />;
                      })}
                    </div>
              </div>
            );
          })}
        </div>

        {/* Theme Toggle Bottom fixed */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between mt-auto bg-gray-50/50 dark:bg-slate-900/50">
            <button onClick={() => setSelectedTopicTheme('')} className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">&larr; Switch Category</button>
            <button onClick={toggleTheme} className="p-2 rounded-xl border border-gray-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all shadow-sm">
                 {theme === 'dark' ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
        </div>
      </div>

      {/* Main Content Render Layout */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col h-full bg-white dark:bg-slate-950 print:p-0 print:bg-white print:text-black">
        <div className="max-w-4xl mx-auto w-full relative">
          
          {/* Watermark only visible in print */}
          <div className="hidden print:flex fixed inset-0 items-center justify-center opacity-[0.05] pointer-events-none rotate-[35deg] select-none z-0">
             <span className="text-8xl font-black text-blue-600 tracking-widest border-4 border-blue-500 px-8 py-3 rounded-3xl">AI INTERVIEW</span>
          </div>

          {loading ? (
             <div className="animate-pulse space-y-4">
                <div className="h-9 w-2/3 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
                <hr className="dark:border-slate-800"/>
                <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-5/6"></div>
                <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded w-full"></div>
             </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-500 mt-4 mb-3 border-b-2 border-blue-600/20 pb-2 " {...props} />,
                  h2: ({ ...props }) => {
                    const text = props.children ? props.children.toString() : '';
                    const id = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                    return <h2 id={id} className="text-2xl font-bold text-gray-800 dark:text-slate-100 mt-6 mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-1" {...props} />
                  },
                  h3: ({ ...props }) => <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mt-5 mb-2" {...props} />,
                  p: ({ ...props }) => <p className="text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
                  ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-slate-300" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-slate-300" {...props} />,
                  li: ({ ...props }) => <li className="text-gray-700 dark:text-slate-300 text-[15px]" {...props} />,
                  strong: ({ ...props }) => <strong className="font-bold text-blue-600 dark:text-blue-400" {...props} />,
                  blockquote: ({ ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-slate-800/50 rounded-r-xl text-gray-700 dark:text-slate-300 italic" {...props} />,
                  code: (props) => {
                    const { children, className, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    
                    if (match) {
                      return (
                        <div className="relative group/code my-4 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
                          <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                                alert('Code copied to clipboard!');
                              }}
                              className="p-1 px-2 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 font-bold text-[10px] items-center flex gap-1 border border-gray-200 dark:border-slate-700 shadow-sm"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 bg-gray-50/50 dark:bg-slate-900 overflow-x-auto text-sm font-mono text-gray-800 dark:text-slate-100">
                            <code className={className} {...rest}>{children}</code>
                          </pre>
                        </div>
                      );
                    }
                    return <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-indigo-300 text-sm font-mono border border-gray-200 dark:border-slate-700" {...rest}>{children}</code>;
                  },
                }}
              >
                {selectedContent || "# Content Selection\nChoose any subtopic on the left sidebar index to render documentation chapters."}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {headings.length > 0 && (
        <div className="hidden xl:block w-72 bg-white dark:bg-slate-950 border-l border-gray-100 dark:border-slate-800 p-8 flex-shrink-0 h-screen overflow-y-auto print:hidden">
          <div className="sticky top-0">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
               <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">On This Page</h4>
               <div className="flex items-center gap-1.5">
                 <button onClick={() => window.print()} title="Download as PDF" className="p-1.5 rounded-lg border border-gray-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-inner">
                      <DownloadCloud className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={toggleTheme} className="p-1.5 rounded-lg border border-gray-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all shadow-inner">
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-orange-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                 </button>
               </div>
            </div>
            <ul className="space-y-1">
              {headings.map((h, i) => (
                <li key={i}>
                  <button 
                    onClick={() => {
                      const el = document.getElementById(h.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="w-full text-[13px] px-2 py-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-left transition-all duration-200 flex items-start gap-2 hover:translate-x-1 group hover:bg-gray-50 dark:hover:bg-slate-900/80"
                  >
                    <span className="text-blue-500 mt-0.5 group-hover:scale-125 transition-transform duration-200">•</span>
                    <span className="truncate">{h.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
