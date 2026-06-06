import { useState } from 'react';
import { Trophy, CheckCircle, Loader2, ClipboardList } from 'lucide-react';
import http from '@/api/http';
import { useHackathon } from '@/contexts/HackathonContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  onDone?: () => void;
}

export default function HackathonPostForm({ onDone }: Props) {
  const { refresh } = useHackathon();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    experience: '',
    feedback: '',
    collegeName: '',
    yearOfStudy: '',
    branch: '',
    linkedinUrl: '',
    githubUrl: '',
    lookingForOpportunities: false,
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.experience || !form.collegeName || !form.yearOfStudy || !form.branch) {
      setError('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await http.post('/hackathon/submit-form', form);
      await refresh();
      setStep('done');
    } catch (ex: any) {
      setError(ex?.response?.data?.message || ex.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";
  const req = <span className="text-red-400 ml-0.5">*</span>;

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">All Done!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Thank you for completing the hackathon. Your interview and form have been submitted.
          </p>
          <button
            onClick={() => {
              onDone?.();
              navigate('/hackathon/leaderboard');
            }}
            className="w-full py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Trophy size={16} /> View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList size={22} />
            <h2 className="text-xl font-black">One Last Step!</h2>
          </div>
          <p className="text-white/80 text-sm">
            Your interview is complete. Please fill this short form to finalize your hackathon submission.
            <strong className="text-white"> This is mandatory.</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {/* Academic info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>College / Institute {req}</label>
              <input className={inputCls} value={form.collegeName} onChange={set('collegeName')} placeholder="IIT Delhi" required />
            </div>
            <div>
              <label className={labelCls}>Branch / Major {req}</label>
              <input className={inputCls} value={form.branch} onChange={set('branch')} placeholder="Computer Science" required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Year of Study {req}</label>
            <select className={inputCls} value={form.yearOfStudy} onChange={set('yearOfStudy')} required>
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Working Professional">Working Professional</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className={labelCls}>How was your interview experience? {req}</label>
            <textarea
              className={inputCls}
              value={form.experience}
              onChange={set('experience')}
              rows={3}
              placeholder="Share what you found challenging, what went well, and what you learned..."
              required
            />
          </div>

          {/* Feedback */}
          <div>
            <label className={labelCls}>Feedback for the platform / hackathon</label>
            <textarea
              className={inputCls}
              value={form.feedback}
              onChange={set('feedback')}
              rows={2}
              placeholder="Any suggestions or comments about the experience..."
            />
          </div>

          {/* Social links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>LinkedIn URL</label>
              <input className={inputCls} value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="linkedin.com/in/..." />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input className={inputCls} value={form.githubUrl} onChange={set('githubUrl')} placeholder="github.com/..." />
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.lookingForOpportunities}
              onChange={set('lookingForOpportunities')}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">I'm open to internship / job opportunities</span>
          </label>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
            {submitting ? 'Submitting...' : 'Submit & Complete Hackathon'}
          </button>
        </form>
      </div>
    </div>
  );
}
