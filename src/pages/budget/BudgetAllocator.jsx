import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const EVENT_TYPES = {
  birthday: {
    label: "Birthday Party", icon: "🎂",
    cats: [
      { name: "Venue & Setup",    pct: 28, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 25, color: "#10B981" },
      { name: "Decoration",       pct: 18, color: "#8B5CF6" },
      { name: "Photography",      pct: 12, color: "#3B82F6" },
      { name: "Entertainment",    pct: 10, color: "#F59E0B" },
      { name: "Cake & Desserts",  pct: 4,  color: "#EC4899" },
      { name: "Miscellaneous",    pct: 3,  color: "#6B7280" },
    ],
  },
  prewedding: {
    label: "Pre-Wedding Function", icon: "💍",
    cats: [
      { name: "Venue & Decor",    pct: 35, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 28, color: "#10B981" },
      { name: "Decoration",       pct: 15, color: "#8B5CF6" },
      { name: "Photography",      pct: 10, color: "#3B82F6" },
      { name: "DJ & Music",       pct: 7,  color: "#F59E0B" },
      { name: "Miscellaneous",    pct: 5,  color: "#6B7280" },
    ],
  },
  wedding: {
    label: "Wedding Day", icon: "👰",
    cats: [
      { name: "Venue & Mandap",   pct: 35, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 25, color: "#10B981" },
      { name: "Photography / Video", pct: 15, color: "#3B82F6" },
      { name: "Decoration",       pct: 12, color: "#8B5CF6" },
      { name: "Entertainment",    pct: 8,  color: "#F59E0B" },
      { name: "Miscellaneous",    pct: 5,  color: "#6B7280" },
    ],
  },
  anniversary: {
    label: "Anniversary", icon: "🥂",
    cats: [
      { name: "Venue & Setup",    pct: 32, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 28, color: "#10B981" },
      { name: "Decoration",       pct: 18, color: "#8B5CF6" },
      { name: "Photography",      pct: 12, color: "#3B82F6" },
      { name: "Gifts & Flowers",  pct: 6,  color: "#EC4899" },
      { name: "Miscellaneous",    pct: 4,  color: "#6B7280" },
    ],
  },
  corporate: {
    label: "Corporate Event", icon: "🏢",
    cats: [
      { name: "Venue & AV Setup", pct: 35, color: "#C47A2E" },
      { name: "Food & Catering",  pct: 28, color: "#10B981" },
      { name: "Marketing & Brand",pct: 12, color: "#3B82F6" },
      { name: "Photography",      pct: 10, color: "#8B5CF6" },
      { name: "Transportation",   pct: 8,  color: "#F59E0B" },
      { name: "Miscellaneous",    pct: 7,  color: "#6B7280" },
    ],
  },
  party: {
    label: "Get-together / Party", icon: "🎉",
    cats: [
      { name: "Venue & Setup",    pct: 28, color: "#C47A2E" },
      { name: "Food & Drinks",    pct: 32, color: "#10B981" },
      { name: "Entertainment",    pct: 22, color: "#F59E0B" },
      { name: "Photography",      pct: 10, color: "#3B82F6" },
      { name: "Supplies",         pct: 5,  color: "#8B5CF6" },
      { name: "Miscellaneous",    pct: 3,  color: "#6B7280" },
    ],
  },
};

const initCategories = (eventKey, totalBudget) =>
  EVENT_TYPES[eventKey].cats.map((c, i) => ({
    id: `cat_${i}_${Date.now()}`,
    name: c.name,
    pct: c.pct,
    color: c.color,
    spent: 0,
  }));

const formatINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// Build CSS conic-gradient pie chart from categories + total %
const buildPie = (categories) => {
  const total = categories.reduce((s, c) => s + c.pct, 0) || 100;
  let angle = 0;
  const segs = categories.map(c => {
    const deg = (c.pct / total) * 360;
    const seg = `${c.color} ${angle}deg ${angle + deg}deg`;
    angle += deg;
    return seg;
  });
  return `conic-gradient(${segs.join(", ")})`;
};

// Traffic light colour for a category based on spent vs allocated
function trafficLight(spent, allocated) {
  if (!allocated || spent === 0) return null;
  const ratio = spent / allocated;
  if (ratio > 1)    return { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  label: "Over budget",  dot: "#ef4444" };
  if (ratio >= 0.8) return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "Nearly full",  dot: "#f59e0b" };
  return              { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  label: "On track",    dot: "#22c55e" };
}

// Map vendor serviceType → budget category name for auto-sync
const VENDOR_TO_BUDGET = {
  Caterer:      "Food & Catering",
  Decorator:    "Decoration",
  Photographer: "Photography",
  DJ:           "DJ & Music",
};

