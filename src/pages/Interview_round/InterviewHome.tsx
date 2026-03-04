import React, { useState, useMemo } from "react";
import {
  ArrowRight,
  Code,
  Users,
  Lightbulb,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InterviewAnalyticsDashboard from "./InterviewAnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePricing } from "@/contexts/PricingContext";
import { useResults } from "@/contexts/ResultsContext";

type InterviewCardProps = {
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  navigate: ReturnType<typeof useNavigate>;
  isAtLimit: boolean;
  onLimitExceeded: () => void;
};

function InterviewCard({ type, description, icon, color, navigate, isAtLimit, onLimitExceeded }: InterviewCardProps) {
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
          onClick={() => isAtLimit ? onLimitExceeded() : navigate(`/interview/start/${type.toLowerCase()}`)}
          className={`mt-8 w-full flex items-center justify-center gap-2 border px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm group-hover:border-gray-300 dark:group-hover:border-gray-600 ${isAtLimit
            ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          {isAtLimit ? 'Limit Reached' : 'Start Interview'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


export default function InterviewHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setShowPricing } = usePricing();
  const { results, fetchMine } = useResults();
  const [showInterviewSelection, setShowInterviewSelection] = useState(false);

  React.useEffect(() => {
    fetchMine();
  }, []);

  const interviewLimit = useMemo(() => {
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const limitFeature = user.subscriptionPlan.features.find(f => f.name.toLowerCase().includes('interview limit'));
      if (limitFeature && typeof limitFeature.value === 'number') {
        return limitFeature.value;
      }
    }
    return user?.subscriptionStatus === 'active' ? 10 : 5;
  }, [user]);

  const currentInterviews = results?.length || 0;
  const isAtLimit = currentInterviews >= interviewLimit;

  const handleLimitExceeded = () => {
    setShowPricing(true);
  };

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
              <InterviewCard
                key={round.type}
                type={round.type}
                description={round.description}
                icon={round.icon}
                color={round.color}
                navigate={navigate}
                isAtLimit={isAtLimit}
                onLimitExceeded={handleLimitExceeded}
              />
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
      <InterviewAnalyticsDashboard onStartNew={() => setShowInterviewSelection(true)} />
    </div>
  );
}

