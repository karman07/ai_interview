import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "../../components/ui/button";
import InlineError from "@/components/feedback/InlineError";
import routes from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import BOTImage from "../../assets/bot_login.png";

// 👇 import Firebase auth
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";

export default function Login() {
  const { login, googleLogin } = useAuth(); // added googleLogin from context
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || routes.completeProfile;

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined);
    setLoading(true);
    try {
      await login(form);
      navigate(redirect, { replace: true });
    } catch (error: any) {
      setErr(
        error?.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // 👇 Google Login handler
  const handleGoogleLogin = async () => {
    setErr(undefined);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // call your NestJS backend via context
      await googleLogin(idToken);

      navigate(redirect, { replace: true });
    } catch (error: any) {
      console.error("Google login error:", error);
      setErr("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-indigo-100 via-white to-indigo-50">

      {/* Left side illustration */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-12 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-indigo-900/50 backdrop-blur-sm z-0" />
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28">
          <h2 className="text-4xl font-extrabold mb-6 leading-snug">
            Your AI Interview Coach
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

      {/* Right side form */}
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

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Don’t have an account?
            </span>
            <Link
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition"
              to={routes.signup}
            >
              Create one
            </Link>
          </div>

          {/* Google Sign-In */}
          <div className="mt-8">
            <Button
              variant="secondary"
              onClick={handleGoogleLogin}
              className="w-full py-3 flex items-center justify-center gap-3 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              {loading ? "Signing in…" : "Continue with Google"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
