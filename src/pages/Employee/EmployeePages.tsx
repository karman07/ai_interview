import { Calendar } from 'lucide-react';

export const Interviews = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Calendar className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Interviews</h1>
          <p className="text-gray-600 dark:text-gray-400">Practice and scheduled interviews</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">No interviews scheduled yet</p>
      </div>
    </div>
  </div>
);

export const Messages = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Messages</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">No messages yet</p>
      </div>
    </div>
  </div>
);

export const Invitations = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Invitations</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">No invitations yet</p>
      </div>
    </div>
  </div>
);

export const EmployeeProfile = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Profile management coming soon</p>
      </div>
    </div>
  </div>
);
