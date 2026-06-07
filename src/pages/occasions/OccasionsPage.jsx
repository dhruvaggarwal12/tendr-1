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
    (o.localName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FFFAF5", fontFamily: font }}>
      <SEO title="Occasions — Tendr" description="Plan by occasion" path="/occasions" noIndex />
      <HamburgerNav active="Occasions" />

      {/* Festive hero */}
      <div style={{
        background: "linear-gradient(135deg,#FFF0F8 0%,#FFFBEB 33%,#EFF6FF 66%,#F0FDF4 100%)",
        padding: "44px 24px 36px",
        textAlign: "center",
        borderBottom: "1px solid rgba(196,122,46,0.08)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-40, left:-30, width:180, height:180, borderRadius:"50%", background:"rgba(244,114,182,0.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-30, right:-20, width:140, height:140, borderRadius:"50%", background:"rgba(96,165,250,0.07)", pointerEvents:"none" }} />

        <button onClick={() => navigate(-1)} style={{ position:"absolute", top:14, left:18, background:"rgba(196,122,46,0.12)", border:"1.5px solid rgba(196,122,46,0.25)", borderRadius:8, color:"#C47A2E", fontSize:12, fontWeight:600, padding:"5px 11px", cursor:"pointer", fontFamily:font }}>
          ← Back
        </button>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize: 42, letterSpacing: 6, marginBottom: 14, lineHeight: 1 }}>🎂 💍 🍼 🎓</div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px" }}>🎉 Admin Preview</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.8rem,4vw,2.8rem)",
            fontWeight: 400,
            color: "#2C1A0E",
            margin: "0 0 8px",
            letterSpacing: "0.01em",
          }}>What are you celebrating?</h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: "0 auto 20px", maxWidth: 360, lineHeight: 1.55 }}>
            Tap an occasion to explore décor ideas, gift suggestions and planning checklists.
          </p>

          {/* Search pill inside hero */}
          <div style={{ maxWidth: 380, margin: "0 auto", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.82)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "0 16px", gap: 8, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search occasions…"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, fontFamily: font, color: "#2C1A0E", padding: "11px 0" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.2)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", margin: "0 0 4px" }}>No occasions found</p>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Try a different search term</p>
          </div>
        ) : (
          <>
          <style>{`
            .occ-pg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:14px; }
            @media(max-width:560px){
              .occ-pg-grid { grid-template-columns:repeat(2,1fr)!important; gap:10px!important; }
              .occ-pg-cover { height:88px!important; }
              .occ-pg-info  { padding:8px 10px 10px!important; }
              .occ-pg-name  { font-size:12px!important; }
            }
          `}</style>
          <div className="occ-pg-grid">
            {filtered.map(occasion => (
              <button
                key={occasion.id}
                onClick={() => navigate(`/occasions/${occasion.id}`)}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1.5px solid rgba(196,122,46,0.1)",
                  overflow: "hidden",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 2px 10px rgba(139,69,19,0.05)",
                  transition: "transform 0.18s, box-shadow 0.18s",
                  fontFamily: font,
                  padding: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(139,69,19,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(139,69,19,0.05)"; }}
              >
                {/* Cover photo */}
                <div className="occ-pg-cover" style={{ height: 120, overflow: "hidden", position: "relative", background: (occasion.color || "#C47A2E") + "22" }}>
                  <img src={occasion.coverImage} alt={occasion.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.42) 0%,transparent 55%)" }} />
                  <span style={{ position: "absolute", top: 10, left: 12, fontSize: 26 }}>{occasion.icon}</span>
                </div>
                {/* Name only — no tagline, no chips */}
                <div className="occ-pg-info" style={{ padding: "10px 13px 12px" }}>
                  <div className="occ-pg-name" style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.25 }}>{occasion.name}</div>
                  {occasion.localName && (
                    <div style={{ fontSize: 10, color: "#C47A2E", fontWeight: 600, marginTop: 2 }}>{occasion.localName}</div>
                  )}
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
