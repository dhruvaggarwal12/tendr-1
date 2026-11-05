import React, { useEffect } from "react";

const font = "'Outfit', sans-serif";

// Lightweight in-app "new message" toast — shown by ChatContext whenever a
// message arrives for a conversation that isn't the one currently open.
export default function ChatToast({ toast, onDismiss, onView }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      onClick={onView}
      style={{
        position: "fixed", top: 18, right: 18, zIndex: 999999,
        width: "min(90vw, 340px)", background: "#FFFCF5",
        borderRadius: 16, padding: "14px 16px",
        boxShadow: "0 16px 48px rgba(44,26,14,0.28)",
        border: "1.5px solid rgba(196,122,46,0.25)",
        display: "flex", alignItems: "flex-start", gap: 12,
        cursor: "pointer", fontFamily: font,
        animation: "chat-toast-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`@keyframes chat-toast-in { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }`}</style>
      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fff" }}>
        💬
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>{toast.title}</div>
        <div style={{ fontSize: 12.5, color: "#7A5535", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toast.body}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(44,26,14,0.06)", color: "#9B7450", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >✕</button>
    </div>
  );
}
