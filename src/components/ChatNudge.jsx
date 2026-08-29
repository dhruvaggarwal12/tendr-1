import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "tendr_nudge_dismissed";

const filled = {
  flex: 1, padding: "7px 6px", borderRadius: 20,
  border: "1.5px solid #C47A2E", background: "#C47A2E",
  color: "#fff", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em",
  whiteSpace: "nowrap", transition: "opacity 0.15s",
};
const outline = {
  flex: 1, padding: "7px 6px", borderRadius: 20,
  border: "1.5px solid rgba(196,122,46,0.35)", background: "transparent",
  color: "#7A5535", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em",
  whiteSpace: "nowrap", transition: "opacity 0.15s",
};

export default function ChatNudge() {
  const [mounted, setMounted]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch {}

    const show = () => {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    };

    // Trigger on 8s delay OR 35% scroll depth — whichever fires first
    let fired = false;
    const fire = () => { if (fired) return; fired = true; show(); cleanup(); };

    const onScroll = () => {
      if (window.scrollY > document.documentElement.scrollHeight * 0.30) fire();
    };

    const timer = setTimeout(fire, 8000);
    window.addEventListener("scroll", onScroll, { passive: true });

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
    return cleanup;
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setTimeout(() => setMounted(false), 420);
  };

  const go = (path) => { navigate(path); dismiss(); };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        .chat-nudge {
          position: fixed;
          right: 16px;
          bottom: 76px;
          z-index: 1300;
          width: 272px;
          font-family: 'Outfit', sans-serif;
          transition: transform 0.42s cubic-bezier(0.34,1.4,0.64,1), opacity 0.35s ease;
        }
        @media (min-width: 900px) {
          .chat-nudge { bottom: 28px; }
        }
      `}</style>

      <div
        className="chat-nudge"
        style={{
          transform: visible ? "translateY(0)" : "translateY(130%)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <div style={{
          background: "#FFFCF5",
          borderRadius: 18,
          boxShadow: "0 10px 40px rgba(28,14,4,0.18), 0 2px 8px rgba(28,14,4,0.08)",
          border: "1px solid rgba(196,122,46,0.18)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px 9px",
            background: "#FFF8EC",
            borderBottom: "1px solid rgba(28,14,4,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.2)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>Tendr</span>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(44,26,14,0.35)", fontSize: 16, lineHeight: 1, padding: "2px 4px", fontFamily: "inherit" }}
            >✕</button>
          </div>

          {/* Message bubble */}
          <div style={{ padding: "13px 14px 6px" }}>
            <div style={{
              display: "inline-block",
              background: "#F5ECD8",
              borderRadius: "4px 14px 14px 14px",
              padding: "9px 13px",
              fontSize: 13.5,
              color: "#2C1A0E",
              lineHeight: 1.5,
            }}>
              Hey! What are you looking for? 👋
            </div>
          </div>

          {/* Options */}
          <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Row 1 — primary actions */}
            <div style={{ display: "flex", gap: 7 }}>
              <button style={filled} onClick={() => go("/listings")}>Show me vendors</button>
              <button style={filled} onClick={() => go("/booking")}>Help me plan</button>
            </div>
            {/* Row 2 — secondary actions */}
            <div style={{ display: "flex", gap: 7 }}>
              <button style={outline} onClick={dismiss}>Just browsing</button>
              <button style={outline} onClick={() => go("/baat-karo")}>Need help</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
