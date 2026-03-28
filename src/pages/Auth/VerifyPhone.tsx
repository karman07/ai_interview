import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import routes from '@/constants/routes';
import { Phone, ShieldCheck, ShieldAlert, MessageSquare, ChevronDown, Search } from 'lucide-react';
import http from '@/api/http';

interface CountryOption {
  code: string;
  flag: string;
  name: string;
}

export default function VerifyPhone() {
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp' | 'done'>('phone');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [dialOpen, setDialOpen] = useState(false);
  const [dialSearch, setDialSearch] = useState('');
  const dialRef = useRef<HTMLDivElement>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch countries from REST Countries API
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flag,idd')
      .then(r => r.json())
      .then((data: any[]) => {
        const parsed: CountryOption[] = data
          .filter(c => c.idd?.root && c.idd.suffixes?.length)
          .map(c => ({
            name: c.name.common,
            flag: c.flag,
            code: c.idd.suffixes.length === 1
              ? `${c.idd.root}${c.idd.suffixes[0]}`
              : c.idd.root,
          }))
          .filter(c => /^\+\d+$/.test(c.code))
          .sort((a, b) => a.name.localeCompare(b.name));
        // Dedupe by code, keep first alphabetically
        const seen = new Set<string>();
        const unique = parsed.filter(c => {
          if (seen.has(c.code)) return false;
          seen.add(c.code);
          return true;
        });
        // Ensure +1 always resolves to United States, not Canada
        const withUSA = unique.map(c =>
          c.code === '+1' ? { code: '+1', flag: '🇺🇸', name: 'United States' } : c
        );
        setCountries(withUSA);
      })
      .catch(() => {
        // Fallback to common codes if API fails
        setCountries([
          { code: '+91', flag: '🇮🇳', name: 'India' },
          { code: '+1', flag: '🇺🇸', name: 'United States' },
          { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
          { code: '+61', flag: '🇦🇺', name: 'Australia' },
          { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
          { code: '+65', flag: '🇸🇬', name: 'Singapore' },
          { code: '+49', flag: '🇩🇪', name: 'Germany' },
          { code: '+33', flag: '🇫🇷', name: 'France' },
          { code: '+81', flag: '🇯🇵', name: 'Japan' },
          { code: '+86', flag: '🇨🇳', name: 'China' },
        ]);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dialRef.current && !dialRef.current.contains(e.target as Node)) {
        setDialOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedCountry = countries.find(c => c.code === countryCode);
  const filteredCountries = countries.filter(
    c =>
      c.name.toLowerCase().includes(dialSearch.toLowerCase()) ||
      c.code.includes(dialSearch),
  );

  // If already phone-verified, skip to dashboard
  useEffect(() => {
    if (user?.isPhoneVerified) {
      navigate(routes.dashboard, { replace: true });
    }
  }, [user]);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const clearRecaptcha = () => {
    try { recaptchaVerifierRef.current?.clear(); } catch (_) {}
    recaptchaVerifierRef.current = null;
  };

  const getOrCreateRecaptcha = (): RecaptchaVerifier => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    const v = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': clearRecaptcha,
    });
    recaptchaVerifierRef.current = v;
    return v;
  };

  const sendOtp = async () => {
    setError('');
    const trimmed = phoneNumber.trim().replace(/\s/g, '').replace(/^0+/, '');
    if (!trimmed || trimmed.length < 7) {
      setError('Please enter a valid phone number (without leading zeros or country code).');
      return;
    }
    setLoading(true);
    try {
      const verifier = getOrCreateRecaptcha();
      // Render must complete before signInWithPhoneNumber
      await verifier.render();
      const full = `${countryCode}${trimmed}`;
      const result = await signInWithPhoneNumber(auth, full, verifier);
      setConfirmationResult(result);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      clearRecaptcha();
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check the number and country code.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/invalid-app-credential') {
        setError('reCAPTCHA check failed. Please refresh the page and try again.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.');
      return;
    }
    setLoading(true);
    try {
      const credential = await confirmationResult.confirm(code);
      const firebaseIdToken = await credential.user.getIdToken();

      // Tell our backend: this userId has verified this phone number
      await http.post('/auth/verify-phone', { firebaseIdToken });

      await refreshMe();
      setStep('done');
      setSuccess('Phone number verified successfully!');
      setTimeout(() => navigate(routes.dashboard, { replace: true }), 2000);
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect code. Please check the SMS and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('This code has expired. Please request a new one.');
      } else if (err?.response?.status === 409) {
        setError(
          err.response.data?.message ||
          'This phone number is already associated with another account. Please use a different number.',
        );
      } else {
        setError(err?.response?.data?.message || err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const nextEmpty = next.findIndex(d => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div id="recaptcha-container" />

      {/* Logo / brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <Phone className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-800 tracking-tight">Ai for job</span>
      </div>

      {/* Step progress */}
      <div className="flex items-center mb-8 gap-0">
        {[
          { label: 'Email', done: true },
          { label: 'Phone', active: step === 'phone' || step === 'otp', done: step === 'done' },
          { label: 'Done', active: step === 'done', done: false },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.done ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : s.active ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`text-[11px] mt-1 font-semibold ${
                s.active ? 'text-blue-600' : s.done ? 'text-emerald-500' : 'text-gray-400'
              }`}>{s.label}</span>
            </div>
            {i < 2 && (
              <div className={`h-0.5 w-16 mx-1.5 rounded-full mb-4 transition-all ${
                i === 0 ? 'bg-emerald-400' : step === 'done' ? 'bg-emerald-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

        {/* ── STEP: phone ── */}
        {step === 'phone' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Verify your phone number</h1>
              <p className="text-sm text-gray-500 mt-1">We'll send a 6-digit SMS code to confirm it's you.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-2.5 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                {/* Searchable country dial code picker */}
                <div ref={dialRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { setDialOpen(o => !o); setDialSearch(''); }}
                    className="h-full min-w-[90px] flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer hover:border-blue-400 transition"
                  >
                    <span>{selectedCountry?.flag ?? '🌐'}</span>
                    <span className="text-gray-700">{countryCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                  </button>

                  {dialOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* Search input */}
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search country…"
                          value={dialSearch}
                          onChange={e => setDialSearch(e.target.value)}
                          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                        />
                      </div>
                      {/* List */}
                      <ul className="max-h-52 overflow-y-auto">
                        {filteredCountries.length === 0 ? (
                          <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
                        ) : (
                          filteredCountries.map(c => (
                            <li
                              key={c.name}
                              onClick={() => { setCountryCode(c.code); setDialOpen(false); setDialSearch(''); }}
                              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition ${
                                c.code === countryCode ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <span className="text-base">{c.flag}</span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-xs text-gray-400 shrink-0">{c.code}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={e => {
                    setPhoneNumber(e.target.value.replace(/[^\d]/g, ''));
                    setPhoneError('');
                  }}
                  onBlur={async () => {
                    const trimmed = phoneNumber.trim().replace(/^0+/, '');
                    if (!trimmed || trimmed.length < 7) return;
                    setPhoneChecking(true);
                    try {
                      const res = await http.post('/auth/check-phone', { phoneNumber: `${countryCode}${trimmed}` });
                      if (res.data?.taken) {
                        setPhoneError('This number is already linked to another account.');
                      }
                    } catch (_) {}
                    finally { setPhoneChecking(false); }
                  }}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  className={`flex-1 rounded-xl border bg-white px-4 py-3 text-gray-900 text-sm outline-none transition focus:ring-2 ${
                    phoneError
                      ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
                      : 'border-gray-200 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                  maxLength={15}
                  autoFocus
                />
              </div>
              {phoneChecking && (
                <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                  Checking…
                </p>
              )}
              {!phoneChecking && phoneError && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  {phoneError}
                </p>
              )}
              {!phoneChecking && !phoneError && (
                <p className="mt-1.5 text-xs text-gray-400">Enter without country code or leading zeros</p>
              )}
            </div>

            <button
              onClick={sendOtp}
              disabled={loading || !phoneNumber || !!phoneError || phoneChecking}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Send Verification Code
                </>
              )}
            </button>
          </>
        )}

        {/* ── STEP: OTP ── */}
        {step === 'otp' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Enter the code</h1>
              <p className="text-sm text-gray-500 mt-1">
                Sent to <span className="font-medium text-gray-700">{countryCode} {phoneNumber}</span>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-2.5 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-start gap-2.5 text-sm">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  className={`w-11 h-11 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all ${
                    digit
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-blue-300'
                  } focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600`}
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify &amp; Continue
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                className="text-gray-400 hover:text-gray-600 transition font-medium"
              >
                ← Change number
              </button>
              <button
                onClick={countdown > 0 ? undefined : sendOtp}
                disabled={countdown > 0 || loading}
                className={`font-semibold transition ${countdown > 0 ? 'text-gray-400 cursor-default' : 'text-blue-600 hover:text-blue-800'}`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: done ── */}
        {step === 'done' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-100">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Phone Verified!</h1>
            <p className="text-gray-500 text-sm mb-6">Your account is fully secured. Redirecting…</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        Standard SMS rates may apply · Used only for account security
      </p>
    </div>
  );
}
