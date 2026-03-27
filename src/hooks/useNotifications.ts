import { useEffect } from 'react';
import { messaging, getToken, onMessage } from "@/firebase";
import { UsersApi } from "@/api/users";
import { useNotification } from "@/contexts/NotificationContext";

export const useNotifications = (userId?: string) => {
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!userId) return;

    const registerToken = async () => {
      try {
        if (Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          
          const token = await getToken(messaging, { 
            vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (token) {
            await UsersApi.saveFcmToken(token);
          }
        }
      } catch (error: any) {
        addNotification({
          type: 'error',
          title: 'Push Error',
          message: 'Failed to register for notifications.'
        });
      }
    };

    // Attempt registration on mount
    registerToken();

    // If permission is not yet granted/denied, poll for change (to avoid reloads)
    let interval: any;
    if (Notification.permission === 'default') {
      interval = setInterval(() => {
        if (Notification.permission === 'granted') {
          registerToken();
          clearInterval(interval);
        }
      }, 1000); // Check every second
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      if (payload.notification) {
        // 1. In-app toast
        addNotification({
          type: 'info',
          title: payload.notification.title || 'New Notification',
          message: payload.notification.body || 'You have a new update.'
        });

        // 2. Browser Native OS Popup (if permission is granted)
        if (Notification.permission === 'granted') {
           new Notification(payload.notification.title || 'New Message', {
             body: payload.notification.body || 'You have a new update.',
             icon: '/logo.png'
           });
        }
      }
    });

    return () => {
      if (interval) clearInterval(interval);
      unsubscribe();
    };
  }, [userId]);
};
