import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

export default function OccasionDetail() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const occasion = getOccasionById(slug);

  // Admin-only
  if (!user?.isAdmin) { navigate("/"); return null; }
  if (!occasion) { navigate("/occasions"); return null; }

  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-block", width: 3, height: 16, background: "#C47A2E", borderRadius: 2 }} />
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title={`${occasion.name} — Tendr Occasions`} description={occasion.tagline} path={`/occasions/${slug}`} noIndex />
      <HamburgerNav active="Occasions" />

      {/* Hero */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src={occasion.coverImage} alt={occasion.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%)" }} />
        <button onClick={() => navigate("/occasions")} style={{ position: "absolute", top: 16, left: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, padding: "6px 12px", cursor: "pointer", fontFamily: font, backdropFilter: "blur(4px)" }}>
          ← All Occasions
        </button>
        <div style={{ position: "absolute", bottom: 20, left: 24 }}>
          <span style={{ fontSize: 32, marginRight: 8 }}>{occasion.icon}</span>
          <h1 style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, color: "#fff", margin: 0, display: "inline", letterSpacing: "-0.01em" }}>{occasion.name}</h1>
          {occasion.localName && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginLeft: 8 }}>({occasion.localName})</span>}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Quick info strip */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {[
            { icon: "👥", val: occasion.typicalGuests + " guests" },
            { icon: "💰", val: `${fmtBudget(occasion.budgetMin)} – ${fmtBudget(occasion.budgetMax)}` },
            { icon: "🛍️", val: occasion.vendorCategories.join(" · ") },
          ].map(({ icon, val }) => (
            <span key={val} style={{ fontSize: 12, fontWeight: 600, color: "#5a3a1a", background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "5px 12px" }}>
              {icon} {val}
            </span>
          ))}
        </div>

        {/* About */}
        <p style={{ fontSize: 15, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 10px" }}>{occasion.tagline}</p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          <button onClick={() => navigate(`/listings?serviceType=${occasion.vendorCategories[0]}`)}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Find Vendors →
          </button>
          <button onClick={() => navigate("/gift-hampers-cakes")}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Gift Hampers →
          </button>
          <button onClick={() => navigate("/booking")}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Start Planning →
          </button>
        </div>

        {/* Decor Themes */}
        <Section title={`🎨 Decor Themes (${occasion.decorThemes.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {occasion.decorThemes.map((t, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#7A5535", lineHeight: 1.5, marginBottom: 8 }}>{t.desc}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(t.tags || []).map(tag => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 7px" }}>#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Gift Ideas */}
        <Section title={`🎁 Gift Ideas (${occasion.giftIdeas.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {occasion.giftIdeas.map((g, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.1)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🎁</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "#7A5535", lineHeight: 1.5, marginBottom: 4 }}>{g.desc}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E" }}>{g.price}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Activities */}
        <Section title={`🎯 Activities (${occasion.activities.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {occasion.activities.map((a, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#7A5535", lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Checklist */}
        <Section title={`✅ Planning Checklist (${occasion.checklist.length} items)`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {occasion.checklist.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 14px", background: "#fff", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.08)" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(196,122,46,0.3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#C47A2E" }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "#2C1A0E", lineHeight: 1.45 }}>{item}</span>
              </div>
            ))}
          </div>
        </Section>


      </div>
    </div>
  );
}
