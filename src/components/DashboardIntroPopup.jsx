import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";

// Shown once, right after a brand-new personal account finishes signing up and lands
// on the home screen — orients them to the Dashboard before anything else competes for
// attention.
const FEATURES = [
  { emoji: "📅", text: "Track every booking — ongoing, upcoming, completed, all in one place" },
  { emoji: "💬", text: "Chat directly with vendors about your event" },
  { emoji: "🎉", text: "Party Hub tools & guest list once you're planning an event" },
  { emoji: "🎁", text: "Refer friends and earn rewards" },
];

export default function DashboardIntroPopup() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onTrigger = () => setVisible(true);
    window.addEventListener("tendr:show-dashboard-intro", onTrigger);
    return () => window.removeEventListener("tendr:show-dashboard-intro", onTrigger);
  }, []);

  const dismiss = () => setVisible(false);

  const goToDashboard = () => {
    dismiss();
    navigate("/dashboard");
  };

  if (!visible) return null;

  return (
    <>
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100009, backdropFilter: "blur(3px)" }} />

      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(90vw, 380px)", background: "#FFFCF5", borderRadius: 20,
        boxShadow: "0 16px 48px rgba(28,10,0,0.22)", border: "1.5px solid rgba(196,122,46,0.18)",
        zIndex: 100010, fontFamily: font, overflow: "auto", maxHeight: "85dvh",
        animation: "dashIntroIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "22px 22px 18px", position: "relative" }}>
          <button onClick={dismiss} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🗂️</div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.01em" }}>Your Dashboard is ready</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>Everything about your events, in one place.</p>
        </div>

        <div style={{ padding: "18px 22px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {FEATURES.map(({ emoji, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 16, lineHeight: "20px", flexShrink: 0 }}>{emoji}</span>
                <span style={{ fontSize: 13, color: "#4A2810", fontWeight: 500, lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 12, padding: "11px 13px", marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(196,122,46,0.14)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: 12, color: "#6B3A1F", fontWeight: 600, lineHeight: 1.4 }}>
              Tap your profile icon anytime — top-right on desktop, bottom bar on mobile — to jump straight back here.
            </span>
          </div>

          <button onClick={goToDashboard}
            style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)", marginBottom: 6 }}>
            Go to Dashboard
          </button>
          <button onClick={dismiss}
            style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dashIntroIn {
          from { opacity: 0; transform: translate(-50%, -46%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
