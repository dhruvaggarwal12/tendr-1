import React from "react";
import { PALETTES, FONT_PAIRS, KIT_PALETTE_OPTIONS, KIT_FONT_OPTIONS } from "../../data/invitationDesignTokens";

const font = "'Outfit', sans-serif";

/* Curated personalization controls — swap within on-brand palette/font
   combinations vetted per kit, plus alignment where the layout allows it.
   Deliberately not a drag editor or an open color/font picker: see the
   Invitation Studio plan for why. */
export default function StylePanel({ template, styleOverride, onChange, bare = false }) {
  const paletteOptions = KIT_PALETTE_OPTIONS[template.kitId] || [template.paletteId];
  const fontOptions = KIT_FONT_OPTIONS[template.kitId] || [template.fontPairId];
  const activePalette = styleOverride?.paletteId || template.paletteId;
  const activeFont = styleOverride?.fontPairId || template.fontPairId;
  const activeAlign = styleOverride?.align || (template.layoutId === "topBarEditorial" ? "left" : "center");
  const isDefault = !styleOverride || (!styleOverride.paletteId && !styleOverride.fontPairId && !styleOverride.align);

  const set = (patch) => onChange({ ...(styleOverride || {}), ...patch });

  return (
    <div style={bare ? { fontFamily: font } : { background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: 20, fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        {!bare && <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>Style</h3>}
        {!isDefault && (
          <button onClick={() => onChange(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 11.5, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2, fontFamily: font, marginLeft: bare ? "auto" : 0 }}>
            Reset to default
          </button>
        )}
      </div>

      <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Color palette</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {paletteOptions.map(pid => {
          const pal = PALETTES[pid];
          const active = pid === activePalette;
          return (
            <button key={pid} onClick={() => set({ paletteId: pid })} title={pid}
              style={{ width: 32, height: 32, borderRadius: "50%", border: active ? "2.5px solid #C47A2E" : "1.5px solid rgba(0,0,0,0.12)", cursor: "pointer", padding: 0, background: `linear-gradient(135deg, ${pal.bg} 50%, ${pal.accent} 50%)` }} />
          );
        })}
      </div>

      <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Typography</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {fontOptions.map(fid => {
          const fp = FONT_PAIRS[fid];
          const active = fid === activeFont;
          return (
            <button key={fid} onClick={() => set({ fontPairId: fid })}
              style={{ textAlign: "left", padding: "8px 10px", borderRadius: 8, border: active ? "1.5px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.15)", background: active ? "rgba(196,122,46,0.08)" : "#fff", cursor: "pointer", fontFamily: fp.heading, fontSize: 14, color: "#2C1A0E" }}>
              Aa — {fid.replace(/-/g, " ")}
            </button>
          );
        })}
      </div>

      {template.layoutId !== "splitRibbon" && (
        <>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Text alignment</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["center", "left"].map(a => (
              <button key={a} onClick={() => set({ align: a })}
                style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: activeAlign === a ? "1.5px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.15)", background: activeAlign === a ? "rgba(196,122,46,0.08)" : "#fff", color: "#2C1A0E", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font, textTransform: "capitalize" }}>
                {a}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
