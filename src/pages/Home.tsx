import { ReactNode, MouseEvent, ComponentType, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Brain,
  Target,
  TrendingUp,
  MessageSquare,
  Play,
  Zap,
  Mic,
  BarChart3,
  Clock,
  Sparkles,
  Award,
  Users,
} from "lucide-react";

// Theme Hook (inline for demo)
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, toggleTheme };
};

// ================== BUTTON =====================
type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({
  variant = "primary",
  className = "",
  children,
  onClick,
}: ButtonProps) => {
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105 active:scale-95";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 dark:shadow-indigo-500/20",
    secondary:
      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 shadow-md",
    ghost: "bg-transparent border-2 border-white/30 hover:bg-white/10 text-white backdrop-blur-sm",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};



// ================== FEATURE CARD =====================
interface FeatureCardProps {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description }: Omit<FeatureCardProps, 'index'>) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
    >
      <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-6" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

// ================== STAT CARD =====================
interface StatCardProps {
  number: string | number;
  label: string;
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
}

const StatCard = ({ number, label, icon: Icon }: StatCardProps) => {
  return (
    <div className="text-center p-4">
      <div className="flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {number}
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
    </div>
  );
};

// ================== TESTIMONIAL CARD =====================
interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
}

const TestimonialCard = ({ name, role, content }: Omit<TestimonialCardProps, 'index'>) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">"{content}"</p>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{role}</div>
      </div>
    </div>
  );
};

// ================== MAIN COMPONENT =====================
const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleStartPractice = () => {
    // Check token logic here
    navigate("/dashboard");
  };
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ${theme}`}>
      <main>
        {/* HERO SECTION */}
        <section ref={heroRef} className="pt-20 md:pt-32 pb-16 md:pb-24 relative overflow-hidden">
          {/* Simple Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-gray-900" />



          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-8 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                AI-Powered Interview Practice
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
              Practice Interviews,
              <br />
              <span className="text-indigo-600 dark:text-indigo-400">
                Build Confidence
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Prepare for your next interview with AI-powered practice sessions.
              Get instant feedback, improve your responses, and walk into
              interviews with confidence.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <Button
                variant="primary"
                className="text-lg px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={handleStartPractice}
              >
                <span>
                  Start Practicing Free
                </span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" className="text-lg px-10 py-5">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-10 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <StatCard number="10000" label="Practice Questions" icon={MessageSquare} />
              <StatCard number="Live" label="AI Feedback" icon={Brain} />
              <StatCard number="Free" label="To Start" icon={Zap} />
              <StatCard number="24hrs" label="Access Anytime" icon={Clock} />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 md:py-28 bg-white dark:bg-gray-900 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">HOW IT WORKS</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                Simple, Effective Interview Practice
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Three steps to better interview performance
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {[
                {
                  number: "1",
                  title: "Choose Your Topic",
                  description: "Select from behavioral, technical, or industry-specific questions based on your interview needs.",
                  color: "indigo",
                },
                {
                  number: "2",
                  title: "Practice & Respond",
                  description: "Answer questions naturally while our AI analyzes your response structure and content.",
                  color: "gray",
                },
                {
                  number: "3",
                  title: "Get Feedback",
                  description: "Receive specific suggestions on how to improve clarity, structure, and impact of your answers.",
                  color: "indigo",
                },
              ].map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{step.number}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">FEATURES</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Prepare</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tools designed to help you practice effectively and improve with each session
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <FeatureCard
                icon={Brain}
                title="AI-Powered Analysis"
                description="Get detailed feedback on your responses, including structure, clarity, and key points to emphasize."
              />
              <FeatureCard
                icon={Target}
                title="Targeted Questions"
                description="Practice with questions commonly asked in your industry or role, from behavioral to technical topics."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Track Progress"
                description="See your improvement over time with practice history and performance insights."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Mic, title: "Voice & Text Practice", description: "Practice speaking your answers aloud or type them out - whatever feels more natural." },
                { icon: BarChart3, title: "Personalized Insights", description: "Understand your strengths and get specific tips on areas where you can improve." },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-2xl transition-all duration-300 group"
                >
                  <feature.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 md:py-28 bg-white dark:bg-gray-900 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">TESTIMONIALS</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                Helping People Prepare{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">Worldwide</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Real feedback from people who've used our platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                name="Alex M."
                role="Software Developer"
                content="The AI feedback helped me structure my answers better. I felt much more prepared going into my interviews."
              />
              <TestimonialCard
                name="Jordan K."
                role="Marketing Professional"
                content="Being able to practice behavioral questions and get instant feedback was exactly what I needed."
              />
              <TestimonialCard
                name="Sam P."
                role="Recent Graduate"
                content="This helped me overcome my nervousness. Practicing beforehand made such a difference in my confidence."
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-indigo-600 dark:bg-indigo-900 rounded-3xl mx-6 mb-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of professionals who've improved their interview skills
            </p>
            <Button
              variant="secondary"
              className="text-lg px-10 py-5 bg-white text-indigo-600 hover:bg-gray-50 border-none shadow-lg"
              onClick={handleStartPractice}
            >
              Get Started Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>


    </div>
  );
};

export default Home;