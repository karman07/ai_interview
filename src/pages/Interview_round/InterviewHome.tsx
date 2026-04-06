import React, { useState, useMemo } from "react";
import {
  ArrowRight,
  Code,
  Users,
  Lightbulb,
  MessageCircle,
  Building2,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InterviewAnalyticsDashboard from "./InterviewAnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePricing } from "@/contexts/PricingContext";
import { useResults } from "@/contexts/ResultsContext";
import { InterviewAnalyticsApi } from "@/api/interviewAnalytics";
import http, { baseURL } from "@/api/http";

type InterviewCardProps = {
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  routeKey?: string;
  ctaLabel?: string;
  navigate: (path: string) => void | Promise<void>;
  isAtLimit: boolean;
  onLimitExceeded: () => void;
  tags?: string[];
  isFeatured?: boolean;
  isPremium?: boolean;
  isEndToEnd?: boolean;
};

function InterviewCard({ 
  type, 
  description, 
  icon, 
  color, 
  routeKey,
  ctaLabel,
  navigate, 
  isAtLimit, 
  onLimitExceeded, 
  tags, 
  isFeatured, 
  isPremium,
  isEndToEnd
}: InterviewCardProps) {
  const getBGColor = (gradientClass: string) => {
    if (gradientClass.includes('indigo')) return 'bg-indigo-50 dark:bg-indigo-900/20';
    return 'bg-blue-50 dark:bg-blue-900/20';
  };

  const getTextColor = (gradientClass: string) => {
    if (gradientClass.includes('indigo')) return 'text-indigo-600 dark:text-indigo-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const bgColor = getBGColor(color);
  const textColor = getTextColor(color);

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full text-left">
      <div className="p-8 flex flex-col h-full">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
        >
          <div className={textColor}>
            {React.isValidElement(icon) && (icon.type === 'svg' || (icon.type as any)?.displayName?.includes('Icon'))
              ? React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })
              : <div className="w-10 h-10 flex items-center justify-center">{icon}</div>
            }
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {type.includes("Round") ? type : `${type} Round`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm line-clamp-3">
            {description}
          </p>
          
          {isFeatured && (
            <div className="absolute top-4 right-4 animate-pulse">
               <span className="px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg border border-yellow-200">
                ★ Featured
               </span>
            </div>
          )}
          {isPremium && !isFeatured && (
            <div className="absolute top-4 right-4">
               <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg border border-purple-400">
                ◆ Premium
               </span>
            </div>
          )}

          {isEndToEnd && (
            <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-right-2 duration-500">
               <span className="px-2.5 py-1 bg-green-500 text-white text-[8px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg border border-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                End-To-End
               </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={() => isAtLimit ? onLimitExceeded() : navigate(`/interview/start/${routeKey || type.toLowerCase()}`)}
          className={`mt-8 w-full flex items-center justify-center gap-2 border px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm group-hover:border-gray-300 dark:group-hover:border-gray-600 ${isAtLimit
            ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          {isAtLimit ? 'Limit Reached' : (ctaLabel || 'Start Session')}
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
  const [analytics, setAnalytics] = useState<any>(null);
  const [universityInterviewLimit, setUniversityInterviewLimit] = useState<number | null>(null);
  const [specializedTopics, setSpecializedTopics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  React.useEffect(() => {
    fetchMine();
    InterviewAnalyticsApi.getAnalytics().then(setAnalytics).catch(console.error);
    
    // Fetch specialized company rounds
    http.get('/company-rounds')
      .then(res => {
        const mapped = (res.data || []).map((item: any) => ({
          ...item,
          // Backward-compatible shape for existing UI rendering.
          name: item.company || item.name,
        }));
        setSpecializedTopics(mapped);
      })
      .catch(console.warn);

    if ((user as any)?.role === 'student' && (user as any)?.universityId) {
      import('@/api/http').then(({ default: http }) => {
        http.get(`/universities/${(user as any).universityId}`)
          .then(res => setUniversityInterviewLimit(res.data?.interviewLimit ?? null))
          .catch(() => {});
      });
    }
  }, []);

  const interviewLimit = useMemo(() => {
    // Students: always use their university's configured limit (dynamic)
    if ((user as any)?.role === 'student') {
      return universityInterviewLimit ?? 20;
    }

    // PAYG users: use paygInterviewsLimit
    const isPayg = (user?.subscriptionPlan as any)?.type === 'pay_as_you_go'
      || typeof user?.paygInterviewsLimit === 'number';
    if (isPayg && typeof user?.paygInterviewsLimit === 'number') {
      return user.paygInterviewsLimit;
    }

    // ✅ Use the limit stamped directly on the user at purchase time
    if (typeof user?.interviewLimit === 'number' && user.interviewLimit > 0) {
      return user.interviewLimit;
    }

    // Fallback: analytics plan features
    if (analytics?.plan?.features) {
      const limitFeature = analytics.plan.features.find((f: any) =>
        f.name.toLowerCase().includes('interview limit')
      );
      if (limitFeature && typeof (limitFeature.value ?? limitFeature.limit) === 'number') {
        return limitFeature.value ?? limitFeature.limit;
      }
    }

    // Fallback: subscriptionPlan object features
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const limitFeature = user.subscriptionPlan.features.find(f => f.name.toLowerCase().includes('interview limit'));
      if (limitFeature && typeof limitFeature.value === 'number') {
        return limitFeature.value;
      }
    }

    // Absolute default: 3 free / 10 paid
    return user?.subscriptionStatus === 'active' ? 10 : 3;
  }, [user, analytics, universityInterviewLimit]);

  // For PAYG track used from user directly; for regular track from analytics/results
  const isPaygUser = (user?.subscriptionPlan as any)?.type === 'pay_as_you_go';
  const currentInterviews = isPaygUser
    ? (user?.paygInterviewsUsed ?? 0)
    : (user?.interviewCount ?? analytics?.overall?.monthlyInterviews ?? analytics?.overall?.totalInterviews ?? results?.length ?? 0);
  const isAtLimit = currentInterviews >= interviewLimit;

  const handleLimitExceeded = () => {
    // Students cannot upgrade — their limit is set by their university admin
    if ((user as any)?.role !== 'student') {
      setShowPricing(true);
    }
  };

  const filteredTopics = useMemo(() => {
    return specializedTopics.filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (topic.description && topic.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeFilter === "All") return matchesSearch;
      if (activeFilter === "Featured") return matchesSearch && topic.tags?.includes("Featured");
      if (activeFilter === "Premium") return matchesSearch && topic.tags?.includes("Premium");
      
      return matchesSearch && topic.tags?.includes(activeFilter);
    });
  }, [specializedTopics, searchQuery, activeFilter]);

  const allTags = useMemo(() => {
    const tags = new Set<string>(["All", "Featured", "Premium"]);
    specializedTopics.forEach(t => {
      if (t.tags) t.tags.forEach((tag: string) => {
        if (tag !== 'Featured' && tag !== 'Premium') tags.add(tag);
      });
    });
    return Array.from(tags);
  }, [specializedTopics]);

  const rounds = [
    {
      type: "Technical",
      description:
        "Demonstrate your coding skills, system design knowledge, and technical expertise with hands-on challenges.",
      icon: <Code className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      key: "technical",
      isEndToEnd: true,
    },
    {
      type: "Behavioral",
      description:
        "Share your experiences and showcase how you align with our company culture and values.",
      icon: <Users className="w-8 h-8" />,
      color: "bg-gradient-to-br from-indigo-500 to-blue-600",
      key: "behavioral",
      isEndToEnd: true,
    },
    {
      type: "Problem",
      description:
        "Tackle complex scenarios and demonstrate your analytical thinking and problem-solving approach.",
      icon: <Lightbulb className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      key: "problemSolving",
      isEndToEnd: true,
    },
    {
      type: "HR",
      description:
        "Final discussion about role expectations, compensation, and next steps in your journey with us.",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "bg-gradient-to-br from-indigo-500 to-blue-600",
      key: "hr",
      isEndToEnd: true,
    },
  ];

  const comingSoonSimulations = [
    {
      id: 'google-swe1',
      title: 'Google SWE-1 Hiring Process',
      description: 'Full-cycle simulation: OA, technical screen, onsite coding + Googliness, and hiring committee style wrap-up.',
      badge: 'Coming Soon',
    },
    {
      id: 'amazon-sde1',
      title: 'Amazon SDE-1 Hiring Process',
      description: 'End-to-end loop with OA, LP-focused behavioral checks, and bar-raiser style technical depth.',
      badge: 'Coming Soon',
    },
    {
      id: 'microsoft-swe',
      title: 'Microsoft SWE Hiring Process',
      description: 'Structured pipeline simulation with coding, system design for level, and collaboration evaluation.',
      badge: 'Coming Soon',
    },
    {
      id: 'meta-e3',
      title: 'Meta E3 Interview Simulation',
      description: 'Signal-driven interview flow covering DSA rounds, product thinking, and communication under pressure.',
      badge: 'Coming Soon',
    },
  ];

  const filteredRounds = useMemo(() => {
    return rounds.filter(round => {
      const matchesSearch = round.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          round.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // If any tag filter (besides "All") or specialized search is active, we mostly hide generic rounds 
      // unless they explicitly match the search term.
      if (activeFilter !== "All") {
        return matchesSearch && searchQuery.length > 0;
      }
      return matchesSearch;
    });
  }, [rounds, searchQuery, activeFilter]);

  const showComingSoonSection = searchQuery.trim().length === 0 && activeFilter === "All";

  if (showInterviewSelection) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header section */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <button
              onClick={() => setShowInterviewSelection(false)}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-full text-sm font-medium mb-4 shadow-lg">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                Interview Process
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Choose Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
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

        {/* Global Search and Filter */}
        <div className="max-w-7xl mx-auto px-6 -mt-8">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-4 top-1/2 -transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                    type="text"
                    placeholder="Search by company or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                 />
              </div>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar px-2">
                 {allTags.map(tag => {
                    const isActive = activeFilter === tag;
                    const isPremium = tag === "Premium";
                    const isFeatured = tag === "Featured";
                    
                    let activeStyles = 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20';
                    if (isPremium) activeStyles = 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/20';
                    if (isFeatured) activeStyles = 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20';

                    return (
                      <button
                        key={tag}
                        onClick={() => setActiveFilter(tag)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border h-10 flex items-center justify-center whitespace-nowrap ${
                          isActive 
                            ? activeStyles
                            : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:text-blue-500 shadow-sm'
                        }`}
                      >
                        {isFeatured ? '★ Featured' : isPremium ? '◆ Premium' : tag}
                      </button>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Cards section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {filteredRounds.map((round) => (
              <InterviewCard
                key={round.type}
                type={round.type}
                description={round.description}
                icon={round.icon}
                color={round.color}
                routeKey={round.key}
                navigate={navigate}
                isAtLimit={isAtLimit}
                onLimitExceeded={handleLimitExceeded}
                isEndToEnd={round.isEndToEnd}
              />
            ))}
          </div>

          {filteredTopics.length > 0 && (
            <div className="mt-24 space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Specialized <span className="text-blue-600">Company Rounds</span>
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Simulate real-world interviews for specific top-tier companies.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  Live Study Rounds
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {filteredTopics.map((topic) => (
                  <InterviewCard
                    key={topic._id}
                    type={topic.name}
                    description={topic.description || `Specialized interview round focused on ${topic.name}'s specific hiring patterns and technical standards.`}
                    icon={topic.logoUrl ? (
                      <img 
                        src={`${baseURL}${topic.logoUrl}`} 
                        alt={topic.name} 
                        className="w-12 h-12 object-contain" 
                      />
                    ) : (
                      <Building2 className="w-8 h-8" />
                    )}
                    tags={topic.tags || []}
                    isFeatured={topic.tags?.includes('Featured')}
                    isPremium={topic.tags?.includes('Premium')}
                    color="bg-gradient-to-br from-indigo-500 to-blue-700"
                    navigate={(path) => navigate('/interview/start/technical', { state: { company: topic.name } })}
                    isAtLimit={isAtLimit}
                    onLimitExceeded={handleLimitExceeded}
                  />
                ))}
              </div>
            </div>
          )}

          {showComingSoonSection && (
            <div className={`${filteredTopics.length > 0 ? 'mt-14' : 'mt-24'} space-y-8`}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Full Simulation <span className="text-blue-600">Hiring Processes</span>
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Company-specific end-to-end flows like Google SWE-1 and more are rolling out next.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Coming Soon
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {comingSoonSimulations.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800/60 p-7 shadow-sm"
                  >
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60">
                        {item.badge}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center mb-5">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 min-h-[88px]">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      disabled
                      className="w-full px-4 py-3 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-700/60 text-blue-600 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-900/20 cursor-not-allowed"
                    >
                      Notify Me
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredRounds.length === 0 && filteredTopics.length === 0 && (
            <div className="mt-20 text-center py-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching rounds found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Bottom info */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
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

