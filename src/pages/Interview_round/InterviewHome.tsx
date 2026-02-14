import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Code,
  Users,
  Lightbulb,
  MessageCircle,
  Eye,
  Award,
  Calendar,
  Clock,
  BarChart3,
  Target,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Building2,
  Briefcase,
  LineChart,
  Activity,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { interviewResultsAPI, DashboardSummary, PerformanceStats, CompanyAnalytics, RoleAnalytics } from "@/api/interviewResults";
import { motion } from "framer-motion";

type InterviewCardProps = {
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  navigate: ReturnType<typeof useNavigate>;
};

function InterviewCard({ type, description, icon, color, navigate }: InterviewCardProps) {
  // Extract text color from gradient prop (simplification)
  const getTextColor = (gradientClass: string) => {
    if (gradientClass.includes('blue')) return 'text-blue-600 dark:text-blue-400';
    if (gradientClass.includes('emerald') || gradientClass.includes('green')) return 'text-emerald-600 dark:text-emerald-400';
    if (gradientClass.includes('amber') || gradientClass.includes('orange')) return 'text-amber-600 dark:text-amber-400';
    if (gradientClass.includes('purple')) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-900 dark:text-white';
  };

  const getBgColor = (gradientClass: string) => {
    if (gradientClass.includes('blue')) return 'bg-blue-50 dark:bg-blue-900/20';
    if (gradientClass.includes('emerald') || gradientClass.includes('green')) return 'bg-emerald-50 dark:bg-emerald-900/20';
    if (gradientClass.includes('amber') || gradientClass.includes('orange')) return 'bg-amber-50 dark:bg-amber-900/20';
    if (gradientClass.includes('purple')) return 'bg-purple-50 dark:bg-purple-900/20';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const textColor = getTextColor(color);
  const bgColor = getBgColor(color);

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-8 flex flex-col h-full">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-6 transition-transform duration-300`}
        >
          <div className={textColor}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {type} Round
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            {description}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() =>
            navigate(`/interview/start/${type.toLowerCase()}`)
          }
          className="mt-8 w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium text-sm group-hover:border-gray-300 dark:group-hover:border-gray-600"
        >
          Start Interview
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Helper Components
const StatCard = ({
  title,
  value,
  suffix = "",
  icon,
  gradient,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
}) => {
  // Extract text color from gradient (simplification)
  const getTextColor = (g: string) => {
    if (g.includes('blue')) return 'text-blue-600 dark:text-blue-400';
    if (g.includes('green') || g.includes('emerald')) return 'text-emerald-600 dark:text-emerald-400';
    if (g.includes('purple')) return 'text-purple-600 dark:text-purple-400';
    if (g.includes('amber') || g.includes('orange')) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-900 dark:text-white';
  };

  const textColor = getTextColor(gradient);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${textColor}`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          {suffix && <span className="text-lg text-gray-500 dark:text-gray-400">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions
const getRoundIcon = (roundType: string) => {
  const icons: Record<string, React.ReactNode> = {
    technical: <Code className="w-5 h-5" />,
    behavioral: <Users className="w-5 h-5" />,
    problemSolving: <Lightbulb className="w-5 h-5" />,
    hr: <MessageCircle className="w-5 h-5" />,
  };
  return icons[roundType] || <Code className="w-5 h-5" />;
};

const getRoundColor = (roundType: string) => {
  const colors: Record<string, string> = {
    technical: "bg-gradient-to-br from-blue-500 to-blue-600",
    behavioral: "bg-gradient-to-br from-green-500 to-emerald-600",
    problemSolving: "bg-gradient-to-br from-amber-500 to-orange-600",
    hr: "bg-gradient-to-br from-purple-500 to-purple-600",
  };
  return colors[roundType] || "bg-gradient-to-br from-gray-500 to-gray-600";
};

const RoundPerformanceCard = ({
  roundData,
  icon,
  color,
}: {
  roundData: {
    roundType: string;
    count: number;
    averageScore: number;
    lastAttempted: string;
  };
  icon: React.ReactNode;
  color: string;
}) => {
  const date = new Date(roundData.lastAttempted);

  // Extract text color from gradient color prop
  const getTextColor = (g: string) => {
    if (g.includes('blue')) return 'text-blue-600 dark:text-blue-400';
    if (g.includes('emerald') || g.includes('green')) return 'text-emerald-600 dark:text-emerald-400';
    if (g.includes('amber') || g.includes('orange')) return 'text-amber-600 dark:text-amber-400';
    if (g.includes('purple')) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-900 dark:text-white';
  };

  const textColor = getTextColor(color);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${textColor}`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white capitalize">
          {roundData.roundType.replace(/([A-Z])/g, ' $1').trim()}
        </h4>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</span>
          <span className="font-bold text-gray-900 dark:text-white">{roundData.count}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
          <span className="font-bold text-gray-900 dark:text-white">{Math.round(roundData.averageScore)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Last Attempted</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {date.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const PerformanceMetric = ({
  label,
  value,
  color,
  suffix = "",
  showTrend = false,
}: {
  label: string;
  value: number;
  color: "green" | "red" | "blue" | "purple";
  suffix?: string;
  showTrend?: boolean;
}) => {
  const colorClasses = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold ${colorClasses[color]}`}>
          {value}{suffix}
        </span>
        {showTrend && value > 0 && <TrendingUp className="w-4 h-4 text-green-500" />}
        {showTrend && value < 0 && <TrendingDown className="w-4 h-4 text-red-500" />}
      </div>
    </div>
  );
};

const SkillBar = ({
  label,
  value,
  rank,
}: {
  label: string;
  value: number;
  rank: number;
}) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-orange-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-amber-600 to-amber-700";
    return "from-blue-500 to-purple-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">#{rank}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: rank * 0.1, ease: "easeOut" }}
          className={`h-2.5 rounded-full bg-gradient-to-r ${getRankColor(rank)}`}
        />
      </div>
    </div>
  );
};

const CompanyCard = ({
  company,
}: {
  company: {
    companyName: string;
    totalInterviews: number;
    rounds: {
      technical: number;
      behavioral: number;
      hr: number;
      "problem-solving": number;
    };
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    rolesTested: string[];
    lastInterviewDate: string;
    trend: string;
  };
}) => {
  const trendType = company.trend.toLowerCase() as "improving" | "declining" | "stable";
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900 dark:text-white">{company.companyName}</h5>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {company.totalInterviews} interview{company.totalInterviews > 1 ? "s" : ""}
        </p>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(company.averageScore)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">avg</div>
        </div>
        <div className={`p-1.5 rounded-full ${trendType === 'improving' ? 'bg-emerald-50 text-emerald-600' :
          trendType === 'declining' ? 'bg-rose-50 text-rose-600' :
            'bg-gray-50 text-gray-600'
          }`}>
          {trendType === "improving" && <TrendingUp className="w-4 h-4" />}
          {trendType === "declining" && <TrendingDown className="w-4 h-4" />}
          {trendType === "stable" && <Activity className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({
  role,
}: {
  role: {
    roleTitle: string;
    totalInterviews: number;
    companies: string[];
    rounds: {
      technical: number;
      behavioral: number;
      hr: number;
      "problem-solving": number;
    };
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    lastInterviewDate: string;
    skillsEvaluated: {
      technicalDepth: number;
      clarity: number;
      confidence: number;
      communication: number;
    };
  };
}) => {
  const topSkills = Object.entries(role.skillsEvaluated)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([skill]) => skill);

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-900 dark:text-white">{role.roleTitle}</h5>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {role.totalInterviews} interview{role.totalInterviews > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {Math.round(role.averageScore)}
        </div>
      </div>
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topSkills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const TrendCard = ({
  roundType,
  scores,
}: {
  roundType: string;
  scores: number[];
}) => {
  const latestScore = scores[scores.length - 1];
  const previousScore = scores.length > 1 ? scores[scores.length - 2] : latestScore;
  const trend = latestScore > previousScore ? "up" : latestScore < previousScore ? "down" : "stable";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white capitalize text-sm">
          {roundType.replace(/([A-Z])/g, ' $1').trim()}
        </h4>
        {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-600" />}
        {trend === "down" && <TrendingDown className="w-4 h-4 text-rose-600" />}
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{latestScore}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Latest Score</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex gap-0.5">
            {scores.map((_, idx) => (
              <div
                key={idx}
                className={`h-full bg-emerald-500`}
                style={{ width: `${100 / scores.length}%`, opacity: 0.3 + (idx / scores.length) * 0.7 }}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {scores.length} interview{scores.length > 1 ? "s" : ""} completed
        </div>
      </div>
    </div>
  );
};

const RecentInterviewCard = ({ interview, navigate }: { interview: any; navigate: ReturnType<typeof useNavigate> }) => {
  const roundIcons = {
    technical: <Code className="w-5 h-5" />,
    behavioral: <Users className="w-5 h-5" />,
    problemSolving: <Lightbulb className="w-5 h-5" />,
    hr: <MessageCircle className="w-5 h-5" />,
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'technical': return 'text-blue-600 dark:text-blue-400';
      case 'behavioral': return 'text-emerald-600 dark:text-emerald-400';
      case 'problemSolving': return 'text-amber-600 dark:text-amber-400';
      case 'hr': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'behavioral': return 'bg-emerald-50 dark:bg-emerald-900/20';
      case 'problemSolving': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'hr': return 'bg-purple-50 dark:bg-purple-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  const date = new Date(interview.completedAt);
  const textColor = getTextColor(interview.roundType);
  const bgColor = getBgColor(interview.roundType);

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-2.5 rounded-lg ${bgColor} ${textColor}`}>
          {roundIcons[interview.roundType as keyof typeof roundIcons] || roundIcons.technical}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
            {interview.roundType.replace(/([A-Z])/g, ' $1').trim()} Round
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString()} • {interview.totalQuestions} questions
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900 dark:text-white">{interview.overallScore}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
        </div>
        <button
          onClick={() => navigate(`/interview/results/${interview.sessionId}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        >
          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default function InterviewHome() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics | null>(null);
  const [roleAnalytics, setRoleAnalytics] = useState<RoleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInterviewSelection, setShowInterviewSelection] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dashboardData, statsData, companyData, roleData] = await Promise.all([
          interviewResultsAPI.getDashboard(),
          interviewResultsAPI.getPerformanceStats(30),
          interviewResultsAPI.getCompanyAnalytics(),
          interviewResultsAPI.getRoleAnalytics(),
        ]);
        setDashboard(dashboardData);
        setPerformanceStats(statsData);
        setCompanyAnalytics(companyData);
        setRoleAnalytics(roleData);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const rounds = [
    {
      type: "Technical",
      description:
        "Demonstrate your coding skills, system design knowledge, and technical expertise with hands-on challenges.",
      icon: <Code className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      key: "technical",
    },
    {
      type: "Behavioral",
      description:
        "Share your experiences and showcase how you align with our company culture and values.",
      icon: <Users className="w-8 h-8" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      key: "behavioral",
    },
    {
      type: "Problem",
      description:
        "Tackle complex scenarios and demonstrate your analytical thinking and problem-solving approach.",
      icon: <Lightbulb className="w-8 h-8" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      key: "problemSolving",
    },
    {
      type: "HR",
      description:
        "Final discussion about role expectations, compensation, and next steps in your journey with us.",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      key: "hr",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your interview analytics...</p>
        </div>
      </div>
    );
  }

  if (showInterviewSelection) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header section */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <button
              onClick={() => setShowInterviewSelection(false)}
              className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-full text-sm font-medium mb-4 shadow-lg">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                Interview Process
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Choose Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Interview Round
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Select the interview type that matches your preparation focus. Each
                round is designed to evaluate different aspects of your candidacy.
              </p>
            </div>
          </div>
        </div>

        {/* Cards section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {rounds.map((round) => (
              <InterviewCard key={round.type} type={round.type} description={round.description} icon={round.icon} color={round.color} navigate={navigate} />
            ))}
          </div>

          {/* Bottom info */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>
                All rounds include detailed feedback and performance analytics
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress, analyze performance, and master every interview
              </p>
            </div>
            <button
              onClick={() => setShowInterviewSelection(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm"
            >
              <PlayCircle className="w-5 h-5" />
              Start New Interview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Interviews"
            value={dashboard?.summary.totalInterviews || 0}
            icon={<Calendar className="w-6 h-6" />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Completed"
            value={dashboard?.summary.completedInterviews || 0}
            icon={<CheckCircle2 className="w-6 h-6" />}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Average Score"
            value={Math.round(dashboard?.summary.averageScore || 0)}
            suffix="/100"
            icon={<Award className="w-6 h-6" />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Questions Answered"
            value={dashboard?.summary.totalQuestionsAnswered || 0}
            icon={<Target className="w-6 h-6" />}
            gradient="from-amber-500 to-orange-500"
          />
        </div>

        {/* Performance by Round */}
        {dashboard && dashboard.roundBreakdown && dashboard.roundBreakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Performance by Round Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboard.roundBreakdown.map((round) => (
                <RoundPerformanceCard
                  key={round.roundType}
                  roundData={round}
                  icon={getRoundIcon(round.roundType)}
                  color={getRoundColor(round.roundType)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Performance Stats & Skills */}
        {performanceStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Overall Performance
              </h3>
              <div className="space-y-4">
                <PerformanceMetric
                  label="Highest Score"
                  value={Math.round(performanceStats.overallStats.highestScore)}
                  color="green"
                />
                <PerformanceMetric
                  label="Lowest Score"
                  value={Math.round(performanceStats.overallStats.lowestScore)}
                  color="red"
                />
                <PerformanceMetric
                  label="Score Improvement"
                  value={Math.round(performanceStats.overallStats.scoreImprovement)}
                  suffix="%"
                  color="blue"
                  showTrend={true}
                />
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Questions</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {performanceStats.overallStats.totalQuestions}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Skills */}
            {dashboard && dashboard.topSkills && dashboard.topSkills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Top Skills
                </h3>
                <div className="space-y-4">
                  {dashboard.topSkills.map((skill, idx) => (
                    <SkillBar key={idx} label={skill.skill} value={skill.score} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Company & Role Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Analytics */}
          {companyAnalytics && companyAnalytics.companies && companyAnalytics.companies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Company Performance
              </h3>
              <div className="space-y-3">
                {companyAnalytics.companies.slice(0, 5).map((company, idx) => (
                  <CompanyCard key={idx} company={company} />
                ))}
              </div>
              {companyAnalytics.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best: <span className="font-semibold text-gray-900 dark:text-white">{companyAnalytics.summary.bestPerformingCompany}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Role Analytics */}
          {roleAnalytics && roleAnalytics.roles && roleAnalytics.roles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-pink-600" />
                Role Performance
              </h3>
              <div className="space-y-3">
                {roleAnalytics.roles.slice(0, 5).map((role, idx) => (
                  <RoleCard key={idx} role={role} />
                ))}
              </div>
              {roleAnalytics.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best: <span className="font-semibold text-gray-900 dark:text-white">{roleAnalytics.summary.bestPerformingRole}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Performance Trends */}
        {dashboard && Object.keys(dashboard.performanceTrend || {}).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <LineChart className="w-6 h-6 text-green-600" />
              Performance Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(dashboard.performanceTrend).map(([roundType, scores]) => (
                scores.length > 0 && (
                  <TrendCard key={roundType} roundType={roundType} scores={scores} />
                )
              ))}
            </div>
          </div>
        )}

        {/* Recent Interviews */}
        {dashboard?.recentInterviews && dashboard.recentInterviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Recent Interviews
            </h3>
            <div className="space-y-4">
              {dashboard.recentInterviews.map((interview) => (
                <RecentInterviewCard key={interview.sessionId} interview={interview} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {performanceStats?.recommendations && performanceStats.recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {performanceStats.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {dashboard && dashboard.summary.totalInterviews === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Interviews Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start your first interview to see comprehensive analytics and track your progress.
            </p>
            <button
              onClick={() => setShowInterviewSelection(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <PlayCircle className="w-5 h-5" />
              Start Your First Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
