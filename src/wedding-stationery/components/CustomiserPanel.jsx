import React from "react";
import { PALETTES } from "../data/palettes";
import { FONT_PAIRINGS } from "../data/fonts";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 400, color: "#1C1C1C", margin: "0 0 14px", letterSpacing: "0.04em", borderBottom: "1px solid #EDE6D8", paddingBottom: 8 }}>
      {title}
    </h4>
    {children}
  </div>
);

const Label = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9B8C78", margin: "0 0 8px" }}>
    {children}
  </p>
);

export default function CustomiserPanel({ design, onChange, stationery }) {
  const { palette, fontPairing, fields, showFloral, showMonogram, dividerStyle } = design;

  const setField = (key, val) => onChange({ ...design, fields: { ...design.fields, [key]: val } });

  const FIELD_LIMITS = { coupleNames: 40, date: 30, time: 20, venue: 60, customMessage: 80, rsvp: 40 };
  const FIELD_LABELS = { coupleNames: "Couple Names (Name 1 & Name 2)", date: "Date", time: "Time", venue: "Venue", customMessage: "Join Us Line", rsvp: "RSVP Contact" };
  const FIELD_PLACEHOLDERS = {
    coupleNames: "Alexandra & William",
    date: "Saturday, 14 June 2025",
    time: "4:30 in the afternoon",
    venue: "The Grand Estate, Mumbai",
    customMessage: "Join Us For a Special Celebration",
    rsvp: "rsvp@example.com · +91 98765 43210",
  };
  const FIELD_HINTS = {
    coupleNames: "First name shows at top, name after & shows in script",
  };

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>

      {/* Colour Palette */}
      <Section title="Colour Palette">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PALETTES.map(p => (
            <button key={p.id} onClick={() => onChange({ ...design, palette: p })}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                border: palette.id === p.id ? "2px solid #C9A84C" : "1.5px solid #EDE6D8",
                borderRadius: 6, background: palette.id === p.id ? "rgba(201,168,76,0.06)" : "#fff",
                cursor: "pointer", transition: "all 0.15s", width: "100%", textAlign: "left",
                fontFamily: "'Lato', sans-serif",
              }}>
              <div style={{ display: "flex", gap: 3 }}>
                {p.preview.map((col, i) => (
                  <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: col, border: "1px solid rgba(0,0,0,0.08)" }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1C" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#9B8C78" }}>{p.description}</div>
              </div>
              {palette.id === p.id && <span style={{ marginLeft: "auto", color: "#C9A84C", fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* Font Pairing */}
      <Section title="Typography">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FONT_PAIRINGS.map(f => (
            <button key={f.id} onClick={() => onChange({ ...design, fontPairing: f })}
              style={{
                padding: "12px 14px", border: fontPairing.id === f.id ? "2px solid #C9A84C" : "1.5px solid #EDE6D8",
                borderRadius: 6, background: fontPairing.id === f.id ? "rgba(201,168,76,0.06)" : "#fff",
                cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                fontFamily: "'Lato', sans-serif",
              }}>
              <div style={{ fontFamily: f.heading, fontSize: 15, color: "#1C1C1C", marginBottom: 2 }}>{f.name.split("+")[0].trim()}</div>
              <div style={{ fontFamily: f.body, fontSize: 11, color: "#9B8C78" }}>{f.description}</div>
              {fontPairing.id === f.id && <span style={{ float: "right", color: "#C9A84C", fontSize: 12 }}>✓ Selected</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* Text Fields */}
      <Section title="Your Details">
        {stationery.fields.map(fieldKey => (
          <div key={fieldKey} style={{ marginBottom: 14 }}>
            <Label>{FIELD_LABELS[fieldKey]}</Label>
            {fieldKey === "customMessage" ? (
              <textarea
                value={fields[fieldKey] || ""}
                onChange={e => setField(fieldKey, e.target.value.slice(0, FIELD_LIMITS[fieldKey]))}
                placeholder={FIELD_PLACEHOLDERS[fieldKey]}
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
                  border: "1.5px solid #EDE6D8", fontFamily: "'Lato', sans-serif",
                  color: "#1C1C1C", background: "#FDFAF6", resize: "vertical",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            ) : (
              <input
                type="text"
                value={fields[fieldKey] || ""}
                onChange={e => setField(fieldKey, e.target.value.slice(0, FIELD_LIMITS[fieldKey]))}
                placeholder={FIELD_PLACEHOLDERS[fieldKey]}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
                  border: "1.5px solid #EDE6D8", fontFamily: "'Lato', sans-serif",
                  color: "#1C1C1C", background: "#FDFAF6",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
              {FIELD_HINTS[fieldKey] ? (
                <p style={{ fontSize: 10, color: "#C9A84C", margin: 0, fontStyle: "italic" }}>{FIELD_HINTS[fieldKey]}</p>
              ) : <span />}
              <p style={{ fontSize: 10, color: "#B8A898", margin: 0 }}>
                {(fields[fieldKey] || "").length}/{FIELD_LIMITS[fieldKey]}
              </p>
            </div>
          </div>
        ))}
      </Section>

      {/* Decorative Options */}
      <Section title="Decorative Elements">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "showFloral", label: "Floral Border", value: showFloral },
            { key: "showMonogram", label: "Monogram Initials", value: showMonogram },
          ].map(({ key, label, value }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#1C1C1C" }}>{label}</span>
              <button
                onClick={() => onChange({ ...design, [key]: !value })}
                style={{
                  width: 42, height: 24, borderRadius: 100, border: "none",
                  background: value ? "#C9A84C" : "#D4C8B8", cursor: "pointer",
                  position: "relative", transition: "background 0.2s",
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, left: value ? 21 : 3,
                  transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }} />
              </button>
            </div>
          ))}

          <div>
            <Label>Divider Style</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {["none", "simple", "ornate"].map(style => (
                <button key={style} onClick={() => onChange({ ...design, dividerStyle: style })}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 12,
                    border: dividerStyle === style ? "2px solid #C9A84C" : "1.5px solid #EDE6D8",
                    background: dividerStyle === style ? "rgba(201,168,76,0.06)" : "#fff",
                    cursor: "pointer", textTransform: "capitalize", color: "#1C1C1C",
                    fontFamily: "'Lato', sans-serif",
                  }}>
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
