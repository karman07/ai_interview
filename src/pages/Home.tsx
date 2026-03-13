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


// ================== HERO =====================

const HeroSection = ({ onStart, onResume }: { onStart: () => void, onResume: () => void }) => (
  <section className="relative pt-32 pb-24 overflow-hidden bg-white dark:bg-slate-950">

    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-100px] h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="absolute right-[-200px] top-[200px] h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[120px]" />
    </div>

    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
        <span className="text-sm font-medium tracking-wide">
          INTERVIEW PREPARATION PLATFORM
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-slate-50 leading-[1.05] tracking-tight mb-6">
        Prepare for Real Interviews.
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300">
          Get Real Feedback.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
        Practice interviews, improve your resume, and track your preparation —
        all in one platform designed to help you perform better in real hiring processes.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

        <Button
          variant="primary"
          className="px-8 py-4 text-lg w-full sm:w-auto"
          onClick={onStart}
        >
          Start Interview Practice
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

      <p className="text-sm text-slate-500 dark:text-slate-500 mt-6">
        Used by candidates preparing for top tech companies and startups
      </p>

    </div>
  </section>
);


// ================== VIDEO =====================

const VideoSection = () => (
  <section className="py-20 bg-white dark:bg-slate-950">

    <div className="max-w-7xl mx-auto px-6">

      <div className="text-center mb-16">

        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          See How the Platform Works
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          A quick walkthrough of how AI for Job helps you practice interviews,
          improve your resume, and prepare more effectively.
        </p>

      </div>

      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_48px_80px_-20px_rgba(59,130,246,0.2)] dark:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.5)] border-[8px] border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-900">

        <video
          className="w-full h-full object-cover"
          controls
          playsInline
        >
          <source src="/videos/good.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-slate-900/5 dark:ring-white/10 rounded-[2.5rem]" />

      </div>
    </div>
  </section>
);


// ================== PILLARS =====================

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
  <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col items-start">

    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
    </div>

    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
      {title}
    </h3>

    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
      {content}
    </p>

    <button
      onClick={onClick}
      className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider"
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
          Everything You Need to Prepare for Interviews
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Tools designed to help you practice, improve, and get hired.
        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <PillarCard
          icon={Mic}
          title="AI Interview Coach"
          content="Practice behavioral, coding, and system design interviews with AI. Receive feedback on clarity, structure, communication, and technical depth."
          cta="Start Mock Interview"
          onClick={() => navigate('/interview/start/behavioral')}
        />

        <PillarCard
          icon={FileText}
          title="Resume Analyzer"
          content="Upload your resume to receive an ATS score, keyword analysis, and suggestions to improve clarity, impact, and readability."
          cta="Analyze Resume"
          onClick={() => navigate('/dashboard')}
        />

        <PillarCard
          icon={Brain}
          title="Preparation Hub"
          content="Structured preparation tracks for DSA, system design, core CS, and behavioral interviews with progress tracking."
          cta="Explore Preparation"
          onClick={() => navigate('/subjects')}
        />

        <PillarCard
          icon={Briefcase}
          title="Job Discovery"
          content="Discover relevant roles, track applications, and understand how your profile matches different job opportunities."
          cta="Explore Jobs"
          onClick={() => navigate('/jobs')}
        />

      </div>

    </div>
  </section>
);


// ================== WHY =====================

const WhySection = () => (
  <section className="py-24 bg-white dark:bg-slate-950">

    <div className="max-w-7xl mx-auto px-6">

      <div className="grid md:grid-cols-2 gap-16 items-center">

        <div>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            Why Candidates Use AI for Job
          </h2>

          <div className="space-y-6">

            {[
              "Practice interviews in a realistic environment",
              "Receive actionable feedback you can improve from",
              "Optimize resumes for ATS and recruiters",
              "Track preparation across multiple interview areas"
            ].map((item, idx) => (

              <div key={idx} className="flex items-start">

                <div className="mt-1 mr-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <p className="text-lg text-slate-700 dark:text-slate-300">
                  {item}
                </p>

              </div>

            ))}

          </div>

        </div>


        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">

          <div className="space-y-6">

            <div className="flex justify-between">
              <span>Interview Readiness</span>
              <span className="font-bold text-emerald-500">92%</span>
            </div>

            <div className="flex justify-between">
              <span>Resume Score</span>
              <span className="font-bold text-blue-500">90 / 100</span>
            </div>

            <div className="flex justify-between">
              <span>Answer Clarity</span>
              <span className="font-bold text-blue-500">Above Average</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  </section>
);


// ================== TRANSFORMATION =====================

const TransformationSection = () => (
  <section className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">

    <div className="max-w-4xl mx-auto px-6 text-center">

      <Cpu className="w-16 h-16 text-blue-600 mx-auto mb-8" />

      <h2 className="text-4xl md:text-5xl font-bold mb-8">
        Preparation Should Be Structured — Not Random
      </h2>

      <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
        Most candidates prepare without feedback or direction.
        AI for Job provides structured practice, measurable progress,
        and insights that help you improve every interview round.
      </p>

    </div>
  </section>
);


// ================== CTA =====================

const FinalCTA = ({ onStart, onResume }: { onStart: () => void, onResume: () => void }) => (
  <section className="py-24 bg-white dark:bg-slate-950">

    <div className="max-w-5xl mx-auto px-6 text-center">

      <h2 className="text-4xl md:text-6xl font-bold mb-12">
        Start Preparing for Your Next Interview
      </h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">

        <Button
          variant="primary"
          className="px-10 py-5 text-xl"
          onClick={onStart}
        >
          <Zap className="w-5 h-5 mr-3" />
          Start Interview Practice
        </Button>

        <Button
          variant="success"
          className="px-10 py-5 text-xl"
          onClick={onResume}
        >
          <Target className="w-5 h-5 mr-3" />
          Improve My Resume
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