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

// ================== FLOATING PARTICLE =====================
const FloatingParticle = ({ delay = 0 }: { delay?: number }) => {
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particle = particleRef.current;
    if (!particle) return;

    const animate = () => {
      const duration = 3000 + Math.random() * 2000;
      const startY = Math.random() * 100;
      const endY = startY - 30;
      const startX = Math.random() * 100;
      const endX = startX + (Math.random() - 0.5) * 20;

      particle.animate([
        { transform: `translate(${startX}vw, ${startY}vh) scale(0)`, opacity: 0 },
        { transform: `translate(${endX}vw, ${endY}vh) scale(1)`, opacity: 0.6, offset: 0.5 },
        { transform: `translate(${endX}vw, ${endY - 20}vh) scale(0)`, opacity: 0 },
      ], {
        duration,
        iterations: Infinity,
        delay,
      });
    };

    animate();
  }, [delay]);

  return (
    <div
      ref={particleRef}
      className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-sm"
      style={{ left: 0, top: 0 }}
    />
  );
};

// ================== FEATURE CARD =====================
interface FeatureCardProps {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group relative overflow-hidden opacity-0 translate-y-10"
      style={{ transitionProperty: 'opacity, transform, box-shadow' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
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
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stat = statRef.current;
    if (!stat || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const target = typeof number === 'string' ? parseInt(number) || 0 : number;
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setCount(target);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(stat);
    return () => observer.disconnect();
  }, [number, hasAnimated]);

  return (
    <div ref={statRef} className="text-center transform hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
          {typeof number === 'string' && isNaN(parseInt(number)) ? number : count + (typeof number === 'string' ? number.replace(/\d+/g, '') : '')}
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
  index: number;
}

const TestimonialCard = ({ name, role, content, index }: TestimonialCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            }, index * 150);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 opacity-0 translate-y-10 scale-95 hover:scale-105"
      style={{ transitionProperty: 'opacity, transform, box-shadow' }}
    >
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400 fill-current animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
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
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/20" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 200} />
          ))}

          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center px-5 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg mb-8 border border-indigo-200/50 dark:border-indigo-700/50 animate-bounce-slow">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2 animate-spin-slow" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI-Powered Interview Practice
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight animate-fade-in">
              Practice Interviews,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient">
                Build Confidence
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-delay">
              Prepare for your next interview with AI-powered practice sessions.
              Get instant feedback, improve your responses, and walk into
              interviews with confidence.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20 animate-fade-in-delay-2">
              <Button
                variant="primary"
                className="text-lg px-10 py-5 relative overflow-hidden group"
                onClick={handleStartPractice}
              >
                <span className="relative z-10 flex items-center">
                  Start Practicing Free
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              {/* Connecting Lines */}
              <div className="hidden md:block absolute top-1/4 left-1/4 w-1/4 h-1 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800" />
              <div className="hidden md:block absolute top-1/4 right-1/4 w-1/4 h-1 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800" />

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
                  color: "purple",
                },
                {
                  number: "3",
                  title: "Get Feedback",
                  description: "Receive specific suggestions on how to improve clarity, structure, and impact of your answers.",
                  color: "indigo",
                },
              ].map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className={`bg-gradient-to-br from-${step.color}-100 to-${step.color}-200 dark:from-${step.color}-900/50 dark:to-${step.color}-800/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-300`}>
                    <div className={`text-3xl font-bold text-${step.color}-600 dark:text-${step.color}-400`}>{step.number}</div>
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
                index={0}
                icon={Brain}
                title="AI-Powered Analysis"
                description="Get detailed feedback on your responses, including structure, clarity, and key points to emphasize."
              />
              <FeatureCard
                index={1}
                icon={Target}
                title="Targeted Questions"
                description="Practice with questions commonly asked in your industry or role, from behavioral to technical topics."
              />
              <FeatureCard
                index={2}
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
                index={0}
                name="Alex M."
                role="Software Developer"
                content="The AI feedback helped me structure my answers better. I felt much more prepared going into my interviews."
              />
              <TestimonialCard
                index={1}
                name="Jordan K."
                role="Marketing Professional"
                content="Being able to practice behavioral questions and get instant feedback was exactly what I needed."
              />
              <TestimonialCard
                index={2}
                name="Sam P."
                role="Recent Graduate"
                content="This helped me overcome my nervousness. Practicing beforehand made such a difference in my confidence."
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-float"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                }}
              />
            ))}
          </div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of professionals who've improved their interview skills
            </p>
            <Button
              variant="ghost"
              className="text-lg px-10 py-5 text-white border-white/50 hover:bg-white hover:text-indigo-600"
              onClick={handleStartPractice}
            >
              Get Started Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Home;