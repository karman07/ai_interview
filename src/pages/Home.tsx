import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  ChevronRight, Brain, Target, Zap, Mic, FileText, Briefcase,
  CheckCircle2, Sparkles, ArrowRight, MessageSquare, Star,
  BarChart3, Clock, Shield, TrendingUp, Users, Award, Play,
  Code2, Layers, BookOpen, Bot, ChevronDown
} from "lucide-react";
import Button from "../components/ui/button";

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

/* ══════════════════════ HERO ══════════════════════════════════════════ */
const ROLES = ["Frontend Developer", "Backend Engineer", "Product Manager", "Data Scientist", "DevOps Engineer", "Full Stack Developer"];

const HeroSection = ({ onStart, onResume }: { onStart: () => void; onResume: () => void }) => {
  const typed = useTypewriter(ROLES, 75, 2000);

  return (
    <section className="relative pt-28 pb-20 overflow-hidden bg-white dark:bg-slate-950">
      {/* glow blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-80px] h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-blu  blur-[160px]" />
        <div className="absolute right-[-120px] top-[200px] h-[380px] w-[380px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-[-80px] bottom-[80px] h-[280px] w-[280px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-sm font-semibold tracking-wide">AI-POWERED INTERVIEW PREPARATION</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-slate-50 leading-[1.05] tracking-tight mb-4"
        >
          Land your role as a
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-300">
            {typed}<span className="inline-block w-[3px] h-[0.85em] bg-blue-600 dark:bg-blue-400 align-middle ml-0.5 animate-caret-blink" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Stop trying to guess what interviewers want. You can practice with real-life questions, get fast AI feedback on your answers, improve your resume's ATS score, and go into interviews with true confidence, not just hope.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="primary" className="px-8 py-4 text-base font-semibold w-full sm:w-auto shadow-lg shadow-blue-500/25" onClick={onStart}>
            Practice Now
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="outline" className="px-8 py-4 text-base font-semibold w-full sm:w-auto" onClick={onResume}>
            <FileText className="w-5 h-5 mr-2" />
            Check My Resume Score
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10 flex-wrap"
        >
          <div className="flex -space-x-2">
            {[
              { url: "https://media.licdn.com/dms/image/v2/D5603AQExDIe-7STGWA/profile-displayphoto-scale_400_400/B56ZyFUCf2KgAg-/0/1771763150880?e=1775088000&v=beta&t=yymUWoQVpxkID74wX9x6Exxm0zdoBKWECrThJjaDG80", name: "Karman" },
              { url: "https://media.licdn.com/dms/image/v2/D5635AQFDzXGekpeRgQ/profile-framedphoto-shrink_400_400/B56ZfMjNCUG0Ak-/0/1751483470343?e=1773997200&v=beta&t=Avfj6RzGFoO0xhJbyy_4RVocRAMaGJh9JYkO7HBQnCg", name: "Rahat" },
              { url: "https://media.licdn.com/dms/image/v2/D5603AQHCK_ANQCya4Q/profile-displayphoto-scale_400_400/B56ZyjXnt1HQAg-/0/1772267407833?e=1775088000&v=beta&t=5ZI6FkyIGfMJIKFEPBLdqtfFb9j2odZsQpMOXQQQr_o", name: "Advitya" },
            ].map((p, i) => (
              <img key={i} src={p.url} alt={p.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 object-cover" />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400 font-medium">4.9 · Used by 12,000+ candidates</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex justify-center"
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

/* ══════════════════════ STATS ═════════════════════════════════════════ */
const StatsSection = () => (
  <section className="py-16 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: "Resumes Analyzed", target: 300, suffix: "+", icon: <FileText className="w-5 h-5" /> },
          { label: "Mock Interviews Done", target: 100, suffix: "+", icon: <Mic className="w-5 h-5" /> },
          { label: "Offer Rate Improvement", target: 68, suffix: "%", icon: <TrendingUp className="w-5 h-5" /> },
          { label: "Countries Reached", target: 12, suffix: "+", icon: <Users className="w-5 h-5" /> },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3">
              {s.icon}
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
              <CountUp target={s.target} suffix={s.suffix} />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
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
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">How It Works</p>
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

/* ══════════════════════ VIDEO ═════════════════════════════════════════ */
const VideoSection = () => (
  <section className="py-20 bg-slate-50 dark:bg-slate-900/40">
    <div className="max-w-5xl mx-auto px-6">
      <Reveal className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
          See It In Action
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          A 2-minute walkthrough of a live mock interview session and the feedback you'd get.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 dark:shadow-black/60 border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          <video className="w-full h-full object-cover" controls playsInline>
            <source src="/videos/good.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-slate-900/5 dark:ring-white/5 rounded-3xl" />
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════ FEATURES ══════════════════════════════════════ */
const FeaturesSection = ({ navigate }: { navigate: (p: string) => void }) => {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />, badge: "Core",
      title: "AI Interview Coach",
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
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">What You Get</p>
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

/* ══════════════════════ TESTIMONIALS ══════════════════════════════════ */
const testimonials = [
  {
    name: "Karman Singh", role: "Software Engineer at Intellinum", avatar: "K",
    img: "https://media.licdn.com/dms/image/v2/D5603AQExDIe-7STGWA/profile-displayphoto-scale_400_400/B56ZyFUCf2KgAg-/0/1771763150880?e=1775088000&v=beta&t=yymUWoQVpxkID74wX9x6Exxm0zdoBKWECrThJjaDG80",
    text: "The practice sessions felt too real, but in a good way. You can't get away with unclear responses. The input on my system design showed me exactly where I was being vague, which is exactly what you need before the actual thing. I passed the design round on my next try.",
    stars: 5,
  },
  {
    name: "Rahat Bhatia", role: "Student at UCSD", avatar: "R",
    img: "https://media.licdn.com/dms/image/v2/D5635AQFDzXGekpeRgQ/profile-framedphoto-shrink_400_400/B56ZfMjNCUG0Ak-/0/1751483470343?e=1773997200&v=beta&t=Avfj6RzGFoO0xhJbyy_4RVocRAMaGJh9JYkO7HBQnCg",
    text: "I wasn't receiving any calls back on my resume until I ran it through the ATS analyzer. The keyword gap report said that 38% of the roles I was interested in matched. Interviews started rolling in within two weeks of following the advice. That and mock prep cemented the deal.",
    stars: 5,
  },
  {
    name: "Advitya", role: "Software Developer at Ryntra Tech", avatar: "A",
    img: "https://media.licdn.com/dms/image/v2/D5603AQHCK_ANQCya4Q/profile-displayphoto-scale_400_400/B56ZyjXnt1HQAg-/0/1772267407833?e=1775088000&v=beta&t=5ZI6FkyIGfMJIKFEPBLdqtfFb9j2odZsQpMOXQQQr_o",
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
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Real People, Real Results</p>
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
  <section className="py-24 bg-white dark:bg-slate-950">
    <div className="max-w-5xl mx-auto px-6">
      <Reveal className="text-center mb-14">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          The Old Way vs. The Right Way
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Most candidates prep on vibes. The ones who get offers prep with data.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-6">
        <Reveal delay={0}>
          <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl p-8 bg-slate-50/80 dark:bg-slate-900/40">
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-5">
              Without AI for Job
            </h3>
            <ul className="space-y-4">
              {[
                "Mock interviews with a friend who is too nice to tell you you're rambling",
                "Reading Leetcode solutions without actually practicing the communication part",
                "Sending your resume to 40 companies and wondering why you only get 2 replies",
                "Not knowing if your answer was good until you get a rejection email a week later",
                "Starting prep 3 days before the interview every single time",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border border-blue-200 dark:border-blue-800/40 rounded-2xl p-8 bg-blue-50/50 dark:bg-blue-900/5">
            <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-5">
              With AI for Job
            </h3>
            <ul className="space-y-4">
              {[
                "Brutally honest feedback after every answer—what worked, what didn't, and what to say instead",
                "ATS score for your resume in 30 seconds with specific gap analysis by job role",
                "Know your realistic match % before applying—stop wasting applications.",
                "See your score go up every week so you know when you're really ready",
                "Structured daily prep that takes 30–45 minutes and builds up over time"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
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
      <main>
        <HeroSection onStart={() => navigate("/signup")} onResume={() => navigate("/dashboard")} />
        <StatsSection />
        <HowItWorksSection />
        <VideoSection />
        <FeaturesSection navigate={navigate} />
        <TestimonialsSection />
        <ComparisonSection />
        <FAQSection />
        <FinalCTA onStart={() => navigate("/signup")} />
      </main>
    </div>
  );
};

export default Home;