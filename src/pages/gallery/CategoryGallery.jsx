import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import SEO from "../../components/SEO";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const CATEGORY_META = {
  "Decoration":        { emoji: "🎨", color: "#C47A2E", desc: "Floral arches, lighting, balloon art and full décor setups from our decorator partners." },
  "Entertainment":     { emoji: "🎵", color: "#7C3AED", desc: "DJ setups, live performances, and entertainment moments from real events." },
  "Catering":          { emoji: "🍽️", color: "#059669", desc: "Buffets, live counters, and cuisine spreads curated by our catering partners." },
  "Photography":       { emoji: "📸", color: "#0369a1", desc: "Candid and traditional photography highlights from events we've helped plan." },
  "Full Event Setup":  { emoji: "✨", color: "#B45309", desc: "Complete end-to-end event setups — decoration, catering, entertainment and more." },
  "Corporate Events":  { emoji: "🏢", color: "#374151", desc: "Corporate conferences, offsites, and team events managed through Tendr." },
};

const SLUG_TO_CATEGORY = {
  "decoration":       "Decoration",
  "entertainment":    "Entertainment",
  "catering":         "Catering",
  "photography":      "Photography",
  "full-event-setup": "Full Event Setup",
  "corporate-events": "Corporate Events",
};

export default function CategoryGallery() {
  const { category: slug } = useParams();
  const navigate = useNavigate();
  const category = SLUG_TO_CATEGORY[slug] || slug;
  const meta = CATEGORY_META[category] || { emoji: "🖼️", color: "#C47A2E", desc: "" };

  const [photos, setPhotos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTheme, setActiveTheme] = useState("All");
  const [lightbox, setLightbox]     = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/gallery`)
      .then(r => r.ok ? r.json() : { grouped: {} })
      .then(d => {
        setPhotos((d.grouped?.[category] || []).filter(p => p.imageUrl));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  const themes = ["All", ...Array.from(new Set(photos.map(p => p.theme).filter(Boolean)))];
  const visible = activeTheme === "All" ? photos : photos.filter(p => p.theme === activeTheme);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title={`${category} Gallery — Tendr`}
        description={meta.desc}
        path={`/gallery/${slug}`}
      />
      <BasicSpeedDial />
      <HamburgerNav active="Browse" />

      {/* Header */}
      <div style={{ background: "#FFFCF5", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "36px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#9B7450", fontFamily: font, fontSize: 13, cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 40 }}>{meta.emoji}</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: meta.color, margin: "0 0 4px" }}>Gallery</p>
              <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{category}</h1>
              <p style={{ fontSize: 14, color: "#9B7450", margin: 0, maxWidth: 480 }}>{meta.desc}</p>
            </div>
            {category === "Decoration" && (
              <button onClick={() => navigate("/decor-finder")}
                style={{ marginLeft: "auto", padding: "10px 22px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,#C47A2E,#CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.28)", whiteSpace: "nowrap" }}>
                ✨ Open Decor Finder
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Theme filter — only for categories with themes */}
        {themes.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {themes.map(t => (
              <button key={t} onClick={() => setActiveTheme(t)}
                style={{ padding: "7px 18px", borderRadius: 100, border: `1.5px solid ${activeTheme === t ? meta.color : "rgba(196,122,46,0.25)"}`, background: activeTheme === t ? meta.color : "#fff", color: activeTheme === t ? "#fff" : "#7A5535", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "#C47A2E", fontSize: 14 }}>Loading…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 80, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{meta.emoji}</div>
            <p style={{ fontSize: 15, color: "#9B7450" }}>No photos yet in this category.</p>
          </div>
        ) : (
          <div style={{ columns: "3 280px", gap: 14 }} className="gallery-masonry">
            {visible.map((p, i) => (
              <div key={p._id || i}
                style={{ breakInside: "avoid", marginBottom: 14, borderRadius: 12, overflow: "hidden", position: "relative", background: "#fff", cursor: "zoom-in" }}>
                <img src={p.imageUrl} alt={p.caption || category}
                  onClick={() => setLightbox(p)}
                  style={{ width: "100%", display: "block", transition: "transform 0.3s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
                {/* Download button on photo */}
                <a href={p.imageUrl} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", zIndex: 2 }}
                  className="gallery-dl-btn"
                  title="Download">⬇</a>
                {(p.theme || p.caption) && (
                  <div style={{ padding: "8px 12px", background: "#FFFCF5" }}>
                    {p.theme && <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, marginRight: 8 }}>{p.theme}</span>}
                    {p.caption && <span style={{ fontSize: 11, color: "#9B7450" }}>{p.caption}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 32 }}>{visible.length} photo{visible.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <>
          <div onClick={() => setLightbox(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 3000, cursor: "zoom-out" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 3001, maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <img src={lightbox.imageUrl} alt={lightbox.caption || category}
              onClick={() => setLightbox(null)}
              style={{ maxWidth: "100%", maxHeight: "78vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", cursor: "zoom-out" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {(lightbox.theme || lightbox.caption || lightbox.vendorName) && (
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                  {lightbox.theme && <span style={{ fontSize: 12, fontWeight: 700, color: "#CCAB4A" }}>{lightbox.theme}</span>}
                  {lightbox.caption && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{lightbox.caption}</span>}
                  {lightbox.vendorName && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>by {lightbox.vendorName}</span>}
                </div>
              )}
              {/* Download button */}
              <a
                href={lightbox.imageUrl}
                download={`tendr-${category.toLowerCase()}-${Date.now()}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              >
                ⬇ Download
              </a>
            </div>
            <button onClick={() => setLightbox(null)}
              style={{ position: "fixed", top: 20, right: 20, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✕
            </button>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 600px) { .gallery-masonry { columns: 2 140px !important; } }
        .gallery-masonry > div:hover .gallery-dl-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
