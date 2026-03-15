/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBaMm5pXooMcdiLKdqcSM_eVh1zB6_n7Eo",
  authDomain: "uzbekas.firebaseapp.com",
  projectId: "uzbekas",
  storageBucket: "uzbekas.firebasestorage.app",
  messagingSenderId: "450501998688",
  appId: "1:450501998688:web:ef401b336acd22457a2b05",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "Yangi xabar";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "Xabarni ko'rish uchun bosing",
    icon: "/vite.svg",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});