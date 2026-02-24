import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Home,
  BarChart3,
  Target,
  Zap,
  Brain,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Calendar,
  Rocket,
  Shield,
  Eye,
  Cpu,
  Users,
} from "lucide-react";
import { InterviewV2Report } from "@/api/interviewV2";

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function InterviewResultsV2() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<InterviewV2Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedReport = localStorage.getItem("v2_interview_report");
    if (storedReport) {
      try {
        setReport(JSON.parse(storedReport));
      } catch {
        console.error("Failed to parse stored interview report");
      }
    }
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading interview results…</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Results Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Could not load interview results.</p>
          <button
            onClick={() => navigate("/interview_round")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ─── Top Navigation ─── */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Interview Report</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/interview_round")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ─── 1. Hero / Summary Card ─── */}
        <HeroCard report={report} />

        {/* ─── 2. Dimension Scores ─── */}
        <section>
          <SectionHeading icon={<BarChart3 className="w-5 h-5" />} title="Dimension Scores" />
          <DimensionScoresGrid scores={report.dimension_scores} />
        </section>

        {/* ─── 3. Question-wise Analysis ─── */}
        {report.question_wise_analysis?.length > 0 && (
          <section>
            <SectionHeading icon={<MessageSquare className="w-5 h-5" />} title="Question-wise Analysis" />
            <div className="space-y-4">
              {report.question_wise_analysis.map((q) => (
                <QuestionCard key={q.question_id} question={q} />
              ))}
            </div>
          </section>
        )}

        {/* ─── 4. Skill Gap Analysis ─── */}
        <section>
          <SectionHeading icon={<Target className="w-5 h-5" />} title="Skill Gap Analysis" />
          <SkillGapGrid gaps={report.skill_gap_analysis} />
        </section>

        {/* ─── 5. Behavioral Insights ─── */}
        <section>
          <SectionHeading icon={<Brain className="w-5 h-5" />} title="Behavioral Insights" />
          <BehavioralInsightsGrid insights={report.behavioral_insights} />
        </section>

        {/* ─── 6. Improvement Plan ─── */}
        <section>
          <SectionHeading icon={<Rocket className="w-5 h-5" />} title="Improvement Plan" />
          <ImprovementTimeline plan={report.improvement_plan} />
        </section>

        {/* ─── 7. Verdict ─── */}
        <section>
          <SectionHeading icon={<Award className="w-5 h-5" />} title="Final Verdict" />
          <VerdictCard verdict={report.verdict} />
        </section>

        {/* ─── CTA ─── */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white text-center shadow-xl shadow-indigo-200/30 dark:shadow-indigo-900/20">
          <h3 className="text-2xl font-bold mb-2">Ready for Your Next Interview?</h3>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto text-sm">
            Practice makes perfect. Use the improvement plan above and start another session.
          </p>
          <button
            onClick={() => navigate("/interview_round")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-sm"
          >
            Start New Interview
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

const SectionHeading = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
  </div>
);

// ── Hero Card ──

function HeroCard({ report }: { report: InterviewV2Report }) {
  const score = report.summary?.overall_score ?? 0;
  const rec = report.summary?.hire_recommendation ?? "";
  const seniority = report.summary?.seniority_assessment ?? "";
  const confidence = report.summary?.confidence_assessment ?? "";

  const scoreColor =
    score >= 75 ? "text-emerald-600 dark:text-emerald-400" :
      score >= 50 ? "text-amber-600 dark:text-amber-400" :
        "text-rose-600 dark:text-rose-400";

  const ringColor =
    score >= 75 ? "stroke-emerald-500" :
      score >= 50 ? "stroke-amber-500" :
        "stroke-rose-500";

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-200/60 dark:border-gray-700/60 p-8"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Score Ring */}
        <div className="relative flex-shrink-0">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-gray-100 dark:stroke-gray-700" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
              className={ringColor}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-extrabold ${scoreColor}`}>{score}</span>
            <span className="text-xs text-gray-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{rec}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
            <Badge color="indigo" label={`Seniority: ${seniority}`} />
            <Badge color="slate" label={`Confidence: ${confidence}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Badge = ({ label, color }: { label: string; color: "indigo" | "slate" | "emerald" | "rose" | "amber" }) => {
  const styles: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${styles[color]}`}>
      {label}
    </span>
  );
};

// ── Dimension Scores Grid ──

const DIMENSION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  technical_depth: { icon: <Cpu className="w-5 h-5" />, label: "Technical Depth", color: "indigo" },
  problem_solving: { icon: <Zap className="w-5 h-5" />, label: "Problem Solving", color: "amber" },
  system_design: { icon: <Lightbulb className="w-5 h-5" />, label: "System Design", color: "violet" },
  communication: { icon: <MessageSquare className="w-5 h-5" />, label: "Communication", color: "sky" },
  role_fit: { icon: <Users className="w-5 h-5" />, label: "Role Fit", color: "emerald" },
};

const COLOR_MAP: Record<string, { bar: string; bg: string; text: string; iconBg: string }> = {
  indigo: { bar: "bg-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
  amber: { bar: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/40" },
  violet: { bar: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-900/40" },
  sky: { bar: "bg-sky-500", bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-600 dark:text-sky-400", iconBg: "bg-sky-100 dark:bg-sky-900/40" },
  emerald: { bar: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/40" },
};

function DimensionScoresGrid({ scores }: { scores: InterviewV2Report["dimension_scores"] }) {
  if (!scores) return null;
  const entries = Object.entries(scores) as [string, number][];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {entries.map(([key, value]) => {
        const meta = DIMENSION_META[key] ?? { icon: <BarChart3 className="w-5 h-5" />, label: key.replace(/_/g, " "), color: "indigo" };
        const c = COLOR_MAP[meta.color] ?? COLOR_MAP.indigo;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * entries.indexOf([key, value] as any) }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center text-center"
          >
            <div className={`p-2.5 rounded-xl mb-3 ${c.iconBg} ${c.text}`}>{meta.icon}</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-0.5">{value}<span className="text-sm font-normal text-gray-400">/10</span></div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 capitalize">{meta.label}</div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value * 10}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-1.5 rounded-full ${c.bar}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Question Card (expandable) ──

function QuestionCard({ question }: { question: InterviewV2Report["question_wise_analysis"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor =
    question.score >= 8 ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800" :
      question.score >= 5 ? "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800" :
        "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header (always visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border ${scoreColor}`}>
            {question.score}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Q{question.question_id}. {question.question}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {question.user_answer_summary}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-gray-100 dark:border-gray-700">
              {/* Answer summary */}
              <div className="mb-4 mt-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Your Answer</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{question.user_answer_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {question.evaluation?.strengths?.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-lg p-4 border border-rose-100 dark:border-rose-900/30">
                  <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" /> Weaknesses
                  </h4>
                  <ul className="space-y-1.5">
                    {question.evaluation?.weaknesses?.map((w, i) => (
                      <li key={i} className="text-xs text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ideal Answer */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Ideal Answer Points
                  </h4>
                  <ul className="space-y-1.5">
                    {question.evaluation?.ideal_answer_outline?.map((pt, i) => (
                      <li key={i} className="text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skill Gap Analysis ──

function SkillGapGrid({ gaps }: { gaps: InterviewV2Report["skill_gap_analysis"] }) {
  if (!gaps) return null;

  const sections = [
    { label: "Critical Gaps", items: gaps.critical_gaps, color: "rose", icon: <XCircle className="w-4 h-4" /> },
    { label: "Moderate Gaps", items: gaps.moderate_gaps, color: "amber", icon: <AlertCircle className="w-4 h-4" /> },
    { label: "Minor Gaps", items: gaps.minor_gaps, color: "sky", icon: <Eye className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sections.map(({ label, items, color, icon }) => {
        const c = {
          rose: "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300",
          amber: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300",
          sky: "bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-300",
        }[color];

        return (
          <div key={label} className={`rounded-xl p-5 border ${c}`}>
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">{icon} {label}</h4>
            {items?.length ? (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-60 italic">None identified</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Behavioral Insights ──

function BehavioralInsightsGrid({ insights }: { insights: InterviewV2Report["behavioral_insights"] }) {
  if (!insights) return null;

  const cards = [
    { label: "Communication Style", value: insights.communication_style, icon: <MessageSquare className="w-5 h-5" />, color: "indigo" },
    { label: "Thinking Pattern", value: insights.thinking_pattern, icon: <Brain className="w-5 h-5" />, color: "violet" },
    { label: "Pressure Handling", value: insights.pressure_handling, icon: <Shield className="w-5 h-5" />, color: "emerald" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon, color }) => {
        const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;
        return (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${c.iconBg} ${c.text}`}>{icon}</div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{label}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value || "N/A"}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Improvement Plan Timeline ──

function ImprovementTimeline({ plan }: { plan: InterviewV2Report["improvement_plan"] }) {
  if (!plan) return null;

  const phases = [
    { label: "Immediate Actions", items: plan.immediate_actions, icon: <Zap className="w-4 h-4" />, accent: "indigo" },
    { label: "30-Day Plan", items: plan["30_day_plan"], icon: <Calendar className="w-4 h-4" />, accent: "violet" },
    { label: "90-Day Plan", items: plan["90_day_plan"], icon: <Rocket className="w-4 h-4" />, accent: "emerald" },
  ] as const;

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-300 via-violet-300 to-emerald-300 dark:from-indigo-700 dark:via-violet-700 dark:to-emerald-700" />

      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
        {phases.map(({ label, items, icon, accent }) => {
          const c = COLOR_MAP[accent] ?? COLOR_MAP.indigo;
          return (
            <div key={label} className="relative">
              {/* Dot on timeline */}
              <div className="hidden md:flex absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 z-10" style={{ backgroundColor: accent === "indigo" ? "#6366f1" : accent === "violet" ? "#8b5cf6" : "#10b981" }} />
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${c.iconBg} ${c.text}`}>{icon}</div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{label}</h4>
                </div>
                <ul className="space-y-2.5">
                  {items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.text}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Verdict Card ──

function VerdictCard({ verdict }: { verdict: InterviewV2Report["verdict"] }) {
  if (!verdict) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Final recommendation */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b border-gray-200 dark:border-gray-700">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
          {verdict.final_recommendation_text}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
        {/* Strengths */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Strengths to Highlight
          </h4>
          <ul className="space-y-2.5">
            {verdict.strengths_to_highlight?.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <Star className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to fix */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" /> Fix Before Next Interview
          </h4>
          <ul className="space-y-2.5">
            {verdict.areas_to_fix_before_next_interview?.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
