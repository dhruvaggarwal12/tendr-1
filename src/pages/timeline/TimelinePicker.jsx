import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";

const font = "'Outfit', sans-serif";

const INTRO = {
  toolId: "timeline",
  icon: "⏱️",
  title: "Event Timeline",
  tagline: "Every milestone, perfectly timed",
  description: "Plan your event day-by-day with a visual timeline. Know exactly what needs to happen and when — so nothing catches you off guard.",
  steps: [
    { title: "Enter your event date", desc: "Set the target date for your event." },
    { title: "Add milestones", desc: "Venue booking, vendor calls, invites — all tracked." },
    { title: "Stay on schedule", desc: "Check off tasks as your event day approaches." },
  ],
};

const EVENT_TYPES = [
  { id: "birthday", label: "Birthday Party", icon: "🎂" },
  { id: "wedding", label: "Wedding", icon: "💒" },
  { id: "anniversary", label: "Anniversary", icon: "💕" },
  { id: "corporate", label: "Corporate Event", icon: "🏢" },
  { id: "party", label: "Party / Get-together", icon: "🎉" },
  { id: "custom", label: "Custom Event", icon: "✨" },
];

export default function TimelinePicker() {
  const navigate = useNavigate();

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Event Timeline Planner — Plan Your Celebration Schedule"
        description="Create a day-by-day event timeline for birthdays, anniversaries, corporate events and more. Free planning tool to track milestones, vendor deadlines and key tasks for your celebration in Delhi NCR."
        path="/timeline-picker"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Timeline Planner", path: "/timeline-picker" }]}
      />
      <BasicSpeedDial />
      <ToolNav title="Event Timeline" />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "52px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Planning Tool</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>What kind of event?</h1>
          <p style={{ fontSize: 15, color: "#9B7450" }}>Pick your event type and we'll build the right timeline for you.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="timeline-grid">
          {EVENT_TYPES.map(({ id, label, icon }) => (
            <button key={id}
              onClick={() => navigate("/prebuilt-timeline")}
              style={{ background: "#FFFCF5", borderRadius: 16, padding: "24px 16px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(139,69,19,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span style={{ fontSize: 32 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={() => navigate("/timeline")}
            style={{ background: "transparent", border: "none", color: "#9B7450", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>
            Or build a custom timeline from scratch →
          </button>
        </div>
      </div>
      <style>{`@media(max-width:640px){.timeline-grid{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
}
