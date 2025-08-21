import React from "react";
import { Shield } from "lucide-react";
import colors from "@/constants/colors";

const PricingTrust: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 mt-20 text-center">
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-center gap-4 mb-6">
        <Shield className="w-8 h-8" style={{ color: colors.primary }} />
        <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
          Trusted by 50,000+ Job Seekers
        </h3>
      </div>
      <p className="text-gray-600 leading-relaxed mb-6">
        Join thousands of professionals who have improved their interview skills and landed their dream jobs
        with our AI-powered platform. 14-day money-back guarantee on all paid plans.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>95%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>2M+</div>
          <div className="text-sm text-gray-600">Interviews Conducted</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>4.9/5</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
      </div>
    </div>
  </div>
);

export default PricingTrust;
