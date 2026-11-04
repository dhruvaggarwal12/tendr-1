import React from "react";
import Editable from "../Editable";
import tendrLogoImg from "../../../assets/logos/tendr-logo-secondary.png";

/* Decorative dot-grid + radial glow stand-in for a photo background, so
   this template works standalone with no external image required. */
const StarField = () => {
  const dots = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    r: 0.3 + (i % 3) * 0.25,
    o: 0.25 + (i % 4) * 0.12,
  }));
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />)}
    </svg>
  );
};

/* Dark, moody card — generalizes the "photo flyer" register without
   requiring an external image. */
export default function MidnightTemplate({ data, editable = true, onChange }) {
  return (
    <div style={{
      width: 460, minHeight: 660,
      borderRadius: 3,
      position: "relative",
      boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
      overflow: "hidden",
      background: "radial-gradient(ellipse at 30% 20%, #2A2550 0%, #16132E 45%, #0A0818 100%)",
    }}>
      <StarField />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 85%, rgba(124,58,237,0.35) 0%, transparent 60%)" }} />

      <img src={tendrLogoImg} alt="tendr" style={{ position: "absolute", top: 18, left: 18, width: 72, height: "auto", zIndex: 6, pointerEvents: "none", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />

      <div style={{ position: "relative", zIndex: 5, padding: "110px 36px 40px", textAlign: "center", fontFamily: "'Outfit', sans-serif", color: "#fff" }}>
        <p style={{ fontSize: 10.5, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C4B5FD", margin: "0 0 14px", fontWeight: 700 }}>
          You're invited
        </p>

        <div style={{ marginBottom: 26 }}>
          <Editable
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="A Night to Remember"
            editable={editable}
            style={{ fontSize: 28, letterSpacing: "0.01em", color: "#fff", fontWeight: 800, textAlign: "center" }}
          />
        </div>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 13 }}>
          {[
            { icon: "📅", label: "DATE",  key: "date",  placeholder: "Saturday, 15th June 2025" },
            { icon: "🕐", label: "TIME",  key: "time",  placeholder: "7:00 PM Onwards" },
            { icon: "📍", label: "VENUE", key: "venue", placeholder: "Venue name & full address" },
            { icon: "✉️", label: "RSVP",  key: "rsvp",  placeholder: "+91 9XXXXXXXXX" },
          ].map(({ icon, label, key, placeholder }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(196,181,253,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1, borderBottom: "1px dashed rgba(255,255,255,0.25)", paddingBottom: 3 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: "#C4B5FD", textTransform: "uppercase" }}>{label}: </span>
                <Editable
                  value={data[key]}
                  onChange={v => onChange(key, v)}
                  placeholder={placeholder}
                  editable={editable}
                  style={{ fontSize: 13, color: "#fff", textAlign: "left" }}
                  width="calc(100% - 50px)"
                />
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 12.5, color: "#C4B5FD" }}>Dress to impress — see you there ✨</p>
      </div>
    </div>
  );
}
