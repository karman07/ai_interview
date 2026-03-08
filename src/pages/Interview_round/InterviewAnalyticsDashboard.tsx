import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Zap,
  Trophy,
  Brain,
  ChevronRight,
  Info,
  Calendar,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { InterviewAnalyticsApi } from '@/api/interviewAnalytics';
import { InterviewV2Report } from '@/api/interviewV2';
import { useAuth } from '@/contexts/AuthContext';
import { usePricing } from '@/contexts/PricingContext';

interface ExternalAnalyticsSession extends InterviewV2Report {
  timestamp: string;
  role: string;
  round: string;
  company?: string;
}

interface InterviewAnalyticsDashboardProps {
  onStartNew?: () => void;
}

const containerVars: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

export default function InterviewAnalyticsDashboard({ onStartNew }: InterviewAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ExternalAnalyticsSession[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { user } = useAuth();
  const { setShowPricing } = usePricing();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await InterviewAnalyticsApi.getDashboardStats();
      setDashboardData(data);
      if (data && data.externalAnalytics) {
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
    // 1. Try fetching from dashboardData (direct from DB)
    if (dashboardData?.overview?.plan?.features) {
      const limitFeature = dashboardData.overview.plan.features.find((f: any) =>
        f.name.toLowerCase().includes('interview limit')
      );
      if (limitFeature && typeof (limitFeature.value ?? limitFeature.limit) === 'number') {
        return limitFeature.value ?? limitFeature.limit;
      }
    }

    // 2. Fallback to auth context popuplate check
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const limitFeature = user.subscriptionPlan.features.find(f => f.name.toLowerCase().includes('interview limit'));
      if (limitFeature && typeof limitFeature.value === 'number') {
        return limitFeature.value;
      }
    }

    // 3. Absolute default
    return user?.subscriptionStatus === 'active' ? 10 : 3;
  }, [user, dashboardData]);

  // Use monthly usage for capacity display, total historical sessions for everything else
  const currentMonthlyUsage = Math.max(dashboardData?.overview?.monthlyInterviews || 0, sessions.length);
  const totalInterviews = Math.max(dashboardData?.overview?.totalInterviews || 0, sessions.length);
  const isAtLimit = currentMonthlyUsage >= interviewLimit;

  const averageScore = totalInterviews > 0
    ? sessions.reduce((acc, s) => acc + (s.summary?.overall_score || 0), 0) / sessions.length
    : 0;
  const bestScore = sessions.length > 0
    ? Math.max(...sessions.map(s => s.summary?.overall_score || 0))
    : 0;

  const dimensions = {
    'Technical': 0,
    'System Design': 0,
    'Problem Solving': 0,
    'Communication': 0,
    'Cultural Fit': 0
  };

  sessions.forEach(s => {
    dimensions['Technical'] += s.dimension_scores?.technical_depth || 0;
    dimensions['Problem Solving'] += s.dimension_scores?.problem_solving || 0;
    dimensions['System Design'] += s.dimension_scores?.system_design || 0;
    dimensions['Communication'] += s.dimension_scores?.communication || 0;
    dimensions['Cultural Fit'] += s.dimension_scores?.role_fit || 0;
  });

  const radarData = sessions.length > 0 ? [
    { subject: 'Technical', score: dimensions['Technical'] / sessions.length, fullMark: 10 },
    { subject: 'Problem Solving', score: dimensions['Problem Solving'] / sessions.length, fullMark: 10 },
    { subject: 'System Design', score: dimensions['System Design'] / sessions.length, fullMark: 10 },
    { subject: 'Communication', score: dimensions['Communication'] / sessions.length, fullMark: 10 },
    { subject: 'Cultural Fit', score: dimensions['Cultural Fit'] / sessions.length, fullMark: 10 }
  ] : [];

  const allStrengths = sessions.flatMap(s => s.summary?.key_strengths || s.verdict?.strengths_to_highlight || [])
    .filter(s => typeof s === 'string' && !s.toLowerCase().includes('none') && s.length > 5);
  const allImprovements = sessions.flatMap(s => s.summary?.key_areas_for_improvement || s.verdict?.areas_to_fix_before_next_interview || [])
    .filter(s => typeof s === 'string' && !s.toLowerCase().includes('none') && s.length > 5);

  const topStrengths = Array.from(new Set(allStrengths)).slice(0, 5);
  const topImprovements = Array.from(new Set(allImprovements)).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-blue-600/60 font-medium animate-pulse">Analyzing Performance Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200 dark:bg-indigo-900/20 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-blue-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200 dark:shadow-none">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Performance <span className="text-blue-600">Analytics</span>
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                Unlock deeper insights into your interview performance with AI-driven breakdown.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-stretch gap-3 lg:w-auto"
            >
              {/* Compact Session Capacity */}
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-xl px-5 py-2.5 flex items-center gap-6 shadow-sm transition-colors hover:border-blue-400/30">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 underline decoration-blue-500/30 underline-offset-4 uppercase tracking-[0.1em]">Interview Capacity</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-black ${isAtLimit ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{currentMonthlyUsage}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/ {interviewLimit}</span>
                  </div>
                </div>

                <div className="w-24 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400/60 uppercase">
                    <span>Usage</span>
                    <span>{Math.round((currentMonthlyUsage / interviewLimit) * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentMonthlyUsage / interviewLimit) * 100, 100)}%` }}
                      className={`h-full ${isAtLimit ? 'bg-rose-500' : 'bg-blue-600'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Compact Action Button */}
              <AnimatePresence mode="wait">
                {onStartNew && (
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => isAtLimit ? setShowPricing(true) : onStartNew()}
                    className={`flex items-center gap-3 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 shadow-lg ${isAtLimit
                      ? 'bg-rose-600 text-white shadow-rose-500/10'
                      : 'bg-blue-600 text-white shadow-blue-600/10 hover:bg-blue-700'
                      }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      {isAtLimit ? <ShieldCheck className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <span>{isAtLimit ? 'Upgrade Now' : 'New Interview'}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-12 space-y-12"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Completed', value: totalInterviews, icon: BarChart3, color: 'blue', desc: 'Mock sessions' },
            { label: 'Average Score', value: averageScore.toFixed(1), icon: Target, color: 'indigo', desc: 'Performance quality' },
            { label: 'Best Performance', value: bestScore.toFixed(1), icon: Trophy, color: 'emerald', desc: 'Highest achievement' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVars}
              className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  {stat.desc}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
                <p className="text-slate-500 font-semibold">{stat.label}</p>
              </div>
              {/* Ornamental element */}
              <div className={`absolute top-0 right-0 p-4 opacity-5 text-${stat.color}-500 group-hover:opacity-10 transition-opacity`}>
                <stat.icon className="w-24 h-24 rotate-[-15deg]" />
              </div>
            </motion.div>
          ))}
        </div>

        {totalInterviews === 0 ? (
          <motion.div
            variants={itemVars}
            className="text-center py-24 bg-white/50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-blue-100 dark:border-slate-800"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Analytics Available</h3>
            <p className="text-slate-500 max-w-md mx-auto">Complete your first interactive AI interview to unlock detailed performance metrics and career insights.</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart Card */}
              <motion.div
                variants={itemVars}
                className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-blue-100 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Skill Matrix</h3>
                    <p className="text-slate-500 text-sm font-medium">Aggregated performance across 5 key dimensions</p>
                  </div>
                  <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="h-[400px] w-full mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" className="opacity-50 dark:opacity-20" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        axisLine={false}
                        tick={false}
                      />
                      <Radar
                        name="Average Score"
                        dataKey="score"
                        stroke="#2563eb"
                        strokeWidth={4}
                        fill="url(#radarGradient)"
                        fillOpacity={0.6}
                      />
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6">
                  {radarData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.subject}</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{d.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Insights Column */}
              <div className="flex flex-col gap-8">
                <motion.div
                  variants={itemVars}
                  className="group bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm flex-1 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      Top Strengths
                    </h3>
                    <Award className="w-5 h-5 text-slate-200" />
                  </div>
                  <div className="space-y-4">
                    {topStrengths.length > 0 ? topStrengths.map((strength, idx) => (
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-default"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-relaxed">{strength}</span>
                      </motion.div>
                    )) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Award className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-400">Complete more sessions to identify your key strengths.</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVars}
                  className="group bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm flex-1 hover:border-amber-200 dark:hover:border-amber-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                        <Target className="w-5 h-5 text-amber-600" />
                      </div>
                      Focus Areas
                    </h3>
                    <Brain className="w-5 h-5 text-slate-200" />
                  </div>
                  <div className="space-y-4">
                    {topImprovements.length > 0 ? topImprovements.map((area, idx) => (
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + (idx * 0.1) }}
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-default"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-relaxed">{area}</span>
                      </motion.div>
                    )) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Target className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-400">Keep practicing to get targeted focus areas for improvement.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Detailed History */}
            <motion.div
              variants={itemVars}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Interview History</h3>
                  <p className="text-slate-500 text-sm font-medium">Review your previous sessions and feedback</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 text-sm font-bold">
                  <Calendar className="w-4 h-4" />
                  Chronological View
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {sessions.map((aiSession, idx) => (
                  <HistoryItem key={idx} aiSession={aiSession} index={idx} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function HistoryItem({ aiSession, index }: { aiSession: any, index: number }) {
  const navigate = useNavigate();
  const score = aiSession.summary?.overall_score ?? 0;
  const sessionId = aiSession._id || aiSession.session_id;

  const strengths = (aiSession.verdict?.strengths_to_highlight || [])
    .filter((s: string) => typeof s === 'string' && !s.toLowerCase().includes('none') && s.length > 5);

  const improvements = (aiSession.verdict?.areas_to_fix_before_next_interview || [])
    .filter((a: string) => typeof a === 'string' && !a.toLowerCase().includes('none') && a.length > 5);

  const scoreStyles =
    score >= 75 ? { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40', ring: 'ring-emerald-50' } :
      score >= 50 ? { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/40', ring: 'ring-blue-50' } :
        { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/40', ring: 'ring-rose-50' };

  return (
    <motion.div
      variants={itemVars}
      whileHover={{ y: -4 }}
      className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Score Circle */}
        <div className="flex flex-row lg:flex-col items-center gap-6 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
          <div className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center shrink-0 border-2 ${scoreStyles.border} ${scoreStyles.bg}`}>
            <span className={`text-3xl font-black ${scoreStyles.text}`}>{score}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${scoreStyles.text}`}>Score</span>
            {/* Pulsing ring */}
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${scoreStyles.bg}`} style={{ animationDuration: '3s' }} />
          </div>

          <div className="flex flex-col items-start lg:items-center text-center">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-2 ${scoreStyles.bg} ${scoreStyles.text}`}>
              {(() => {
                const rec = aiSession.summary?.hire_recommendation?.toUpperCase();
                if (rec === 'NO' || rec === 'NOT_RECOMMENDED' || rec === 'REJECT') return 'Not Recommended';
                if (rec === 'YES' || rec === 'HIRE') return 'Recommended';
                if (rec === 'MAYBE') return 'Conditional';
                return rec?.replace(/_/g, ' ') || 'Evaluation';
              })()}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {aiSession.timestamp
                ? new Date(aiSession.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Date Unknown'}
            </p>
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                {(aiSession.role || 'General Role').toUpperCase()}
              </h4>
              <p className="flex items-center gap-2 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg w-fit mt-2">
                <Brain className="w-4 h-4" />
                {aiSession.company || 'Private Assessment'} • {(aiSession.round || 'Evaluation').toUpperCase()}
              </p>
            </div>

            <button
              onClick={() => sessionId && navigate(`/interview/results/${sessionId}`)}
              className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl transition-all self-start"
            >
              Full Report <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full w-fit uppercase tracking-widest">Performance Peaks</h5>
              <div className="space-y-3">
                {strengths.length > 0 ? strengths.slice(0, 2).map((s: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-transparent hover:border-emerald-100 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    {s}
                  </div>
                )) : (
                  <p className="text-sm font-bold text-slate-400 px-2 italic">Minimal strengths identified in this session.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full w-fit uppercase tracking-widest">Growth Areas</h5>
              <div className="space-y-3">
                {improvements.length > 0 ? improvements.slice(0, 2).map((a: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-transparent hover:border-amber-100 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    {a}
                  </div>
                )) : (
                  <p className="text-sm font-bold text-slate-400 px-2 italic">No specific growth areas detected from this interview.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
