import React, { useState } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
const BG    = "#17120E";   // deep espresso — warm, not pure black
const SURF  = "#1E1710";   // slightly lifted surface
const INK   = "#F0E8D5";   // warm off-white
const MUTED = "rgba(240,232,213,0.45)";
const DIM   = "rgba(240,232,213,0.22)";
const GOLD  = "#C49B30";   // champagne gold
const GDIM  = "rgba(196,155,48,0.14)";  // divider gold
const font  = "'DM Sans', system-ui, sans-serif";
const serif = "'Playfair Display', Georgia, serif";

const FALLBACK = {
  Anchor:        "https://randomuser.me/api/portraits/men/45.jpg",
  Band:          "https://randomuser.me/api/portraits/men/67.jpg",
  Choreographer: "https://randomuser.me/api/portraits/women/26.jpg",
};

const H_ICONS = [
  <svg key="h0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>,
  <svg key="h1" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  <svg key="h2" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg key="h3" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
];

function fmt(n) { return n ? "₹" + Number(n).toLocaleString("en-IN") : "Price on request"; }

function Stars({ r = 0, sz = 12 }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={sz} height={sz} viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? GOLD : "rgba(196,155,48,0.18)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

// Film grain overlay — subtle texture via SVG feTurbulence
function GrainLayer() {
  return (
    <svg
      style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:100, opacity:0.038 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="gp-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.88" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#gp-grain)"/>
    </svg>
  );
}

// Atmospheric bokeh — tiny gold dust particles near the photo
function Bokeh() {
  const pts = [
    { x:"7%",  y:"14%", s:9,  op:0.13, b:4 },
    { x:"82%", y:"8%",  s:6,  op:0.09, b:3 },
    { x:"5%",  y:"68%", s:11, op:0.11, b:5 },
    { x:"90%", y:"72%", s:7,  op:0.08, b:3 },
    { x:"42%", y:"4%",  s:5,  op:0.10, b:2 },
    { x:"55%", y:"94%", s:6,  op:0.09, b:3 },
    { x:"22%", y:"88%", s:4,  op:0.12, b:2 },
    { x:"75%", y:"38%", s:5,  op:0.08, b:2 },
  ];
  return (
    <>
      {pts.map((d, i) => (
        <div key={i} style={{
          position:"absolute", left:d.x, top:d.y,
          width:d.s, height:d.s, borderRadius:"50%",
          background:GOLD, opacity:d.op,
          filter:`blur(${d.b}px)`,
          pointerEvents:"none",
        }}/>
      ))}
    </>
  );
}

export default function GigProProfileView({ vendor, reviews = [], onBook, onChat }) {
  const [tab, setTab] = useState("Portfolio");
  const [catFilter, setCatFilter] = useState("All");

  const rawPhotos  = vendor.portfolioPhotos || [];
  const allPhotos  = rawPhotos.map(p => typeof p === "string" ? { url:p, category:"All" } : p);
  const photoCategories = ["All", ...Array.from(new Set(allPhotos.map(p => p.category).filter(c => c && c !== "All")))];
  const visiblePhotos = catFilter === "All" ? allPhotos : allPhotos.filter(p => p.category === catFilter);

  const portrait   = vendor.mainPhotoUrl || allPhotos[0]?.url || FALLBACK[vendor.serviceType] || FALLBACK.Anchor;
  const city       = vendor.city || vendor.location || vendor.address?.city || vendor.locations?.[0] || "";
  const rating     = Number(vendor.avgReviewScore) || 0;
  const events     = vendor.totalEventsCompleted || 0;
  const yrs        = vendor.yearsOfExperience || 0;
  const genres     = vendor.genres || [];
  const instr      = vendor.instruments || [];
  const social     = vendor.social || {};
  const highlights = vendor.highlights || [];
  const pkgs = (vendor.packages || []).map(p => ({
    ...p,
    items: Array.isArray(p.items) ? p.items : (p.items || "").split("\n").filter(Boolean),
  }));
  const setlistArr = Array.isArray(vendor.setlist)
    ? vendor.setlist
    : typeof vendor.setlist === "string"
    ? vendor.setlist.split("\n").filter(Boolean)
    : [];

  const tabs = ["Portfolio","About","Setlist","Packages","Reviews"].filter(t => {
    if (t === "Packages") return pkgs.length > 0;
    if (t === "Reviews")  return reviews.length > 0;
    if (t === "Setlist")  return setlistArr.length > 0;
    return true;
  });

  const stats = [
    events > 0 && { val:`${events}+`,  label:"Events Done" },
    yrs > 0    && { val:`${yrs}+ yrs`, label:"Experience"  },
    city       && { val:city,           label:"Based In"    },
  ].filter(Boolean);

  // Editorial aspect ratio sequence for portfolio grid
  const PORT_SPANS = [
    { col:"span 2", ar:"16/9"  },
    { col:"span 1", ar:"3/4"   },
    { col:"span 1", ar:"1/1"   },
    { col:"span 1", ar:"1/1"   },
    { col:"span 2", ar:"21/9"  },
    { col:"span 1", ar:"4/3"   },
    { col:"span 1", ar:"3/4"   },
    { col:"span 2", ar:"16/9"  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:font, color:INK }}>
      <GrainLayer/>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}

        /* ── Hero ─────────────────────────────────────── */
        .gp-hero {
          display: grid;
          grid-template-columns: 52% 1fr;
          min-height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          position: relative;
        }

        /* Photo column */
        .gp-photo-col {
          position: relative;
          overflow: hidden;
        }
        .gp-photo-col img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        /* Right-edge fade — blends photo seamlessly into dark bg */
        .gp-photo-fade-r {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 220px;
          background: linear-gradient(to right, transparent, ${BG});
          pointer-events: none;
        }
        /* Bottom fade */
        .gp-photo-fade-b {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 140px;
          background: linear-gradient(to bottom, transparent, ${BG});
          pointer-events: none;
        }
        /* Soft vignette corners */
        .gp-photo-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(15,10,6,0.45) 100%);
          pointer-events: none;
        }

        /* Info column */
        .gp-info-col {
          padding: 60px 56px 60px 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
          overflow-y: auto;
        }

        /* Thin gold divider */
        .gp-rule {
          border: none;
          border-top: 1px solid ${GDIM};
          margin: 26px 0;
        }

        /* Stats inline */
        .gp-stats {
          display: flex;
          align-items: stretch;
        }
        .gp-stat {
          flex: 1;
          padding: 0 20px;
          text-align: center;
        }
        .gp-stat:first-child { padding-left: 0; text-align: left; }
        .gp-stat + .gp-stat {
          border-left: 1px solid ${GDIM};
        }

        /* ── Tab bar ──────────────────────────────────── */
        .gp-tabs {
          background: ${BG};
          border-bottom: 1px solid ${GDIM};
          display: flex;
          padding: 0 56px;
          overflow-x: auto;
          scrollbar-width: none;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .gp-tabs::-webkit-scrollbar { display: none; }
        .gp-tab {
          padding: 18px 24px;
          background: none;
          border: none;
          border-bottom: 1.5px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          color: ${DIM};
          font-size: 11.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.1em;
          white-space: nowrap;
          transition: color 0.18s, border-color 0.18s;
          text-transform: uppercase;
        }
        .gp-tab.on  { color: ${INK}; border-bottom-color: ${GOLD}; }
        .gp-tab:hover:not(.on) { color: rgba(240,232,213,0.65); }

        /* ── Content area ─────────────────────────────── */
        .gp-content {
          background: ${BG};
          padding: 52px 56px 80px;
        }

        /* ── Portfolio grid ───────────────────────────── */
        .gp-port-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
        }
        .gp-port-tile {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: #0E0A07;
        }
        .gp-port-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.88;
          transition: transform 0.5s cubic-bezier(.25,.46,.45,.94), opacity 0.3s;
        }
        .gp-port-tile:hover img {
          transform: scale(1.05);
          opacity: 1;
        }
        .gp-port-tile-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,6,2,0.65) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.28s;
          display: flex;
          align-items: flex-end;
          padding: 16px 18px;
        }
        .gp-port-tile:hover .gp-port-tile-overlay { opacity: 1; }

        /* ── Mobile footer ────────────────────────────── */
        .gp-mob-footer {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          padding: 12px 20px;
          background: rgba(23,18,14,0.97);
          backdrop-filter: blur(16px);
          border-top: 1px solid ${GDIM};
          gap: 10px;
          z-index: 200;
        }

        /* ── Responsive ───────────────────────────────── */
        @media(max-width:899px) {
          .gp-hero {
            grid-template-columns: 1fr;
            min-height: auto;
            max-height: none;
            overflow: visible;
          }
          .gp-photo-col { height: 68vw; max-height: 340px; }
          .gp-photo-fade-r { display: none; }
          .gp-info-col {
            padding: 28px 20px 24px;
            justify-content: flex-start;
          }
          .gp-tabs { padding: 0 20px; position: relative; }
          .gp-content { padding: 28px 20px 80px; }
          .gp-port-grid { grid-template-columns: repeat(2,1fr); }
          .gp-stat { padding: 0 12px; }
          .gp-mob-footer { display: flex !important; }
        }
        @media(max-width:599px) {
          .gp-port-grid { grid-template-columns: 1fr; }
          .gp-port-tile { grid-column: span 1 !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════
          HERO — photo left · info right
      ═══════════════════════════════════════ */}
      <div className="gp-hero">

        {/* Photo */}
        <div className="gp-photo-col">
          <Bokeh/>
          <img src={portrait} alt={vendor.name}/>
          <div className="gp-photo-fade-r"/>
          <div className="gp-photo-fade-b"/>
          <div className="gp-photo-vignette"/>
        </div>

        {/* Info */}
        <div className="gp-info-col">

          {/* Eyebrow */}
          <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.24em", marginBottom:20, opacity:0.75 }}>
            {vendor.serviceType || "Performer"}
          </div>

          {/* Name */}
          <h1 style={{ fontFamily:serif, fontSize:"clamp(2.6rem,3.2vw,3.8rem)", fontWeight:800, color:INK, lineHeight:0.92, marginBottom:22, letterSpacing:"-0.045em" }}>
            {vendor.name}
          </h1>

          {/* Meta row */}
          <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            {(vendor.phoneVerified || vendor.verified) && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:10.5, fontWeight:700, color:GOLD, textTransform:"uppercase", letterSpacing:"0.14em" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Verified
              </span>
            )}
            {city && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:13, color:MUTED }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {city}
              </span>
            )}
            {rating > 0 && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <Stars r={rating} sz={12}/>
                <span style={{ fontSize:13.5, fontWeight:700, color:INK }}>{rating.toFixed(1)}</span>
                {reviews.length > 0 && <span style={{ fontSize:12, color:MUTED }}>({reviews.length})</span>}
              </span>
            )}
          </div>

          <hr className="gp-rule"/>

          {/* Bio */}
          {vendor.bio && (
            <p style={{ fontSize:14, color:MUTED, lineHeight:1.9, marginBottom:28, maxWidth:440, fontWeight:400, fontStyle:"italic" }}>
              {vendor.bio.length > 220 ? vendor.bio.slice(0,220)+"…" : vendor.bio}
            </p>
          )}

          {/* CTAs */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
            <button onClick={onBook} style={{
              padding:"13px 32px", borderRadius:100,
              background:`linear-gradient(135deg,#C49B30,#9A7215)`,
              color:"#0E0A07", fontSize:14, fontWeight:700,
              border:"none", cursor:"pointer", fontFamily:font,
              letterSpacing:"0.04em",
              boxShadow:"0 4px 24px rgba(196,155,48,0.25)",
            }}>
              Book Now
            </button>
            <button onClick={onChat} style={{
              padding:"12px 26px", borderRadius:100,
              background:"transparent",
              border:`1px solid rgba(196,155,48,0.28)`,
              color:`rgba(240,232,213,0.68)`, fontSize:13.5, fontWeight:500,
              cursor:"pointer", fontFamily:font,
            }}>
              Message
            </button>
            {vendor.phoneNumber && (
              <a href={`tel:${vendor.phoneNumber}`} style={{
                padding:"12px 22px", borderRadius:100,
                background:"transparent",
                border:`1px solid rgba(196,155,48,0.15)`,
                color:MUTED, fontSize:13, fontWeight:500,
                textDecoration:"none", display:"inline-flex", alignItems:"center",
              }}>
                Call
              </a>
            )}
          </div>

          {/* Response time */}
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:0 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#3FCB6A", flexShrink:0 }}/>
            <span style={{ fontSize:12, color:DIM }}>Typically replies in &lt; 2 hrs</span>
          </div>

          <hr className="gp-rule"/>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="gp-stats">
              {stats.map((s, i) => (
                <div key={i} className="gp-stat">
                  <div style={{ fontFamily:serif, fontSize:"clamp(1.6rem,2vw,2rem)", fontWeight:800, fontStyle:"italic", color:INK, lineHeight:1 }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize:10, color:MUTED, marginTop:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TAB BAR
      ═══════════════════════════════════════ */}
      <div className="gp-tabs">
        {tabs.map(t => (
          <button key={t} className={`gp-tab${tab===t?" on":""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════ */}
      <div className="gp-content">

        {/* ── PORTFOLIO ── */}
        {tab === "Portfolio" && (
          allPhotos.length > 0 ? (
            <div>
              {/* Category filter */}
              {photoCategories.length > 1 && (
                <div style={{ display:"flex", gap:8, marginBottom:32, flexWrap:"wrap" }}>
                  {photoCategories.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} style={{
                      padding:"7px 18px", borderRadius:100,
                      border:`1px solid ${catFilter===c ? GOLD : GDIM}`,
                      background:catFilter===c ? GOLD : "transparent",
                      color:catFilter===c ? "#0E0A07" : MUTED,
                      fontSize:12, fontWeight:600,
                      cursor:"pointer", fontFamily:font,
                      letterSpacing:"0.05em",
                      transition:"all 0.15s",
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Editorial grid — varying spans for visual rhythm */}
              <div className="gp-port-grid">
                {visiblePhotos.map((p, i) => {
                  const url = typeof p === "string" ? p : p.url;
                  const cat = typeof p === "string" ? "" : (p.category || "");
                  const s   = PORT_SPANS[i % PORT_SPANS.length];
                  return (
                    <div key={i} className="gp-port-tile" style={{ gridColumn:s.col, aspectRatio:s.ar }}>
                      <img src={url} alt={`${vendor.name} — ${cat || i+1}`}/>
                      <div className="gp-port-tile-overlay">
                        {cat && (
                          <span style={{ fontSize:11, fontWeight:600, color:"rgba(240,232,213,0.8)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                            {cat}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"100px 20px" }}>
              <div style={{ fontFamily:serif, fontSize:"1.5rem", fontStyle:"italic", color:MUTED, marginBottom:10 }}>
                No portfolio yet
              </div>
              <p style={{ fontSize:13.5, color:DIM, maxWidth:260, margin:"0 auto", lineHeight:1.7 }}>
                Upload photos from your dashboard to showcase past events.
              </p>
            </div>
          )
        )}

        {/* ── ABOUT ── */}
        {tab === "About" && (
          <div style={{ maxWidth:620 }}>
            {vendor.bio && (
              <p style={{ fontSize:16, color:"rgba(240,232,213,0.72)", lineHeight:1.95, marginBottom:44, fontWeight:300, fontStyle:"italic" }}>
                {vendor.bio}
              </p>
            )}

            {highlights.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:28, opacity:0.75 }}>
                  What Sets Me Apart
                </div>
                {highlights.filter(h => h.label).map((h, i) => (
                  <div key={i} style={{ display:"flex", gap:20, paddingBlock:20, borderBottom:`1px solid ${GDIM}` }}>
                    <div style={{ color:GOLD, flexShrink:0, marginTop:2, opacity:0.7 }}>
                      {H_ICONS[i % H_ICONS.length]}
                    </div>
                    <div>
                      <div style={{ fontSize:14.5, fontWeight:600, color:INK, marginBottom:5 }}>{h.label}</div>
                      <div style={{ fontSize:13, color:MUTED, lineHeight:1.65 }}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(genres.length > 0 || instr.length > 0) && (
              <div style={{ marginTop:40 }}>
                <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:16, opacity:0.75 }}>
                  {genres.length > 0 ? "Genres & Styles" : "Instruments"}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {[...genres, ...instr].map(g => (
                    <span key={g} style={{ background:SURF, border:`1px solid ${GDIM}`, borderRadius:100, padding:"7px 16px", fontSize:12.5, color:MUTED, fontWeight:500 }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(social.showreel || social.instagram || social.youtube) && (
              <div style={{ marginTop:40 }}>
                <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:16, opacity:0.75 }}>
                  Find Me Online
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {social.showreel && (
                    <a href={social.showreel} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:SURF, border:`1px solid ${GDIM}`, color:INK, textDecoration:"none", fontSize:13, fontWeight:500 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Watch Showreel
                    </a>
                  )}
                  {social.instagram && (
                    <a href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:SURF, border:`1px solid ${GDIM}`, color:"#E1306C", textDecoration:"none", fontSize:13, fontWeight:500 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3"/></svg>
                      {social.instagram}
                    </a>
                  )}
                  {social.youtube && (
                    <a href={`https://${social.youtube.replace(/^https?:\/\//,"")}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:SURF, border:`1px solid ${GDIM}`, color:"#FF4444", textDecoration:"none", fontSize:13, fontWeight:500 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SETLIST ── */}
        {tab === "Setlist" && (
          <div style={{ maxWidth:600 }}>
            <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:32, opacity:0.75 }}>
              {vendor.serviceType === "Band" || vendor.serviceType === "Singer" || vendor.serviceType === "Musician"
                ? "Song List / Repertoire"
                : vendor.serviceType === "Choreographer"
                ? "Routines & Performances"
                : "Performance Rundown"}
            </div>
            {setlistArr.map((line, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:20, paddingBlock:18, borderBottom:`1px solid ${GDIM}` }}>
                <span style={{ fontSize:11, fontWeight:700, color:GOLD, opacity:0.55, minWidth:28, paddingTop:2, fontFamily:"monospace", flexShrink:0, letterSpacing:"0.05em" }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <span style={{ fontSize:15, color:"rgba(240,232,213,0.75)", lineHeight:1.65, fontWeight:400 }}>{line}</span>
              </div>
            ))}
            {(social.showreel || vendor.showreel) && (
              <div style={{ marginTop:40 }}>
                <a href={social.showreel || vendor.showreel} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 26px", borderRadius:100, background:`linear-gradient(135deg,#C49B30,#9A7215)`, color:"#0E0A07", textDecoration:"none", fontSize:13.5, fontWeight:700, boxShadow:"0 4px 18px rgba(196,155,48,0.22)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Full Showreel
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── PACKAGES ── */}
        {tab === "Packages" && (
          <div style={{ display:"flex", flexDirection:"column", gap:2, maxWidth:620 }}>
            {pkgs.map((pkg, i) => (
              <div key={i} style={{
                background: i===1 ? "#221A10" : SURF,
                borderRadius: 4,
                padding: "32px 36px",
                border: i===1 ? `1px solid rgba(196,155,48,0.3)` : `1px solid ${GDIM}`,
                marginBottom: 12,
              }}>
                {pkg.badge && (
                  <div style={{ fontSize:9.5, fontWeight:700, color:GOLD, textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:12, opacity:0.8 }}>
                    {pkg.badge}
                  </div>
                )}
                <div style={{ fontFamily:serif, fontSize:"1.4rem", fontWeight:700, color:INK, marginBottom:6 }}>{pkg.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:18 }}>
                  <span style={{ fontFamily:serif, fontSize:"2rem", fontWeight:800, fontStyle:"italic", color:GOLD }}>{fmt(pkg.price)}</span>
                  <span style={{ fontSize:12, color:MUTED }}>{pkg.unit}</span>
                </div>
                {pkg.bestFor && <div style={{ fontSize:12.5, color:MUTED, marginBottom:18, fontStyle:"italic" }}>Best for: {pkg.bestFor}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {pkg.items.map((item, j) => (
                    <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                      <div style={{ width:1, borderRight:`1px solid ${GOLD}`, alignSelf:"stretch", opacity:0.4, flexShrink:0, marginTop:3 }}/>
                      <span style={{ fontSize:13.5, color:MUTED, lineHeight:1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "Reviews" && (
          <div style={{ maxWidth:620 }}>
            {rating > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40, paddingBottom:28, borderBottom:`1px solid ${GDIM}` }}>
                <div style={{ fontFamily:serif, fontSize:"3rem", fontWeight:800, fontStyle:"italic", color:INK, lineHeight:1 }}>{rating.toFixed(1)}</div>
                <div>
                  <Stars r={rating} sz={15}/>
                  <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>{reviews.length} {reviews.length===1?"review":"reviews"}</div>
                </div>
              </div>
            )}
            {reviews.map((r, i) => (
              <div key={i} style={{ paddingBlock:28, borderBottom:`1px solid ${GDIM}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:14.5, fontWeight:600, color:INK }}>{r.consumerName || "Client"}</div>
                    <div style={{ fontSize:12, color:MUTED, marginTop:3 }}>{r.eventType || "Event"}</div>
                  </div>
                  <Stars r={r.averageRating || r.ratings?.overall || 5} sz={12}/>
                </div>
                <p style={{ fontSize:14, color:MUTED, lineHeight:1.85, margin:0, fontStyle:"italic" }}>{r.reviewText}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Mobile footer */}
      <div className="gp-mob-footer">
        <button onClick={onBook} style={{ flex:1, padding:"13px", borderRadius:100, background:`linear-gradient(135deg,#C49B30,#9A7215)`, color:"#0E0A07", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font }}>
          Book Now
        </button>
        <button onClick={onChat} style={{ padding:"13px 24px", borderRadius:100, background:"transparent", border:`1px solid rgba(196,155,48,0.28)`, color:`rgba(240,232,213,0.68)`, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:font }}>
          Message
        </button>
      </div>
    </div>
  );
}
