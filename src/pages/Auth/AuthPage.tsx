import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import routes from "@/constants/routes";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";
import InlineError from "@/components/feedback/InlineError";
import BOTImage from "@/assets/bot_login.png";

export default function AuthPage() {
    const { login, signup, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    // Determine initial mode based on route
    const isLoginPage = location.pathname === routes.login;
    const [isLogin, setIsLogin] = useState(isLoginPage);

    useEffect(() => {
        setIsLogin(location.pathname === routes.login);
    }, [location.pathname]);

    const toggleMode = () => {
        const newMode = !isLogin;
        setIsLogin(newMode);
        navigate(newMode ? routes.login : routes.signup, { replace: true });
    };

    // Form State
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | undefined>();

    // Redirect Logic
    const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
    const redirect = params.get("redirect") || redirectAfterLogin || routes.completeProfile;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(undefined);
        setLoading(true);

        try {
            if (isLogin) {
                await login({ email: form.email, password: form.password });
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirect, { replace: true });
            } else {
                // 1. Create Firebase user and send verification email
                const fbUser = await createUserWithEmailAndPassword(auth, form.email, form.password);
                await sendEmailVerification(fbUser.user);

                // 2. Create user in backend (tokens are cleared inside AuthApi.signup)
                await signup(form);

                // 3. Navigate to verify-email page (user is NOT logged in yet)
                navigate(routes.verifyEmail, { replace: true, state: { email: form.email } });
            }
        } catch (error: any) {
            setErr(
                error?.response?.data?.message ||
                (isLogin ? "Login failed. Check your credentials." : "Signup failed. Try a different email.")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setErr(undefined);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            await googleLogin(idToken);
            localStorage.removeItem('redirectAfterLogin');

            // Navigate based on context (Login -> Redirect, Signup -> Complete Profile usually)
            // But for simplicity/robustness, we can default to redirect or complete profile
            navigate(redirect, { replace: true });
        } catch (error: any) {
            console.error("Google login error:", error);
            setErr("Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 pt-28">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Left Side: Branding & Info */}
                <motion.div
                    className="w-full md:w-1/2 bg-blue-600 dark:bg-blue-700 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden"
                    layout
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 opacity-90" />

                    <div className="relative z-10 text-center max-w-md">
                        <motion.img
                            src={BOTImage}
                            alt="AI Coach"
                            className="w-48 h-48 mx-auto mb-8 drop-shadow-xl object-contain"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        />

                        <motion.h2
                            className="text-3xl font-bold mb-4"
                            key={isLogin ? "login-title" : "signup-title"}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isLogin ? "Welcome Back!" : "Join the Future"}
                        </motion.h2>

                        <motion.p
                            className="text-white/90 text-lg mb-8 leading-relaxed"
                            key={isLogin ? "login-desc" : "signup-desc"}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            {isLogin
                                ? "Your Ai for job is ready to help you ace your next interview."
                                : "Start your journey to interview mastery with personalized AI feedback."
                            }
                        </motion.p>
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-gray-800 flex flex-col justify-center">
                    <div className="w-full max-w-sm mx-auto">
                        <div className="mb-8 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {isLogin ? "Sign In" : "Create Account"}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {isLogin ? "Enter your details to access your account" : "Enter your details to get started"}
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        key="name-field"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Input
                                            label="Full Name"
                                            placeholder="Jane Doe"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required={!isLogin}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Input
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                {!isLogin && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Must be at least 6 characters
                                    </p>
                                )}
                            </div>

                            <InlineError message={err} />

                            <Button
                                variant="primary"
                                className="w-full py-2.5 rounded-lg text-sm font-medium"
                                disabled={loading}
                            >
                                {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Sign Up")}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="mt-8 space-y-5">
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0 uppercase tracking-wider">Or continue with</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            </div>

                            <button
                                type="button"
                                className="w-full py-3.5 flex items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold shadow-sm transition"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
                                Google
                            </button>

                            <div className="relative flex items-center gap-3 mt-8">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0 uppercase tracking-wider">University Access</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            </div>

                            <Link
                                to={routes.universityLogin}
                                className="group w-full p-4 flex items-center gap-4 rounded-2xl border border-indigo-100 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-slate-600 hover:shadow-sm transition-all text-left"
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900 dark:text-white text-[15px] mb-0.5">Student Login</div>
                                    <div className="text-sm text-gray-500 dark:text-slate-400">Sign in with your university credentials</div>
                                </div>
                                <svg className="w-5 h-5 text-indigo-400 dark:text-indigo-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors focus:outline-none"
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
