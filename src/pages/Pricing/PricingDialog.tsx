import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, ArrowRight, HelpCircle, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import { usePricing } from '@/contexts/PricingContext';
import { useNavigate } from 'react-router-dom';
import routes from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionApi } from '@/api/subscription';
import { useState, useEffect } from 'react';

const PricingDialog = () => {
  const { showPricing, setShowPricing, pricingPlans, loading, error } = usePricing();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    valid: boolean; discountAmount: number; finalAmount: number;
    originalAmount: number; message: string; coupon?: any;
  } | null>(null);
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState<any>(null);

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (showPricing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset' };
  }, [showPricing]);

  const handleApplyCoupon = async (plan?: any) => {
    const targetPlan = plan || selectedPlanForCoupon;
    if (!couponInput.trim() || !targetPlan) return;
    setCouponLoading(true);
    setCouponResult(null);
    try {
      const orderAmountPaisa = Math.round(targetPlan.numericPrice * 100);
      const res = await SubscriptionApi.validateCoupon({
        code: couponInput.trim().toUpperCase(),
        orderAmount: orderAmountPaisa,
        subscriptionId: targetPlan.id,
      });
      setCouponResult({
        valid: res.valid,
        discountAmount: res.discountAmount,
        finalAmount: res.finalAmount,
        originalAmount: orderAmountPaisa,
        message: res.message,
        coupon: res.coupon,
      });
    } catch (e: any) {
      setCouponResult({ valid: false, discountAmount: 0, finalAmount: 0, originalAmount: 0, message: 'Failed to validate coupon. Try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const clearCoupon = () => {
    setCouponInput('');
    setCouponResult(null);
    setSelectedPlanForCoupon(null);
  };

  const handleCheckout = async (plan: any) => {
    if (!user) {
      navigate(routes.signup);
      setShowPricing(false);
      return;
    }

    const planId = plan.id;
    const amount = plan.numericPrice;

    if (!planId || amount === null) {
      console.log("Custom plan contact sales");
      return;
    }

    try {
      setProcessingId(planId);

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey || razorpayKey === "rzp_test_your_key") {
        throw new Error("Razorpay Key is not configured.");
      }

      // If coupon is applied for this plan, use one-time order with discount
      const isCouponForThisPlan = couponResult?.valid && selectedPlanForCoupon?.id === planId;

      if (isCouponForThisPlan) {
        // Use create-order endpoint which applies the discount
        const orderData = await SubscriptionApi.createOrderWithCoupon({
          amount,
          description: `${plan.name} Plan`,
          subscriptionId: planId,
          couponCode: couponInput.trim().toUpperCase(),
        });

        const options = {
          key: razorpayKey,
          order_id: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: "Career AI",
          description: `${plan.name} - ${couponInput.trim().toUpperCase()} applied`,
          handler: async (response: any) => {
            try {
              await SubscriptionApi.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCoupon();
              setShowPricing(false);
              window.location.reload();
            } catch (err) {
              console.error("Payment verification failed:", err);
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: "#2563EB" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Regular subscription flow (no coupon)
        const subData = await SubscriptionApi.createSubscription({ subscriptionId: planId });

        const options = {
          key: razorpayKey,
          subscription_id: subData.id,
          name: "Career AI",
          description: `Unlock ${plan.name} (Recurring)`,
          handler: async (response: any) => {
            try {
              await SubscriptionApi.verifySubscription({
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setShowPricing(false);
              window.location.reload();
            } catch (err) {
              console.error("Subscription verification failed:", err);
              alert("Subscription verification failed. Please contact support.");
            }
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: "#2563EB" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {showPricing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPricing(false)}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="w-full max-w-7xl bg-[#F9FAFB] dark:bg-gray-950 rounded-[3.5rem] shadow-2xl border border-white/20 dark:border-gray-800/50 relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPricing(false)}
              className="absolute top-8 right-8 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8 sm:p-12 md:p-16">
              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Simple Transparent Pricing
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Invest in Your <span className="text-blue-600">Future Career</span></h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">All plans are monthly recurring with autopay enabled for your convenience.</p>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Plans...</p>
                </div>
              ) : error ? (
                <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl border-2 border-red-100 dark:border-red-900/30 max-w-md mx-auto shadow-xl">
                  <X className="w-8 h-8 text-red-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">{error}</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`grid grid-cols-1 md:grid-cols-2 ${pricingPlans.length === 3 ? 'lg:grid-cols-3 max-w-6xl mx-auto' : 'lg:grid-cols-4'} gap-6 lg:gap-8`}
                >
                  {pricingPlans.map((plan) => {
                    const currentPlanId = user?.subscriptionPlan && typeof user.subscriptionPlan === 'object'
                      ? (user.subscriptionPlan as any)._id || (user.subscriptionPlan as any).id
                      : user?.subscriptionPlan;

                    const isFreeTier = plan.name.toLowerCase().includes('free');
                    const hasNoActivePlan = !user?.subscriptionPlan || user?.subscriptionStatus !== 'active';
                    const isCurrentPlan = (plan.id === currentPlanId && user?.subscriptionStatus === 'active') || (hasNoActivePlan && isFreeTier);

                    return (
                      <motion.div
                        key={plan.name}
                        variants={itemVariants}
                        className={`relative flex flex-col bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 transition-all duration-500 border-2 ${isCurrentPlan
                          ? 'border-blue-600 shadow-2xl scale-105 z-10'
                          : plan.popular
                            ? 'border-blue-500 shadow-2xl scale-105 z-10'
                            : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                          }`}
                      >
                        {isCurrentPlan ? (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                            <Check className="w-3 h-3" />
                            Current Plan
                          </div>
                        ) : plan.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                            Most Popular
                          </div>
                        )}

                        <div className="mb-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isCurrentPlan || plan.popular ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                            {typeof plan.icon === 'string' ? <span className="text-2xl">{plan.icon}</span> : plan.icon}
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{plan.description}</p>
                        </div>

                        <div className="mb-8 h-16 flex flex-col justify-center">
                          {/* Show discounted price if coupon is valid for this plan */}
                          {couponResult?.valid && selectedPlanForCoupon?.id === plan.id ? (
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-400 line-through tabular-nums">{plan.price}</span>
                                <span className="text-4xl font-black text-green-600 dark:text-green-400 tabular-nums tracking-tighter ml-2">
                                  ₹{(couponResult.finalAmount / 100).toFixed(0)}
                                </span>
                                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">/mo</span>
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                                You save ₹{(couponResult.discountAmount / 100).toFixed(0)}!
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{plan.price}</span>
                              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">/month</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 mb-10 flex-grow">
                          {plan.features.map((feature: string) => (
                            <div key={feature} className="flex items-start gap-3">
                              <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant={isCurrentPlan ? 'primary' : plan.popular ? 'primary' : 'outline'}
                          className="w-full py-4 text-[10px] font-black uppercase tracking-widest"
                          onClick={() => !isCurrentPlan && handleCheckout(plan)}
                          disabled={processingId !== null || isCurrentPlan}
                        >
                          {processingId === plan.id ? 'Processing...' : isCurrentPlan ? 'Active Plan' : (
                            <>
                              Get Started <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Coupon / Referral Code Section */}
              {!loading && !error && pricingPlans.length > 0 && (
                <div className="mt-12 max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800/40 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Have a Promo or Referral Code?</span>
                  </div>

                  {/* Plan selector */}
                  <div className="mb-3">
                    <select
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-300 font-medium"
                      value={selectedPlanForCoupon?.id || ''}
                      onChange={e => {
                        const p = pricingPlans.find(pl => pl.id === e.target.value);
                        setSelectedPlanForCoupon(p || null);
                        setCouponResult(null);
                      }}
                    >
                      <option value="">Select a plan to apply code to</option>
                      {pricingPlans.filter((p: any) => p.numericPrice > 0).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} – {p.price}/mo</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white font-mono uppercase placeholder:normal-case placeholder:font-sans"
                      placeholder="Enter code e.g. SAVE20 / REF5XY"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponResult(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    {couponResult?.valid ? (
                      <button
                        onClick={clearCoupon}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim() || !selectedPlanForCoupon}
                        className="px-4 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-40 transition-colors"
                        style={{ background: '#2563EB' }}
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>

                  {/* Result feedback */}
                  {couponResult && (
                    <div className={`mt-3 flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${couponResult.valid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                      {couponResult.valid ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                      <span className="font-medium">{couponResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-10 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Secure transactions powered by Razorpay Autopay
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingDialog;
