import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { OCCASIONS } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

export default function OccasionsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [search, setSearch] = useState("");

  if (!user?.isAdmin) { navigate("/"); return null; }

  const filtered = OCCASIONS.filter(o =>
    !search.trim() ||
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.localName || "").toLowerCase().includes(search.toLowerCase()) ||
    o.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Occasions — Tendr" description="Plan by occasion" path="/occasions" noIndex />
      <HamburgerNav active="Occasions" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>🎉 Plan by Occasion</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            What are you celebrating?
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>
            Decor ideas, gift suggestions, activities and checklists for every occasion.
          </p>
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 12, padding: "0 14px", gap: 8, marginBottom: 24, boxShadow: "0 2px 8px rgba(196,122,46,0.06)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search occasions…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, fontFamily: font, color: "#2C1A0E", padding: "12px 0" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Occasion grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.2)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: "0 0 4px" }}>No occasions found</p>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Try a different search term</p>
          </div>
        ) : (
          <>
          <style>{`@media(max-width:600px){.occ-page-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}.occ-page-cover{height:90px!important;}.occ-page-info{padding:9px 10px 11px!important;}.occ-page-info .occ-name{font-size:13px!important;}.occ-page-chips{display:none!important;}}`}</style>
          <div className="occ-page-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {filtered.map(occasion => (
              <button
                key={occasion.id}
                onClick={() => navigate(`/occasions/${occasion.id}`)}
                style={{
                  background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)",
                  overflow: "hidden", cursor: "pointer", textAlign: "left",
                  boxShadow: "0 2px 14px rgba(139,69,19,0.06)", transition: "transform 0.18s, box-shadow 0.18s",
                  fontFamily: font, padding: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(139,69,19,0.11)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 14px rgba(139,69,19,0.06)"; }}
              >
                {/* Cover */}
                <div className="occ-page-cover" style={{ height: 120, overflow: "hidden", position: "relative", background: occasion.color + "22" }}>
                  <img src={occasion.coverImage} alt={occasion.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
                  <span style={{ position: "absolute", top: 10, left: 12, fontSize: 24 }}>{occasion.icon}</span>
                </div>
                {/* Info */}
                <div className="occ-page-info" style={{ padding: "12px 14px" }}>
                  <div className="occ-name" style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>{occasion.name}</div>
                  {occasion.localName && (
                    <div style={{ fontSize: 10.5, color: "#C47A2E", fontWeight: 600, marginBottom: 4 }}>{occasion.localName}</div>
                  )}
                  <p style={{ fontSize: 11.5, color: "#9B7450", margin: "0 0 8px", lineHeight: 1.45 }}>{occasion.tagline}</p>
                  <div className="occ-page-chips" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#7A5535", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 8px" }}>
                      👥 {occasion.typicalGuests}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#7A5535", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 8px" }}>
                      🎨 {occasion.decorThemes.length} themes
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#7A5535", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 8px" }}>
                      🎁 {occasion.giftIdeas.length} gifts
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          </>
        )}

      </div>
    </div>
  );
}
