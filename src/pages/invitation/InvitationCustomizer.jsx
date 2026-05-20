import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

/* ─── Editable inline span ───────────────────────────────────────────────── */
function Editable({ value, onChange, placeholder, style = {}, width = "100%" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "transparent", border: "none",
        borderBottom: value ? "none" : "1px dashed rgba(150,120,60,0.45)",
        outline: "none", width, textAlign: "center",
        cursor: "text", color: "inherit", fontFamily: "inherit",
        fontSize: "inherit", fontWeight: "inherit",
        letterSpacing: "inherit", lineHeight: "inherit",
        ...style,
      }}
    />
  );
}

/* ─── Leaf SVGs matching the watercolour image ───────────────────────────── */
const LeafTopLeft = () => (
  <svg viewBox="0 0 220 200" width="220" height="200" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
    {/* Large watercolour leaf cluster */}
    <ellipse cx="60" cy="50" rx="55" ry="28" fill="rgba(96,130,90,0.22)" transform="rotate(-35 60 50)" />
    <ellipse cx="90" cy="80" rx="50" ry="22" fill="rgba(80,115,75,0.18)" transform="rotate(-50 90 80)" />
    <ellipse cx="30" cy="90" rx="38" ry="18" fill="rgba(110,145,100,0.15)" transform="rotate(-20 30 90)" />
    {/* Gold line leaf outline */}
    <path d="M10 160 Q40 40 160 10" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <path d="M20 140 Q30 80 80 30" stroke="#C8A74A" strokeWidth="0.6" fill="none" opacity="0.5"/>
    <path d="M40 120 Q60 60 110 20" stroke="#C8A74A" strokeWidth="0.5" fill="none" opacity="0.4"/>
    {/* Leaf shapes gold */}
    <path d="M15 140 Q35 100 60 60 Q45 85 25 120Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.12)"/>
    <path d="M35 130 Q60 90 90 50 Q70 80 45 115Z" stroke="#B8A040" strokeWidth="0.6" fill="rgba(184,160,64,0.1)"/>
    {/* Dots */}
    {[[120,35],[135,25],[150,20],[145,38],[160,30]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="#C8A74A" opacity="0.5"/>
    ))}
  </svg>
);

const LeafTopRight = () => (
  <svg viewBox="0 0 220 200" width="220" height="200" style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none", transform: "scaleX(-1)" }}>
    <ellipse cx="60" cy="50" rx="55" ry="28" fill="rgba(96,130,90,0.20)" transform="rotate(-35 60 50)" />
    <ellipse cx="85" cy="75" rx="45" ry="20" fill="rgba(80,115,75,0.16)" transform="rotate(-50 85 75)" />
    <path d="M10 160 Q40 40 160 10" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.5"/>
    <path d="M15 140 Q35 100 60 60 Q45 85 25 120Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.1)"/>
    {[[120,35],[140,25],[155,18]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="#C8A74A" opacity="0.4"/>
    ))}
  </svg>
);

const LeafBottomLeft = () => (
  <svg viewBox="0 0 200 220" width="200" height="220" style={{ position: "absolute", bottom: 0, left: 0, pointerEvents: "none" }}>
    <ellipse cx="70" cy="160" rx="58" ry="25" fill="rgba(96,130,90,0.22)" transform="rotate(25 70 160)" />
    <ellipse cx="40" cy="140" rx="42" ry="18" fill="rgba(80,115,75,0.18)" transform="rotate(15 40 140)" />
    <ellipse cx="90" cy="180" rx="35" ry="15" fill="rgba(110,145,100,0.15)" transform="rotate(35 90 180)" />
    <path d="M10 60 Q50 150 180 210" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.55"/>
    <path d="M25 80 Q55 160 160 200" stroke="#C8A74A" strokeWidth="0.6" fill="none" opacity="0.4"/>
    <path d="M20 100 Q38 140 65 175 Q45 150 28 115Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.12)"/>
    {[[45,50],[35,38],[25,28],[55,42],[65,32]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="#C8A74A" opacity="0.45"/>
    ))}
  </svg>
);

const LeafBottomRight = () => (
  <svg viewBox="0 0 220 240" width="220" height="240" style={{ position: "absolute", bottom: 0, right: 0, pointerEvents: "none", transform: "scaleX(-1)" }}>
    <ellipse cx="70" cy="170" rx="62" ry="27" fill="rgba(96,130,90,0.25)" transform="rotate(20 70 170)" />
    <ellipse cx="110" cy="190" rx="50" ry="22" fill="rgba(80,115,75,0.20)" transform="rotate(35 110 190)" />
    <ellipse cx="40" cy="155" rx="38" ry="16" fill="rgba(110,145,100,0.16)" transform="rotate(10 40 155)" />
    <ellipse cx="130" cy="210" rx="42" ry="18" fill="rgba(96,130,90,0.18)" transform="rotate(50 130 210)" />
    <path d="M10 50 Q70 160 200 230" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <path d="M30 70 Q80 170 190 218" stroke="#C8A74A" strokeWidth="0.6" fill="none" opacity="0.45"/>
    <path d="M50 90 Q90 180 175 210 Q155 185 80 125Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.13)"/>
    {[[50,35],[38,25],[28,18],[62,42],[72,30]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="#C8A74A" opacity="0.5"/>
    ))}
  </svg>
);

