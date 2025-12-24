import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

const Applications = () => {
  const navigate = useNavigate();
  const applications = [
    { _id: '1', jobTitle: 'Senior Frontend Developer', company: 'Tech Corp', status: 'reviewed', appliedAt: '2 days ago' },
    { _id: '2', jobTitle: 'Full Stack Engineer', company: 'StartupXYZ', status: 'pending', appliedAt: '1 week ago' },
    { _id: '3', jobTitle: 'Backend Developer', company: 'Innovation Labs', status: 'shortlisted', appliedAt: '3 days ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'shortlisted': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your job applications</p>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} onClick={() => navigate(`/employee/applications/${app._id}`)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-[1.02] group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{app.jobTitle}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{app.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{app.appliedAt}</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Applications;
