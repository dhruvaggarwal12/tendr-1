/**
 * GigProProfileView — real-data GigPro 2-column sticky profile layout.
 * Used by VendorDetails (/vendor/:id) for Anchor / Band / Choreographer.
 *
 * Props:
 *   vendor  — backend vendor object (from GET /vendors/:id)
 *   reviews — array of Review objects (from GET /vendors/:id/reviews)
 *   onBook  — () => void  — triggers booking flow
 *   onChat  — () => void  — triggers chat/sign-in
 */
import React, { useState } from "react";

const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const parch  = "#F0E8DC";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";
const dance  = "'Dancing Script', cursive";

const TABS = ["Portfolio", "About", "Packages", "Reviews", "Performance"];
const PKG_COLORS  = ["#F0E8DC", ink, "#2C1208"];
const PKG_ACCENTS = [gold, goldLt, goldLt];

// Portrait placeholder per service type
const PORTRAIT_FALLBACK = {
  Anchor:        "https://randomuser.me/api/portraits/men/45.jpg",
  Band:          "https://randomuser.me/api/portraits/men/67.jpg",
  Choreographer: "https://randomuser.me/api/portraits/women/26.jpg",
};

function fmt(n) {
  if (!n) return "Price on request";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function Stars({ r = 0, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? gold : "rgba(196,122,46,0.18)"}
          stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function PackagesContent({ packages }) {
  if (!packages?.length) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: muted, fontFamily: font }}>
      No packages listed yet.
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {packages.map((pkg, i) => {
        const bg  = PKG_COLORS[i]  ?? "#2C1208";
        const acc = PKG_ACCENTS[i] ?? goldLt;
        const isLight = i === 0;
        const textClr = isLight ? ink : "#FFF8EC";
        const subClr  = isLight ? muted : "rgba(255,248,236,0.6)";
        return (
          <div key={i} style={{ background: bg, borderRadius: 20, padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
            {pkg.badge && (
              <span style={{ position: "absolute", top: 18, right: 18, background: acc, color: isLight ? "#fff" : ink, fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 100, letterSpacing: "0.06em" }}>
                {pkg.badge}
              </span>
            )}
            <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 500, color: textClr, marginBottom: 4 }}>{pkg.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: pkg.bestFor ? 4 : 16 }}>
              <span style={{ fontFamily: serif, fontSize: "2.2rem", fontWeight: 500, color: acc }}>{fmt(pkg.price)}</span>
              <span style={{ fontSize: 12.5, color: subClr }}>{pkg.unit}</span>
            </div>
            {pkg.bestFor && <div style={{ fontSize: 12, color: subClr, marginBottom: 14, fontStyle: "italic" }}>Best for: {pkg.bestFor}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(pkg.items || []).map((item, j) => (
                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={acc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 13.5, color: isLight ? "#4A3020" : "rgba(255,248,236,0.85)", lineHeight: 1.45 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AboutContent({ vendor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {vendor.bio && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>About</h3>
          <p style={{ fontSize: 14, color: "#4A3020", lineHeight: 1.8 }}>{vendor.bio}</p>
        </div>
      )}
      {vendor.specialties?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Specialties</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {vendor.specialties.map(s => (
              <span key={s} style={{ background: cream, border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: muted }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {vendor.performingStyle?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Performing Style</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {vendor.performingStyle.map(s => (
              <span key={s} style={{ background: cream, border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: muted }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      <div className="gp-about-love" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", label: "Events Done", val: `${vendor.totalEventsCompleted || 0}+` },
          { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Rating", val: vendor.avgReviewScore?.toFixed(1) || "New" },
          { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", label: "Team Size", val: `${vendor.teamSize || 1}` },
          { icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", label: "Years Active", val: `${vendor.yearsOfExperience || 0}` },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(196,122,46,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: cream, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: ink, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsContent({ reviews }) {
  const [idx, setIdx] = useState(0);
  if (!reviews?.length) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: muted, fontFamily: font }}>
      No reviews yet.
    </div>
  );
  const r = reviews[idx % reviews.length];
  const total = reviews.length;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontFamily: serif, fontSize: "1.4rem", fontWeight: 500, color: ink }}>What Clients Say</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars r={reviews.reduce((a, rv) => a + (rv.averageRating || rv.ratings?.overall || 5), 0) / total} size={13} />
          <span style={{ fontSize: 13, fontWeight: 700, color: ink }}>{(reviews.reduce((a, rv) => a + (rv.averageRating || rv.ratings?.overall || 5), 0) / total).toFixed(1)}</span>
          <span style={{ fontSize: 12, color: muted }}>({total} reviews)</span>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, color: ink, fontSize: 15 }}>{r.consumerName || "Client"}</div>
            <div style={{ fontSize: 12, color: muted }}>{r.eventType || "Event"}{r.createdAt ? `, ${new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}</div>
          </div>
          <Stars r={r.averageRating || r.ratings?.overall || 5} size={14} />
        </div>
        <p style={{ fontSize: 14, color: "#4A3020", lineHeight: 1.75 }}>{r.reviewText}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <button onClick={() => setIdx(i => (i - 1 + total) % total)}
          style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${gold}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: gold, fontSize: 18 }}>‹</button>
        <div style={{ display: "flex", gap: 6 }}>
          {reviews.map((_, di) => (
            <button key={di} onClick={() => setIdx(di)}
              style={{ width: di === idx % total ? 20 : 7, height: 7, borderRadius: 4, border: "none", cursor: "pointer", background: di === idx % total ? gold : "rgba(196,122,46,0.25)", transition: "all 0.2s", padding: 0 }} />
          ))}
        </div>
        <button onClick={() => setIdx(i => (i + 1) % total)}
          style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${gold}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: gold, fontSize: 18 }}>›</button>
      </div>
    </div>
  );
}

function PerformanceContent({ vendor }) {
  const hasContent = vendor.genres?.length || vendor.instruments?.length || vendor.setlist?.length || vendor.social?.showreel || vendor.social?.instagram || vendor.social?.youtube;
  if (!hasContent) return null;
  return (
    <div>
      {vendor.social?.showreel && (
        <div style={{ background: ink, borderRadius: 20, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(196,122,46,0.15)", border: "1px solid rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={goldLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,248,236,0.45)", marginBottom: 4 }}>Showreel</div>
            <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 500, color: "#FFF8EC", marginBottom: 6 }}>Watch {vendor.name?.split(" ")[0]} in action</div>
            <a href={vendor.social.showreel} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: goldLt, textDecoration: "none", fontWeight: 600 }}>▶ Open Showreel →</a>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {vendor.genres?.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", gridColumn: vendor.instruments?.length ? "auto" : "1 / -1" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Genres / Styles</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {vendor.genres.map(g => <span key={g} style={{ background: cream, border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, color: "#4A3020" }}>{g}</span>)}
            </div>
          </div>
        )}
        {vendor.instruments?.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Instruments / Gear</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {vendor.instruments.map(inst => <span key={inst} style={{ background: cream, border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, color: "#4A3020" }}>{inst}</span>)}
            </div>
          </div>
        )}
      </div>
      {(vendor.social?.instagram || vendor.social?.youtube) && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Social & Links</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {vendor.social.instagram && (
              <a href={`https://instagram.com/${vendor.social.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 100, background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                {vendor.social.instagram}
              </a>
            )}
            {vendor.social.youtube && (
              <a href={`https://${vendor.social.youtube}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 100, background: "#FF0000", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                YouTube
              </a>
            )}
          </div>
        </div>
      )}
      {vendor.setlist?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Sample Set / Rundown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vendor.setlist.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: cream, border: "1px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: gold, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GigProProfileView({ vendor, reviews = [], onBook, onChat }) {
  const [tab, setTab] = useState("Portfolio");
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const portraitSrc = vendor.portfolioPhotos?.[0] || PORTRAIT_FALLBACK[vendor.serviceType] || PORTRAIT_FALLBACK.Anchor;
  const hasPerformance = !!(vendor.genres?.length || vendor.instruments?.length || vendor.setlist?.length || vendor.social?.showreel || vendor.social?.instagram || vendor.social?.youtube);
  const visibleTabs = TABS.filter(t => t !== "Performance" || hasPerformance);

  const city = vendor.city || vendor.address?.city || (vendor.locations?.[0] ?? "");
  const rating = vendor.avgReviewScore || 0;
  const events = vendor.totalEventsCompleted || 0;
  const years  = vendor.yearsOfExperience || 0;

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Outfit:wght@400;500;600;700&family=Dancing+Script:wght@600&display=swap');
        * { box-sizing: border-box; }
        .gpv-tab { padding: 10px 20px; font-size: 14px; font-weight: 600; border: none; background: none; cursor: pointer; color: #9B7450; border-bottom: 2.5px solid transparent; transition: all 0.15s; font-family: ${font}; white-space: nowrap; }
        .gpv-tab.active { color: ${ink}; border-color: ${gold}; }
        .gpv-content-grid > div { min-width: 0; }
        .gpv-about-love { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 900px) {
          .gpv-content-grid { grid-template-columns: 1fr !important; }
          .gpv-about-love { grid-template-columns: 1fr !important; }
          .gpv-top-btns { display: none !important; }
        }
        @media (max-width: 768px) {
          .gpv-mobile-hero { display: block !important; }
          .gpv-portrait-col { display: none !important; }
          .gpv-page-layout { grid-template-columns: 1fr !important; overflow-x: hidden !important; }
          .gpv-content-col { min-width: 0 !important; max-width: 100vw !important; overflow-x: hidden !important; }
          .gpv-hero-info-box { display: none !important; }
          .gpv-desktop-ctas { display: none !important; }
          .gpv-mobile-ctas { display: flex !important; }
          .gpv-sidebar { display: none !important; }
          .gpv-content-grid { padding: 16px 16px 32px !important; overflow-x: hidden !important; }
        }
      `}</style>

      {/* Mobile hero */}
      <div className="gpv-mobile-hero" style={{ display: "none", background: parch }}>
        <div style={{ position: "relative", width: "100%", height: 340, overflow: "hidden" }}>
          <img src={portraitSrc} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(28,10,4,0.2) 0%, transparent 35%, rgba(240,232,220,0.5) 88%, rgba(240,232,220,1) 100%)" }} />
        </div>
        <div style={{ marginTop: -56, position: "relative", zIndex: 2, background: parch, borderRadius: "58% 42% 0 0 / 44% 36% 0 0", paddingTop: 32, paddingLeft: 22, paddingRight: 22, paddingBottom: 8 }}>
          <h1 style={{ fontFamily: serif, fontSize: "1.95rem", fontWeight: 500, color: ink, lineHeight: 1.1, marginBottom: 6 }}>{vendor.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: muted }}>Professional {vendor.serviceType}</span>
            <span style={{ color: "rgba(155,116,80,0.4)" }}>·</span>
            <span style={{ fontSize: 12.5, color: muted }}>{city}</span>
          </div>
          {rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Stars r={rating} size={14} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>{rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: muted }}>({reviews.length} reviews)</span>
            </div>
          )}
          {vendor.tagline && <p style={{ fontFamily: serif, fontSize: "0.92rem", fontStyle: "italic", color: "#6B4B2A", lineHeight: 1.55 }}>"{vendor.tagline}"</p>}
        </div>
      </div>

      {/* Desktop 2-col layout */}
      <div className="gpv-page-layout" style={{ display: "grid", gridTemplateColumns: "420px 1fr", alignItems: "flex-start" }}>

        {/* LEFT: sticky portrait */}
        <div className="gpv-portrait-col" style={{ position: "sticky", top: 0, height: "100vh", background: parch, overflow: "hidden", borderRight: "1px solid rgba(196,122,46,0.08)" }}>
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-30%)", width: 440, height: 540, borderRadius: "50%", background: "rgba(196,122,46,0.12)", zIndex: 0 }} />
          <div style={{ display: "flex", gap: 10, position: "absolute", left: 20, top: 40, zIndex: 2 }}>
            <div style={{ width: 2, borderRadius: 2, background: "rgba(196,122,46,0.35)", minHeight: 100 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["People", "Events", "Stories"].map(w => (
                <span key={w} style={{ fontFamily: dance, fontSize: 17, color: muted, lineHeight: 1.55 }}>{w}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 36, height: "calc(100% - 64px)", position: "relative", zIndex: 1 }}>
            <div style={{ width: 360, height: 540, borderRadius: "180px 180px 22px 22px", overflow: "hidden", boxShadow: "0 28px 72px rgba(28,10,4,0.28)" }}>
              <img src={portraitSrc} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 24, left: 20, background: "#fff", borderRadius: 12, padding: "10px 16px", boxShadow: "0 6px 24px rgba(28,10,4,0.1)", zIndex: 2 }}>
            <div style={{ fontFamily: dance, fontSize: 15, color: muted, lineHeight: 1.5 }}>Real moments.</div>
            <div style={{ fontFamily: dance, fontSize: 15, color: muted, lineHeight: 1.5 }}>Real me.</div>
          </div>
        </div>

        {/* RIGHT: scrollable content */}
        <div className="gpv-content-col" style={{ minWidth: 0, overflowX: "hidden" }}>

          {/* Header */}
          <div style={{ background: parch, borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "36px 32px 28px" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div className="gpv-hero-info-box">
                  <h1 style={{ fontFamily: serif, fontSize: "clamp(1.9rem,3.5vw,2.7rem)", fontWeight: 500, color: ink, lineHeight: 1.05, marginBottom: 10 }}>{vendor.name}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {vendor.phoneVerified && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.1)", color: "#16A34A", borderRadius: 100, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Verified
                      </span>
                    )}
                    <span style={{ fontSize: 14, color: muted }}>Professional {vendor.serviceType}</span>
                    <span style={{ color: "rgba(155,116,80,0.3)" }}>·</span>
                    <span style={{ fontSize: 13, color: muted, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {city}
                    </span>
                  </div>
                  {rating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Stars r={rating} size={15} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: ink }}>{rating.toFixed(1)}</span>
                      <span style={{ fontSize: 13, color: muted }}>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                    </div>
                  )}
                  {vendor.tagline && <p style={{ fontFamily: serif, fontSize: "1rem", fontStyle: "italic", color: "#6B4B2A", lineHeight: 1.6 }}>"{vendor.tagline}"</p>}
                  <div className="gpv-desktop-ctas" style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={onChat} style={{ padding: "11px 24px", borderRadius: 100, background: ink, color: "#FFF8EC", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      💬 Chat with {vendor.name?.split(" ")[0]}
                    </button>
                    <button onClick={onBook} style={{ padding: "11px 24px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: `0 4px 14px rgba(196,122,46,0.4)` }}>
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div style={{ display: "flex", gap: 0, marginTop: 24, background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(196,122,46,0.1)" }}>
              {[
                { val: `${events}+`, label: "Events Done" },
                { val: `${years} yrs`, label: "Experience" },
                { val: vendor.teamSize || 1, label: "Team Size" },
                { val: vendor.maxConcurrentEvents || 1, label: "Takes at Once" },
              ].map((s, i, arr) => (
                <div key={i} style={{ flex: 1, padding: "14px 0", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
                  <div style={{ fontFamily: serif, fontSize: "1.25rem", fontWeight: 500, color: ink }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile CTAs */}
          <div className="gpv-mobile-ctas" style={{ display: "none", gap: 10, padding: "14px 16px", background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
            <button onClick={onChat} style={{ flex: 1, padding: "12px", borderRadius: 100, background: ink, color: "#FFF8EC", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              💬 Chat
            </button>
            <button onClick={onBook} style={{ flex: 1, padding: "12px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Book Now →
            </button>
          </div>

          {/* Tab bar */}
          <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", overflowX: "auto", paddingLeft: 20 }}>
            {visibleTabs.map(t => (
              <button key={t} className={`gpv-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {/* Tab content + sidebar */}
          <div className="gpv-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, padding: "28px 28px 48px", alignItems: "start" }}>
            <div>
              {/* Portfolio tab */}
              {tab === "Portfolio" && (
                <div>
                  {vendor.portfolioPhotos?.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {vendor.portfolioPhotos.map((url, i) => (
                        <div key={i} style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3" }}>
                          <img src={url} alt={`Portfolio ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: muted }}>
                      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎭</div>
                      <div style={{ fontFamily: serif, fontSize: "1.2rem", color: ink, marginBottom: 8 }}>Portfolio coming soon</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>This vendor is setting up their portfolio. Chat with them to see past work.</p>
                    </div>
                  )}
                </div>
              )}
              {tab === "About"       && <AboutContent vendor={vendor} />}
              {tab === "Packages"    && <PackagesContent packages={vendor.packages} />}
              {tab === "Reviews"     && <ReviewsContent reviews={reviews} />}
              {tab === "Performance" && hasPerformance && <PerformanceContent vendor={vendor} />}
            </div>

            {/* Sidebar */}
            <div className="gpv-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
              {/* Connect icons */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Connect</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {vendor.social?.instagram && (
                    <a href={`https://instagram.com/${vendor.social.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62B6D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    </a>
                  )}
                  {vendor.social?.youtube && (
                    <a href={`https://${vendor.social.youtube}`} target="_blank" rel="noopener noreferrer"
                      style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                    </a>
                  )}
                  {vendor.phoneNumber && (
                    <a href={`https://wa.me/${vendor.phoneNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      style={{ width: 40, height: 40, borderRadius: 12, background: parch, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(196,122,46,0.12)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Quote card */}
              <div style={{ background: cream, borderRadius: 16, padding: "22px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <div style={{ fontFamily: serif, fontSize: 42, color: gold, lineHeight: 0.6, marginBottom: 14, opacity: 0.7 }}>"</div>
                <p style={{ fontFamily: serif, fontSize: "1.05rem", fontStyle: "italic", color: "#5A3820", lineHeight: 1.65, margin: 0 }}>
                  {vendor.tagline || "Let's create an experience your guests will talk about."}
                </p>
                <div style={{ width: 36, height: 2.5, background: gold, marginTop: 16, borderRadius: 2 }} />
              </div>

              {/* Dark stat + CTA card */}
              <div style={{ background: ink, borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
                <p style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 400, color: "#FFF8EC", lineHeight: 1.25, marginBottom: 20 }}>
                  Great Events<br />Start with<br />a Great Artist.
                </p>
                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20, padding: "12px 0", borderTop: "1px solid rgba(255,248,236,0.08)", borderBottom: "1px solid rgba(255,248,236,0.08)" }}>
                  {[
                    { val: `${events}+`, label: "Events" },
                    { val: `${years}`, label: "Years" },
                    { val: rating > 0 ? `${rating.toFixed(1)}★` : "New", label: "Rating" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: serif, fontSize: "1.4rem", fontWeight: 500, color: goldLt, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,248,236,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={onBook} style={{ width: "100%", padding: "12px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
