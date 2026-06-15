import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getStationeryProducts, STATIONERY_CATEGORIES } from "./stationeryProducts";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";

const CAT_META = {
  "Branding & Identity": { icon: "✦", color: "#C47A2E", bg: "rgba(196,122,46,0.07)" },
  "Event Signage":       { icon: "🪧", color: "#7A4A1E", bg: "rgba(122,74,30,0.07)" },
  "Itinerary":           { icon: "📋", color: "#5C6BC0", bg: "rgba(92,107,192,0.07)" },
  "Guest Accessories":   { icon: "🎀", color: "#D4829D", bg: "rgba(212,130,157,0.08)" },
  "Hashtag Services":    { icon: "#", color: "#4A7C59", bg: "rgba(74,124,89,0.07)" },
  "Invitations":         { icon: "💌", color: "#C47A2E", bg: "rgba(196,122,46,0.07)" },
  "Envelopes":           { icon: "✉", color: "#8D6E63", bg: "rgba(141,110,99,0.07)" },
  "Coffee Table Booklet":{ icon: "📖", color: "#5D4037", bg: "rgba(93,64,55,0.07)" },
  "Cards":               { icon: "🃏", color: "#7A4A1E", bg: "rgba(122,74,30,0.07)" },
  "Other":               { icon: "✨", color: "#9B7450", bg: "rgba(155,116,80,0.07)" },
};

function getPriceDisplay(item) {
  if (item.priceOnRequest) return { main: "Price on request", note: null };
  if (item.priceRange) return { main: item.priceRange, note: "+ printing & delivery charges" };
  if (item.startingPrice) return { main: `₹${Number(item.startingPrice).toLocaleString("en-IN")}`, note: "+ printing & delivery charges" };
  return { main: "—", note: null };
}

export default function WeddingStationery() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [hovered, setHovered] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    setItems(getStationeryProducts().filter((p) => p.available));
  }, []);

  const categories = ["All", ...STATIONERY_CATEGORIES.filter((c) =>
    items.some((item) => item.category === c)
  )];

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = sectionRefs.current[cat];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const groupedItems = STATIONERY_CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Wedding Stationeries — Tendr"
        description="Custom wedding stationeries — itineraries, invitations, envelopes, hashtag packages, coffee table booklets and more."
        path="/stationery"
      />
      <BasicSpeedDial />
      <HamburgerNav title="Wedding Stationeries" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #2C1A0E 0%, #4A2810 60%, #6B3A1F 100%)", padding: "52px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(204,171,74,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(196,122,46,0.1) 0%, transparent 40%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 12 }}>Crafted with love</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 400, color: "#fff", margin: "0 0 14px", letterSpacing: "0.03em", fontStyle: "italic" }}>
            Wedding Stationeries
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 480, margin: "0 auto 8px", lineHeight: 1.65 }}>
            Beautifully designed, fully personalised. Every piece crafted exclusively for your wedding.
          </p>
          <p style={{ fontSize: 12, color: "rgba(204,171,74,0.75)", margin: 0, fontStyle: "italic" }}>
            All prices shown are design prices — printing &amp; delivery charged separately.
          </p>
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 2 && (
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", position: "sticky", top: 0, zIndex: 20, overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 0, padding: "0 20px", maxWidth: 1100, margin: "0 auto", overflowX: "auto" }} className="cat-pill-row">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                style={{
                  padding: "14px 18px",
                  background: "none",
                  border: "none",
                  borderBottom: activeCategory === cat ? "2.5px solid #C47A2E" : "2.5px solid transparent",
                  color: activeCategory === cat ? "#C47A2E" : "#9B7450",
                  fontSize: 12,
                  fontWeight: activeCategory === cat ? 800 : 600,
                  cursor: "pointer",
                  fontFamily: font,
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                  flexShrink: 0,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#9B7450" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0E", marginBottom: 8 }}>Catalogue coming soon</div>
            <div style={{ fontSize: 14 }}>Our stationery collection will be available here shortly.</div>
          </div>
        )}

        {Object.entries(groupedItems).map(([cat, catItems]) => {
          const meta = CAT_META[cat] || CAT_META["Other"];
          return (
            <section
              key={cat}
              ref={(el) => { sectionRefs.current[cat] = el; }}
              style={{ marginBottom: 56 }}
            >
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: meta.color, flexShrink: 0, border: `1.5px solid ${meta.color}22` }}>
                  {meta.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: 0, letterSpacing: "-0.01em" }}>{cat}</h2>
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(196,122,46,0.12)", marginLeft: 8 }} />
              </div>

              {/* Items grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }} className="stat-grid">
                {catItems.map((item, idx) => {
                  const price = getPriceDisplay(item);
                  const isHov = hovered === `${cat}-${idx}`;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHovered(`${cat}-${idx}`)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        background: "#FFFCF7",
                        borderRadius: 16,
                        overflow: "hidden",
                        border: isHov ? `1.5px solid #C9A84C` : "1.5px solid rgba(201,168,76,0.15)",
                        boxShadow: isHov ? "0 10px 32px rgba(139,90,20,0.14)" : "0 3px 12px rgba(139,90,20,0.07)",
                        transition: "all 0.22s ease",
                        transform: isHov ? "translateY(-3px)" : "none",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Image */}
                      {item.images?.[0] ? (
                        <div style={{ height: 160, overflow: "hidden", background: "#f0e8dc" }}>
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: isHov ? "scale(1.04)" : "scale(1)" }}
                          />
                        </div>
                      ) : (
                        <div style={{ height: 90, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: meta.color, opacity: 0.5 }}>
                          {meta.icon}
                        </div>
                      )}

                      {/* Content */}
                      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 700, color: "#1C1208", margin: "0 0 5px", lineHeight: 1.3 }}>
                          {item.name}
                        </h3>
                        {item.tagline && (
                          <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 10px", lineHeight: 1.45 }}>{item.tagline}</p>
                        )}

                        {item.features?.length > 0 && (
                          <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                            {item.features.slice(0, 3).map((f, fi) => (
                              <li key={fi} style={{ fontSize: 11, color: "#7A5535", display: "flex", alignItems: "flex-start", gap: 5 }}>
                                <span style={{ color: "#C9A84C", flexShrink: 0, marginTop: 1 }}>✦</span> {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div style={{ marginTop: "auto" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#C9A84C", marginBottom: price.note ? 2 : 0 }}>
                            {price.main}
                          </div>
                          {price.note && (
                            <div style={{ fontSize: 10, color: "#9B7450", fontStyle: "italic" }}>{price.note}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Enquire CTA */}
        {items.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 16, padding: "40px 24px", background: "linear-gradient(135deg, #2C1A0E, #4A2810)", borderRadius: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 30%, rgba(204,171,74,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 10 }}>Ready to order?</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, color: "#fff", margin: "0 0 10px", fontStyle: "italic" }}>
                Let's design your perfect stationery
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 400, margin: "0 auto 20px" }}>
                All prices shown are design prices only. Printing and delivery charges are additional.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                style={{ padding: "13px 32px", borderRadius: 100, border: "none", background: "linear-gradient(135deg, #C47A2E, #CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.4)", letterSpacing: "0.03em" }}
              >
                Enquire via Chat →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@400;600;700;800;900&display=swap');
        .cat-pill-row { scrollbar-width: none; }
        .cat-pill-row::-webkit-scrollbar { display: none; }
        @media(max-width:640px) { .stat-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; } }
        @media(max-width:360px) { .stat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
