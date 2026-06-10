import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";

const CEREMONIES = [
  { key: "haldi",     label: "Haldi",             emoji: "💛" },
  { key: "mehendi",   label: "Mehendi",            emoji: "🌿" },
  { key: "sangeet",   label: "Sangeet / Dance",    emoji: "🎶" },
  { key: "wedding",   label: "Wedding Ceremony",   emoji: "💍" },
  { key: "reception", label: "Reception",          emoji: "🥂" },
  { key: "tilak",     label: "Tilak / Sagan",      emoji: "🪔" },
  { key: "engagement",label: "Engagement",         emoji: "💫" },
  { key: "dinner",    label: "Family Dinner",      emoji: "🍽️" },
  { key: "custom",    label: "Something Else",     emoji: "✏️" },
];

const VENDORS = [
  { id: "caterer",     label: "Caterer",        emoji: "🍽️" },
  { id: "decorator",   label: "Decorator",      emoji: "🌸" },
  { id: "photographer",label: "Photographer",   emoji: "📸" },
  { id: "dj",          label: "DJ / Sound",     emoji: "🎵" },
  { id: "mehendi",     label: "Mehendi Artist", emoji: "🌿" },
  { id: "makeup",      label: "Makeup Artist",  emoji: "💄" },
  { id: "pandit",      label: "Pandit",         emoji: "🪔" },
  { id: "tent",        label: "Tent & Lights",  emoji: "✨" },
];

function blankDay() {
  return { ceremony: "", customCeremony: "", guests: "", vendors: [], notes: "" };
}

