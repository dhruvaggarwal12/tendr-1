import React from "react";
import Editable from "./Editable";
import { getKit } from "./kits";
import { PALETTES, FONT_PAIRS } from "../../data/invitationDesignTokens";
import tendrLogoImg from "../../assets/logos/tendr-logo-secondary.png";

const ACCENT_ICONS = {
  flourish: "✦", crown: "👑", floral: "🌸", teddy: "🧸", wonderland: "🎩",
  minimalBaby: "☁️", gold: "✨", romantic: "🌹", forever: "♾️", luxury: "💎",
  loveStory: "💌", pastelFloral: "🌷", miracle: "⭐", safari: "🦁", royalBaby: "👑",
  modernBaby: "◇", star: "🌟", blessings: "🪔", clouds: "☁️", pinkBlue: "🎀",
  question: "❓", bigReveal: "🎊", twinkle: "✨", surprise: "🎁", diya: "🪔",
  heritage: "🏺", nameplate: "🔖", home: "🏠", grihaPravesh: "🪔", nest: "🏡",
  architecture: "◇", goldenWelcome: "✨", party: "🎉", weekend: "🌴", socialClub: "♣",
  terrace: "🌃", glam: "💃", tea: "🍵", kitty: "🐾", corporate: "💼", team: "🤝",
  gradCap: "🎓", nextChapter: "📖", medal: "🥇", wildCeleb: "🎉", vip: "🥂",
  farewellDove: "🕊", chapter: "📜", memories: "📷", retire: "🎖", cheers: "🥂",
  diyaRow: "🪔", rangoli: "🌼", splash: "🎨", garba: "💃", dandiya: "🥢",
  leaf: "🍃", ribbon: "🎗️",
};

function resolvePalette(template, override) {
  const id = override?.paletteId || template.paletteId;
  return PALETTES[id] || PALETTES["cream-gold"];
}
function resolveFonts(template, override) {
  const id = override?.fontPairId || template.fontPairId;
  return FONT_PAIRS[id] || FONT_PAIRS["serif-display"];
}

const COMMON_ROWS = [
  { key: "date", label: "DATE", placeholder: "Saturday, 15th June 2025" },
  { key: "time", label: "TIME", placeholder: "7:00 PM Onwards" },
  { key: "endTime", label: "UNTIL", placeholder: "10:00 PM", optional: true },
  { key: "venue", label: "VENUE", placeholder: "Venue name & full address" },
  { key: "rsvp", label: "RSVP", placeholder: "+91 9XXXXXXXXX" },
  { key: "rsvpDeadline", label: "RSVP BY", placeholder: "10th June", optional: true },
  { key: "dressCode", label: "DRESS CODE", placeholder: "Pastels preferred", optional: true },
];

function InfoRow({ row, data, onChange, editable, ink, accent, grid }) {
  const show = data._show || {};
  if (row.optional && !show[row.key] && !data[row.key]) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...(grid ? {} : { marginBottom: 11 }) }}>
      <div style={{ flex: 1, borderBottom: `1px dashed ${accent}55`, paddingBottom: 3 }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: accent, textTransform: "uppercase", fontFamily: "'Outfit',sans-serif" }}>{row.label}: </span>
        <Editable value={data[row.key]} onChange={v => onChange(row.key, v)} placeholder={row.placeholder} editable={editable}
          style={{ fontSize: 12.5, color: ink, fontFamily: "inherit", textAlign: "left" }} width="calc(100% - 6px)" />
      </div>
    </div>
  );
}

/* The single rendering engine for all 95 Invitation Studio templates — a
   template is plain data (kit + palette + fonts + layout), never its own
   component, so a fix here (or to a kit/palette/font table) applies to
   every template at once. Logo position is intentionally identical on
   every layout — the brief requires consistent top-left placement across
   all 95 designs. */
