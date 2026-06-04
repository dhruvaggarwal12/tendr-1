import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";

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

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      {/* Compact top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,252,245,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(196,122,46,0.1)", height: 52, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.15)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: font }}>
          ← Back
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", letterSpacing: "0.12em", textTransform: "uppercase" }}>Planning Tool</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Hero section */}
        <div style={{ display: "flex", gap: 40, alignItems: "center", marginBottom: 36, flexWrap: "wrap" }}>
          {/* Left: Icon + title */}
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ width: 96, height: 96, borderRadius: 28, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, boxShadow: "0 8px 28px rgba(196,122,46,0.35)", marginBottom: 0 }}>
              {icon}
            </div>
          </div>
          {/* Right: Text */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.03em", margin: "0 0 8px", lineHeight: 1.1 }}>
              {title}
            </h1>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#C47A2E", margin: "0 0 10px", lineHeight: 1.4 }}>{tagline}</p>
            <p style={{ fontSize: 15, color: "#7A5535", lineHeight: 1.7, margin: 0, maxWidth: 480 }}>{description}</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 2, background: "linear-gradient(90deg,#C47A2E,#CCAB4A,transparent)", borderRadius: 100, marginBottom: 36 }} />

        {/* How it works */}
        {steps.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9B7450", marginBottom: 20, margin: "0 0 20px" }}>How it works</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ background: "#FFFCF5", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 12px rgba(139,69,19,0.05)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 900, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{step.title}</div>
                    {step.desc && <p style={{ fontSize: 13, color: "#9B7450", margin: 0, lineHeight: 1.5 }}>{step.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", maxWidth: 400 }}>
          <button
            onClick={handleStart}
            style={{ padding: "15px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 6px 22px rgba(196,122,46,0.4)", transition: "all 0.2s", letterSpacing: "0.01em" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(196,122,46,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(196,122,46,0.4)"; }}
          >
            Get Started →
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div
              onClick={() => setDontShowAgain(!dontShowAgain)}
              style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${dontShowAgain ? "#C47A2E" : "rgba(139,69,19,0.3)"}`, background: dontShowAgain ? "#C47A2E" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s", flexShrink: 0 }}>
              {dontShowAgain && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: "#9B7450", fontWeight: 500 }}>Don't show this intro again</span>
          </label>
        </div>

      </div>
    </div>
  );
}
