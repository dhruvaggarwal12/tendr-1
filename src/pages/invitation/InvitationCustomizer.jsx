import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

// ── Editable inline field ─────────────────────────────────────────────────────
function EditableField({ value, onChange, placeholder, style = {}, multiline = false }) {
  const [editing, setEditing] = useState(false);
  const inputStyle = {
    background: "transparent",
    border: "none",
    borderBottom: "1px dashed rgba(180,140,60,0.5)",
    outline: "none",
    textAlign: "center",
    width: "100%",
    cursor: "text",
    ...style,
    fontFamily: style.fontFamily || "inherit",
    fontSize: style.fontSize || "inherit",
    color: style.color || "inherit",
    fontWeight: style.fontWeight || "inherit",
    letterSpacing: style.letterSpacing || "inherit",
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{ ...inputStyle, resize: "none", display: "block" }}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

// ── Botanical Flyer Template ──────────────────────────────────────────────────
function BotanicalFlyer({ data, onChange }) {
  const gold = "#B8922A";
  const darkGold = "#8B6914";
  const darkGreen = "#3D5A3E";
  const cream = "#F7F3EC";

  return (
    <div style={{
      width: 480, minHeight: 680,
      background: cream,
      border: `2px solid ${gold}`,
      borderRadius: 4,
      position: "relative",
      padding: "40px 48px 44px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      overflow: "hidden",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      {/* Decorative corner border - inner */}
      <div style={{ position: "absolute", inset: 8, border: `1px solid rgba(184,146,42,0.35)`, borderRadius: 2, pointerEvents: "none" }} />

      {/* TOP-LEFT leaf cluster */}
      <div style={{ position: "absolute", top: -10, left: -10, fontSize: 88, opacity: 0.55, transform: "rotate(-20deg)", pointerEvents: "none", color: darkGreen, lineHeight: 1 }}>🌿</div>
      <div style={{ position: "absolute", top: 24, left: 4, fontSize: 52, opacity: 0.4, transform: "rotate(15deg)", pointerEvents: "none", color: darkGreen, lineHeight: 1 }}>🍃</div>

      {/* TOP-RIGHT leaf cluster */}
      <div style={{ position: "absolute", top: -12, right: -8, fontSize: 80, opacity: 0.5, transform: "rotate(30deg) scaleX(-1)", pointerEvents: "none", color: darkGreen, lineHeight: 1 }}>🌿</div>

      {/* BOTTOM-LEFT */}
      <div style={{ position: "absolute", bottom: 10, left: -8, fontSize: 64, opacity: 0.45, transform: "rotate(20deg)", pointerEvents: "none", color: darkGreen, lineHeight: 1 }}>🌿</div>

      {/* BOTTOM-RIGHT leaf cluster */}
      <div style={{ position: "absolute", bottom: -10, right: -10, fontSize: 88, opacity: 0.55, transform: "rotate(-15deg) scaleX(-1)", pointerEvents: "none", color: darkGreen, lineHeight: 1 }}>🌿</div>
      <div style={{ position: "absolute", bottom: 30, right: 4, fontSize: 48, opacity: 0.4, transform: "rotate(-30deg)", pointerEvents: "none", color: darkGreen, lineHeight: 1 }}>🍃</div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>

        {/* YOU ARE CORDIALLY INVITED */}
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: darkGreen, margin: "0 0 6px", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
          You are cordially invited to
        </p>

        {/* Decorative divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ height: 1, width: 48, background: gold }} />
          <span style={{ fontSize: 10, color: gold }}>✦</span>
          <div style={{ height: 1, width: 48, background: gold }} />
        </div>

        {/* YOU'RE */}
        <h1 style={{ fontSize: 44, fontWeight: 700, color: darkGreen, margin: "0 0 -8px", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>
          You're
        </h1>

        {/* Invited! — script style */}
        <div style={{ fontSize: 58, fontFamily: "'Dancing Script', 'Brush Script MT', cursive", color: gold, margin: "-4px 0 2px", lineHeight: 1.1 }}>
          Invited!
        </div>

        {/* Heart divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "4px 0 8px" }}>
          <div style={{ height: 1, width: 52, background: gold }} />
          <span style={{ fontSize: 14, color: darkGreen }}>♥</span>
          <div style={{ height: 1, width: 52, background: gold }} />
        </div>

        {/* Event title — editable */}
        <div style={{ marginBottom: 18 }}>
          <EditableField
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="Join us for a Special Celebration"
            style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: darkGreen, fontFamily: "'Outfit', sans-serif", fontWeight: 500, textAlign: "center" }}
          />
        </div>

        {/* Spacer */}
        <div style={{ height: 10 }} />

        {/* Fields */}
        {[
          { icon: "📅", label: "DATE", key: "date", placeholder: "e.g. Saturday, 15th June 2025" },
          { icon: "🕐", label: "TIME", key: "time", placeholder: "e.g. 7:00 PM Onwards" },
          { icon: "📍", label: "VENUE", key: "venue", placeholder: "Venue name & address" },
          { icon: "✉️", label: "RSVP", key: "rsvp", placeholder: "Phone / email" },
        ].map(({ icon, label, key, placeholder }) => (
          <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, textAlign: "left" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(180,140,60,0.12)", border: `1px solid rgba(180,140,60,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: darkGreen, fontFamily: "'Outfit', sans-serif" }}>{label}: </span>
              <EditableField
                value={data[key]}
                onChange={v => onChange(key, v)}
                placeholder={placeholder}
                style={{ fontSize: 12.5, color: "#444", fontFamily: "'Outfit', sans-serif", textAlign: "left" }}
              />
            </div>
          </div>
        ))}

        {/* Bottom script */}
        <div style={{ marginTop: 18 }}>
          <p style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: 20, color: "#5a4a2a", margin: "0 0 2px" }}>
            We look forward to
          </p>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: darkGreen, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Celebrating with you!
          </p>
        </div>

        {/* Bottom divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 }}>
          <div style={{ height: 1, width: 32, background: gold }} />
          <span style={{ fontSize: 10, color: gold }}>✦</span>
          <div style={{ height: 1, width: 4, background: gold }} />
          <span style={{ fontSize: 14, color: gold }}>✿</span>
          <div style={{ height: 1, width: 4, background: gold }} />
          <span style={{ fontSize: 10, color: gold }}>✦</span>
          <div style={{ height: 1, width: 32, background: gold }} />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InvitationCustomizer() {
  const navigate = useNavigate();
  const flyerRef = useRef(null);
  const [data, setData] = useState({
    eventTitle: "",
    date: "",
    time: "",
    venue: "",
    rsvp: "",
  });
  const [ordered, setOrdered] = useState(false);
  const [copies, setCopies] = useState(50);

  const change = (key, val) => setData(p => ({ ...p, [key]: val }));

  const allFilled = data.date && data.time && data.venue;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Invitation Flyer Customiser — Tendr" description="Create and customise your event invitation flyer." path="/invitation/customize" />

      {/* Google Fonts for script */}
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />

      <HamburgerNav title="Invitation Flyer" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C47A2E" }}>Step 1 of 1</span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, color: "#2C1A0E", margin: "6px 0 8px", letterSpacing: "-0.02em" }}>Customise Your Invitation</h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Click on any field on the flyer to edit it directly</p>
        </div>

        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>

          {/* ── Flyer centred ── */}
          <div ref={flyerRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <BotanicalFlyer data={data} onChange={change} />
            <p style={{ fontSize: 12, color: "#bbb", textAlign: "center" }}>Click any text field to edit</p>
          </div>

          {/* ── Right panel: summary + order ── */}
          <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Quick fill panel */}
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 14px" }}>Quick Fill</h3>
              <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>
                Or fill in the details here — they'll update live on the flyer.
              </p>
              {[
                { key: "eventTitle", label: "Event / Occasion", placeholder: "e.g. Birthday Celebration" },
                { key: "date",       label: "Date *",            placeholder: "e.g. 15th June 2025, Saturday" },
                { key: "time",       label: "Time *",            placeholder: "e.g. 7:00 PM Onwards" },
                { key: "venue",      label: "Venue *",           placeholder: "Venue name & address" },
                { key: "rsvp",       label: "RSVP",              placeholder: "Phone or email" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    value={data[key]}
                    onChange={e => change(key, e.target.value)}
                    placeholder={placeholder}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box", background: "#fff" }}
                  />
                </div>
              ))}
            </div>

            {/* Order panel */}
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Order Printed Copies</h3>
              <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>Get high-quality printed invitations delivered to your door.</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Number of copies</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[25, 50, 100, 200].map(n => (
                    <button key={n} onClick={() => setCopies(n)}
                      style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${copies === n ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: copies === n ? "#C47A2E" : "#fff", color: copies === n ? "#fff" : "#6B3A1F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {!allFilled && (
                <p style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 10px", marginBottom: 12 }}>
                  Fill in Date, Time and Venue to continue
                </p>
              )}

              {ordered ? (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>Request submitted!</div>
                  <div style={{ fontSize: 12, color: "#9B7450", marginTop: 4 }}>Our team will contact you to confirm printing details.</div>
                </div>
              ) : (
                <button
                  disabled={!allFilled}
                  onClick={() => setOrdered(true)}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: allFilled ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: allFilled ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: font, boxShadow: allFilled ? "0 3px 12px rgba(196,122,46,0.35)" : "none" }}>
                  Book {copies} Printed Copies →
                </button>
              )}

              <button
                onClick={() => {
                  const url = `whatsapp://send?text=You're Invited! ${data.eventTitle ? `to ${data.eventTitle}` : ""} %0ADate: ${data.date} %0ATime: ${data.time} %0AVenue: ${data.venue}`;
                  window.open(url);
                }}
                style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 12, border: "1.5px solid rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.07)", color: "#15803d", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                📲 Share via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
