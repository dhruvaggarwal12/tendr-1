import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATIONERY_TYPES } from "../data/stationeryTypes";

const CATEGORIES = ["All", "Invitations", "Day-Of", "Thank You & Extras"];
const TYPE_CATEGORIES = {
  "wedding-invitation": "Invitations",
  "rsvp-card": "Invitations",
  "save-the-date": "Invitations",
  "rehearsal-dinner": "Invitations",
  "bridal-shower": "Invitations",
  "menu-card": "Day-Of",
  "place-card": "Day-Of",
  "table-number": "Day-Of",
  "welcome-sign": "Day-Of",
  "order-of-service": "Day-Of",
  "envelope-liner": "Day-Of",
  "seating-chart": "Day-Of",
  "thank-you-card": "Thank You & Extras",
  "favour-tag": "Thank You & Extras",
  "wishing-well": "Thank You & Extras",
};

export default function StationeryPicker() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [hovered, setHovered] = useState(null);

  const filtered = STATIONERY_TYPES.filter(
    t => activeCategory === "All" || TYPE_CATEGORIES[t.id] === activeCategory
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #E8E0D0", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#1C1C1C", margin: 0, letterSpacing: "0.05em" }}>
            Wedding Stationery
          </h1>
          <p style={{ fontSize: 13, color: "#9B8C78", margin: "2px 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Design Studio
          </p>
        </div>
        <button
          onClick={() => navigate("/wedding/admin")}
          style={{ fontSize: 13, color: "#C9A84C", background: "none", border: "1px solid #C9A84C", borderRadius: 4, padding: "8px 18px", cursor: "pointer", letterSpacing: "0.05em", fontFamily: "'Lato', sans-serif" }}
        >
          Admin Dashboard
        </button>
      </header>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 16 }}>
          Handcrafted with love
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 300, color: "#1C1C1C", lineHeight: 1.2, margin: "0 0 18px" }}>
          Your Perfect Wedding Stationery Suite
        </h2>
        <p style={{ fontSize: 16, color: "#6B5E52", lineHeight: 1.75, margin: 0 }}>
          Choose from 15 beautifully designed stationery pieces. Customise every detail to match your vision.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40, flexWrap: "wrap", padding: "0 24px" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{
              padding: "9px 22px", borderRadius: 100, fontSize: 13, letterSpacing: "0.06em",
              cursor: "pointer", transition: "all 0.2s", fontFamily: "'Lato', sans-serif",
              background: activeCategory === cat ? "#1C1C1C" : "transparent",
              color: activeCategory === cat ? "#fff" : "#6B5E52",
              border: activeCategory === cat ? "1px solid #1C1C1C" : "1px solid #D4C8B8",
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
        {filtered.map(type => (
          <div key={type.id}
            onClick={() => navigate(`/wedding/design/${type.id}`)}
            onMouseEnter={() => setHovered(type.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: "#fff", borderRadius: 8, overflow: "hidden", cursor: "pointer",
              boxShadow: hovered === type.id ? "0 12px 40px rgba(28,28,28,0.12)" : "0 2px 16px rgba(28,28,28,0.07)",
              transform: hovered === type.id ? "translateY(-4px)" : "translateY(0)",
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
              border: "1px solid #EDE6D8",
            }}
          >
            {/* Thumbnail */}
            <div style={{
              height: 220, background: "linear-gradient(135deg, #FAF7F0 0%, #F0E8D8 100%)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
              borderBottom: "1px solid #EDE6D8",
            }}>
              {/* Card preview mini */}
              <div style={{
                background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                borderRadius: 4, padding: "20px 16px",
                width: type.dimensions.width > type.dimensions.height ? "70%" : "45%",
                aspectRatio: `${type.dimensions.width} / ${type.dimensions.height}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6,
                border: "1px solid #E8DCC8",
              }}>
                <div style={{ fontSize: 28 }}>{type.emoji}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: "#C9A84C", textAlign: "center", letterSpacing: "0.06em", fontWeight: 600 }}>
                  {type.dimensions.label}
                </div>
                <div style={{ width: 24, height: 1, background: "#C9A84C", opacity: 0.5 }} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 10, color: "#9B8C78", textAlign: "center", lineHeight: 1.4 }}>
                  {type.name}
                </div>
              </div>
              {/* Category badge */}
              <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A84C", background: "rgba(201,168,76,0.12)", padding: "3px 8px", borderRadius: 100 }}>
                {type.dimensions.label}
              </span>
            </div>

            {/* Info */}
            <div style={{ padding: "20px 22px 22px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: "#1C1C1C", margin: "0 0 6px" }}>
                {type.name}
              </h3>
              <p style={{ fontSize: 13, color: "#9B8C78", lineHeight: 1.6, margin: "0 0 16px" }}>
                {type.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, color: "#B8A898", letterSpacing: "0.05em" }}>from </span>
                  <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: "#1C1C1C" }}>₹{type.basePrice}</span>
                  <span style={{ fontSize: 12, color: "#B8A898" }}> / 25</span>
                </div>
                <button style={{
                  fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "none", border: "none", color: "#C9A84C", cursor: "pointer",
                  fontFamily: "'Lato', sans-serif", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  Design →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
