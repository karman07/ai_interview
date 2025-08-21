import { usePricing } from "@/contexts/PricingContext";
import PlanCard from "@/components/pricing/PlanCard";
import PricingToggle from "@/components/pricing/PricingToggle";
import PricingTrust from "@/components/pricing/PricingTrust";
export default function PricingPage() {
  const { pricingPlans, isYearly, setIsYearly } = usePricing();

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Choose Your
            <span className="block mt-2 bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)" }}>
              Interview Success Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl mx-auto">
            Unlock your potential with AI-powered interview preparation. From free practice to enterprise solutions, we have the perfect plan to accelerate your career growth.
          </p>
          <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} isYearly={isYearly} />
          ))}
        </div>
      </div>
      <PricingTrust />
    </div>
  );
}