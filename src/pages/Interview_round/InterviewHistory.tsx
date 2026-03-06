import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Award
} from 'lucide-react';
import { InterviewAnalyticsApi } from '@/api/interviewAnalytics';
import { InterviewV2Report, ConversationMessage } from '@/api/interviewV2';
import { useNavigate } from "react-router-dom";

type ExternalSession = InterviewV2Report & {
  timestamp: string;
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
    const r = (round || '').toLowerCase();
    const colors: Record<string, string> = {
      technical: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
      behavioral: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10',
      'problem-solving': 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10',
      hr: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10'
    };
    return colors[r] || 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800',
    };
    return colors[status] || 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-700';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Interview History</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Review your past interview sessions</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search by role or company..."
                  className="pl-9 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Round Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Filter by Round
              </label>
              <select
                value={roundFilter}
                onChange={(e) => {
                  setRoundFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="">All Rounds</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="problem-solving">Problem Solving</option>
                <option value="hr">HR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center border-dashed">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No sessions found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start your first interview to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedSessions.map((session, idx) => (
              <div
                key={session.session_id || idx}
                className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => {
                  if (session.session_id) {
                    navigate(`/interview/details/${session.session_id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getRoundColor(session.round || 'technical')} capitalize`}>
                        {((session.round as string) || 'Technical').replace('-', ' ')}
                      </div>
                      <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor('completed')} capitalize`}>
                        Completed
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
                      {session.role && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Role</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{session.role}</p>
                        </div>
                      )}
                      {session.company && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Company</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{session.company}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Score</p>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-500" />
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{(session.summary?.overall_score ?? 0).toFixed(1)}<span className="text-gray-400 font-normal">/100</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(session.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{(session.timestamp && new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</span>
                      </div>
                      <div>
                        Questions Answered: <span className="font-medium text-gray-700 dark:text-gray-300">{session.question_wise_analysis?.length || session.conversation?.filter((m: ConversationMessage | { role: string }) => m.role === 'candidate').length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <button className="ml-4 p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
