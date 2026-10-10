import React, { useState, useMemo, useEffect } from "react";
import HamburgerNav from "../../components/HamburgerNav";
import {
  getOccasionNames,
  getServicesForOccasion,
  lineTotal,
  isPerGuest,
  formatINR,
} from "../../utils/priceEstimator";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";

// "Critical"/"High" from the data become the pre-ticked, always-visible "essentials" —
// shown to the customer as "Recommended" rather than raw internal priority labels.
// "Medium"/"Low" are real but non-essential add-ons, tucked behind a "show more" toggle
// per category so the page doesn't dump 15-20 checkboxes on the customer at once.
const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const isEssential = (priority) => priority === "Critical" || priority === "High";

const OCCASIONS = getOccasionNames();

function keyOf(category, idx) {
  return `${category}::${idx}`;
}

export default function PriceEstimator() {
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [guestCount, setGuestCount] = useState(50);
  const [selected, setSelected] = useState({}); // key -> { qty }
  const [expandedCats, setExpandedCats] = useState({}); // category -> bool

  const categories = useMemo(() => getServicesForOccasion(occasion), [occasion]);

  // Pre-tick the recommended (essential) items whenever the occasion changes, and
  // collapse every category's extra options back to start — a fresh, simple state.
  useEffect(() => {
    const next = {};
    for (const [cat, items] of Object.entries(categories)) {
      items.forEach((item, idx) => {
        if (isEssential(item.priority)) next[keyOf(cat, idx)] = { qty: 1 };
      });
    }
    setSelected(next);
    setExpandedCats({});
  }, [occasion]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (cat, idx) => {
    const k = keyOf(cat, idx);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = { qty: 1 };
      return next;
    });
  };

  const setQty = (cat, idx, qty) => {
    const k = keyOf(cat, idx);
    setSelected((prev) => ({ ...prev, [k]: { qty: Math.max(1, qty) } }));
  };

  const { total, lineCount } = useMemo(() => {
    let min = 0, max = 0, count = 0;
    for (const [cat, items] of Object.entries(categories)) {
      items.forEach((item, idx) => {
        const k = keyOf(cat, idx);
        const sel = selected[k];
        if (!sel) return;
        const t = lineTotal(item, { guestCount, qty: sel.qty });
        min += t.min;
        max += t.max;
        count++;
      });
    }
    return { total: { min, max }, lineCount: count };
  }, [categories, selected, guestCount]);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: font, paddingBottom: "calc(140px + env(safe-area-inset-bottom, 0px))" }}>
      <HamburgerNav title="Price Estimator" showBack />

      <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, padding: "clamp(16px,3vw,26px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ color: "#fff", fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, marginBottom: 4 }}>
            What will your event cost?
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, marginBottom: 16 }}>
            Answer 2 quick things below, then tick what you want — your total builds as you go.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                1. What's the occasion?
              </span>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                style={{
                  padding: "11px 14px", borderRadius: 10, border: "none",
                  fontFamily: font, fontSize: 14, fontWeight: 700, color: "#2C1A0E",
                  background: "#fff", cursor: "pointer", width: "100%",
                }}
              >
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                2. How many guests?
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "6px 8px" }}>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                  style={{
                    width: 70, padding: "8px 8px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)",
                    fontFamily: font, fontSize: 14, fontWeight: 700, color: "#2C1A0E", textAlign: "center",
                  }}
                />
                <span style={{ fontSize: 12, color: "#8a6a4a", fontWeight: 600 }}>guests</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px 0" }}>
        {/* How this works — plain-language 3 steps */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", background: "#fff",
          border: "1.5px solid rgba(196,122,46,0.14)", borderRadius: 12, padding: "12px 14px", marginBottom: 14,
        }}>
          {[
            { n: "1", text: "We've already ticked the essentials for this occasion" },
            { n: "2", text: "Tick on or off anything else you want (or don't want)" },
            { n: "3", text: "Your total updates live — scroll down to see it anytime" },
          ].map((s) => (
            <div key={s.n} style={{ flex: "1 1 180px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: GOLD, color: "#fff",
                fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{s.n}</span>
              <span style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.4 }}>{s.text}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.18)",
          borderRadius: 12, padding: "12px 16px", fontSize: 12.5, color: "#5A3520", lineHeight: 1.5,
        }}>
          <strong>This is an estimate, not a final quote.</strong> It's built from typical Delhi NCR prices for each service. Your actual vendor cost can be a bit higher or lower depending on who you book, the season, and your exact requirements — and this doesn't include GST or service charges.
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
        {Object.entries(categories).map(([cat, items]) => {
          const sortedIdx = items
            .map((item, idx) => idx)
            .sort((a, b) => (PRIORITY_RANK[items[a].priority] ?? 9) - (PRIORITY_RANK[items[b].priority] ?? 9));
          const essentialIdx = sortedIdx.filter((idx) => isEssential(items[idx].priority));
          const extraIdx = sortedIdx.filter((idx) => !isEssential(items[idx].priority));
          const visibleEssential = essentialIdx.length > 0 ? essentialIdx : sortedIdx.slice(0, 2);
          const visibleExtra = essentialIdx.length > 0 ? extraIdx : sortedIdx.slice(2);
          const isExpanded = !!expandedCats[cat];

          const renderRow = (idx) => {
            const item = items[idx];
            const k = keyOf(cat, idx);
            const sel = selected[k];
            const checked = !!sel;
            const perGuest = isPerGuest(item.basis);
            const t = lineTotal(item, { guestCount, qty: sel?.qty ?? 1 });
            return (
              <div
                key={k}
                onClick={() => toggle(cat, idx)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  background: "#fff", borderRadius: 12, padding: "12px 14px",
                  border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.14)"}`,
                  cursor: "pointer", transition: "border-color 0.15s",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${checked ? GOLD : "rgba(196,122,46,0.35)"}`,
                  background: checked ? GOLD : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{item.service}</span>
                    {item.spec && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8a6a4a", background: "rgba(196,122,46,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                        {item.spec}
                      </span>
                    )}
                    {isEssential(item.priority) && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#15803d", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                        Recommended
                      </span>
                    )}
                  </div>
                  {item.includes && (
                    <div style={{ fontSize: 12, color: "#8a6a4a", marginTop: 3, lineHeight: 1.4 }}>
                      Includes: {item.includes}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: GOLD }}>
                      {formatINR(item.min)}–{formatINR(item.max)}
                    </span>
                    {perGuest && <span style={{ fontSize: 11, color: "#aaa" }}>per guest</span>}

                    {checked && perGuest && (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>
                        × {guestCount} guests = {formatINR(t.min)}–{formatINR(t.max)}
                      </span>
                    )}

                    {checked && !perGuest && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span style={{ fontSize: 11, color: "#aaa" }}>qty</span>
                        <button onClick={() => setQty(cat, idx, (sel.qty ?? 1) - 1)} style={qtyBtnStyle}>−</button>
                        <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{sel.qty ?? 1}</span>
                        <button onClick={() => setQty(cat, idx, (sel.qty ?? 1) + 1)} style={qtyBtnStyle}>+</button>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>
                          = {formatINR(t.min)}–{formatINR(t.max)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 8, paddingLeft: 2 }}>
                {cat}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleEssential.map(renderRow)}
                {isExpanded && visibleExtra.map(renderRow)}
              </div>
              {visibleExtra.length > 0 && (
                <button
                  onClick={() => setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                  style={{
                    marginTop: 8, background: "none", border: "none", color: GOLD,
                    fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font, padding: "4px 2px",
                  }}
                >
                  {isExpanded ? "– Show fewer options" : `+ Show ${visibleExtra.length} more option${visibleExtra.length === 1 ? "" : "s"}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 500,
        background: "#fff", borderTop: "1.5px solid rgba(196,122,46,0.18)",
        boxShadow: "0 -6px 24px rgba(28,9,0,0.08)",
        padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#8a6a4a", fontWeight: 600 }}>
              {lineCount} thing{lineCount === 1 ? "" : "s"} selected · your estimated total
            </div>
            <div style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, color: "#2C1A0E" }}>
              {formatINR(total.min)} – {formatINR(total.max)}
            </div>
          </div>
          <a
            href="/booking"
            style={{
              padding: "12px 22px", borderRadius: 12, border: "none", textDecoration: "none",
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff",
              fontSize: 14, fontWeight: 800, fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.35)",
            }}
          >
            Book vendors for this →
          </a>
        </div>
      </div>
    </div>
  );
}

const qtyBtnStyle = {
  width: 22, height: 22, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)",
  background: "rgba(196,122,46,0.06)", color: GOLD, fontWeight: 800, fontSize: 13,
  cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1,
};
