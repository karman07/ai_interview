import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebase';
import http, { API_BASE_URL, tokenStore, userStore } from '@/api/http';
import routes from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import BOTImage from '@/assets/bot_login.png';

interface UniversityPublic {
  _id: string;
  name: string;
  domain: string;
  logoUrl?: string | null;
}

/** Best-effort logo: Uploaded → Clearbit → null (shows initials) */
function getLogoUrl(domain: string, provided?: string | null) {
  if (provided) {
    if (provided.startsWith('/')) {
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}${provided}`;
    }
    return provided;
  }
  return `https://logo.clearbit.com/${domain}`;
}

function UniversityLogo({ university, size = 10 }: { university: UniversityPublic; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = getLogoUrl(university.domain, university.logoUrl);
  const sz = `w-${size} h-${size}`;
  const initials = university.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (failed) {
    return (
      <div className={`${sz} rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0`}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={university.name}
      onError={() => setFailed(true)}
      className={`${sz} rounded-xl object-contain bg-white border border-gray-100 shrink-0 p-0.5`}
    />
  );
}

export default function UniversityLogin() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  // University list
  const [universities, setUniversities] = useState<UniversityPublic[]>([]);
  const [uniLoading, setUniLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = universities.find(u => u._id === selectedId) ?? null;
  const emailDomain = email.includes('@') ? email.split('@')[1] : '';
  const domainMismatch = !!emailDomain && !!selected && emailDomain.toLowerCase() !== selected.domain.toLowerCase();

  useEffect(() => {
    http.get('/universities/public/list')
      .then(res => setUniversities(res.data))
      .catch(() => setError('Could not load universities. Please try again.'))
      .finally(() => setUniLoading(false));
  }, []);

  const finishLogin = async (data: { accessToken: string; user: any }) => {
    localStorage.setItem('access_token', data.accessToken);
    tokenStore.set(data.accessToken);
    userStore.set(data.user);
    await refreshMe();
    navigate(routes.dashboard, { replace: true });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selected) { setError('Please select your university first.'); return; }
    if (domainMismatch) { setError(`Email must end with @${selected.domain}`); return; }
    setLoading(true);
    try {
      // Step 1: Sign into Firebase to check email verification status
      let fbUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/invalid-email') {
          // User may not exist in Firebase yet — create them so we can send verification
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email, password);
            fbUser = newCred.user;
            // Send to DB immediately so admins can see the newly registered but unverified student
            await http.post('/auth/student-register', {
              email,
              password,
              rollNumber: rollNumber.trim() || undefined,
              universityId: selected._id,
            }).catch(() => {});
          } catch {
            // Already exists with a different password — proceed without Firebase block
            fbUser = null;
          }
        } else if (fbErr.code === 'auth/wrong-password') {
          setError('Wrong password. Please try again.');
          setLoading(false);
          return;
        } else {
          fbUser = null; // Don't block login for other Firebase errors
        }
      }

      // Step 2: Reload to get the latest emailVerified flag
      if (fbUser) {
        await fbUser.reload().catch(() => {});
        if (!fbUser.emailVerified) {
          await sendEmailVerification(fbUser);
          setLoading(false);
          navigate(routes.verifyEmail, { state: { email, from: 'university' } });
          return;
        }
      }

      // Step 3: Firebase says verified — proceed with backend student login
      const res = await http.post('/auth/student-login', {
        email,
        password,
        rollNumber: rollNumber.trim() || undefined,
        universityId: selected._id,
      });
      await finishLogin(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    if (!selected) { setError('Please select your university first.'); return; }
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user.email ?? '';
      const googleDomain = googleEmail.split('@')[1]?.toLowerCase() ?? '';

      if (googleDomain !== selected.domain.toLowerCase()) {
        setError(`Your Google account (${googleEmail}) must use the @${selected.domain} domain to sign in as a student of this university.`);
        setGoogleLoading(false);
        return;
      }

      const idToken = await result.user.getIdToken();
      const res = await http.post('/auth/student-google-login', {
        idToken,
        universityId: selected._id,
        rollNumber: rollNumber.trim() || undefined,
      });
      await finishLogin(res.data);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') { setGoogleLoading(false); return; }
      setError(err?.response?.data?.message || err?.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* Left side — branding */}
        <motion.div
          className="w-full md:w-1/2 bg-blue-600 dark:bg-blue-700 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden"
          layout
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 opacity-90" />
          <div className="relative z-10 text-center max-w-md">
            <motion.img
              src={BOTImage}
              alt="AI Coach"
              className="w-40 h-40 mx-auto mb-6 drop-shadow-xl object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            <motion.h2
              className="text-3xl font-bold mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Student Portal
            </motion.h2>
            <motion.p
              className="text-white/85 text-base leading-relaxed mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Sign in with your university credentials to access AI-powered interview prep, resume tools, and study resources.
            </motion.p>
            {selected && (
              <motion.div
                className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <UniversityLogo university={selected} size={7} />
                <div className="text-left">
                  <p className="text-xs text-blue-200 font-medium">Selected university</p>
                  <p className="text-sm font-bold text-white leading-tight">{selected.name}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right side — form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-gray-800 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">

            <div className="mb-6 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Student Sign In
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Use your university email &amp; password
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3 text-sm"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleEmailLogin} className="space-y-4">

              {/* University selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  University
                </label>
                <div className="relative">
                  {selected && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <UniversityLogo university={selected} size={6} />
                    </div>
                  )}
                  <select
                    value={selectedId}
                    onChange={e => { setSelectedId(e.target.value); setError(''); setEmail(''); }}
                    className={`w-full py-2.5 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition appearance-none ${selected ? 'pl-12' : 'pl-3'}`}
                    required
                  >
                    <option value="">
                      {uniLoading ? 'Loading universities…' : '— Select your university —'}
                    </option>
                    {universities.map(u => (
                      <option key={u._id} value={u._id}>{u.name} (@{u.domain})</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Roll / Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 102117XXX"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  University Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder={selected ? `you@${selected.domain}` : 'you@university.edu'}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    required
                    className={`w-full pl-3 pr-9 py-2.5 rounded-lg border text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-gray-700 outline-none focus:ring-2 transition ${
                      domainMismatch
                        ? 'border-red-400 focus:ring-red-400/20'
                        : emailDomain && !domainMismatch
                        ? 'border-emerald-400 focus:ring-emerald-400/20'
                        : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailDomain && !domainMismatch && (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {domainMismatch && (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                {domainMismatch && (
                  <p className="mt-1 text-xs text-red-500">Must end with @{selected!.domain}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">New here? An account is created automatically on first login.</p>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading || domainMismatch || !selectedId}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 font-medium shrink-0">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Google sign-in */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading || !selectedId}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 dark:text-gray-300 transition shadow-sm"
            >
              {googleLoading ? (
                <svg className="animate-spin w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              ) : (
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              )}
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
            </button>

            {selected && (
              <p className="mt-2 text-center text-xs text-gray-400">
                Google account must use <span className="font-semibold text-gray-600 dark:text-gray-300">@{selected.domain}</span>
              </p>
            )}

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Not a student?{' '}
              <Link to={routes.login} className="font-medium text-blue-600 hover:text-blue-500 transition">
                Regular login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
