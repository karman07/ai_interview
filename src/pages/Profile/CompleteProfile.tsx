import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import FileInput from '@/components/ui/FileInput';
import InlineError from '@/components/feedback/InlineError';
import { UsersApi } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import routes from '@/constants/routes';

export default function CompleteProfile() {
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    industry: user?.industry || '',
    jobDescription: user?.jobDescription || '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        company: user.company ?? '',
        industry: user.industry ?? '',
        jobDescription: user.jobDescription ?? '',
      });
    }
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined);
    setLoading(true);
    try {
      await UsersApi.updateMe(form);
      if (resumeFile) await UsersApi.uploadResume(resumeFile);
      if (profileImage) await UsersApi.uploadProfileImage(profileImage);
      await refreshMe();
      navigate(routes.dashboard, { replace: true });
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-16">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete your profile</h1>
          <p className="mb-6 text-gray-600">
            Tell us a bit more so we can tailor your AI interview experience.
          </p>
          <form className="grid grid-cols-1 gap-6" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Your current or target company"
              />
              <Input
                label="Industry"
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                placeholder="e.g., FinTech, Healthcare, AI"
              />
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Job Description</span>
              <textarea
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                rows={4}
                placeholder="Paste the role description you're preparing for..."
                value={form.jobDescription}
                onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <FileInput label="Upload Resume (PDF up to 10MB)" accept="application/pdf" onChange={setResumeFile} />
              <FileInput label="Profile Image (JPG/PNG up to 5MB)" accept="image/*" onChange={setProfileImage} />
            </div>

            <InlineError message={err} />
            <div className="flex items-center gap-3">
              <Button variant="primary">
                <span className={loading ? 'opacity-60 pointer-events-none' : ''}>
                  {loading ? 'Saving…' : 'Save & Continue'}
                </span>
              </Button>
              <button
                type="button"
                onClick={() => navigate(routes.profile)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
