import React from "react";

const font = "'Outfit', sans-serif";

// Asks for browser notification permission in the one place it's actually relevant —
// right after the person opens a chat — instead of never asking at all (the previous
// state: the only requestPermission() call anywhere in the app was on an unrelated
// mini-game page, so this was effectively dead for everyone). Requesting permission
// only runs from the "Enable" button's own click handler, never automatically, since
// browsers expect a real user gesture for this prompt to behave well.
export default function NotificationPermissionPrompt({ show, onEnable, onDismiss }) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", left: 18, right: 18,
        maxWidth: 380, margin: "0 auto", zIndex: 999998,
        background: "#FFFCF5", borderRadius: 16, padding: "14px 16px",
        boxShadow: "0 16px 48px rgba(44,26,14,0.28)",
        border: "1.5px solid rgba(196,122,46,0.25)",
        display: "flex", alignItems: "flex-start", gap: 12,
        fontFamily: font,
        animation: "notif-prompt-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`@keyframes notif-prompt-in { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }`}</style>
      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
        🔔
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>Get notified of new messages</div>
        <div style={{ fontSize: 12, color: "#7A5535", marginBottom: 10, lineHeight: 1.4 }}>Turn on notifications so you don't miss a reply when this tab isn't open.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onEnable}
            style={{ padding: "7px 14px", borderRadius: 9, border: "none", background: "#C47A2E", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}
          >Enable</button>
          <button
            onClick={onDismiss}
            style={{ padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(196,122,46,0.25)", background: "transparent", color: "#7A5535", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}
          >Not now</button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(44,26,14,0.06)", color: "#9B7450", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >✕</button>
    </div>
  );
}
