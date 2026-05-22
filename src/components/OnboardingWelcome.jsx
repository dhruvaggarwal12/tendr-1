import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mascotImg from "../assets/ui/tendr-mascot.png";

const font = "'Outfit', sans-serif";
const STORAGE_KEY = "tendr_onboarding_v1";

// ── Categories grouped by section ────────────────────────────────────────────
const SECTIONS = [
  {
    label: "Vendor Services",
    items: [
      { id: "Photographer", icon: "📸", label: "Photography",  color: "#15803d" },
      { id: "Decorator",    icon: "🎨", label: "Decoration",   color: "#b45309" },
      { id: "Caterer",      icon: "🍽️", label: "Catering",     color: "#0369a1" },
      { id: "DJ",           icon: "🎧", label: "DJ & Music",   color: "#7c3aed" },
    ],
  },
  {
    label: "Memories",
    items: [
      { id: "Stationery",  icon: "📜", label: "Wedding Stationery", color: "#9B7BAD" },
      { id: "Invitation",  icon: "💌", label: "Invitation Flyers",  color: "#C4748A" },
    ],
  },
  {
    label: "Gifting",
    items: [
      { id: "GiftHampers", icon: "🎁", label: "Gift Hampers", color: "#be185d" },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);

// ── Smart route based on selection ───────────────────────────────────────────
function getSmartRoute(selected) {
  if (selected.length === 0) return null;

  const onlyGift = selected.every(id => id === "GiftHampers");
  if (onlyGift) return "/gift-hampers-cakes";

  const onlyMemories = selected.every(id => id === "Stationery" || id === "Invitation");
  if (onlyMemories) {
    if (selected.length === 1) return selected[0] === "Stationery" ? "/stationery" : "/invitation";
    return "/stationery"; // both memories → go to stationery (main one)
  }

  // Has vendor categories → start planning flow
  return "/booking";
}

// ── Mini chip item ────────────────────────────────────────────────────────────
function CategoryChip({ item, selected, onToggle }) {
  const isSel = selected.includes(item.id);
  return (
    <button onClick={() => onToggle(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderRadius: 100, cursor: "pointer",
        border: `1.5px solid ${isSel ? item.color : "rgba(0,0,0,0.1)"}`,
        background: isSel ? `${item.color}14` : "#fff",
        fontFamily: font, fontSize: 12.5, fontWeight: isSel ? 700 : 500,
        color: isSel ? item.color : "#5a3a1a",
        transition: "all 0.15s",
        boxShadow: isSel ? `0 2px 8px ${item.color}22` : "none",
      }}
    >
      <span style={{ fontSize: 14 }}>{item.icon}</span>
      {item.label}
      {isSel && <span style={{ fontSize: 10, fontWeight: 900 }}>✓</span>}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingWelcome({ onClose }) {
  const navigate   = useNavigate();
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleSubmit = () => {
    if (selected.length === 0) return;

    // Build checklist and save
    const items = selected.map(id => {
      const cat = ALL_ITEMS.find(c => c.id === id);
      return { id: `ob_${id}`, label: `Book your ${cat.label}`, category: id, done: false, icon: cat.icon };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));

    const route = getSmartRoute(selected);
    onClose();
    navigate(route);
  };

  const hasVendorCategories = selected.some(id => ["Photographer","Decorator","Caterer","DJ"].includes(id));
  const submitLabel = (() => {
    if (selected.length === 0) return "Select something first";
    const route = getSmartRoute(selected);
    if (route === "/gift-hampers-cakes") return "Browse Gift Hampers →";
    if (route === "/stationery") return "Open Stationery Studio →";
    if (route === "/invitation") return "Open Invitation Flyers →";
    return "Start Planning →";
  })();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(28,10,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, width: "min(94vw, 480px)", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(28,10,0,0.25)", border: "1.5px solid rgba(196,122,46,0.18)", position: "relative" }}>

        {/* Close button */}
        <button onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>

        {/* Mascot + headline */}
        <div style={{ textAlign: "center", padding: "28px 28px 0" }}>
          <img
            src={mascotImg}
            alt="Tendr"
            style={{ width: 110, height: 110, objectFit: "contain", marginBottom: 8 }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.65rem", fontWeight: 400, color: "#2C1A0E", margin: "0 0 4px" }}>
            What are you planning? 🎉
          </h2>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px" }}>
            Pick everything you need — we'll set up your checklist.
          </p>
        </div>

        {/* Categorised sections */}
        <div style={{ padding: "0 24px 20px" }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                {section.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {section.items.map(item => (
                  <CategoryChip key={item.id} item={item} selected={selected} onToggle={toggle} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ padding: "0 24px 24px" }}>
          <button onClick={handleSubmit} disabled={selected.length === 0}
            style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: selected.length > 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: selected.length > 0 ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: selected.length > 0 ? "pointer" : "not-allowed", fontFamily: font, boxShadow: selected.length > 0 ? "0 4px 16px rgba(196,122,46,0.3)" : "none", transition: "all 0.18s" }}>
            {submitLabel}
          </button>
          {selected.length > 0 && (
            <p style={{ textAlign: "center", fontSize: 11, color: "#9B7450", margin: "8px 0 0" }}>
              {selected.length} item{selected.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hook to read onboarding checklist ────────────────────────────────────────
export function useOnboardingChecklist() {
  const raw   = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } })();
  const items = raw.items || [];
  const markDone = (categoryId) => {
    const updated = { ...raw, items: items.map(i => i.category === categoryId ? { ...i, done: true } : i) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };
  return { items, markDone, total: items.length, done: items.filter(i => i.done).length };
}
