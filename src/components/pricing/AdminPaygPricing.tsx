/**
 * AdminPaygPricing.tsx
 * Admin panel section for configuring Pay-as-You-Go unit prices.
 * Placed inside any admin page that manages subscription settings.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Save, RefreshCw, CheckCircle2, AlertCircle,
  BarChart2, FileText, DollarSign, Settings,
} from 'lucide-react';
import { SubscriptionApi } from '@/api/subscription';

interface PaygConfig {
  id: string;
  country: string;
  status: string;
  pricePerInterviewRupees: number;
  pricePerResumeRupees: number;
  minBudgetRupees: number;
  maxBudgetRupees: number;
}

const COUNTRIES = [
  { code: 'IN', label: 'India (INR ₹)', symbol: '₹' },
  { code: 'US', label: 'Global (USD $)', symbol: '$' },
];

export const AdminPaygPricing: React.FC = () => {
  const [country, setCountry]         = useState('IN');
  const [config, setConfig]           = useState<PaygConfig | null>(null);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Local form state
  const [interviewPrice, setInterviewPrice] = useState('');
  const [resumePrice, setResumePrice]       = useState('');
  const [minBudget, setMinBudget]           = useState('');
  const [maxBudget, setMaxBudget]           = useState('');

  const symbol = COUNTRIES.find(c => c.code === country)?.symbol ?? '₹';

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SubscriptionApi.adminGetPaygConfig(country);
      setConfig(data);
      if (data) {
        setInterviewPrice(String(data.pricePerInterviewRupees));
        setResumePrice(String(data.pricePerResumeRupees));
        setMinBudget(String(data.minBudgetRupees));
        setMaxBudget(String(data.maxBudgetRupees));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not load PAYG config.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, [country]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await SubscriptionApi.adminUpdatePaygConfig({
        country,
        pricePerInterviewRupees: parseFloat(interviewPrice),
        pricePerResumeRupees:    parseFloat(resumePrice),
        minBudgetRupees:         parseFloat(minBudget),
        maxBudgetRupees:         parseFloat(maxBudget),
      });
      setSuccess(true);
      await loadConfig();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save PAYG config.');
    } finally {
      setSaving(false);
    }
  };

  const interviewsForMin   = minBudget    ? Math.floor(parseFloat(minBudget)    / parseFloat(interviewPrice || '1')) : 0;
  const resumesForMin      = minBudget    ? Math.floor(parseFloat(minBudget)    / parseFloat(resumePrice || '1')) : 0;
  const interviewsForMax   = maxBudget    ? Math.floor(parseFloat(maxBudget)    / parseFloat(interviewPrice || '1')) : 0;
  const resumesForMax      = maxBudget    ? Math.floor(parseFloat(maxBudget)    / parseFloat(resumePrice || '1')) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-600/5 to-indigo-500/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
          <Zap className="w-4.5 h-4.5 text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Pay-as-You-Go Pricing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Set per-unit prices users are charged on the PAYG plan</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Country selector */}
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={loadConfig}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-violet-600 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Price inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <BarChart2 className="w-4 h-4" />,
                  label: 'Price per Interview',
                  hint: 'Charged each time a user starts a mock interview',
                  value: interviewPrice,
                  setter: setInterviewPrice,
                  id: 'payg-interview-price',
                },
                {
                  icon: <FileText className="w-4 h-4" />,
                  label: 'Price per Resume Scan',
                  hint: 'Charged each time a user runs a full resume analysis',
                  value: resumePrice,
                  setter: setResumePrice,
                  id: 'payg-resume-price',
                },
                {
                  icon: <DollarSign className="w-4 h-4" />,
                  label: 'Minimum Monthly Budget',
                  hint: 'Lowest amount a user can commit per month',
                  value: minBudget,
                  setter: setMinBudget,
                  id: 'payg-min-budget',
                },
                {
                  icon: <Settings className="w-4 h-4" />,
                  label: 'Maximum Monthly Budget',
                  hint: 'Highest amount a user can commit per month',
                  value: maxBudget,
                  setter: setMaxBudget,
                  id: 'payg-max-budget',
                },
              ].map(item => (
                <div key={item.id}>
                  <label htmlFor={item.id} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span className="text-violet-500">{item.icon}</span>
                    {item.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 dark:text-slate-400">
                      {symbol}
                    </span>
                    <input
                      id={item.id}
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.value}
                      onChange={e => item.setter(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{item.hint}</p>
                </div>
              ))}
            </div>

            {/* Preview */}
            {interviewPrice && resumePrice && minBudget && maxBudget && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-900/30 rounded-xl p-4"
              >
                <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-3">What users see</p>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
                  <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">At minimum budget ({symbol}{minBudget}/mo):</p>
                    <p>• Up to <strong>{interviewsForMin}</strong> interviews</p>
                    <p>• Up to <strong>{resumesForMin}</strong> resume scans</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">At maximum budget ({symbol}{maxBudget}/mo):</p>
                    <p>• Up to <strong>{interviewsForMax}</strong> interviews</p>
                    <p>• Up to <strong>{resumesForMax}</strong> resume scans</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Save */}
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : success ? (
                  <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                ) : (
                  <><Save className="w-4 h-4" /> Save PAYG Pricing</>
                )}
              </motion.button>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Changes take effect immediately for all new PAYG setups.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPaygPricing;
