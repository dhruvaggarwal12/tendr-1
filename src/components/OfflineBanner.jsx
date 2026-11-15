import React, { useEffect, useState } from "react";

const font = "'Outfit', sans-serif";

/**
 * Global connectivity banner — shown whenever the browser/webview loses its
 * network connection, since this app has no bundled offline fallback (no
 * navigateFallback in vite.config.js's Workbox setup) and most screens hit
 * the API directly, so a dropped connection otherwise just looks like silent,
 * confusing failures. Doubles as the "no connection" state the Capacitor
 * wrapper needs — there's no native shell content behind the webview, so
 * without this, going offline there would just show a blank/broken page.
 */
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let backOnlineTimer;
    const handleOffline = () => {
      clearTimeout(backOnlineTimer);
      setShowBackOnline(false);
      setIsOffline(true);
    };
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      backOnlineTimer = setTimeout(() => setShowBackOnline(false), 2500);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(backOnlineTimer);
    };
  }, []);

  if (!isOffline && !showBackOnline) return null;

  const offline = isOffline;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "env(safe-area-inset-top, 0px)",
        left: 0, right: 0,
        zIndex: 999999,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "9px 16px",
        fontFamily: font,
        fontSize: 12.5, fontWeight: 700,
        color: "#fff",
        background: offline ? "#B23B3B" : "#3E8F5C",
        transition: "background 0.25s ease",
        animation: "offline-banner-in 0.2s ease",
      }}
    >
      <style>{`@keyframes offline-banner-in { from { transform: translateY(-100%); } to { transform: translateY(0); } }`}</style>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{offline ? "🔌" : "✅"}</span>
      <span>{offline ? "You're offline — some features may not work" : "Back online"}</span>
    </div>
  );
}
