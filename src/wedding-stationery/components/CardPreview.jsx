import React from "react";

// Decorative SVG elements
const FloralBorder = ({ color }) => (
  <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none" }}>
    <g fill={color} stroke={color} strokeWidth="0.5">
      {/* Corner floral */}
      <circle cx="20" cy="20" r="3" />
      <circle cx="14" cy="28" r="2" />
      <circle cx="28" cy="14" r="2" />
      <line x1="20" y1="20" x2="35" y2="35" strokeWidth="1" />
      <circle cx="180" cy="20" r="3" />
      <circle cx="186" cy="28" r="2" />
      <circle cx="172" cy="14" r="2" />
      <circle cx="20" cy="180" r="3" />
      <circle cx="14" cy="172" r="2" />
      <circle cx="28" cy="186" r="2" />
      <circle cx="180" cy="180" r="3" />
      <circle cx="186" cy="172" r="2" />
      <circle cx="172" cy="186" r="2" />
      {/* Leaf shapes */}
      <ellipse cx="22" cy="22" rx="8" ry="4" transform="rotate(45 22 22)" opacity="0.6" />
      <ellipse cx="178" cy="22" rx="8" ry="4" transform="rotate(-45 178 22)" opacity="0.6" />
      <ellipse cx="22" cy="178" rx="8" ry="4" transform="rotate(-45 22 178)" opacity="0.6" />
      <ellipse cx="178" cy="178" rx="8" ry="4" transform="rotate(45 178 178)" opacity="0.6" />
    </g>
  </svg>
);

const OrnateFrame = ({ color }) => (
  <svg viewBox="0 0 200 280" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <rect x="8" y="8" width="184" height="264" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
    <rect x="12" y="12" width="176" height="256" fill="none" stroke={color} strokeWidth="0.4" opacity="0.4" />
    {/* Corner ornaments */}
    {[[8,8],[192,8],[8,272],[192,272]].map(([cx,cy], i) => (
      <g key={i} transform={`translate(${cx},${cy})`}>
        <circle r="3" fill={color} opacity="0.5" />
        <circle r="6" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
      </g>
    ))}
  </svg>
);

const SimpleLines = ({ color }) => (
  <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
    <div style={{ flex: 1, height: 0.5, background: color, opacity: 0.5 }} />
    <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.5 }} />
    <div style={{ flex: 1, height: 0.5, background: color, opacity: 0.5 }} />
  </div>
);

const OrnateDivider = ({ color }) => (
  <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, margin: "8px 0" }}>
    <div style={{ flex: 1, height: 0.5, background: color, opacity: 0.4 }} />
    <svg width="20" height="10" viewBox="0 0 20 10">
      <path d="M10,1 L12,5 L10,9 L8,5 Z" fill={color} opacity="0.6" />
      <circle cx="2" cy="5" r="1.5" fill={color} opacity="0.4" />
      <circle cx="18" cy="5" r="1.5" fill={color} opacity="0.4" />
    </svg>
    <div style={{ flex: 1, height: 0.5, background: color, opacity: 0.4 }} />
  </div>
);

export default function CardPreview({ design, stationery }) {
  const { palette, fontPairing, fields, showFloral, showMonogram, dividerStyle } = design;
  const { coupleNames, date, time, venue, customMessage } = fields;

  const scale = 0.9;
  const w = stationery.dimensions.width * scale;
  const h = stationery.dimensions.height * scale;

  const Divider = dividerStyle === "ornate"
    ? (props) => <OrnateDivider {...props} />
    : dividerStyle === "simple"
    ? (props) => <SimpleLines {...props} />
    : () => null;

  return (
    <div style={{
      width: w, height: h, minHeight: h,
      background: palette.bg,
      boxShadow: "0 8px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
      borderRadius: 2, position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "20px 18px",
      boxSizing: "border-box",
      transition: "all 0.3s ease",
    }}>
      {/* Background decorations */}
      {showFloral && <FloralBorder color={palette.accent} />}
      <OrnateFrame color={palette.border} />

      {/* Inner content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>

        {/* Top label */}
        <p style={{ fontFamily: fontPairing.body, fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: palette.secondary, margin: 0, fontWeight: 600 }}>
          You Are Cordially Invited To
        </p>

        <Divider color={palette.accent} />

        {/* Monogram */}
        {showMonogram && coupleNames && (
          <div style={{ fontFamily: fontPairing.script, fontSize: 22, color: palette.accent, lineHeight: 1, margin: "2px 0", fontStyle: "italic" }}>
            {coupleNames.split("&").map(n => n.trim()[0]).join(" & ")}
          </div>
        )}

        {/* Couple Names */}
        <div style={{ fontFamily: fontPairing.heading, fontSize: stationery.dimensions.height > 150 ? 20 : 14, color: palette.text, lineHeight: 1.2, margin: "2px 0", fontWeight: 300 }}>
          {coupleNames || "Alexandra & William"}
        </div>

        <Divider color={palette.accent} />

        {/* Stationery type label */}
        <p style={{ fontFamily: fontPairing.body, fontSize: 6.5, letterSpacing: "0.15em", textTransform: "uppercase", color: palette.secondary, margin: "2px 0" }}>
          {stationery.id === "wedding-invitation" ? "Join us for a Special Celebration" :
           stationery.id === "rsvp-card" ? "Kindly Reply By" :
           stationery.id === "save-the-date" ? "Save the Date" :
           stationery.id === "thank-you-card" ? "With Grateful Hearts" :
           stationery.name}
        </p>

        {/* Date */}
        {date && (
          <p style={{ fontFamily: fontPairing.body, fontSize: 8, color: palette.text, margin: "3px 0", letterSpacing: "0.08em" }}>
            {date}
          </p>
        )}

        {/* Time */}
        {time && (
          <p style={{ fontFamily: fontPairing.body, fontSize: 7.5, color: palette.secondary, margin: "1px 0" }}>
            {time}
          </p>
        )}

        {/* Venue */}
        {venue && (
          <>
            <div style={{ width: 20, height: 0.5, background: palette.accent, opacity: 0.6, margin: "2px 0" }} />
            <p style={{ fontFamily: fontPairing.body, fontSize: 7.5, color: palette.secondary, margin: "1px 0", lineHeight: 1.4, textAlign: "center" }}>
              {venue}
            </p>
          </>
        )}

        {/* Custom message */}
        {customMessage && (
          <>
            <Divider color={palette.accent} />
            <p style={{ fontFamily: fontPairing.script, fontSize: stationery.dimensions.height > 150 ? 11 : 8, color: palette.secondary, margin: "2px 0", fontStyle: "italic", lineHeight: 1.4 }}>
              {customMessage}
            </p>
          </>
        )}

        {/* Footer ornament */}
        <div style={{ marginTop: 6 }}>
          <Divider color={palette.accent} />
          <p style={{ fontFamily: fontPairing.body, fontSize: 6, letterSpacing: "0.12em", textTransform: "uppercase", color: palette.accent, margin: "2px 0", opacity: 0.8 }}>
            ✦ {stationery.name} ✦
          </p>
        </div>

      </div>
    </div>
  );
}
