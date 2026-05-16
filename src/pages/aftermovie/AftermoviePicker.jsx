import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import ToolIntroWrapper from "../../components/ToolIntroWrapper";
import ToolNav from "../../components/ToolNav";

const font = "'Outfit', sans-serif";

const INTRO = {
  toolId: "aftermovie",
  icon: "🎬",
  title: "Aftermovie Planner",
  tagline: "Relive your event forever",
  description: "Turn your event photos and videos into a cinematic memory. Choose your format, style, and let our team create a stunning aftermovie for you.",
  steps: [
    { title: "Choose your format", desc: "Reel, slideshow, or full cinematic video." },
    { title: "Customise the style", desc: "Music, transitions, and visual theme." },
    { title: "Submit to our team", desc: "We handle the rest and deliver your aftermovie." },
  ],
};

const OPTIONS = [
  {
    id: "reel",
    icon: "📱",
    title: "Reel",
    subtitle: "15–60 seconds",
    desc: "Dynamic vertical video with trending effects. Perfect for Instagram and social media.",
    features: ["Vertical 9:16 format", "Trending transitions", "Music sync", "Social media ready"],
    bestFor: "Instagram, TikTok, WhatsApp Status",
  },
  {
    id: "slideshow",
    icon: "🖼️",
    title: "Slideshow",
    subtitle: "2–5 minutes",
    desc: "Elegant photo presentation with cinematic effects. Great for sharing with family.",
    features: ["Horizontal 16:9", "Cinematic transitions", "Custom music", "High resolution"],
    bestFor: "Family sharing, presentations",
  },
  {
    id: "full-movie",
    icon: "🎥",
    title: "Full Movie",
    subtitle: "10–20 minutes",
    desc: "A complete documentary-style video capturing every highlight of your event.",
    features: ["Full event coverage", "Professional editing", "Multiple segments", "Narration option"],
    bestFor: "Weddings, corporate galas",
  },
];

export default function AftermoviePicker() {
  const navigate = useNavigate();

  const content = (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, position: "relative" }}>
      <SEO
        title="Aftermovie Planner — Turn Your Event Into a Cinematic Memory | Tendr"
        description="Create stunning aftermovies for your birthday, anniversary, wedding or corporate event. Choose your format, style and let our team deliver a cinematic memory reel. Coming soon on Tendr."
        path="/aftermovie"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Aftermovie Planner", path: "/aftermovie" }]}
      />
      {/* Coming Soon overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", background: "rgba(255,248,240,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🎬</div>
        <span style={{ display: "inline-block", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 16px", borderRadius: 100, marginBottom: 18 }}>Coming Soon</span>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>Aftermovie Planner</h1>
        <p style={{ fontSize: 16, color: "#7A5535", maxWidth: 440, lineHeight: 1.7, margin: "0 auto 28px" }}>Turn your event photos and videos into a cinematic memory — launching very soon on Tendr.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/" style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>← Back to Home</a>
          <a href="https://wa.me/919211668427?text=Hi%20Tendr%2C%20I%27m%20interested%20in%20the%20Aftermovie%20feature" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 28px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Notify Me on WhatsApp</a>
        </div>
      </div>
      <BasicSpeedDial />
      <ToolNav title="Aftermovie Planner" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 10 }}>Planning Tool</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}>What format do you want?</h1>
          <p style={{ fontSize: 15, color: "#9B7450" }}>Choose the type of aftermovie that best captures your event.</p>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, margin: "16px auto 0" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="aftermovie-grid">
          {OPTIONS.map(({ id, icon, title, subtitle, desc, features, bestFor }) => (
            <div key={id}
              style={{ background: "#FFFCF5", borderRadius: 20, padding: "26px 22px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 4px 18px rgba(139,69,19,0.07)", display: "flex", flexDirection: "column", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(139,69,19,0.07)"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 2px" }}>{title}</h2>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E", margin: "0 0 10px" }}>{subtitle}</p>
              <p style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.6, margin: "0 0 14px", flex: 1 }}>{desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
                {features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#5a3a1a" }}>
                    <span style={{ color: "#C47A2E", fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#bbb", margin: "0 0 14px" }}>Best for: {bestFor}</p>
              <button onClick={() => navigate(`/aftermovie/customize/${id}`)}
                style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                Choose {title} →
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.aftermovie-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );

  return <ToolIntroWrapper {...INTRO}>{content}</ToolIntroWrapper>;
}
