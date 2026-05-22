import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";
const STORAGE_KEY = "tendr_onboarding_v1";

// ── Category data ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "Photographer", icon: "📸", label: "Photography", desc: "Candid · Cinematic · Traditional",   color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
  { id: "Decorator",    icon: "🎨", label: "Decoration",  desc: "Balloons · Floral · Themes",         color: "#b45309", bg: "#fff7ed", border: "#fcd34d" },
  { id: "Caterer",      icon: "🍽️", label: "Catering",    desc: "North Indian · South Indian · More", color: "#0369a1", bg: "#eff6ff", border: "#93c5fd" },
  { id: "DJ",           icon: "🎧", label: "DJ & Music",  desc: "Full Production · Lights · Sound",   color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd" },
  { id: "GiftHampers",  icon: "🎁", label: "Gift Hampers",desc: "Dry Fruits · Chocolates · Mixed",     color: "#be185d", bg: "#fdf2f8", border: "#f9a8d4" },
  { id: "Stationery",   icon: "📜", label: "Wedding Stationery", desc: "Invitations · Menu Cards · RSVP", color: "#9B7BAD", bg: "#faf5ff", border: "#d8b4fe" },
  { id: "Invitation",   icon: "💌", label: "Invitation Flyers",  desc: "Digital · Shareable · Printable", color: "#C4748A", bg: "#fdf2f8", border: "#fda4af" },
];

// ── Animated Tendr person ─────────────────────────────────────────────────────
function TendrCharacter() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
      <div style={{ position: "relative", width: 120, height: 140 }}>
        {/* Body */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 54, height: 70, background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: "12px 12px 8px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#CCAB4A", letterSpacing: "0.05em" }}>tendr</span>
        </div>
        {/* Head + bow animation */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", animation: "bow 2.5s ease-in-out infinite", transformOrigin: "bottom center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#FDDCB5,#F5C28A)", border: "3px solid #2C1A0E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 12px rgba(44,26,14,0.2)" }}>
            😊
          </div>
        </div>
        {/* Arms */}
        <div style={{ position: "absolute", bottom: 38, left: 4, width: 22, height: 8, background: "#2C1A0E", borderRadius: 4, transform: "rotate(30deg)", animation: "wave 2.5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: 38, right: 4, width: 22, height: 8, background: "#2C1A0E", borderRadius: 4, transform: "rotate(-30deg)" }} />
        {/* Legs */}
        <div style={{ position: "absolute", bottom: -16, left: "38%", width: 14, height: 20, background: "#2C1A0E", borderRadius: "0 0 6px 6px" }} />
        <div style={{ position: "absolute", bottom: -16, right: "38%", width: 14, height: 20, background: "#2C1A0E", borderRadius: "0 0 6px 6px" }} />
      </div>
      <style>{`
        @keyframes bow {
          0%,100% { transform: translateX(-50%) rotate(0deg); }
          30%,50% { transform: translateX(-50%) rotate(25deg); }
        }
        @keyframes wave {
          0%,100% { transform: rotate(30deg); }
          50% { transform: rotate(60deg); }
        }
      `}</style>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingWelcome({ onComplete }) {
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState("pick"); // "pick" | "done"

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = () => {
    if (selected.length === 0) return;
    // Build checklist items
    const items = selected.map(id => {
      const cat = CATEGORIES.find(c => c.id === id);
      return { id: `ob_${id}_${Date.now()}`, label: `Book your ${cat.label}`, category: id, done: false, icon: cat.icon };
    });
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, completedAt: null }));
    localStorage.setItem("tendr_onboarding_seen", "1");
    onComplete(items);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(28,10,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 16 }}>
      <div style={{ background: "#FFFCF5", borderRadius: 28, maxWidth: 600, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(28,10,0,0.3)", border: "1.5px solid rgba(196,122,46,0.2)", padding: "36px 32px 32px" }}>

        {/* Character + headline */}
        <TendrCharacter />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "0.01em" }}>
            What are you looking to book? 🎉
          </h2>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>
            Tap everything that sparks your interest — we'll build you a personalised checklist!
          </p>
        </div>

        {/* Category grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12, marginBottom: 28 }}>
          {CATEGORIES.map(cat => {
            const isSel = selected.includes(cat.id);
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)}
                style={{
                  padding: "16px 12px", borderRadius: 16, cursor: "pointer", fontFamily: font, textAlign: "center",
                  border: `2px solid ${isSel ? cat.color : cat.border}`,
                  background: isSel ? cat.bg : "#fff",
                  transform: isSel ? "scale(1.04)" : "scale(1)",
                  boxShadow: isSel ? `0 6px 20px ${cat.color}22` : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.18s ease",
                  position: "relative",
                }}>
                {isSel && (
                  <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: cat.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</div>
                )}
                <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: isSel ? cat.color : "#2C1A0E", marginBottom: 3 }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.4 }}>{cat.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Counter + submit */}
        <div style={{ textAlign: "center" }}>
          {selected.length > 0 && (
            <p style={{ fontSize: 13, color: "#C47A2E", fontWeight: 700, marginBottom: 12 }}>
              {selected.length} thing{selected.length > 1 ? "s" : ""} selected — let's build your checklist!
            </p>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={handleSubmit} disabled={selected.length === 0}
              style={{ padding: "13px 36px", borderRadius: 12, border: "none", background: selected.length > 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: selected.length > 0 ? "#fff" : "#9ca3af", fontSize: 15, fontWeight: 800, cursor: selected.length > 0 ? "pointer" : "not-allowed", fontFamily: font, boxShadow: selected.length > 0 ? "0 4px 18px rgba(196,122,46,0.35)" : "none", transition: "all 0.18s" }}>
              Build My Checklist →
            </button>
            <button onClick={() => { localStorage.setItem("tendr_onboarding_seen", "1"); onComplete([]); }}
              style={{ padding: "13px 20px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hook to read/update onboarding checklist ─────────────────────────────────
export function useOnboardingChecklist() {
  const raw = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } })();
  const items = raw.items || [];

  const markDone = (categoryId) => {
    const updated = { ...raw, items: items.map(i => i.category === categoryId ? { ...i, done: true } : i) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { items, markDone, total: items.length, done: items.filter(i => i.done).length };
}