/* ─── The invitation flyer ────────────────────────────────────────────────── */
function BotanicalFlyer({ data, onChange }) {
  const darkGreen = "#3B5048";
  const gold      = "#B8922A";

  return (
    <div style={{
      width: 460, minHeight: 660,
      background: "#F7F2E9",
      border: `1.5px solid ${gold}`,
      borderRadius: 3,
      position: "relative",
      padding: "44px 52px 46px",
      boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
      overflow: "hidden",
    }}>
      {/* Watercolour stains */}
      <div style={{ position: "absolute", top: -30, left: -40, width: 300, height: 260, borderRadius: "60% 40% 55% 50%", background: "radial-gradient(ellipse, rgba(110,140,100,0.18) 0%, rgba(100,130,95,0.08) 55%, transparent 75%)", transform: "rotate(-15deg)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 20, left: 10, width: 180, height: 150, borderRadius: "50% 60% 40% 55%", background: "radial-gradient(ellipse, rgba(150,170,140,0.12) 0%, transparent 70%)", transform: "rotate(10deg)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -20, right: -30, width: 280, height: 230, borderRadius: "45% 55% 50% 60%", background: "radial-gradient(ellipse, rgba(110,140,100,0.16) 0%, rgba(90,120,85,0.07) 55%, transparent 75%)", transform: "rotate(20deg)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 30, right: 20, width: 160, height: 130, borderRadius: "55% 45% 60% 40%", background: "radial-gradient(ellipse, rgba(140,165,130,0.10) 0%, transparent 65%)", transform: "rotate(-10deg)", pointerEvents: "none" }} />
      {/* Light overall tint */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 80%, rgba(180,190,175,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Inner gold border */}
      <div style={{ position: "absolute", inset: 10, border: `0.8px solid rgba(184,146,42,0.3)`, borderRadius: 1, pointerEvents: "none" }} />

      {/* Botanical corner leaves */}
      <LeafTopLeft />
      <LeafTopRight />
      <LeafBottomLeft />
      <LeafBottomRight />

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif" }}>

        {/* Top tagline */}
        <p style={{ fontSize: 10.5, letterSpacing: "0.26em", textTransform: "uppercase", color: darkGreen, margin: "0 0 7px", fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontWeight: 500 }}>
          You are<br />cordially invited to
        </p>

        {/* Top ornamental divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "6px 0 8px" }}>
          <div style={{ height: "0.8px", width: 44, background: `linear-gradient(to right, transparent, ${gold})` }} />
          <svg width="14" height="12" viewBox="0 0 20 16">
            <path d="M10 0 L12 6 L10 4 L8 6Z" fill={gold} opacity="0.8"/>
            <path d="M10 16 L12 10 L10 12 L8 10Z" fill={gold} opacity="0.8"/>
            <circle cx="10" cy="8" r="1.5" fill={gold}/>
          </svg>
          <div style={{ height: "0.8px", width: 44, background: `linear-gradient(to left, transparent, ${gold})` }} />
        </div>

        {/* YOU'RE */}
        <div style={{ fontSize: 46, fontWeight: 700, color: darkGreen, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 0.9, margin: "0 0 -2px", fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>
          You're
        </div>

        {/* Invited! — script */}
        <div style={{ fontSize: 62, color: gold, lineHeight: 1.05, margin: "-2px 0 4px", fontFamily: "'Great Vibes', 'Dancing Script', cursive" }}>
          Invited!
        </div>

        {/* Heart divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "2px 0 10px" }}>
          <div style={{ height: "0.8px", flex: 1, maxWidth: 60, background: gold, opacity: 0.7 }} />
          <svg width="14" height="13" viewBox="0 0 24 22" fill={darkGreen}><path d="M12 21.6C12 21.6 1 14 1 6.5C1 3.4 3.4 1 6.5 1C8.2 1 9.8 1.8 11 3C12.2 1.8 13.8 1 15.5 1C18.6 1 21 3.4 21 6.5C21 14 12 21.6 12 21.6Z"/></svg>
          <div style={{ height: "0.8px", flex: 1, maxWidth: 60, background: gold, opacity: 0.7 }} />
        </div>

        {/* Event title — editable */}
        <div style={{ marginBottom: 20 }}>
          <Editable
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="Join us for a Special Celebration"
            style={{ fontSize: 11.5, letterSpacing: "0.20em", textTransform: "uppercase", color: darkGreen, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, textAlign: "center" }}
          />
        </div>

        {/* Fields */}
        <div style={{ textAlign: "left" }}>
          {[
            { icon: "📅", label: "DATE",  key: "date",  placeholder: "Saturday, 15th June 2025" },
            { icon: "🕐", label: "TIME",  key: "time",  placeholder: "7:00 PM Onwards" },
            { icon: "📍", label: "VENUE", key: "venue", placeholder: "Venue name & full address" },
            { icon: "✉️", label: "RSVP",  key: "rsvp",  placeholder: "+91 9XXXXXXXXX" },
          ].map(({ icon, label, key, placeholder }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(180,146,42,0.1)", border: `1px solid rgba(180,146,42,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1, borderBottom: "1px dashed rgba(150,120,60,0.3)", paddingBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: darkGreen, fontFamily: "'Outfit', sans-serif", textTransform: "uppercase" }}>{label}: </span>
                <Editable
                  value={data[key]}
                  onChange={v => onChange(key, v)}
                  placeholder={placeholder}
                  style={{ fontSize: 12.5, color: "#444", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em", textAlign: "left" }}
                  width="calc(100% - 52px)"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom script */}
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontFamily: "'Great Vibes', 'Dancing Script', cursive", color: "#5a4a2a", marginBottom: 2 }}>
            We look forward to
          </div>
          <p style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: darkGreen, margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Celebrating with you!
          </p>
        </div>

        {/* Bottom divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
          <div style={{ height: "0.8px", width: 32, background: gold, opacity: 0.7 }} />
          <svg width="14" height="12" viewBox="0 0 20 16">
            <path d="M10 0 L12 6 L10 4 L8 6Z" fill={gold} opacity="0.7"/>
            <path d="M10 16 L12 10 L10 12 L8 10Z" fill={gold} opacity="0.7"/>
            <circle cx="10" cy="8" r="1.5" fill={gold}/>
          </svg>
          <div style={{ height: "0.8px", width: 32, background: gold, opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function InvitationCustomizer() {
  const navigate = useNavigate();
  const [data, setData] = useState({ eventTitle: "", date: "", time: "", venue: "", rsvp: "" });
  const [copies, setCopies] = useState(50);
  const [ordered, setOrdered] = useState(false);

  const change = (k, v) => setData(p => ({ ...p, [k]: v }));
  const allFilled = data.date && data.time && data.venue;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE0", fontFamily: font }}>
      <SEO title="Invitation Flyer Customiser — Tendr" description="Customise your botanical invitation flyer." path="/invitation/customize" />
      {/* Load fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@400;500;600;700&family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />

      <HamburgerNav title="Invitation Flyer" />

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>Customise Your Invitation</h1>
          <p style={{ fontSize: 13.5, color: "#7A5535", margin: 0 }}>Click any text on the flyer to edit it directly</p>
        </div>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ── Centred flyer ── */}
          <BotanicalFlyer data={data} onChange={change} />

          {/* ── Controls panel ── */}
          <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 }}>

            {/* Quick fill */}
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 12px" }}>Quick Fill</h3>
              {[
                { key: "eventTitle", label: "Event / Occasion",  placeholder: "e.g. Birthday Celebration" },
                { key: "date",       label: "Date *",             placeholder: "e.g. 15th June 2025" },
                { key: "time",       label: "Time *",             placeholder: "e.g. 7:00 PM Onwards" },
                { key: "venue",      label: "Venue *",            placeholder: "Venue name & address" },
                { key: "rsvp",       label: "RSVP",               placeholder: "Phone or email" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 11 }}>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{label}</label>
                  <input value={data[key]} onChange={e => change(key, e.target.value)} placeholder={placeholder}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            {/* Order */}
            <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Order Printed Copies</h3>
              <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>High-quality prints delivered to you.</p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
                {[25, 50, 100, 200].map(n => (
                  <button key={n} onClick={() => setCopies(n)}
                    style={{ padding: "5px 14px", borderRadius: 100, border: `1.5px solid ${copies === n ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: copies === n ? "#C47A2E" : "#fff", color: copies === n ? "#fff" : "#6B3A1F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    {n}
                  </button>
                ))}
              </div>
              {!allFilled && <p style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 10px", margin: "0 0 10px" }}>Fill Date, Time & Venue to continue</p>}
              {ordered ? (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Request submitted!</div>
                  <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>Our team will confirm printing details.</div>
                </div>
              ) : (
                <button disabled={!allFilled} onClick={() => setOrdered(true)}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: allFilled ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: allFilled ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: font, boxShadow: allFilled ? "0 3px 12px rgba(196,122,46,0.35)" : "none", marginBottom: 8 }}>
                  Book {copies} Printed Copies →
                </button>
              )}
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`You're Invited! ${data.eventTitle ? 'to ' + data.eventTitle : ''}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.venue}\nRSVP: ${data.rsvp}`)}`)}
                style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.07)", color: "#15803d", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                📲 Share via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
