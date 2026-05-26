import React, { useState, useMemo } from "react";

const font = "'Outfit', sans-serif";

const BASE_SPLITS = {
  Caterer:      { pct: 40, emoji: "🍽️", label: "Catering" },
  Decorator:    { pct: 25, emoji: "🎨", label: "Decoration" },
  Photographer: { pct: 20, emoji: "📸", label: "Photography" },
  DJ:           { pct: 15, emoji: "🎵", label: "DJ & Music" },
  Anchor:       { pct: 10, emoji: "🎤", label: "Anchor / Emcee" },
  Transport:    { pct: 8,  emoji: "🚗", label: "Transport" },
  Mehendi:      { pct: 8,  emoji: "🌿", label: "Mehendi Artist" },
  Makeup:       { pct: 12, emoji: "💄", label: "Makeup Artist" },
};

const ALL_SERVICES = Object.keys(BASE_SPLITS);

function fmtINR(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function normalize(services, budget) {
  // Assign base pcts to selected services; cap at budget
  const raw = services.map(s => ({ service: s, pct: BASE_SPLITS[s]?.pct ?? 10 }));
  const total = raw.reduce((a, b) => a + b.pct, 0);
  return raw.map(r => ({
    service: r.service,
    pct: Math.round((r.pct / total) * 100),
    amount: Math.round((r.pct / total) * budget),
    emoji: BASE_SPLITS[r.service]?.emoji ?? "✦",
    label: BASE_SPLITS[r.service]?.label ?? r.service,
  }));
}

export default function BudgetSplitModal({ open, onClose, onContinue, budget = 0, initialServices = [] }) {
  const [services, setServices] = useState(initialServices);

  const splits = useMemo(() => normalize(services, budget), [services, budget]);

  const toggle = (svc) => {
    setServices(prev =>
      prev.includes(svc) ? (prev.length > 1 ? prev.filter(s => s !== svc) : prev) : [...prev, svc]
    );
  };

  if (!open) return null;

  const remaining = services.length > 0
    ? budget - splits.reduce((a, b) => a + b.amount, 0)
    : 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(44,26,14,0.55)", backdropFilter: "blur(3px)" }} />

      {/* Modal */}
      <div style={{ position: "relative", zIndex: 1, width: "min(96vw,520px)", maxHeight: "90vh", background: "#FFFCF5", borderRadius: 20, boxShadow: "0 32px 80px rgba(44,26,14,0.22)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "18px 22px 14px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 3 }}>💰 Budget Split</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Your total budget · <span style={{ color: "#CCAB4A", fontWeight: 700 }}>{fmtINR(budget)}</span>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "18px 20px", flex: 1 }}>

          {/* Split bars */}
          {splits.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {splits.map(({ service, pct, amount, emoji, label }) => (
                <div key={service}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{emoji} {label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#C47A2E" }}>{fmtINR(amount)}</span>
                      <span style={{ fontSize: 11, color: "#9B7450" }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "rgba(196,122,46,0.12)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 10, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                </div>
              ))}
              {remaining > 0 && (
                <div style={{ fontSize: 11, color: "#9B7450", textAlign: "right", marginTop: 2 }}>
                  ₹{remaining.toLocaleString("en-IN")} in buffer / miscellaneous
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#9B7450", fontSize: 13, padding: "20px 0" }}>Select at least one service below</div>
          )}

          {/* Add more services */}
          <div style={{ borderTop: "1px solid rgba(196,122,46,0.12)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Add / Remove Services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ALL_SERVICES.map(svc => {
                const { emoji, label } = BASE_SPLITS[svc];
                const active = services.includes(svc);
                return (
                  <button key={svc} onClick={() => toggle(svc)}
                    style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.22)"}`, background: active ? "rgba(196,122,46,0.1)" : "#fff", color: active ? "#C47A2E" : "#7A5535", transition: "all 0.15s" }}>
                    {emoji} {label} {active && "✓"}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#9B7450", marginTop: 10 }}>
              * Split is indicative — actual quotes may vary. You'll get exact pricing in vendor chats.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(196,122,46,0.12)", background: "#fff", display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.28)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Skip
          </button>
          <button onClick={() => onContinue(services)}
            style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.32)" }}>
            Continue Booking →
          </button>
        </div>
      </div>
    </div>
  );
}
