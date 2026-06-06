import { useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useHackathon } from '@/contexts/HackathonContext';

export default function HackathonBanner() {
  const { eligible, loading, interviewTaken, formSubmitted, config } = useHackathon();
  const navigate = useNavigate();

  if (loading || !eligible) return null;

  return (
    <div className="mx-4 my-3 rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white">
        <Trophy size={14} className="flex-shrink-0" />
        <span className="text-xs font-black uppercase tracking-widest">Hackathon Mode Active</span>
      </div>

      <div className="px-4 py-3">
        <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">
          {config?.title || 'Hackathon Challenge'}
        </div>
        {config?.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{config.description}</p>
        )}

        {/* Status steps */}
        <div className="flex gap-3 mb-3">
          <Step done={interviewTaken} label="Interview" />
          <Step done={formSubmitted} label="Form" />
        </div>

        <div className="flex gap-2">
          {!interviewTaken && (
            <button
              onClick={() => navigate('/interview_round')}
              className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-1"
            >
              <Trophy size={12} /> Start Interview
            </button>
          )}
          <button
            onClick={() => navigate('/hackathon/leaderboard')}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-1"
          >
            <ExternalLink size={11} /> Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      done
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
    }`}>
      {done ? <CheckCircle size={11} /> : <Clock size={11} />}
      {label}
    </div>
  );
}
