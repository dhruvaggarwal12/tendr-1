import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";

/**
 * Wraps any planning tool page with a one-time intro screen.
 * Props:
 *   toolId       — unique key stored in localStorage e.g. "checklist"
 *   icon         — emoji e.g. "✅"
 *   title        — tool name
 *   tagline      — one-line hook
 *   description  — 1-2 sentence description
 *   steps        — array of { icon, text } how-it-works steps
 *   accentColor  — optional (defaults to brand gold)
 *   children     — the actual tool page to render once intro is dismissed
 */
export default function ToolIntroWrapper({
  toolId,
  icon,
  title,
  tagline,
  description,
  steps = [],
  children,
}) {
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>

      {/* Back button */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, background: "rgba(255,252,245,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(139,69,19,0.1)", height: 56, display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.18)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: font }}>
          ← Home
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#C47A2E", letterSpacing: "0.08em", textTransform: "uppercase" }}>Planning Tools</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 580, width: "100%", marginTop: 40 }}>

        {/* Icon + title */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, rgba(196,122,46,0.15), rgba(204,171,74,0.1))", border: "2px solid rgba(196,122,46,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 20px" }}>
            {icon}
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>
            Planning Tool
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px", lineHeight: 1.2 }}>
            {title}
          </h1>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#C47A2E", margin: "0 0 14px" }}>{tagline}</p>
          <p style={{ fontSize: 15, color: "#7A5535", lineHeight: 1.7, margin: 0, maxWidth: 460, marginInline: "auto" }}>{description}</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "20px auto 0" }} />
        </div>

        {/* How it works */}
        {steps.length > 0 && (
          <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "24px 28px", border: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 28, boxShadow: "0 4px 20px rgba(139,69,19,0.07)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7450", marginBottom: 16 }}>How it works</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#2C1A0E" }}>{step.title}</span>
                    {step.desc && <p style={{ fontSize: 13, color: "#9B7450", margin: "2px 0 0" }}>{step.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Don't show again + Start */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <button
            onClick={handleStart}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 18px rgba(196,122,46,0.4)", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Get Started →
          </button>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div
              onClick={() => setDontShowAgain(!dontShowAgain)}
              style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${dontShowAgain ? "#C47A2E" : "rgba(139,69,19,0.3)"}`, background: dontShowAgain ? "#C47A2E" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s", flexShrink: 0 }}
            >
              {dontShowAgain && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: "#9B7450", fontWeight: 500 }}>Don't show this intro again</span>
          </label>
        </div>
      </div>
    </div>
  );
}