export default function BudgetAllocator() {
  const location = useLocation();
  const routeEventType = location.state?.eventType;
  const finalisedVendors = useSelector(s => s.listingFilters?.finalisedVendors || {});
  const conversations = useSelector(s => s.chat?.conversations || []);

  const [eventKey, setEventKey] = useState("birthday");
  const [totalBudget, setTotalBudget] = useState(50000);
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tendr_budget_v2");
      if (raw && !routeEventType) {
        const d = JSON.parse(raw);
        setEventKey(d.eventKey || "birthday");
        setTotalBudget(d.totalBudget || 50000);
        setCategories(d.categories || initCategories(d.eventKey || "birthday", d.totalBudget || 50000));
      } else {
        const key = routeEventType && EVENT_TYPES[routeEventType] ? routeEventType : "birthday";
        setEventKey(key);
        setCategories(initCategories(key, 50000));
      }
    } catch { setCategories(initCategories("birthday", 50000)); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tendr_budget_v2", JSON.stringify({ eventKey, totalBudget, categories }));
  }, [eventKey, totalBudget, categories, loaded]);

  const applyEventType = (key) => {
    setEventKey(key);
    setCategories(initCategories(key, totalBudget));
  };

  const updatePct = (id, val) => {
    const pct = Math.max(0, Math.min(100, Number(val) || 0));
    setCategories(prev => prev.map(c => c.id === id ? { ...c, pct } : c));
  };

  const updateSpent = (id, val) => {
    const spent = Math.max(0, Number(val) || 0);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, spent } : c));
  };

  const updateName = (id, name) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));

  const addCategory = () =>
    setCategories(prev => [...prev, {
      id: `cat_${Date.now()}`, name: "New Category", pct: 5, color: "#6B7280", spent: 0,
    }]);

  const deleteCategory = (id) =>
    setCategories(prev => prev.filter(c => c.id !== id));

  // Sync actual spent from finalised vendor prices in Redux
  const syncFromVendors = () => {
    let synced = 0;
    const updates = {};

    Object.entries(finalisedVendors).forEach(([serviceType, vendorOrArr]) => {
      const vendors = Array.isArray(vendorOrArr) ? vendorOrArr : [vendorOrArr];
      const budgetCat = VENDOR_TO_BUDGET[serviceType];
      if (!budgetCat) return;
      vendors.forEach(v => {
        if (!v) return;
        // Try to find price from conversations via vendorId
        const price = v.confirmedPrice || v.price || v.startingPrice || null;
        if (price) {
          updates[budgetCat] = (updates[budgetCat] || 0) + Number(price);
          synced++;
        }
      });
    });

    if (Object.keys(updates).length === 0) {
      setSyncMsg("No vendor prices found. Finalise a chat with a price first.");
      setTimeout(() => setSyncMsg(""), 3000);
      return;
    }

    setCategories(prev => prev.map(c => {
      const match = Object.entries(updates).find(([name]) =>
        c.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(c.name.toLowerCase())
      );
      return match ? { ...c, spent: match[1] } : c;
    }));

    setSyncMsg(`Synced prices for ${synced} vendor${synced !== 1 ? "s" : ""}`);
    setTimeout(() => setSyncMsg(""), 3000);
  };

  const totalPct   = categories.reduce((s, c) => s + c.pct, 0);
  const totalAlloc = categories.reduce((s, c) => s + Math.round(totalBudget * c.pct / 100), 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const remaining  = totalBudget - totalSpent;

  const summaryCards = [
    { label: "Total Budget",   value: formatINR(totalBudget),  color: "#2C1A0E", bg: "rgba(196,122,46,0.07)" },
    { label: "Total Allocated",value: formatINR(totalAlloc),   color: "#0369a1", bg: "rgba(59,130,246,0.07)" },
    { label: "Total Spent",    value: formatINR(totalSpent),   color: "#c0392b", bg: "rgba(239,68,68,0.07)"  },
    { label: "Remaining",      value: formatINR(remaining),    color: remaining >= 0 ? "#15803d" : "#c0392b", bg: remaining >= 0 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, paddingBottom: 60 }}>
      <SEO
        title="Event Budget Allocator — Smart Spending Split for Your Event"
        description="See the ideal budget split for your birthday, anniversary, corporate event or party across decoration, catering, photography and entertainment. Free budget planning tool by Tendr for Delhi NCR celebrations."
        path="/budget-allocator"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Budget Planner", path: "/budget-picker" }, { name: "Budget Allocator", path: "/budget-allocator" }]}
      />
      <BasicSpeedDial />
      <HamburgerNav title="Budget Allocator" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "28px 40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Planning Tool</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Budget Allocator</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>Plan spend · track actuals · stay on budget</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <button
              onClick={syncFromVendors}
              style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, backdropFilter: "blur(4px)" }}
            >
              ⚡ Sync from Vendors
            </button>
            {syncMsg && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{syncMsg}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* Event type + budget input */}
        <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Event type</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(EVENT_TYPES).map(([key, et]) => (
                  <button key={key} onClick={() => applyEventType(key)}
                    style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: font, cursor: "pointer", border: "1.5px solid", transition: "all 0.15s",
                      borderColor: eventKey === key ? "#C47A2E" : "rgba(196,122,46,0.2)",
                      background: eventKey === key ? "#C47A2E" : "#fff",
                      color: eventKey === key ? "#fff" : "#6B3A1F",
                    }}>
                    {et.icon} {et.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Total Budget</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#9B7450" }}>₹</span>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={e => setTotalBudget(Math.max(1000, Number(e.target.value) || 1000))}
                  style={{ width: 120, border: "none", outline: "none", fontSize: 16, fontWeight: 700, fontFamily: font, color: "#2C1A0E" }}
                  min="1000" step="5000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {summaryCards.map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: "16px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Main layout: pie chart + categories */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Pie chart */}
          <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "24px", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", minWidth: 240, flex: "0 0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 16 }}>Allocation</div>
            <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 20px" }}>
              <div style={{ width: 180, height: 180, borderRadius: "50%", background: buildPie(categories), boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <div style={{ position: "absolute", inset: 30, borderRadius: "50%", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>Total %</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: totalPct > 100 ? "#c0392b" : "#2C1A0E" }}>{totalPct}%</div>
                {totalPct > 100 && <div style={{ fontSize: 9, color: "#c0392b", fontWeight: 700 }}>Over!</div>}
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#5a3a1a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category rows */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "grid", gridTemplateColumns: "1fr 70px 100px 120px 32px", gap: 8, fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span>Category</span>
                <span>%</span>
                <span>Allocated</span>
                <span>Spent</span>
                <span />
              </div>
              {categories.map(c => {
                const allocated  = Math.round(totalBudget * c.pct / 100);
                const spentPct   = allocated > 0 ? Math.min(100, (c.spent / allocated) * 100) : 0;
                const tl         = trafficLight(c.spent, allocated);
                return (
                  <div key={c.id} style={{ borderBottom: "1px solid rgba(196,122,46,0.06)", padding: "12px 20px", background: tl ? tl.bg : "transparent", transition: "background 0.2s" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 100px 120px 28px", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      {/* Name + traffic light dot */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                        <input
                          value={c.name}
                          onChange={e => updateName(c.id, e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#2C1A0E", fontFamily: font, background: "transparent", width: "100%", minWidth: 0 }}
                        />
                        {tl && (
                          <span title={tl.label} style={{ width: 9, height: 9, borderRadius: "50%", background: tl.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${tl.dot}33` }} />
                        )}
                      </div>
                      <input
                        type="number" min="0" max="100" value={c.pct}
                        onChange={e => updatePct(c.id, e.target.value)}
                        style={{ border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 7, padding: "4px 8px", fontSize: 13, fontWeight: 700, fontFamily: font, color: "#2C1A0E", outline: "none", width: "100%", textAlign: "center" }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{formatINR(allocated)}</span>
                      <input
                        type="number" min="0" value={c.spent}
                        onChange={e => updateSpent(c.id, e.target.value)}
                        placeholder="0"
                        style={{ border: `1.5px solid ${tl?.color ? tl.color + "66" : "rgba(196,122,46,0.2)"}`, borderRadius: 7, padding: "4px 8px", fontSize: 13, fontFamily: font, color: tl ? tl.color : "#2C1A0E", outline: "none", width: "100%", background: tl ? tl.bg : "#fff", fontWeight: tl ? 700 : 400 }}
                      />
                      <button onClick={() => deleteCategory(c.id)}
                        style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                    </div>
                    {/* Progress bar + status label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${spentPct}%`, background: tl ? tl.dot : c.color, borderRadius: 100, transition: "width 0.3s" }} />
                      </div>
                      {tl ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: tl.color, whiteSpace: "nowrap" }}>{tl.label}</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#9B7450", whiteSpace: "nowrap" }}>No spend logged</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <button onClick={addCategory}
                style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 20px 14px", padding: "7px 14px", borderRadius: 8, border: "1.5px dashed rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                + Add category
              </button>
            </div>

            <button onClick={() => applyEventType(eventKey)}
              style={{ marginTop: 12, padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
