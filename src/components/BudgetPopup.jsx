import React, { useState, useEffect } from "react";

const font = "'Outfit', sans-serif";

const EVENT_TYPES = {
  birthday:    { label: "Birthday",    icon: "🎂", cats: [{ name: "Venue & Setup", pct: 28, color: "#C47A2E" }, { name: "Food & Catering", pct: 25, color: "#10B981" }, { name: "Decoration", pct: 18, color: "#8B5CF6" }, { name: "Photography", pct: 12, color: "#3B82F6" }, { name: "Entertainment", pct: 10, color: "#F59E0B" }, { name: "Cake & Desserts", pct: 4, color: "#EC4899" }, { name: "Miscellaneous", pct: 3, color: "#6B7280" }] },
  prewedding:  { label: "Pre-Wedding", icon: "💍", cats: [{ name: "Venue & Decor", pct: 35, color: "#C47A2E" }, { name: "Food & Catering", pct: 28, color: "#10B981" }, { name: "Decoration", pct: 15, color: "#8B5CF6" }, { name: "Photography", pct: 10, color: "#3B82F6" }, { name: "DJ & Music", pct: 7, color: "#F59E0B" }, { name: "Miscellaneous", pct: 5, color: "#6B7280" }] },
  wedding:     { label: "Wedding",     icon: "👰", cats: [{ name: "Venue & Setup", pct: 35, color: "#C47A2E" }, { name: "Food & Catering", pct: 25, color: "#10B981" }, { name: "Photography / Video", pct: 15, color: "#3B82F6" }, { name: "Decoration", pct: 12, color: "#8B5CF6" }, { name: "Entertainment", pct: 8, color: "#F59E0B" }, { name: "Miscellaneous", pct: 5, color: "#6B7280" }] },
  anniversary: { label: "Anniversary", icon: "🥂", cats: [{ name: "Venue & Setup", pct: 32, color: "#C47A2E" }, { name: "Food & Catering", pct: 28, color: "#10B981" }, { name: "Decoration", pct: 18, color: "#8B5CF6" }, { name: "Photography", pct: 12, color: "#3B82F6" }, { name: "Gifts & Flowers", pct: 6, color: "#EC4899" }, { name: "Miscellaneous", pct: 4, color: "#6B7280" }] },
  corporate:   { label: "Corporate",   icon: "🏢", cats: [{ name: "Venue & AV Setup", pct: 35, color: "#C47A2E" }, { name: "Food & Catering", pct: 28, color: "#10B981" }, { name: "Marketing & Brand", pct: 12, color: "#3B82F6" }, { name: "Photography", pct: 10, color: "#8B5CF6" }, { name: "Transportation", pct: 8, color: "#F59E0B" }, { name: "Miscellaneous", pct: 7, color: "#6B7280" }] },
  party:       { label: "Party",       icon: "🎉", cats: [{ name: "Venue & Setup", pct: 28, color: "#C47A2E" }, { name: "Food & Drinks", pct: 32, color: "#10B981" }, { name: "Entertainment", pct: 22, color: "#F59E0B" }, { name: "Photography", pct: 10, color: "#3B82F6" }, { name: "Supplies", pct: 5, color: "#8B5CF6" }, { name: "Miscellaneous", pct: 3, color: "#6B7280" }] },
  babyshower:     { label: "Baby Shower",     icon: "🍼", cats: [{ name: "Venue & Setup", pct: 25, color: "#C47A2E" }, { name: "Food & Catering", pct: 28, color: "#10B981" }, { name: "Decoration", pct: 22, color: "#8B5CF6" }, { name: "Activities & Games", pct: 10, color: "#F59E0B" }, { name: "Photography", pct: 10, color: "#3B82F6" }, { name: "Return Gifts", pct: 5, color: "#EC4899" }] },
  houseparty:     { label: "House Party",     icon: "🏠", cats: [{ name: "Food & Drinks", pct: 38, color: "#10B981" }, { name: "Decoration", pct: 20, color: "#8B5CF6" }, { name: "Entertainment", pct: 20, color: "#F59E0B" }, { name: "Photography", pct: 10, color: "#3B82F6" }, { name: "Supplies", pct: 8, color: "#C47A2E" }, { name: "Miscellaneous", pct: 4, color: "#6B7280" }] },
  housewarming:   { label: "Housewarming",   icon: "🏡", cats: [{ name: "Food & Catering", pct: 35, color: "#10B981" }, { name: "Decoration", pct: 25, color: "#8B5CF6" }, { name: "Puja & Ceremony", pct: 15, color: "#C47A2E" }, { name: "Photography", pct: 10, color: "#3B82F6" }, { name: "Return Gifts", pct: 10, color: "#EC4899" }, { name: "Miscellaneous", pct: 5, color: "#6B7280" }] },
  kittyparty:     { label: "Kitty Party",     icon: "🎰", cats: [{ name: "Food & Catering", pct: 35, color: "#10B981" }, { name: "Venue & Setup", pct: 25, color: "#C47A2E" }, { name: "Entertainment & Games", pct: 22, color: "#F59E0B" }, { name: "Decoration", pct: 12, color: "#8B5CF6" }, { name: "Return Gifts", pct: 6, color: "#EC4899" }] },
  namingceremony: { label: "Naming Ceremony", icon: "👶", cats: [{ name: "Food & Catering", pct: 32, color: "#10B981" }, { name: "Puja & Ceremony", pct: 28, color: "#C47A2E" }, { name: "Decoration", pct: 20, color: "#8B5CF6" }, { name: "Photography", pct: 12, color: "#3B82F6" }, { name: "Return Gifts", pct: 8, color: "#EC4899" }] },
};

const formatINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

