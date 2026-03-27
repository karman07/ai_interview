import { useEffect, useState } from 'react';
import { 
  School, 
  ArrowLeft, 
  Loader2,
  BookOpen,
  Calendar,
  AlertCircle,
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { classesApi } from '@/api/classes';
import { assignmentsApi } from '@/api/assignments';
import { StudentAssignment, StudentAssignmentStatus } from '@/types/assignment';
import routes from '@/constants/routes';
import clsx from 'clsx';

export default function StudentClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<any>(null);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [classRes, assignmentsRes] = await Promise.all([
        classesApi.getClassDetails(id),
        assignmentsApi.getAssignments()
      ]);
      setCls(classRes.data);
      // Filter assignments for this class only
      setAssignments(assignmentsRes.data.filter((a: any) => a.classId === id || a.assignmentInfo?.classId === id));
    } catch (e: any) {
      setError(e.message || "Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

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

  const getStatusColor = (status: StudentAssignmentStatus) => {
    switch (status) {
      case StudentAssignmentStatus.ASSIGNED: return "text-blue-600 bg-blue-50 border-blue-100";
      case StudentAssignmentStatus.IN_PROGRESS: return "text-amber-600 bg-amber-50 border-amber-100";
      case StudentAssignmentStatus.COMPLETED: 
      case StudentAssignmentStatus.EVALUATED: return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <p className="text-gray-500 dark:text-slate-400 font-bold">Opening Class Portal...</p>
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-[#0B1120] rounded-3xl p-10 border border-rose-100 dark:border-rose-900/30 text-center max-w-md shadow-xl dark:shadow-none">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8">{error || "The class you are looking for does not exist or you are not enrolled."}</p>
          <button 
            onClick={() => navigate(routes.studentClasses)}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            Back to My Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Dynamic Header */}
      <div className="bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-slate-800/60 sticky top-0 z-20 shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="max-w-6xl mx-auto px-8 py-8 relative">
          <button 
            onClick={() => navigate(routes.studentClasses)}
            className="flex items-center gap-2 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs uppercase tracking-widest transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Classes
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100 dark:shadow-none shrink-0">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase transition-colors duration-300">{cls.name}</h1>
                   <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                    SEM {cls.semester}
                   </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                   <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <School className="w-4 h-4 text-indigo-400" />
                      {cls.department}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Enrolled {new Date(cls.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Assignments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 transition-colors duration-300">
              <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Course Assignments
            </h3>
            <span className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              {assignments.length} Total
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-[#0B1120] rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-slate-800">
               <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200 dark:text-slate-700">
                  <ClipboardList className="w-10 h-10" />
               </div>
               <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">No Active Assignments</h4>
               <p className="text-gray-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                 Your instructor hasn't posted any assignments for this class yet. Check back soon!
               </p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map((a) => (
                <div 
                  key={a._id}
                  className="bg-white dark:bg-[#0B1120] rounded-[2rem] border border-gray-100 dark:border-slate-800/60 p-8 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/5 transition-all group overflow-hidden relative shadow-sm dark:shadow-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-5">
                      <div className={clsx(
                        "w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm",
                        getStatusColor(a.status)
                      )}>
                        <ClipboardList className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                          {a.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 py-1 px-2.5 bg-gray-50 dark:bg-slate-900 rounded-md border border-gray-100 dark:border-slate-800 transition-colors">
                            {a.topic}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            {getTimeRemaining(a.deadline)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={clsx(
                      "self-start px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      getStatusColor(a.status)
                    )}>
                      {a.status.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Enhanced Progress */}
                  <div className="bg-gray-50/50 dark:bg-slate-900/40 rounded-[1.5rem] p-6 mb-8 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em]">Submission Progress</p>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {a.completedInterviews} / {a.numInterviews} Interviews
                      </span>
                    </div>
                    <div className="h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700/50">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((a.completedInterviews / a.numInterviews) * 100, 100)}%` }}
                      />
                    </div>
                    {a.avgScore > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Performance Average: {a.avgScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => navigate(routes.interviewHome)}
                      className={clsx(
                        "flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md dark:shadow-none",
                        a.status === StudentAssignmentStatus.COMPLETED || a.status === StudentAssignmentStatus.EVALUATED
                          ? "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5"
                      )}
                    >
                      {a.status === StudentAssignmentStatus.COMPLETED || a.status === StudentAssignmentStatus.EVALUATED ? (
                        <><CheckCircle className="w-4 h-4" /> Review Submission</>
                      ) : (
                        <><PlayCircle className="w-4 h-4" /> Start Interview</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Class Info & Stats */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-[#0B1120] rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-bl-full opacity-50 transition-colors" />
              <h3 className="text-md font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 Course Info
              </h3>
              <div className="space-y-8">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Unique Code</p>
                    <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 px-6 py-4 rounded-2xl flex items-center justify-between group">
                       <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest font-mono">{cls.classCode}</span>
                       <span className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-50 dark:border-indigo-900/20">
                       <p className="text-[9px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1">Students</p>
                       <p className="text-xl font-black text-gray-900 dark:text-white">{cls.studentCount || 0}</p>
                    </div>
                    <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-50 dark:border-emerald-900/20">
                       <p className="text-[9px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest mb-1">Active</p>
                       <p className="text-xl font-black text-gray-900 dark:text-white">{assignments.length}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <h3 className="text-md font-black uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">Activity Guide</h3>
                <ul className="space-y-6">
                   <li className="flex gap-4">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">1</div>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">Click on <span className="text-white font-bold">Start Interview</span> to begin a practice session for any assignment.</p>
                   </li>
                   <li className="flex gap-4">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">2</div>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">Your overall score will be automatically updated once you complete the <span className="text-white font-bold">required number</span> of sessions.</p>
                   </li>
                   <li className="flex gap-4">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">3</div>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">Check your <span className="text-white font-bold">Mentor Feedback</span> regularly for qualitative improvements.</p>
                   </li>
                </ul>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
