import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Calendar, TrendingUp, MessageSquare, Award, Clock } from 'lucide-react';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setStats({
      totalApplications: 12,
      pendingApplications: 5,
      interviewsScheduled: 3,
      unreadMessages: 4,
      averageInterviewScore: 78,
      bestInterviewScore: 92,
      recentApplications: [
        { _id: '1', jobTitle: 'Senior Frontend Developer', company: 'Tech Corp', status: 'reviewed', appliedAt: new Date() },
        { _id: '2', jobTitle: 'Full Stack Engineer', company: 'StartupXYZ', status: 'pending', appliedAt: new Date() }
      ]
    });
  }, []);

  const statCards = [
    { icon: Briefcase, label: 'Total Applications', value: stats?.totalApplications || 0, gradient: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-600 dark:text-indigo-400', link: '/employee/applications' },
    { icon: Clock, label: 'Pending', value: stats?.pendingApplications || 0, gradient: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600 dark:text-yellow-400', link: '/employee/applications' },
    { icon: Calendar, label: 'Interviews', value: stats?.interviewsScheduled || 0, gradient: 'from-green-500 to-green-600', textColor: 'text-green-600 dark:text-green-400', link: '/employee/interviews' },
    { icon: MessageSquare, label: 'Messages', value: stats?.unreadMessages || 0, gradient: 'from-purple-500 to-purple-600', textColor: 'text-purple-600 dark:text-purple-400', link: '/employee/messages' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your job search overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} onClick={() => navigate(stat.link)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interview Performance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats?.averageInterviewScore}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all" style={{ width: `${stats?.averageInterviewScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate('/employee/jobs')} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold">
                Browse Jobs
              </button>
              <button onClick={() => navigate('/employee/interviews')} className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
                Practice Interview
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Applications</h2>
            </div>
            <button onClick={() => navigate('/employee/applications')} className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">View All</button>
          </div>
          <div className="space-y-4">
            {stats?.recentApplications.map((app: any) => (
              <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => navigate(`/employee/applications/${app._id}`)}>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{app.company}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'reviewed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
