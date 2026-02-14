import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Award
} from 'lucide-react';
import { InterviewAnalyticsApi, type InterviewSession } from '@/api/interviewAnalytics';

export default function InterviewHistory() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundFilter, setRoundFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadSessions();
  }, [roundFilter, page]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await InterviewAnalyticsApi.getMySessions({
        round: roundFilter || undefined,
        limit,
        offset: page * limit
      });
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoundColor = (round: string) => {
    const colors: Record<string, string> = {
      technical: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
      behavioral: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10',
      'problem-solving': 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10',
      hr: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10'
    };
    return colors[round] || 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800',
      active: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
      paused: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
      abandoned: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
    };
    return colors[status] || 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-700';
  };

  const filteredSessions = sessions.filter(session =>
    !searchTerm ||
    session.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) => setRoundFilter(e.target.value)}
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
            {filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getRoundColor(session.round)} capitalize`}>
                        {session.round.replace('-', ' ')}
                      </div>
                      <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(session.status)} capitalize`}>
                        {session.status}
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
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{session.metrics.overallScore.toFixed(1)}<span className="text-gray-400 font-normal">/10</span></p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Duration</p>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{Math.floor(session.metrics.totalDuration / 60)}m</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(session.startedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div>
                        Questions Answered: <span className="font-medium text-gray-700 dark:text-gray-300">{session.metrics.questionsAnswered}</span>
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
        {!loading && filteredSessions.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredSessions.length < limit}
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
