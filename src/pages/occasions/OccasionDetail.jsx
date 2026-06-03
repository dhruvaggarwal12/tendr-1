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
  const [popup, setPopup] = useState(null); // { type, item }

  const occasion = getOccasionById(slug);

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

  const Card = ({ onClick, children }) => (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.1)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.14)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.1)"; }}>
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
        <button onClick={() => navigate("/occasions")}
          style={{ position: "absolute", top: 16, left: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, padding: "6px 12px", cursor: "pointer", fontFamily: font, backdropFilter: "blur(4px)" }}>
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
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
        <p style={{ fontSize: 15, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 16px" }}>{occasion.tagline}</p>

        {/* CTA buttons — no Start Planning */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          <button onClick={() => navigate(`/listings?serviceType=${occasion.vendorCategories[0]}`)}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Find Vendors →
          </button>
          <button onClick={() => navigate("/gift-hampers-cakes")}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Gift Hampers →
          </button>
        </div>

        {/* Decor Themes — clickable cards */}
        <Section title={`🎨 Decor Themes (${occasion.decorThemes.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {occasion.decorThemes.map((t, i) => (
              <Card key={i} onClick={() => setPopup({ type: "decor", item: t })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.desc}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(t.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 7px" }}>#{tag}</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "rgba(196,122,46,0.6)", fontWeight: 600 }}>Tap for details →</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Gift Ideas — clickable cards */}
        <Section title={`🎁 Gift Ideas (${occasion.giftIdeas.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {occasion.giftIdeas.map((g, i) => (
              <Card key={i} onClick={() => setPopup({ type: "gift", item: g })}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>🎁</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{g.name}</div>
                    <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.desc}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E" }}>{g.price}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "rgba(196,122,46,0.6)", fontWeight: 600 }}>Tap for details →</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Activities — clickable cards */}
        <Section title={`🎯 Activities (${occasion.activities.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {occasion.activities.map((a, i) => (
              <Card key={i} onClick={() => setPopup({ type: "activity", item: a })}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.desc}</div>
                <div style={{ marginTop: 8, fontSize: 11, color: "rgba(196,122,46,0.6)", fontWeight: 600 }}>Tap for details →</div>
              </Card>
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

      {/* ── Popup Modal ── */}
      {popup && (
        <>
          <div onClick={() => setPopup(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "#FFFCF5", borderRadius: 20, padding: "28px 28px", maxWidth: 460, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font }}>

            {/* Close */}
            <button onClick={() => setPopup(null)}
              style={{ position: "absolute", top: 14, right: 16, background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
              ✕
            </button>

            {/* Decor theme popup */}
            {popup.type === "decor" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎨 Decor Theme</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 12px" }}>{popup.item.name}</h3>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 16px" }}>{popup.item.desc}</p>
                {(popup.item.tags || []).length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {popup.item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "3px 10px" }}>#{tag}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => { setPopup(null); navigate("/listings?serviceType=Decorator"); }}
                  style={{ marginTop: 20, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Find Decorators →
                </button>
              </>
            )}

            {/* Gift idea popup */}
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

            {/* Activity popup */}
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
