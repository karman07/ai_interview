import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, FileText, Mic, BookOpen,
  BarChart2, Award, Building2, LogOut, ArrowRight, MessageSquare, ClipboardList, School,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/constants/routes';
import http from '@/api/http';

interface UniversityInfo {
  name: string;
  domain: string;
  resumeLimit: number;
  interviewLimit: number;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [university, setUniversity] = useState<UniversityInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'student') {
      navigate(routes.dashboard, { replace: true });
      return;
    }
    if (user.universityId) {
      http.get(`/universities/${user.universityId}`)
        .then(r => setUniversity(r.data))
        .catch(() => {});
    }
  }, [user]);

  const resumeUsed = user?.resumeCount ?? 0;
  const interviewUsed = user?.interviewCount ?? 0;
  const resumeLimit = university?.resumeLimit ?? 5;
  const interviewLimit = university?.interviewLimit ?? 10;

  const quickActions = [
    {
      title: 'Build Resume',
      description: `${resumeUsed} / ${resumeLimit} used`,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-600',
      labelColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      route: routes.resumeBuilder,
      disabled: resumeUsed >= resumeLimit,
    },
    {
      title: 'My Classes',
      description: 'Courses and enrollment',
      icon: <School className="w-6 h-6" />,
      color: 'bg-indigo-600',
      labelColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      route: routes.studentClasses,
      disabled: false,
    },
    {
      title: 'Course Assignments',

      description: 'Pending tasks from mentors',
      icon: <ClipboardList className="w-6 h-6" />,
      color: 'bg-indigo-600',
      labelColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      route: routes.studentAssignments,
      disabled: false,
    },
    {
      title: 'Mentor Feedback',

      description: 'View guidance from faculty',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-rose-500',
      labelColor: 'text-rose-500',
      bgLight: 'bg-rose-50',
      route: routes.studentFeedback,
      disabled: false,
    },
    {
      title: 'Practice Interview',

      description: `${interviewUsed} / ${interviewLimit} used`,
      icon: <Mic className="w-6 h-6" />,
      color: 'bg-indigo-600',
      labelColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      route: routes.interviewHome,
      disabled: interviewUsed >= interviewLimit,
    },
    {
      title: 'Study Resources',
      description: 'Browse learning materials',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-emerald-600',
      labelColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      route: routes.resources,
      disabled: false,
    },
    {
      title: 'Analytics',
      description: 'View your progress',
      icon: <BarChart2 className="w-6 h-6" />,
      color: 'bg-orange-500',
      labelColor: 'text-orange-500',
      bgLight: 'bg-orange-50',
      route: routes.dashboard,
      disabled: false,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(routes.universityLogin, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">AI Interview</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Student</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          {university && (
            <div className="flex items-center gap-2 mt-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600 font-medium">{university.name}</span>
            </div>
          )}
        </div>

        {/* Usage cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <UsageCard
            label="Resumes Built"
            used={resumeUsed}
            limit={resumeLimit}
            color="blue"
            icon={<FileText className="w-5 h-5" />}
          />
          <UsageCard
            label="Mock Interviews"
            used={interviewUsed}
            limit={interviewLimit}
            color="indigo"
            icon={<Mic className="w-5 h-5" />}
          />
        </div>

        {/* Quick actions */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map(a => (
            <button
              key={a.title}
              onClick={() => !a.disabled && navigate(a.route)}
              disabled={a.disabled}
              className={`group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left transition-all hover:shadow-md hover:border-gray-200 ${
                a.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className={`w-12 h-12 ${a.bgLight} ${a.labelColor} rounded-xl flex items-center justify-center shrink-0`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.disabled ? 'Limit reached' : a.description}</p>
              </div>
              {!a.disabled && (
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Achievement hint */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg shadow-blue-200">
          <Award className="w-10 h-10 opacity-80 shrink-0" />
          <div>
            <p className="font-bold">Keep practicing!</p>
            <p className="text-sm text-blue-100 mt-0.5">
              Complete mock interviews to improve your performance score and land your dream job.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function UsageCard({
  label, used, limit, color, icon,
}: { label: string; used: number; limit: number; color: 'blue' | 'indigo'; icon: React.ReactNode }) {
  const pct = Math.min((used / limit) * 100, 100);
  const full = used >= limit;
  const barColor = full ? 'bg-red-400' : color === 'blue' ? 'bg-blue-600' : 'bg-indigo-600';
  const textColor = color === 'blue' ? 'text-blue-600' : 'text-indigo-600';
  const bgColor = color === 'blue' ? 'bg-blue-50' : 'bg-indigo-50';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 ${bgColor} ${textColor} rounded-xl flex items-center justify-center`}>{icon}</div>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className={`text-2xl font-bold ${full ? 'text-red-500' : textColor}`}>{used}</span>
        <span className="text-xs text-gray-400">/ {limit}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
