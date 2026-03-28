import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Minus, Plus, CheckCircle2, Lock,
  BarChart2, FileText, ArrowRight, RefreshCw, AlertCircle,
  TrendingUp, Clock,
} from 'lucide-react';
import { SubscriptionApi } from '@/api/subscription';
import { useAuth } from '@/contexts/AuthContext';

/* ── helpers ──────────────────────────────────────────────────────────── */
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface PaygStatus {
  monthlyBudgetRupees: number;
  pricePerInterviewRupees: number;
  pricePerResumeRupees: number;
  interviews: { used: number; limit: number; remaining: number };
  resumes:    { used: number; limit: number; remaining: number };
  spending:   { totalPaisaSpent: number; totalPaisaBudget: number; remainingPaisa: number };
  billingCycle: { start: string; end: string };
}

interface Props {
  defaultInterviewPrice?: number;
  defaultResumePrice?: number;
  minBudget?: number;
  maxBudget?: number;
  onSuccess?: () => void;
}

export const PayAsYouGoCard: React.FC<Props> = ({
  defaultInterviewPrice = 49,
  defaultResumePrice    = 29,
  minBudget             = 99,
  maxBudget             = 5000,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [budget, setBudget]         = useState(299);
  const [loading, setLoading]       = useState(false);
  const [status, setStatus]         = useState<PaygStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const interviewPrice     = status?.pricePerInterviewRupees ?? defaultInterviewPrice;
  const resumePrice        = status?.pricePerResumeRupees    ?? defaultResumePrice;
  const interviewsEstimate = Math.floor(budget / interviewPrice);
  const resumesEstimate    = Math.floor(budget / resumePrice);
  const clampBudget        = (v: number) => Math.max(minBudget, Math.min(maxBudget, v));

  const loadStatus = useCallback(async () => {
    if (!user) return;
    setLoadingStatus(true);
    try {
      const s = await SubscriptionApi.paygStatus();
      setStatus(s);
      setBudget(s.monthlyBudgetRupees);
    } catch { /* not on PAYG yet */ }
    finally { setLoadingStatus(false); }
  }, [user]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleSetup = async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      await SubscriptionApi.paygSetup(budget);
      setSuccess(true);
      await loadStatus();
      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your PAYG plan and revert to free tier?')) return;
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
    <div className="relative rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-900 shadow-lg shadow-blue-500/10 flex flex-col">
      {/* Top accent bar — blue */}
      <div className="h-[3px] w-full flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-400" />

      <div className="p-6 flex flex-col gap-5 flex-grow">

        {/* ── Header row ── */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-500 shadow-md shadow-blue-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">Pay As You Go</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Set your budget. Only pay for what you use.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest flex-shrink-0">
            Flexible
          </span>
        </div>

        {/* ── Unit prices — horizontal, compact ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Per Interview', price: interviewPrice },
            { icon: <FileText className="w-3.5 h-3.5" />,  label: 'Per Resume',    price: resumePrice },
          ].map(item => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mb-0.5">{item.label}</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white leading-none">{fmt(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Budget slider ── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly Budget</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{fmt(budget)}<span className="text-[10px] text-slate-400 font-medium">/mo</span></span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setBudget(v => clampBudget(v - 50))}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all border border-slate-200 dark:border-slate-700 flex-shrink-0"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={minBudget}
              max={maxBudget}
              step={50}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 rounded-full cursor-pointer"
            />
            <button
              onClick={() => setBudget(v => clampBudget(v + 50))}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all border border-slate-200 dark:border-slate-700 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex gap-1.5 flex-wrap">
            {[99, 199, 299, 499, 999].map(p => (
              <button
                key={p}
                onClick={() => setBudget(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  budget === p
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {fmt(p)}
              </button>
            ))}
          </div>
        </div>

        {/* ── What you get (compact) ── */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3">
          <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-2">
            With {fmt(budget)}/month you get
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{interviewsEstimate}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Interviews</span>
            </div>
            <div className="w-px h-6 bg-blue-200 dark:bg-blue-800" />
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{resumesEstimate}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Resume Scans</span>
            </div>
          </div>
        </div>

        {/* ── Active cycle status ── */}
        <AnimatePresence>
          {status && !loadingStatus && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
            >
              <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Current Cycle Usage</span>
              </div>
              <div className="p-3 space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Spent: {fmt(Math.round(status.spending.totalPaisaSpent / 100))}</span>
                    <span className="text-slate-500 font-medium">Budget: {fmt(status.spending.totalPaisaBudget / 100)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${spentPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${spentPercent > 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {[
                    { label: 'Interviews', val: status.interviews },
                    { label: 'Resumes', val: status.resumes },
                  ].map(r => (
                    <div key={r.label}>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.label}</p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {r.val.used} <span className="text-slate-400 font-medium text-xs">/ {r.val.limit}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <Clock className="w-3 h-3" />
                  Cycle ends {new Date(status.billingCycle.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA ── */}
        {user ? (
          <div className="flex flex-col gap-1.5 mt-auto">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSetup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : success ? (
                <><CheckCircle2 className="w-4 h-4" /> Plan updated!</>
              ) : status ? (
                <><ArrowRight className="w-4 h-4" /> Update to {fmt(budget)}/mo</>
              ) : (
                <><Zap className="w-4 h-4" /> Start — {fmt(budget)}/mo</>
              )}
            </motion.button>
            {status && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors text-center pt-0.5"
              >
                {cancelling ? 'Cancelling…' : 'Cancel PAYG plan'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <a href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Create a free account</a>{' '}to set up PAYG
            </p>
          </div>
        )}

        {/* ── Features ── */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <ul className="grid grid-cols-1 gap-1.5">
            {[
              'Charged only for what you use',
              'Budget resets every month · cancel anytime',
              'All interview types & full resume analysis',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PayAsYouGoCard;
