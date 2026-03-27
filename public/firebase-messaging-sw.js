importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAGhjwshhAC0fDUqkbAz3jJq_iDHwFy88o",
  authDomain: "ai-interview-7e471.firebaseapp.com",
  projectId: "ai-interview-7e471",
  storageBucket: "ai-interview-7e471.firebasestorage.app",
  messagingSenderId: "388912433938",
  appId: "1:388912433938:web:7f71f3ee65f81e4bbd81cb",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
