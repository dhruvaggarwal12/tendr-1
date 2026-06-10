import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";

const CEREMONY_OPTIONS = [
  "Haldi", "Mehendi", "Sangeet", "Wedding Ceremony", "Reception",
  "Tilak / Sagan", "Engagement", "Griha Pravesh", "Family Dinner", "Custom",
];

const DECOR_THEMES = [
  "Traditional 🪔", "Royal 👑", "Floral 🌸", "Modern ✨", "Minimal 🤍", "Bohemian 🌿",
];

const MENU_TYPES = [
  "Full Vegetarian", "Non-Vegetarian Mix", "Snacks & Drinks Only", "No Catering Needed",
];

const VENDOR_TYPES = [
  { id: "caterer",    label: "Caterer",         emoji: "🍽️" },
  { id: "photographer", label: "Photographer",  emoji: "📸" },
  { id: "videographer", label: "Videographer",  emoji: "🎬" },
  { id: "dj",         label: "DJ / Sound",      emoji: "🎵" },
  { id: "decorator",  label: "Decorator",       emoji: "🌸" },
  { id: "makeup",     label: "Makeup Artist",   emoji: "💄" },
  { id: "mehendi",    label: "Mehendi Artist",  emoji: "🌿" },
  { id: "florist",    label: "Florist",         emoji: "💐" },
  { id: "pandit",     label: "Pandit / Priest", emoji: "🪔" },
  { id: "tent",       label: "Tent & Furniture",emoji: "⛺" },
];

function makeDayPlan() {
  return { ceremonyName: "", customName: "", guests: "", decor: "", menu: "", vendors: [], notes: "" };
}

