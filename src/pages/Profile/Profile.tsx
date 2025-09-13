import { useEffect, useState } from 'react';
import { UsersApi } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '../../components/ui/button';
import InlineError from '@/components/feedback/InlineError';
import FileInput from '@/components/ui/FileInput';
import { useNavigate } from 'react-router-dom';
import routes from '@/constants/routes';

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [me, setMe] = useState(user);
  const [err, setErr] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();
  const navigate = useNavigate()

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
    setSaving(true);
    try {
      await UsersApi.updateMe(form);
      await refreshMe();
      navigate(routes.completeProfile)
      showSuccess('Profile updated successfully!');
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResume = async (f: File) => {
    clearMessages();
    try {
      await UsersApi.uploadResume(f);
      await refreshMe();
      showSuccess('Resume uploaded successfully!');
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Resume upload failed.');
    }
  };

  const handleUploadProfileImage = async (f: File) => {
    clearMessages();
    try {
      await UsersApi.uploadProfileImage(f);
      await refreshMe();
      showSuccess('Profile image updated successfully!');
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Image upload failed.');
    }
  };

  // Fallback avatar component
  const ProfileAvatar = () => {
    const initials = me?.name 
      ? me.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';

    return (
      <div className="relative">
        {me?.profileImageUrl ? (
          <div className="relative">
            <img
              src={me.profileImageUrl}
              alt={me?.name || 'Profile'}
              className="w-24 h-24 rounded-xl object-cover shadow-lg ring-4 ring-white"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-white">
              <span className="text-white font-semibold text-2xl">{initials}</span>
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-white">
            <span className="text-white font-semibold text-2xl">{initials}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-semibold">{success}</span>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl border border-white/50">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <ProfileAvatar />
            
            <div className="flex-1 text-center md:text-left">
              <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {me?.name || 'Welcome to Your Profile'}
                </h1>
                <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {me?.email}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                  <FileInput
                    label="Update Profile Photo" 
                    accept="image/*" 
                    onChange={handleUploadProfileImage}
                  />
                </div>
              </div>
            </div>

            {me?.resumeUrl && (
              <div className="flex flex-col items-center md:items-end gap-3">
                <a
                  href={me.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  View Resume
                </a>
              </div>
            )}
          </div>

          <div className="my-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-8 ring-1 ring-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Profile Information
                </h2>
                
                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Input
                      label="Company"
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="Enter your company"
                    />
                    <Input
                      label="Industry"
                      value={form.industry}
                      onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                      placeholder="Enter your industry"
                    />
                  </div>
                  
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-700">Job Description</span>
                    <textarea
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 resize-none"
                      rows={6}
                      value={form.jobDescription}
                      onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
                      placeholder="Describe your role, responsibilities, and key achievements..."
                    />
                  </label>
                  
                  <InlineError message={err} />
                  
                  <div className="flex items-center gap-4 pt-4">
                    <Button 
                      variant="primary"
                      onClick={handleSave}
                      
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        {saving && (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {saving ? 'Saving Changes...' : 'Save Profile'}
                      </span>
                    </Button>
                    
                    <div className="text-sm text-gray-500">
                      Changes are saved automatically when you click Save Profile
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 ring-1 ring-indigo-100 h-fit">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                Resume
              </h3>
              
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Upload your resume (PDF up to 10MB) to personalize interview questions and enhance your profile.
              </p>
              
              <div className="space-y-4">
                {me?.resumeUrl && (
                  <div className="p-4 bg-white/80 rounded-xl border border-indigo-200 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Current Resume</p>
                      <p className="text-xs text-gray-500">PDF document uploaded</p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                )}
                
                <div className="bg-white/60 p-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-300 transition-colors">
                  <FileInput 
                    label={me?.resumeUrl ? "Upload New Resume" : "Upload Resume"} 
                    accept="application/pdf" 
                    onChange={handleUploadResume}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}