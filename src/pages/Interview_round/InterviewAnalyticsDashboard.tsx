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
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Flame,
  BookOpen,
  Activity,
  Lightbulb,
  Clock,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ROUND_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  technical:       { label: 'Technical',       color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)' },
  behavioral:      { label: 'Behavioral',      color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
  system_design:   { label: 'System Design',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)' },
  hr:              { label: 'HR',              color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  problem_solving: { label: 'Problem Solving', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'  },
  cultural_fit:    { label: 'Cultural Fit',    color: '#EC4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.25)' },
  general:         { label: 'General',         color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)' },
};

function getRoundCfg(round: string) {
  const key = (round || '').toLowerCase().replace(/[\s-]+/g, '_');
  return ROUND_CONFIG[key] || ROUND_CONFIG['general'];
}

function scoreColor(s: number) {
  if (s >= 75) return { text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200', hex: '#10B981' };
  if (s >= 50) return { text: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-500/10',       border: 'border-blue-200',    hex: '#3B82F6' };
  return           { text: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-500/10',         border: 'border-rose-200',    hex: '#EF4444' };
}

function topFrequent(items: string[], n = 3): string[] {
  const freq: Record<string, number> = {};
  items.forEach(i => { if (i) freq[i] = (freq[i] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

export default function InterviewAnalyticsDashboard({ onStartNew }: InterviewAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ExternalAnalyticsSession[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [universityInterviewLimit, setUniversityInterviewLimit] = useState<number | null>(null);
  const { user } = useAuth();
  const { setShowPricing } = usePricing();

  useEffect(() => {
    loadData();
    if ((user as any)?.role === 'student' && (user as any)?.universityId) {
      import('@/api/http').then(({ default: http }) => {
        http.get(`/universities/${(user as any).universityId}`)
          .then(res => setUniversityInterviewLimit(res.data?.interviewLimit ?? null))
          .catch(() => {});
      });
    }
  }, []);

  const loadData = async () => {
    try {
      const data = await InterviewAnalyticsApi.getDashboardStats();
      setDashboardData(data);
      if (data?.externalAnalytics) {
        const sorted = [...data.externalAnalytics].sort(
          (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setSessions(sorted);
      }
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const interviewLimit = useMemo(() => {
    if ((user as any)?.role === 'student') return universityInterviewLimit ?? 20;

    // PAYG: use paygInterviewsLimit
    if ((user?.subscriptionPlan as any)?.type === 'pay_as_you_go' && typeof user?.paygInterviewsLimit === 'number') {
      return user.paygInterviewsLimit;
    }

    // ✅ Stamped at purchase — always the source of truth
    if (typeof user?.interviewLimit === 'number' && user.interviewLimit > 0) {
      return user.interviewLimit;
    }

    // Fallback: analytics dashboard data plan features
    if (dashboardData?.overview?.plan?.features) {
      const f = dashboardData.overview.plan.features.find((f: any) => f.name.toLowerCase().includes('interview limit'));
      if (f && typeof (f.value ?? f.limit) === 'number') return f.value ?? f.limit;
    }

    // Fallback: subscriptionPlan object
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const f = user.subscriptionPlan.features.find(f => f.name.toLowerCase().includes('interview limit'));
      if (f && typeof f.value === 'number') return f.value;
    }

    return user?.subscriptionStatus === 'active' ? 10 : 3;
  }, [user, dashboardData, universityInterviewLimit]);

  // PAYG usage comes from paygInterviewsUsed; regular from interviewCount (stamped at purchase)
  const isPayg = (user?.subscriptionPlan as any)?.type === 'pay_as_you_go';
  const currentMonthlyUsage = isPayg
    ? (user?.paygInterviewsUsed ?? 0)
    : Math.max(user?.interviewCount ?? 0, dashboardData?.overview?.monthlyInterviews || 0, sessions.length);
  const totalInterviews = Math.max(dashboardData?.overview?.totalInterviews || 0, sessions.length);
  const isAtLimit = currentMonthlyUsage >= interviewLimit;

  const averageScore = sessions.length > 0
    ? sessions.reduce((a, s) => a + (s.summary?.overall_score || 0), 0) / sessions.length
    : 0;
  const bestScore = sessions.length > 0
    ? Math.max(...sessions.map(s => s.summary?.overall_score || 0))
    : 0;

  const radarData = useMemo(() => {
    if (!sessions.length) return [];
    const dims = { technical_depth: 0, problem_solving: 0, system_design: 0, communication: 0, role_fit: 0 };
    sessions.forEach(s => {
      dims.technical_depth += s.dimension_scores?.technical_depth || 0;
      dims.problem_solving += s.dimension_scores?.problem_solving || 0;
      dims.system_design   += s.dimension_scores?.system_design   || 0;
      dims.communication   += s.dimension_scores?.communication   || 0;
      dims.role_fit        += s.dimension_scores?.role_fit        || 0;
    });
    const n = sessions.length;
    return [
      { subject: 'Technical',       score: +(dims.technical_depth / n).toFixed(1), fullMark: 10 },
      { subject: 'Problem Solving', score: +(dims.problem_solving / n).toFixed(1), fullMark: 10 },
      { subject: 'System Design',   score: +(dims.system_design / n).toFixed(1),   fullMark: 10 },
      { subject: 'Communication',   score: +(dims.communication / n).toFixed(1),   fullMark: 10 },
      { subject: 'Cultural Fit',    score: +(dims.role_fit / n).toFixed(1),        fullMark: 10 },
    ];
  }, [sessions]);

  const scoreTrend = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((s, idx) => ({
        idx: idx + 1,
        date: new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: s.summary?.overall_score || 0,
        round: (s as any).roundType || s.round || 'general',
        role: s.role || 'Unknown',
      }));
  }, [sessions]);

  const byRoundType = useMemo(() => {
    const map: Record<string, { total: number; best: number; count: number }> = {};
    sessions.forEach(s => {
      const rt = (((s as any).roundType || s.round || 'general') as string).toLowerCase().replace(/[\s-]+/g, '_');
      if (!map[rt]) map[rt] = { total: 0, best: 0, count: 0 };
      const sc = s.summary?.overall_score || 0;
      map[rt].total += sc;
      map[rt].best = Math.max(map[rt].best, sc);
      map[rt].count += 1;
    });
    return Object.entries(map)
      .map(([rt, d]) => ({
        type: getRoundCfg(rt).label,
        key: rt,
        avg: +(d.total / d.count).toFixed(1),
        best: +d.best.toFixed(1),
        sessions: d.count,
        color: getRoundCfg(rt).color,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [sessions]);

  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '0–20',   min: 0,  max: 20,  count: 0, color: '#EF4444' },
      { range: '21–40',  min: 21, max: 40,  count: 0, color: '#F97316' },
      { range: '41–60',  min: 41, max: 60,  count: 0, color: '#F59E0B' },
      { range: '61–80',  min: 61, max: 80,  count: 0, color: '#3B82F6' },
      { range: '81–100', min: 81, max: 100, count: 0, color: '#10B981' },
    ];
    sessions.forEach(s => {
      const sc = s.summary?.overall_score || 0;
      const b = buckets.find(b => sc >= b.min && sc <= b.max);
      if (b) b.count += 1;
    });
    return buckets;
  }, [sessions]);

  const difficultyStats = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    sessions.forEach(s => {
      const d = (((s as any).difficulty || 'medium') as string).toLowerCase();
      if (!map[d]) map[d] = { total: 0, count: 0 };
      map[d].total += s.summary?.overall_score || 0;
      map[d].count += 1;
    });
    return ['easy', 'medium', 'hard']
      .filter(d => map[d])
      .map(d => ({
        label: d.charAt(0).toUpperCase() + d.slice(1),
        avg: +(map[d].total / map[d].count).toFixed(1),
        count: map[d].count,
      }));
  }, [sessions]);

  const skillGaps = useMemo(() => {
    const critical: string[] = [], moderate: string[] = [], minor: string[] = [];
    sessions.forEach(s => {
      const sg = (s as any).skill_gap_analysis;
      if (!sg) return;
      (sg.critical_gaps || []).forEach((g: string) => g && critical.push(g));
      (sg.moderate_gaps || []).forEach((g: string) => g && moderate.push(g));
      (sg.minor_gaps    || []).forEach((g: string) => g && minor.push(g));
    });
    return {
      critical: Array.from(new Set(critical)).slice(0, 6),
      moderate: Array.from(new Set(moderate)).slice(0, 6),
      minor:    Array.from(new Set(minor)).slice(0, 6),
    };
  }, [sessions]);

  const behavioralPatterns = useMemo(() => {
    const styles: string[] = [], thinking: string[] = [], pressure: string[] = [];
    sessions.forEach(s => {
      const bi = (s as any).behavioral_insights;
      if (!bi) return;
      if (bi.communication_style) styles.push(bi.communication_style);
      if (bi.thinking_pattern)    thinking.push(bi.thinking_pattern);
      if (bi.pressure_handling)   pressure.push(bi.pressure_handling);
    });
    return {
      communicationStyle: topFrequent(styles, 1),
      thinkingPattern:    topFrequent(thinking, 1),
      pressureHandling:   topFrequent(pressure, 1),
    };
  }, [sessions]);

  const improvementPlan = useMemo(() => {
    const immediate: string[] = [], week: string[] = [], month: string[] = [];
    sessions.forEach(s => {
      const ip = (s as any).improvement_plan;
      if (!ip) return;
      (ip.immediate_actions || []).forEach((x: string) => x && immediate.push(x));
      (ip.plan_1_week  || []).forEach((x: string) => x && week.push(x));
      (ip.plan_1_month || []).forEach((x: string) => x && month.push(x));
    });
    return {
      immediate: Array.from(new Set(immediate)).slice(0, 4),
      week:      Array.from(new Set(week)).slice(0, 4),
      month:     Array.from(new Set(month)).slice(0, 4),
    };
  }, [sessions]);

  const topStrengths = useMemo(() => {
    const all = sessions.flatMap(s => [
      ...(s.summary?.key_strengths || []),
      ...(s.verdict?.strengths_to_highlight || [])
    ]).filter(s => typeof s === 'string' && !s.toLowerCase().includes('none') && s.length > 5);
    return Array.from(new Set(all)).slice(0, 5);
  }, [sessions]);

  const topImprovements = useMemo(() => {
    const all = sessions.flatMap(s => [
      ...(s.summary?.key_areas_for_improvement || []),
      ...(s.verdict?.areas_to_fix_before_next_interview || [])
    ]).filter(s => typeof s === 'string' && !s.toLowerCase().includes('none') && s.length > 5);
    return Array.from(new Set(all)).slice(0, 5);
  }, [sessions]);

  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    const days = new Set(sessions.map(s => new Date(s.timestamp).toDateString()));
    let count = 0;
    const d = new Date();
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }, [sessions]);

  const hasBehavioral = behavioralPatterns.communicationStyle.length > 0
    || behavioralPatterns.thinkingPattern.length > 0
    || behavioralPatterns.pressureHandling.length > 0;
  const hasSkillGaps = skillGaps.critical.length > 0 || skillGaps.moderate.length > 0 || skillGaps.minor.length > 0;
  const hasImprovementPlan = improvementPlan.immediate.length > 0 || improvementPlan.week.length > 0 || improvementPlan.month.length > 0;

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200 dark:bg-indigo-900/20 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-blue-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
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

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
              className="flex items-stretch gap-3 lg:w-auto">
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-xl px-5 py-2.5 flex items-center gap-6 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Interview Limit</span>
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
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentMonthlyUsage / interviewLimit) * 100, 100)}%` }}
                      className={`h-full ${isAtLimit ? 'bg-rose-500' : 'bg-blue-600'}`} />
                  </div>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {onStartNew && (
                  <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      if (isAtLimit && (user as any)?.role !== 'student') setShowPricing(true);
                      else if (!isAtLimit) onStartNew();
                    }}
                    disabled={isAtLimit && (user as any)?.role === 'student'}
                    className={`flex items-center gap-3 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 shadow-lg disabled:cursor-not-allowed ${
                      isAtLimit
                        ? (user as any)?.role === 'student'
                          ? 'bg-rose-600/80 text-white shadow-rose-500/10 opacity-80'
                          : 'bg-rose-600 text-white shadow-rose-500/10'
                        : 'bg-blue-600 text-white shadow-blue-600/10 hover:bg-blue-700'
                    }`}>
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      {isAtLimit ? <ShieldCheck className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <span>
                      {isAtLimit
                        ? (user as any)?.role === 'student' ? 'Limit Reached' : 'Upgrade Now'
                        : 'New Interview'}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-6 py-12 space-y-10">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Sessions', value: totalInterviews,         icon: BarChart3, colorCls: 'blue',    desc: 'Mock sessions'       },
            { label: 'Average Score',  value: averageScore.toFixed(1), icon: Target,    colorCls: 'indigo',  desc: 'Performance quality' },
            { label: 'Best Score',     value: bestScore.toFixed(1),    icon: Trophy,    colorCls: 'emerald', desc: 'Highest achievement' },
            { label: 'Active Streak',  value: streak,                  icon: Flame,     colorCls: 'orange',  desc: 'Consecutive days'    },
            { label: 'Round Types',    value: byRoundType.length,      icon: Activity,  colorCls: 'purple',  desc: 'Interview categories'},
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVars}
              className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.colorCls}-50 dark:bg-${stat.colorCls}-500/10 text-${stat.colorCls}-600 dark:text-${stat.colorCls}-400 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-right leading-tight">{stat.desc}</span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-semibold mt-0.5">{stat.label}</p>
              <div className={`absolute top-0 right-0 p-3 opacity-5 text-${stat.colorCls}-500 group-hover:opacity-10 transition-opacity`}>
                <stat.icon className="w-16 h-16 rotate-[-15deg]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {totalInterviews === 0 ? (
          <motion.div variants={itemVars}
            className="text-center py-24 bg-white/50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-blue-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Analytics Available</h3>
            <p className="text-slate-500 max-w-md mx-auto">Complete your first interactive AI interview to unlock detailed performance metrics and career insights.</p>
          </motion.div>
        ) : (
          <>
            {/* Score Trend Over Time */}
            <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Score Trend Over Time</h3>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">Your progression across all interview sessions</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      const cfg = getRoundCfg(d.round);
                      return (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
                          <p className="font-black text-slate-900 dark:text-white mb-1">#{d.idx} — {d.role}</p>
                          <p className="mb-2 font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                          <p className="text-slate-400">{d.date}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">Score</span>
                            <span className="font-black text-slate-900 dark:text-white">{d.score}</span>
                          </div>
                        </div>
                      );
                    }} />
                    <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} fill="url(#trendGrad)" name="Score"
                      dot={(props: any) => {
                        const cfg = getRoundCfg(props.payload?.round || 'general');
                        return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill={cfg.color} stroke="#fff" strokeWidth={2} />;
                      }}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2, fill: '#3B82F6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {byRoundType.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {byRoundType.map(r => (
                    <span key={r.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: getRoundCfg(r.key).bg, color: getRoundCfg(r.key).color, border: `1px solid ${getRoundCfg(r.key).border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                      {r.type}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Performance by Type + Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* By Round Type */}
              <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">By Interview Type</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">Average score per round category</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byRoundType} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="type" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs">
                            <p className="font-black text-slate-900 dark:text-white mb-2">{d.type}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-6"><span className="text-slate-400">Avg Score</span><span className="font-black" style={{ color: d.color }}>{d.avg}</span></div>
                              <div className="flex justify-between gap-6"><span className="text-slate-400">Best Score</span><span className="font-black text-slate-900 dark:text-white">{d.best}</span></div>
                              <div className="flex justify-between gap-6"><span className="text-slate-400">Sessions</span><span className="font-black text-slate-900 dark:text-white">{d.sessions}</span></div>
                            </div>
                          </div>
                        );
                      }} />
                      <Bar dataKey="avg" name="Avg Score" radius={[0, 6, 6, 0]}>
                        {byRoundType.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {difficultyStats.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">By Difficulty</p>
                    <div className="grid grid-cols-3 gap-3">
                      {difficultyStats.map(d => (
                        <div key={d.label} className={`p-3 rounded-xl text-center ${
                          d.label === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                          d.label === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-rose-50 dark:bg-rose-500/10'
                        }`}>
                          <p className={`text-lg font-black ${
                            d.label === 'Easy' ? 'text-emerald-600' :
                            d.label === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                          }`}>{d.avg}</p>
                          <p className="text-[10px] font-black text-slate-500 mt-0.5">{d.label}</p>
                          <p className="text-[9px] text-slate-400">{d.count} session{d.count !== 1 ? 's' : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Score Distribution */}
              <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Score Distribution</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">How your sessions spread across score bands</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs">
                            <p className="font-black text-slate-900 dark:text-white mb-1">Score {d.range}</p>
                            <p style={{ color: d.color }} className="font-black">{d.count} session{d.count !== 1 ? 's' : ''}</p>
                          </div>
                        );
                      }} />
                      <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]}>
                        {scoreDistribution.map((b, i) => <Cell key={i} fill={b.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {scoreDistribution.filter(b => b.count > 0).map(b => (
                    <span key={b.range} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500">
                      <span className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                      {b.range}: <strong className="text-slate-700 dark:text-slate-200 ml-0.5">{b.count}</strong>
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Skill Matrix */}
            <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-[2.5rem] border border-blue-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Skill Matrix</h3>
                  <p className="text-slate-500 text-sm font-medium">Aggregated performance across 5 key dimensions</p>
                </div>
                <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-[260px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" className="opacity-50 dark:opacity-20" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} axisLine={false} tick={false} />
                    <defs>
                      <linearGradient id="radarGradientNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Radar name="Average Score" dataKey="score" stroke="#2563eb" strokeWidth={3} fill="url(#radarGradientNew)" fillOpacity={0.55} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-4">
                {radarData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center leading-tight">{d.subject}</span>
                    <span className={`text-sm font-black ${d.score >= 7 ? 'text-emerald-600' : d.score >= 4 ? 'text-blue-600' : 'text-rose-500'}`}>{d.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Strengths + Focus Areas */}
            {(topStrengths.length > 0 || topImprovements.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {topStrengths.length > 0 && (
                  <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
                        Top Strengths
                      </h3>
                      <Award className="w-5 h-5 text-slate-200" />
                    </div>
                    <div className="space-y-2.5">
                      {topStrengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckIcon className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-snug">{s}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {topImprovements.length > 0 && (
                  <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg"><Target className="w-4 h-4 text-amber-600" /></div>
                        Focus Areas
                      </h3>
                      <Brain className="w-5 h-5 text-slate-200" />
                    </div>
                    <div className="space-y-2.5">
                      {topImprovements.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="w-3 h-3 text-amber-600" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-snug">{a}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Skill Gap + Behavioral + Improvement */}
            {(hasSkillGaps || hasBehavioral || hasImprovementPlan) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {hasSkillGaps && (
                  <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Skill Gap Analysis</h3>
                        <p className="text-slate-500 text-sm">Aggregated gaps identified by AI across sessions</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {skillGaps.critical.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Critical Gaps</p>
                          <div className="flex flex-wrap gap-2">
                            {skillGaps.critical.map((g, i) => (
                              <span key={i} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 rounded-full text-xs font-bold">{g}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {skillGaps.moderate.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Moderate Gaps</p>
                          <div className="flex flex-wrap gap-2">
                            {skillGaps.moderate.map((g, i) => (
                              <span key={i} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 rounded-full text-xs font-bold">{g}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {skillGaps.minor.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2">Minor Gaps</p>
                          <div className="flex flex-wrap gap-2">
                            {skillGaps.minor.map((g, i) => (
                              <span key={i} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/20 rounded-full text-xs font-bold">{g}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col gap-6">
                  {hasBehavioral && (
                    <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                          <Brain className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Behavioral Patterns</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Communication', items: behavioralPatterns.communicationStyle, colorCls: 'blue'   },
                          { label: 'Thinking Style', items: behavioralPatterns.thinkingPattern,    colorCls: 'purple' },
                          { label: 'Under Pressure', items: behavioralPatterns.pressureHandling,   colorCls: 'rose'   },
                        ].filter(g => g.items.length > 0).map(g => {
                          const raw = g.items[0] || '';
                          const firstSentence = (raw.split(/\.\s+/)[0] || raw).replace(/\.$/, '').trim();
                          return (
                            <div key={g.label} className={`p-3 rounded-xl bg-${g.colorCls}-50 dark:bg-${g.colorCls}-500/10`}>
                              <p className={`text-[9px] font-black text-${g.colorCls}-500 uppercase tracking-wider mb-2`}>{g.label}</p>
                              <p className={`text-xs font-semibold text-${g.colorCls}-700 dark:text-${g.colorCls}-300 leading-relaxed`}>{firstSentence}.</p>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {hasImprovementPlan && (
                    <motion.div variants={itemVars} className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-blue-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Improvement Roadmap</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: 'Do Now',     items: improvementPlan.immediate, colorCls: 'rose',  icon: Zap      },
                          { label: 'This Week',  items: improvementPlan.week,      colorCls: 'amber', icon: Clock    },
                          { label: 'This Month', items: improvementPlan.month,     colorCls: 'blue',  icon: BookOpen },
                        ].filter(g => g.items.length > 0).map(g => (
                          <div key={g.label}>
                            <p className={`text-[9px] font-black text-${g.colorCls}-500 uppercase tracking-widest mb-2 flex items-center gap-1.5`}>
                              <g.icon className="w-3 h-3" />{g.label}
                            </p>
                            <div className="space-y-1.5">
                              {g.items.slice(0, 2).map((item, i) => (
                                <div key={i} className={`flex items-start gap-2 p-2.5 bg-${g.colorCls}-50 dark:bg-${g.colorCls}-500/5 rounded-lg`}>
                                  <div className={`w-1.5 h-1.5 rounded-full bg-${g.colorCls}-400 mt-1.5 shrink-0`} />
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Interview History */}
            <motion.div variants={itemVars} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Interview History</h3>
                  <p className="text-slate-500 text-sm font-medium">Review your previous sessions and feedback</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 text-sm font-bold">
                  <Calendar className="w-4 h-4" />
                  Chronological
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                {sessions.map((s, idx) => (
                  <HistoryItem key={idx} aiSession={s} index={idx} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function HistoryItem({ aiSession, index }: { aiSession: any; index: number }) {
  const navigate = useNavigate();
  const score = aiSession.summary?.overall_score ?? 0;
  const sessionId = aiSession._id || aiSession.session_id;
  const roundType = aiSession.roundType || aiSession.round || 'general';
  const roundCfg = getRoundCfg(roundType);
  const { text: scoreTxt, bg: scoreBg, border: scoreBdr, hex: scoreHex } = scoreColor(score);

  const strengths = (aiSession.verdict?.strengths_to_highlight || [])
    .filter((s: string) => typeof s === 'string' && !s.toLowerCase().includes('none') && s.length > 5);
  const improvements = (aiSession.verdict?.areas_to_fix_before_next_interview || [])
    .filter((a: string) => typeof a === 'string' && !a.toLowerCase().includes('none') && a.length > 5);

  const dimensions = aiSession.dimension_scores || {};
  const dimEntries = [
    { key: 'Technical',       val: dimensions.technical_depth || 0 },
    { key: 'Problem Solving', val: dimensions.problem_solving || 0 },
    { key: 'System Design',   val: dimensions.system_design   || 0 },
    { key: 'Communication',   val: dimensions.communication   || 0 },
    { key: 'Cultural Fit',    val: dimensions.role_fit        || 0 },
  ].filter(d => d.val > 0);

  const hiringRec = (() => {
    const r = (aiSession.summary?.hire_recommendation || '').toUpperCase();
    if (r === 'NO' || r === 'NOT_RECOMMENDED' || r === 'REJECT')
      return { label: 'Not Recommended', cls: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20' };
    if (r === 'YES' || r === 'HIRE')
      return { label: 'Recommended', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' };
    if (r === 'MAYBE')
      return { label: 'Conditional', cls: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' };
    return { label: r.replace(/_/g, ' ') || 'Evaluated', cls: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
  })();

  return (
    <motion.div
      variants={itemVars}
      whileHover={{ y: -3 }}
      className="group bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 mb-6">
        <div className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0 border-2 ${scoreBdr} ${scoreBg}`}>
          <span className={`text-2xl font-black ${scoreTxt}`}>{score}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${scoreTxt}`}>Score</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
              {(aiSession.role || 'General Role').toUpperCase()}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border"
              style={{ background: roundCfg.bg, color: roundCfg.color, borderColor: roundCfg.border }}>
              {roundCfg.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              <Brain className="w-3.5 h-3.5" />
              {aiSession.company || 'Private Assessment'}
            </span>
            {aiSession.difficulty && (
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                aiSession.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                aiSession.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>{aiSession.difficulty}</span>
            )}
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${hiringRec.cls}`}>{hiringRec.label}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1.5">
            {aiSession.timestamp
              ? new Date(aiSession.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : 'Date Unknown'}
          </p>
        </div>

        <button
          onClick={() => sessionId && navigate(`/interview/results/${sessionId}`)}
          className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl transition-all self-start shrink-0"
        >
          Full Report <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dimension mini-bars */}
      {dimEntries.length > 0 && (
        <div className="mb-5 grid grid-cols-5 gap-2">
          {dimEntries.map(d => (
            <div key={d.key} className="flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.val / 10) * 100}%`, background: scoreHex }} />
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide text-center leading-tight">{d.key}</span>
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{d.val.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strengths / Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h5 className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit uppercase tracking-widest mb-2.5">Performance Peaks</h5>
          <div className="space-y-2">
            {strengths.slice(0, 2).map((s: string, i: number) => (
              <div key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-400 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {s}
              </div>
            ))}
            {strengths.length === 0 && <p className="text-xs text-slate-400 italic px-1">—</p>}
          </div>
        </div>
        <div>
          <h5 className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full w-fit uppercase tracking-widest mb-2.5">Growth Areas</h5>
          <div className="space-y-2">
            {improvements.slice(0, 2).map((a: string, i: number) => (
              <div key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-400 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {a}
              </div>
            ))}
            {improvements.length === 0 && <p className="text-xs text-slate-400 italic px-1">—</p>}
          </div>
        </div>
      </div>

      {aiSession.verdict?.final_recommendation_text && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">AI Verdict</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
            "{aiSession.verdict.final_recommendation_text}"
          </p>
        </div>
      )}
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
