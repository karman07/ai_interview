import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Target, BarChart3, Zap, Trophy, Eye, Calendar, Clock, MessageSquare } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { DashboardApi, type DashboardAnalytics } from '@/api/dashboard';
import { InterviewAnalyticsApi, type InterviewSession } from '@/api/interviewAnalytics';
import { useAuth } from '@/contexts/AuthContext';

export default function InterviewAnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
      loadSessions();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const data = await DashboardApi.getDashboard(user!._id);
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await InterviewAnalyticsApi.getMySessions({ limit: 10, offset: 0 });
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const displayRadarData = [
    { subject: 'Technical', score: dashboard?.technical?.averageScore || 0, fullMark: 10 },
    { subject: 'Behavioral', score: dashboard?.behavioral?.averageScore || 0, fullMark: 10 },
    { subject: 'Problem Solving', score: dashboard?.problemSolving?.averageScore || 0, fullMark: 10 },
    { subject: 'HR', score: dashboard?.hr?.averageScore || 0, fullMark: 10 }
  ];

  const roundStatsData = [
    { name: 'Technical', sessions: dashboard?.technical?.totalSessions || 0, avgScore: dashboard?.technical?.averageScore || 0, bestScore: dashboard?.technical?.bestScore || 0 },
    { name: 'Behavioral', sessions: dashboard?.behavioral?.totalSessions || 0, avgScore: dashboard?.behavioral?.averageScore || 0, bestScore: dashboard?.behavioral?.bestScore || 0 },
    { name: 'Problem Solving', sessions: dashboard?.problemSolving?.totalSessions || 0, avgScore: dashboard?.problemSolving?.averageScore || 0, bestScore: dashboard?.problemSolving?.bestScore || 0 },
    { name: 'HR', sessions: dashboard?.hr?.totalSessions || 0, avgScore: dashboard?.hr?.averageScore || 0, bestScore: dashboard?.hr?.bestScore || 0 }
  ];

  const progressData = dashboard?.monthlyProgress?.map(m => ({
    month: m.month,
    score: m.averageScore
  })) || [];

  const avgScore = dashboard?.overall?.overallAverageScore || 0;
  const bestScore = dashboard?.overall?.bestOverallScore || 0;
  const strengths = dashboard?.overall?.strengths || [];
  const improvements = dashboard?.overall?.areasForImprovement || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your performance and progress</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Score: {avgScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dashboard?.overall?.totalInterviews || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Interviews</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Average</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{avgScore.toFixed(1)}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Score</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{dashboard?.overall?.currentStreak || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Day Streak</p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Best</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{bestScore.toFixed(1)}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Overview</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={displayRadarData}>
                  <PolarGrid stroke="#9ca3af" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} animationDuration={800} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Round Statistics</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roundStatsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score" radius={[8, 8, 0, 0]} animationDuration={800} />
                  <Bar dataKey="bestScore" fill="#10b981" name="Best Score" radius={[8, 8, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Progress Over Time</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Interview Sessions
            </h3>
          </div>
          <div className="space-y-3">
            {sessions.length > 0 ? sessions.map((session) => (
              <div 
                key={session.sessionId} 
                onClick={() => navigate(`/interview/report/${user?._id}/${session.sessionId}`)}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{session.round} Round</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {session.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{session.role} at {session.company}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(session.metrics.totalDuration / 60)} min
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.metrics.questionsAnswered} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{session.metrics.overallScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">score</div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                

              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No sessions found. Start your first interview!
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengths.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Strengths
              </h3>
              <div className="space-y-2">
                {strengths.map((strength, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-gray-900 dark:text-white">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {improvements.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {improvements.map((improvement, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-orange-600 dark:text-orange-400">→</span>
                    <span className="text-gray-900 dark:text-white">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
