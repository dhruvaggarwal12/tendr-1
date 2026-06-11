import React, { useState } from "react";
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
  const [popup, setPopup] = useState(null);
  const [activeTab, setActiveTab] = useState("decor");

  const occasion = getOccasionById(slug);

  if (!user?.isAdmin) { navigate("/"); return null; }
  if (!occasion) { navigate("/occasions"); return null; }

  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 14, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-block", width: 3, height: 14, background: "#C47A2E", borderRadius: 2 }} />
        {title}
      </h2>
      {children}
    </div>
  );

  const Card = ({ onClick, children }) => (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, padding: "13px 15px", border: "1.5px solid rgba(196,122,46,0.1)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.14)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.1)"; }}>
      {children}
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: font, background: "#F8F4EF" }}>
      <SEO title={`${occasion.name} — Tendr Occasions`} description={occasion.tagline} path={`/occasions/${slug}`} noIndex />

      {/* Nav — fixed at top */}
      <div style={{ flexShrink: 0 }}>
        <HamburgerNav active="Occasions" />
      </div>

      {/* Fixed top section — hero + info */}
      <div style={{ flexShrink: 0, position: "relative" }}>
        {/* Hero image */}
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <img src={occasion.coverImage} alt={occasion.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.1) 60%)" }} />
          <button onClick={() => navigate("/occasions")}
            style={{ position: "absolute", top: 14, left: 18, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 11px", cursor: "pointer", fontFamily: font, backdropFilter: "blur(4px)" }}>
            ← All Occasions
          </button>
          <div style={{ position: "absolute", bottom: 16, left: 22 }}>
            <span style={{ fontSize: 28, marginRight: 8 }}>{occasion.icon}</span>
            <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.7rem)", fontWeight: 900, color: "#fff", margin: 0, display: "inline", letterSpacing: "-0.01em" }}>{occasion.name}</h1>
            {occasion.localName && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 8 }}>({occasion.localName})</span>}
          </div>
        </div>

        {/* Info strip + tagline + CTAs */}
        <div style={{ background: "#F8F4EF", padding: "14px 24px 12px", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {[
              { icon: "👥", val: occasion.typicalGuests + " guests" },
              { icon: "💰", val: `${fmtBudget(occasion.budgetMin)} – ${fmtBudget(occasion.budgetMax)}` },
              { icon: "🛍️", val: occasion.vendorCategories.join(" · ") },
            ].map(({ icon, val }) => (
              <span key={val} style={{ fontSize: 12, fontWeight: 600, color: "#5a3a1a", background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "4px 11px" }}>
                {icon} {val}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#7A5535", margin: "0 0 10px", lineHeight: 1.5 }}>{occasion.tagline}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => navigate(`/listings?serviceType=${occasion.vendorCategories[0]}`)}
              style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Find Vendors →
            </button>
            <button onClick={() => navigate("/gift-hampers-cakes")}
              style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Gift Hampers →
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1.5px solid rgba(196,122,46,0.12)", background: "#F8F4EF", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
        {[
          { id: "decor",      icon: "🎨", label: "Décor",      count: occasion.decorThemes.length },
          { id: "gifts",      icon: "🎁", label: "Gifts",      count: occasion.giftIdeas.length },
          { id: "activities", icon: "🎯", label: "Activities",  count: occasion.activities.length },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "10px 4px 8px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: font, borderBottom: `2.5px solid ${activeTab === t.id ? "#C47A2E" : "transparent"}`,
            transition: "border-color 0.18s", minWidth: 72, whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 17 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 800 : 500, color: activeTab === t.id ? "#C47A2E" : "#9B7450" }}>{t.label}</span>
            <span style={{ fontSize: 9, color: "rgba(196,122,46,0.5)", fontWeight: 600 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Scrollable sections — one tab at a time */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 40px" }}>

        {activeTab === "decor" && (
          <Section title="Décor Themes">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {occasion.decorThemes.map((t, i) => (
                <Card key={i} onClick={() => setPopup({ type: "decor", item: t })}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.desc}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(t.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 6px" }}>#{tag}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {activeTab === "gifts" && (
          <Section title="Gift Ideas">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {occasion.giftIdeas.map((g, i) => (
                <Card key={i} onClick={() => setPopup({ type: "gift", item: g })}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🎁</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>{g.name}</div>
                      <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.desc}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E" }}>{g.price}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {activeTab === "activities" && (
          <Section title="Activities">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {occasion.activities.map((a, i) => (
                <Card key={i} onClick={() => setPopup({ type: "activity", item: a })}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.desc}</div>
                </Card>
              ))}
            </div>
          </Section>
        )}


      </div>

      {/* Popup Modal */}
      {popup && (
        <>
          <div onClick={() => setPopup(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "#FFFCF5", borderRadius: 20, padding: "28px 28px", maxWidth: 460, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font }}>
            <button onClick={() => setPopup(null)}
              style={{ position: "absolute", top: 14, right: 16, background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
              ✕
            </button>

            {popup.type === "decor" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎨 Decor Theme</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 12px" }}>{popup.item.name}</h3>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 16px" }}>{popup.item.desc}</p>
                {(popup.item.tags || []).length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                    {popup.item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "3px 10px" }}>#{tag}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => { setPopup(null); navigate("/listings?serviceType=Decorator"); }}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Find Decorators →
                </button>
              </>
            )}

            {popup.type === "gift" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎁 Gift Idea</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px" }}>{popup.item.name}</h3>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#C47A2E", marginBottom: 12 }}>{popup.item.price}</div>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 20px" }}>{popup.item.desc}</p>
                <button onClick={() => { setPopup(null); navigate("/gift-hampers-cakes"); }}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Browse Gift Hampers →
                </button>
              </>
            )}

            {popup.type === "activity" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎯 Activity</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 12px" }}>{popup.item.name}</h3>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: 0 }}>{popup.item.desc}</p>
              </>
            )}
          </div>
        </>
      )}

    </div>
  );
}
