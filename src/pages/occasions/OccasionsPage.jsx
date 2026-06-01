import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { OCCASIONS } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

export default function OccasionsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  // Admin-only for now
  if (!user?.isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Occasions — Tendr" description="Plan by occasion" path="/occasions" noIndex />
      <HamburgerNav active="Occasions" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "4px 14px", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Preview</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Plan by Occasion
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", margin: 0, maxWidth: 560 }}>
            Curated decor ideas, gift suggestions, activities and checklists for every celebration. Community photos will be added as users share their events.
          </p>
        </div>

        {/* Occasion grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {OCCASIONS.map(occasion => (
            <button
              key={occasion.id}
              onClick={() => navigate(`/occasions/${occasion.id}`)}
              style={{
                background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.12)",
                overflow: "hidden", cursor: "pointer", textAlign: "left",
                boxShadow: "0 4px 20px rgba(139,69,19,0.07)", transition: "transform 0.2s, box-shadow 0.2s",
                fontFamily: font,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(139,69,19,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.07)"; }}
            >
              {/* Cover */}
              <div style={{ height: 140, overflow: "hidden", position: "relative", background: occasion.color + "33" }}>
                <img src={occasion.coverImage} alt={occasion.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)` }} />
                <span style={{ position: "absolute", top: 12, left: 14, fontSize: 28 }}>{occasion.icon}</span>
                {occasion.localName && (
                  <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, fontWeight: 700, color: "#fff", opacity: 0.8 }}>
                    {occasion.localName}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "16px 18px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>{occasion.name}</h3>
                <p style={{ fontSize: 12.5, color: "#9B7450", margin: "0 0 12px", lineHeight: 1.5 }}>{occasion.tagline}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7A5535", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 10px" }}>
                    👥 {occasion.typicalGuests} guests
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7A5535", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 10px" }}>
                    {occasion.decorThemes.length} themes
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7A5535", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 10px" }}>
                    {occasion.giftIdeas.length} gift ideas
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
