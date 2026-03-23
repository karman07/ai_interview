import { useEffect, useState } from 'react';
import { 
  School, 
  Plus, 
  ArrowRight, 
  Search, 
  Loader2,
  BookOpen,
  Users,
  Calendar,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classesApi, StudentClass } from '@/api/classes';
import routes from '@/constants/routes';
import clsx from 'clsx';

export default function StudentClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await classesApi.getStudentClasses();
      setClasses(data);
    } catch (e: any) {
      setError(e.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setJoining(true);
    setJoinError("");
    try {
      await classesApi.joinByCode(joinCode);
      setShowJoinModal(false);
      setJoinCode("");
      load(); // Refresh list
    } catch (e: any) {
      setJoinError(e.response?.data?.message || e.message || "Failed to join class");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Classes</h1>
            <p className="text-sm text-gray-500 font-medium">Manage your enrolled courses and assignments</p>
          </div>
        </div>
        <button 
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Join Class
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-6 text-indigo-600" />
            <p className="text-lg font-semibold animate-pulse">Loading your courses...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-700 font-bold mb-6 text-lg">{error}</p>
            <button 
              onClick={load}
              className="bg-white px-8 py-3 rounded-2xl border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition-all shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-24 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-gray-300">
              <School className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Enter Your Class Code</h3>
            <p className="text-gray-500 text-lg mb-10 font-medium">
              You haven't joined any classes yet. Get a code from your mentor or instructor to get started.
            </p>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="px-10 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              Enroll Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls) => (
              <div 
                key={cls._id}
                onClick={() => navigate(routes.studentClassDetail(cls._id))}
                className="group bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] translate-x-12 -translate-y-12 transition-transform group-hover:scale-110 opacity-50" />
                
                <div className="mb-8 relative">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-gray-900 text-xl leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {cls.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {cls.department}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                      Semester {cls.semester}
                    </span>
                  </div>
                </div>
                
                <div className="flex-grow space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest pl-1">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{cls.studentCount} Peers Enrolled</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest pl-1">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Joined {new Date(cls.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-auto flex items-center justify-between">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Code: <span className="text-gray-900 font-mono text-sm ml-1 select-all">{cls.classCode}</span>
                  </span>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setShowJoinModal(false)}
          />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Join a New Class</h3>
              <p className="text-gray-500 font-medium">Enter the 6-character code provided by your mentor</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="EX: ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className={clsx(
                    "w-full bg-gray-50 border-2 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[0.2em] uppercase focus:outline-none transition-all",
                    joinError ? "border-rose-200 focus:border-rose-500" : "border-gray-100 focus:border-indigo-500"
                  )}
                  autoFocus
                />
                {joinError && (
                  <p className="text-rose-600 text-xs font-bold mt-3 text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {joinError}
                  </p>
                )}
              </div>

              <button 
                type="submit"
                disabled={joining || joinCode.length < 6}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
              >
                {joining ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Enrollment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
