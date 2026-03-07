import { useNavigate } from "react-router-dom";
import {
  Users,
  Target,
  Shield,
  Zap,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Heart
} from "lucide-react";
import Button from "../components/ui/button";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-blue-500/30 transition-colors duration-500">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium tracking-wide">OUR MISSION</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            Democratizing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">
              Career Success
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            We believe that elite interview preparation shouldn't be a privilege.
            By leveraging advanced AI, we're building a personal career coach for everyone.
          </p>
        </div>
      </section>

      {/* Stats/Mission Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Interviews Practiced", value: "100K+", icon: Users },
              { label: "Success Rate", value: "94%", icon: TrendingUp },
              { label: "Countries Reached", value: "150+", icon: Globe },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Why We Started
              </h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  The modern hiring process is broken. Candidates are often judged on performance in high-pressure situations rather than their actual skills. We realized that the gap wasn't ability—it was preparation.
                </p>
                <p>
                  Traditional coaching is expensive and inaccessible. We set out to change that by building an AI that could provide the same level of personalized feedback as a human expert, but accessible to anyone, anywhere, at any time.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">The Goal</h3>
                    <p className="text-slate-600 dark:text-slate-400">To create the world's most effective career operating system.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">The Heart</h3>
                    <p className="text-slate-600 dark:text-slate-400">We care deeply about user success and ethical AI development.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">The principles that guide every decision we make.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Innovation", desc: "Pushing the boundaries of what's possible with AI.", icon: Zap },
              { title: "Accessibility", desc: "Making elite tools available to everyone.", icon: Globe },
              { title: "Privacy", desc: "Your career data belongs to you, always.", icon: Shield },
              { title: "Excellence", desc: "Delivering the highest quality feedback.", icon: Award },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <item.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
            Join the Revolution in <br />
            <span className="text-blue-600 dark:text-blue-400">Career Preparation</span>
          </h2>
          <Button
            variant="primary"
            className="px-8 py-4 text-lg"
            onClick={() => navigate('/signup')}
          >
            Start Your Journey Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