export default function InvitationFlyerEngine({ template, data, fieldSchema = [], editable = true, onChange = () => {}, styleOverride = null }) {
  const p = resolvePalette(template, styleOverride);
  const fonts = resolveFonts(template, styleOverride);
  const layout = template.layoutId;
  const align = styleOverride?.align || (layout === "topBarEditorial" ? "left" : "center");
  const Kit = getKit(template.kitId);
  const icon = ACCENT_ICONS[template.accentIcon] || "✦";
  const extraRows = fieldSchema.map(f => ({ key: f.key, label: f.label.toUpperCase(), placeholder: f.placeholder, optional: !!f.optional }));
  const rows = [...COMMON_ROWS, ...extraRows];
  const grid = layout === "badgeGridRows";

  const heading = (
    <Editable value={data.eventTitle} onChange={v => onChange("eventTitle", v)} placeholder={template.name || "A Special Celebration"} editable={editable}
      style={{ fontSize: layout === "topBarEditorial" ? 32 : 28, fontWeight: 700, color: p.ink, lineHeight: 1.12, textAlign: align, fontFamily: fonts.heading, display: "block" }} />
  );

  const infoRows = (
    <div style={{ textAlign: "left", display: grid ? "grid" : "flex", gridTemplateColumns: grid ? "1fr 1fr" : undefined, columnGap: grid ? 14 : undefined, flexDirection: grid ? undefined : "column" }}>
      {rows.map(r => <InfoRow key={r.key} row={r} data={data} onChange={onChange} editable={editable} ink={p.ink} accent={p.accent} grid={grid} />)}
    </div>
  );

  const message = (data.message || editable) ? (
    <div style={{ marginTop: 18 }}>
      <Editable value={data.message} onChange={v => onChange("message", v)} placeholder="We can't wait to celebrate with you." editable={editable}
        style={{ fontSize: 12.5, color: p.muted, fontStyle: "italic", textAlign: align, fontFamily: fonts.body }} />
    </div>
  ) : null;

  const logo = (
    <img src={tendrLogoImg} alt="tendr" style={{ position: "absolute", top: 16, left: 16, width: 58, height: "auto", zIndex: 10, pointerEvents: "none", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))" }} />
  );

  const eyebrow = (
    <p style={{ fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: p.accent, margin: "0 0 10px", fontWeight: 700, textAlign: align, fontFamily: fonts.label }}>
      {icon} You're Invited
    </p>
  );

  /* ── Split-ribbon: colored band holds the heading, a light card below
     holds the details — distinct composition from the stacked layouts. */
  if (layout === "splitRibbon") {
    return (
      <div style={{ width: 460, minHeight: 660, position: "relative", overflow: "hidden", borderRadius: 3, boxShadow: "0 12px 48px rgba(0,0,0,0.25)", fontFamily: fonts.body }}>
        <Kit palette={p} />
        {logo}
        <div style={{ position: "relative", zIndex: 5, padding: "66px 40px 24px", textAlign: "center", boxSizing: "border-box" }}>
          {eyebrow}
          <div style={{ marginBottom: 22, background: "rgba(255,255,255,0.94)", borderRadius: 22, padding: "26px 22px", boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}>
            {heading}
            <div style={{ marginTop: 18 }}>{infoRows}</div>
          </div>
          {message}
        </div>
      </div>
    );
  }

  const padTop = layout === "topBarEditorial" ? 92 : layout === "cornerFramed" ? 118 : 100;
  return (
    <div style={{ width: 460, minHeight: 660, position: "relative", overflow: "hidden", borderRadius: 3, boxShadow: "0 12px 48px rgba(0,0,0,0.25)", fontFamily: fonts.body, background: p.bg }}>
      <Kit palette={p} />
      {logo}
      <div style={{ position: "relative", zIndex: 5, padding: `${padTop}px 42px 40px`, textAlign: align === "center" ? "center" : "left", boxSizing: "border-box" }}>
        {eyebrow}
        <div style={{ marginBottom: layout === "topBarEditorial" ? 22 : 18 }}>{heading}</div>
        {layout === "topBarEditorial" && <div style={{ width: 54, height: 5, background: p.accent, margin: align === "center" ? "0 auto 24px" : "0 0 24px" }} />}
        {infoRows}
        {message}
      </div>
    </div>
  );
}
