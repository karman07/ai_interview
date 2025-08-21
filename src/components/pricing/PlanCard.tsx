import React from "react";
import { Check, Star, ArrowRight } from "lucide-react";

import { Plan } from "@/types/plan";
import colors from "@/constants/colors";

interface PlanCardProps {
  plan: Plan;
  isYearly: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isYearly }) => {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const savings = plan.monthlyPrice && plan.yearlyPrice ? Math.round(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100) : 0;

  return (
    <div className={`relative group h-full ${plan.popular ? 'transform scale-105 z-10' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="px-4 py-1 rounded-full text-white text-sm font-semibold shadow-lg flex items-center gap-1" style={{ backgroundColor: colors.secondary }}>
            <Star className="w-4 h-4" fill="white" /> Most Popular
          </div>
        </div>
      )}
      <div className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-500 h-full flex flex-col group-hover:shadow-2xl group-hover:-translate-y-2 ${plan.popular ? 'border-indigo-200 shadow-indigo-100' : 'border-gray-100 hover:border-indigo-100'}`}>
        {plan.popular && (
          <div className="absolute inset-0 rounded-3xl opacity-5" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }} />
        )}
        <div className="p-8 relative z-10 flex-1 flex flex-col">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {plan.icon}
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>{plan.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
          </div>
          <div className="text-center mb-8">
            {price !== null ? (
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight" style={{ color: colors.primary }}>${price}</span>
                  {price > 0 && <span className="text-gray-500 text-lg font-medium">/month</span>}
                </div>
                {isYearly && savings > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: colors.secondary }}>Save {savings}% yearly</span>
                  </div>
                )}
                {price === 0 && <span className="text-gray-500 text-sm mt-1">Forever free</span>}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold" style={{ color: colors.primary }}>Custom</span>
                <span className="text-gray-500 text-sm mt-1">Contact sales</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <ul className="space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Check className="w-3 h-3" style={{ color: colors.primary }} />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <button className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group ${plan.popular ? 'shadow-indigo-500/25 hover:shadow-indigo-500/40' : ''}`} style={{ background: plan.popular ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` : colors.primary }}>
              {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
