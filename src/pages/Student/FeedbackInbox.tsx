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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(routes.studentDashboard)}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Mentor Feedback
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
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
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your inbox is empty</h3>
            <p className="text-sm text-gray-500">
              When mentors provide feedback on your interviews or resumes, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((f) => (
              <div 
                key={f._id}
                className={clsx(
                  "bg-white rounded-3xl border p-6 transition-all shadow-sm relative overflow-hidden",
                  f.isRead ? "border-gray-100 opacity-80" : "border-blue-100 ring-1 ring-blue-50"
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
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {f.teacherId.profileImageUrl ? (
                      <img src={f.teacherId.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{f.teacherId.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={clsx(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        f.type === 'interview' ? 'bg-violet-50 text-violet-600' :
                        f.type === 'resume' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {f.type} Assessment
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(f.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-4 mb-5 border border-gray-100/50">
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{f.content}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {f.rating && (
                    <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/50">
                      <p className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest mb-1">Mentor Rating</p>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star 
                            key={s} 
                            className={clsx("w-3.5 h-3.5", s <= f.rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {f.isRead && (
                    <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/50 flex flex-col justify-center">
                      <p className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Reviewed</span>
                      </div>
                    </div>
                  )}
                </div>

                {f.suggestions && f.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Next Steps for Improvement</h5>
                    <div className="space-y-2">
                      {f.suggestions.map((s, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 items-start group hover:border-gray-200 transition-colors shadow-sm">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">{s}</p>
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
