import { useState, useEffect } from "react";
import { InterviewV2Report, ConversationMessage } from '@/api/interviewV2';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewAnalyticsApi } from '@/api/interviewAnalytics';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Award,
  TrendingUp,
  Filter,
  Zap,
  History,
  Briefcase,
  Layers,
  LayoutDashboard
} from 'lucide-react';

type ExternalSession = InterviewV2Report & {
  timestamp: string;
  _id?: string;
  role?: string;
  company?: string;
  round?: string;
};

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ExternalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundFilter, setRoundFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await InterviewAnalyticsApi.getDashboardStats();
      if (data && data.externalAnalytics) {
        // Sort by newest first
        const sorted = [...data.externalAnalytics].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setSessions(sorted);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoundColor = (round?: string) => {
    const r = (round || '').toLowerCase() || 'technical';
    const colors: Record<string, { bg: string, text: string, border: string, icon: any, accent: string }> = {
      technical: {
        bg: 'bg-blue-50/50 dark:bg-blue-500/5',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-900/30',
        icon: Briefcase,
        accent: 'bg-blue-600'
      },
      behavioral: {
        bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        icon: TrendingUp,
        accent: 'bg-emerald-600'
      },
      'problem-solving': {
        bg: 'bg-amber-50/50 dark:bg-amber-500/5',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-100 dark:border-amber-900/30',
        icon: Zap,
        accent: 'bg-amber-600'
      },
      hr: {
        bg: 'bg-purple-50/50 dark:bg-purple-500/5',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-900/30',
        icon: Layers,
        accent: 'bg-purple-600'
      }
    };
    return colors[r] || colors.technical;
  };

  const getStatusColor = (status: string) => {
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-900/30';
  };

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Filter based on search term and round filter
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm ||
      session.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRound = !roundFilter || (session.round || 'technical').toLowerCase() === roundFilter.toLowerCase();

    return matchesSearch && matchesRound;
  });

  // Apply Pagination locally
  const totalPages = Math.ceil(filteredSessions.length / limit);
  // Ensure page is within bounds
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const paginatedSessions = filteredSessions.slice(currentPage * limit, (currentPage + 1) * limit);

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-slate-950 pb-12">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200 dark:bg-indigo-900/20 blur-[120px]" />
      </div>

      {/* Header Section */}
      <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-blue-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse-slow">
                  <History className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Interview <span className="text-blue-600">History</span>
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                Track your evolution, review detailed AI feedback, and monitor your progress across all sessions.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => navigate('/interview_round')}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-blue-400 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Filters Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 dark:border-white/5 shadow-sm mb-10"
        >
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                placeholder="Search by role or company..."
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
              />
            </div>

            <div className="relative w-full lg:w-64 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
              <select
                value={roundFilter}
                onChange={(e) => {
                  setRoundFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 border-blue-500/50 text-slate-700 dark:text-slate-200 text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="">All Interview Rounds</option>
                <option value="technical">Technical Focus</option>
                <option value="behavioral">Behavioral / Culture</option>
                <option value="problem-solving">Critical Problem Solving</option>
                <option value="hr">HR & Management</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Sessions Grid */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-32"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-600/10 border-t-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <History className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ) : filteredSessions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 flex flex-col items-center text-center px-6 bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Layers className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">No Sessions Found</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                  We couldn't find any sessions matching your filters. Start a new interview to begin building your professional history.
                </p>
                <button
                  onClick={() => navigate('/interview_round')}
                  className="mt-8 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.15em] rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Start First Interview
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={containerVars}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
              >
                {paginatedSessions.map((session, idx) => {
                  const roundInfo = getRoundColor(session.round);
                  const RoundIcon = roundInfo.icon;
                  const score = session.summary?.overall_score || 0;
                  const sessionId = session.session_id || session._id;

                  return (
                    <motion.div
                      key={sessionId || idx}
                      variants={itemVars}
                      whileHover={{ y: -4 }}
                      onClick={() => sessionId && navigate(`/interview/results/${sessionId}`)}
                      className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-400/30 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Score Circle - Updated to be more visually interesting */}
                        <div className="flex flex-row lg:flex-col items-center gap-4 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
                          <div className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 duration-500 ${score >= 70 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-800'}`}>
                            <span className={`text-2xl font-black ${score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>{Math.round(score)}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Score</span>
                            <div className={`absolute top-0 right-0 p-1 opacity-20 ${score >= 70 ? 'text-emerald-500' : 'text-blue-500'}`}>
                              <Award className="w-8 h-8 rotate-[-15deg]" />
                            </div>
                          </div>

                          <div className="flex-1 lg:text-center">
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${getStatusColor('completed')}`}>
                              Verified
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                                {(session.role || 'General Assessment').toUpperCase()}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${roundInfo.bg} ${roundInfo.text} border ${roundInfo.border}`}>
                                  <RoundIcon className="w-3 h-3" />
                                  {((session.round as string) || 'Technical').replace('-', ' ')}
                                </div>
                                <span className="text-slate-300 dark:text-slate-800">|</span>
                                <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                  <Briefcase className="w-3.5 h-3.5" />
                                  {session.company || 'Private Practice'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:self-center">
                              <div className="flex flex-col items-end px-4 border-r border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Efficiency</span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">{(session.question_wise_analysis?.length || 0)} Qs</span>
                              </div>
                              <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Strengths & Weaknesses Preview - Only shown on large screens */}
                          <div className="hidden md:grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                            <div>
                              <h5 className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" /> Peak Performance
                              </h5>
                              <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                                {session.verdict?.strengths_to_highlight?.slice(0, 1).join('') || 'Consistent performance across dimensions.'}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                                <Layers className="w-3 h-3" /> Growth Indicator
                              </h5>
                              <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                                {session.verdict?.areas_to_fix_before_next_interview?.slice(0, 1).join('') || 'Focus on optimizing specialized domain knowledge.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Improved Pagination Controls */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-6 mt-12"
          >
            <button
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Navigation</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {currentPage + 1} <span className="text-slate-400 mx-1">of</span> {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
