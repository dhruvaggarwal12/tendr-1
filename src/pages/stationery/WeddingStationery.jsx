import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TEMPLATES } from "./templates";
import { RENDERERS } from "./TemplateRenderer";
import { getStationeryProducts } from "./stationeryProducts";
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

const CAT_COLORS = {
  "Invitation":        { bg: "#FEF9EC", text: "#C9A84C" },
  "Save the Date":     { bg: "#FFF0F5", text: "#A0526B" },
  "Menu Card":         { bg: "#EFF5F0", text: "#4A8A52" },
  "Place Card":        { bg: "#F0F5FF", text: "#4A52A4" },
  "Thank You Card":    { bg: "#F0F0FE", text: "#5254A4" },
  "Ceremony Program":  { bg: "#FDF5EC", text: "#B06E2A" },
  "RSVP Card":         { bg: "#F5F0FE", text: "#7254A4" },
  "Other":             { bg: "#F5F5F5", text: "#777"    },
};

export default function WeddingStationery() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [adminItems, setAdminItems] = useState([]);

  useEffect(() => {
    setAdminItems(getStationeryProducts().filter((p) => p.available));
  }, []);

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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 8, color: "#C47A2E", fontSize: 12, fontWeight: 600, padding: "6px 12px", cursor: "pointer", fontFamily: font }}>
          ← Back
        </button>
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

        {/* ── Admin-uploaded stationery products ── */}
        {adminItems.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 8 }}>
                Curated Collection
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 400, color: "#1C1208", margin: "0 0 10px", letterSpacing: "0.02em" }}>
                Stationery Products
              </h2>
              <p style={{ fontSize: 14, color: "#9B7450", maxWidth: 480, margin: "0 auto" }}>
                Browse our handpicked stationery — order a custom design tailored to your event.
              </p>
              <div style={{ width: 48, height: 2, background: "linear-gradient(90deg,#C9A84C,#D4B86A)", borderRadius: 100, margin: "14px auto 0" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }} className="stationery-products-grid">
              {adminItems.map((item, i) => {
                const catStyle = CAT_COLORS[item.category] || CAT_COLORS["Other"];
                const isHov = hovered === `prod-${i}`;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHovered(`prod-${i}`)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: "#FFFCF7",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: isHov ? "1.5px solid #C9A84C" : "1.5px solid rgba(201,168,76,0.18)",
                      boxShadow: isHov ? "0 10px 36px rgba(139,90,20,0.14)" : "0 3px 14px rgba(139,90,20,0.07)",
                      transition: "all 0.22s ease",
                      transform: isHov ? "translateY(-3px)" : "none",
                      fontFamily: font,
                    }}
                  >
                    {/* Photo */}
                    <div style={{ height: 180, overflow: "hidden", background: "#f0e8dc" }}>
                      {item.images?.[0]
                        ? <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: isHov ? "scale(1.04)" : "scale(1)" }} />
                        : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>💍</div>}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "16px 18px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 700, color: "#1C1208", margin: 0, lineHeight: 1.3 }}>{item.name}</h3>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: catStyle.bg, color: catStyle.text, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>
                          {item.category}
                        </span>
                      </div>

                      {item.tagline && (
                        <p style={{ fontSize: 12.5, color: "#9B7450", margin: "0 0 12px", lineHeight: 1.45 }}>{item.tagline}</p>
                      )}

                      {item.features?.length > 0 && (
                        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                          {item.features.slice(0, 3).map((f) => (
                            <li key={f} style={{ fontSize: 11, color: "#7A5535", display: "flex", alignItems: "flex-start", gap: 5 }}>
                              <span style={{ color: "#C9A84C", flexShrink: 0, marginTop: 1 }}>✦</span> {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 9, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Starting at</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#C9A84C" }}>₹{Number(item.startingPrice).toLocaleString("en-IN")}</div>
                          <div style={{ fontSize: 10, color: "#9B7450" }}>{item.unit}</div>
                        </div>
                        <button
                          onClick={() => navigate("/dashboard")}
                          style={{
                            padding: "9px 18px",
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
                          Order →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Great+Vibes&family=Outfit:wght@400;600;700&display=swap');
        @media(max-width:640px){ .stationery-grid{ grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; } }
        @media(max-width:380px){ .stationery-grid{ grid-template-columns: 1fr !important; } }
        @media(max-width:640px){ .stationery-products-grid{ grid-template-columns: repeat(2,1fr) !important; gap: 14px !important; } }
        @media(max-width:380px){ .stationery-products-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
