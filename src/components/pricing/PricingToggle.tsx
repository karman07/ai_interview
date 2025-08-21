import React from "react";
import colors from "@/constants/colors";

interface PricingToggleProps {
  isYearly: boolean;
  setIsYearly: (val: boolean) => void;
}

const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, setIsYearly }) => (
  <div className="inline-flex items-center bg-white rounded-2xl p-1 shadow-lg border border-gray-100">
    <button
      onClick={() => setIsYearly(false)}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${!isYearly ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
      style={{ backgroundColor: !isYearly ? colors.primary : 'transparent' }}
    >
      Monthly
    </button>
    <button
      onClick={() => setIsYearly(true)}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${isYearly ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
      style={{ backgroundColor: isYearly ? colors.primary : 'transparent' }}
    >
      Yearly
      <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold text-white rounded-full" style={{ backgroundColor: colors.secondary }}>
        Save 20%
      </span>
    </button>
  </div>
);

export default PricingToggle;
