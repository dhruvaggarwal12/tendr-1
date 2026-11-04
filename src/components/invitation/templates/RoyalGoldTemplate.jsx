import React from "react";
import Editable from "../Editable";
import tendrLogoImg from "../../../assets/logos/tendr-logo-secondary.png";

const gold = "#D4AF5E";

const CornerMotif = ({ corner }) => {
  const pos = {
    tl: { top: 14, left: 14 },
    tr: { top: 14, right: 14, transform: "scaleX(-1)" },
    bl: { bottom: 14, left: 14, transform: "scaleY(-1)" },
    br: { bottom: 14, right: 14, transform: "scale(-1,-1)" },
  }[corner];
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ position: "absolute", ...pos, pointerEvents: "none" }}>
      <path d="M2 2 L2 34 Q2 10 34 2 Z" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.8" />
      <path d="M2 2 L20 2 M2 2 L2 20" stroke={gold} strokeWidth="1.5" />
      <circle cx="2" cy="2" r="3" fill={gold} />
      <path d="M8 8 Q 20 8 20 20" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.6" />
    </svg>
  );
};

/* Jewel-tone, foil-frame design — the festive/Indian-wedding register. */
export default function RoyalGoldTemplate({ data, editable = true, onChange }) {
  return (
    <div style={{
      width: 460, minHeight: 660,
      background: "linear-gradient(160deg, #2A0E14 0%, #3B1220 55%, #230B10 100%)",
      position: "relative",
      padding: "50px 46px",
      boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
      overflow: "hidden",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <div style={{ position: "absolute", inset: 16, border: `1px solid ${gold}`, opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 22, border: `0.5px solid ${gold}`, opacity: 0.3, pointerEvents: "none" }} />
      <CornerMotif corner="tl" /><CornerMotif corner="tr" /><CornerMotif corner="bl" /><CornerMotif corner="br" />

      <img src={tendrLogoImg} alt="tendr" style={{ position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)", width: 72, height: "auto", zIndex: 6, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }} />

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", marginTop: 56 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: gold, margin: "0 0 16px", fontWeight: 600 }}>
          With great joy we invite you to
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ height: "1px", width: 50, background: gold, opacity: 0.6 }} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></svg>
          <div style={{ height: "1px", width: 50, background: gold, opacity: 0.6 }} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <Editable
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="A Royal Celebration"
            editable={editable}
            style={{ fontSize: 32, fontWeight: 700, letterSpacing: "0.01em", color: "#F6E7C9", lineHeight: 1.2, textAlign: "center" }}
          />
        </div>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: "📅", label: "DATE",  key: "date",  placeholder: "Saturday, 15th June 2025" },
            { icon: "🕐", label: "TIME",  key: "time",  placeholder: "7:00 PM Onwards" },
            { icon: "📍", label: "VENUE", key: "venue", placeholder: "Venue name & full address" },
            { icon: "✉️", label: "RSVP",  key: "rsvp",  placeholder: "+91 9XXXXXXXXX" },
          ].map(({ icon, label, key, placeholder }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, opacity: 0.85 }}>
                {icon}
              </div>
              <div style={{ flex: 1, borderBottom: `1px dashed rgba(212,175,94,0.35)`, paddingBottom: 3 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: gold, textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>{label}: </span>
                <Editable
                  value={data[key]}
                  onChange={v => onChange(key, v)}
                  placeholder={placeholder}
                  editable={editable}
                  style={{ fontSize: 13, color: "#F0E2CC", fontFamily: "'Outfit', sans-serif", textAlign: "left" }}
                  width="calc(100% - 50px)"
                />
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 30, fontSize: 12.5, color: gold, opacity: 0.8, fontStyle: "italic" }}>
          Your presence will make it complete
        </p>
      </div>
    </div>
  );
}
