import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TEMPLATES } from "./templates";
import { RENDERERS } from "./TemplateRenderer";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";

const BLANK = {
  coupleName: "", date: "", day: "", time: "", venue: "", rsvp: "",
};

const CATEGORY_COLORS = {
  "Invitation":    { bg: "#FEF9EC", text: "#C9A84C" },
  "Menu Card":     { bg: "#EFF5F0", text: "#4A8A52" },
  "Thank You Card":{ bg: "#F0F0FE", text: "#5254A4" },
};

export default function WeddingStationery() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Wedding Stationery — Beautiful Designs | Tendr"
        description="Browse 10 curated wedding stationery designs. Customise online and download or share instantly."
        path="/stationery"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Wedding Stationery", path: "/stationery" }]}
      />
      <BasicSpeedDial />
      <HamburgerNav title="Wedding Stationery" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 10 }}>
            Design Studio
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 400, color: "#1C1208", margin: "0 0 14px", letterSpacing: "0.02em" }}>
            Wedding Stationery
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", maxWidth: 520, margin: "0 auto 18px" }}>
            Choose a design, fill in your details, and download your personalised stationery instantly.
          </p>
          <div style={{ width: 48, height: 2, background: "linear-gradient(90deg,#C9A84C,#D4B86A)", borderRadius: 100, margin: "0 auto" }} />
        </div>

        {/* Template grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 28 }} className="stationery-grid">
          {TEMPLATES.map((tpl) => {
            const Renderer = RENDERERS[tpl.id];
            const cat = CATEGORY_COLORS[tpl.category] || CATEGORY_COLORS["Invitation"];
            const isHov = hovered === tpl.id;
            return (
              <div
                key={tpl.id}
                onMouseEnter={() => setHovered(tpl.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#FFFCF7",
                  borderRadius: 14,
                  overflow: "hidden",
                  border: isHov ? "1.5px solid #C9A84C" : "1.5px solid rgba(201,168,76,0.18)",
                  boxShadow: isHov ? "0 10px 36px rgba(139,90,20,0.14)" : "0 3px 14px rgba(139,90,20,0.07)",
                  cursor: "pointer",
                  transition: "all 0.22s ease",
                  transform: isHov ? "translateY(-3px)" : "none",
                }}
                onClick={() => navigate(`/stationery/${tpl.id}`)}
              >
                {/* Thumbnail — use mini=true for correct pixel dimensions, no overflow */}
                <div style={{ background: tpl.palette?.bg || "#F8F4EF", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "18px 18px 0", overflow: "hidden" }}>
                  <div style={{ pointerEvents: "none", flexShrink: 0 }}>
                    {Renderer ? (
                      <Renderer d={BLANK} onChange={() => {}} mini={true} />
                    ) : (
                      <div style={{ width: 176, height: 252, background: "#EEE", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>Preview</div>
                    )}
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: "16px 18px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1C1208", margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17 }}>
                      {tpl.name}
                    </h3>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: cat.bg, color: cat.text, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>
                      {tpl.category}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.45 }}>{tpl.desc}</p>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: isHov ? "#C9A84C" : "transparent",
                      color: isHov ? "#FFF" : "#C9A84C",
                      border: "1.5px solid #C9A84C",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: font,
                      cursor: "pointer",
                      letterSpacing: "0.05em",
                      transition: "all 0.18s",
                    }}
                  >
                    Customise
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Great+Vibes&family=Outfit:wght@400;600;700&display=swap');
        @media(max-width:640px){ .stationery-grid{ grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; } }
        @media(max-width:380px){ .stationery-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
