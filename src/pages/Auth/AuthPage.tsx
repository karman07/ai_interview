import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
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
                                ? "Your AI Interview Coach is ready to help you ace your next interview."
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

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg"
                                disabled={loading}
                            >
                                <img
                                    src="https://www.svgrepo.com/show/355037/google.svg"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                Google
                            </Button>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
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
