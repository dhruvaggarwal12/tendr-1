import React, { useMemo } from "react";

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

function fmtINR(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function normalize(services, budget) {
  const raw   = services.map(s => ({ service: s, pct: BASE_SPLITS[s]?.pct ?? 10 }));
  const total = raw.reduce((a, b) => a + b.pct, 0);
  return raw.map(r => ({
    service: r.service,
    pct:    Math.round((r.pct / total) * 100),
    amount: Math.round((r.pct / total) * budget),
    emoji:  BASE_SPLITS[r.service]?.emoji ?? "✦",
    label:  BASE_SPLITS[r.service]?.label ?? r.service,
    rawPct: r.pct,
  }));
}

export default function BudgetSplitModal({ open, onClose, onContinue, onBudgetAllocator, budget = 0, initialServices = [] }) {
  // Only show the services the customer already selected — no add/remove
  const services = initialServices.length > 0 ? initialServices : Object.keys(BASE_SPLITS);
  const splits   = useMemo(() => normalize(services, budget), [services, budget]);

  if (!open) return null;

  const remaining = budget - splits.reduce((a, b) => a + b.amount, 0);

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
            Suggested split across your <span style={{ color: "#CCAB4A", fontWeight: 700 }}>{services.length} selected service{services.length !== 1 ? "s" : ""}</span>
            {budget > 0 && <> · Total <span style={{ color: "#CCAB4A", fontWeight: 700 }}>{fmtINR(budget)}</span></>}
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "18px 20px", flex: 1 }}>

          {/* Split bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {splits.map(({ service, pct, amount, emoji, label }) => (
              <div key={service}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E" }}>{emoji} {label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {budget > 0 && <span style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E" }}>{fmtINR(amount)}</span>}
                    <span style={{ fontSize: 11, color: "#9B7450", background: "rgba(196,122,46,0.1)", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 8, background: "rgba(196,122,46,0.12)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 10, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
              </div>
            ))}

            {remaining > 0 && budget > 0 && (
              <div style={{ fontSize: 11, color: "#9B7450", textAlign: "right", marginTop: 2, fontStyle: "italic" }}>
                {fmtINR(remaining)} kept as buffer / miscellaneous
              </div>
            )}
          </div>

          <p style={{ fontSize: 11, color: "#9B7450", marginTop: 16, marginBottom: 0, borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 12 }}>
            * Split is indicative — actual quotes vary. Use Budget Allocator to fine-tune and track spending.
          </p>
        </div>

        {/* Footer — two buttons */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(196,122,46,0.12)", background: "#fff", display: "flex", gap: 10 }}>
          <button onClick={onBudgetAllocator}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.35)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            📊 Budget Allocator
          </button>
          <button onClick={() => onContinue(services)}
            style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.32)" }}>
            Continue to Booking →
          </button>
        </div>
      </div>
    </div>
  );
}
