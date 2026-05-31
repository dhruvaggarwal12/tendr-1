import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";
const RECENT_KEY = "tendr_recent_searches";
const MAX_RECENT = 5;

const CATEGORIES = [
  { label: "Photographers", emoji: "📸", path: "/top-rated/Photographer" },
  { label: "Catering",      emoji: "🍽",  path: "/top-rated/Caterer" },
  { label: "DJs",           emoji: "🎵",  path: "/top-rated/DJ" },
  { label: "Decoration",    emoji: "🎀",  path: "/top-rated/Decorator" },
  { label: "All Vendors",   emoji: "🔍",  path: "/listings" },
];

const POPULAR_LOCATIONS = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];

const SVC_KW = { caterer:"Caterer", catering:"Caterer", food:"Caterer", decorator:"Decorator", decoration:"Decorator", decor:"Decorator", photographer:"Photographer", photography:"Photographer", photo:"Photographer", dj:"DJ", music:"DJ", entertainment:"DJ" };
const LOC_KW = { delhi:"Delhi", noida:"Noida", gurgaon:"Gurgaon", gurugram:"Gurgaon", ghaziabad:"Ghaziabad", "greater noida":"Greater Noida" };
const PAGE_KW = { budget:"/budget-picker", "gift hamper":"/gift-hampers-cakes", "decor finder":"/decor-finder", checklist:"/checklist-picker", timeline:"/timeline-picker" };

function parseSearch(q) {
  const lower = q.toLowerCase();
  for (const [kw, path] of Object.entries(PAGE_KW)) {
    if (lower.includes(kw)) return { pageHref: path };
  }
  const cats = [...new Set(Object.entries(SVC_KW).filter(([k]) => lower.includes(k)).map(([,v]) => v))];
  const locs = [...new Set(Object.entries(LOC_KW).filter(([k]) => lower.includes(k)).sort((a,b)=>b[0].length-a[0].length).map(([,v]) => v))];
  const budgetM = lower.match(/(?:under|below|₹)\s*(\d[\d,]*)\s*k?/i);
  const budget = budgetM ? parseFloat(budgetM[1].replace(/,/g,"")) * (/k\b/.test(budgetM[0]) ? 1000 : 1) : null;
  const isUnknown = q.trim().length > 2 && cats.length === 0 && locs.length === 0 && !budget;
  return { cats, locs, budget, isUnknown };
}

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecent(text) {
  const list = [text, ...getRecent().filter(t => t !== text)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}
function clearRecent() { localStorage.removeItem(RECENT_KEY); }

export default function SearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQ("");
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const suggestions = q.trim().length > 0
    ? [
        { text: `${q} photographers`, tag: null },
        { text: `${q} caterers`, tag: null },
        { text: `${q} decorators`, tag: null },
        { text: `${q} DJs`, tag: null },
      ].filter(s => s.text.toLowerCase().includes(q.toLowerCase().slice(0,3)))
    : [];

  const doSearch = (text) => {
    if (!text.trim()) return;
    saveRecent(text.trim());
    const { pageHref, cats, locs, budget, isUnknown } = parseSearch(text);
    if (pageHref) { navigate(pageHref); onClose(); return; }
    if (isUnknown) { navigate(`/search?unknown=1&q=${encodeURIComponent(text)}`); onClose(); return; }
    const p = new URLSearchParams();
    if (cats?.length) p.set("categories", cats.join(","));
    if (locs?.length) p.set("locations", locs.join(","));
    if (budget) p.set("budget", budget);
    p.set("q", text);
    navigate(`/search?${p.toString()}`);
    onClose();
  };

  const handleSuggestionClick = (text) => {
    setQ(text);
    doSearch(text);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column" }}
      onClick={onClose}
    >
      {/* Search box */}
      <div
        style={{ background: "#FFFCF5", padding: "12px 16px 0", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "2px solid #C47A2E", borderRadius: 14, padding: "10px 14px", boxShadow: "0 4px 20px rgba(196,122,46,0.2)" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && q.trim()) doSearch(q); if (e.key === "Escape") onClose(); }}
            placeholder="Search vendors, tools, locations..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontFamily: font, color: "#2C1A0E", background: "transparent" }}
          />
          {q ? (
            <button onClick={() => setQ("")} style={{ background: "none", border: "none", color: "#9B7450", fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
          ) : (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font, padding: "2px 8px" }}>Cancel</button>
          )}
        </div>

        {/* Category quick chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0 14px" }}>
          {CATEGORIES.map(c => (
            <button key={c.label}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { navigate(c.path); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: 600, color: "#6B3A1F", flexShrink: 0, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 15 }}>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results body */}
      <div
        style={{ flex: 1, background: "#FFFCF5", overflowY: "auto", padding: "4px 0 40px" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Typed suggestions */}
        {q.trim().length > 0 ? (
          <div>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => doSearch(q)}
              style={{ width: "100%", textAlign: "left", padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(196,122,46,0.07)", fontFamily: font }}>
              <span style={{ fontSize: 18, color: "#C47A2E" }}>🔍</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>{q}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#9B7450" }}>Search →</span>
            </button>
            {suggestions.slice(0, 3).map((s, i) => (
              <button key={i}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSuggestionClick(s.text)}
                style={{ width: "100%", textAlign: "left", padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(196,122,46,0.05)", fontFamily: font }}>
                <span style={{ fontSize: 16, color: "#9B7450" }}>↗</span>
                <span style={{ fontSize: 14, color: "#3B2F2F" }}>{s.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Recent searches */}
            {recent.length > 0 && (
              <div style={{ padding: "16px 20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recent</span>
                  <button onClick={() => { clearRecent(); setRecent([]); }} style={{ background: "none", border: "none", fontSize: 11, color: "#C47A2E", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>Clear</button>
                </div>
                {recent.map((r, i) => (
                  <button key={i}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setQ(r); doSearch(r); }}
                    style={{ width: "100%", textAlign: "left", padding: "10px 0", border: "none", borderBottom: "1px solid rgba(196,122,46,0.06)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontFamily: font }}>
                    <span style={{ fontSize: 16, color: "#C47A2E" }}>🕐</span>
                    <span style={{ fontSize: 14, color: "#2C1A0E" }}>{r}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular locations */}
            <div style={{ padding: "20px 20px 0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Browse by location</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {POPULAR_LOCATIONS.map(loc => (
                  <button key={loc}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { navigate(`/search?locations=${loc}&q=${loc}`); onClose(); }}
                    style={{ padding: "8px 16px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: 600, color: "#6B3A1F" }}>
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
