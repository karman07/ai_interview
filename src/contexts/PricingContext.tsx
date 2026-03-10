import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SubscriptionPlan } from "@/types/subscription";
import { SubscriptionApi } from "@/api/subscription";

interface PlanUI {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  price: string;
  numericPrice: number;
  razorpayPlanId?: string;
  popular: boolean;
  features: string[];
  limitations: string[];
  currency: string;
}

interface PricingContextType {
  pricingPlans: PlanUI[];
  loading: boolean;
  error: string | null;
  refreshPlans: () => Promise<void>;
  showPricing: boolean;
  setShowPricing: (val: boolean) => void;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const usePricing = () => {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
};

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pricingPlans, setPricingPlans] = useState<PlanUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  const transformPlans = (apiPlans: SubscriptionPlan[]): PlanUI[] => {
    return apiPlans.map(plan => ({
      id: (plan as any)._id || plan.id,
      name: plan.displayName,
      description: plan.description || "Unlock premium features to accelerate your growth.",
      icon: plan.icon || (plan.displayName.toLowerCase().includes('starter') ? "✨" : plan.displayName.toLowerCase().includes('pro') ? "⚡" : "👥"),
      price: plan.formattedPrice || `${plan.currency} ${plan.price / 100}`,
      numericPrice: plan.price,
      razorpayPlanId: plan.razorpayPlanId,
      popular: plan.popular || false,
      features: plan.features.filter(f => f.enabled !== false).map(f => f.description || f.name),
      limitations: [],
      currency: plan.currency
    }));
  };

  const fetchPlans = useCallback(async (country: string = 'IN') => {
    try {
      setLoading(true);
      setError(null);
      const data = await SubscriptionApi.getActivePlans(country);
      const transformed = transformPlans(data);
      setPricingPlans(transformed);
    } catch (err: any) {
      console.error("Failed to fetch pricing plans:", err);
      // Fallback to IN if specific country fails
      if (country !== 'IN') {
        fetchPlans('IN');
      } else {
        setError("Failed to load subscription plans. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const detectCountryAndFetch = async () => {
      let country = 'IN';
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          country = data.country_code;
        }
      } catch (e) {
        console.warn("Country detection failed, defaulting to IN", e);
      }
      fetchPlans(country);
    };

    detectCountryAndFetch();
  }, [fetchPlans]);

  return (
    <PricingContext.Provider value={{
      pricingPlans,
      loading,
      error,
      refreshPlans: fetchPlans,
      showPricing,
      setShowPricing
    }}>
      {children}
    </PricingContext.Provider>
  );
};
