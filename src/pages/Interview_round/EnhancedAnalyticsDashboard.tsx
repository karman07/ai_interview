import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Award, Target, BarChart3, Zap, Trophy, ArrowUp, ArrowDown,
  Clock, CheckCircle, Calendar, Eye, ChevronRight, Activity
} from 'lucide-react';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { EnhancedInterviewApi, type EnhancedAnalytics, type SessionListItem } from '@/api/enhancedInterviewAnalytics';

export default function EnhancedAnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, sessionsData] = await Promise.all([
        EnhancedInterviewApi.getAnalytics(),
        EnhancedInterviewApi.getSessions(1, 5)
      ]);
      setAnalytics(analyticsData);
      setSessions(sessionsData.sessions);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoundColor = (round: string) => {
    const colors: Record<string, string> = {
      technical: 'from-blue-500 to-blue-600',
      behavioral: 'from-emerald-500 to-emerald-600',
      problemSolving: 'from-amber-500 to-orange-500',
      hr: 'from-purple-500 to-purple-600'
    };
    return colors[round] || 'from-gray-500 to-gray-600';
  };

  const radarData = analytics ? [
    { subject: 'Technical', score: analytics.analytics.technical.averageScore, fullMark: 11 },
    { subject: 'Behavioral', score: analytics.analytics.behavioral.averageScore, fullMark: 11 },
    { subject: 'Problem Solving', score: analytics.analytics.problemSolving.averageScore, fullMark: 11 },
    { subject: 'HR', score: analytics.analytics.hr.averageScore, fullMark: 11 }
  ] : [];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your performance and progress</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg">
              <Trophy className="w-6 h-6" />
              <div>
                <div className="text-xs opacity-90">Overall Score</div>
                <div className="text-2xl font-bold">{analytics.summary.averageScore.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalInterviews}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Interviews</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              {analytics.summary.completedInterviews} completed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.summary.averageScore.toFixed(1)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/ 11.0</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Average Score</p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${(analytics.summary.averageScore / 11) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.summary.currentStreak}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Days</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Current Streak</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <Activity className="w-3 h-3" />
              Keep it going!
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.summary.bestScore.toFixed(1)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/ 11.0</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Best Score</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <Trophy className="w-3 h-3" />
              Personal best
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Radar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Performance Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'currentColor', fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <PolarRadiusAxis angle={90} domain={[0, 11]} tick={{ fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)', 
                    borderRadius: '8px',
                    color: 'var(--tooltip-text)'
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Monthly Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.analytics.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'currentColor', fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis tick={{ fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)', 
                    borderRadius: '8px' 
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="averageScore" stroke="#3b82f6" strokeWidth={3} name="Avg Score" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sessionsCount" stroke="#10b981" strokeWidth={3} name="Sessions" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Round Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Round Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'technical', label: 'Technical', data: analytics.analytics.technical, color: 'blue' },
              { key: 'behavioral', label: 'Behavioral', data: analytics.analytics.behavioral, color: 'emerald' },
              { key: 'problemSolving', label: 'Problem Solving', data: analytics.analytics.problemSolving, color: 'amber' },
              { key: 'hr', label: 'HR', data: analytics.analytics.hr, color: 'purple' }
            ].map(({ key, label, data, color }) => (
              <div 
                key={key}
                className={`p-5 bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/10 rounded-xl border-2 border-${color}-200 dark:border-${color}-800 hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => setSelectedRound(key)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-white">{label}</h4>
                  {data.improvementTrend > 0 ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold">
                      <ArrowUp className="w-4 h-4" />
                      {data.improvementTrend.toFixed(1)}
                    </div>
                  ) : data.improvementTrend < 0 ? (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-semibold">
                      <ArrowDown className="w-4 h-4" />
                      {Math.abs(data.improvementTrend).toFixed(1)}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{data.averageScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Best</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.bestScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sessions</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.totalSessions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Recent Sessions
            </h3>
            <button 
              onClick={() => navigate('/interview/sessions')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.sessionId}
                onClick={() => navigate(`/interview/session/${session.sessionId}`)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getRoundColor(session.roundType)} rounded-xl flex flex-col items-center justify-center text-white shadow-lg`}>
                    <div className="text-xl font-bold">{session.scores.overall.toFixed(1)}</div>
                    <div className="text-xs opacity-80">/ 11</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {session.jobContext.roleTitle} at {session.jobContext.companyName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{session.roundType} Round</span>
                      <span className="text-gray-400 dark:text-gray-600">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.metrics.totalDuration)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {session.status}
                  </div>
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Your Strengths
            </h3>
            <div className="space-y-3">
              {analytics.analytics.overall.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Areas for Improvement
            </h3>
            <div className="space-y-3">
              {analytics.analytics.overall.areasForImprovement.map((area, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
