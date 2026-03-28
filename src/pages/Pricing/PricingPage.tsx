'use client';
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  CheckCircle2, X, Zap, Crown, Sparkles,
  ChevronRight, Lock, TrendingUp
} from "lucide-react";
import { usePricing } from "@/contexts/PricingContext";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO/SEO";
import { PayAsYouGoCard } from "@/components/pricing/PayAsYouGoCard";

/* ── helpers ─────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CARD_ACCENTS = [
  { from: "#2563eb", to: "#4f46e5" },
  { from: "#1d4ed8", to: "#4338ca" },
  { from: "#3b82f6", to: "#818cf8" },
  { from: "#2563eb", to: "#6366f1" },
];

/* ══════════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const { pricingPlans, loading, error } = usePricing();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleSubscribe = () => {
    if (!user) {
      sessionStorage.setItem("postSignupAction", "pricing");
      navigate("/signup");
    } else {
      navigate("/dashboard?openPricing=1");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">      <SEO 
        title="Pricing Plans - AI for Job"
        description="Choose the perfect plan for your interview preparation. Flexible pricing options for AI-powered mock interviews, resume analysis, and career development tools. Start free today!"
        keywords="interview preparation pricing, Ai for job cost, mock interview plans, resume analysis pricing, career development subscription"
        url="https://aiforjob.ai/pricing"
      />
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 -top-40 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[160px]" />
          <div className="absolute right-[-80px] top-[100px] h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold tracking-wide">PRICING</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Pay for what you need.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Nothing more.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed"
          >
            Start free — no time limit, no credit card. When you're ready for more mock interviews,
            deeper resume feedback, or detailed analytics, upgrading takes about 30 seconds.
          </motion.p>

          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 rounded-xl px-5 py-3 text-sm font-medium"
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              No card needed to get started. You can upgrade anytime from your dashboard.
            </motion.div>
          )}
        </div>
      </section>

      {/* ── PLAN CARDS ───────────────────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {error ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <X className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Something went wrong loading the plans. Sorry about that.</p>
              <button onClick={() => window.location.reload()} className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[520px] rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 ${pricingPlans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" :
              pricingPlans.length === 3 ? "md:grid-cols-3" :
                "md:grid-cols-2 lg:grid-cols-4"
              }`}>
              {pricingPlans.map((plan, i) => {
                const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
                const isFree = plan.numericPrice === 0;
                const isPopular = plan.popular;
                const isHovered = hovered === plan.id;

                return (
                  <Reveal key={plan.id} delay={i * 0.08}>
                    <motion.div
                      onHoverStart={() => setHovered(plan.id)}
                      onHoverEnd={() => setHovered(null)}
                      animate={{ y: isHovered ? -5 : 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`relative flex flex-col rounded-2xl overflow-hidden border h-full transition-shadow duration-300
                        ${isPopular
                          ? "border-blue-400/60 dark:border-blue-500/50 shadow-xl shadow-blue-500/10"
                          : "border-slate-200 dark:border-slate-800 shadow-md shadow-slate-900/5"}
                        bg-white dark:bg-slate-900`}
                    >
                      {/* top accent bar */}
                      <div
                        className="h-1 w-full flex-shrink-0"
                        style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
                      />

                      {/* popular badge */}
                      {isPopular && (
                        <div
                          className="absolute top-0 right-5 px-3 py-1 rounded-b-lg text-xs font-bold text-white tracking-widest flex items-center gap-1"
                          style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
                        >
                          <TrendingUp className="w-3 h-3" /> MOST PICKED
                        </div>
                      )}

                      <div className="p-7 flex flex-col flex-grow">
                        {/* plan name + description */}
                        <div className="flex items-center gap-3 mb-5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
                          >
                            {plan.icon}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{plan.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{plan.description}</p>
                          </div>
                        </div>

                        {/* price */}
                        <div className="mb-5">
                          <div className="flex items-end gap-1">
                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
                              {isFree ? "Free" : plan.price}
                            </span>
                            {!isFree && <span className="text-slate-400 dark:text-slate-500 text-sm mb-0.5">/ month</span>}
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {isFree ? "No card, no catch" : "+18% GST · Cancel whenever you like"}
                          </p>
                        </div>

                        {/* CTA button */}
                        <button
                          onClick={() => isFree ? navigate("/signup") : handleSubscribe()}
                          className={`w-full flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-all duration-200 mb-6 ${isFree
                            ? "border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                            : "text-white hover:opacity-90"
                            }`}
                          style={!isFree ? {
                            background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                            boxShadow: `0 6px 20px -4px ${accent.from}66`
                          } : {}}
                        >
                          {isFree ? (
                            <><Zap className="w-4 h-4" /> Start for free</>
                          ) : user ? (
                            <><Crown className="w-4 h-4" /> Upgrade now</>
                          ) : (
                            <><Lock className="w-4 h-4" /> Sign up to subscribe</>
                          )}
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>

                        {/* feature list */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex-grow">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                            What you get
                          </p>
                          <ul className="space-y-2.5">
                            {plan.features.map((f, j) => (
                              <li key={j} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle2
                                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                                  style={{ color: accent.from }}
                                />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* sign-up nudge for guests */}
                        {!user && !isFree && (
                          <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              <button onClick={() => navigate("/signup")} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                Create a free account first
                              </button>{" "}— then subscribe in seconds
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── PAY-AS-YOU-GO SECTION */}
      <section className="pb-24 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto pt-16">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-4">
              <Zap className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold tracking-wide">FLEXIBLE OPTION</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              No plan fits? Build your own.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Set a monthly budget, get interview and resume credits calculated automatically.
              Your budget auto-renews each month — change it any time.
            </p>
          </Reveal>
          <div className="max-w-md mx-auto">
            <Reveal delay={0.1}>
              <PayAsYouGoCard />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}