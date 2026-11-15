// Registered by src/utils/webPush.js, and only by it — a device that never calls
// enablePushNotifications() never registers this file, so it stays completely
// inert for everyone else. Registered at its own scope (not "/") specifically so
// it coexists with vite-plugin-pwa's own generated service worker instead of
// fighting it for control of the page.
//
// Config can't come from Vite env vars here (this is a static file, not a bundled
// module) — it arrives as query params on this file's own registration URL instead.
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const params = new URL(location.href).searchParams;
firebase.initializeApp({
  apiKey: params.get("apiKey"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Tendr", {
    body: body || "",
    icon: "/tendr-icon.png",
    badge: "/tendr-icon.png",
    data: payload.data || {},
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";
  event.waitUntil(self.clients.openWindow(link));
});
