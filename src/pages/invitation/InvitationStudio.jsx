import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolNav from "../../components/ToolNav";
import { OCCASIONS } from "../../data/occasions";
import { INVITATION_STUDIO_TEMPLATES, getStudioTemplatesForOccasion } from "../../data/invitationStudioTemplates";
import InvitationFlyerEngine from "../../components/invitation/InvitationFlyerEngine";
import { getOccasionFields } from "../../data/invitationFieldSchemas";
import { STUDIO_GOOGLE_FONTS_HREF } from "../../data/invitationDesignTokens";

const font = "'Outfit', sans-serif";
const SAMPLE = { eventTitle: "", date: "15th June 2025", time: "7:00 PM", venue: "Venue name & address", rsvp: "+91 9XXXXXXXXX" };

function Thumb({ template, fieldSchema }) {
  const scale = 148 / 460;
  return (
    <div style={{ width: 148, height: Math.round(660 * scale), overflow: "hidden", borderRadius: 10, position: "relative", flexShrink: 0, background: "#eee" }}>
      <div style={{ width: 460, height: 660, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
        <InvitationFlyerEngine template={template} data={SAMPLE} fieldSchema={fieldSchema} editable={false} />
      </div>
    </div>
  );
}

export default function InvitationStudio() {
  const navigate = useNavigate();
  const [occasionId, setOccasionId] = useState(null);
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return INVITATION_STUDIO_TEMPLATES.filter(t => t.occasionId !== "wedding" && (t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q)));
  }, [query]);

  const activeOccasion = occasionId ? OCCASIONS.find(o => o.id === occasionId) : null;
  const activeTemplates = occasionId ? getStudioTemplatesForOccasion(occasionId) : [];

  const openTemplate = (t) => navigate(`/invitation/studio/customize?template=${t.id}`);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Tendr Invitation Studio — 95 Occasion-Matched Invitation Designs | Tendr" description="Pick from 95 professionally designed Tendr invitation flyers, matched to your exact occasion, and share an instant RSVP link." path="/invitation/studio" />
      <link href={STUDIO_GOOGLE_FONTS_HREF} rel="stylesheet" />
      <BasicSpeedDial />
      <ToolNav title="Tendr Invitation Studio" />

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Tendr Invitation Studio</p>
          <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.7rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>Create Your Invitation</h1>
          <p style={{ fontSize: 15, color: "#9B7450" }}>95 designs, 5 for every occasion — matched to yours, Tendr-branded, ready to share.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 26px" }} />
          <input value={query} onChange={e => { setQuery(e.target.value); setOccasionId(null); }} placeholder="Search templates — e.g. 'royal', 'floral', 'minimal'…"
            style={{ width: "100%", maxWidth: 440, padding: "11px 16px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 14, fontFamily: font, outline: "none" }} />
        </div>

        {searchResults ? (
          <TemplateGrid templates={searchResults} onPick={openTemplate} showOccasion />
        ) : activeOccasion ? (
          <>
            <button onClick={() => setOccasionId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C47A2E", fontSize: 13, fontWeight: 700, marginBottom: 18, fontFamily: font }}>← All occasions</button>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>{activeOccasion.icon} {activeOccasion.name}</h2>
            <p style={{ fontSize: 13.5, color: "#9B7450", marginBottom: 24 }}>5 designs for this occasion</p>
            <TemplateGrid templates={activeTemplates} onPick={openTemplate} />
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="studio-occ-grid">
              {OCCASIONS.map(o => (
                <button key={o.id} onClick={() => setOccasionId(o.id)}
                  style={{ background: "#FFFCF5", borderRadius: 16, padding: "22px 14px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                  <span style={{ fontSize: 30 }}>{o.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", lineHeight: 1.3 }}>{o.name}</span>
                  <span style={{ fontSize: 10.5, color: "#C47A2E", fontWeight: 700 }}>5 designs</span>
                </button>
              ))}
              <a href="/wedding/invitations"
                style={{ background: "linear-gradient(135deg,#2A0E14,#3B1220)", borderRadius: 16, padding: "22px 14px", border: "1.5px solid rgba(212,175,94,0.4)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", textDecoration: "none" }}>
                <span style={{ fontSize: 30 }}>💍</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F6E7C9", lineHeight: 1.3 }}>Wedding</span>
                <span style={{ fontSize: 10.5, color: "#D4AF5E", fontWeight: 700 }}>5 designs · Wedding Studio</span>
              </a>
            </div>
          </>
        )}
      </div>
      <style>{`@media(max-width:760px){.studio-occ-grid{grid-template-columns:repeat(3,1fr) !important;}}@media(max-width:480px){.studio-occ-grid{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </div>
  );
}

function TemplateGrid({ templates, onPick, showOccasion }) {
  if (!templates.length) return <p style={{ textAlign: "center", color: "#9B7450", padding: 40 }}>No templates matched — try a different search.</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
      {templates.map(t => {
        const occ = showOccasion ? OCCASIONS.find(o => o.id === t.occasionId) : null;
        return (
          <button key={t.id} onClick={() => onPick(t)}
            style={{ background: "#FFFCF5", borderRadius: 14, padding: 12, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 172 }}>
            <Thumb template={t} fieldSchema={getOccasionFields(t.occasionId)} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2C1A0E", textAlign: "center" }}>{t.name}</span>
            {occ && <span style={{ fontSize: 10.5, color: "#C47A2E" }}>{occ.icon} {occ.name}</span>}
            <span style={{ fontSize: 10.5, color: "#9B7450", textAlign: "center", lineHeight: 1.3 }}>{t.tagline}</span>
          </button>
        );
      })}
    </div>
  );
}
