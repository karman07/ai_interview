import React, { createContext, useContext, useState } from "react";

import { Plan } from "@/types/plan";

interface PricingContextType {
  isYearly: boolean;
  setIsYearly: (val: boolean) => void;
  pricingPlans: Plan[];
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const usePricing = () => {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
};


export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isYearly, setIsYearly] = useState(false);
  const pricingPlans: Plan[] = [
    {
      name: "Starter",
      description: "Perfect for individuals starting their interview journey",
      icon: <span role="img" aria-label="sparkles">✨</span>,
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        "3 AI mock interviews per month",
        "Basic performance analytics",
        "Resume optimization tips",
        "Email support",
        "Access to question library",
        "Basic interview feedback"
      ],
      limitations: [
        "Limited to 3 interviews monthly",
        "Basic analytics only"
      ]
    },
    {
      name: "Professional",
      description: "Ideal for serious job seekers and career changers",
      icon: <span role="img" aria-label="zap">⚡</span>,
      monthlyPrice: 19,
      yearlyPrice: 15,
      popular: true,
      features: [
        "Unlimited AI mock interviews",
        "Advanced performance analytics",
        "Personalized improvement plans",
        "Industry-specific questions",
        "Real-time feedback & scoring",
        "Video interview practice",
        "Priority email support",
        "Resume & cover letter AI review",
        "Interview confidence tracking"
      ],
      limitations: []
    },
    {
      name: "Teams",
      description: "Built for organizations and hiring teams",
      icon: <span role="img" aria-label="users">👥</span>,
      monthlyPrice: 49,
      yearlyPrice: 39,
      popular: false,
      features: [
        "Everything in Professional",
        "Up to 10 team members",
        "Candidate screening tools",
        "Custom question banks",
        "Team analytics dashboard",
        "Bulk interview scheduling",
        "API access & integrations",
        "White-label options",
        "Dedicated account manager",
        "Advanced reporting"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      icon: <span role="img" aria-label="crown">👑</span>,
      monthlyPrice: null,
      yearlyPrice: null,
      popular: false,
      features: [
        "Everything in Teams",
        "Unlimited team members",
        "Custom AI model training",
        "Advanced security & compliance",
        "Single Sign-On (SSO)",
        "Custom integrations",
        "On-premise deployment",
        "24/7 phone support",
        "Custom reporting & analytics",
        "Dedicated success manager"
      ],
      limitations: []
    }
  ];
  return (
    <PricingContext.Provider value={{ isYearly, setIsYearly, pricingPlans }}>
      {children}
    </PricingContext.Provider>
  );
};
