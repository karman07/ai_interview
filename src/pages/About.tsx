const colors = {
  background: "#f8fafc",
  text: "#1e293b",
  primary: "#4f46e5",
  secondary: "#7c3aed"
};

const AboutUs = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            About AI Interview Coach
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to democratize interview preparation through AI technology, 
            helping job seekers around the world practice, improve, and succeed.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.primary }}>
          Our Story
        </h2>
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            AI Interview Coach was born from a simple observation: job interviews are stressful, 
            and most people don't get enough practice before the real thing. Traditional interview 
            prep is expensive, time-consuming, and often inaccessible to those who need it most.
          </p>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            We built this platform to change that. By combining artificial intelligence with proven 
            interview coaching techniques, we created a tool that provides instant, personalized 
            feedback available 24/7. Whether you're a recent graduate preparing for your first 
            interview or a seasoned professional looking to level up, we're here to help.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Today, thousands of users trust AI Interview Coach to help them prepare for technical 
            interviews, behavioral questions, and everything in between. We're continuously improving 
            our AI models and expanding our question database to serve you better.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>Accessibility First</h3>
            <p className="text-gray-600 leading-relaxed">
              Interview preparation shouldn't be a luxury. We believe everyone deserves access 
              to quality coaching tools, regardless of their background or budget.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>Privacy & Security</h3>
            <p className="text-gray-600 leading-relaxed">
              Your interview practice sessions are private. We use enterprise-grade encryption 
              and never share your data with third parties or potential employers.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>Continuous Innovation</h3>
            <p className="text-gray-600 leading-relaxed">
              We're constantly improving our AI algorithms and adding new features based on 
              user feedback and the latest research in interview psychology.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>Real Results</h3>
            <p className="text-gray-600 leading-relaxed">
              We measure our success by yours. Our focus is on delivering practical, actionable 
              feedback that helps you perform better in actual interviews.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
          How It Works
        </h2>
        <div className="space-y-6">
          <div className="flex gap-6 items-start bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Choose Your Interview Type</h3>
              <p className="text-gray-600">
                Select from technical, behavioral, or role-specific interview scenarios tailored 
                to your industry and experience level.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Practice With AI</h3>
              <p className="text-gray-600">
                Answer questions in a realistic interview environment. Our AI analyzes your 
                responses in real-time, considering content, structure, and delivery.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Get Personalized Feedback</h3>
              <p className="text-gray-600">
                Receive detailed feedback on your answers with specific suggestions for improvement. 
                Track your progress over time and watch your confidence grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
          Have Questions?
        </h2>
        <p className="text-gray-600 mb-8">
          We're here to help. Reach out to our support team anytime.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a href="mailto:karmansingharora01@gmail.com" className="text-indigo-600 hover:underline">
            karmansingharora01@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;