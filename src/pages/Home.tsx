import { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Brain,
  Target,
  Zap,
  Mic,
  FileText,
  Briefcase,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";

import Button from "../components/ui/button";

// ================== SECTIONS =====================

const HeroSection = ({ onStart, onResume }: { onStart: () => void, onResume: () => void }) => (
  <section className="relative pt-32 pb-24 overflow-hidden bg-white dark:bg-slate-950">

    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
        <span className="text-sm font-medium tracking-wide">AI-POWERED PREPARATION</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-slate-50 leading-tight tracking-tight mb-6 lowercase italic">
        Build Your Career with <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">
          ai for job
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
        From interview mastery to resume intelligence and structured preparation —
        everything you need to land top roles, powered by AI.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          variant="primary"
          className="px-8 py-4 text-lg w-full sm:w-auto"
          onClick={onStart}
        >
          Start Practicing for Free
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="px-8 py-4 text-lg w-full sm:w-auto"
          onClick={onResume}
        >
          <FileText className="w-5 h-5 mr-2" />
          Analyze My Resume
        </Button>
      </div>
    </div>
  </section>
);

const VideoSection = () => (
  <section className="py-20 bg-white dark:bg-slate-950">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight uppercase italic">
          Experience the <span className="text-blue-600 dark:text-blue-400">Platform</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Watch a quick walkthrough of how our AI-driven ecosystem accelerates your career growth.
        </p>
      </div>
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_48px_80px_-20px_rgba(59,130,246,0.2)] dark:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.5)] border-[8px] border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group">
        <video
          className="w-full h-full object-cover"
          controls
          playsInline
        >
          <source src="/videos/good.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Quality overlay shadow for depth */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-slate-900/5 dark:ring-white/10 rounded-[2.5rem]" />
      </div>
    </div>
  </section>
);

const PillarCard = ({
  title,
  content,
  cta,
  icon: Icon,
  onClick
}: {
  title: string,
  content: string,
  cta: string,
  icon: ComponentType<any>,
  onClick: () => void
}) => (
  <div
    className="group relative bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col items-start backdrop-blur-md"
  >
    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
    </div>

    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
      {title}
    </h3>

    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
      {content}
    </p>

    <button
      onClick={onClick}
      className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wider"
    >
      {cta}
      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

const PillarsSection = ({ navigate }: { navigate: (path: string) => void }) => (
  <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          One Platform. Four Career Pillars.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Integrated tools designed to work together for your success
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PillarCard
          icon={Mic}
          title="ai for job Coach"
          content="Practice Coding, Behavioral, HR, and System Design interviews. Receive structured feedback, communication scoring, confidence analysis, and improvement roadmaps."
          cta="Start Mock Interview"
          onClick={() => navigate('/interview/start/behavioral')} // Defaulting to one type or generic start
        />
        <PillarCard
          icon={FileText}
          title="Resume Intelligence"
          content="Get ATS compatibility score, keyword gap analysis, bullet optimization, quantification improvements, and role-specific tailoring suggestions."
          cta="Scan My Resume"
          onClick={() => navigate('/dashboard')}
        />
        <PillarCard
          icon={Brain}
          title="Preparation Hub"
          content="Follow guided tracks for DSA, System Design, Core CS, and Behavioral preparation with AI-driven difficulty scaling and performance tracking."
          cta="Explore Preparation Tracks"
          onClick={() => navigate('/subjects')}
        />
        <PillarCard
          icon={Briefcase}
          title="Smart Job Portal"
          content="Access curated job listings, role-fit matching, application tracking dashboards, and AI-powered job fit insights."
          cta="Find Relevant Jobs"
          onClick={() => navigate('/jobs')}
        />
      </div>
    </div>
  </section>
);

const WhySection = () => (
  <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8 leading-tight">
            Why Top Candidates <br />
            Choose <span className="text-blue-600 dark:text-blue-400 italic">ai for job</span>
          </h2>

          <div className="space-y-6">
            {[
              "End-to-End Career Infrastructure",
              "AI That Understands Context, Not Just Keywords",
              "Measurable Skill & Resume Progress Tracking",
              "Built for Competitive Roles"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start">
                <div className="mt-1 mr-4 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg dark:shadow-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <span className="text-slate-600 dark:text-slate-400">Candidate Readiness</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">94%</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <span className="text-slate-600 dark:text-slate-400">Resume Score</span>
                <span className="text-blue-500 dark:text-blue-400 font-bold">98/100</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <span className="text-slate-600 dark:text-slate-400">Response Quality</span>
                <span className="text-blue-500 dark:text-blue-400 font-bold">Top 5%</span>
              </div>
              <div className="pt-2">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TransformationSection = () => (
  <section className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <Cpu className="w-16 h-16 text-blue-600 dark:text-blue-500 mx-auto mb-8 opacity-80" />
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8 leading-tight">
        "Your Career Is a System. <br />
        We Built the Infrastructure."
      </h2>
      <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
        Stop relying on luck. Success is a repeatable process when you have the right data, feedback loops, and preparation structure. We provide the engineering to build your future.
      </p>
    </div>
  </section>
);

const FinalCTA = ({ onStart, onResume }: { onStart: () => void, onResume: () => void }) => (
  <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
    <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
      <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-12 tracking-tight">
        Ready to Upgrade Your Career Strategy?
      </h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <Button
          variant="primary"
          className="px-10 py-5 text-xl w-full sm:w-auto shadow-2xl shadow-blue-500/20"
          onClick={onStart}
        >
          <Zap className="w-5 h-5 mr-3" />
          Start ai for job Practice
        </Button>
        <Button
          variant="success"
          className="px-10 py-5 text-xl w-full sm:w-auto shadow-2xl shadow-emerald-500/20"
          onClick={onResume}
        >
          <Target className="w-5 h-5 mr-3" />
          Optimize My Resume Now
        </Button>
      </div>
    </div>
  </section>
);

// ================== MAIN COMPONENT =====================

const Home = () => {
  const navigate = useNavigate();

  const handleStartPractice = () => navigate("/dashboard");
  const handleAnalyzeResume = () => navigate("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-blue-500/30 transition-colors duration-500">
      <main>
        <HeroSection onStart={handleStartPractice} onResume={handleAnalyzeResume} />
        <VideoSection />
        <PillarsSection navigate={navigate} />
        <WhySection />
        <TransformationSection />
        <FinalCTA onStart={handleStartPractice} onResume={handleAnalyzeResume} />
      </main>
    </div>
  );
};

export default Home;