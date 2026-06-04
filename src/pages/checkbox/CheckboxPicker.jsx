import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";

const font = "'Outfit', sans-serif";

const INTRO = {
  toolId: "checklist",
  icon: "✅",
  title: "Event Checklist",
  tagline: "Never miss a detail",
  description: "Stay on top of every task with a personalised event checklist. Track vendors, logistics, and deadlines all in one place.",
  steps: [
    { title: "Choose checklist type", desc: "Prebuilt for speed, Custom for full control." },
    { title: "Pick your event type", desc: "Birthday, wedding, corporate — pre-filled tasks for each." },
    { title: "Tick things off as you go", desc: "Track progress and stay stress-free." },
  ],
};

const EVENT_TYPES = [
  { id: "birthday",    label: "Birthday Party",        icon: "🎂" },
  { id: "wedding",     label: "Wedding",               icon: "💒" },
  { id: "anniversary", label: "Anniversary",           icon: "💕" },
  { id: "prewedding",  label: "Pre-Wedding Function",  icon: "💍" },
  { id: "party",       label: "Party / Get-together",  icon: "🎉" },
  { id: "corporate",   label: "Corporate Event",        icon: "🏢" },
  { id: "custom",      label: "Custom Event",           icon: "✨" },
];

export default function CheckboxPicker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = type selection, 2 = event type (prebuilt only)

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Event Checklist Planner — Choose Your Style"
        description="Pick a prebuilt or custom event checklist for birthdays, anniversaries, corporate events and more."
        path="/checklist-picker"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Checklist Planner", path: "/checklist-picker" }]}
      />
      <BasicSpeedDial />
      <ToolNav title="Event Checklist" />

      {/* Step 1: Choose checklist type */}
      {step === 1 && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "52px 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Step 1 of 2</p>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>Choose Your Checklist</h1>
            <p style={{ fontSize: 15, color: "#9B7450" }}>Two simple paths. Same promise — We curate, you celebrate.</p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="checklist-grid">
            {[
              {
                icon: "📋",
                title: "Prebuilt Checklist",
                subtitle: "Recommended for most events",
                desc: "Get a ready-made checklist for your event type. Pre-filled with the most important tasks — just tick as you go.",
                steps: ["Pick your event type", "Get instant checklist", "Customise if needed"],
                primary: true,
                action: () => setStep(2),
              },
              {
                icon: "✏️",
                title: "Custom Checklist",
                subtitle: "Build from scratch",
                desc: "Start with a blank checklist and add your own tasks. Perfect for unique events or specific requirements.",
                steps: ["Start with a blank list", "Add your own tasks", "Organise by category"],
                primary: false,
                action: () => navigate("/checklist", { state: { customMode: true } }),
              },
            ].map(({ icon, title, subtitle, desc, steps, primary, action }) => (
              <div key={title}
                style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", border: primary ? "2px solid #C47A2E" : "1.5px solid rgba(139,69,19,0.12)", boxShadow: primary ? "0 6px 24px rgba(196,122,46,0.15)" : "0 4px 16px rgba(139,69,19,0.07)", display: "flex", flexDirection: "column" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(196,122,46,0.1)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 14 }}>{icon}</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>{title}</h2>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E", margin: "0 0 12px" }}>{subtitle}</p>
                <p style={{ fontSize: 14, color: "#7A5535", lineHeight: 1.65, margin: "0 0 16px", flex: 1 }}>{desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
                  {steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: primary ? "#C47A2E" : "rgba(139,69,19,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: primary ? "#fff" : "#C47A2E", flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: "#5a3a1a", fontWeight: 500 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <button onClick={action}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: primary ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.1)", color: primary ? "#fff" : "#C47A2E", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: primary ? "0 4px 14px rgba(196,122,46,0.3)" : "none" }}>
                  {primary ? "Use Prebuilt →" : "Build Custom →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Event type (for Prebuilt) */}
      {step === 2 && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Step 2 of 2</p>
            <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>What type of event?</h1>
            <p style={{ fontSize: 15, color: "#9B7450" }}>We'll pre-fill your checklist with the most relevant tasks.</p>
            <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
            {EVENT_TYPES.map(({ id, label, icon }) => (
              <button key={id}
                onClick={() => navigate("/prebuilt-checklist", { state: { templateKey: id } })}
                style={{ background: "#FFFCF5", borderRadius: 20, padding: "32px 20px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 14px rgba(139,69,19,0.07)", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.18)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "rgba(196,122,46,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(139,69,19,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#FFFCF5"; }}
              >
                <span style={{ fontSize: 44 }}>{icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>{label}</span>
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={() => setStep(1)}
              style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              ← Back
            </button>
          </div>
        </div>
      )}

      <style>{`@media(max-width:640px){.checklist-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
}
