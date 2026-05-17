import React from "react";

/* ─── Botanical SVG Elements ─────────────────────────────────────────── */

// Top-left green leaf cluster (matches the uploaded template)
const TopLeftBotanical = ({ opacity = 1 }) => (
  <svg viewBox="0 0 220 220" style={{ position: "absolute", top: 0, left: 0, width: 180, height: 180, opacity, pointerEvents: "none" }}>
    <g fill="none">
      {/* Main large leaf */}
      <ellipse cx="70" cy="60" rx="35" ry="15" fill="#8FA67A" opacity="0.75" transform="rotate(-40 70 60)" />
      <ellipse cx="70" cy="60" rx="33" ry="13" fill="#A0B888" opacity="0.5" transform="rotate(-40 70 60)" />
      {/* Stem */}
      <path d="M95 85 Q80 100 60 120" stroke="#7A9060" strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* Secondary leaves */}
      <ellipse cx="50" cy="45" rx="28" ry="11" fill="#7A9060" opacity="0.65" transform="rotate(-60 50 45)" />
      <ellipse cx="85" cy="30" rx="22" ry="9" fill="#6B8050" opacity="0.55" transform="rotate(-25 85 30)" />
      <ellipse cx="30" cy="70" rx="25" ry="10" fill="#8FA67A" opacity="0.6" transform="rotate(-75 30 70)" />
      {/* Small accent leaves */}
      <ellipse cx="110" cy="50" rx="16" ry="6" fill="#A0B888" opacity="0.5" transform="rotate(-15 110 50)" />
      <ellipse cx="40" cy="90" rx="18" ry="7" fill="#7A9060" opacity="0.5" transform="rotate(-80 40 90)" />
      {/* Gold branch lines */}
      <path d="M15 15 Q40 30 60 55" stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M20 10 Q35 25 45 50" stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M50 5 L65 45" stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Tiny dots */}
      <circle cx="90" cy="20" r="2" fill="#C9A84C" opacity="0.4" />
      <circle cx="105" cy="35" r="1.5" fill="#C9A84C" opacity="0.35" />
      <circle cx="20" cy="30" r="1.5" fill="#C9A84C" opacity="0.3" />
      <circle cx="75" cy="8" r="2" fill="#C9A84C" opacity="0.35" />
      {/* Watercolor wash */}
      <ellipse cx="55" cy="55" rx="55" ry="50" fill="#E8EEE0" opacity="0.18" />
    </g>
  </svg>
);

// Bottom-right green leaf cluster
const BottomRightBotanical = ({ opacity = 1 }) => (
  <svg viewBox="0 0 220 220" style={{ position: "absolute", bottom: 0, right: 0, width: 180, height: 180, opacity, pointerEvents: "none", transform: "rotate(180deg)" }}>
    <g fill="none">
      <ellipse cx="70" cy="60" rx="35" ry="15" fill="#8FA67A" opacity="0.75" transform="rotate(-40 70 60)" />
      <ellipse cx="70" cy="60" rx="33" ry="13" fill="#A0B888" opacity="0.5" transform="rotate(-40 70 60)" />
      <path d="M95 85 Q80 100 60 120" stroke="#7A9060" strokeWidth="1.5" fill="none" opacity="0.6" />
      <ellipse cx="50" cy="45" rx="28" ry="11" fill="#7A9060" opacity="0.65" transform="rotate(-60 50 45)" />
      <ellipse cx="85" cy="30" rx="22" ry="9" fill="#6B8050" opacity="0.55" transform="rotate(-25 85 30)" />
      <ellipse cx="30" cy="70" rx="25" ry="10" fill="#8FA67A" opacity="0.6" transform="rotate(-75 30 70)" />
      <ellipse cx="110" cy="50" rx="16" ry="6" fill="#A0B888" opacity="0.5" transform="rotate(-15 110 50)" />
      <ellipse cx="40" cy="90" rx="18" ry="7" fill="#7A9060" opacity="0.5" transform="rotate(-80 40 90)" />
      <path d="M15 15 Q40 30 60 55" stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M20 10 Q35 25 45 50" stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.3" />
      <circle cx="90" cy="20" r="2" fill="#C9A84C" opacity="0.4" />
      <circle cx="105" cy="35" r="1.5" fill="#C9A84C" opacity="0.35" />
      <ellipse cx="55" cy="55" rx="55" ry="50" fill="#E8EEE0" opacity="0.18" />
    </g>
  </svg>
);

