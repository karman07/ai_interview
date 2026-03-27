import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Star, 
  Lightbulb, 
  CheckCircle,
  ArrowLeft,
  Loader2,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feedbackApi } from '@/api/feedback';
import { Feedback } from '@/types/feedback';
import routes from '@/constants/routes';
import clsx from 'clsx';

export default function FeedbackInbox() {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await feedbackApi.getStudentFeedback();
      setFeedbackList(data);
    } catch (e: any) {
      setError(e.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await feedbackApi.markAsRead(id);
      setFeedbackList(prev => 
        prev.map(f => f._id === id ? { ...f, isRead: true } : f)
      );
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-slate-800/60 px-6 py-4 sticky top-0 z-10 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(routes.studentDashboard)}
            className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Mentor Feedback
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium">Checking for new feedback...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <Info className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button 
              onClick={load}
              className="bg-white px-4 py-2 rounded-xl border border-red-200 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1120] border border-gray-100 dark:border-slate-800/60 rounded-3xl p-12 text-center shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-slate-700">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your inbox is empty</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              When mentors provide feedback on your interviews or resumes, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((f) => (
              <div 
                key={f._id}
                className={clsx(
                  "bg-white dark:bg-[#0B1120] rounded-3xl border p-6 transition-all shadow-sm relative overflow-hidden",
                  f.isRead ? "border-gray-100 dark:border-slate-800/40 opacity-80" : "border-blue-100 dark:border-blue-900 ring-1 ring-blue-50 dark:ring-blue-900/20"
                )}
                onMouseEnter={() => !f.isRead && handleMarkAsRead(f._id)}
              >
                {!f.isRead && (
                  <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                    <div className="absolute top-2 right-[-24px] bg-blue-600 text-[9px] font-bold text-white px-8 py-1 rotate-45 uppercase tracking-tighter">
                      New
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {f.teacherId.profileImageUrl ? (
                      <img src={f.teacherId.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400 dark:text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{f.teacherId.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={clsx(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        f.type === 'interview' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' :
                        f.type === 'resume' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                        'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                      )}>
                        {f.type} Assessment
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(f.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-slate-900/40 rounded-2xl p-4 mb-5 border border-gray-100/50 dark:border-slate-800/60">
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed italic">
                    "{f.content}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                  {f.rating && (
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-3 border border-amber-100/50 dark:border-amber-900/20 flex flex-col items-center">
                      <p className="text-[9px] font-extrabold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-1">Mentor Rating</p>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star 
                            key={s} 
                            className={clsx("w-3.5 h-3.5", s <= f.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-slate-800")} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {f.isRead && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-3 border border-emerald-100/50 dark:border-emerald-900/20 flex flex-col justify-center items-center">
                      <p className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Reviewed</span>
                      </div>
                    </div>
                  )}
                </div>

                {f.suggestions && f.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Next Steps for Improvement</h5>
                    <div className="space-y-2">
                      {f.suggestions.map((s, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-slate-800 rounded-xl p-3 flex gap-3 items-start group hover:border-gray-200 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-xs text-gray-700 dark:text-slate-300 font-medium leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