function fmtDate(startDate, i) {
  if (!startDate) return "";
  const d = new Date(startDate + "T00:00:00");
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

const today = new Date().toISOString().split("T")[0];

export default function HomeWeddingPlanner() {
  const navigate = useNavigate();

  // step 0 = basic info, steps 1..numDays = day forms, step numDays+1 = summary
  const [step, setStep]         = useState(0);
  const [numDays, setNumDays]   = useState(3);
  const [startDate, setStartDate] = useState("");
  const [couple1, setCouple1]   = useState("");
  const [couple2, setCouple2]   = useState("");
  const [days, setDays]         = useState(() => Array.from({ length: 4 }, blankDay));

  const totalSteps = numDays + 1; // +1 for summary
  const dayStep    = step - 1;   // 0-indexed day index when step >= 1

  const updateDay = (field, value) =>
    setDays(prev => prev.map((d, i) => i === dayStep ? { ...d, [field]: value } : d));

  const toggleVendor = (vid) => {
    const cur = days[dayStep].vendors;
    const next = cur.includes(vid) ? cur.filter(v => v !== vid) : [...cur, vid];
    updateDay("vendors", next);
  };

  const plan   = days[dayStep] || blankDay();
  const canNext = step === 0 ? !!startDate : !!plan.ceremony;

  const ceremonyLabel = (d) => {
    if (!d.ceremony) return "";
    if (d.ceremony === "custom") return d.customCeremony || "Custom";
    return CEREMONIES.find(c => c.key === d.ceremony)?.label || d.ceremony;
  };

  // ── Step 0: Basic info ─────────────────────────────────────────────────────
  if (step === 0) {
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
              Plan your Haldi, Mehendi, Sangeet and every ritual — day by day, step by step.
            </p>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(139,69,19,0.07)", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Couple names */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Person 1 (optional)</label>
                <input value={couple1} onChange={e => setCouple1(e.target.value)} placeholder="e.g. Priya"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Person 2 (optional)</label>
                <input value={couple2} onChange={e => setCouple2(e.target.value)} placeholder="e.g. Rahul"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Start date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>When do the events start? *</label>
              <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)}
                style={{ padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>

            {/* Number of days */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>How many days are the events spread across? *</label>
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
              disabled={!startDate}
              onClick={() => setStep(1)}
              style={{
                padding: "14px", borderRadius: 12, border: "none", width: "100%",
                background: startDate ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "rgba(44,26,14,0.1)",
                color: startDate ? "#fff" : "#9B7450", fontWeight: 800, fontFamily: font, fontSize: 15,
                cursor: startDate ? "pointer" : "not-allowed",
                boxShadow: startDate ? "0 4px 14px rgba(196,122,46,0.3)" : "none",
              }}
            >
              Let's Plan Day 1 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1..numDays: Day form ─────────────────────────────────────────────
  if (step <= numDays) {
    const dateStr = fmtDate(startDate, dayStep);
    const cerInfo = CEREMONIES.find(c => c.key === plan.ceremony);

    return (
      <div style={{ minHeight: "100vh", background: "#FFF8EE", fontFamily: font }}>
        <HamburgerNav />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 100px" }}>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setStep(step - 1)} style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: font }}>
                ← {step === 1 ? "Basic Info" : `Day ${dayStep}`}
              </button>
            </div>
            {/* Step dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {Array.from({ length: numDays }).map((_, i) => (
                <div key={i} style={{ height: 5, flex: 1, borderRadius: 100, background: i < dayStep ? `linear-gradient(90deg,${GOLD},#CCAB4A)` : i === dayStep ? GOLD : "rgba(44,26,14,0.12)", transition: "background 0.3s" }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#9B7450", marginTop: 8, fontWeight: 600 }}>
              Day {step} of {numDays}
            </div>
          </div>

          {/* Day header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#9B7450", fontWeight: 600, marginBottom: 4 }}>{dateStr}</div>
            <h2 style={{ fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 900, color: BROWN, margin: 0, letterSpacing: "-0.02em" }}>
              What's happening on Day {step}?
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* 1. Ceremony */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 3px 16px rgba(139,69,19,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Pick the ceremony *
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {CEREMONIES.map(c => {
                  const sel = plan.ceremony === c.key;
                  return (
                    <button key={c.key} type="button" onClick={() => updateDay("ceremony", c.key)} style={{
                      padding: "10px 8px", borderRadius: 12,
                      border: `2px solid ${sel ? GOLD : "rgba(196,122,46,0.18)"}`,
                      background: sel ? `rgba(196,122,46,0.1)` : "#fff",
                      color: sel ? GOLD : BROWN, fontWeight: sel ? 800 : 500, fontFamily: font, fontSize: 13,
                      cursor: "pointer", textAlign: "center", lineHeight: 1.3,
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {plan.ceremony === "custom" && (
                <input
                  value={plan.customCeremony} onChange={e => updateDay("customCeremony", e.target.value)}
                  placeholder="What's the ceremony called?"
                  style={{ marginTop: 12, width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", boxSizing: "border-box" }}
                />
              )}
            </div>

            {/* 2. Guests */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 3px 16px rgba(139,69,19,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                How many guests?
              </div>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px" }}>Approximate number helps vendors quote accurately.</p>
              <input
                type="number" min="1" value={plan.guests} onChange={e => updateDay("guests", e.target.value)}
                placeholder="e.g. 80"
                style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 18, fontWeight: 700, color: BROWN, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* 3. Vendors needed */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 3px 16px rgba(139,69,19,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Which services do you need?
              </div>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px" }}>Select everything needed for {cerInfo ? `the ${cerInfo.label}` : "this day"}.</p>
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
                      {sel && <span style={{ fontSize: 13, fontWeight: 800 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Notes */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 3px 16px rgba(139,69,19,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Anything specific to note? (optional)
              </div>
              <textarea
                value={plan.notes} onChange={e => updateDay("notes", e.target.value)}
                placeholder="e.g. Evening DJ after 8pm, outdoor setup, 2 makeup artists needed..."
                rows={3}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: BROWN, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
              />
            </div>

            {/* Next / Summary */}
            <button
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
              style={{
                padding: "15px", borderRadius: 14, border: "none", width: "100%",
                background: canNext ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "rgba(44,26,14,0.1)",
                color: canNext ? "#fff" : "#9B7450", fontWeight: 800, fontFamily: font, fontSize: 15,
                cursor: canNext ? "pointer" : "not-allowed",
                boxShadow: canNext ? "0 4px 14px rgba(196,122,46,0.3)" : "none",
              }}
            >
              {step < numDays ? `Done — Plan Day ${step + 1} →` : "See Full Summary →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const activeDays = days.slice(0, numDays);
  const allVendorIds = [...new Set(activeDays.flatMap(d => d.vendors))];
  const coupleName = [couple1, couple2].filter(Boolean).join(" & ");

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8EE", fontFamily: font }}>
      <HamburgerNav />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 100px" }}>

        <div style={{ marginBottom: 28 }}>
          <button onClick={() => setStep(numDays)} style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: font }}>
            ← Edit Day {numDays}
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <h2 style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, color: BROWN, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Your Plan is Ready
          </h2>
          {coupleName && <p style={{ color: GOLD, fontWeight: 700, fontSize: 15, margin: 0 }}>{coupleName}'s Wedding</p>}
        </div>

        {/* Day summaries */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {activeDays.map((d, i) => {
            const dateStr = fmtDate(startDate, i);
            const label = ceremonyLabel(d);
            const cerInfo = CEREMONIES.find(c => c.key === d.ceremony);
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(139,69,19,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 20, marginRight: 8 }}>{cerInfo?.emoji || "📅"}</span>
                    <span style={{ fontWeight: 800, color: BROWN, fontSize: 15 }}>Day {i + 1}{label ? ` — ${label}` : ""}</span>
                    {dateStr && <div style={{ fontSize: 12, color: "#9B7450", marginTop: 3 }}>{dateStr}</div>}
                  </div>
                  <button onClick={() => setStep(i + 1)} style={{ fontSize: 12, color: GOLD, background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                    Edit
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: d.vendors.length > 0 ? 10 : 0 }}>
                  {d.guests && <span style={{ fontSize: 12, background: "rgba(196,122,46,0.08)", color: BROWN, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>👥 {d.guests} guests</span>}
                </div>
                {d.vendors.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {d.vendors.map(vid => {
                      const v = VENDORS.find(x => x.id === vid);
                      return v ? <span key={vid} style={{ fontSize: 12, background: "rgba(34,197,94,0.07)", color: "#16a34a", borderRadius: 8, padding: "3px 10px", fontWeight: 600, border: "1px solid rgba(34,197,94,0.15)" }}>{v.emoji} {v.label}</span> : null;
                    })}
                  </div>
                )}
                {d.notes && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9B7450", fontStyle: "italic", lineHeight: 1.5 }}>{d.notes}</p>}
              </div>
            );
          })}
        </div>

        {/* Consolidated vendor list */}
        {allVendorIds.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(139,69,19,0.05)", marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Total Vendors Needed
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allVendorIds.map(vid => {
                const v = VENDORS.find(x => x.id === vid);
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

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => alert("Coming soon — we'll send quotation requests to vendors on your behalf!")}
            style={{ flex: 1, minWidth: 200, padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontWeight: 800, fontFamily: font, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
          >
            Request Quotations →
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "15px 22px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: BROWN, fontWeight: 600, fontFamily: font, fontSize: 14, cursor: "pointer" }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
