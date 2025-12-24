import { useEffect, useRef } from "react";
import { Target, Shield, Rocket, Lightbulb, Sparkles, Users, Award, TrendingUp } from "lucide-react";

const AboutUs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-pink-100/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-5 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg mb-8 border border-indigo-200/50 dark:border-indigo-700/50">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Our Mission</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            About AI Interview Coach
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Democratizing interview preparation through AI technology, helping job seekers worldwide practice, improve, and succeed.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto fade-in-section">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">OUR STORY</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How We <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Started</span>
          </h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
          <div className="relative space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <p>
              AI Interview Coach was born from a simple observation: job interviews are stressful, and most people don't get enough practice before the real thing. Traditional interview prep is expensive, time-consuming, and often inaccessible to those who need it most.
            </p>
            <p>
              We built this platform to change that. By combining artificial intelligence with proven interview coaching techniques, we created a tool that provides instant, personalized feedback available 24/7. Whether you're a recent graduate preparing for your first interview or a seasoned professional looking to level up, we're here to help.
            </p>
            <p>
              Today, thousands of users trust AI Interview Coach to help them prepare for technical interviews, behavioral questions, and everything in between. We're continuously improving our AI models and expanding our question database to serve you better.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-20 px-6 max-w-7xl mx-auto fade-in-section">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">OUR VALUES</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">Stand For</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Target,
              title: "Accessibility First",
              description: "Interview preparation shouldn't be a luxury. We believe everyone deserves access to quality coaching tools, regardless of their background or budget.",
              gradient: "from-indigo-500 to-indigo-600",
              bgGradient: "from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50"
            },
            {
              icon: Shield,
              title: "Privacy & Security",
              description: "Your interview practice sessions are private. We use enterprise-grade encryption and never share your data with third parties or potential employers.",
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50"
            },
            {
              icon: Rocket,
              title: "Continuous Innovation",
              description: "We're constantly improving our AI algorithms and adding new features based on user feedback and the latest research in interview psychology.",
              gradient: "from-pink-500 to-pink-600",
              bgGradient: "from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50"
            },
            {
              icon: Lightbulb,
              title: "Real Results",
              description: "We measure our success by yours. Our focus is on delivering practical, actionable feedback that helps you perform better in actual interviews.",
              gradient: "from-indigo-500 to-purple-600",
              bgGradient: "from-indigo-100 to-purple-200 dark:from-indigo-900/50 dark:to-purple-800/50"
            }
          ].map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-500 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.bgGradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <value.icon className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r ${value.gradient}`} strokeWidth={2.5} style={{ stroke: 'url(#gradient)' }} />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${value.gradient} bg-clip-text text-transparent`}>
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 max-w-6xl mx-auto fade-in-section">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">HOW IT WORKS</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">Process</span>
          </h2>
        </div>
        
        <div className="space-y-6">
          {[
            {
              number: "1",
              title: "Choose Your Interview Type",
              description: "Select from technical, behavioral, or role-specific interview scenarios tailored to your industry and experience level.",
              color: "indigo"
            },
            {
              number: "2",
              title: "Practice With AI",
              description: "Answer questions in a realistic interview environment. Our AI analyzes your responses in real-time, considering content, structure, and delivery.",
              color: "purple"
            },
            {
              number: "3",
              title: "Get Personalized Feedback",
              description: "Receive detailed feedback on your answers with specific suggestions for improvement. Track your progress over time and watch your confidence grow.",
              color: "pink"
            }
          ].map((step, index) => (
            <div
              key={index}
              className="flex gap-6 items-start bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group"
            >
              <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                {step.number}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center fade-in-section">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Have Questions?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              We're here to help. Reach out to our support team anytime.
            </p>
            <a
              href="mailto:karmansingharora01@gmail.com"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              karmansingharora01@gmail.com
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .fade-in-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-section.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
