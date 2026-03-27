import { useState, useRef, useEffect } from 'react';
import { GraduationCap, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { UsersApi } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Shown to university students who have not yet set their roll number.
 * Blocks interaction (overlay) until a valid roll number is submitted.
 */
export default function RollNumberDialog() {
  const { user, refreshMe } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show for students who belong to a university and have no roll number
  const needsRollNumber =
    user?.role === 'student' &&
    !!user?.universityId &&
    !user?.rollNumber;

  useEffect(() => {
    if (needsRollNumber) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [needsRollNumber]);

  if (!needsRollNumber) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Roll number cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Roll number must be at least 3 characters.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await UsersApi.setRollNumber(trimmed);
      setSuccess(true);
      // Refresh user from backend so the dialog disappears
      await refreshMe();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Full-screen backdrop — blocks all interaction underneath */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', background: 'rgba(7, 11, 22, 0.85)' }}
    >
      <div
        className="w-full max-w-md bg-[#0d1526] border border-slate-700/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        style={{ animation: 'slideUpFade 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

        <div className="px-8 py-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-black text-white text-center mb-2">
            One Last Step
          </h2>
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-1">
            Your institution now requires a roll number to continue.
          </p>

          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 mt-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300/90 text-xs font-semibold leading-relaxed">
              Sorry, but a <span className="text-amber-300">Roll / Registration Number</span> is now
              compulsory for all university students. You will not be able to access the app until
              this is provided.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Roll / Registration Number
              </label>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(''); }}
                placeholder="e.g. 2024CS001"
                className="w-full h-12 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={saving || success}
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || success || !value.trim()}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 active:scale-[0.98]"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : success ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                'Continue to App'
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-600 mt-4">
            This information is used by your institution's administrators only.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
