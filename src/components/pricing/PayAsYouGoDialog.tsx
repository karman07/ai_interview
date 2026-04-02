import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Minus, Plus, CheckCircle2, Lock, ArrowRight,
  BarChart2, FileText, RefreshCw, AlertCircle, Clock,
  TrendingUp, Sparkles, Shield, CreditCard, Ticket,
} from 'lucide-react';
import { SubscriptionApi } from '@/api/subscription';
import { useAuth } from '@/contexts/AuthContext';

/* ── helpers ────────────────────────────────────────────────────────── */
const fmt = (n: number, country: string = 'IN') => {
  const symbol = country === 'US' ? '$' : '₹';
  if (country === 'US') {
    return `${symbol}${n.toFixed(2)}`;
  }
  return `${symbol}${n.toLocaleString('en-IN')}`;
};

declare global {
  interface Window { Razorpay: any; }
}

interface PaygStatus {
  monthlyBudgetRupees: number;
  pricePerInterviewRupees: number;
  pricePerResumeRupees: number;
  interviews: { used: number; limit: number; remaining: number };
  resumes: { used: number; limit: number; remaining: number };
  spending: { totalPaisaSpent: number; totalPaisaBudget: number; remainingPaisa: number };
  billingCycle: { start: string; end: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  countryCode?: string;
  defaultInterviewPrice?: number;
  defaultResumePrice?: number;
  minBudget?: number;
  maxBudget?: number;
}

const PRESETS = [99, 199, 299, 499, 999, 1999];

// Loads Razorpay SDK once
const loadRazorpay = (): Promise<boolean> =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const PayAsYouGoDialog: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  countryCode,
  defaultInterviewPrice = 49,
  defaultResumePrice = 29,
  minBudget = 99,
  maxBudget = 5000,
}) => {
  const { user } = useAuth();
  const userCountry = (countryCode || user?.country || 'IN').toUpperCase();
  const currencySymbol = userCountry === 'US' ? '$' : '₹';
  const countryDefaults = userCountry === 'US'
    ? { interview: 0.99, resume: 0.49, min: 1.99, max: 99.99 }
    : { interview: defaultInterviewPrice, resume: defaultResumePrice, min: minBudget, max: maxBudget };
  
  const [interviews, setInterviews] = useState(5);
  const [resumes, setResumes]       = useState(10);
  const [budget, setBudget]         = useState(299);
  const [loading, setLoading]       = useState(false);
  const [status, setStatus]         = useState<PaygStatus | null>(null);
  const [settings, setSettings] = useState<{
    id: string;
    pricePerInterviewRupees: number;
    pricePerResumeRupees: number;
    minBudgetRupees: number;
    maxBudgetRupees: number;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'configure' | 'processing' | 'done'>('configure');
  const [cancelling, setCancelling] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponData, setCouponData] = useState<{
    discountAmount: number;
    finalAmount: number;
    message: string;
    couponId: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Derive active settings (dynamic from backend or fallbacks)
  const interviewPrice = status?.pricePerInterviewRupees ?? settings?.pricePerInterviewRupees ?? countryDefaults.interview;
  const resumePrice    = status?.pricePerResumeRupees    ?? settings?.pricePerResumeRupees    ?? countryDefaults.resume;
  const activeMin      = settings?.minBudgetRupees ?? countryDefaults.min;
  const activeMax      = settings?.maxBudgetRupees ?? countryDefaults.max;

  const finalBudget = couponData ? Math.round(couponData.finalAmount / 100) : budget;

  // Sync budget based on counts
  useEffect(() => {
    const calc = (interviews * interviewPrice) + (resumes * resumePrice);
    setBudget(Math.max(activeMin, Math.min(activeMax, calc)));
    // Reset coupon if budget changes significantly? Or just re-validate?
    // For now, let's just clear it to avoid stale discounts
    setCouponData(null);
  }, [interviews, resumes, interviewPrice, resumePrice, activeMin, activeMax]);

  const interviewsEstimate = interviews;
  const resumesEstimate    = resumes;
  const clamp = (v: number) => Math.max(activeMin, Math.min(activeMax, v));
  const percent = Math.round((budget / activeMax) * 100);

  const loadStatus = useCallback(async () => {
    if (!user) return;
    setLoadingStatus(true);
    let hasActivePaygStatus = false;
    try {
      // 1. Load active subscription status if any
      const s = await SubscriptionApi.paygStatus();
      setStatus(s);
      setInterviews(s.interviews.limit);
      setResumes(s.resumes.limit);
      setBudget(s.monthlyBudgetRupees);
      hasActivePaygStatus = true;
    } catch { /* not on PAYG */ }
    
    try {
      // 2. Load global PAYG settings (prices/bounds)
      const config = await SubscriptionApi.getPaygSettings(userCountry); 
      setSettings(config);
      
      // If user isn't on PAYG, initialize defaults that make sense for the new settings
      if (!hasActivePaygStatus) {
        const defaultInterviews = 5;
        const defaultResumes = 10;
        setInterviews(defaultInterviews);
        setResumes(defaultResumes);
        setBudget(Math.max(config.minBudgetRupees, (defaultInterviews * config.pricePerInterviewRupees) + (defaultResumes * config.pricePerResumeRupees)));
      }
    } catch (e) {
      console.error('Failed to load PAYG settings', e);
    } finally {
      setLoadingStatus(false);
    }
  }, [user, userCountry]);

  useEffect(() => {
    if (open) {
      loadStatus();
      setError(null); setSuccess(false); setStep('configure');
      setCouponCode(''); setCouponData(null); setCouponError(null);
    }
  }, [open, loadStatus]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await SubscriptionApi.validateCoupon({
        code: couponCode,
        orderAmount: budget * 100, // in paisa
        subscriptionId: settings?.id, // Use the PAYG plan ID
      });
      if (res.valid) {
        setCouponData({
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          message: res.message,
          couponId: res.coupon?._id || '',
        });
      } else {
        setCouponError(res.message);
      }
    } catch (e: any) {
      setCouponError(e?.response?.data?.message ?? 'Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleBudgetChange = (val: number) => {
    setBudget(clamp(val));
    setCouponData(null); // Clear coupon on budget change
  };

  /** Full Razorpay subscription checkout flow */
  const handleStartPayment = async () => {
    if (!user) return;
    setLoading(true); setError(null); setStep('processing');

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Failed to load Razorpay SDK. Please check your connection.');

      // 1. Create Razorpay subscription on backend
      const { subscriptionId, razorpayKey, finalBudgetRupees } = await SubscriptionApi.createPaygSubscription(budget, couponCode || undefined);

      // 2. Open Razorpay checkout for autopay authorization
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: razorpayKey,
          subscription_id: subscriptionId,
          name: 'AI For Job',
          description: `Pay As You Go — ${fmt(finalBudgetRupees ?? budget, userCountry)}/month`,
          image: '/logo.png',
          prefill: {
            name:  (user as any).name  || '',
            email: (user as any).email || '',
            contact: (user as any).phone || '',
          },
          theme: { color: '#2563EB' },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_subscription_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 3. Verify payment + activate PAYG plan on backend
              await SubscriptionApi.verifyPaygSubscription({
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpayPaymentId:      response.razorpay_payment_id,
                razorpaySignature:      response.razorpay_signature,
                budgetRupees:           budget,
                interviews:             interviews,
                resumes:                resumes,
                couponCode:             couponCode || undefined,
              });
              resolve();
            } catch (e: any) {
              reject(new Error(e?.response?.data?.message ?? 'Payment verification failed.'));
            }
          },
          modal: {
            ondismiss: () => reject(new Error('DISMISSED')),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          reject(new Error(resp.error?.description ?? 'Payment failed'));
        });
        rzp.open();
      });

      // Success!
      setStep('done');
      setSuccess(true);
      await loadStatus();
      setTimeout(() => { onSuccess?.(); onClose(); }, 2500);

    } catch (e: any) {
      if (e.message === 'DISMISSED') {
        setStep('configure');
        setError(null);
      } else {
        setError(e.message ?? 'Something went wrong. Please try again.');
        setStep('configure');
      }
    } finally {
      setLoading(false);
    }
  };

  /** Update budget for existing PAYG subscriber (cancel old, create new) */
  const handleUpdateBudget = async () => {
    setLoading(true); setError(null);
    try {
      // Cancel old subscription on Razorpay side (backend handles it)
      await SubscriptionApi.paygCancel();
      setStatus(null);
      // Then re-initiate payment with new budget
      await handleStartPayment();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update budget.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your PAYG plan and revert to free tier? Your Razorpay autopay will be cancelled.')) return;
    setCancelling(true);
    try {
      await SubscriptionApi.paygCancel();
      setStatus(null); setBudget(299);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to cancel plan.');
    } finally { setCancelling(false); }
  };

  const spentPercent = status
    ? Math.min(100, (status.spending.totalPaisaSpent / status.spending.totalPaisaBudget) * 100)
    : 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#030712] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
          >

            {/* ── LEFT PANEL ── */}
            <div className="relative w-full md:w-[42%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-8 md:p-10 flex flex-col gap-7 overflow-hidden flex-shrink-0">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-[60px] pointer-events-none" />

              {/* Badge + title */}
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Flexible Billing</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-[1.05] tracking-tight">
                  Pay<br />
                  <span className="text-blue-200 opacity-70">As You Go</span>
                </h2>
                <p className="text-sm text-blue-100/70 mt-3 font-medium leading-relaxed max-w-xs">
                  Set your monthly budget. Razorpay auto-charges every month. Your limits reset automatically on each renewal.
                </p>
              </div>

              {/* Live budget preview */}
              <div className="relative bg-black/20 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl">
                <p className="text-[9px] font-black text-blue-200/50 uppercase tracking-[0.25em] mb-4">With {fmt(budget, userCountry)}/month</p>
                <div className="space-y-4">
                  {[
                    { icon: <BarChart2 className="w-4 h-4" />, label: 'Ai for jobs', count: interviewsEstimate, price: interviewPrice },
                    { icon: <FileText className="w-4 h-4" />,  label: 'Resume Scans',  count: resumesEstimate,    price: resumePrice },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-blue-200 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-white leading-none">{item.count}</span>
                          <span className="text-xs font-bold text-blue-200/70">{item.label}</span>
                        </div>
                        <p className="text-[10px] text-blue-300/50 mt-0.5">{fmt(item.price, userCountry)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-blue-200/50 mb-1.5">
                    <span>{fmt(activeMin, userCountry)}</span><span>{fmt(activeMax, userCountry)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${percent}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-300 to-white" />
                  </div>
                </div>
              </div>

              {/* Autopay info */}
              <div className="relative bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">How autopay works</p>
                {[
                  { icon: <CreditCard className="w-3 h-3" />, text: 'Authorize once via Razorpay' },
                  { icon: <RefreshCw className="w-3 h-3" />, text: 'Auto-charged every month' },
                  { icon: <BarChart2 className="w-3 h-3" />, text: 'Limits reset on each payment' },
                  { icon: <X className="w-3 h-3" />, text: 'Cancel anytime from dashboard' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-[11px] text-blue-200/60">
                    <span className="text-blue-300/50">{item.icon}</span> {item.text}
                  </div>
                ))}
              </div>

              {/* Active cycle */}
              {status && !loadingStatus && (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Current Cycle</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-blue-200/60 mb-1">
                      <span>Spent: {fmt(Math.round(status.spending.totalPaisaSpent / 100), userCountry)}</span>
                      <span>Budget: {fmt(status.spending.totalPaisaBudget / 100, userCountry)}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${spentPercent}%` }} transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${spentPercent > 80 ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-300/50 mt-1.5">
                      <Clock className="w-3 h-3" />
                      Renews {new Date(status.billingCycle.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative mt-auto flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-300/40" />
                <p className="text-[9px] font-black text-blue-200/40 uppercase tracking-[0.2em]">Secured by Razorpay · 256-bit SSL</p>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 flex flex-col gap-6">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {step === 'done' ? '🎉 Plan Activated!' : 'Configure Your Plan'}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                    {step === 'done'
                      ? `Your PAYG plan is active at ${fmt(budget, userCountry)}/month`
                      : 'Set a budget. Razorpay handles monthly autopay — your limits reset automatically.'}
                  </p>
                </div>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex-shrink-0 ml-3">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {step === 'done' ? (
                /* ── Success state ── */
                <div className="flex-1 flex flex-col items-center justify-center gap-5 py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{fmt(budget, userCountry)}/month</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your first charge has been processed. Limits have been set.</p>
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="text-center">
                        <p className="text-3xl font-black text-blue-600">{interviewsEstimate}</p>
                        <p className="text-xs text-gray-500">Interviews/mo</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                      <div className="text-center">
                        <p className="text-3xl font-black text-blue-600">{resumesEstimate}</p>
                        <p className="text-xs text-gray-500">Resume Scans/mo</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : step === 'processing' ? (
                /* ── Processing state ── */
                <div className="flex-1 flex flex-col items-center justify-center gap-5 py-8">
                  <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">Opening Razorpay…</p>
                    <p className="text-sm text-gray-400 mt-1">Authorize your monthly autopay of {fmt(budget, userCountry)}</p>
                  </div>
                </div>
              ) : (
                /* ── Configure state ── */
                <>
                  {/* Unit price chips */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <BarChart2 className="w-4 h-4" />, label: 'Per Interview', price: interviewPrice },
                      { icon: <FileText className="w-4 h-4" />,  label: 'Per Resume',    price: resumePrice },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">{item.icon}</div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold">{item.label}</p>
                          <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-none mt-0.5">{fmt(item.price, userCountry)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Count Selectors */}
                  <div className="space-y-6">
                    {/* Interviews Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Mock Interviews</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{interviews}</span>
                          <span className="text-xs text-gray-400 font-medium">/mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setInterviews(v => Math.max(1, v - 1))}
                          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all flex-shrink-0">
                          <Minus className="w-5 h-5" />
                        </button>
                        <input type="range" min={1} max={50} step={1} value={interviews}
                          onChange={e => setInterviews(Number(e.target.value))}
                          className="flex-1 accent-blue-600 h-2 rounded-full cursor-pointer" />
                        <button onClick={() => setInterviews(v => Math.min(100, v + 1))}
                          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all flex-shrink-0">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Resumes Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Resume Reports</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{resumes}</span>
                          <span className="text-xs text-gray-400 font-medium">/mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setResumes(v => Math.max(1, v - 1))}
                          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all flex-shrink-0">
                          <Minus className="w-5 h-5" />
                        </button>
                        <input type="range" min={1} max={100} step={1} value={resumes}
                          onChange={e => setResumes(Number(e.target.value))}
                          className="flex-1 accent-blue-600 h-2 rounded-full cursor-pointer" />
                        <button onClick={() => setResumes(v => Math.min(200, v + 1))}
                          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all flex-shrink-0">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Have a coupon code?</span>
                    </div>
                    
                    <div className="flex gap-3">
                      {couponData ? (
                        <div className="flex-1 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 px-4 py-3 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <div>
                              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none">{couponCode.toUpperCase()}</p>
                              <p className="text-[10px] text-emerald-500 font-medium mt-1 uppercase tracking-wider">{couponData.message}</p>
                            </div>
                          </div>
                          <button onClick={handleRemoveCoupon} className="text-emerald-600 hover:text-emerald-700 text-xs font-bold px-2 py-1">Remove</button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="FALLBACK50"
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponCode || validatingCoupon}
                            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
                          >
                            {validatingCoupon ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Apply'}
                          </button>
                        </>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 font-medium mt-2 ml-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                      </p>
                    )}
                  </div>

                  {/* Summary / Total Cost */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest opacity-70">Total Monthly Commitment</p>
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-3xl font-black">{fmt(finalBudget, userCountry)}</h4>
                          {couponData && (
                            <span className="text-sm font-medium text-blue-200 line-through opacity-60">{fmt(budget, userCountry)}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <CreditCard className="w-6 h-6 text-blue-100" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-[10px] font-bold text-blue-100/60 uppercase">Interviews</p>
                        <p className="text-sm font-black">{interviews} <span className="text-[10px] opacity-60 font-medium">x {fmt(interviewPrice, userCountry)}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-100/60 uppercase">Resumes</p>
                        <p className="text-sm font-black">{resumes} <span className="text-[10px] opacity-60 font-medium">x {fmt(resumePrice, userCountry)}</span></p>
                      </div>
                    </div>

                    {budget <= activeMin && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        MINIMUM BUDGET APPLIED ({fmt(activeMin, userCountry)})
                      </div>
                    )}
                  </div>

                  {/* Included */}
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'Only charged for what you actually use',
                      'Budget resets every month automatically',
                      'Cancel or change budget anytime',
                    ].map(f => (
                      <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CTA */}
                  <div className="mt-auto space-y-3">
                    {user ? (
                      <>
                        <motion.button whileTap={{ scale: 0.98 }}
                          onClick={status ? handleUpdateBudget : handleStartPayment}
                          disabled={loading}
                          className="w-full py-4 rounded-2xl font-black text-base text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          {loading ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Processing…</>
                          ) : status ? (
                            <><CreditCard className="w-5 h-5" /> Change Budget to {fmt(budget, userCountry)}/mo</>
                          ) : (
                            <><Zap className="w-5 h-5" /> Authorize Autopay — {fmt(budget, userCountry)}/mo</>
                          )}
                        </motion.button>
                        {status && (
                          <button onClick={handleCancel} disabled={cancelling}
                            className="w-full text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors py-1">
                            {cancelling ? 'Cancelling…' : 'Cancel PAYG plan → revert to free'}
                          </button>
                        )}
                        <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-semibold">
                          You will be redirected to Razorpay to authorize payment
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-4">
                        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-500">
                          <a href="/signup" className="text-blue-600 font-bold hover:underline">Create a free account</a>{' '}to set up Pay As You Go
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PayAsYouGoDialog;
