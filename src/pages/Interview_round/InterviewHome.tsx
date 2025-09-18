import React from "react";
import {
  ArrowRight,
  Code,
  Users,
  Lightbulb,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ real navigation hook

type InterviewCardProps = {
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

function InterviewCard({ type, description, icon, color }: InterviewCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`}></div>

      {/* Card content */}
      <div className="p-8">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-white">{icon}</div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
            {type} Round
          </h3>
          <p className="text-gray-600 leading-relaxed text-base">
            {description}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() =>
            navigate(`/interview/start/${type.toLowerCase()}`)
          }
          className="mt-8 w-full flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 group-hover:shadow-lg font-semibold"
        >
          Start Interview
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

export default function InterviewHome() {
  const rounds = [
    {
      type: "Technical",
      description:
        "Demonstrate your coding skills, system design knowledge, and technical expertise with hands-on challenges.",
      icon: <Code className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      type: "Behavioral",
      description:
        "Share your experiences and showcase how you align with our company culture and values.",
      icon: <Users className="w-8 h-8" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      type: "Problem",
      description:
        "Tackle complex scenarios and demonstrate your analytical thinking and problem-solving approach.",
      icon: <Lightbulb className="w-8 h-8" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
    {
      type: "HR",
      description:
        "Final discussion about role expectations, compensation, and next steps in your journey with us.",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
              Interview Process
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Choose Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Interview Round
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Select the interview type that matches your preparation focus. Each
              round is designed to evaluate different aspects of your candidacy.
            </p>
          </div>
        </div>
      </div>

      {/* Cards section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {rounds.map((round) => (
            <InterviewCard key={round.type} {...round} />
          ))}
        </div>

        {/* Bottom info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>
              All rounds include detailed feedback and performance analytics
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
