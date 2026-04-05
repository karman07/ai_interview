import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Brain, Target, Zap, Mic, FileText, Briefcase,
  CheckCircle2, Sparkles, ArrowRight, MessageSquare, Star,
  BarChart3, Clock, Shield, TrendingUp, Users, Award, Play,
  Code2, Layers, BookOpen, Bot, ChevronDown, Cpu, GitBranch,
  Lightbulb, Flame, Trophy, Lock
} from "lucide-react";
import Button from "../components/ui/button";
import SEO from "@/components/SEO/SEO";
import StructuredData from "@/components/SEO/StructuredData";
import { structuredData } from "@/utils/seo";

/* ── Typewriter hook ───────────────────────────────────────────────── */
function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting
      ? Math.max(30, speed / 2.5)
      : charIdx === current.length ? pause : speed;

    const t = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setWordIdx(w => (w + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ── Counter animation ─────────────────────────────────────────────── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / 60;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Reveal wrapper ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated dot-grid canvas background ──────────────────────────── */
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { mouse = { x: -9999, y: -9999 }; });

    const GAP = 32;
    const R = 1.5;
    const INTERACT = 100;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / GAP) + 1;
      const rows = Math.ceil(canvas.height / GAP) + 1;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * GAP;
          const y = r * GAP;
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / INTERACT);
          const alpha = 0.12 + t * 0.55;
          const radius = R + t * 2.5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99,130,255,${alpha})`;
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ pointerEvents: "all" }}
    />
  );
}

/* ── Floating score card illustration ─────────────────────────────── */
function ScoreIllustration() {
  const bars = [
    { label: "Communication", pct: 82, color: "#3b82f6", glow: "shadow-blue-400/40" },
    { label: "Depth",         pct: 74, color: "#6366f1", glow: "shadow-indigo-400/40" },
    { label: "Structure",     pct: 91, color: "#10b981", glow: "shadow-emerald-400/40" },
    { label: "Confidence",    pct: 68, color: "#f59e0b", glow: "shadow-amber-400/40" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[340px] mx-auto lg:mx-0"
    >
      {/* Main card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-blue-500/15 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden relative z-10">

        {/* Card header band */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-blue-50/60 dark:from-slate-800/80 dark:to-blue-900/20 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-none mb-0.5">Mock Interview · Round 2</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">System Design — Backend</p>
          </div>
          <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        <div className="p-5">
          {/* Score ring + grade */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-[88px] h-[88px] flex-shrink-0">
              {/* outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md scale-110" />
              <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90 relative">
                <circle cx="44" cy="44" r="36" fill="none" stroke="#e2e8f0" strokeWidth="7" className="dark:stroke-slate-700/80" />
                <motion.circle
                  cx="44" cy="44" r="36" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - 0.81) }}
                  transition={{ duration: 1.4, delay: 0.9, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">81</span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Score</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-2xl font-black text-slate-900 dark:text-white">Good</p>
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md">↑ 8 pts</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">Better than <span className="font-bold text-slate-600 dark:text-slate-300">74%</span> of users</p>
            </div>
          </div>

          {/* Bars */}
          <div className="space-y-3 mb-5">
            {bars.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{b.label}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{b.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${b.color}cc, ${b.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ duration: 1, delay: 0.8 + i * 0.12, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI Feedback */}
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/40 flex gap-2.5">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">AI Feedback: </span>Strong depth on caching layers. Try adding failure mode analysis to push Structure above 90.
            </p>
          </div>
        </div>
      </div>

      {/* Floating top-right badge */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute -top-5 -right-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl shadow-slate-200/80 dark:shadow-black/30 px-3.5 py-2 flex items-center gap-2 z-20"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">Top 26%</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">this week</p>
        </div>
      </motion.div>

      {/* Floating bottom-left streak badge */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl shadow-slate-200/80 dark:shadow-black/30 px-3.5 py-2 flex items-center gap-2 z-20"
      >
        <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">7-day streak</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Keep it up 🔥</p>
        </div>
      </motion.div>

      {/* glow behind card */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-2xl -z-10 scale-110" />
    </motion.div>
  );
}

/* ══════════════════════ HERO ══════════════════════════════════════════ */
const ROLES = ["Frontend Developer", "Backend Engineer", "Product Manager", "Data Scientist", "DevOps Engineer", "Full Stack Dev"];

const HeroSection = ({ onStart, onResume }: { onStart: () => void; onResume: () => void }) => {
  const typed = useTypewriter(ROLES, 75, 2000);

  return (
    <section className="relative pt-28 pb-16 overflow-hidden bg-white dark:bg-slate-950 min-h-[92vh] flex items-center">
      {/* Dot grid — canvas layer */}
      <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
        <DotGrid />
      </div>

      {/* Glow blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-[-60px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[140px]" />
        <div className="absolute right-[-80px] top-[180px] h-[360px] w-[360px] rounded-full bg-indigo-500/15 blur-[110px]" />
        <div className="absolute left-[-60px] bottom-[60px] h-[260px] w-[260px] rounded-full bg-cyan-500/10 blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 mb-7 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-500" />
              <span className="text-sm font-semibold tracking-wide">AI-POWERED INTERVIEW PREP</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-slate-50 leading-[1.06] tracking-tight">
                Land your role as a
              </h1>
              {/* Fixed-height typed line — never causes layout shift */}
              <div
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight overflow-hidden"
                style={{ height: "1.06em" }}
              >
                <span className="block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-300">
                  {typed || "\u00a0"}<span className="inline-block w-[3px] h-[0.85em] bg-blue-600 dark:bg-blue-400 align-middle ml-0.5 animate-caret-blink" />
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg text-slate-600 dark:text-slate-400 mb-9 leading-relaxed max-w-xl"
            >
              Stop guessing what interviewers want. Practice with real questions, get honest AI feedback, improve your ATS score, and walk in with actual confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-9"
            >
              <Button variant="primary" className="px-8 py-4 text-base font-semibold shadow-lg shadow-blue-500/25" onClick={onStart}>
                Start Practicing Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="px-8 py-4 text-base font-semibold" onClick={onResume}>
                <FileText className="w-4 h-4 mr-2" />
                Check Resume Score
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-5 flex-wrap"
            >
              <div className="flex -space-x-2">
                {[
                  { url: "/images/karman.png", name: "Karman" },
                  { url: "/images/rahat.png", name: "Rahat" },
                  { url: "/images/advitya.png", name: "Advitya" },
                ].map((p, i) => (
                  <img key={i} src={p.url} alt={p.name} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-950 object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">4.6 · Trusted by 1,000+ candidates</span>
              </div>
            </motion.div>
          </div>

          {/* Right — CSS illustration */}
          <div className="hidden lg:flex justify-center items-center px-8">
            <ScoreIllustration />
          </div>
        </div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-14 flex justify-center"
        >
          <a href="#how-it-works" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600 hover:text-blue-500 transition-colors">
            <span className="text-xs font-medium">See how it works</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

/* ══════════════════════ MARQUEE STRIP ════════════════════════════════ */
const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Flipkart", "Infosys",
  "Atlassian", "Razorpay", "Swiggy", "Zomato", "Paytm", "PhonePe",
  "Salesforce", "Adobe", "Stripe", "Notion",
];

function MarqueeStrip() {
  const doubled = [...COMPANIES, ...COMPANIES];
  return (
    <div className="py-5 border-y border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 overflow-hidden">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600 mb-3">
        Used by candidates targeting
      </p>
      <div className="relative">
        {/* fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none" />
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
          className="flex items-center gap-10 whitespace-nowrap"
        >
          {doubled.map((c, i) => (
            <span key={i} className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-default select-none">
              {c}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════ STATS ═════════════════════════════════════════ */
const StatsSection = () => (
  <section className="py-14 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
    <div className="max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
        {[
          { label: "Resumes Analyzed",       target: 300, suffix: "+",  icon: <FileText className="w-4 h-4" /> },
          { label: "Mock Interviews Done",   target: 100, suffix: "+",  icon: <Mic className="w-4 h-4" /> },
          { label: "Offer Rate Improvement", target: 68,  suffix: "%",  icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Countries Reached",      target: 12,  suffix: "+",  icon: <Users className="w-4 h-4" /> },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="flex flex-col items-center text-center px-6 py-2 first:pl-0 last:pr-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-3">
              {s.icon}
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1 tabular-nums">
              <CountUp target={s.target} suffix={s.suffix} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-snug">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════ HOW IT WORKS ══════════════════════════════════ */
const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950">
    <div className="max-w-7xl mx-auto px-6">
      <Reveal className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          From Average to Market-Ready in Just 3 Steps
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          A clear path from "I don't know where to start" to feeling confident when you go to interviews.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent" />
        {[
          {
            step: "01", icon: <Brain className="w-7 h-7" />, title: "Diagnose your weak spots",
            desc: "Do a quick diagnostic interview. Our AI quickly finds out if you have trouble with technical depth, communication structure, or behavioral framing, so you don't spend time on things you already know.",
            badge: "~10 min",
          },
          {
            step: "02", icon: <Mic className="w-7 h-7" />, title: "Practice with targeted feedback",
            desc: "Answer actual interview questions, either by voice or text. You get a score, a discussion of what worked and what didn't, and a new example of a better answer after each one.",
            badge: "Daily reps",
          },
          {
            step: "03", icon: <Award className="w-7 h-7" />, title: "Walk in confident",
            desc: "Keep an eye on your progress from week to week. As you grow better, your communication score, ATS rating, and mock interviews will all get harder.",
            badge: "Measurable",
          },
        ].map((item, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-400/50 dark:hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 h-full">
              <div className="absolute -top-4 left-8 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest">
                {item.step}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5 mt-2">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-5 text-justify">{item.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" /> {item.badge}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════ FEATURES ══════════════════════════════════════ */
const FeaturesSection = ({ navigate }: { navigate: (p: string) => void }) => {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />, badge: "Core",
      title: "Ai for job",
      desc: "Practice rounds for behavioral (STAR format), technical, DSA, and system design. Our algorithm listens to your answer and gives it a score based on how clear, deep, and well-structured it is. Then it shows you exactly what a strong answer looks like.",
      cta: "Start Practicing", link: "/interview_round",
      bullets: ["Voice + text responses", "Real-time scoring", "Rewritten model answers"],
    },
    {
      icon: <FileText className="w-6 h-6" />, badge: "Résumé",
      title: "ATS Resume Scanner",
      desc: "Upload your resume and see it the way that recruiters' software does. Get a keyword match score against real job descriptions, a readability score, and exact line-by-line edit suggestions instead of simply generic tips.",
      cta: "Scan my resume", link: "/dashboard",
      bullets: ["ATS keyword gap analysis", "Bullet impact scoring", "JD match percentage"],
    },
    {
      icon: <BookOpen className="w-6 h-6" />, badge: "Learning",
      title: "Structured Prep Tracks",
      desc: "Lessons in DSA, System Design, OS, DBMS, and behavioral prep that are small enough to fit in your pocket and are tailored to the jobs you're going for. You can always see what you've studied recently and what you need to study next.",
      cta: "Start Learning", link: "/subjects",
      bullets: ["Role-specific tracks", "Progress milestones", "Spaced repetition"],
    },
    {
      icon: <Briefcase className="w-6 h-6" />, badge: "Jobs",
      title: "Smart Job Discovery",
      desc: "Look through roles that are filtered by your skill level and prep score. Before you apply, find out what your genuine match percentage is. No more applying for jobs you can't obtain. Instead, focus on jobs you can get.",
      cta: "Browse Jobs", link: "/jobs",
      bullets: ["Match % scoring", "Skills gap view", "Direct apply links"],
    },
    {
      icon: <Bot className="w-6 h-6" />, badge: "AI",
      title: "Question Bank with Context",
      desc: "There are more than 800 interview questions from corporations like Google, Amazon, Flipkart, and new businesses. Each question has a purpose (what the interviewer is really looking for), things to watch out for, and two or three good sample answers.",
      cta: "Explore questions", link: "/interview_round",
      bullets: ["Company-specific sets", "Interviewer intent notes", "Common red flags"],
    },
    {
      icon: <BarChart3 className="w-6 h-6" />, badge: "Analytics",
      title: "Prep Analytics Dashboard",
      desc: "Keep track of how much better you're getting. You can see how your mock interview score has changed over the previous 30 days, how much time you've spent on each topic, and when you could be ready to start looking for a job based on your current pace.",
      cta: "View dashboard", link: "/dashboard",
      bullets: ["Score trend graphs", "Time-per-topic logs", "Readiness forecast"],
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Every Tool You Actually Need
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Built specifically for software engineers and tech professionals in Indian and global job markets.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col h-full hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{f.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-grow">{f.desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate(f.link)} className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {f.cta}
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════ LIVE DEMO MOCKUP ═════════════════════════════ */
const DEMO_MESSAGES = [
  { from: "ai",   text: "Tell me about a time you had to debug a critical production issue under pressure." },
  { from: "user", text: "Sure — at my last internship, our payment service went down on a Friday evening right before a sale event..." },
  { from: "ai",   text: "Good start. You set the context and stakes clearly. Work on adding what your specific role was in the debugging process." },
  { from: "user", text: "Got it. I was the on-call engineer. I isolated it to a race condition in the queue processor within 20 minutes." },
  { from: "ai",   text: "Much better. Score: 79 → 91. Strong ownership + technical precision. Add the business outcome next." },
];

function LiveDemoSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const show = () => {
      i++;
      setVisible(i);
      if (i < DEMO_MESSAGES.length) setTimeout(show, 900 + i * 120);
    };
    setTimeout(show, 400);
  }, [inView]);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/40 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left copy */}
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
              Feedback that's brutally honest,<br />not just politely useless
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
              Every answer you give gets scored, dissected, and improved in real time. Not a generic rubric — actual sentence-level analysis.
            </p>
            <ul className="space-y-3">
              {[
                { icon: <Zap className="w-4 h-4" />, text: "Answer scored on 5 dimensions in under 3 seconds" },
                { icon: <Lightbulb className="w-4 h-4" />, text: "Model answer shown so you know exactly what 'great' looks like" },
                { icon: <TrendingUp className="w-4 h-4" />, text: "Score improves visibly as you apply the feedback" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Right — chat window */}
          <div className="relative">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-semibold text-slate-400 dark:text-slate-500">AI Interview — Behavioral Round</span>
                <span className="ml-auto text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[320px]">
                <AnimatePresence>
                  {DEMO_MESSAGES.slice(0, visible).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
                        msg.from === "ai"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}>
                        {msg.from === "ai" ? <Bot className="w-3.5 h-3.5" /> : "U"}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.from === "ai"
                          ? "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm"
                          : "bg-blue-600 text-white rounded-tr-sm"
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {visible < DEMO_MESSAGES.length && visible > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map(j => (
                        <motion.span key={j} className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay: j * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Score bar at bottom */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Answer Score</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: visible >= DEMO_MESSAGES.length ? "91%" : `${Math.min(30 + visible * 12, 79)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <motion.span
                  className="text-xs font-black text-blue-600 dark:text-blue-400 tabular-nums w-8 text-right"
                  animate={{ opacity: [0.6, 1] }}
                >
                  {visible >= DEMO_MESSAGES.length ? "91" : Math.min(30 + visible * 12, 79)}
                </motion.span>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute -top-5 -right-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Score improved +12 pts</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════ TESTIMONIALS ══════════════════════════════════ */
const testimonials = [
  {
    name: "Karman Singh", role: "Software Engineer at Intellinum", avatar: "K",
    img: "/images/karman.png",
    text: "The practice sessions felt too real, but in a good way. You can't get away with unclear responses. The input on my system design showed me exactly where I was being vague, which is exactly what you need before the actual thing. I passed the design round on my next try.",
    stars: 5,
  },
  {
    name: "Rahat Bhatia", role: "Student at UCSD", avatar: "R",
    img: "/images/rahat.png",
    text: "I wasn't receiving any calls back on my resume until I ran it through the ATS analyzer. The keyword gap report said that 38% of the roles I was interested in matched. Interviews started rolling in within two weeks of following the advice. That and mock prep cemented the deal.",
    stars: 5,
  },
  {
    name: "Advitya", role: "Software Developer at Ryntra Tech", avatar: "A",
    img: "/images/advitya.png",
    text: "The question bank really does have a lot of questions. It covers things that other platforms don't, like designing ML systems, asking stats-based questions, and preparing for take-home walkthroughs. The intent context for each question helps you figure out what the interviewer is really looking for.",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  const [start, setStart] = useState(0);
  const visible = 3;

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            What Candidates Actually Say
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            The kind of feedback you would give a friend who inquired if it was worth it.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(start, start + visible).map((t, i) => (
            <Reveal key={start + i} delay={i * 0.08}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col h-full">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-grow mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                  {(t as any).img ? (
                    <img src={(t as any).img} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.avatar}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: testimonials.length - visible + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStart(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === start ? "w-8 bg-blue-600" : "w-2 bg-slate-300 dark:bg-slate-700"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════ COMPARISON ════════════════════════════════════ */
const ComparisonSection = () => (
  <section className="relative py-28 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
    {/* Subtle background blobs */}
    <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-3xl" />

    <div className="relative max-w-5xl mx-auto px-6">
      <Reveal className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          The Old Way vs. The Right Way
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Most candidates prep on vibes. The ones who get offers prep with data.
        </p>
      </Reveal>

      <div className="relative grid md:grid-cols-2 gap-6 items-stretch">
        {/* VS badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg items-center justify-center text-[11px] font-black text-slate-400 dark:text-slate-500">
          VS
        </div>

        <Reveal delay={0}>
          <div className="h-full relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm">
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-700/80" />
            <div className="p-8 flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Without AI for Job</p>
                <h3 className="font-extrabold text-xl text-slate-700 dark:text-slate-300">
                  Guessing your way through
                </h3>
              </div>
              <ul className="space-y-3.5 flex-1">
                {[
                  "Mock interviews with a friend who is too nice to tell you you're rambling",
                  "Reading Leetcode solutions without actually practicing the communication part",
                  "Sending your resume to 40 companies and wondering why you only get 2 replies",
                  "Not knowing if your answer was good until you get a rejection email a week later",
                  "Starting prep 3 days before the interview every single time",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">✕</span>
                    <span className="line-through decoration-slate-300 dark:decoration-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="h-full relative rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-700/50 bg-white dark:bg-slate-900 shadow-md shadow-blue-100/60 dark:shadow-blue-900/20">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-8 flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1.5">With AI for Job</p>
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">
                  Knowing exactly where you stand
                </h3>
              </div>
              <ul className="space-y-3.5 flex-1">
                {[
                  "Brutally honest feedback after every answer—what worked, what didn't, and what to say instead",
                  "ATS score for your resume in 30 seconds with specific gap analysis by job role",
                  "Know your realistic match % before applying—stop wasting applications",
                  "See your score go up every week so you know when you're really ready",
                  "Structured daily prep that takes 30–45 minutes and builds up over time",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40">
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">68% of our users report getting an interview within 3 weeks.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ══════════════════════ FAQ ═══════════════════════════════════════════ */
const faqs = [
  { q: "Is this only for software engineers?", a: "No, we started with SWE, but the platform now has roles in Product Management, Data Science, DevOps, and general tech. The interview question bank, the prep tracks, and the resume analyzer all change based on the job you're going for." },
  { q: "How is the feedback different from just watching YouTube?", a: "No matter what your responses are, YouTube provides you the same general advice. Our AI scans your response, gives it a score on five different things, and then informs you exactly what you said that was weak. It's like seeing someone work out vs. having a trainer observe you." },
  { q: "My English isn't great — will this help or just judge me?", a: "It works. The platform gives different rankings for language polish and communication clarity and organization. We deal with a lot of people who speak English as a second language, and the feedback is meant to help you improve the structure and impact of your responses, not simply your grammar." },
  { q: "Can I use this on my phone?", a: "Yes. The platform works on all devices. You can use your phone's microphone for the mock interview feature. A lot of individuals practice on the way to work." },
  { q: "What if I'm a fresher with no industry experience?", a: "Most of our users are new students. There are specialized paths on the platform for campus placements, internship interviews, and jobs for new graduates who aren't on campus. You don't need to have worked before to practice; you need to practice to obtain job experience." },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Common Questions</h2>
          <p className="text-slate-500 dark:text-slate-400">The things people actually want to know before signing up.</p>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">{faq.q}</span>
                  <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════ FINAL CTA ════════════════════════════════════ */
const FinalCTA = ({ onStart }: { onStart: () => void }) => (
  <section className="py-24 bg-white dark:bg-slate-950">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <Reveal>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10">
            <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-5" />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Your next interview is already decided.<br />
              <span className="text-blue-200">Change the outcome.</span>
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              You can start for free. It takes 10 minutes to find out exactly where you are.
              One mock interview is all it takes to get hooked.
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-3 bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg shadow-xl"
            >
              <Zap className="w-5 h-5" />
              Start for Free — No Card Needed
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-blue-200/70 text-sm mt-4 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> It just takes 2 minutes to sign up. No Credit Card Required.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════ MAIN ══════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <SEO 
        title="AI for Job | AI-Powered Interview Practice Platform"
        description="Master your job interviews with AI-powered mock interviews, resume analysis, and personalized feedback. Practice coding, behavioral, and technical interviews with real-time AI assistance."
        keywords="Ai for job practice, mock interview, resume analysis, coding interview, technical interview, behavioral interview, job preparation, career development"
        url="https://aiforjob.ai"
      />
      <StructuredData data={structuredData.organization} />
      <StructuredData data={structuredData.website} />
      <StructuredData data={structuredData.service} />
      
      <main>
        <HeroSection onStart={() => navigate("/signup")} onResume={() => navigate("/dashboard")} />
        <MarqueeStrip />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection navigate={navigate} />
        <LiveDemoSection />
        <TestimonialsSection />
        <ComparisonSection />
        <FAQSection />
        <FinalCTA onStart={() => navigate("/signup")} />
      </main>
    </div>
  );
};

export default Home;