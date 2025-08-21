import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "../../components/ui/Button";
import InlineError from "@/components/feedback/InlineError";
import routes from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import SignupIllustration from "@/assets/bot_login.png";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";

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
      await signup(form);
      navigate(routes.completeProfile, { replace: true });
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
      navigate(routes.completeProfile, { replace: true });
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

          <div className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              className="text-indigo-600 font-medium hover:underline"
              to={routes.login}
            >
              Sign in
            </Link>
          </div>

          {/* Google Login */}
          <div className="mt-8">
            <Button
              variant="secondary"
              className="w-full py-3 flex items-center justify-center gap-3 rounded-xl shadow-sm hover:shadow-md transition"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
