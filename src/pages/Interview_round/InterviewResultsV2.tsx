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
  Users,
  Heart,
  Handshake,
  Puzzle,
  GraduationCap,
  Cpu,
  Activity,
  Sparkles,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Flame,
  Code,
  MessageCircle,
  Briefcase,
} from "lucide-react";
import { InterviewV2Report } from "@/api/interviewV2";
import { InterviewAnalyticsApi } from "@/api/interviewAnalytics";
import FeedbackDialog from "@/components/interview/FeedbackDialog";
import { generateInterviewReport } from "@/utils/pdfGenerator";
import HackathonPostForm from "@/components/hackathon/HackathonPostForm";
import { useHackathon } from "@/contexts/HackathonContext";

// ─────────────────────────────────────────────────────────────────
// Round Config
// ─────────────────────────────────────────────────────────────────

type RoundKey = "technical" | "behavioral" | "hr" | "problem" | "general";

interface RoundConfig {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  ringHex: string;
  gradientFrom: string;
  gradientTo: string;
  sectionBg: string;
  cardAccent: string;
}

const ROUND_CONFIG: Record<RoundKey, RoundConfig> = {
  technical: {
    label: "Technical",
    icon: <Cpu className="w-4 h-4" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/60",
    iconText: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-50 dark:bg-blue-900/30",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-700",
    ringHex: "#2563EB",
    gradientFrom: "from-blue-600",
    gradientTo: "to-indigo-700",
    sectionBg: "bg-blue-600",
    cardAccent: "border-l-blue-500",
  },
  behavioral: {
    label: "Behavioral",
    icon: <Users className="w-4 h-4" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconText: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-900/30",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-700",
    ringHex: "#059669",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-teal-700",
    sectionBg: "bg-emerald-600",
    cardAccent: "border-l-emerald-500",
  },
  hr: {
    label: "HR",
    icon: <Handshake className="w-4 h-4" />,
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconText: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-50 dark:bg-purple-900/30",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-700",
    ringHex: "#7C3AED",
    gradientFrom: "from-purple-600",
    gradientTo: "to-violet-700",
    sectionBg: "bg-purple-600",
    cardAccent: "border-l-purple-500",
  },
  problem: {
    label: "Problem Solving",
    icon: <Puzzle className="w-4 h-4" />,
    iconBg: "bg-amber-50 dark:bg-amber-950/60",
    iconText: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-900/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-700",
    ringHex: "#D97706",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    sectionBg: "bg-amber-500",
    cardAccent: "border-l-amber-500",
  },
  general: {
    label: "Interview",
    icon: <Award className="w-4 h-4" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/60",
    iconText: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-50 dark:bg-blue-900/30",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-700",
    ringHex: "#2563EB",
    gradientFrom: "from-blue-600",
    gradientTo: "to-indigo-700",
    sectionBg: "bg-blue-600",
    cardAccent: "border-l-blue-500",
  },
};

const DIMENSIONS: Record<string, { icon: React.ReactNode; label: string }> = {
  technical_depth:     { icon: <Cpu className="w-3.5 h-3.5" />,          label: "Technical Depth"      },
  problem_solving:     { icon: <Puzzle className="w-3.5 h-3.5" />,        label: "Problem Solving"      },
  system_design:       { icon: <Activity className="w-3.5 h-3.5" />,      label: "System Design"        },
  code_quality:        { icon: <Code className="w-3.5 h-3.5" />,           label: "Code Quality"         },
  analytical_thinking: { icon: <Brain className="w-3.5 h-3.5" />,         label: "Analytical Thinking"  },
  creativity:          { icon: <Sparkles className="w-3.5 h-3.5" />,       label: "Creativity"          },
  cultural_fit:        { icon: <Heart className="w-3.5 h-3.5" />,          label: "Cultural Fit"         },
  professionalism:     { icon: <GraduationCap className="w-3.5 h-3.5" />, label: "Professionalism"      },
  career_clarity:      { icon: <Target className="w-3.5 h-3.5" />,         label: "Career Clarity"      },
  motivation:          { icon: <Flame className="w-3.5 h-3.5" />,          label: "Motivation"          },
  leadership:          { icon: <Star className="w-3.5 h-3.5" />,           label: "Leadership"          },
  conflict_resolution: { icon: <Shield className="w-3.5 h-3.5" />,         label: "Conflict Resolution" },
  teamwork:            { icon: <Users className="w-3.5 h-3.5" />,          label: "Teamwork"            },
  adaptability:        { icon: <Zap className="w-3.5 h-3.5" />,            label: "Adaptability"        },
  communication:       { icon: <MessageCircle className="w-3.5 h-3.5" />,  label: "Communication"       },
  role_fit:            { icon: <Briefcase className="w-3.5 h-3.5" />,       label: "Role Fit"           },
};

