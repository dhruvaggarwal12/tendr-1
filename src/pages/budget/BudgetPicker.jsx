import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";

const font = "'Outfit', sans-serif";

const INTRO = {
  toolId: "budget",
  icon: "💰",
  title: "Budget Allocator",
  tagline: "Every rupee, perfectly planned",
  description: "Enter your total budget and let us show you the ideal split across vendors, venue, catering, and more — based on your event type.",
  steps: [
    { title: "Enter your total budget", desc: "How much are you willing to spend?" },
    { title: "Pick your event type", desc: "Wedding, birthday, corporate — each has different priorities." },
    { title: "See the smart split", desc: "We allocate across categories so nothing gets overspent." },
  ],
};

const EVENT_TYPES = [
  { id: "birthday", label: "Birthday Party", icon: "🎂", desc: "Intimate or grand — plan it right" },
  { id: "anniversary", label: "Anniversary", icon: "💕", desc: "Make it unforgettable" },
  { id: "wedding", label: "Wedding", icon: "💒", desc: "Your perfect day, perfectly planned" },
  { id: "corporate", label: "Corporate Event", icon: "🏢", desc: "Professional and polished" },
  { id: "party", label: "Party", icon: "🎉", desc: "Fun, casual, memorable" },
  { id: "concert", label: "Concert / Show", icon: "🎵", desc: "Large-scale entertainment" },
];

export default function BudgetPicker() {
  const navigate = useNavigate();

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Event Budget Planner — Smart Budget Split for Your Celebration"
        description="Plan your event budget with Tendr's free budget allocator. Get a smart split across decoration, catering, photography and entertainment for birthdays, anniversaries and corporate events in Delhi NCR."
        path="/budget-picker"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Budget Planner", path: "/budget-picker" }]}
      />
      <BasicSpeedDial />
      <ToolNav title="Budget Allocator" />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Planning Tool</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>What are you planning?</h1>
          <p style={{ fontSize: 15, color: "#9B7450" }}>Select your event type and we'll help you allocate your budget smartly.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="budget-grid">
          {EVENT_TYPES.map(({ id, label, icon, desc }) => (
            <button key={id}
              onClick={() => navigate("/budget-allocator", { state: { eventType: id } })}
              style={{ background: "#FFFCF5", borderRadius: 18, padding: "24px 20px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(139,69,19,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span style={{ fontSize: 34 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @media(max-width:640px){.budget-grid{grid-template-columns:repeat(2,1fr) !important;}}
        @media(max-width:480px){
          .budget-grid{gap:10px !important;}
          .budget-grid button{padding:16px 12px !important;}
          .budget-grid button span:first-child{font-size:26px !important;}
        }
      `}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
}
