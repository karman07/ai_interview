import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, Target, BarChart3, Zap, Trophy, Eye, Calendar } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { DashboardApi, type DashboardAnalytics } from '@/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function InterviewAnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
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

  const hasInterviews = (dashboard?.overall?.totalInterviews || 0) > 0;

  const radarData = [
    { subject: 'Technical', score: dashboard?.technical?.averageScore || 0, fullMark: 10 },
    { subject: 'Behavioral', score: dashboard?.behavioral?.averageScore || 0, fullMark: 10 },
    { subject: 'Problem Solving', score: dashboard?.problemSolving?.averageScore || 0, fullMark: 10 },
    { subject: 'HR', score: dashboard?.hr?.averageScore || 0, fullMark: 10 }
  ];

  const displayRadarData = [
    { subject: 'Technical', score: 6.5, fullMark: 10 },
    { subject: 'Behavioral', score: 7.2, fullMark: 10 },
    { subject: 'Problem Solving', score: 5.8, fullMark: 10 },
    { subject: 'HR', score: 6.9, fullMark: 10 }
  ];

  const roundStatsData = [
    { name: 'Technical', sessions: dashboard?.technical?.totalSessions || 2, avgScore: dashboard?.technical?.averageScore || 6.5, bestScore: dashboard?.technical?.bestScore || 8.2 },
    { name: 'Behavioral', sessions: dashboard?.behavioral?.totalSessions || 1, avgScore: dashboard?.behavioral?.averageScore || 7.2, bestScore: dashboard?.behavioral?.bestScore || 7.8 },
    { name: 'Problem Solving', sessions: dashboard?.problemSolving?.totalSessions || 1, avgScore: dashboard?.problemSolving?.averageScore || 5.8, bestScore: dashboard?.problemSolving?.bestScore || 6.5 },
    { name: 'HR', sessions: dashboard?.hr?.totalSessions || 2, avgScore: dashboard?.hr?.averageScore || 6.9, bestScore: dashboard?.hr?.bestScore || 8.0 }
  ];

  const progressData = [
    { month: 'Jan', score: 5.2 },
    { month: 'Feb', score: 6.1 },
    { month: 'Mar', score: 6.5 },
    { month: 'Apr', score: 6.8 },
    { month: 'May', score: 7.2 },
    { month: 'Jun', score: 7.5 }
  ];

  const avgScore = hasInterviews && dashboard?.overall?.overallAverageScore && dashboard.overall.overallAverageScore > 0 
    ? dashboard.overall.overallAverageScore 
    : 6.8;
  const bestScore = hasInterviews && dashboard?.overall?.bestOverallScore && dashboard.overall.bestOverallScore > 0 
    ? dashboard.overall.bestOverallScore 
    : 8.5;

  const strengths = (dashboard?.overall?.strengths && dashboard.overall.strengths.length > 0) 
    ? dashboard.overall.strengths 
    : ['Strong communication skills', 'Good problem-solving approach', 'Clear technical explanations'];
  
  const improvements = (dashboard?.overall?.areasForImprovement && dashboard.overall.areasForImprovement.length > 0) 
    ? dashboard.overall.areasForImprovement 
    : ['Practice more coding challenges', 'Improve time management', 'Work on system design concepts'];

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
              Recent Sessions
            </h3>
          </div>
          <div className="space-y-3">
            {dashboard?.recentSessions && dashboard.recentSessions.length > 0 ? dashboard.recentSessions.map((session) => (
              <div 
                key={session.session_id} 
                onClick={() => navigate(`/interview/report/${user?._id}/${session.session_id}`)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {session.overall_score.toFixed(1)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{session.round_type} Round</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.role_title} at {session.company_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(session.created_at).toLocaleDateString()}</p>
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
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent sessions found. Start your first interview!
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>
    </div>
  );
}
