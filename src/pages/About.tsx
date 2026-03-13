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
            <span className="text-sm font-medium tracking-wide">OUR STORY</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            Everyone deserves a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">
              fair shot
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Great interview prep used to be something only a lucky few could access.
            We're changing that — one conversation at a time.
          </p>
        </div>
      </section>

      {/* Stats/Mission Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Mock interviews completed", value: "100+", icon: Users },
              { label: "Users who landed the role", value: "90%", icon: TrendingUp },
              { label: "Countries represented", value: "10+", icon: Globe },
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
                How we got here
              </h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Interviews are stressful. Most people know their stuff — they just
                  freeze up when it counts. We've all been there. That moment where
                  your mind goes blank and the "right answer" only comes to you in
                  the elevator on the way out.
                </p>
                <p>
                  A good coach makes all the difference, but not everyone has access
                  to one. So we built something that could give everyone that same
                  honest, personalized feedback — available whenever you need it,
                  not just when you can afford it.
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
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">What we're building toward</h3>
                    <p className="text-slate-600 dark:text-slate-400">A world where your next career move isn't limited by who you know or what you can afford.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">What keeps us going</h3>
                    <p className="text-slate-600 dark:text-slate-400">Hearing from users who landed their dream job — and knowing we played a small part in that.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">What we stand for</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">A few things we refuse to compromise on, no matter what.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Keep improving", desc: "We ship, learn, and iterate. The product you use today is better than it was last month.", icon: Zap },
              { title: "No gatekeeping", desc: "If it's useful, it should be available to everyone — not just those who can pay a premium.", icon: Globe },
              { title: "Your data is yours", desc: "We don't sell it, share it, or use it in ways you haven't agreed to. Full stop.", icon: Shield },
              { title: "Actually be helpful", desc: "Fluffy feedback helps no one. We give you the real stuff, even when it's uncomfortable.", icon: Award },
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
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to walk in <br />
            <span className="text-blue-600 dark:text-blue-400">feeling prepared?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">No pressure. Just practice.</p>
          <Button
            variant="primary"
            className="px-8 py-4 text-lg"
            onClick={() => navigate('/signup')}
          >
            Give it a try
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;