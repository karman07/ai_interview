import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/ui/button';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/firebase';
import routes from '@/constants/routes';
import { Mail, ShieldCheck, ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { UsersApi } from '@/api/users';

export default function VerifyEmail() {
    const { user, refreshMe } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(location.state?.email ? 60 : 0);
    const [showResend, setShowResend] = useState(false);

    const fromUniversity = location.state?.from === 'university';
    const emailToVerify = location.state?.email || auth.currentUser?.email || user?.email;
    const loginRoute = routes.login;

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendEmail = async () => {
        setError('');
        setSuccess('');
        if (!auth.currentUser) {
            setError('Authentication session missing. Please open the link in the same browser or log in again.');
            return;
        }
        setLoading(true);
        try {
            await sendEmailVerification(auth.currentUser);
            setSuccess('Verification email sent! Please check your inbox and click the link.');
            setCountdown(60);
        } catch (err: any) {
            setError(err.message || 'Failed to send verification email.');
        } finally {
            setLoading(false);
        }
    };

    const checkVerification = async () => {
        try {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    setSuccess('Email successfully verified! Redirecting...');

                    if (user) {
                        try {
                            // Sync with backend if logged in
                            await UsersApi.updateVerificationStatus('email', true);
                            await refreshMe();
                        } catch (e) {
                            console.error(e);
                        }
                        setTimeout(() => navigate(routes.dashboard, { replace: true }), 2000);
                    } else {
                        // Not logged into backend yet
                        setTimeout(() => navigate(loginRoute, { replace: true }), 2000);
                    }
                } else {
                    setError('Email not verified yet. Please check your inbox and spam folder.');
                }
            } else {
                setError('Authentication session lost. Please sign up or log in again.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to check verification status.');
        }
    };

    const handleContinueToLogin = () => {
        navigate(loginRoute, { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-indigo-100/50">

                {/* Email-sent success hero (shown when redirected from university login) */}
                {fromUniversity ? (
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-50">
                            <Mail className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Check your inbox</h1>
                        {emailToVerify && (
                            <p className="font-semibold text-indigo-600 text-sm mb-3">{emailToVerify}</p>
                        )}
                        {/* Step instructions */}
                        <div className="text-left space-y-3 mt-4 bg-slate-50 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <p className="text-sm text-slate-700">Open the verification email we just sent you and <strong>click the link</strong> inside it.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <p className="text-sm text-slate-700">Once verified, come back and click <strong>"Go to Sign In"</strong> to access your account.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-4">Check your email</h1>
                        <p className="text-slate-600 text-sm">
                            A verification mail has been sent to your email id. Please check your inbox and spam folder.
                            {emailToVerify && (
                                <span className="font-semibold text-slate-900 mt-2 block">{emailToVerify}</span>
                            )}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-start gap-3 text-sm">
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-start gap-3 text-sm">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p>{success}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {user ? (
                        <Button
                            variant="primary"
                            onClick={checkVerification}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                            I've verified my email <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleContinueToLogin}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                            {fromUniversity ? 'Go to Sign In' : 'Continue to Login'} <LogIn className="w-4 h-4" />
                        </Button>
                    )}

                    {!showResend ? (
                        <div className="text-center">
                            <button
                                onClick={() => setShowResend(true)}
                                className="text-sm font-semibold text-indigo-600 hover:underline"
                            >
                                Did not receive mail? Send again
                            </button>
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-3 text-center">
                                If you still haven't received it, you can request another email.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={handleSendEmail}
                                disabled={loading || countdown > 0}
                                className="w-full py-3 rounded-xl shadow-sm"
                            >
                                {countdown > 0 ? `Resend Email (${countdown}s)` : (loading ? 'Sending...' : 'Resend Verification Email')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
