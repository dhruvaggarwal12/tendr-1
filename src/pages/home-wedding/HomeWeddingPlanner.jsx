import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font  = "'Outfit', sans-serif";
const GOLD  = "#C47A2E";
const BROWN = "#2C1A0E";

const CEREMONIES = [
  { key: "haldi",      label: "Haldi",           emoji: "💛" },
  { key: "mehendi",    label: "Mehendi",          emoji: "🌿" },
  { key: "sangeet",    label: "Sangeet / Dance",  emoji: "🎶" },
  { key: "wedding",    label: "Wedding Ceremony", emoji: "💍" },
  { key: "reception",  label: "Reception",        emoji: "🥂" },
  { key: "tilak",      label: "Tilak / Sagan",    emoji: "🪔" },
  { key: "engagement", label: "Engagement",       emoji: "💫" },
  { key: "pooja",      label: "Pooja / Havan",    emoji: "🙏" },
  { key: "dinner",     label: "Family Dinner",    emoji: "🍽️" },
  { key: "custom",     label: "Something Else",   emoji: "✏️" },
];

const MEALS = [
  { key: "breakfast", label: "Breakfast",      emoji: "🌅", time: "Morning"   },
  { key: "lunch",     label: "Lunch",          emoji: "☀️", time: "Afternoon" },
  { key: "snacks",    label: "Evening Snacks", emoji: "☕", time: "Evening"   },
  { key: "dinner",    label: "Dinner",         emoji: "🌙", time: "Night"     },
];

const FOOD_TYPES = [
  { key: "veg",    label: "Pure Veg",       color: "#16a34a", bg: "rgba(22,163,74,0.08)"  },
  { key: "nonveg", label: "Non-Veg",        color: "#DC2626", bg: "rgba(220,38,38,0.06)"  },
  { key: "both",   label: "Veg + Non-Veg",  color: GOLD,      bg: "rgba(196,122,46,0.08)" },
];

const VENDORS = [
  { id: "caterer",      label: "Caterer",        emoji: "🍽️" },
  { id: "decorator",    label: "Decorator",      emoji: "🌸" },
  { id: "photographer", label: "Photographer",   emoji: "📸" },
  { id: "dj",           label: "DJ / Sound",     emoji: "🎵" },
  { id: "mehendi",      label: "Mehendi Artist", emoji: "🌿" },
  { id: "makeup",       label: "Makeup Artist",  emoji: "💄" },
  { id: "pandit",       label: "Pandit",         emoji: "🪔" },
  { id: "tent",         label: "Tent & Lights",  emoji: "✨" },
];

function blankDay() {
  return {
    ceremonies:    [],
    customCeremony: "",
    guests:        "",
    vendors:       [],
    meals:         [],
    mealFoodType:  {},
    decoration:    null, // null | true | false
    notes:         "",
  };
}

