import React from "react";

const font = "'Outfit', sans-serif";

export default function TalkToTendrStrip({ onTalk, serviceType }) {
  const label = serviceType ? `${serviceType.toLowerCase()} vendor` : "vendor";
  return (
    <div style={{ margin: "28px 0 8px", padding: "18px 22px", borderRadius: 16, background: "linear-gradient(135deg, rgba(196,122,46,0.07), rgba(204,171,74,0.04))", border: "1.5px solid rgba(196,122,46,0.2)", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>
            Can't find the right {label}?
          </div>
          <div style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.5 }}>
            Tell us what you need — our team will personally find the best match for your event.
          </div>
        </div>
        <button
          onClick={onTalk}
          style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 3px 12px rgba(196,122,46,0.28)" }}
        >
          💬 Talk to Tendr Team
        </button>
      </div>
    </div>
  );
}
