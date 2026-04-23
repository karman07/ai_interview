import { useEffect, useState, useRef, useMemo } from 'react';
import { UsersApi } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { usePricing } from '@/contexts/PricingContext';
import { SubscriptionApi } from '@/api/subscription';
import Input from '@/components/ui/Input';
import Button from '../../components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Switch from '@/components/ui/Switch';
import {
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/firebase';
import {
  Mail,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Plus,
  X,
  CheckCircle2,
  Github,
  Linkedin,
  User as UserIcon,
  Building2,
  Sparkles,
  ChevronRight,
  Camera,
  Fingerprint,
  CreditCard,
  Zap,
  GraduationCap,
} from 'lucide-react';

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const { setShowPricing } = usePricing();
  const [err, setErr] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();
  const [params, setParams] = useSearchParams();
  const [universityInfo, setUniversityInfo] = useState<{ name: string; resumeLimit: number; interviewLimit: number; domain: string; allowedFeatures: string[] } | null>(null);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if ((user as any)?.role === 'student' && (user as any)?.universityId) {
      import('@/api/http').then(({ default: http }) => {
        http.get(`/universities/${(user as any).universityId}`)
          .then(res => setUniversityInfo(res.data))
          .catch(() => {});
      });
    }
  }, [(user as any)?.universityId]);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    bio: user?.bio ?? '',
    location: user?.location ?? '',
    experienceLevel: user?.experienceLevel ?? 'Mid',
    skills: user?.skills ?? [] as string[],
    website: user?.website ?? '',
    githubUrl: user?.githubUrl ?? '',
    linkedinUrl: user?.linkedinUrl ?? '',
    company: user?.company ?? '',
    industry: user?.industry ?? '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isInitialized = useRef(false);

  useEffect(() => {
    if (user && !isInitialized.current) {
      setForm({
        name: user.name ?? '',
        bio: user.bio ?? '',
        location: user.location ?? '',
        experienceLevel: user.experienceLevel ?? 'Mid',
        skills: user.skills ?? [],
        website: user.website ?? '',
        githubUrl: user.githubUrl ?? '',
        linkedinUrl: user.linkedinUrl ?? '',
        company: user.company ?? '',
        industry: user.industry ?? '',
      });
      isInitialized.current = true;
    }

    if (params.get('status') === 'success') {
      showSuccess('Tier upgraded successfully! Your premium features are now active.');
      setParams({});
      refreshMe(); // Refresh to get the new status
    }
  }, [user, params, setParams, refreshMe]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isPushEnabled, setIsPushEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  useEffect(() => {
    SubscriptionApi.getTransactions().then(data => {
      setTransactions(Array.isArray(data) ? data : (data?.data || []));
    }).catch(console.error);
  }, []);

  const completionProgress = useMemo(() => {
    const fields = [
      { val: form.name, weight: 10 },
      { val: form.bio, weight: 15 },
      { val: form.location, weight: 15 },
      { val: form.experienceLevel, weight: 5 },
      { val: form.skills.length > 0, weight: 20 },
      { val: form.linkedinUrl, weight: 10 },
      { val: form.githubUrl, weight: 10 },
      { val: user?.profileImageUrl, weight: 10 },
    ];
    let score = 0;
    fields.forEach(f => {
      if (f.val) score += f.weight;
    });
    return Math.min(score, 100);
  }, [form, user?.profileImageUrl]);

  const clearMessages = () => {
    setErr(undefined);
    setSuccess(undefined);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(undefined), 3000);
  };

  const handleSave = async () => {
    clearMessages();
    setFieldErrors({});
    setSaving(true);
    try {
      await UsersApi.updateProfile(form);
      await refreshMe();
      showSuccess('Profile synchronized successfully!');
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setErr('Validation failed. Please check the fields below.');
      } else {
        setErr(error?.response?.data?.message || 'Update synchronization failed.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email) return;
    setVerifyingEmail(true);
    try {
      await sendEmailVerification(auth.currentUser!);
      showSuccess('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setErr(error.message || 'Failed to send verification email.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !form.skills.includes(newSkill)) {
      setForm(f => ({ ...f, skills: [...f.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    const names = user.name.trim().split(/\s+/);
    if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    return names[0].slice(0, 2).toUpperCase();
  }, [user?.name]);

  return (
    <div className="min-h-screen bg-blue-50/50 dark:bg-[#050609] pt-20 pb-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Feature Bar */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Account Intelligence</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Optimize your professional profile for AI-driven matching.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="px-10 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 text-sm font-black uppercase tracking-widest py-3.5"
            >
              {saving ? 'Syncing...' : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Global Progress Indicator */}
        <div className="mb-6 bg-white dark:bg-[#0D1117] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Profile Readiness Index</span>
                </div>
                <span className="text-2xl font-black text-blue-600">{completionProgress}%</span>
              </div>
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700/50 p-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                />
              </div>
            </div>
            {completionProgress < 100 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-4 rounded-2xl md:max-w-[300px]">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Boost your score
                </p>
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60 leading-relaxed font-medium">
                  Complete your missing details to unlock premium AI mock interviews and specialized resources.
                </p>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-50 dark:from-blue-900/5 to-transparent pointer-events-none" />
        </div>

        {/* Status Messaging */}
        <AnimatePresence>
          {(success || err) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mb-6 p-6 rounded-3xl border flex items-center gap-4 relative overflow-hidden ${success
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400'
                : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/50 text-rose-800 dark:text-rose-400'
                }`}
            >
              <div className={`p-3 rounded-2xl ${success ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
                {success ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">{success ? 'Success' : 'Attention Required'}</h4>
                <p className="text-xs font-bold opacity-80 mt-0.5">{success || err}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white dark:bg-[#0D1117] rounded-[3rem] border border-gray-200 dark:border-gray-800/50 shadow-sm overflow-hidden group">
              <div className="h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              </div>
              <div className="px-8 pb-10 -mt-20 relative text-center">
                <div className="relative inline-block">
                  <div className="w-40 h-40 rounded-[3rem] bg-white dark:bg-gray-900 flex items-center justify-center border-[6px] border-[#F0F2F5] dark:border-[#050609] shadow-2xl relative overflow-hidden group/avatar">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" alt="" />
                    ) : (
                      <span className="text-5xl font-black text-blue-600">{initials}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">{user?.name}</h2>
                </div>
              </div>
            </div>

            {user?.role === 'student' ? (
              /* ── University info card (students) ── */
              <div className="bg-white dark:bg-[#0D1117] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase tracking-widest">University Account</h3>
                </div>
                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10 border border-purple-100/50 dark:border-purple-800/30 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Type</span>
                    <div className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Student</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    {universityInfo?.name || 'University'}
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  </h4>
                  {universityInfo && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{universityInfo.resumeLimit}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Resume Limit</p>
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{universityInfo.interviewLimit}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Interview Limit</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-bold">Your account is activated as a student account.</p>
                <p className="text-xs text-gray-400 text-center mt-1">Your access is managed by your university administrator.</p>
              </div>
            ) : (() => {
              const isPayg = (user?.subscriptionPlan as any)?.type === 'pay_as_you_go';
              const interviewsUsed  = isPayg ? (user?.paygInterviewsUsed ?? 0) : (user?.interviewCount ?? 0);
              const interviewsLimit = isPayg ? user?.paygInterviewsLimit : user?.interviewLimit;
              const resumesUsed     = isPayg ? (user?.paygResumesUsed    ?? 0) : (user?.resumeCount   ?? 0);
              const resumesLimit    = isPayg ? user?.paygResumesLimit    : user?.resumeLimit;
              const budgetRupees    = isPayg ? ((user?.paygMonthlyBudget ?? 0) / 100) : null;
              const cycleEnd        = isPayg && user?.paygBillingCycleEnd ? new Date(user.paygBillingCycleEnd) : null;

              const interviewPct = (interviewsLimit != null && interviewsLimit > 0) ? Math.min((interviewsUsed / interviewsLimit) * 100, 100) : 0;
              const resumePct    = (resumesLimit    != null && resumesLimit    > 0) ? Math.min((resumesUsed    / resumesLimit)    * 100, 100) : 0;
              const barColor     = (pct: number) =>
                pct >= 90 ? 'from-red-500 to-rose-400' :
                pct >= 70 ? 'from-amber-500 to-yellow-400' :
                            'from-blue-600 to-blue-400';

              return (
                <div className="bg-white dark:bg-[#0D1117] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                      {isPayg ? <Zap className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase tracking-widest">
                      {isPayg ? 'Pay As You Go' : 'Subscription'}
                    </h3>
                  </div>

                  {/* Plan header */}
                  <div className="p-5 rounded-[2rem] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100/50 dark:border-blue-800/30 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {isPayg ? 'Monthly Budget' : 'Current Plan'}
                      </span>
                      <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${user?.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user?.subscriptionStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{user?.subscriptionStatus || 'Free'}</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      {isPayg
                        ? `₹${budgetRupees?.toLocaleString('en-IN') ?? 0}/mo`
                        : (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object'
                            ? (user.subscriptionPlan as any).displayName
                            : (user?.subscriptionPlan || 'Foundation Tier'))
                      }
                      {user?.subscriptionStatus === 'active' && <Zap className="w-4 h-4 text-blue-600" />}
                    </h4>
                    {isPayg && cycleEnd && (
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        Renews {cycleEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Usage bars — shown for active plans */}
                  {(isPayg || user?.subscriptionStatus === 'active') && interviewsLimit != null && interviewsLimit > 0 && (
                    <div className="space-y-4 mb-5">
                      {/* Interviews */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Interviews</span>
                          <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                            {interviewsUsed}<span className="text-gray-400 font-medium"> / {interviewsLimit}</span>
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${interviewPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${barColor(interviewPct)}`}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 text-right">
                          {Math.max(0, interviewsLimit - interviewsUsed)} remaining this month
                        </p>
                      </div>

                      {/* Resumes */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Resume Scans</span>
                          <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                            {resumesUsed}<span className="text-gray-400 font-medium"> / {resumesLimit}</span>
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${resumePct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                            className={`h-full rounded-full bg-gradient-to-r ${barColor(resumePct)}`}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 text-right">
                          {Math.max(0, resumesLimit - resumesUsed)} remaining this month
                        </p>
                      </div>
                    </div>
                  )}

                  {!isPayg && (
                    <Button
                      variant="outline"
                      className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] border-gray-100 dark:border-gray-800 group-hover:border-blue-500/50 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10"
                      onClick={() => setShowPricing(true)}
                    >
                      Update Intelligence Tier
                      <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}                </div>
              );
            })()}

            <div className="bg-white dark:bg-[#0D1117] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase tracking-widest leading-none">Digital Presence</h3>
              </div>
              <div className="space-y-4">
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="Portfolio URL"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold"
                  />
                </div>
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    value={form.linkedinUrl}
                    onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                    placeholder="LinkedIn Profile"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold"
                  />
                </div>
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    value={form.githubUrl}
                    onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                    placeholder="GitHub Profile"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0D1117] rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase tracking-widest leading-none">Trust & Security</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-[1.5rem] border border-gray-100 dark:border-gray-800/50 flex items-center justify-between group/verify hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${user?.isEmailVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Primary Email</p>
                      <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {user?.isEmailVerified ? (
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  ) : (
                    <button
                      onClick={handleVerifyEmail}
                      disabled={verifyingEmail}
                      className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {verifyingEmail ? '...' : 'Verify'}
                    </button>
                  )}
                </div>
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-[1.5rem] border border-gray-100 dark:border-gray-800/50 flex items-center justify-between group/verify hover:border-blue-500/30 transition-all mt-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      <Zap className={`w-4 h-4 ${typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Desktop Alerts</p>
                      <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">
                        Instant Interview Feedback
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 opacity-60">
                      {isPushEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <Switch
                      checked={isPushEnabled}
                      onChange={async (checked) => {
                        if (checked) {
                          const result = await Notification.requestPermission();
                          if (result === 'granted') {
                            setIsPushEnabled(true);
                            showSuccess('Notifications enabled! Welcome to the loop.');
                          }
                        } else {
                          try {
                            await UsersApi.deleteFcmTokens();
                            setIsPushEnabled(false);
                            showSuccess('Notifications disabled.');
                          } catch (e) {
                            setErr('Disable synchronization failed.');
                          }
                        }
                      }}
                      disabled={typeof Notification === 'undefined'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white dark:bg-[#0D1117] rounded-[3rem] p-10 border border-gray-200 dark:border-gray-800/50 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase tracking-widest">Career Profile</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Detailed Professional Background</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <Input
                  label="Display Identity"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  error={fieldErrors.name}
                  className="[&_input]:py-4 [&_input]:text-xs [&_input]:rounded-3xl [&_span]:tracking-[0.2em] [&_span]:font-black"
                />

                <Input
                  label="Organization"
                  value={form.company}
                  onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                  error={fieldErrors.company}
                  className="[&_input]:py-4 [&_input]:text-xs [&_input]:rounded-3xl [&_span]:tracking-[0.2em] [&_span]:font-black"
                />
                <Input
                  label="Industry Segment"
                  value={form.industry}
                  onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))}
                  error={fieldErrors.industry}
                  className="[&_input]:py-4 [&_input]:text-xs [&_input]:rounded-3xl [&_span]:tracking-[0.2em] [&_span]:font-black"
                />
                <Input
                  label="Geographic Location"
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  error={fieldErrors.location}
                  className="[&_input]:py-4 [&_input]:text-xs [&_input]:rounded-3xl [&_span]:tracking-[0.2em] [&_span]:font-black"
                />
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Ambition Scale</label>
                  <div className="relative">
                    <select
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-3xl px-6 py-4 text-xs font-black outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest text-gray-600 dark:text-gray-300"
                      value={form.experienceLevel}
                      onChange={(e) => setForm(f => ({ ...f, experienceLevel: e.target.value }))}
                    >
                      <option value="Junior">Junior Tier</option>
                      <option value="Mid">Midweight</option>
                      <option value="Senior">Senior Expert</option>
                      <option value="Lead">Team Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Professional Narrative</label>
                <textarea
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-[2.5rem] px-8 py-6 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[160px] resize-none leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  value={form.bio}
                  onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Design your professional story..."
                />
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase tracking-widest">Skill Inventory</h3>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-[2.5rem] p-4 border border-gray-100 dark:border-gray-800/50">
                  <div className="flex flex-wrap gap-3 mb-6 min-h-[60px] items-center px-4">
                    {form.skills.map((skill) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={skill}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black border border-blue-500/30 flex items-center gap-3 group relative overflow-hidden shadow-lg shadow-blue-500/20"
                      >
                        <span className="relative z-10">{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="relative z-10 opacity-60 hover:opacity-100 transition-opacity bg-white/20 p-1 rounded-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    {form.skills.length === 0 && (
                      <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-widest pl-2">No expertise modules initialized...</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        placeholder="Add Core Skill"
                        className="w-full bg-white dark:bg-gray-900 border-2 border-transparent dark:border-gray-800 rounded-2xl px-8 py-5 text-xs font-black outline-none focus:border-blue-500/50 shadow-sm transition-all"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                    </div>
                    <button
                      onClick={handleAddSkill}
                      className="h-[60px] w-[60px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