function fmtDate(startDate, i) {
  if (!startDate) return "";
  const d = new Date(startDate + "T00:00:00");
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

const goTop = () => window.scrollTo({ top: 0, behavior: "instant" });
const today = new Date().toISOString().split("T")[0];

const card = { background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 3px 16px rgba(139,69,19,0.06)" };
const labelSm = { fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em" };

export default function HomeWeddingPlanner() {
  const navigate = useNavigate();

  const [step,      setStep]     = useState(0);
  const [numDays,   setNumDays]  = useState(3);
  const [startDate, setStartDate] = useState("");
  const [couple1,   setCouple1]  = useState("");
  const [couple2,   setCouple2]  = useState("");
  const [days,      setDays]     = useState(() => Array.from({ length: 4 }, blankDay));

  const dayIdx = step - 1;
  const plan   = days[dayIdx] || blankDay();

  const updateDay = (field, value) =>
    setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, [field]: value } : d));

  const toggleCeremony = (key) => {
    const cur  = plan.ceremonies;
    const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
    updateDay("ceremonies", next);
  };

  const toggleMeal = (key) => {
    const cur  = plan.meals;
    const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
    updateDay("meals", next);
    if (!next.includes(key)) {
      const ft = { ...plan.mealFoodType };
      delete ft[key];
      updateDay("mealFoodType", ft);
    }
  };

  const setMealFood = (mealKey, foodKey) => {
    updateDay("mealFoodType", { ...plan.mealFoodType, [mealKey]: foodKey });
  };

  const toggleVendor = (vid) => {
    const cur  = plan.vendors;
    const next = cur.includes(vid) ? cur.filter(v => v !== vid) : [...cur, vid];
    updateDay("vendors", next);
  };

  const advance = (n = 1) => { goTop(); setStep(s => s + n); };
  const canNextDay = plan.ceremonies.length > 0;

  // ── helpers for summary ────────────────────────────────────────────────────
  const cerLabel = (key) => key === "custom" ? "" : (CEREMONIES.find(c => c.key === key)?.label || key);
  const dayCeremonies = (d) => d.ceremonies.map(k => {
    if (k === "custom") return d.customCeremony || "Custom";
    return cerLabel(k);
  }).filter(Boolean);

  // ── Step 0 ─────────────────────────────────────────────────────────────────
  if (step === 0) {
    const ready = !!startDate;
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8EE", fontFamily: font }}>
        <SEO title="Multi-Day Home Wedding Planner" description="Plan your home wedding rituals day by day." path="/home-wedding-planner" />
        <HamburgerNav />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 100px" }}>

          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🏠</div>
            <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", fontWeight: 900, color: BROWN, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Home Wedding Planner
            </h1>
            <p style={{ color: "#9B7450", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
              Plan every ritual — Haldi to Reception — day by day, step by step.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Couple names */}
            <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["Person 1 (optional)", couple1, setCouple1, "e.g. Priya"],
                ["Person 2 (optional)", couple2, setCouple2, "e.g. Rahul"]].map(([lbl, val, set, ph]) => (
                <div key={lbl}>
                  <label style={{ ...labelSm, display: "block", marginBottom: 7 }}>{lbl}</label>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            {/* Start date */}
            <div style={card}>
              <label style={{ ...labelSm, display: "block", marginBottom: 7 }}>When do the events start? *</label>
              <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)}
                style={{ padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>

            {/* Number of days */}
            <div style={card}>
              <label style={{ ...labelSm, display: "block", marginBottom: 10 }}>How many days are the events spread across? *</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[2, 3, 4].map(n => (
                  <button key={n} type="button" onClick={() => setNumDays(n)} style={{
                    flex: 1, padding: "12px 0", borderRadius: 12,
                    border: `2px solid ${numDays === n ? GOLD : "rgba(196,122,46,0.2)"}`,
                    background: numDays === n ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#fff",
                    color: numDays === n ? "#fff" : BROWN, fontWeight: 700, fontFamily: font, fontSize: 15, cursor: "pointer",
                  }}>{n} days</button>
                ))}
              </div>
            </div>

            <button
              disabled={!ready}
              onClick={() => advance()}
              style={{
                padding: "15px", borderRadius: 12, border: "none", width: "100%",
                background: ready ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "rgba(44,26,14,0.1)",
                color: ready ? "#fff" : "#9B7450", fontWeight: 800, fontFamily: font, fontSize: 15,
                cursor: ready ? "pointer" : "not-allowed",
                boxShadow: ready ? "0 4px 14px rgba(196,122,46,0.3)" : "none",
              }}>
              Let's Plan Day 1 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1..numDays ────────────────────────────────────────────────────────
  if (step <= numDays) {
    const dateStr     = fmtDate(startDate, dayIdx);
    const hasCaterer  = plan.vendors.includes("caterer");

    return (
      <div style={{ minHeight: "100vh", background: "#FFF8EE", fontFamily: font }}>
        <HamburgerNav />
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 20px 100px" }}>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <button onClick={() => { goTop(); setStep(step - 1); }}
              style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: font, marginBottom: 14, display: "block" }}>
              ← {step === 1 ? "Basic Info" : `Day ${dayIdx}`}
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: numDays }).map((_, i) => (
                <div key={i} style={{ height: 5, flex: 1, borderRadius: 100, background: i < dayIdx ? `linear-gradient(90deg,${GOLD},#CCAB4A)` : i === dayIdx ? GOLD : "rgba(44,26,14,0.12)", transition: "background 0.3s" }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#9B7450", marginTop: 8, fontWeight: 600 }}>Day {step} of {numDays}</div>
          </div>

          {/* Day header */}
          <div style={{ marginBottom: 24 }}>
            {dateStr && <div style={{ fontSize: 13, color: "#9B7450", fontWeight: 600, marginBottom: 4 }}>{dateStr}</div>}
            <h2 style={{ fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 900, color: BROWN, margin: 0, letterSpacing: "-0.02em" }}>
              What's planned for Day {step}?
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* 1. Ceremonies — MULTI SELECT */}
            <div style={card}>
              <div style={{ ...labelSm, marginBottom: 6 }}>Which functions are happening? *</div>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>
                You can select multiple — Haldi + Mehendi can both be on Day 1.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
                {CEREMONIES.map(c => {
                  const sel = plan.ceremonies.includes(c.key);
                  return (
                    <button key={c.key} type="button" onClick={() => toggleCeremony(c.key)} style={{
                      padding: "10px 8px", borderRadius: 12, cursor: "pointer", textAlign: "center", lineHeight: 1.3, fontFamily: font, fontSize: 13,
                      border: `2px solid ${sel ? GOLD : "rgba(196,122,46,0.18)"}`,
                      background: sel ? "rgba(196,122,46,0.1)" : "#fff",
                      color: sel ? GOLD : BROWN, fontWeight: sel ? 800 : 500,
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
                      {c.label}
                      {sel && <div style={{ fontSize: 10, marginTop: 3, color: GOLD, fontWeight: 800 }}>✓ Added</div>}
                    </button>
                  );
                })}
              </div>
              {plan.ceremonies.includes("custom") && (
                <input value={plan.customCeremony} onChange={e => updateDay("customCeremony", e.target.value)}
                  placeholder="Name the custom function…"
                  style={{ marginTop: 12, width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", boxSizing: "border-box" }} />
              )}
              {plan.ceremonies.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {plan.ceremonies.map(k => {
                    const info = CEREMONIES.find(c => c.key === k);
                    return <span key={k} style={{ fontSize: 12, background: "rgba(196,122,46,0.1)", color: GOLD, borderRadius: 20, padding: "3px 10px", fontWeight: 700 }}>{info?.emoji} {k === "custom" ? (plan.customCeremony || "Custom") : info?.label}</span>;
                  })}
                </div>
              )}
            </div>

            {/* 2. Guests */}
            <div style={card}>
              <div style={{ ...labelSm, marginBottom: 6 }}>How many guests?</div>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 12px" }}>Approximate count — helps vendors give accurate quotes.</p>
              <input type="number" min="1" value={plan.guests} onChange={e => updateDay("guests", e.target.value)}
                placeholder="e.g. 80"
                style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 18, fontWeight: 700, color: BROWN, outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* 3. Services */}
            <div style={card}>
              <div style={{ ...labelSm, marginBottom: 6 }}>Which services do you need?</div>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>
                Select all vendors needed for this day. Selecting Caterer will let you plan meals next.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {VENDORS.map(v => {
                  const sel = plan.vendors.includes(v.id);
                  return (
                    <button key={v.id} type="button" onClick={() => toggleVendor(v.id)} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12,
                      border: `2px solid ${sel ? "#22c55e" : "rgba(196,122,46,0.18)"}`,
                      background: sel ? "rgba(34,197,94,0.07)" : "#fff",
                      color: sel ? "#16a34a" : BROWN, fontWeight: sel ? 700 : 500, fontFamily: font, fontSize: 14,
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{v.emoji}</span>
                      <span style={{ flex: 1 }}>{v.label}</span>
                      {sel && <span style={{ fontSize: 13, fontWeight: 900 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Meals — only shown when Caterer is selected */}
            {hasCaterer && (
              <div style={{ ...card, border: `2px solid ${GOLD}`, animation: "fadeIn 0.25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>🍽️</span>
                  <div style={{ ...labelSm }}>Meals for this day</div>
                </div>
                <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>
                  Select all meals being served — including snacks between main meals.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {MEALS.map(m => {
                    const sel = plan.meals.includes(m.key);
                    const ft  = plan.mealFoodType[m.key];
                    return (
                      <div key={m.key} style={{ borderRadius: 12, border: `2px solid ${sel ? GOLD : "rgba(196,122,46,0.15)"}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                        <button type="button" onClick={() => toggleMeal(m.key)} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                          background: sel ? "rgba(196,122,46,0.05)" : "#fff", border: "none", cursor: "pointer", fontFamily: font,
                        }}>
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{m.emoji}</span>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: BROWN }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: "#9B7450" }}>{m.time}</div>
                          </div>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? GOLD : "rgba(44,26,14,0.2)"}`,
                            background: sel ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            {sel && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                          </div>
                        </button>
                        {sel && (
                          <div style={{ padding: "10px 14px 12px", background: "rgba(196,122,46,0.04)", borderTop: "1px solid rgba(196,122,46,0.12)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", marginBottom: 8 }}>Food type for {m.label}</div>
                            <div style={{ display: "flex", gap: 8 }}>
                              {FOOD_TYPES.map(f => (
                                <button key={f.key} type="button" onClick={() => setMealFood(m.key, f.key)} style={{
                                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font,
                                  border: `2px solid ${ft === f.key ? f.color : "rgba(44,26,14,0.12)"}`,
                                  background: ft === f.key ? f.bg : "#fff",
                                  color: ft === f.key ? f.color : "#9B7450",
                                }}>{f.label}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
              </div>
            )}

            {/* 5. Home / venue decoration */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🌸</span>
                <div style={{ ...labelSm }}>Home / venue decoration for this day?</div>
              </div>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>
                Floral arrangements, lighting, backdrops, entrance décor — we'll include a Decorator in your requirements.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: true, label: "Yes, decorate! ✨" }, { val: false, label: "No, skip" }].map(({ val, label }) => (
                  <button key={String(val)} type="button" onClick={() => updateDay("decoration", val)} style={{
                    flex: 1, padding: "13px 0", borderRadius: 12,
                    border: `2px solid ${plan.decoration === val ? GOLD : "rgba(196,122,46,0.2)"}`,
                    background: plan.decoration === val ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#fff",
                    color: plan.decoration === val ? "#fff" : BROWN,
                    fontWeight: 700, fontFamily: font, fontSize: 14, cursor: "pointer",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* 6. Notes */}
            <div style={card}>
              <div style={{ ...labelSm, marginBottom: 6 }}>Any specific notes? (optional)</div>
              <textarea value={plan.notes} onChange={e => updateDay("notes", e.target.value)}
                placeholder="e.g. DJ only after 8pm, outdoor setup, 2 makeup artists…"
                rows={3}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
            </div>

            {/* Next */}
            <button
              disabled={!canNextDay}
              onClick={() => advance()}
              style={{
                padding: "15px", borderRadius: 14, border: "none", width: "100%",
                background: canNextDay ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "rgba(44,26,14,0.1)",
                color: canNextDay ? "#fff" : "#9B7450", fontWeight: 800, fontFamily: font, fontSize: 15,
                cursor: canNextDay ? "pointer" : "not-allowed",
                boxShadow: canNextDay ? "0 4px 14px rgba(196,122,46,0.3)" : "none",
              }}>
              {step < numDays ? `Done — Plan Day ${step + 1} →` : "See Full Summary →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const activeDays    = days.slice(0, numDays);
  const allVendorIds  = [...new Set(activeDays.flatMap(d => d.vendors))];
  const coupleName    = [couple1, couple2].filter(Boolean).join(" & ");
  const MEAL_LABELS   = Object.fromEntries(MEALS.map(m => [m.key, m]));
  const FOOD_LABELS   = Object.fromEntries(FOOD_TYPES.map(f => [f.key, f]));

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8EE", fontFamily: font }}>
      <HamburgerNav />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 20px 100px" }}>

        <button onClick={() => { goTop(); setStep(numDays); }}
          style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: font, marginBottom: 28, display: "block" }}>
          ← Edit Day {numDays}
        </button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <h2 style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, color: BROWN, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Your Plan is Ready
          </h2>
          {coupleName && <p style={{ color: GOLD, fontWeight: 700, fontSize: 15, margin: 0 }}>{coupleName}'s Wedding</p>}
        </div>

        {/* Day cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {activeDays.map((d, i) => {
            const dateStr  = fmtDate(startDate, i);
            const cers     = dayCeremonies(d);
            const firstCer = CEREMONIES.find(c => c.key === d.ceremonies[0]);
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px", boxShadow: "0 2px 12px rgba(139,69,19,0.05)" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 900, color: BROWN, fontSize: 16, marginBottom: 3 }}>
                      <span style={{ marginRight: 8 }}>{firstCer?.emoji || "📅"}</span>Day {i + 1}
                    </div>
                    {dateStr && <div style={{ fontSize: 12, color: "#9B7450" }}>{dateStr}</div>}
                  </div>
                  <button onClick={() => { goTop(); setStep(i + 1); }}
                    style={{ fontSize: 12, color: GOLD, background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                    Edit
                  </button>
                </div>

                {/* Functions */}
                {cers.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Functions</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {d.ceremonies.map(k => {
                        const info = CEREMONIES.find(c => c.key === k);
                        return (
                          <span key={k} style={{ fontSize: 12, background: "rgba(196,122,46,0.1)", color: GOLD, borderRadius: 20, padding: "3px 12px", fontWeight: 700 }}>
                            {info?.emoji} {k === "custom" ? (d.customCeremony || "Custom") : info?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Guests */}
                {d.guests && (
                  <div style={{ marginBottom: 10, fontSize: 13, color: "#7A5535" }}>
                    👥 <strong>{d.guests}</strong> guests expected
                  </div>
                )}

                {/* Meals */}
                {d.meals.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Meals</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {d.meals.map(mk => {
                        const ml  = MEAL_LABELS[mk];
                        const ft  = d.mealFoodType[mk];
                        const ftl = ft ? FOOD_LABELS[ft] : null;
                        return (
                          <span key={mk} style={{ fontSize: 12, background: "#F9F5F0", color: BROWN, borderRadius: 20, padding: "3px 10px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            {ml?.emoji} {ml?.label}{ftl ? <span style={{ color: ftl.color, fontWeight: 700 }}>· {ftl.label}</span> : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vendors */}
                {d.vendors.length > 0 && (
                  <div style={{ marginBottom: d.notes ? 10 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Services</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {d.vendors.map(vid => {
                        const v = VENDORS.find(x => x.id === vid);
                        return v ? (
                          <span key={vid} style={{ fontSize: 12, background: "rgba(34,197,94,0.07)", color: "#16a34a", borderRadius: 8, padding: "3px 10px", fontWeight: 600, border: "1px solid rgba(34,197,94,0.15)" }}>
                            {v.emoji} {v.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Decoration */}
                {d.decoration !== null && (
                  <div style={{ marginTop: d.vendors.length > 0 || d.meals.length > 0 ? 10 : 0, fontSize: 13, color: d.decoration ? "#16a34a" : "#9B7450", fontWeight: 600 }}>
                    🌸 {d.decoration ? "Home / venue decoration planned" : "No decoration needed"}
                  </div>
                )}

                {d.notes && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9B7450", fontStyle: "italic", lineHeight: 1.5 }}>{d.notes}</p>}
              </div>
            );
          })}
        </div>

        {/* Consolidated vendors */}
        {allVendorIds.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(139,69,19,0.05)", marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Total Vendors Needed
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allVendorIds.map(vid => {
                const v     = VENDORS.find(x => x.id === vid);
                const count = activeDays.filter(d => d.vendors.includes(vid)).length;
                return v ? (
                  <div key={vid} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.18)" }}>
                    <span style={{ fontSize: 16 }}>{v.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BROWN }}>{v.label}</span>
                    {count > 1 && <span style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>× {count} days</span>}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => alert("Coming soon — we'll send quotation requests to vendors on your behalf!")}
            style={{ flex: 1, minWidth: 200, padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontWeight: 800, fontFamily: font, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
            Request Quotations →
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "15px 22px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: BROWN, fontWeight: 600, fontFamily: font, fontSize: 14, cursor: "pointer" }}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
