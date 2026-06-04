import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";

// Tool-specific feature highlights
const TOOL_FEATURES = {
  checklist: [
    { icon: "📋", text: "Must Do, Recommended & Nice to Have tasks" },
    { icon: "✓", text: "Tick tasks off as you complete them" },
    { icon: "🔍", text: "Find vendors directly from relevant tasks" },
    { icon: "💾", text: "Progress auto-saved locally" },
  ],
  timeline: [
    { icon: "📅", text: "Day-by-day countdown to your event" },
    { icon: "🎯", text: "Tailored plans for each event type" },
    { icon: "🔍", text: "Find vendors from any task directly" },
    { icon: "💾", text: "Progress auto-saved locally" },
  ],
  budget: [
    { icon: "💰", text: "Smart budget split by category" },
    { icon: "📊", text: "Track actual spend vs allocated" },
    { icon: "🔍", text: "See vendors within your budget" },
    { icon: "📄", text: "Export summary for approval" },
  ],
  decorfinder: [
    { icon: "🎨", text: "8 quick questions, instant results" },
    { icon: "✨", text: "Matches based on your style, space & occasion" },
    { icon: "🎀", text: "Specific decoration elements suggested" },
    { icon: "📸", text: "Coverage priorities matched to your vision" },
  ],
};

export default function ToolIntroWrapper({ toolId, icon, title, tagline, description, steps = [], children }) {
  const navigate = useNavigate();
  const storageKey = `tendr_intro_seen_${toolId}`;
  const [seen, setSeen] = useState(() => !!localStorage.getItem(storageKey));
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (seen) return children;

  const handleStart = () => {
    if (dontShowAgain) localStorage.setItem(storageKey, "1");
    setSeen(true);
  };

  const features = TOOL_FEATURES[toolId] || [];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,252,245,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(196,122,46,0.1)", height: 52, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.15)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: font }}>
          ← Back
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", letterSpacing: "0.12em", textTransform: "uppercase" }}>Planning Tool</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Hero */}
        <div style={{ display: "flex", gap: 36, alignItems: "flex-start", marginBottom: 48, flexWrap: "wrap" }}>
          <div style={{ width: 100, height: 100, borderRadius: 28, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: "0 8px 28px rgba(196,122,46,0.35)", flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.03em", margin: "0 0 8px", lineHeight: 1.1 }}>{title}</h1>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#C47A2E", margin: "0 0 10px" }}>{tagline}</p>
            <p style={{ fontSize: 14.5, color: "#7A5535", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 500 }}>{description}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={handleStart}
                style={{ padding: "14px 36px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 6px 22px rgba(196,122,46,0.4)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(196,122,46,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(196,122,46,0.4)"; }}>
                Get Started →
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 2, background: "linear-gradient(90deg,#C47A2E,#CCAB4A,transparent)", borderRadius: 100, marginBottom: 40 }} />

        <div style={{ display: "grid", gridTemplateColumns: features.length > 0 ? "1fr 1fr" : "1fr", gap: 32, alignItems: "start" }}>

          {/* How it works */}
          {steps.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9B7450", margin: "0 0 18px" }}>How it works</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", background: "#FFFCF5", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 900, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>{step.title}</div>
                      {step.desc && <div style={{ fontSize: 12.5, color: "#9B7450", lineHeight: 1.5 }}>{step.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's included */}
          {features.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9B7450", margin: "0 0 18px" }}>What's included</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 16px", background: "#FFFCF5", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.1)" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ fontSize: 13.5, color: "#2C1A0E", fontWeight: 600 }}>{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Don't show again */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none", marginTop: 20 }}>
                <div onClick={() => setDontShowAgain(!dontShowAgain)}
                  style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${dontShowAgain ? "#C47A2E" : "rgba(139,69,19,0.3)"}`, background: dontShowAgain ? "#C47A2E" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s", flexShrink: 0 }}>
                  {dontShowAgain && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: "#9B7450", fontWeight: 500 }}>Don't show this intro again</span>
              </label>
            </div>
          )}
        </div>

        {/* CTA at bottom for mobile */}
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
          <button onClick={handleStart}
            style={{ padding: "13px 36px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
            Start Now →
          </button>
        </div>

      </div>
    </div>
  );
}
