import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Zap,
  Trophy,
  Brain,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { InterviewAnalyticsApi } from '@/api/interviewAnalytics';
import { InterviewV2Report } from '@/api/interviewV2';
import { useAuth } from '@/contexts/AuthContext';
import { usePricing } from '@/contexts/PricingContext';

interface ExternalAnalyticsSession extends InterviewV2Report {
  timestamp: string;
}

interface InterviewAnalyticsDashboardProps {
  onStartNew?: () => void;
}

export default function InterviewAnalyticsDashboard({ onStartNew }: InterviewAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ExternalAnalyticsSession[]>([]);
  const { user } = useAuth();
  const { setShowPricing } = usePricing();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // The old dashboard-stats endpoint now contains externalAnalytics
      const data = await InterviewAnalyticsApi.getDashboardStats();
      if (data && data.externalAnalytics) {
        // Sort by newest first
        const sorted = [...data.externalAnalytics].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setSessions(sorted);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const interviewLimit = useMemo(() => {
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const limitFeature = user.subscriptionPlan.features.find(f => f.name.toLowerCase().includes('interview limit'));
      if (limitFeature && typeof limitFeature.value === 'number') {
        return limitFeature.value;
      }
    }
    return user?.subscriptionStatus === 'active' ? 10 : 5;
  }, [user]);

  const totalInterviews = sessions.length;
  const isAtLimit = totalInterviews >= interviewLimit;

  // Compute Aggregated Stats
  const averageScore = totalInterviews > 0
    ? sessions.reduce((acc, s) => acc + (s.summary?.overall_score || 0), 0) / totalInterviews
    : 0;
  const bestScore = totalInterviews > 0
    ? Math.max(...sessions.map(s => s.summary?.overall_score || 0))
    : 0;

  // Compute dimension averages for the Radar Chart
  const dimensions = {
    'Technical Depth': 0,
    'Problem Solving': 0,
    'System Design': 0,
    'Communication': 0,
    'Role Fit': 0
  };

  sessions.forEach(s => {
    dimensions['Technical Depth'] += s.dimension_scores?.technical_depth || 0;
    dimensions['Problem Solving'] += s.dimension_scores?.problem_solving || 0;
    dimensions['System Design'] += s.dimension_scores?.system_design || 0;
    dimensions['Communication'] += s.dimension_scores?.communication || 0;
    dimensions['Role Fit'] += s.dimension_scores?.role_fit || 0;
  });

  const radarData = totalInterviews > 0 ? [
    { subject: 'Technical Depth', score: dimensions['Technical Depth'] / totalInterviews, fullMark: 10 },
    { subject: 'Problem Solving', score: dimensions['Problem Solving'] / totalInterviews, fullMark: 10 },
    { subject: 'System Design', score: dimensions['System Design'] / totalInterviews, fullMark: 10 },
    { subject: 'Communication', score: dimensions['Communication'] / totalInterviews, fullMark: 10 },
    { subject: 'Role Fit', score: dimensions['Role Fit'] / totalInterviews, fullMark: 10 }
  ] : [];

  // Aggregate Top Strengths / Areas for Improvement
  const allStrengths = sessions.flatMap(s => s.verdict?.strengths_to_highlight || []);
  const allImprovements = sessions.flatMap(s => s.verdict?.areas_to_fix_before_next_interview || []);

  // Get top 5 unique for display
  const topStrengths = Array.from(new Set(allStrengths)).slice(0, 5);
  const topImprovements = Array.from(new Set(allImprovements)).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Interview Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your performance across all AI-evaluated dimensions</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Usage Indicator */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interview Capacity</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isAtLimit ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
                    {totalInterviews} / {interviewLimit}
                  </span>
                </div>
                <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isAtLimit ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min((totalInterviews / interviewLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold text-lg">Avg Score: {averageScore.toFixed(1)}</span>
                </div>
                {onStartNew && (
                  <button
                    onClick={() => isAtLimit ? setShowPricing(true) : onStartNew()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${isAtLimit
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                  >
                    <Zap className="w-5 h-5" />
                    {isAtLimit ? 'Limit reached' : 'Start New Interview'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{totalInterviews}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Interviews Completed</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Average</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{averageScore.toFixed(1)}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Overall Score</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Best</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{bestScore.toFixed(1)}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Highest Score</p>
          </div>
        </div>

        {totalInterviews === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Zap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Analytics Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Complete an AI interview to see your detailed performance metrics.</p>
          </div>
        )}

        {totalInterviews > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Radar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Dimension Breakdown</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                      <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Top Strengths
                  </h3>
                  <ul className="space-y-3">
                    {topStrengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-rose-500" />
                    Critical Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {topImprovements.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        <span className="text-rose-500 mt-0.5">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI External Interviews List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-500" />
                Interview History
              </h3>
              <div className="space-y-4">
                {sessions.map((aiSession, idx) => {
                  const score = aiSession.summary?.overall_score ?? 0;
                  const rec = aiSession.summary?.hire_recommendation ?? 'Unknown';

                  const scoreColor =
                    score >= 75 ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800" :
                      score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800" :
                        "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800";

                  return (
                    <div key={idx} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl border font-extrabold ${scoreColor}`}>
                            <span className="text-xl leading-none">{score}</span>
                            <span className="text-[10px] uppercase font-semibold mt-1 opacity-70">Score</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white capitalize text-lg">{rec}</h4>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(aiSession.timestamp).toLocaleString()} • {aiSession.summary?.seniority_assessment?.toUpperCase() || 'GENERAL'} ROLE
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Key Strengths</h5>
                          <ul className="space-y-2">
                            {aiSession.verdict?.strengths_to_highlight?.slice(0, 3).map((s: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span> <span className="leading-relaxed">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3">Primary Focus Areas</h5>
                          <ul className="space-y-2">
                            {aiSession.verdict?.areas_to_fix_before_next_interview?.slice(0, 3).map((a: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-rose-500 mt-0.5">•</span> <span className="leading-relaxed">{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