function getDateStr(startDate, i) {
  if (!startDate) return "";
  const d = new Date(startDate + "T00:00:00");
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export default function HomeWeddingPlanner() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [step, setStep] = useState(0);
  const [numDays, setNumDays] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [couple1, setCouple1] = useState("");
  const [couple2, setCouple2] = useState("");
  const [dayPlans, setDayPlans] = useState(() => Array.from({ length: 6 }, makeDayPlan));
  const [activeDay, setActiveDay] = useState(0);
  const [toast, setToast] = useState("");

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, background: "#FFF8EE", flexDirection: "column", gap: 16, padding: 24 }}>
        <span style={{ fontSize: 48 }}>🔒</span>
        <h2 style={{ color: BROWN, fontWeight: 800, fontSize: 22, textAlign: "center" }}>Coming Soon</h2>
        <p style={{ color: "#9B7450", textAlign: "center", maxWidth: 360 }}>The Multi-Day Home Wedding Planner is currently in admin preview. Stay tuned!</p>
        <button onClick={() => navigate("/")} style={{ padding: "10px 24px", borderRadius: 10, background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>Go Home</button>
      </div>
    );
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const updateDay = (idx, field, value) =>
    setDayPlans(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));

  const toggleVendor = (idx, vid) =>
    setDayPlans(prev => prev.map((d, i) => {
      if (i !== idx) return d;
      const has = d.vendors.includes(vid);
      return { ...d, vendors: has ? d.vendors.filter(v => v !== vid) : [...d.vendors, vid] };
    }));

  const days = dayPlans.slice(0, numDays);
  const allVendors = [...new Set(days.flatMap(d => d.vendors))];

  const dayLabel = (i) => {
    const n = dayPlans[i].ceremonyName === "Custom" ? dayPlans[i].customName : dayPlans[i].ceremonyName;
    return n ? `Day ${i + 1}: ${n}` : `Day ${i + 1}`;
  };

  const isSetupComplete = numDays >= 3 && startDate;

  const cardStyle = { background: "#FFFCF5", borderRadius: 20, padding: "26px 24px", boxShadow: "0 4px 24px rgba(139,69,19,0.08)" };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 9 };
  const inputStyle = { padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 15, color: BROWN, background: "#fff", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#FFF8F2 0%,#F5E6CC 100%)", fontFamily: font }}>
      <SEO title="Multi-Day Home Wedding Planner" description="Plan your home wedding rituals day by day — Haldi, Mehendi, Wedding and more." path="/home-wedding-planner" />
      <HamburgerNav />

      {toast && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: BROWN, color: "#fff", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 99999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.1)", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 100, padding: "4px 12px", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em" }}>Admin Preview</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.7rem)", fontWeight: 900, color: BROWN, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            🏠 Multi-Day Home Wedding Planner
          </h1>
          <p style={{ color: "#9B7450", fontSize: 15.5, margin: 0 }}>
            Plan Haldi, Mehendi, Wedding & all rituals — day by day, all in one place.
          </p>
          <div style={{ width: 48, height: 3, background: `linear-gradient(90deg,${GOLD},#CCAB4A)`, borderRadius: 100, marginTop: 16 }} />
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {["Event Setup", "Day Planning", "Summary"].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, background: step > i ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : step === i ? BROWN : "rgba(44,26,14,0.1)", color: step >= i ? "#fff" : "#9B7450" }}>{i + 1}</div>
                <span style={{ fontSize: 13, fontWeight: step === i ? 700 : 500, color: step === i ? BROWN : "#9B7450" }}>{label}</span>
              </div>
              {i < 2 && <span style={{ color: "rgba(44,26,14,0.2)", fontSize: 18 }}>›</span>}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 0: Setup ─────────────────────────────── */}
        {step === 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: BROWN, margin: "0 0 22px" }}>Tell us about the event</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Bride / Person 1</label>
                <input value={couple1} onChange={e => setCouple1(e.target.value)} placeholder="e.g. Priya" style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Groom / Person 2</label>
                <input value={couple2} onChange={e => setCouple2(e.target.value)} placeholder="e.g. Rahul" style={{ ...inputStyle, width: "100%" }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>First Day of Events *</label>
              <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Number of Event Days *</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => setNumDays(n)} style={{
                    padding: "10px 22px", borderRadius: 10, border: `2px solid ${numDays === n ? GOLD : "rgba(196,122,46,0.2)"}`,
                    background: numDays === n ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#fff",
                    color: numDays === n ? "#fff" : BROWN, fontWeight: 700, fontFamily: font, fontSize: 15, cursor: "pointer",
                  }}>{n} days</button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#9B7450", marginTop: 8 }}>Indian home weddings typically span 3–6 days including pre-wedding rituals.</p>
            </div>

            <button
              disabled={!isSetupComplete}
              onClick={() => { setStep(1); setActiveDay(0); }}
              style={{
                padding: "13px 32px", borderRadius: 12, border: "none",
                background: isSetupComplete ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "rgba(44,26,14,0.1)",
                color: isSetupComplete ? "#fff" : "#9B7450", fontWeight: 700, fontFamily: font, fontSize: 15,
                cursor: isSetupComplete ? "pointer" : "not-allowed",
                boxShadow: isSetupComplete ? "0 4px 14px rgba(196,122,46,0.3)" : "none",
              }}
            >
              Continue to Day Planning →
            </button>
          </div>
        )}

        {/* ── STEP 1: Day Planning ───────────────────────── */}
        {step === 1 && (
          <div>
            {/* Day tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
              {days.map((_, i) => (
                <button key={i} onClick={() => setActiveDay(i)} style={{
                  padding: "8px 16px", borderRadius: 20, border: `2px solid ${activeDay === i ? GOLD : "rgba(196,122,46,0.2)"}`,
                  background: activeDay === i ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#fff",
                  color: activeDay === i ? "#fff" : BROWN, fontWeight: 700, fontFamily: font, fontSize: 13,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {dayLabel(i)}
                </button>
              ))}
            </div>

            {/* Active day form */}
            {days.map((plan, i) => i !== activeDay ? null : (
              <div key={i} style={cardStyle}>
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: BROWN, margin: "0 0 3px" }}>
                    Day {i + 1} {getDateStr(startDate, i) && `— ${getDateStr(startDate, i)}`}
                  </h2>
                  <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Fill in what you're planning for this day.</p>
                </div>

                {/* Ceremony */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Ceremony / Function</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                    {CEREMONY_OPTIONS.map(c => (
                      <button key={c} onClick={() => updateDay(i, "ceremonyName", c)} style={{
                        padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${plan.ceremonyName === c ? GOLD : "rgba(196,122,46,0.18)"}`,
                        background: plan.ceremonyName === c ? "rgba(196,122,46,0.1)" : "#fff",
                        color: plan.ceremonyName === c ? GOLD : BROWN, fontWeight: plan.ceremonyName === c ? 700 : 500,
                        fontFamily: font, fontSize: 13, cursor: "pointer", textAlign: "center",
                      }}>{c}</button>
                    ))}
                  </div>
                  {plan.ceremonyName === "Custom" && (
                    <input value={plan.customName} onChange={e => updateDay(i, "customName", e.target.value)} placeholder="e.g. Godh Bharai" style={{ ...inputStyle, marginTop: 10, width: "100%" }} />
                  )}
                </div>

                {/* Guests */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Expected Guests</label>
                  <input type="number" value={plan.guests} onChange={e => updateDay(i, "guests", e.target.value)} placeholder="e.g. 150" style={{ ...inputStyle, width: 160 }} />
                </div>

                {/* Decor */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Decor Theme</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DECOR_THEMES.map(d => (
                      <button key={d} onClick={() => updateDay(i, "decor", d)} style={{
                        padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${plan.decor === d ? GOLD : "rgba(196,122,46,0.18)"}`,
                        background: plan.decor === d ? "rgba(196,122,46,0.1)" : "#fff",
                        color: plan.decor === d ? GOLD : BROWN, fontWeight: plan.decor === d ? 700 : 500,
                        fontFamily: font, fontSize: 13, cursor: "pointer",
                      }}>{d}</button>
                    ))}
                  </div>
                </div>

                {/* Menu */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Menu Type</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {MENU_TYPES.map(m => (
                      <button key={m} onClick={() => updateDay(i, "menu", m)} style={{
                        padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${plan.menu === m ? GOLD : "rgba(196,122,46,0.18)"}`,
                        background: plan.menu === m ? "rgba(196,122,46,0.1)" : "#fff",
                        color: plan.menu === m ? GOLD : BROWN, fontWeight: plan.menu === m ? 700 : 500,
                        fontFamily: font, fontSize: 13, cursor: "pointer",
                      }}>{m}</button>
                    ))}
                  </div>
                </div>

                {/* Vendors */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Vendors Needed This Day</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                    {VENDOR_TYPES.map(v => {
                      const sel = plan.vendors.includes(v.id);
                      return (
                        <button key={v.id} onClick={() => toggleVendor(i, v.id)} style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10,
                          border: `1.5px solid ${sel ? "#22c55e" : "rgba(196,122,46,0.18)"}`,
                          background: sel ? "rgba(34,197,94,0.07)" : "#fff",
                          color: sel ? "#16a34a" : BROWN, fontWeight: sel ? 700 : 500,
                          fontFamily: font, fontSize: 13, cursor: "pointer", textAlign: "left",
                        }}>
                          <span style={{ fontSize: 17 }}>{v.emoji}</span>
                          <span style={{ flex: 1 }}>{v.label}</span>
                          {sel && <span style={{ fontSize: 12, fontWeight: 800 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes for This Day</label>
                  <textarea value={plan.notes} onChange={e => updateDay(i, "notes", e.target.value)} placeholder="e.g. DJ needed after 8pm, lunch & dinner both, evening fairy lights..." rows={2} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
                </div>
              </div>
            ))}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              <button onClick={() => { if (activeDay > 0) setActiveDay(activeDay - 1); else setStep(0); }} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: BROWN, fontWeight: 600, fontFamily: font, fontSize: 14, cursor: "pointer" }}>
                ← {activeDay > 0 ? `Day ${activeDay}` : "Back to Setup"}
              </button>
              {activeDay < numDays - 1 ? (
                <button onClick={() => setActiveDay(activeDay + 1)} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontWeight: 700, fontFamily: font, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(196,122,46,0.28)" }}>
                  Day {activeDay + 2} →
                </button>
              ) : (
                <button onClick={() => setStep(2)} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontWeight: 700, fontFamily: font, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(196,122,46,0.28)" }}>
                  View Summary →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Summary ───────────────────────────── */}
        {step === 2 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: BROWN, margin: "0 0 4px" }}>Event Summary</h2>
            {(couple1 || couple2) && (
              <p style={{ color: GOLD, fontWeight: 700, fontSize: 15, margin: "0 0 18px" }}>
                {[couple1, couple2].filter(Boolean).join(" & ")}'s Wedding
              </p>
            )}

            {/* Day cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {days.map((plan, i) => {
                const name = plan.ceremonyName === "Custom" ? plan.customName : plan.ceremonyName;
                return (
                  <div key={i} style={{ borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.18)", padding: "14px 18px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: BROWN, fontSize: 15 }}>Day {i + 1}{name ? ` — ${name}` : ""}</div>
                        {getDateStr(startDate, i) && <div style={{ fontSize: 12.5, color: "#9B7450", marginTop: 2 }}>{getDateStr(startDate, i)}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {plan.guests && <span style={{ fontSize: 12, background: "rgba(196,122,46,0.08)", color: BROWN, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>👥 {plan.guests} guests</span>}
                        {plan.decor && <span style={{ fontSize: 12, background: "rgba(196,122,46,0.08)", color: BROWN, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{plan.decor}</span>}
                        {plan.menu && <span style={{ fontSize: 12, background: "rgba(196,122,46,0.08)", color: BROWN, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>🍽️ {plan.menu}</span>}
                      </div>
                    </div>
                    {plan.vendors.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {plan.vendors.map(vid => {
                          const v = VENDOR_TYPES.find(x => x.id === vid);
                          return v ? <span key={vid} style={{ fontSize: 12, background: "rgba(34,197,94,0.08)", color: "#16a34a", borderRadius: 8, padding: "3px 10px", fontWeight: 600 }}>{v.emoji} {v.label}</span> : null;
                        })}
                      </div>
                    )}
                    {plan.notes && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#9B7450", fontStyle: "italic" }}>{plan.notes}</p>}
                  </div>
                );
              })}
            </div>

            {/* Consolidated vendors */}
            {allVendors.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 18, marginBottom: 22 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Total Vendor Requirements</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {allVendors.map(vid => {
                    const v = VENDOR_TYPES.find(x => x.id === vid);
                    const daysNeeded = days.filter(d => d.vendors.includes(vid)).length;
                    return v ? (
                      <div key={vid} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 10, background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.2)" }}>
                        <span style={{ fontSize: 16 }}>{v.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: BROWN }}>{v.label}</span>
                        <span style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>× {daysNeeded}d</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => showToast("🚀 Coming soon — vendor quotation requests will launch shortly!")}
                style={{ padding: "13px 28px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontWeight: 700, fontFamily: font, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
              >
                Request Quotations →
              </button>
              <button onClick={() => setStep(1)} style={{ padding: "13px 24px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: BROWN, fontWeight: 600, fontFamily: font, fontSize: 14, cursor: "pointer" }}>
                Edit Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
