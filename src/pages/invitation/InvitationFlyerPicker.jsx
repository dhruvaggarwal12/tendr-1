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
  // Redirect directly to the customizer — skip the event type picker for now
  React.useEffect(() => { navigate("/invitation/customize", { replace: true }); }, []);
  return null;

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
      </div>
      <style>{`@media(max-width:640px){.invitation-grid{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
};

export default InvitationFlyerPicker;
