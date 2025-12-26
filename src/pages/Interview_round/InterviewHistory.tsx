import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Award,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search
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
      technical: 'from-blue-500 to-blue-600',
      behavioral: 'from-emerald-500 to-emerald-600',
      'problem-solving': 'from-amber-500 to-orange-500',
      hr: 'from-purple-500 to-purple-600'
    };
    return colors[round] || 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      active: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      paused: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      abandoned: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
  };

  const filteredSessions = sessions.filter(session => 
    !searchTerm || 
    session.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview History</h1>
          <p className="text-gray-600 dark:text-gray-400">Review your past interview sessions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role or company..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Round Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Round
              </label>
              <select
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-12 border border-gray-100 dark:border-gray-700 text-center">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No sessions found</h3>
            <p className="text-gray-600 dark:text-gray-400">Start your first interview to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div 
                key={session.sessionId} 
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 bg-gradient-to-r ${getRoundColor(session.round)} text-white rounded-lg text-sm font-semibold capitalize`}>
                        {session.round.replace('-', ' ')}
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {session.role && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{session.role}</p>
                        </div>
                      )}
                      {session.company && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{session.company}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <p className="font-semibold text-gray-900 dark:text-white">{session.metrics.overallScore.toFixed(1)}/10</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <p className="font-semibold text-gray-900 dark:text-white">{Math.floor(session.metrics.totalDuration / 60)} min</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        Questions: {session.metrics.questionsAnswered}
                      </div>
                    </div>
                  </div>

                  <button className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredSessions.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-gray-600 dark:text-gray-400">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredSessions.length < limit}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
