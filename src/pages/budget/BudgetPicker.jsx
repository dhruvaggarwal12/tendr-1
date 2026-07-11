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
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How much does a birthday party cost in Delhi?",
              "acceptedAnswer": { "@type": "Answer", "text": "A birthday party in Delhi NCR typically costs between ₹30,000 and ₹2,00,000 depending on guest count, venue type, and services. A small home birthday for 30–50 guests averages ₹30,000–₹60,000. A banquet hall birthday for 100–150 guests typically runs ₹80,000–₹1,50,000." }
            },
            {
              "@type": "Question",
              "name": "What percentage of my event budget should go to decoration?",
              "acceptedAnswer": { "@type": "Answer", "text": "For most events in Delhi NCR, decoration takes 15–22% of the total budget. Birthdays typically allocate 18%, weddings 12–15%, and corporate events 8–12%. Outdoor events and premium themes may require a higher decoration budget." }
            },
            {
              "@type": "Question",
              "name": "How much should I spend on catering for 100 guests?",
              "acceptedAnswer": { "@type": "Answer", "text": "Catering for 100 guests in Delhi NCR typically costs ₹15,000–₹50,000 depending on menu and service style. A simple North Indian buffet runs ₹150–₹250 per plate. Premium live counter setups cost ₹300–₹500+ per plate. Most planners allocate 25–28% of total budget to food and catering." }
            },
            {
              "@type": "Question",
              "name": "What is the biggest budgeting mistake people make for events?",
              "acceptedAnswer": { "@type": "Answer", "text": "The most common mistake is underestimating catering costs and ignoring last-minute expenses. Always reserve 8–10% of your budget as a contingency. Many people also overspend on decoration early and have too little left for photography and entertainment." }
            }
          ]
        }}
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

        {/* Sample preview — birthday budget at ₹1,00,000 */}
        <div style={{ marginTop: 48, background: "#FFFCF5", borderRadius: 20, padding: "28px 28px 24px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 4px 20px rgba(139,69,19,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C47A2E", margin: 0 }}>Sample Output</p>
            <span style={{ fontSize: 11, color: "#9B7450", background: "rgba(196,122,46,0.08)", padding: "3px 10px", borderRadius: 20 }}>Birthday · ₹1,00,000</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: "6px 0 20px" }}>Here's how your budget gets split</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Venue & Setup", pct: 28, amount: "₹28,000" },
              { label: "Food & Catering", pct: 25, amount: "₹25,000" },
              { label: "Decoration", pct: 18, amount: "₹18,000" },
              { label: "Photography", pct: 12, amount: "₹12,000" },
              { label: "Entertainment", pct: 10, amount: "₹10,000" },
              { label: "Miscellaneous", pct: 7, amount: "₹7,000" },
            ].map(({ label, pct, amount }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: "#2C1A0E", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#9B7450", fontVariantNumeric: "tabular-nums" }}>{amount} <span style={{ color: "#C47A2E", fontWeight: 700 }}>({pct}%)</span></span>
                </div>
                <div style={{ height: 6, background: "rgba(196,122,46,0.12)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * (100 / 28)}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#9B7450", marginTop: 16, marginBottom: 0 }}>Select your event type above to get a personalised split →</p>
        </div>

        {/* Static content for SEO */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="seo-content-grid">
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "24px 22px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>Planning an event in Delhi NCR?</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>Event costs in Delhi NCR vary widely by venue zone, season, and service tier. Venues in South Delhi and Gurugram typically cost 20–40% more than equivalent spaces in Noida or East Delhi. Use our budget tool to plan realistic splits before you start talking to vendors.</p>
          </div>
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "24px 22px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>Why budget before booking?</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>Most overspending happens in the first 3 vendor meetings — before a budget is set. Knowing your decoration limit before calling a decorator prevents upselling. Our tool gives you a category-wise cap so every conversation starts from a position of clarity.</p>
          </div>
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "24px 22px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>How much does a birthday party cost?</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>A home birthday for 30–50 guests in Delhi typically runs ₹25,000–₹55,000. A banquet hall birthday for 100 guests with basic catering and balloon decor runs ₹75,000–₹1,20,000. Premium themes, live entertainment, or photobooth add-ons push costs to ₹1,50,000+.</p>
          </div>
          <div style={{ background: "#FFFCF5", borderRadius: 16, padding: "24px 22px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>What's a good contingency buffer?</h2>
            <p style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>Always keep 8–12% of your total budget unallocated. Last-minute additions — an extra catering tray, a power backup generator, an urgent costume — are almost inevitable. Events rarely run exactly to plan; budgets that leave no room get blown on the day.</p>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:640px){.budget-grid{grid-template-columns:repeat(2,1fr) !important;}}
        @media(max-width:480px){
          .budget-grid{gap:10px !important;}
          .budget-grid button{padding:16px 12px !important;}
          .budget-grid button span:first-child{font-size:26px !important;}
        }
        @media(max-width:600px){.seo-content-grid{grid-template-columns:1fr !important;}}
      `}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
}
