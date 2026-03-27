import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPrompt({ userId }: { userId?: string }) {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Use the hook but we will control when the intensive logic runs if needed.
  // Actually, our useNotifications hook runs automatically on userId change.
  // If we want a prompt, we should modify the hook to be "lazy" or just handle the trigger here.
  
  useEffect(() => {
    // Show prompt if permission is 'default' (not yet asked) and user is logged in
    if (userId && permission === 'default') {
      const isDismissed = localStorage.getItem('notifications_prompt_dismissed');
      if (!isDismissed) {
        const timer = setTimeout(() => setShow(true), 3000); // Wait 3 seconds after entry
        return () => clearTimeout(timer);
      }
    }
  }, [userId, permission]);

  const handleEnable = async () => {
    setShow(false);
    localStorage.setItem('notifications_prompt_dismissed', 'true');
    const result = await Notification.requestPermission();
    setPermission(result);
    // Note: useNotifications in App.tsx will now pick up the 'granted' 
    // status automatically thanks to our polling/interval update logic.
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notifications_prompt_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 transform transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Bell size={24} className="animate-bounce" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Stay Updated!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Enable notifications to get instant feedback on your interviews and resume evaluations.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleEnable}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              Enable Now
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
