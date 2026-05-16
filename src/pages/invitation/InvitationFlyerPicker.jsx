import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";

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

const EVENT_TYPES = [
  { id: "dinner-eve",           name: "Dinner Eve",             icon: "🍽️" },
  { id: "family-gathering",     name: "Family Gathering",       icon: "👨‍👩‍👧‍👦" },
  { id: "lunch-celebrations",   name: "Lunch Celebrations",     icon: "🥗" },
  { id: "marriage-ceremony",    name: "Marriage Ceremony",      icon: "💒" },
  { id: "magical-ring-ceremony", name: "Ring Ceremony",         icon: "💍" },
  { id: "birthday-party",       name: "Birthday Party",         icon: "🎂" },
  { id: "marriage-anniversary", name: "Anniversary",            icon: "💕" },
];

const InvitationFlyerPicker = () => {
  const navigate = useNavigate();

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, position: "relative" }}>
      <SEO
        title="Digital Invitation Flyers — Create & Share Beautiful Event Invites | Tendr"
        description="Create stunning digital invitations for birthdays, anniversaries, weddings and more. Pick a template, add your details and share instantly via WhatsApp or email. Coming soon on Tendr."
        path="/invitation"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Invitation Flyers", path: "/invitation" }]}
      />
      {/* Coming Soon overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", background: "rgba(255,248,240,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>💌</div>
        <span style={{ display: "inline-block", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 16px", borderRadius: 100, marginBottom: 18 }}>Coming Soon</span>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>Invitation Flyers</h1>
        <p style={{ fontSize: 16, color: "#7A5535", maxWidth: 440, lineHeight: 1.7, margin: "0 auto 28px" }}>Create and share beautiful digital invitations for every occasion — launching very soon on Tendr.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/" style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>← Back to Home</a>
          <a href="https://wa.me/919211668427?text=Hi%20Tendr%2C%20I%27m%20interested%20in%20the%20Invitation%20Flyers%20feature" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 28px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Notify Me on WhatsApp</a>
        </div>
      </div>
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
      </div>
      <style>{`@media(max-width:640px){.invitation-grid{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
};

export default InvitationFlyerPicker;