function initCats(eventKey) {
  return (EVENT_TYPES[eventKey]?.cats || EVENT_TYPES.birthday.cats).map((c, i) => ({
    id: `cat_${i}`,
    name: c.name,
    pct: c.pct,
    color: c.color,
  }));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem("tendr_budget_v2");
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d.__expiresAt && Date.now() > d.__expiresAt) { localStorage.removeItem("tendr_budget_v2"); return null; }
    return d;
  } catch { return null; }
}

export default function BudgetPopup({ onClose }) {
  const [savedMeta] = useState(() => {
    const d = loadFromStorage();
    return { __expiresAt: d?.__expiresAt, guestCount: d?.guestCount };
  });
  const [eventKey, setEventKey] = useState(() => {
    const d = loadFromStorage();
    return d?.eventKey || "birthday";
  });
  const [totalBudget, setTotalBudget] = useState(() => {
    const d = loadFromStorage();
    return d?.totalBudget || 100000;
  });
  const [categories, setCategories] = useState(() => {
    const d = loadFromStorage();
    if (d?.categories?.length > 0) return d.categories;
    return initCats(d?.eventKey || "birthday");
  });
  const [isSaved, setIsSaved] = useState(() => {
    try { return localStorage.getItem("tendr_budget_saved") === "true"; } catch { return false; }
  });

  useEffect(() => {
    try {
      const TTL_7D = 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("tendr_budget_v2", JSON.stringify({
        eventKey,
        totalBudget,
        guestCount: savedMeta.guestCount || 0,
        categories,
        __expiresAt: savedMeta.__expiresAt || Date.now() + TTL_7D,
      }));
    } catch {}
  }, [eventKey, totalBudget, categories]); // eslint-disable-line

  const handleEventType = (key) => {
    setEventKey(key);
    setCategories(initCats(key));
  };

  const updatePct = (id, val) => {
    const pct = Math.max(0, Math.min(100, Number(val) || 0));
    setCategories(prev => prev.map(c => c.id === id ? { ...c, pct } : c));
  };

  const handleSave = () => {
    try { localStorage.setItem("tendr_budget_saved", "true"); } catch {}
    setIsSaved(true);
    window.dispatchEvent(new CustomEvent("tendr:budget-saved"));
  };

  const totalPct = categories.reduce((s, c) => s + c.pct, 0);
  const totalAlloc = categories.reduce((s, c) => s + Math.round(totalBudget * c.pct / 100), 0);
  const remaining = totalBudget - totalAlloc;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 99997, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 99998, width: "min(95vw,500px)", maxHeight: "85dvh", background: "#FFFCF5", borderRadius: 20, display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.28)", fontFamily: font, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", flex: 1 }}>💰 Budget Allocator</span>
            <button onClick={handleSave}
              style={{ padding: "4px 10px", borderRadius: 7, border: isSaved ? "1.5px solid #22c55e" : "1.5px solid rgba(196,122,46,0.3)", background: isSaved ? "rgba(34,197,94,0.08)" : "#fff", color: isSaved ? "#15803d" : "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {isSaved ? "✓ Saved" : "Save"}
            </button>
            <button onClick={onClose}
              style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(44,26,14,0.15)", background: "transparent", color: "#9B7450", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, flexShrink: 0 }}>
              ×
            </button>
          </div>

          {/* Event type pills */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {Object.entries(EVENT_TYPES).map(([key, et]) => (
              <button key={key} onClick={() => handleEventType(key)}
                style={{ padding: "3px 9px", borderRadius: 20, border: `1.5px solid ${eventKey === key ? "#C47A2E" : "rgba(196,122,46,0.18)"}`, background: eventKey === key ? "rgba(196,122,46,0.1)" : "#fff", color: eventKey === key ? "#C47A2E" : "#9B7450", fontSize: 11, fontWeight: eventKey === key ? 700 : 500, cursor: "pointer", fontFamily: font, WebkitTapHighlightColor: "transparent" }}>
                {et.icon} {et.label}
              </button>
            ))}
          </div>

          {/* Budget input + summary */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 9, padding: "5px 11px", flex: 1, minWidth: 120 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", flexShrink: 0 }}>Budget ₹</span>
              <input type="number" value={totalBudget} min="1000" step="5000"
                onChange={e => setTotalBudget(Math.max(1000, Number(e.target.value) || 1000))}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontWeight: 700, fontFamily: font, color: "#2C1A0E", width: 80 }} />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#2C1A0E", background: "rgba(196,122,46,0.07)", borderRadius: 7, padding: "5px 7px", whiteSpace: "nowrap" }}>{formatINR(totalAlloc)} alloc</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: remaining >= 0 ? "#15803d" : "#c0392b", background: remaining >= 0 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", borderRadius: 7, padding: "5px 7px", whiteSpace: "nowrap" }}>{formatINR(remaining)} left</span>
            </div>
          </div>
          {totalPct > 100 && (
            <div style={{ fontSize: 10, color: "#c0392b", fontWeight: 700, marginTop: 4 }}>
              ⚠️ Total {totalPct}% — allocations exceed 100%
            </div>
          )}
        </div>

        {/* Category sliders */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
          {categories.map(c => {
            const allocated = Math.round(totalBudget * c.pct / 100);
            return (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: c.color, flexShrink: 0 }}>{c.pct}%</span>
                  <span style={{ fontSize: 11, color: "#9B7450", flexShrink: 0 }}>{formatINR(allocated)}</span>
                </div>
                <input type="range" min="0" max="60" step="1" value={c.pct}
                  onChange={e => updatePct(c.id, e.target.value)}
                  style={{ width: "100%", accentColor: c.color, cursor: "pointer" }} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
