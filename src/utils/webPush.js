import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Stays false (feature fully hidden, same pattern as Sign in with Apple) until a
// real Firebase web app + VAPID key are created and these env vars are filled in.
export const HAS_PUSH = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.messagingSenderId && FIREBASE_CONFIG.appId && VAPID_KEY
);

let messagingSetup = null; // { messaging, registration } — cached per page load

// firebase-messaging-sw.js is a static file (see public/) that can't read Vite env
// vars, so the config is handed to it as query params on its own registration URL
// instead — it reads them back via `new URL(location.href).searchParams`. The SW
// is only ever registered here, and only when HAS_PUSH is true, so an unconfigured
// app never registers it and the file stays completely inert.
async function getFirebaseMessaging() {
  if (!HAS_PUSH || typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  if (messagingSetup) return messagingSetup;

  const params = new URLSearchParams(FIREBASE_CONFIG);
  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
    { scope: "/firebase-cloud-messaging-push-scope" }
  );

  if (!getApps().length) initializeApp(FIREBASE_CONFIG);
  const messaging = getMessaging();

  // Foreground messages (tab open, focused or not): the existing socket-driven
  // in-app toast/Notification already covers this case, so just swallow it here
  // to avoid showing the same message twice.
  onMessage(messaging, () => {});

  messagingSetup = { messaging, registration };
  return messagingSetup;
}

/**
 * Requests browser notification permission (no-op if already decided) and, once
 * granted, registers the resulting FCM token with the given auth role. No-ops
 * entirely when Firebase isn't configured yet.
 */
export async function enablePushNotifications(token, role) {
  if (!HAS_PUSH || !token || !role) return false;
  try {
    const setup = await getFirebaseMessaging();
    if (!setup) return false;

    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const fcmToken = await getToken(setup.messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: setup.registration,
    });
    if (!fcmToken) return false;

    const path = role === "vendor" ? "vendors" : "consumers";
    await fetch(`${BASE_URL}/${path}/me/push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: fcmToken, platform: "web" }),
    });
    try { localStorage.setItem("tendr_push_token", fcmToken); } catch {}
    return true;
  } catch (err) {
    console.warn("enablePushNotifications failed:", err.message);
    return false;
  }
}

/** Unregisters this device's token on logout so it stops receiving push after sign-out. */
export async function disablePushNotifications(token, role) {
  let fcmToken = null;
  try { fcmToken = localStorage.getItem("tendr_push_token"); } catch {}
  if (!fcmToken || !token || !role) return;
  try {
    const path = role === "vendor" ? "vendors" : "consumers";
    await fetch(`${BASE_URL}/${path}/me/push-token`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: fcmToken }),
    });
  } catch { /* best-effort cleanup */ }
  try { localStorage.removeItem("tendr_push_token"); } catch {}
}
