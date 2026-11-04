import React from "react";
import Editable from "../Editable";
import tendrLogoImg from "../../../assets/logos/tendr-logo-secondary.png";

const Confetti = () => {
  const shapes = [
    [8,10,"#fff",0], [85,8,"#FFD66B",45], [15,88,"#FFD66B",20], [90,85,"#fff",60],
    [50,6,"#fff",15], [6,50,"#FFD66B",0], [94,50,"#fff",30], [48,94,"#FFD66B",10],
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {shapes.map(([x,y,c,r],i) => (
        <rect key={i} x={x} y={y} width="2.4" height="4" rx="0.6" fill={c} opacity="0.55" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {[[20,20],[75,25],[30,75],[70,70]].map(([x,y],i) => (
        <circle key={`c${i}`} cx={x} cy={y} r="1" fill="#fff" opacity="0.5" />
      ))}
    </svg>
  );
};

const Balloon = ({ x, color }) => (
  <svg width="34" height="60" viewBox="0 0 34 60" style={{ position: "absolute", top: -6, left: x, pointerEvents: "none" }}>
    <ellipse cx="17" cy="20" rx="16" ry="20" fill={color} opacity="0.9" />
    <path d="M17 40 Q14 44 17 48 Q20 44 17 40" fill={color} opacity="0.9" />
    <line x1="17" y1="48" x2="17" y2="60" stroke={color} strokeWidth="1" opacity="0.6" />
  </svg>
);

/* Warm gradient, playful rounded type, balloon/confetti accents — the
   birthday / kitty-party register. */
export default function FestiveConfettiTemplate({ data, editable = true, onChange }) {
  const ink = "#3A1410";

  return (
    <div style={{
      width: 460, minHeight: 660,
      background: "linear-gradient(145deg, #FF8A5B 0%, #FF6F91 50%, #FFB06B 100%)",
      position: "relative",
      padding: "0 0 40px",
      boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif",
      borderRadius: 3,
    }}>
      <Confetti />
      <Balloon x={30} color="#FFD66B" />
      <Balloon x={60} color="#FFFFFF" />
      <Balloon x={370} color="#FFFFFF" />
      <Balloon x={400} color="#FFD66B" />

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "36px 40px 0" }}>
        <img src={tendrLogoImg} alt="tendr" style={{ width: 72, height: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))", marginBottom: 18 }} />

        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.22)", borderRadius: 100, padding: "6px 18px", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff" }}>You're invited!</span>
        </div>

        <div style={{ marginBottom: 24, background: "rgba(255,255,255,0.92)", borderRadius: 24, padding: "28px 24px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
          <Editable
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="Let's Celebrate!"
            editable={editable}
            style={{ fontSize: 30, fontWeight: 900, color: "#E8456B", lineHeight: 1.15, textAlign: "center", marginBottom: 20, display: "block" }}
          />

          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 13 }}>
            {[
              { icon: "📅", label: "DATE",  key: "date",  placeholder: "Saturday, 15th June 2025" },
              { icon: "🕐", label: "TIME",  key: "time",  placeholder: "7:00 PM Onwards" },
              { icon: "📍", label: "VENUE", key: "venue", placeholder: "Venue name & full address" },
              { icon: "🎁", label: "RSVP",  key: "rsvp",  placeholder: "+91 9XXXXXXXXX" },
            ].map(({ icon, label, key, placeholder }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF3EC", borderRadius: 14, padding: "9px 12px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FF6F91", textTransform: "uppercase" }}>{label}</div>
                  <Editable
                    value={data[key]}
                    onChange={v => onChange(key, v)}
                    placeholder={placeholder}
                    editable={editable}
                    style={{ fontSize: 13, fontWeight: 700, color: ink, textAlign: "left" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#fff", fontWeight: 700, margin: 0 }}>Can't wait to party with you! 🎉</p>
      </div>
    </div>
  );
}
