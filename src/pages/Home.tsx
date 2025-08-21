import React from "react";
import { ChevronRight, Brain, Target, TrendingUp, Star, Play, Zap, Check } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import StatCard from "@/components/ui/StatCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import Button from "@/components/ui/Button";

const Home: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md mb-8 border border-indigo-100">
              <Zap className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Powered by Advanced AI Technology</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              Ace Your Next
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Interview</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
              Transform your interview skills with our cutting-edge AI coach. Practice with real questions, receive
              personalized feedback, and build confidence for any interview.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Button variant="primary" className="text-lg px-8 py-4 inline-flex items-center">
                Start  Practice
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" className="text-lg px-8 py-4 inline-flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <StatCard number="50K+" label="Interviews Practiced" icon={Target} />
              <StatCard number="95%" label="Success Rate" icon={TrendingUp} />
              <StatCard number="4.9" label="User Rating" icon={Star} />
              <StatCard number="24/7" label="AI Availability" icon={Brain} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Our <span className="text-indigo-600">AI Coach?</span></h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Features designed to give you a competitive edge.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <FeatureCard icon={Brain} title="Advanced AI Analysis" description="Our AI analyzes responses, delivery, and clarity to provide actionable insights." />
              <FeatureCard icon={Target} title="Industry-Specific Questions" description="Practice with thousands of real interview questions from top companies." />
              <FeatureCard icon={TrendingUp} title="Performance Analytics" description="Track improvement with personalized recommendations and progress metrics." />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Check className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Behavioral Question Mastery</h4>
                  <p className="text-gray-600 text-sm">Master the STAR method with guided practice.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Check className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mock Video Interviews</h4>
                  <p className="text-gray-600 text-sm">Practice with realistic video interview simulations.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Check className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Custom Interview Prep</h4>
                  <p className="text-gray-600 text-sm">Tailored preparation for specific companies.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Success Stories from Our <span className="text-indigo-600">Community</span></h2>
              <p className="text-lg text-gray-600">Join thousands who've landed their dream jobs.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard name="Sarah Chen" role="Software Engineer at Google" content="The AI feedback was incredibly detailed and helped me identify weak points I never noticed." />
              <TestimonialCard name="Marcus Rodriguez" role="Product Manager at Microsoft" content="This platform transformed my interview skills completely." />
              <TestimonialCard name="Emily Johnson" role="Data Scientist at Netflix" content="The industry-specific questions and AI insights gave me the confidence to ace my interviews." />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Interview Skills?</h2>
            <p className="text-lg text-indigo-100 mb-8">Join over 50,000 professionals who've upgraded their careers with our AI-powered interview coaching.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button variant="secondary" className="text-indigo-600 text-lg px-8 py-4">Start Trial</Button>
              <Button variant="ghost" className="text-white border-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-4">View Pricing Plans</Button>
            </div>
            <div className="mt-16 flex justify-center items-center space-x-8 opacity-80 text-white">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span> Forever Plan</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;