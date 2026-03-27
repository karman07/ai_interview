import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { assignmentsApi } from '@/api/assignments';
import { StudentAssignment, StudentAssignmentStatus } from '@/types/assignment';
import routes from '@/constants/routes';
import clsx from 'clsx';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"active" | "completed">("active");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await assignmentsApi.getAssignments();
      setAssignments(data);
    } catch (e: any) {
      setError(e.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = assignments.filter(a => {
    if (filter === "active") {
      return a.status === StudentAssignmentStatus.ASSIGNED || a.status === StudentAssignmentStatus.IN_PROGRESS;
    }
    return a.status === StudentAssignmentStatus.COMPLETED || a.status === StudentAssignmentStatus.EVALUATED;
  });

  const getStatusColor = (status: StudentAssignmentStatus) => {
    switch (status) {
      case StudentAssignmentStatus.ASSIGNED: return "text-blue-600 bg-blue-50 border-blue-100";
      case StudentAssignmentStatus.IN_PROGRESS: return "text-amber-600 bg-amber-50 border-amber-100";
      case StudentAssignmentStatus.COMPLETED: 
      case StudentAssignmentStatus.EVALUATED: return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const d = new Date(deadline);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    if (diff < 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours left`;
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
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            My Assignments
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        {/* Tabs */}
        <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8 w-fit mx-auto sm:mx-0">
          <button 
            onClick={() => setFilter("active")}
            className={clsx(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              filter === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter("completed")}
            className={clsx(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              filter === "completed" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
            <p className="text-sm font-medium">Fetching your tasks...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button onClick={load} className="text-indigo-600 font-bold hover:underline">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {filter} assignments</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {filter === 'active' 
                ? "You're all caught up! Keep practicing on your own or wait for new tasks from your mentor." 
                : "Complete your first assignment to see it here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => (
              <div 
                key={a._id}
                className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0",
                      getStatusColor(a.status)
                    )}>
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {a.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1 px-2 bg-gray-50 rounded-md">
                          {a.topic}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {getTimeRemaining(a.deadline)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    getStatusColor(a.status)
                  )}>
                    {a.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-gray-50/50 rounded-2xl p-5 mb-6 border border-gray-100">
                   <div className="flex justify-between items-end mb-2.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Training Progress</p>
                      <span className="text-xs font-bold text-indigo-600">
                        {a.completedInterviews} / {a.numInterviews} Interviews
                      </span>
                   </div>
                   <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((a.completedInterviews / a.numInterviews) * 100, 100)}%` }}
                      />
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    {a.avgScore > 0 && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-gray-700">Avg. Score: {a.avgScore}%</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigate(routes.interviewHome)}
                    className={clsx(
                      "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm",
                      filter === "active" 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5" 
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {filter === "active" ? (
                      <><PlayCircle className="w-4 h-4" /> Start Practice</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> View Results</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
