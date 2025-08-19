import { useEffect, useState } from 'react';
import { UsersApi } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';
import InlineError from '@/components/feedback/InlineError';

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [me, setMe] = useState(user);
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    company: user?.company ?? '',
    industry: user?.industry ?? '',
    jobDescription: user?.jobDescription ?? '',
  });

  useEffect(() => {
    setMe(user ?? null);
    if (user) {
      setForm({
        name: user.name ?? '',
        company: user.company ?? '',
        industry: user.industry ?? '',
        jobDescription: user.jobDescription ?? '',
      });
    }
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined);
    setSaving(true);
    try {
      await UsersApi.updateMe(form);
      await refreshMe();
      setEditing(false);
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const onUploadResume = async (f: File) => {
    setErr(undefined);
    try {
      await UsersApi.uploadResume(f);
      await refreshMe();
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Resume upload failed.');
    }
  };

  const onUploadProfileImage = async (f: File) => {
    setErr(undefined);
    try {
      await UsersApi.uploadProfileImage(f);
      await refreshMe();
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Image upload failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
            <Avatar src={me?.profileImageUrl} name={me?.name || 'User'} size={72} />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{me?.name}</h1>
              <p className="text-gray-600">{me?.email}</p>
              <div className="mt-3">
                <FileInput label="Update profile image" accept="image/*" onChange={onUploadProfileImage} />
              </div>
            </div>
            {me?.resumeUrl && (
              <a
                href={me.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View Resume
              </a>
            )}
          </div>

          <div className="my-8 h-px bg-gray-100" />

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <form className="space-y-5" onSubmit={onSave}>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  disabled={!editing}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Company"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    disabled={!editing}
                  />
                  <Input
                    label="Industry"
                    value={form.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Job Description</span>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:bg-gray-50"
                    rows={5}
                    value={form.jobDescription}
                    onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
                    disabled={!editing}
                  />
                </label>
                <InlineError message={err} />
                <div className="flex items-center gap-3">
                  {editing ? (
                    <>
                      <Button variant="primary">
                        <span className={saving ? 'opacity-60 pointer-events-none' : ''}>
                          {saving ? 'Saving…' : 'Save Changes'}
                        </span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Resume</h3>
              <p className="mb-4 text-sm text-gray-600">
                Upload your resume (PDF up to 10MB) to personalize interview questions.
              </p>
              <FileInput label="Upload resume" accept="application/pdf" onChange={onUploadResume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