// Gold border frame
const GoldFrame = ({ accentColor }) => (
  <svg viewBox="0 0 380 540" preserveAspectRatio="none"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    {/* Outer frame */}
    <rect x="12" y="12" width="356" height="516" fill="none" stroke={accentColor} strokeWidth="1.2" opacity="0.7" />
    {/* Inner frame */}
    <rect x="18" y="18" width="344" height="504" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.35" />
    {/* Corner ornaments */}
    {[[12,12],[368,12],[12,528],[368,528]].map(([cx,cy], i) => (
      <g key={i} transform={`translate(${cx},${cy})`}>
        <circle r="3.5" fill={accentColor} opacity="0.6" />
        <circle r="7" fill="none" stroke={accentColor} strokeWidth="0.6" opacity="0.3" />
      </g>
    ))}
  </svg>
);

// Ornamental heart divider (matches the template)
const HeartDivider = ({ color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", justifyContent: "center", margin: "6px 0" }}>
    <div style={{ flex: 1, height: 0.7, background: color, opacity: 0.5 }} />
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
        fill={color} opacity="0.7" />
    </svg>
    <div style={{ flex: 1, height: 0.7, background: color, opacity: 0.5 }} />
  </div>
);

// Small ornamental divider
const SmallDivider = ({ color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", margin: "5px 0" }}>
    <div style={{ width: 30, height: 0.7, background: color, opacity: 0.45 }} />
    <svg width="10" height="10" viewBox="0 0 10 10">
      <path d="M5 0 L5.8 3.5 L9.5 3.5 L6.5 5.7 L7.6 9 L5 7 L2.4 9 L3.5 5.7 L0.5 3.5 L4.2 3.5 Z"
        fill={color} opacity="0.55" />
    </svg>
    <div style={{ width: 30, height: 0.7, background: color, opacity: 0.45 }} />
  </div>
);

// Dashed field line
const FieldLine = ({ label, value, accentColor, textColor, bodyFont, compact = false }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: compact ? 8 : 10, width: "100%" }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "rgba(0,0,0,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontSize: 11 }}>
        {label === "DATE:" ? "📅" : label === "TIME:" ? "🕐" : label === "VENUE:" ? "📍" : "✉️"}
      </span>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: bodyFont, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: textColor, opacity: 0.7, whiteSpace: "nowrap" }}>
          {label}
        </span>
        {value ? (
          <span style={{ fontFamily: bodyFont, fontSize: 9.5, color: textColor, opacity: 0.85, flex: 1, lineHeight: 1.3 }}>
            {value}
          </span>
        ) : (
          <div style={{ flex: 1, height: 0.8, background: textColor, opacity: 0.25, alignSelf: "center", marginBottom: 1, borderStyle: "dashed", borderTop: `1px dashed ${textColor}`, borderOpacity: 0.3 }} />
        )}
      </div>
    </div>
  </div>
);

/* ─── Main Card Preview ───────────────────────────────────────────────── */

