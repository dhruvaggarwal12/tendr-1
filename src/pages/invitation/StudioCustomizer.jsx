import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import { getStudioTemplate } from "../../data/invitationStudioTemplates";
import { getOccasionFields, COMMON_FIELDS } from "../../data/invitationFieldSchemas";
import { getOccasionById } from "../../data/occasions";
import { STUDIO_GOOGLE_FONTS_HREF } from "../../data/invitationDesignTokens";
import InvitationFlyerEngine from "../../components/invitation/InvitationFlyerEngine";
import StylePanel from "../../components/invitation/StylePanel";
import { exportAllFlyerImages, exportFlyerPdf } from "../../utils/flyerExport";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const TABS = [
  { id: "details", label: "Details" },
  { id: "style", label: "Style" },
  { id: "download", label: "Download" },
  { id: "share", label: "Share" },
];

export default function StudioCustomizer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector(s => s.auth || {});
  const templateId = searchParams.get("template");
  const template = getStudioTemplate(templateId);
  const occasion = template ? getOccasionById(template.occasionId) : null;
  const occasionFields = template ? getOccasionFields(template.occasionId) : [];
  const fields = [...COMMON_FIELDS, ...occasionFields];

  const draftKey = `tendr_studio_draft_${templateId || "none"}`;
  const [data, setData] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(draftKey) || "null"); return s?.data ?? { hostName: user?.name || "", _show: {} }; } catch { return { hostName: user?.name || "", _show: {} }; }
  });
  const [styleOverride, setStyleOverride] = useState(() => {
    try { return JSON.parse(localStorage.getItem(draftKey) || "null")?.styleOverride ?? null; } catch { return null; }
  });
  const [createdInvite, setCreatedInvite] = useState(() => {
    try { return JSON.parse(localStorage.getItem(draftKey) || "null")?.createdInvite ?? null; } catch { return null; }
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [exporting, setExporting] = useState("");
  const [tab, setTab] = useState("details");

  const change = (k, v) => { setData(p => ({ ...p, [k]: v })); setCreatedInvite(null); };
  const toggleShow = (k) => setData(p => ({ ...p, _show: { ...p._show, [k]: !p._show?.[k] } }));

  useEffect(() => {
    try { localStorage.setItem(draftKey, JSON.stringify({ data, styleOverride, createdInvite })); } catch {}
  }, [data, styleOverride, createdInvite, draftKey]);

  if (!template) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, flexDirection: "column", gap: 14 }}>
        <p style={{ color: "#9B7450" }}>Template not found.</p>
        <Link to="/invitation/studio" style={{ color: "#C47A2E", fontWeight: 700 }}>← Back to the Studio</Link>
      </div>
    );
  }

  const allFilled = data.date && data.time && data.venue && data.hostName;

  const createInvite = async () => {
    if (!allFilled || creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch(`${BASE_URL}/house-party/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyName: data.eventTitle || template.name,
          hostName: data.hostName,
          date: data.date,
          time: data.time,
          location: data.venue,
          note: data.rsvp,
          templateImage: "",
          templateId: `studio/${template.id}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create invite");
      setCreatedInvite({ inviteId: json.inviteId, link: `${BASE_URL}/house-party/invite/${json.inviteId}/share` });
      if (token) {
        (async () => {
          try {
            const partyRes = await fetch(`${BASE_URL}/parties`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              credentials: "include",
              body: JSON.stringify({ eventName: data.eventTitle || template.name, eventDate: data.date, venue: data.venue }),
            });
            const partyJson = await partyRes.json();
            if (!partyRes.ok || !partyJson.party?._id) return;
            await fetch(`${BASE_URL}/parties/${partyJson.party._id}/link`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              credentials: "include",
              body: JSON.stringify({ type: "invite", id: json.inviteId }),
            });
          } catch {}
        })();
      }
    } catch (e) {
      setCreateError(e.message || "Something went wrong — please try again");
    } finally {
      setCreating(false);
    }
  };

  const waText = createdInvite
    ? `You're Invited! ${data.eventTitle ? "to " + data.eventTitle : ""}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.venue}\n\nPlease RSVP here: ${createdInvite.link}`
    : `You're Invited! ${data.eventTitle ? "to " + data.eventTitle : ""}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.venue}${data.rsvp ? `\nRSVP: ${data.rsvp}` : ""}`;

  const runExport = async (fn, label) => {
    setExporting(label);
    try { await fn(template, data, occasionFields, styleOverride, (data.eventTitle || template.name).replace(/[^a-z0-9]+/gi, "-").toLowerCase()); }
    finally { setExporting(""); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE0", fontFamily: font }}>
      <SEO title={`Customise "${template.name}" — Tendr Invitation Studio`} description="Personalise your Tendr invitation flyer and get a shareable RSVP link." path="/invitation/studio/customize" />
      <link href={STUDIO_GOOGLE_FONTS_HREF} rel="stylesheet" />
      <HamburgerNav title="Invitation Studio" />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>{template.name}</h1>
          <p style={{ fontSize: 13.5, color: "#7A5535", margin: 0 }}>{occasion ? `${occasion.icon} ${occasion.name} · ` : ""}{template.tagline}</p>
          <Link to="/invitation/studio" style={{ fontSize: 12.5, color: "#C47A2E", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Choose a different design</Link>
        </div>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ position: "sticky", top: 24 }}>
            <InvitationFlyerEngine template={template} data={data} fieldSchema={occasionFields} editable onChange={change} styleOverride={styleOverride} />
          </div>

          <div style={{ width: 340, flexShrink: 0, background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ flex: 1, padding: "13px 4px", border: "none", borderBottom: tab === t.id ? "2.5px solid #C47A2E" : "2.5px solid transparent", background: tab === t.id ? "rgba(196,122,46,0.08)" : "transparent", color: tab === t.id ? "#C47A2E" : "#9B7450", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 20, maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
              {tab === "details" && (
                <div>
                  {fields.map(f => (
                    <div key={f.key} style={{ marginBottom: 11 }}>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span>{f.label}{f.required ? " *" : ""}</span>
                        {f.optional && (
                          <label style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 600, textTransform: "none", letterSpacing: 0, fontSize: 10, cursor: "pointer" }}>
                            <input type="checkbox" checked={!!data._show?.[f.key]} onChange={() => toggleShow(f.key)} /> show
                          </label>
                        )}
                      </label>
                      <input value={data[f.key] || ""} onChange={e => change(f.key, e.target.value)} placeholder={f.placeholder}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              )}

              {tab === "style" && (
                <StylePanel template={template} styleOverride={styleOverride} onChange={setStyleOverride} bare />
              )}

              {tab === "download" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button disabled={!!exporting} onClick={() => runExport(exportAllFlyerImages, "images")}
                    style={{ padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: exporting ? "default" : "pointer", fontFamily: font }}>
                    {exporting === "images" ? "Preparing…" : "📲 Download for WhatsApp / Story / Square"}
                  </button>
                  <button disabled={!!exporting} onClick={() => runExport(exportFlyerPdf, "pdf")}
                    style={{ padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: exporting ? "default" : "pointer", fontFamily: font }}>
                    {exporting === "pdf" ? "Preparing…" : "🖨️ Download Printable PDF"}
                  </button>
                  <button onClick={() => { navigator.clipboard?.writeText(waText); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1800); }}
                    style={{ padding: "9px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "transparent", color: "#9B7450", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    {linkCopied ? "Copied!" : "Copy invitation message"}
                  </button>
                </div>
              )}

              {tab === "share" && (
                <div>
                  <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>Get a link guests can open to RSVP — no account needed, responses update live.</p>

                  {!allFilled && <p style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 10px", margin: "0 0 10px" }}>Fill your name, Date, Time & Venue in the Details tab to continue</p>}
                  {createError && <p style={{ fontSize: 11, color: "#991B1B", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", margin: "0 0 10px" }}>{createError}</p>}

                  {createdInvite ? (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: 12, textAlign: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Invite created!</div>
                        <div style={{ fontSize: 11, color: "#9B7450", marginTop: 3 }}>Share this link — guests RSVP instantly.</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <input readOnly value={createdInvite.link} onFocus={e => e.target.select()}
                          style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 11.5, fontFamily: font, color: "#6B3A1F", background: "#fff" }} />
                        <button onClick={() => { navigator.clipboard?.writeText(createdInvite.link); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1800); }}
                          style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: linkCopied ? "rgba(196,122,46,0.15)" : "#fff", color: "#C47A2E", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                          {linkCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <button onClick={() => navigate(`/house-party/invite/${createdInvite.inviteId}`)}
                        style={{ width: "100%", padding: 9, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        View Live RSVPs →
                      </button>
                    </div>
                  ) : (
                    <button disabled={!allFilled || creating} onClick={createInvite}
                      style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: allFilled ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: allFilled ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 800, cursor: allFilled ? "pointer" : "not-allowed", fontFamily: font, boxShadow: allFilled ? "0 3px 12px rgba(196,122,46,0.35)" : "none", marginBottom: 8 }}>
                      {creating ? "Creating…" : "Create Invite & Get RSVP Link →"}
                    </button>
                  )}

                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`)}
                    style={{ width: "100%", padding: 9, borderRadius: 10, border: "1.5px solid rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.07)", color: "#15803d", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    📲 Share via WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
