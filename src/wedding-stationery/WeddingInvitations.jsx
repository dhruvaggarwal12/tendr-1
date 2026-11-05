import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WEDDING_STUDIO_TEMPLATES } from "../data/invitationStudioTemplates";
import { WEDDING_FIELDS, WEDDING_FUNCTION_TYPES } from "../data/invitationFieldSchemas";
import { STUDIO_GOOGLE_FONTS_HREF } from "../data/invitationDesignTokens";
import InvitationFlyerEngine from "../components/invitation/InvitationFlyerEngine";
import ResponsiveFlyerStage from "../components/invitation/ResponsiveFlyerStage";
import StylePanel from "../components/invitation/StylePanel";
import { exportAllFlyerImages, exportFlyerPdf } from "../utils/flyerExport";

const font = "'Outfit', sans-serif";
const DRAFT_KEY = "tendr_wedding_invite_draft";
const TABS = [
  { id: "details", label: "Couple & Family" },
  { id: "functions", label: "Functions" },
  { id: "style", label: "Style" },
  { id: "download", label: "Download" },
];

function Thumb({ template }) {
  const scale = 140 / 460;
  return (
    <div style={{ width: 140, height: Math.round(660 * scale), overflow: "hidden", borderRadius: 10, position: "relative", flexShrink: 0, background: "#eee" }}>
      <div style={{ width: 460, height: 660, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
        <InvitationFlyerEngine template={template} data={{ eventTitle: "Ananya & Vikram", date: "15th Dec 2025", time: "6:00 PM", venue: "The Grand Palace, Delhi", rsvp: "+91 9XXXXXXXXX" }} editable={false} />
      </div>
    </div>
  );
}

/* Separate entry point for Tendr's 5 wedding invitation designs — lives
   inside the existing Wedding Stationery sub-app (/wedding/invitations),
   kept apart from that app's paid print-stationery ordering flow and from
   the generic 90-template Invitation Studio, per the brief. */
export default function WeddingInvitations() {
  const [templateId, setTemplateId] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")?.templateId ?? null; } catch { return null; }
  });
  const template = WEDDING_STUDIO_TEMPLATES.find(t => t.id === templateId) || null;

  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")?.data ?? { _show: {} }; } catch { return { _show: {} }; }
  });
  const [functions, setFunctions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")?.functions ?? [{ type: "Wedding Ceremony", date: "", time: "", venue: "" }]; } catch { return [{ type: "Wedding Ceremony", date: "", time: "", venue: "" }]; }
  });
  const [styleOverride, setStyleOverride] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null")?.styleOverride ?? null; } catch { return null; }
  });
  const [exporting, setExporting] = useState("");
  const [tab, setTab] = useState("details");

  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateId, data, functions, styleOverride })); } catch {} }, [templateId, data, functions, styleOverride]);

  const change = (k, v) => setData(p => ({ ...p, [k]: v }));

  // Functions beyond the first render as extra rows on the flyer itself
  // ("Allow multiple event dates, timings and venues in a single wedding
  // invitation" — section 2, Wedding Functions template).
  const extraFunctionRows = functions.slice(1).filter(f => f.date || f.time || f.venue).map((f, i) => ({
    key: `fn_${i}`, label: f.type || `Function ${i + 2}`, placeholder: [f.date, f.time, f.venue].filter(Boolean).join(" · ") || "Date · Time · Venue",
  }));
  useEffect(() => {
    setData(p => {
      const next = { ...p };
      extraFunctionRows.forEach(r => { next[r.key] = [functions[Number(r.key.split("_")[1]) + 1]?.date, functions[Number(r.key.split("_")[1]) + 1]?.time, functions[Number(r.key.split("_")[1]) + 1]?.venue].filter(Boolean).join(" · "); });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(functions)]);

  const updateFn = (i, k, v) => setFunctions(fns => fns.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  const addFn = () => setFunctions(fns => [...fns, { type: WEDDING_FUNCTION_TYPES[Math.min(fns.length, WEDDING_FUNCTION_TYPES.length - 1)], date: "", time: "", venue: "" }]);
  const removeFn = (i) => setFunctions(fns => fns.filter((_, idx) => idx !== i));

  // Primary function (the ceremony) drives the flyer's main date/time/venue.
  useEffect(() => {
    const main = functions[0] || {};
    setData(p => ({ ...p, date: main.date || p.date, time: main.time || p.time, venue: main.venue || p.venue }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functions[0]?.date, functions[0]?.time, functions[0]?.venue]);

  useEffect(() => {
    if (data.brideName || data.groomName) change("eventTitle", `${data.brideName || "Bride"} & ${data.groomName || "Groom"}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.brideName, data.groomName]);

  const runExport = async (fn, label) => {
    setExporting(label);
    try { await fn(template, data, extraFunctionRows, styleOverride, `${data.brideName || "wedding"}-${data.groomName || "invite"}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase()); }
    finally { setExporting(""); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE0", fontFamily: font }}>
      <link href={STUDIO_GOOGLE_FONTS_HREF} rel="stylesheet" />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Wedding Studio</p>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Wedding Invitation Designs</h1>
          <p style={{ fontSize: 13.5, color: "#7A5535" }}>5 designs, built for weddings — separate from Tendr's general Invitation Studio.</p>
          <Link to="/wedding" style={{ fontSize: 12.5, color: "#C47A2E", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>← Back to Wedding Stationery</Link>
        </div>

        {!template ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
            {WEDDING_STUDIO_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplateId(t.id)}
                style={{ background: "#FFFCF5", borderRadius: 14, padding: 12, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 164 }}>
                <Thumb template={t} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2C1A0E", textAlign: "center" }}>{t.name}</span>
                <span style={{ fontSize: 10.5, color: "#9B7450", textAlign: "center", lineHeight: 1.3 }}>{t.tagline}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button onClick={() => setTemplateId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C47A2E", fontSize: 13, fontWeight: 700, marginBottom: 18, fontFamily: font, display: "block" }}>← Choose a different design</button>
            <div style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ position: "sticky", top: 24, width: "100%", maxWidth: 460 }}>
                <ResponsiveFlyerStage>
                  <InvitationFlyerEngine template={template} data={data} fieldSchema={extraFunctionRows} editable onChange={change} styleOverride={styleOverride} />
                </ResponsiveFlyerStage>
              </div>

              <div style={{ width: 340, flexShrink: 0, background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", overflow: "hidden" }}>
                <div style={{ display: "flex" }}>
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      style={{ flex: 1, padding: "13px 2px", border: "none", borderBottom: tab === t.id ? "2.5px solid #C47A2E" : "2.5px solid transparent", background: tab === t.id ? "rgba(196,122,46,0.08)" : "transparent", color: tab === t.id ? "#C47A2E" : "#9B7450", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 20, maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
                  {tab === "details" && (
                    <div>
                      {WEDDING_FIELDS.map(f => (
                        <div key={f.key} style={{ marginBottom: 11 }}>
                          <label style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{f.label}{f.required ? " *" : ""}</label>
                          <input value={data[f.key] || ""} onChange={e => change(f.key, e.target.value)} placeholder={f.placeholder}
                            style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "functions" && (
                    <div>
                      <p style={{ fontSize: 11.5, color: "#9B7450", margin: "0 0 12px" }}>Each with its own date, time & venue.</p>
                      {functions.map((f, i) => (
                        <div key={i} style={{ border: "1px solid rgba(196,122,46,0.2)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <select value={f.type} onChange={e => updateFn(i, "type", e.target.value)} style={{ flex: 1, padding: "6px 8px", borderRadius: 7, border: "1px solid rgba(196,122,46,0.2)", fontSize: 12, fontFamily: font }}>
                              {WEDDING_FUNCTION_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                            </select>
                            {functions.length > 1 && <button onClick={() => removeFn(i)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 13 }}>✕</button>}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <input placeholder="Date" value={f.date} onChange={e => updateFn(i, "date", e.target.value)} style={{ flex: 1, padding: "6px 8px", borderRadius: 7, border: "1px solid rgba(196,122,46,0.2)", fontSize: 12, fontFamily: font }} />
                            <input placeholder="Time" value={f.time} onChange={e => updateFn(i, "time", e.target.value)} style={{ flex: 1, padding: "6px 8px", borderRadius: 7, border: "1px solid rgba(196,122,46,0.2)", fontSize: 12, fontFamily: font }} />
                          </div>
                          <input placeholder="Venue" value={f.venue} onChange={e => updateFn(i, "venue", e.target.value)} style={{ width: "100%", marginTop: 6, padding: "6px 8px", borderRadius: 7, border: "1px solid rgba(196,122,46,0.2)", fontSize: 12, fontFamily: font, boxSizing: "border-box" }} />
                        </div>
                      ))}
                      <button onClick={addFn} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1.5px dashed rgba(196,122,46,0.4)", background: "transparent", color: "#C47A2E", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>+ Add another function</button>
                    </div>
                  )}

                  {tab === "style" && (
                    <StylePanel template={template} styleOverride={styleOverride} onChange={setStyleOverride} bare />
                  )}

                  {tab === "download" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button disabled={!!exporting} onClick={() => runExport(exportAllFlyerImages, "images")}
                        style={{ padding: 9, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: exporting ? "default" : "pointer", fontFamily: font }}>
                        {exporting === "images" ? "Preparing…" : "📲 Download for WhatsApp / Story / Square"}
                      </button>
                      <button disabled={!!exporting} onClick={() => runExport(exportFlyerPdf, "pdf")}
                        style={{ padding: 9, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: exporting ? "default" : "pointer", fontFamily: font }}>
                        {exporting === "pdf" ? "Preparing…" : "🖨️ Download Printable PDF"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
