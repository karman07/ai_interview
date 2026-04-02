import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Sparkles, ArrowRight, Tag, CheckCircle2,
  AlertCircle, Shield, ChevronLeft, CreditCard, Lock,
  Zap, RefreshCw, User, ChevronDown,
} from 'lucide-react';
import { usePricing } from '@/contexts/PricingContext';
import { useNavigate } from 'react-router-dom';
import routes from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionApi } from '@/api/subscription';
import { useState, useEffect } from 'react';
import { PayAsYouGoDialog } from '@/components/pricing/PayAsYouGoDialog';

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtAmount = (lowestUnit: number, currency: string): string => {
  const major = lowestUnit / 100;
  if (currency === 'INR') return `\u20b9${major % 1 === 0 ? Math.round(major).toLocaleString('en-IN') : major.toFixed(2)}`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(major);
};

interface CouponState {
  valid: boolean; discountAmount: number; finalAmount: number;
  originalAmount: number; message: string; coupon?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
const PricingDialog = () => {
  const { showPricing, setShowPricing, pricingPlans, loading, error } = usePricing();
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<'plans' | 'checkout'>('plans');
  const [selectedPlan, setSelected] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [showPayg, setShowPayg] = useState(false);
  const [paygSettings, setPaygSettings] = useState<{ pricePerInterviewRupees: number; pricePerResumeRupees: number; country?: string } | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<CouponState | null>(null);

  const userCountry = user?.country?.toUpperCase() || 'IN';
  const plansCurrency = pricingPlans.find(p => p.numericPrice > 0)?.currency || pricingPlans[0]?.currency;
  const pricingCountry = plansCurrency === 'USD' ? 'US' : 'IN';
  const resolvedCountry = user?.country ? userCountry : pricingCountry;
  const currencySymbol = resolvedCountry === 'US' ? '$' : '₹';

  useEffect(() => {
    const loadPayg = async () => {
      try {
        const settings = await SubscriptionApi.getPaygSettings(resolvedCountry);
        setPaygSettings(settings);
      } catch (e) {
        console.error('Failed to load PAYG settings:', e);
      }
    };
    if (showPricing) loadPayg();

    if (!showPricing) {
      setView('plans'); setSelected(null);
      setCouponInput(''); setCouponResult(null);
      setShowPayg(false);
    }
  }, [showPricing, resolvedCountry]);

  useEffect(() => {
    document.body.style.overflow = showPricing ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPricing]);

  const openCheckout = (plan: any) => {
    if (!user) { navigate(routes.signup); setShowPricing(false); return; }
    setSelected(plan); setCouponInput(''); setCouponResult(null); setView('checkout');
  };

  const applyCoupon = async () => {
    if (!couponInput.trim() || !selectedPlan) return;
    setCouponLoading(true); setCouponResult(null);
    try {
      const res = await SubscriptionApi.validateCoupon({
        code: couponInput.trim().toUpperCase(),
        orderAmount: selectedPlan.numericPrice,
        subscriptionId: selectedPlan.id,
      });
      setCouponResult({
        valid: res.valid, discountAmount: res.discountAmount,
        finalAmount: res.finalAmount, originalAmount: selectedPlan.numericPrice,
        message: res.message, coupon: res.coupon,
      });
    } catch {
      setCouponResult({ valid: false, discountAmount: 0, finalAmount: 0, originalAmount: 0, message: 'Failed to validate coupon.' });
    } finally { setCouponLoading(false); }
  };

  const clearCoupon = () => { setCouponInput(''); setCouponResult(null); };

  const handlePay = async () => {
    if (!selectedPlan || !user) return;
    setProcessing(true);
    try {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey || razorpayKey === 'rzp_test_your_key') throw new Error('Razorpay key not configured.');
      const hasCoupon = couponResult?.valid;
      if (hasCoupon) {
        const orderData = await SubscriptionApi.createOrderWithCoupon({
          amount: selectedPlan.numericPrice, description: `${selectedPlan.name} Plan`,
          subscriptionId: selectedPlan.id, couponCode: couponInput.trim().toUpperCase(),
        });
        new (window as any).Razorpay({
          key: razorpayKey, order_id: orderData.id, amount: orderData.amount,
          currency: orderData.currency || selectedPlan.currency || 'INR',
          name: 'AI for Job', description: `${selectedPlan.name} \u00b7 ${couponInput.toUpperCase()}`,
          handler: async (r: any) => {
            try {
              const result = await SubscriptionApi.verifyPayment({ razorpayOrderId: r.razorpay_order_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
              console.log('[PricingDialog] Payment verified:', result);
              await refreshMe(); // ✅ Refresh user context with new limits
              setShowPricing(false);
              window.location.reload();
            } catch (err: any) { alert('Payment verification failed. Contact support.'); }
          },
          prefill: { name: user.name, email: user.email }, theme: { color: '#2563EB' },
        }).open();
      } else {
        const subData = await SubscriptionApi.createSubscription({ subscriptionId: selectedPlan.id });
        new (window as any).Razorpay({
          key: razorpayKey, subscription_id: subData.id,
          name: 'AI for Job', description: `${selectedPlan.name} \u2014 Monthly Recurring`,
          handler: async (r: any) => {
            try {
              const result = await SubscriptionApi.verifySubscription({ razorpaySubscriptionId: r.razorpay_subscription_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
              console.log('[PricingDialog] Subscription verified:', result);
              await refreshMe(); // ✅ Refresh user context with new limits
              setShowPricing(false);
              window.location.reload();
            } catch (err: any) { alert('Subscription verification failed: ' + (err?.message || 'Contact support.')); }
          },
          prefill: { name: user.name, email: user.email }, theme: { color: '#2563EB' },
        }).open();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate payment.');
    } finally { setProcessing(false); }
  };

  const getCurrentPlanId = () =>
    user?.subscriptionPlan && typeof user.subscriptionPlan === 'object'
      ? (user.subscriptionPlan as any)._id || (user.subscriptionPlan as any).id
      : user?.subscriptionPlan;

  const isCurrentPlan = (plan: any) => {
    const cpId = getCurrentPlanId();
    const isFreeTier = plan.name.toLowerCase().includes('free');
    const hasNoActive = !user?.subscriptionPlan || user?.subscriptionStatus !== 'active';
    return (plan.id === cpId && user?.subscriptionStatus === 'active') || (hasNoActive && isFreeTier);
  };

  const finalPrice = couponResult?.valid ? couponResult.finalAmount : selectedPlan?.numericPrice;
  const currency = selectedPlan?.currency || 'INR';

  return (
    <AnimatePresence>
      {showPricing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPricing(false)}
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md"
          />

          <AnimatePresence mode="wait">

            {/* ═══════════════════ PLANS VIEW ═══════════════════ */}
            {view === 'plans' && (
              <motion.div
                key="plans"
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="relative w-full max-w-6xl bg-white dark:bg-[#030712] rounded-[2.5rem] shadow-2xl dark:shadow-[0_0_100px_rgba(37,99,235,0.1)] border border-gray-200 dark:border-white/5 flex flex-col max-h-[95vh] overflow-hidden"
              >
                {/* background decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-64 bg-gradient-to-b from-blue-600/10 to-transparent blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

                {/* header */}
                <div className="relative flex items-center justify-between px-10 py-8 shrink-0">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Upgrade your potential</h2>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.2em] mt-1">Select the tier that fits your ambition</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPricing(false)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* plan cards */}
                <div className="relative overflow-y-auto flex-1 p-8 md:p-10 custom-scrollbar">
                  {loading ? (
                    <div className="py-32 flex flex-col items-center gap-6">
                      <div className="w-14 h-14 border-[5px] border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
                      <p className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">Calibrating Plans…</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-20 bg-red-50 dark:bg-red-950/20 rounded-[2rem] border border-red-200 dark:border-red-900/30 max-w-2xl mx-auto">
                      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                      <p className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Access Interrupted</p>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                    </div>
                  ) : (
                    <motion.div
                      initial="hidden" animate="visible"
                      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                      className={`grid grid-cols-1 sm:grid-cols-2 ${
                        pricingPlans.filter(p => (p as any).type !== 'pay_as_you_go').length >= 4
                          ? 'lg:grid-cols-4'
                          : 'lg:grid-cols-3'
                      } gap-8`}
                    >
                      {pricingPlans.filter(p => (p as any).type !== 'pay_as_you_go').map(plan => {
                        const isCurrent = isCurrentPlan(plan);
                        const isFree = plan.numericPrice === 0;
                        const highlight = !isCurrent && plan.popular;

                        return (
                          <motion.div
                            key={plan.id}
                            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                            className={`group relative flex flex-col rounded-[2.5rem] p-8 border transition-all duration-500 ${isCurrent
                              ? 'border-emerald-500/50 bg-emerald-500/5 ring-4 ring-emerald-500/10'
                              : highlight
                                ? 'border-blue-500/50 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] scale-[1.05] z-10'
                                : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] hover:border-blue-200 dark:hover:border-white/20 hover:shadow-2xl hover:-translate-y-2'
                              }`}
                          >
                            {/* status badge */}
                            {(isCurrent || highlight) && (
                              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl whitespace-nowrap z-20 ${isCurrent ? 'bg-emerald-500 text-white' : 'bg-white text-blue-600'
                                }`}>
                                {isCurrent ? 'Currently Active' : 'Most Popular'}
                              </div>
                            )}

                            {/* plan icon */}
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500 ${highlight
                              ? 'bg-white/10 backdrop-blur-md border border-white/20'
                              : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10'
                              }`}>
                              {typeof plan.icon === 'string'
                                ? <span className="text-3xl filter drop-shadow-md">{plan.icon}</span>
                                : <span className={highlight ? 'text-white' : 'text-blue-500'}>{plan.icon}</span>
                              }
                            </div>

                            <div className="mb-8">
                              <h3 className={`text-2xl font-black tracking-tight ${highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                              <p className={`text-sm font-medium mt-2 leading-relaxed h-12 overflow-hidden ${highlight ? 'text-blue-100/80' : 'text-gray-500 dark:text-gray-400'}`}>{plan.description}</p>
                            </div>

                            {/* pricing details */}
                            <div className="mb-8">
                              <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-black tracking-tighter ${highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</span>
                                {!isFree && <span className={`text-sm font-bold uppercase tracking-widest ${highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>/month</span>}
                              </div>
                              <div className="h-4 flex items-center gap-2 mt-2">
                                {!isFree && (
                                  <>
                                    <div className={`w-1 h-1 rounded-full ${highlight ? 'bg-blue-300' : 'bg-blue-600'}`} />
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>Auto-renewal Enabled</p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* features list */}
                            <div className="space-y-4 flex-grow mb-10">
                              <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 ${highlight ? 'text-blue-200' : 'text-gray-400 dark:text-white/40'}`}>Includes:</p>
                              {plan.features.slice(0, 6).map((f: string) => (
                                <div key={f} className="flex items-start gap-4">
                                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${highlight ? 'bg-white/10' : 'bg-blue-600/20'}`}>
                                    <Check className={`w-3 h-3 ${highlight ? 'text-white' : 'text-blue-500'}`} strokeWidth={4} />
                                  </div>
                                  <span className={`text-xs font-bold leading-tight ${highlight ? 'text-blue-50' : 'text-gray-600 dark:text-gray-300'}`}>{f}</span>
                                </div>
                              ))}
                              {plan.features.length > 6 && (
                                <div className="flex items-center gap-3 pt-2">
                                  <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className={`w-5 h-5 rounded-full border-2 ${highlight ? 'border-blue-600 bg-blue-400' : 'border-white dark:border-[#030712] bg-gray-200 dark:bg-gray-700'}`} />)}
                                  </div>
                                  <span className={`text-[11px] font-black uppercase tracking-widest ${highlight ? 'text-blue-200' : 'text-blue-500'}`}>
                                    +{plan.features.length - 6} Premium Benefits
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* CTA button */}
                            <button
                              onClick={() => !isCurrent && !isFree && openCheckout(plan)}
                              disabled={isCurrent || isFree || processing}
                              className={`w-full py-5 rounded-[1.25rem] text-sm font-black transition-all duration-300 flex items-center justify-center gap-3 group/btn overflow-hidden relative
                                ${isCurrent
                                  ? 'bg-transparent text-emerald-500 dark:text-emerald-500 cursor-default border-2 border-emerald-500/20 pointer-events-none'
                                  : isFree
                                    ? `cursor-default ${highlight ? 'bg-white/10 text-blue-200' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'}`
                                    : highlight
                                      ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-xl active:scale-95'
                                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-500/50'
                                }`}
                            >
                              {isCurrent ? (
                                <><div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" strokeWidth={4} /></div> Currently Using</>
                              ) : isFree ? 'Free Forever' : (
                                <>
                                  Get Unlimited Access
                                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1.5" />
                                </>
                              )}
                            </button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                {/* ── PAYG trigger ── */}
                <div className="px-8 md:px-10 pb-10">
                  <button
                    onClick={() => setShowPayg(true)}
                    className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800/60 bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/20 hover:border-blue-400 dark:hover:border-blue-600 hover:from-blue-100/80 hover:to-indigo-100/50 dark:hover:from-blue-950/50 transition-all duration-200 group text-left"
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest leading-none">Pay As You Go</p>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider">New</span>
                      </div>
                      <p className="text-[12px] text-blue-500/70 dark:text-blue-400/60 font-medium">
                        Set your own budget &mdash; {currencySymbol}{paygSettings?.pricePerInterviewRupees ?? (resolvedCountry === 'US' ? 0.99 : 49)}/interview &middot; {currencySymbol}{paygSettings?.pricePerResumeRupees ?? (resolvedCountry === 'US' ? 0.49 : 29)}/resume &middot; cancel anytime
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronDown className="w-4 h-4 text-blue-500 group-hover:text-white -rotate-90" />
                    </div>
                  </button>
                </div>

                {/* PAYG dialog */}
                <PayAsYouGoDialog
                  open={showPayg}
                  onClose={() => setShowPayg(false)}
                  countryCode={resolvedCountry}
                  onSuccess={() => { setShowPayg(false); setShowPricing(false); }}
                />

                {/* footer */}
                <div className="relative px-10 py-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Bank-level 256-bit SSL Security</p>
                    </div>
                    <div className="flex items-center gap-3 ml-6 font-bold text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-600">
                      <span onClick={() => { setShowPricing(false); navigate(routes.privacy); }} className="hover:text-blue-500 cursor-pointer transition-colors">Privacy Policy</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-800" />
                      <span onClick={() => { setShowPricing(false); navigate(routes.terms); }} className="hover:text-blue-500 cursor-pointer transition-colors">Terms of Service</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <span className="text-[9px] font-black text-gray-500 dark:text-white/40 tracking-widest uppercase">Trusted worldwide by</span>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-900 dark:text-white font-black text-xs tracking-tighter">RAZORPAY</div>
                      <div className="w-px h-3 bg-gray-200 dark:bg-white/20" />
                      <div className="text-gray-900 dark:text-white font-black text-xs tracking-tighter italic">VISA</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════ CHECKOUT VIEW ═══════════════════ */}
            {view === 'checkout' && selectedPlan && (
              <motion.div
                key="checkout"
                initial={{ scale: 0.9, opacity: 0, x: 100 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.9, opacity: 0, x: -100 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="relative w-full max-w-5xl bg-white dark:bg-[#030712] rounded-[2.5rem] shadow-2xl dark:shadow-[0_0_100px_rgba(37,99,235,0.15)] border border-gray-200 dark:border-white/5 flex flex-col max-h-[92vh] overflow-hidden"
              >
                {/* header */}
                <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-white/5 shrink-0 bg-gray-50 dark:bg-white/[0.01]">
                  <button
                    onClick={() => setView('plans')}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" /> Go Back
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                      <Lock className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase">Secured Checkpoint</span>
                  </div>
                  <button
                    onClick={() => setShowPricing(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col md:flex-row h-full min-h-0">

                    {/* ── LEFT: high-end summary ─────────────────────── */}
                    <div className="w-full md:w-[42%] bg-gradient-to-br from-blue-700 to-blue-900 p-10 flex flex-col gap-10 shrink-0 relative overflow-hidden">
                      {/* stylistic shapes */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4" />

                      <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-5">
                          <Zap className="w-3 h-3 text-blue-200" />
                          <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest">Premium Allocation</span>
                        </div>
                        <h3 className="text-4xl font-black text-white leading-[0.9] tracking-tighter italic">{selectedPlan.name.split(' ')[0]}<br /><span className="text-blue-200 opacity-60 not-italic">EDITION</span></h3>
                        <p className="text-sm text-blue-100/70 mt-4 leading-relaxed font-bold">{selectedPlan.description}</p>
                      </div>

                      {/* premium receipt */}
                      <div className="relative bg-black/20 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-blue-200/60 uppercase tracking-widest">Selected Tier</span>
                            <span className={`text-sm font-black text-white ${couponResult?.valid ? 'line-through opacity-30 italic' : ''}`}>
                              {selectedPlan.price}
                            </span>
                          </div>
                          {couponResult?.valid && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs font-black text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                                <Tag className="w-3.5 h-3.5" strokeWidth={3} />
                                Bonus Applied
                              </span>
                              <span className="text-sm font-black text-emerald-400">
                                &minus;{fmtAmount(couponResult.discountAmount, currency)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-white/10 pt-6 mt-2">
                            <div className="flex items-end justify-between">
                              <div>
                                <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] opacity-60">Total Commitment</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <p className="text-5xl font-black text-white leading-none tracking-tighter tabular-nums">{fmtAmount(finalPrice!, currency)}</p>
                                  <span className="text-xs font-bold text-blue-200/50 uppercase">/mo</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* micro feature list */}
                      <div className="relative grid grid-cols-1 gap-4">
                        <p className="text-[9px] font-black text-blue-100/40 uppercase tracking-[0.3em]">Institutional Benefits</p>
                        {selectedPlan.features.slice(0, 4).map((f: string) => (
                          <div key={f} className="flex items-center gap-4 group/item">
                            <div className="w-2 h-2 rounded-full border border-blue-300 ring-4 ring-blue-300/10 group-hover/item:scale-125 transition-transform" />
                            <span className="text-xs font-bold text-blue-50/90">{f}</span>
                          </div>
                        ))}
                      </div>

                      <div className="relative mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-300" />
                          </div>
                          <p className="text-[10px] font-black text-blue-200/50 uppercase tracking-[0.2em]">End-to-end encrypted settlement</p>
                        </div>
                      </div>
                    </div>

                    {/* ── RIGHT: checkout controls ────────────────────── */}
                    <div className="flex-1 p-10 md:p-14 flex flex-col gap-10 overflow-y-auto custom-scrollbar">

                      {/* account identifier */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em]">Identity Verification</p>
                        </div>
                        <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-inner transition-all hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:border-gray-200 dark:hover:border-white/10 group">
                          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                            {user?.name ? <span className="text-xl font-black text-white">{user.name[0].toUpperCase()}</span> : <User className="w-6 h-6 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">{user?.name || 'Authorized User'}</h4>
                            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 truncate mt-0.5 italic">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* voucher system */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Voucher / Invitation</p>
                          {couponResult?.valid && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Activation Successful</span>}
                        </div>
                        <div className="flex gap-4">
                          <div className="relative flex-1 group">
                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                              type="text"
                              className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] text-sm font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white placeholder:normal-case placeholder:font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all disabled:opacity-30 self-center"
                              placeholder="Redeem code..."
                              value={couponInput}
                              onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponResult(null); }}
                              onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                              disabled={couponResult?.valid}
                            />
                          </div>
                          {couponResult?.valid ? (
                            <button onClick={clearCoupon} className="px-8 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95">
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={applyCoupon}
                              disabled={couponLoading || !couponInput.trim()}
                              className="px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-gray-600 dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-20 transition-all active:scale-95 flex items-center justify-center min-w-[120px] border border-gray-200 dark:border-white/10"
                            >
                              {couponLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Apply'}
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {couponResult && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className={`flex items-start gap-4 p-6 rounded-[1.5rem] border ${couponResult.valid
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/5 border-red-500/20 text-red-400'
                                }`}
                            >
                              {couponResult.valid ? <Sparkles className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                              <div className="flex-1">
                                <p className="font-black text-xs uppercase tracking-widest mb-1">{couponResult.valid ? 'Access Granted' : 'Validation Error'}</p>
                                <p className="text-xs font-bold opacity-80 leading-relaxed italic">{couponResult.message}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* payment processor */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em]">Settlement Engine</p>
                        <div className="p-6 rounded-[1.5rem] border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] flex items-center gap-5 group/pay transition-colors hover:border-gray-200 dark:hover:border-white/10">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#030712] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-2xl shrink-0 group-hover/pay:border-blue-500/50 transition-colors">
                            <CreditCard className="w-6 h-6 text-gray-400 group-hover/pay:text-blue-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Razorpay Global</h4>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 italic uppercase tracking-wider">UPI &middot; CRYPTO &middot; VISA &middot; AMEX</p>
                          </div>
                        </div>
                      </div>

                      {/* recurring disclaimer */}
                      <div className="p-6 rounded-[1.5rem] bg-blue-600/5 border border-blue-600/10 flex gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                          <RefreshCw className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-blue-400 uppercase tracking-wider italic">Subscription Policy</p>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-[320px]">
                            {couponResult?.valid
                              ? `Initial commitment of ${fmtAmount(couponResult.finalAmount, currency)} required. Future cycles revert to ${selectedPlan.price}/month.`
                              : `Authorized for ${selectedPlan.price} recurring monthly extraction. One-click termination at any time.`}
                          </p>
                        </div>
                      </div>

                      {/* launch sequence */}
                      <div className="mt-4 space-y-6">
                        <button
                          onClick={handlePay}
                          disabled={processing}
                          className="w-full py-6 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-lg flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(37,99,235,0.25)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] disabled:opacity-20 group/go relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/go:translate-x-full transition-transform duration-1000" />
                          {processing ? (
                            <><RefreshCw className="w-6 h-6 animate-spin" /> Synchronizing…</>
                          ) : (
                            <>
                              Initialize Protocol: {fmtAmount(finalPrice!, currency)}
                              <Zap className="w-5 h-5 transition-transform group-hover/go:scale-125" />
                            </>
                          )}
                        </button>

                        <div className="flex flex-col items-center gap-4">
                          <p className="text-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest max-w-[340px] leading-loose">
                            Commitment signifies agreement to the{' '}
                            <span
                              onClick={() => { setShowPricing(false); navigate(routes.terms); }}
                              className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors border-b border-blue-500/30"
                            >
                              Terms of Service
                            </span>{' '}
                            &amp;{' '}
                            <span
                              onClick={() => { setShowPricing(false); navigate(routes.privacy); }}
                              className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors border-b border-blue-500/30"
                            >
                              Privacy Policy
                            </span>.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingDialog;
