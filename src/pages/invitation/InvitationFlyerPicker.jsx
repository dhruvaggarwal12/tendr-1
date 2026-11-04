import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";
import { EVENT_TYPES } from "../../data/invitationTemplates";
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
  title: "Invitation Flyers",
  tagline: "Set the mood before the event",
  description: "Create stunning digital invitations for your event in minutes. Pick your event type, choose a beautiful template, and share instantly via WhatsApp or email.",
  steps: [
    { title: "Pick your event type", desc: "Wedding, birthday, dinner — we have templates for all." },
    { title: "Choose a template", desc: "Beautiful, pre-designed invitation styles." },
    { title: "Customise and share", desc: "Add your details and send to all your guests." },
  ],
};

const InvitationFlyerPicker = () => {
  const navigate = useNavigate();

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, position: "relative" }}>
      <SEO
        title="Digital Invitation Flyers — Create & Share Beautiful Event Invites | Tendr"
        description="Create and customise beautiful digital invitations for birthdays, anniversaries, weddings and more."
        path="/invitation"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Invitation Flyers", path: "/invitation" }]}
      />
      <BasicSpeedDial />
      <ToolNav title="Invitation Flyers" />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Planning Tool</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>What's the occasion?</h1>
          <p style={{ fontSize: 15, color: "#9B7450" }}>Choose your event type and we'll show you the perfect invitation templates.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="invitation-grid">
          {EVENT_TYPES.map(({ id, name, icon }) => (
            <button key={id}
              onClick={() => navigate(`/invitation/templates/${id}`)}
              style={{ background: "#FFFCF5", borderRadius: 16, padding: "22px 14px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(139,69,19,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span style={{ fontSize: 30 }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", lineHeight: 1.3 }}>{name}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 52, textAlign: "center" }}>
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
      <style>{`@media(max-width:640px){.invitation-grid{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
};

export default InvitationFlyerPicker;
