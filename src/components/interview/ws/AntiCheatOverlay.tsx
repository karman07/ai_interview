import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Maximize2, Eye, EyeOff, AlertTriangle,
  CheckCircle, XCircle, Zap,
} from 'lucide-react';
import type { ViolationType } from '@/hooks/useAntiCheat';

interface Props {
  visible: boolean;
  type: ViolationType | null;
  countdown: number;
  totalViolations: number;
  maxViolations: number;
  isDisqualified: boolean;
  onRequestFullscreen: () => void;
  onDismiss: () => void;
  onEndInterview?: () => void;
}

const VIOLATION_META: Record<ViolationType, { icon: React.ReactNode; title: string; body: string; action: string }> = {
  fullscreen_exit: {
    icon: <Maximize2 className="w-8 h-8" />,
    title: 'Fullscreen Required',
    body: 'You exited fullscreen mode. To maintain the integrity of this interview, you must stay in fullscreen at all times.',
    action: 'Enter Fullscreen',
  },
  tab_switch: {
    icon: <EyeOff className="w-8 h-8" />,
    title: 'Tab Switch Detected',
    body: 'You switched to another tab or window. This interview requires your full, undivided attention on this page.',
    action: 'I Understand',
  },
  copy_paste: {
    icon: <Eye className="w-8 h-8" />,
    title: 'Copy / Paste Detected',
    body: 'Copying or pasting is not allowed during this interview. Please answer all questions in your own words.',
    action: 'I Understand',
  },
  focus_lost: {
    icon: <EyeOff className="w-8 h-8" />,
    title: 'Focus Lost',
    body: 'The interview window lost focus. Please keep this tab active and do not switch applications.',
    action: 'Resume Interview',
  },
};

function ViolationDot({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
        filled
          ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
          : 'border-slate-600 bg-transparent'
      }`}
    />
  );
}

export default function AntiCheatOverlay({
  visible,
  type,
  countdown,
  totalViolations,
  maxViolations,
  isDisqualified,
  onRequestFullscreen,
  onDismiss,
  onEndInterview,
}: Props) {
  const meta = type ? VIOLATION_META[type] : VIOLATION_META['fullscreen_exit'];
  const remaining = maxViolations - totalViolations;
  const isFirstWarning = totalViolations === 0;
  const countdownPercent = (countdown / 15) * 100;

  // Pulsing ring when countdown is low
  const urgent = countdown <= 5;

  const handleAction = () => {
    if (type === 'fullscreen_exit') {
      onRequestFullscreen();
    } else {
      onDismiss();
    }
  };

  if (!visible && !isDisqualified) return null;

  return (
    <AnimatePresence>
      {(visible || isDisqualified) && (
        <motion.div
          key="anticheat-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Dark backdrop with subtle gradient */}
          <div className="absolute inset-0 bg-slate-950/90" />

          {/* Ambient glow */}
          <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
            isDisqualified
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12),transparent_60%)]'
              : urgent
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.10),transparent_60%)]'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.10),transparent_60%)]'
          }`} />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className={`rounded-3xl border shadow-2xl overflow-hidden ${
              isDisqualified
                ? 'border-rose-500/30 bg-gradient-to-b from-slate-900 to-slate-950'
                : 'border-indigo-500/20 bg-gradient-to-b from-slate-900 to-slate-950'
            }`}>

              {/* Top accent bar */}
              <div className={`h-1 w-full ${
                isDisqualified ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-600'
                : urgent ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500'
                : 'bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600'
              }`} />

              <div className="px-8 py-7">

                {/* ── DISQUALIFIED STATE ── */}
                {isDisqualified ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-rose-500/15 border-2 border-rose-500/30 flex items-center justify-center mx-auto mb-5"
                    >
                      <XCircle className="w-10 h-10 text-rose-500" />
                    </motion.div>

                    <h2 className="text-2xl font-black text-white mb-2">Disqualified</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      You have violated the interview integrity policy{' '}
                      <span className="text-rose-400 font-bold">{totalViolations} times</span>.
                      Your session has been terminated and your result will not be counted.
                    </p>

                    <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl px-5 py-4 mb-6 text-left space-y-1.5">
                      <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Violations recorded</div>
                      {[
                        { label: 'Tab / window switches', icon: <EyeOff size={12} /> },
                        { label: 'Fullscreen exits', icon: <Maximize2 size={12} /> },
                        { label: 'Focus losses', icon: <AlertTriangle size={12} /> },
                      ].map(v => (
                        <div key={v.label} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-rose-500">{v.icon}</span>{v.label}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={onEndInterview}
                      className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors"
                    >
                      End Session
                    </button>
                  </div>

                ) : (
                  /* ── WARNING STATE ── */
                  <>
                    {/* Icon + badge */}
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        urgent
                          ? 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                          : 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-400'
                      }`}>
                        {meta.icon}
                      </div>

                      {/* Violation counter dots */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Violations</span>
                        <div className="flex gap-1.5">
                          {Array.from({ length: maxViolations }).map((_, i) => (
                            <ViolationDot key={i} filled={i < totalViolations + 1} />
                          ))}
                        </div>
                        <span className={`text-xs font-bold ${remaining <= 1 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {remaining <= 1
                            ? `⚠ 1 more violation = disqualified`
                            : `${remaining - 1} warnings left`}
                        </span>
                      </div>
                    </div>

                    {/* Title & body */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert size={15} className={urgent ? 'text-orange-400' : 'text-indigo-400'} />
                        <h2 className="text-lg font-black text-white">{meta.title}</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{meta.body}</p>
                    </div>

                    {/* Countdown arc */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Time to comply</span>
                        <span className={`font-black text-base ${urgent ? 'text-orange-400' : 'text-indigo-400'}`}>
                          {countdown}s
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full transition-colors duration-300 ${
                            urgent ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          }`}
                          animate={{ width: `${countdownPercent}%` }}
                          transition={{ duration: 1, ease: 'linear' }}
                        />
                      </div>
                    </div>

                    {/* Rules list */}
                    <div className="bg-slate-800/50 rounded-2xl px-4 py-3.5 mb-5 space-y-2">
                      {[
                        { icon: <Maximize2 size={12} />, text: 'Stay in fullscreen at all times' },
                        { icon: <Eye size={12} />, text: 'Keep this tab visible and focused' },
                        { icon: <Zap size={12} />, text: 'Do not switch apps or open other tabs' },
                      ].map((rule, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs text-slate-400">
                          <span className="text-indigo-400 flex-shrink-0">{rule.icon}</span>
                          {rule.text}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.button
                      onClick={handleAction}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                        urgent
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/20'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-500/20'
                      }`}
                    >
                      {type === 'fullscreen_exit'
                        ? <><Maximize2 size={15} /> {meta.action}</>
                        : <><CheckCircle size={15} /> {meta.action}</>
                      }
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Outer glow ring */}
            <div className={`absolute -inset-px rounded-3xl pointer-events-none transition-opacity duration-500 ${
              isDisqualified
                ? 'shadow-[0_0_60px_rgba(239,68,68,0.15)]'
                : urgent
                ? 'shadow-[0_0_60px_rgba(251,146,60,0.12)]'
                : 'shadow-[0_0_60px_rgba(99,102,241,0.12)]'
            }`} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
