import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "../../components/ui/button";
import InlineError from "@/components/feedback/InlineError";
import routes from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import SignupIllustration from "@/assets/bot_login.png";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { GraduationCap, ChevronRight } from "lucide-react";

export default function Signup() {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined);
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth so we can use Firebase to send verification emails
      const fbUser = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await sendEmailVerification(fbUser.user);

      // 2. Create user in Backend
      await signup(form);

      navigate(routes.verifyEmail, { replace: true, state: { email: form.email } });
    } catch (error: any) {
      setErr(
        error?.response?.data?.message ||
        "Signup failed. Try a different email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await googleLogin(idToken);
      navigate(routes.dashboard, { replace: true });
    } catch (error: any) {
      setErr(error.message || "Google login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center px-4">
      <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Left Illustration */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-50 p-10">
          <motion.img
            src={SignupIllustration}
            alt="Welcome"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-4/5 max-w-md"
          />
        </div>

        {/* Right Form */}
        <motion.div
          className="p-10 flex flex-col justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mb-6 text-gray-600">
            It’s quick and easy. You can finish your profile later.
          </p>

          <form className="space-y-5" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Use 6+ characters with a mix of letters & numbers.
              </p>
            </div>

            <InlineError message={err} />

            <Button
              variant="primary"
              className="w-full rounded-xl py-3 text-base shadow-md hover:shadow-lg transition"
            >
              <span
                className={
                  loading ? "opacity-60 pointer-events-none" : "font-medium"
                }
              >
                {loading ? "Creating…" : "Create Account"}
              </span>
            </Button>
          </form>

          {/* Google Login */}
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
              Google
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
            Already have an account?{" "}
            <Link
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-colors"
              to={routes.login}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