const SECTION_LABELS: Record<
  RoundKey,
  { skillGap: string; behavioral: string; improvement: string }
> = {
  technical:  { skillGap: "Skill Gap Analysis",      behavioral: "Communication & Thinking",   improvement: "Technical Improvement Plan"  },
  behavioral: { skillGap: "Behavioral Gap Analysis",  behavioral: "Behavioral Style Insights",  improvement: "Behavioral Development Plan" },
  hr:         { skillGap: "Alignment Gap Analysis",   behavioral: "Communication & Presence",   improvement: "Interview Preparation Plan"  },
  problem:    { skillGap: "Analytical Gap Analysis",  behavioral: "Problem-Solving Style",      improvement: "Analytical Improvement Plan" },
  general:    { skillGap: "Gap Analysis",             behavioral: "Style Insights",             improvement: "Improvement Plan"            },
};

// ─────────────────────────────────────────────────────────────────
// Score helpers
// ─────────────────────────────────────────────────────────────────

function scoreGrade(s: number) {
  if (s >= 85) return { label: "Excellent",    cls: "text-emerald-600 dark:text-emerald-400" };
  if (s >= 70) return { label: "Good",          cls: "text-green-600 dark:text-green-400"    };
  if (s >= 55) return { label: "Average",       cls: "text-amber-600 dark:text-amber-400"    };
  if (s >= 40) return { label: "Below Average", cls: "text-orange-600 dark:text-orange-400"  };
  return              { label: "Needs Work",    cls: "text-rose-600 dark:text-rose-400"      };
}

