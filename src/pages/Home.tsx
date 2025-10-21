import type { ReactNode, MouseEvent, ComponentType } from 'react';
import { ChevronRight, Brain, Target, TrendingUp, MessageSquare, Play, Zap, Mic, BarChart3, Clock } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({ variant = 'primary', className = '', children, onClick }: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl',
    secondary: 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200 shadow-md',
    ghost: 'bg-transparent border-2 hover:bg-white/10',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

interface FeatureCardProps {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
    <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
      <Icon className="w-7 h-7 text-indigo-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

interface StatCardProps {
  number: string | number;
  label: string;
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
}

const StatCard = ({ number, label, icon: Icon }: StatCardProps) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-indigo-600 mr-2" />
      <div className="text-3xl md:text-4xl font-bold text-gray-900">{number}</div>
    </div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
  </div>
);

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
}

const TestimonialCard = ({ name, role, content }: TestimonialCardProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
    <p className="text-gray-700 mb-6 leading-relaxed italic">"{content}"</p>
    <div>
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-sm text-gray-500">{role}</div>
    </div>
  </div>
);

const Home = () => {
  const handleStartPractice = () => {
    console.log("Navigate to practice");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main>
        {/* Hero Section */}
        <section className="pt-20 md:pt-32 pb-16 md:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-8 border border-indigo-100/50 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Interview Practice</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Practice Interviews,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">Build Confidence</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Prepare for your next interview with AI-powered practice sessions. Get instant feedback, improve your responses, and walk into interviews with confidence.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <Button variant="primary" className="text-lg px-8 py-4" onClick={handleStartPractice}>
                Start Practicing Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" className="text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-lg">
              <StatCard number="1000+" label="Practice Questions" icon={MessageSquare} />
              <StatCard number="Live" label="AI Feedback" icon={Brain} />
              <StatCard number="Free" label="To Start" icon={Zap} />
              <StatCard number="24/7" label="Access Anytime" icon={Clock} />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, Effective Interview Practice
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Three steps to better interview performance
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="text-2xl font-bold text-indigo-600">1</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Topic</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select from behavioral, technical, or industry-specific questions based on your interview needs.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="text-2xl font-bold text-purple-600">2</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Practice & Respond</h3>
                <p className="text-gray-600 leading-relaxed">
                  Answer questions naturally while our AI analyzes your response structure and content.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="text-2xl font-bold text-indigo-600">3</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Get Feedback</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive specific suggestions on how to improve clarity, structure, and impact of your answers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to <span className="text-indigo-600">Prepare</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <Mic className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Voice & Text Practice</h4>
                  <p className="text-gray-600 text-sm">
                    Practice speaking your answers aloud or type them out - whatever feels more natural.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <BarChart3 className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personalized Insights</h4>
                  <p className="text-gray-600 text-sm">
                    Understand your strengths and get specific tips on areas where you can improve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Helping People Prepare <span className="text-indigo-600">Worldwide</span>
              </h2>
              <p className="text-lg text-gray-600">Real feedback from people who've used our platform</p>
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

      </main>
    </div>
  );
};

export default Home;