export default function CardPreview({ design, stationery, scale = 1 }) {
  const { palette, fontPairing, fields } = design;
  const { coupleNames, date, time, venue, customMessage, rsvp } = fields;

  // Watercolor wash effect colours per palette
  const washColor = {
    "ivory-gold":    "#E8EEE0",
    "sage-cream":    "#D8E8D8",
    "dusty-rose":    "#EEE0DC",
    "midnight-navy": "#D8DDE8",
  }[palette.id] || "#E8EEE0";

  const cardW = 380;
  const cardH = 540;

  return (
    <div style={{
      width: cardW * scale,
      height: cardH * scale,
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: "top left",
      position: "relative",
      background: palette.bg,
      boxShadow: "0 12px 56px rgba(0,0,0,0.2), 0 3px 12px rgba(0,0,0,0.1)",
      borderRadius: 3,
      overflow: "hidden",
      fontFamily: fontPairing.body,
      flexShrink: 0,
    }}>

      {/* Watercolor background wash */}
      <div style={{
        position: "absolute", top: -20, left: -20, width: 200, height: 200,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${washColor} 0%, transparent 70%)`,
        opacity: 0.6,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -20, right: -20, width: 200, height: 200,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${washColor} 0%, transparent 70%)`,
        opacity: 0.6,
        pointerEvents: "none",
      }} />

      {/* Botanical elements */}
      <TopLeftBotanical opacity={0.85} />
      <BottomRightBotanical opacity={0.85} />

      {/* Gold frame */}
      <GoldFrame accentColor={palette.accent} />

      {/* ── Content ── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "38px 44px 28px",
        boxSizing: "border-box",
        zIndex: 2,
      }}>

        {/* Top tagline */}
        <p style={{
          fontFamily: fontPairing.body,
          fontSize: 8, fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: palette.text, opacity: 0.65,
          margin: "0 0 6px", textAlign: "center", lineHeight: 1.6,
        }}>
          You Are<br />Cordially Invited To
        </p>

        {/* Gold ornament */}
        <SmallDivider color={palette.accent} />

        {/* Main heading — "YOU'RE" */}
        <p style={{
          fontFamily: fontPairing.body,
          fontSize: 22, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: palette.text,
          margin: "4px 0 0", textAlign: "center", lineHeight: 1,
        }}>
          {coupleNames ? coupleNames.split("&")[0]?.trim() || "YOU'RE" : "YOU'RE"}
        </p>

        {/* Script "Invited!" / Couple name */}
        <p style={{
          fontFamily: fontPairing.script,
          fontSize: 36,
          color: palette.accent,
          margin: "0 0 4px", textAlign: "center", lineHeight: 1.1,
          fontStyle: fontPairing.id === "cormorant-lato" || fontPairing.id === "playfair-raleway" ? "italic" : "normal",
        }}>
          {coupleNames ? coupleNames.split("&")[1]?.trim() || "Invited!" : "Invited!"}
        </p>

        {/* Heart divider */}
        <HeartDivider color={palette.text} />

        {/* Subtitle */}
        <p style={{
          fontFamily: fontPairing.body,
          fontSize: 8, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: palette.text, opacity: 0.7,
          margin: "0 0 10px", textAlign: "center",
        }}>
          {customMessage || "Join Us For a Special Celebration"}
        </p>

        {/* Spacer */}
        <div style={{ flex: "0 0 8px" }} />

        {/* Fields */}
        <div style={{ width: "100%", padding: "0 4px" }}>
          <FieldLine label="DATE:" value={date} accentColor={palette.accent} textColor={palette.text} bodyFont={fontPairing.body} />
          <FieldLine label="TIME:" value={time} accentColor={palette.accent} textColor={palette.text} bodyFont={fontPairing.body} />
          <FieldLine label="VENUE:" value={venue} accentColor={palette.accent} textColor={palette.text} bodyFont={fontPairing.body} />
          <FieldLine label="RSVP:" value={rsvp} accentColor={palette.accent} textColor={palette.text} bodyFont={fontPairing.body} />
        </div>

        {/* Footer script */}
        <div style={{ marginTop: "auto", textAlign: "center", paddingTop: 6 }}>
          <p style={{
            fontFamily: fontPairing.script,
            fontSize: 14,
            color: palette.text, opacity: 0.75,
            margin: "0 0 2px",
            fontStyle: "italic",
          }}>
            We look forward to
          </p>
          <p style={{
            fontFamily: fontPairing.body,
            fontSize: 8, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: palette.text, opacity: 0.65,
            margin: 0,
          }}>
            Celebrating With You!
          </p>
          <SmallDivider color={palette.accent} />
        </div>
      </div>
    </div>
  );
}
