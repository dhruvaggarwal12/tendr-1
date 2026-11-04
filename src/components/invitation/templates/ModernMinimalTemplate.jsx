import React from "react";
import Editable from "../Editable";
import tendrLogoImg from "../../../assets/logos/tendr-logo-secondary.png";

/* Clean editorial layout — ivory/charcoal, one bold accent rule, no
   ornamentation. Deliberately the opposite register from Botanical. */
export default function ModernMinimalTemplate({ data, editable = true, onChange }) {
  const ink = "#1A1A1A";
  const accent = "#2563EB";

  return (
    <div style={{
      width: 460, minHeight: 660,
      background: "#FAFAF8",
      position: "relative",
      padding: "0 0 46px",
      boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Top bar */}
      <div style={{ padding: "22px 40px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${ink}` }}>
        <img src={tendrLogoImg} alt="tendr" style={{ width: 62, height: "auto" }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: accent }}>Invitation</span>
      </div>

      <div style={{ padding: "40px 40px 0", textAlign: "left" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, margin: "0 0 14px" }}>
          You're invited
        </p>

        <div style={{ marginBottom: 26 }}>
          <Editable
            value={data.eventTitle}
            onChange={v => onChange("eventTitle", v)}
            placeholder="A Special Celebration"
            editable={editable}
            width="100%"
            style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.08, color: ink, textAlign: "left" }}
          />
        </div>

        <div style={{ width: 54, height: 6, background: accent, marginBottom: 30 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { label: "DATE",  key: "date",  placeholder: "Saturday, 15th June 2025" },
            { label: "TIME",  key: "time",  placeholder: "7:00 PM onwards" },
            { label: "VENUE", key: "venue", placeholder: "Venue name & full address" },
            { label: "RSVP",  key: "rsvp",  placeholder: "+91 9XXXXXXXXX" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ display: "flex", alignItems: "baseline", gap: 14, borderBottom: "1px solid rgba(26,26,26,0.12)", paddingBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.16em", color: ink, width: 56, flexShrink: 0 }}>{label}</span>
              <Editable
                value={data[key]}
                onChange={v => onChange(key, v)}
                placeholder={placeholder}
                editable={editable}
                width="100%"
                style={{ fontSize: 15, fontWeight: 600, color: "#444", textAlign: "left" }}
              />
            </div>
          ))}
        </div>

        <p style={{ marginTop: 40, fontSize: 13, color: "#666", fontWeight: 500, lineHeight: 1.6 }}>
          We'd love for you to be there — mark the date and join the celebration.
        </p>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: accent }} />
    </div>
  );
}
