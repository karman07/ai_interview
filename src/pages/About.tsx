import React from "react";
import colors from "../constants/colors";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-b-3xl shadow-lg">
        <h1 className="text-5xl font-extrabold mb-6">
          About AI Interview Coach
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-90">
          Empowering candidates to ace interviews with the power of AI-driven coaching, feedback, and real-world simulations.
        </p>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6" style={{ color: colors.primary }}>
          Our Mission
        </h2>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto opacity-90">
          At AI Interview Coach, our mission is to help job seekers build
          confidence, sharpen their communication, and succeed in interviews.
          Through intelligent feedback, mock interviews, and personalized
          guidance, we’re transforming how people prepare for their careers.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-4" style={{ color: colors.secondary }}>🤖</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>AI-Powered Feedback</h3>
            <p className="opacity-80">Get instant, actionable feedback on your answers, tone, and body language.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-4" style={{ color: colors.secondary }}>🎤</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>Real Interview Simulations</h3>
            <p className="opacity-80">Practice with realistic mock interviews tailored to your industry and role.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-4" style={{ color: colors.secondary }}>📈</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>Personalized Coaching</h3>
            <p className="opacity-80">Track your progress and receive customized coaching to improve step by step.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
            <img
              src="https://via.placeholder.com/150"
              alt="Team Member"
              className="w-32 h-32 mx-auto rounded-full mb-4 shadow-md"
            />
            <h3 className="text-lg font-bold">Alex Johnson</h3>
            <p className="text-sm opacity-70">Founder & AI Specialist</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
            <img
              src="https://via.placeholder.com/150"
              alt="Team Member"
              className="w-32 h-32 mx-auto rounded-full mb-4 shadow-md"
            />
            <h3 className="text-lg font-bold">Sophia Lee</h3>
            <p className="text-sm opacity-70">Interview Coach</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
            <img
              src="https://via.placeholder.com/150"
              alt="Team Member"
              className="w-32 h-32 mx-auto rounded-full mb-4 shadow-md"
            />
            <h3 className="text-lg font-bold">Michael Smith</h3>
            <p className="text-sm opacity-70">Career Strategist</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
