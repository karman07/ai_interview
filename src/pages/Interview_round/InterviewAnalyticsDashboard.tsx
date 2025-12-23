import  { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Award, 

  Target,
  BarChart3,
  Zap,
  Trophy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { InterviewAnalyticsApi, type DashboardStats, type Analytics } from '@/api/interviewAnalytics';

export default function InterviewAnalyticsDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stats, analyticsData] = await Promise.all([
        InterviewAnalyticsApi.getDashboardStats(),
        InterviewAnalyticsApi.getAnalytics()
      ]);
      setDashboardStats(stats);
      setAnalytics(analyticsData);
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
      'problem-solving': 'from-amber-500 to-orange-500',
      hr: 'from-purple-500 to-purple-600'
    };
    return colors[round] || 'from-gray-500 to-gray-600';
  };

  const radarData = analytics ? [
    { subject: 'Technical', score: analytics.technical.averageScore, fullMark: 10 },
    { subject: 'Behavioral', score: analytics.behavioral.averageScore, fullMark: 10 },
    { subject: 'Problem Solving', score: analytics.problemSolving.averageScore, fullMark: 10 },
    { subject: 'HR', score: analytics.hr.averageScore, fullMark: 10 }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your performance and progress</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Score: {dashboardStats?.averageScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats?.totalInterviews || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Interviews</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Average</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats?.averageScore.toFixed(1) || '0.0'}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Score</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats?.currentStreak || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Day Streak</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Best</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats?.bestScore.toFixed(1) || '0.0'}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Score</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Radar Chart */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Progress Chart */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="averageScore" stroke="#3b82f6" strokeWidth={2} name="Avg Score" />
                <Line type="monotone" dataKey="sessionsCount" stroke="#10b981" strokeWidth={2} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Round Breakdown */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Round Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics && Object.entries({
              technical: analytics.technical,
              behavioral: analytics.behavioral,
              'problem-solving': analytics.problemSolving,
              hr: analytics.hr
            }).map(([round, stats]) => (
              <div key={round} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{round.replace('-', ' ')}</h4>
                  {stats.improvementTrend > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.averageScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Best:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.bestScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.totalSessions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Sessions</h3>
          <div className="space-y-3">
            {dashboardStats?.recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getRoundColor(session.round)} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {session.score.toFixed(1)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{session.round} Round</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(session.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {session.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        {analytics?.overall && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Strengths
              </h3>
              <div className="space-y-2">
                {analytics.overall.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-gray-900 dark:text-white">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {analytics.overall.areasForImprovement.map((area, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-orange-600 dark:text-orange-400">→</span>
                    <span className="text-gray-900 dark:text-white">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
