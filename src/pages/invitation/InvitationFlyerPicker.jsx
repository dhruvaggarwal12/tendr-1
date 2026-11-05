import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";
import { FLYER_TEMPLATES } from "../../data/flyerTemplates";

const SAMPLE_DATA = { eventTitle: "Join us for a Special Celebration", date: "Saturday, 15th June", time: "7:00 PM Onwards", venue: "Venue name & address", rsvp: "+91 9XXXXXXXXX" };

/* Fixed-size frame showing a scaled-down, non-interactive render of the
   real template component — no separate preview image asset needed. */
function TemplateThumb({ Component }) {
  const scale = 150 / 460;
  return (
    <div style={{ width: 150, height: Math.round(660 * scale), overflow: "hidden", borderRadius: 10, position: "relative", flexShrink: 0 }}>
      <div style={{ width: 460, height: 660, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
        <Component data={SAMPLE_DATA} editable={false} onChange={() => {}} />
      </div>
    </div>
  );
}

const font = "'Outfit', sans-serif";

const INTRO = {
  toolId: "invitation",
  icon: "💌",
  title: "Tendr Invitation Studio",
  tagline: "95 designs, 5 for every occasion",
  description: "A dedicated design studio inside Tendr — 95 art-directed invitation flyers, 5 matched to each occasion from Birthday to Diwali to Wedding, every one Tendr-branded and ready to personalise.",
  steps: [
    { title: "Pick your occasion", desc: "18 occasions plus a separate Wedding Studio — each with 5 distinct designs." },
    { title: "Personalise it", desc: "Your event details, a curated font & colour palette, all in one editor." },
    { title: "Share or print", desc: "Get a live RSVP link, or download for WhatsApp, Instagram Story or print." },
  ],
};

const InvitationFlyerPicker = () => {
  const navigate = useNavigate();

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, position: "relative" }}>
      <SEO
        title="Tendr Invitation Studio — 95 Occasion-Matched Invitation Designs | Tendr"
        description="95 art-directed Tendr invitation flyers — 5 for every occasion, from Birthday to Diwali to Wedding. Personalise and share an instant RSVP link."
        path="/invitation"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Invitation Studio", path: "/invitation" }]}
      />
      <BasicSpeedDial />
      <ToolNav title="Invitation Studio" />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Tendr Invitation Studio</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>A design studio, built into Tendr</h1>
          <p style={{ fontSize: 15, color: "#9B7450", maxWidth: 560, margin: "0 auto" }}>95 art-directed invitation flyers — 5 for every occasion, from Birthday to Diwali to Wedding — each Tendr-branded, personalisable, and ready to share as a live RSVP link, a WhatsApp image, an Instagram Story or a print-ready PDF.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
        </div>

        <button onClick={() => navigate("/invitation/studio")}
          style={{ display: "block", width: "100%", maxWidth: 520, margin: "0 auto 52px", padding: "20px 22px", borderRadius: 18, border: "none", cursor: "pointer", fontFamily: font, textAlign: "center", background: "linear-gradient(135deg,#2C1A0E,#4A2A14)", boxShadow: "0 8px 28px rgba(44,26,14,0.25)" }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D4AF5E", marginBottom: 6 }}>95 designs · 18 occasions + Wedding</span>
          <span style={{ display: "block", fontSize: 19, fontWeight: 800, color: "#fff" }}>Browse the Studio →</span>
        </button>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 6 }}>Or start from a Tendr design</p>
          <p style={{ fontSize: 13.5, color: "#9B7450", marginBottom: 22 }}>5 signature templates, fully editable, ready to share.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {FLYER_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => navigate(`/invitation/customize?template=${t.id}`)}
                style={{ background: "#FFFCF5", borderRadius: 14, padding: 10, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <TemplateThumb Component={t.Component} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <button onClick={() => navigate("/invitation/customize")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 13, fontWeight: 600, fontFamily: font, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Skip — start with a blank design
          </button>
        </div>
      </div>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
};

export default InvitationFlyerPicker;