function dimScoreColor(v: number) {
  if (v >= 8) return { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", track: "bg-emerald-100 dark:bg-emerald-900/30" };
  if (v >= 6) return { text: "text-blue-600 dark:text-blue-400",       bar: "bg-blue-500",    track: "bg-blue-100 dark:bg-blue-900/30"      };
  if (v >= 4) return { text: "text-amber-600 dark:text-amber-400",     bar: "bg-amber-500",   track: "bg-amber-100 dark:bg-amber-900/30"    };
  return              { text: "text-rose-600 dark:text-rose-400",       bar: "bg-rose-500",    track: "bg-rose-100 dark:bg-rose-900/30"      };
}

function qScoreChip(v: number) {
  if (v >= 8) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (v >= 6) return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  if (v >= 4) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  return "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function InterviewResultsV2() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<InterviewV2Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);

  const { eligible: isHackathon, formSubmitted } = useHackathon();
  const isHackathonSession = isHackathon && localStorage.getItem('hackathon_interview_mode') === 'true';
  const [showHackathonForm, setShowHackathonForm] = useState(false);

  const roundType: RoundKey = (
    ((report as any)?.roundType ?? (report as any)?.round_type ?? "general") as string
  ).toLowerCase() as RoundKey;
  const rc = ROUND_CONFIG[roundType] ?? ROUND_CONFIG.general;
  const sl = SECTION_LABELS[roundType] ?? SECTION_LABELS.general;

  useEffect(() => {
    if (!loading && report && sessionId && !((report as any).feedback || feedbackDone)) {
      const t = setTimeout(() => setShowFeedback(true), 3500);
      return () => clearTimeout(t);
    }
  }, [loading, report, sessionId, feedbackDone]);

  // Auto-show hackathon form when results load and form not yet submitted
  useEffect(() => {
    if (!loading && report && isHackathonSession && !formSubmitted) {
      const t = setTimeout(() => setShowHackathonForm(true), 800);
      return () => clearTimeout(t);
    }
  }, [loading, report, isHackathonSession, formSubmitted]);

  useEffect(() => {
    async function loadFromLocalStorage(): Promise<any> {
      const raw = localStorage.getItem("v2_interview_report");
      if (!raw) return null;
      try {
        const p = JSON.parse(raw);
        // Accept any report that has at least a summary or overall score
        if (p?.summary || p?.overall_score != null || p?.summary?.overall_score != null) return p;
      } catch { /**/ }
      return null;
    }

    async function load() {
      if (!sessionId) {
        const local = await loadFromLocalStorage();
        setReport(local);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await InterviewAnalyticsApi.getInterviewReport(sessionId);
        if (data?.summary || data?.overall_score != null) {
          setReport(data);
        } else {
          // API returned empty/null — fall back to localStorage
          const local = await loadFromLocalStorage();
          setReport(local);
        }
      } catch {
        const local = await loadFromLocalStorage();
        setReport(local);
      }
      finally { setLoading(false); }
    }
    load();
  }, [sessionId]);

  if (loading) return <LoadingScreen />;
  if (!report)  return <ErrorScreen onBack={() => navigate("/interview_round")} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Ambient bg blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full opacity-[0.06] bg-gradient-to-br ${rc.gradientFrom} ${rc.gradientTo} blur-3xl`} />
        <div className={`absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full opacity-[0.04] bg-gradient-to-tr ${rc.gradientFrom} ${rc.gradientTo} blur-3xl`} />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${rc.sectionBg} shadow-sm shadow-black/10`}>
              <span className="text-white">{rc.icon}</span>
            </div>
            <div>
              <h1 className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                {rc.label} Interview Report
              </h1>
              {(report as any).role && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{(report as any).role}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavBtn onClick={() => navigate("/interview_round")} icon={<Home className="w-4 h-4" />} label="Dashboard" />
            {isHackathonSession && !formSubmitted && (
              <NavBtn
                onClick={() => setShowHackathonForm(true)}
                icon={<GraduationCap className="w-4 h-4" />}
                label="Submit Form"
              />
            )}
            {sessionId && !isHackathonSession && (
              <NavBtn
                onClick={() => setShowFeedback(true)}
                icon={<MessageSquare className="w-4 h-4" />}
                label={(report as any).feedback || feedbackDone ? "Update Rating" : "Rate Session"}
              />
            )}
            <button
              onClick={() => generateInterviewReport(report, (report as any).role, (report as any).roundType ?? (report as any).round_type)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 bg-gradient-to-r ${rc.gradientFrom} ${rc.gradientTo}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <HeroSection report={report} rc={rc} />

        <ReportSection title="Performance Dimensions" subtitle="Detailed scoring across evaluated competencies" icon={<BarChart3 className="w-5 h-5" />} rc={rc}>
          <DimensionGrid scores={report.dimension_scores} rc={rc} />
        </ReportSection>

        {report.question_wise_analysis?.length > 0 && (
          <ReportSection title="Question Analysis" subtitle={`Breakdown of ${report.question_wise_analysis.length} interview questions`} icon={<MessageSquare className="w-5 h-5" />} rc={rc}>
            <div className="space-y-3">
              {report.question_wise_analysis.map((q, idx) => (
                <QuestionCard key={q.question_id} q={q} idx={idx} roundType={roundType} rc={rc} />
              ))}
            </div>
          </ReportSection>
        )}

        <ReportSection title={sl.skillGap} subtitle="Areas requiring focus and targeted development" icon={<Target className="w-5 h-5" />} rc={rc}>
          <GapAnalysis gaps={report.skill_gap_analysis} roundType={roundType} />
        </ReportSection>

        <ReportSection title={sl.behavioral} subtitle="Qualitative assessment of your interview style" icon={<Brain className="w-5 h-5" />} rc={rc}>
          <InsightCards insights={report.behavioral_insights} roundType={roundType} rc={rc} />
        </ReportSection>

        <ReportSection title={sl.improvement} subtitle="Structured roadmap to elevate your performance" icon={<Rocket className="w-5 h-5" />} rc={rc}>
          <ImprovementRoadmap plan={report.improvement_plan} />
        </ReportSection>

        <ReportSection title="Final Assessment" subtitle="Comprehensive hiring recommendation and key takeaways" icon={<Award className="w-5 h-5" />} rc={rc}>
          <FinalVerdict verdict={report.verdict} />
        </ReportSection>

        <CTABanner rc={rc} onNext={() => navigate("/interview_round")} />
      </main>

      {sessionId && !isHackathonSession && (
        <FeedbackDialog sessionId={sessionId} open={showFeedback}
          onClose={() => { setShowFeedback(false); setFeedbackDone(true); }} />
      )}

      {showHackathonForm && (
        <HackathonPostForm onDone={() => setShowHackathonForm(false)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-blue-600 animate-spin" style={{ borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent" }} />
          <div className="absolute inset-3 rounded-full border-[3px] border-blue-100 dark:border-blue-900/50" />
          <div className="absolute inset-3 rounded-full border-[3px] border-t-indigo-500 animate-spin" style={{ borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent", animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Building Your Report</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Analysing your interview performance…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shadow-sm">
          <XCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Could not load your interview results.</p>
        <button onClick={onBack}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function NavBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ReportSection({ title, subtitle, icon, rc, children }: {
  title: string; subtitle: string; icon: React.ReactNode; rc: RoundConfig; children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${rc.iconBg} ${rc.iconText} flex-shrink-0 mt-0.5 shadow-sm`}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────

function HeroSection({ report, rc }: { report: InterviewV2Report; rc: RoundConfig }) {
  const score  = report.summary?.overall_score ?? 0;
  const rec    = report.summary?.hire_recommendation ?? "";
  const snr    = report.summary?.seniority_assessment ?? "";
  const conf   = report.summary?.confidence_assessment ?? "";
  const role   = (report as any).role ?? "";
  const qCount = report.question_wise_analysis?.length ?? 0;

  const grade  = scoreGrade(score);
  const isHire = /(strong hire|hire)/i.test(rec) || score >= 70;
  const C      = 2 * Math.PI * 52;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50"
    >
      {/* Gradient header */}
      <div className={`relative bg-gradient-to-br ${rc.gradientFrom} ${rc.gradientTo} px-6 sm:px-10 pt-8 pb-20`}>
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(ellipse_at_20%_50%,white,transparent_65%)]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="150" cy="150" r="100" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="150" cy="150" r="70" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="150" cy="150" r="40" fill="none" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-widest mb-4">
              {rc.icon} {rc.label} Round
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {role || `${rc.label} Interview`}
            </h2>
            <p className="text-white/55 text-sm mt-1.5">Performance & Feedback Report</p>
          </div>
          <div className={`self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold backdrop-blur-sm ${
            isHire
              ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-100"
              : "bg-rose-500/20 border-rose-400/30 text-rose-100"
          }`}>
            {isHire ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
            {rec || "Evaluation Complete"}
          </div>
        </div>
      </div>

      {/* Floating white card */}
      <div className="relative bg-white dark:bg-slate-900 -mt-12 mx-4 mb-0 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Score ring */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="relative">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="6" stroke={rc.ringHex} opacity="0.15" strokeDasharray={C} strokeDashoffset="0" />
                  <motion.circle
                    cx="60" cy="60" r="52" fill="none" strokeWidth="6" strokeLinecap="round"
                    stroke={rc.ringHex}
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C - (score / 100) * C }}
                    transition={{ duration: 1.8, ease: [0.34, 1.3, 0.64, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className={`text-5xl font-black tabular-nums leading-none ${grade.cls}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    {score}
                  </motion.span>
                  <span className="text-xs text-slate-400 font-semibold mt-1">/ 100</span>
                </div>
              </div>
              <span className={`text-sm font-black ${grade.cls}`}>{grade.label}</span>
            </div>

            {/* Info */}
            <div className="flex-1 w-full min-w-0">
              {(snr || conf) && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {snr && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      <GraduationCap className="w-3.5 h-3.5" /> {snr}
                    </span>
                  )}
                  {conf && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      <Activity className="w-3.5 h-3.5" /> {conf} confidence
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Overall Score", value: `${score}`, unit: "/100", sub: grade.label,     color: grade.cls    },
                  { label: "Questions",     value: `${qCount}`, unit: "",    sub: "answered",      color: rc.iconText  },
                  { label: "Round",         value: rc.label,    unit: "",    sub: "interview type", color: rc.iconText  },
                ].map(({ label, value, unit, sub, color }) => (
                  <div key={label}
                    className="group relative rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 p-4 overflow-hidden hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60 transition-all">
                    <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${rc.gradientFrom} ${rc.gradientTo} scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">{label}</p>
                    <p className={`text-xl font-black leading-none ${color}`}>
                      {value}<span className="text-xs font-semibold text-slate-400 ml-0.5">{unit}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 capitalize">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dimension Grid
// ─────────────────────────────────────────────────────────────────

function DimensionGrid({ scores, rc }: {
  scores: InterviewV2Report["dimension_scores"];
  rc: RoundConfig;
}) {
  if (!scores) return <NoData />;
  const entries = (Object.entries(scores) as [string, number | null][])
    .filter(([, v]) => v !== null && v !== undefined) as [string, number][];
  if (!entries.length) return <NoData />;

  const colCls =
    entries.length >= 5 ? "lg:grid-cols-4 xl:grid-cols-6" :
    entries.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${colCls} gap-3`}>
      {entries.map(([key, value], i) => {
        const dim = DIMENSIONS[key] ?? { icon: <BarChart3 className="w-3.5 h-3.5" />, label: key.replace(/_/g, " ") };
        const sc  = dimScoreColor(value);

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col items-center text-center hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:-translate-y-1 transition-all duration-200 cursor-default"
          >
            <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${sc.bar} scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300`} />

            <div className={`p-2.5 rounded-xl mb-3 ${rc.iconBg} ${rc.iconText}`}>
              {dim.icon}
            </div>

            <div className="flex items-baseline gap-0.5 mb-0.5">
              <span className={`text-3xl font-black tabular-nums leading-none ${sc.text}`}>{value}</span>
              <span className="text-xs font-bold text-slate-300 dark:text-slate-600">/10</span>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize leading-snug mb-3 mt-1">
              {dim.label}
            </p>

            <div className={`w-full h-1.5 rounded-full overflow-hidden ${sc.track}`}>
              <motion.div
                className={`h-full rounded-full ${sc.bar}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${value * 10}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.05 + i * 0.04, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Question Card
// ─────────────────────────────────────────────────────────────────

function QuestionCard({ q, idx, roundType, rc }: {
  q: InterviewV2Report["question_wise_analysis"][number];
  idx: number;
  roundType: RoundKey;
  rc: RoundConfig;
}) {
  const [open, setOpen] = useState(false);

  const idealLabel =
    roundType === "hr"         ? "What a Strong Answer Includes" :
    roundType === "behavioral" ? "Ideal STAR-Structured Response" :
    roundType === "problem"    ? "Ideal Approach & Framework" : "Model Answer Points";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.05 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-950/40 transition-all border-l-4 ${rc.cardAccent}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${rc.iconBg} ${rc.iconText}`}>
          {q.question_id}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
            {q.question}
          </p>
          {!open && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{q.user_answer_summary}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`px-3 py-1.5 rounded-xl border text-sm font-black tabular-nums ${qScoreChip(q.score)}`}>
            {q.score}<span className="text-[10px] font-semibold opacity-70">/10</span>
          </span>
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            {open
              ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Answer</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.user_answer_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl p-4 bg-emerald-50/70 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Strengths</span>
                  </div>
                  <ul className="space-y-2">
                    {q.evaluation?.strengths?.map((s, i) => (
                      <li key={i} className="flex gap-2 text-xs text-emerald-800 dark:text-emerald-300 leading-snug">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />{s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl p-4 bg-rose-50/70 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">Weaknesses</span>
                  </div>
                  <ul className="space-y-2">
                    {q.evaluation?.weaknesses?.map((w, i) => (
                      <li key={i} className="flex gap-2 text-xs text-rose-800 dark:text-rose-300 leading-snug">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-500" />{w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl p-4 bg-blue-50/70 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">{idealLabel}</span>
                  </div>
                  <ul className="space-y-2">
                    {q.evaluation?.ideal_answer_outline?.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-xs text-blue-800 dark:text-blue-300 leading-snug">
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />{pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Gap Analysis
// ─────────────────────────────────────────────────────────────────

function GapAnalysis({ gaps, roundType }: {
  gaps: InterviewV2Report["skill_gap_analysis"]; roundType: RoundKey;
}) {
  if (!gaps) return <NoData />;

  const cols = [
    {
      label:  roundType === "hr" ? "Critical Alignment Issues" : roundType === "behavioral" ? "Critical Behavioral Gaps" : roundType === "problem" ? "Critical Reasoning Gaps" : "Critical Gaps",
      items:  gaps.critical_gaps,
      bg:     "bg-rose-50 dark:bg-rose-900/10",
      border: "border-rose-200 dark:border-rose-900/40",
      head:   "text-rose-700 dark:text-rose-400",
      dot:    "bg-rose-500",
      icon:   <XCircle className="w-4 h-4" />,
    },
    {
      label:  roundType === "hr" ? "Areas of Concern" : roundType === "behavioral" ? "Moderate Soft Skill Gaps" : roundType === "problem" ? "Moderate Analytical Gaps" : "Moderate Gaps",
      items:  gaps.moderate_gaps,
      bg:     "bg-amber-50 dark:bg-amber-900/10",
      border: "border-amber-200 dark:border-amber-900/40",
      head:   "text-amber-700 dark:text-amber-400",
      dot:    "bg-amber-500",
      icon:   <AlertCircle className="w-4 h-4" />,
    },
    {
      label:  "Minor Observations",
      items:  gaps.minor_gaps,
      bg:     "bg-sky-50 dark:bg-sky-900/10",
      border: "border-sky-200 dark:border-sky-900/40",
      head:   "text-sky-700 dark:text-sky-400",
      dot:    "bg-sky-400",
      icon:   <Eye className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cols.map(({ label, items, bg, border, head, dot, icon }) => (
        <div key={label} className={`rounded-2xl border p-6 ${bg} ${border}`}>
          <div className={`flex items-center gap-2 mb-4 ${head}`}>
            {icon}
            <h3 className="text-xs font-black uppercase tracking-widest">{label}</h3>
          </div>
          {items?.length ? (
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${head} leading-snug`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${dot}`} />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">None identified — great job!</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Insight Cards
// ─────────────────────────────────────────────────────────────────

function InsightCards({ insights, roundType, rc }: {
  insights: InterviewV2Report["behavioral_insights"]; roundType: RoundKey; rc: RoundConfig;
}) {
  if (!insights) return <NoData />;

  const cards = [
    {
      label: roundType === "hr" ? "Communication & Presence" : roundType === "problem" ? "Explanation Style" : "Communication Style",
      value: insights.communication_style,
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      label: roundType === "behavioral" ? "Thinking & Structuring" : roundType === "problem" ? "Problem Decomposition" : roundType === "hr" ? "Professional Reasoning" : "Thinking Pattern",
      value: insights.thinking_pattern,
      icon: <Brain className="w-5 h-5" />,
    },
    {
      label: roundType === "behavioral" ? "Pressure & Conflict Handling" : roundType === "hr" ? "Composure & Professionalism" : roundType === "problem" ? "Handling Ambiguity" : "Pressure Handling",
      value: insights.pressure_handling,
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`inline-flex p-3 rounded-xl mb-4 ${rc.iconBg} ${rc.iconText}`}>{icon}</div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 leading-snug">{label}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{value || "—"}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Improvement Roadmap
// ─────────────────────────────────────────────────────────────────

function ImprovementRoadmap({ plan }: { plan: InterviewV2Report["improvement_plan"] }) {
  if (!plan) return <NoData />;

  const phases = [
    {
      phase: "01", label: "Immediate Actions", sub: "Start within 24–48 hours",
      items: plan.immediate_actions, icon: <Zap className="w-4 h-4" />,
      phBg: "bg-blue-600", cardBg: "bg-blue-50/60 dark:bg-blue-900/10",
      border: "border-blue-200 dark:border-blue-800/50", check: "text-blue-500",
    },
    {
      phase: "02", label: "1-Week Sprint", sub: "Focused daily practice",
      items: (plan as any).plan_1_week ?? (plan as any)["1_week_plan"],
      icon: <Calendar className="w-4 h-4" />,
      phBg: "bg-purple-600", cardBg: "bg-purple-50/60 dark:bg-purple-900/10",
      border: "border-purple-200 dark:border-purple-800/50", check: "text-purple-500",
    },
    {
      phase: "03", label: "30-Day Growth Plan", sub: "Sustained skill building",
      items: (plan as any).plan_1_month ?? (plan as any)["1_month_plan"],
      icon: <Rocket className="w-4 h-4" />,
      phBg: "bg-emerald-600", cardBg: "bg-emerald-50/60 dark:bg-emerald-900/10",
      border: "border-emerald-200 dark:border-emerald-800/50", check: "text-emerald-500",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {phases.map(({ phase, label, sub, items, icon, phBg, cardBg, border, check }, i) => (
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className={`rounded-2xl border p-6 ${cardBg} ${border}`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm ${phBg}`}>
              {phase}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{label}</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>
            </div>
          </div>
          <ul className="space-y-3">
            {(items as string[] | undefined)?.map((item, j) => (
              <li key={j} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${check}`} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Final Verdict
// ─────────────────────────────────────────────────────────────────

function FinalVerdict({ verdict }: { verdict: InterviewV2Report["verdict"] }) {
  if (!verdict) return <NoData />;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/40 dark:to-blue-900/5">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Final Recommendation</p>
            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed sm:text-[15px]">
              {verdict.final_recommendation_text}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Strengths to Highlight</h4>
          </div>
          <ul className="space-y-3">
            {verdict.strengths_to_highlight?.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                <Star className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{s}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">Fix Before Next Interview</h4>
          </div>
          <ul className="space-y-3">
            {verdict.areas_to_fix_before_next_interview?.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />{a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CTA Banner
// ─────────────────────────────────────────────────────────────────

function CTABanner({ rc, onNext }: { rc: RoundConfig; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${rc.gradientFrom} ${rc.gradientTo} p-10 text-white text-center shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative max-w-md mx-auto">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-white/15 border border-white/25 items-center justify-center mx-auto mb-5">
          <Rocket className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-black mb-2">Keep pushing forward</h3>
        <p className="text-white/70 text-sm leading-relaxed mb-7">
          Every interview is a learning opportunity. Apply this feedback and watch your performance improve.
        </p>
        <button onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-800 font-black rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          Start New Interview <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function NoData() {
  return <p className="text-sm text-slate-400 italic py-3">No data available for this section.</p>;
}
