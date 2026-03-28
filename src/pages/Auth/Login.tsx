import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "../../components/ui/button";
import InlineError from "@/components/feedback/InlineError";
import routes from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import BOTImage from "../../assets/bot_login.png";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { UsersApi } from "@/api/users";
import { GraduationCap, ChevronRight } from "lucide-react";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
  const redirect = params.get("redirect") || redirectAfterLogin || routes.dashboard;

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  const handlePostLoginNavigation = (user: any) => {
    if (!user.isEmailVerified) {
      navigate('/verify-email', { replace: true });
    } else if (!user.isPhoneVerified) {
      navigate(routes.verifyPhone, { replace: true });
    } else {
      navigate(redirect, { replace: true });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined);
    setLoading(true);
    try {
      // Attempt Firebase login for verification features
      try {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
          // If they exist in backend but not firebase yet, try to create them quietly
          await createUserWithEmailAndPassword(auth, form.email, form.password).catch(() => { });
        }
      }

      const res = await login(form);

      // Check if Firebase says they are verified but backend doesn't know yet.
      // Firebase caches the user token, so we must reload to get the latest emailVerified status.
      if (auth.currentUser) {
        await auth.currentUser.reload().catch(() => { });
      }
      if (auth.currentUser?.emailVerified && !res.user.isEmailVerified) {
        try {
          await UsersApi.updateVerificationStatus('email', true);
          res.user.isEmailVerified = true;
        } catch (e) {
          console.error("Failed to sync email verification status post-login", e);
        }
      }

      localStorage.removeItem('redirectAfterLogin');
      handlePostLoginNavigation(res.user);
    } catch (error: any) {
      setErr(
        error?.response?.data?.message || "Login failed. Check your credentials."
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

      const res = await googleLogin(idToken);

      if (auth.currentUser) {
        await auth.currentUser.reload().catch(() => { });
      }
      if (auth.currentUser?.emailVerified && !res.user.isEmailVerified) {
        try {
          await UsersApi.updateVerificationStatus('email', true);
          res.user.isEmailVerified = true;
        } catch (e) {
          console.error("Failed to sync email verification status post-google-login", e);
        }
      }

      localStorage.removeItem('redirectAfterLogin');
      handlePostLoginNavigation(res.user);
    } catch (error: any) {
      console.error("Google login error:", error);
      setErr("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-12 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-indigo-900/50 backdrop-blur-sm z-0" />
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28">
          <h2 className="text-4xl font-extrabold mb-6 leading-snug">
            Your Ai for job
          </h2>
          <p className="text-base opacity-90 leading-relaxed max-w-md mb-10">
            Practice interviews with AI, track progress, and land your dream job
            with confidence.
          </p>
          <img
            src={BOTImage}
            alt="AI Interview"
            className="w-3/5 max-w-sm drop-shadow-2xl animate-bounce-slow mt-4"
          />
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 lg:px-16 py-20">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-10 border border-gray-100 transition-transform hover:scale-[1.01]">
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">
            Welcome back 👋
          </h1>
          <p className="mb-8 text-gray-600">
            Sign in to continue to your AI Interview dashboard.
          </p>

          <form className="space-y-5" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />

            <InlineError message={err} />

            <Button
              variant="primary"
              className="w-full py-3 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 space-y-5">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500 font-medium shrink-0 uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              className="w-full py-3.5 flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold shadow-sm transition"
              onClick={handleGoogleLogin}
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              {loading ? "Signing in…" : "Google"}
            </button>

            <div className="relative flex items-center gap-3 mt-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500 font-medium shrink-0 uppercase tracking-wider">University Access</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Link
              to={routes.universityLogin}
              className="group w-full p-4 flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-[15px] mb-0.5">Student Login</div>
                <div className="text-sm text-gray-500">Sign in with your university credentials</div>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-600 text-center font-medium">
            Don't have an account?{" "}
            <Link
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
              to={routes.signup}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
