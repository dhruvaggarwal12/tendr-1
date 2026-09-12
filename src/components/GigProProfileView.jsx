import React, { useState } from "react";

const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const muted  = "#9B7450";
const font   = "'Jost', sans-serif";
const serif  = "'Playfair Display', Georgia, serif";

const FALLBACK = {
  Anchor:        "https://randomuser.me/api/portraits/men/45.jpg",
  Band:          "https://randomuser.me/api/portraits/men/67.jpg",
  Choreographer: "https://randomuser.me/api/portraits/women/26.jpg",
};

// 4 cycling SVG icons for highlights
const H_ICONS = [
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
];

function fmt(n) { return n ? "₹" + Number(n).toLocaleString("en-IN") : "Price on request"; }

function Stars({ r = 0, sz = 13 }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={sz} height={sz} viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? gold : "rgba(196,122,46,0.18)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function GigProProfileView({ vendor, reviews = [], onBook, onChat }) {
  const [tab, setTab] = useState("Portfolio");
  const [catFilter, setCatFilter] = useState("All");

  // Normalise photos — support both string[] and {url,category}[]
  const rawPhotos = vendor.portfolioPhotos || [];
  const allPhotos = rawPhotos.map(p => typeof p === "string" ? { url: p, category: "All" } : p);
  const photoCategories = ["All", ...Array.from(new Set(allPhotos.map(p => p.category).filter(c => c && c !== "All")))];
  const visiblePhotos = catFilter === "All" ? allPhotos : allPhotos.filter(p => p.category === catFilter);

  // Portrait: explicit mainPhotoUrl, or first photo, or fallback
  const portrait = vendor.mainPhotoUrl
    || (allPhotos[0]?.url)
    || FALLBACK[vendor.serviceType]
    || FALLBACK.Anchor;

  const city      = vendor.city || vendor.location || vendor.address?.city || vendor.locations?.[0] || "";
  const rating    = Number(vendor.avgReviewScore) || 0;
  const events    = vendor.totalEventsCompleted || 0;
  const yrs       = vendor.yearsOfExperience || 0;
  const genres    = vendor.genres || [];
  const instr     = vendor.instruments || [];
  const social    = vendor.social || {};
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

  // Stats strip items — only show non-zero
  const stats = [
    events > 0 && { val: `${events}+`, label: "Events Done" },
    yrs > 0    && { val: `${yrs} yrs`, label: "Experience" },
    city       && { val: city,          label: "Based In" },
  ].filter(Boolean);

  return (
    <div style={{ minHeight:"100vh", background:cream, fontFamily:font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Jost:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        .gp-tab{padding:14px 0;font-size:13px;font-weight:600;letter-spacing:0.01em;border:none;background:none;cursor:pointer;color:${muted};border-bottom:2px solid transparent;transition:all 0.15s;font-family:${font};white-space:nowrap}
        .gp-tab.on{color:${ink};border-color:${gold}}
        .gp-tab:hover:not(.on){color:${ink}}
        .gp-tabbar{border-bottom:1px solid rgba(196,122,46,0.1);display:flex;gap:24px;overflow-x:auto;scrollbar-width:none;padding:0 44px}
        .gp-tabbar::-webkit-scrollbar{display:none}
        .gp-content{padding:36px 44px 80px}
        .gp-portrait{position:sticky;top:0;height:100vh;overflow:hidden}
        .gp-mobile-hero{display:none}
        .gp-desktop-header{padding:52px 44px 0}
        .gp-dt-ctas{display:flex;gap:10px;margin-top:24px}
        .gp-stats-strip{display:flex;gap:0;padding:20px 44px;border-bottom:1px solid rgba(196,122,46,0.07)}
        .gp-mob-footer{display:none;position:fixed;bottom:0;left:0;right:0;padding:12px 20px;background:#fff;border-top:1px solid rgba(196,122,46,0.1);gap:10px;z-index:50}
        .gp-masonry{columns:2;column-gap:10px}
        .gp-masonry-item{break-inside:avoid;margin-bottom:10px;border-radius:16px;overflow:hidden;display:block}
        .gp-masonry-item img{width:100%;display:block;object-fit:cover}
        @media(min-width:900px){.gp-layout{display:grid;grid-template-columns:400px 1fr}}
        @media(max-width:899px){
          .gp-portrait{display:none!important}
          .gp-mobile-hero{display:block!important}
          .gp-desktop-header{display:none!important}
          .gp-dt-ctas{display:none!important}
          .gp-stats-strip{display:none!important}
          .gp-mob-footer{display:flex!important}
          .gp-tabbar{padding:0 20px!important;gap:20px!important}
          .gp-content{padding:28px 20px 100px!important}
        }
      `}</style>

      <div className="gp-layout">
        {/* ── Left: sticky portrait ── */}
        <div className="gp-portrait">
          <img src={portrait} alt={vendor.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
        </div>

        {/* ── Right: scrollable ── */}
        <div style={{ minWidth:0 }}>

          {/* Mobile hero */}
          <div className="gp-mobile-hero">
            <div style={{ position:"relative", width:"100%", height:"62svh", overflow:"hidden" }}>
              <img src={portrait} alt={vendor.name}
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 45%,rgba(250,247,242,0.6) 78%,#FAF7F2 100%)" }}/>
            </div>
            <div style={{ padding:"0 20px 16px" }}>
              <h1 style={{ fontFamily:serif, fontSize:"2.2rem", fontWeight:700, color:ink, lineHeight:1.1, margin:"0 0 8px" }}>{vendor.name}</h1>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                {(vendor.phoneVerified || vendor.verified) && (
                  <span style={{ fontSize:11, fontWeight:700, color:"#16A34A", background:"rgba(34,197,94,0.08)", padding:"2px 9px", borderRadius:100 }}>✓ Verified</span>
                )}
                <span style={{ fontSize:13, color:muted }}>{vendor.serviceType}{city ? ` · ${city}` : ""}</span>
              </div>
              {rating > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <Stars r={rating} sz={13}/>
                  <span style={{ fontSize:13.5, fontWeight:700, color:ink }}>{rating.toFixed(1)}</span>
                  {events > 0 && <span style={{ fontSize:12, color:muted }}>· {events}+ events</span>}
                </div>
              )}
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button onClick={onBook} style={{ flex:1, padding:"12px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font }}>Book Now</button>
                <button onClick={onChat} style={{ padding:"12px 22px", borderRadius:100, background:"transparent", border:`1.5px solid rgba(196,122,46,0.28)`, color:ink, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>Message</button>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="gp-desktop-header">
            <h1 style={{ fontFamily:serif, fontSize:"clamp(2.2rem,3.5vw,3rem)", fontWeight:700, color:ink, lineHeight:1.05, marginBottom:12 }}>{vendor.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:16 }}>
              {(vendor.phoneVerified || vendor.verified) && (
                <span style={{ fontSize:11.5, fontWeight:700, color:"#16A34A", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", padding:"3px 10px", borderRadius:100, display:"flex", alignItems:"center", gap:4 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
              )}
              <span style={{ fontSize:14, color:muted }}>{vendor.serviceType}</span>
              {city && <><span style={{ color:"rgba(155,116,80,0.3)" }}>·</span>
                <span style={{ fontSize:13.5, color:muted, display:"flex", alignItems:"center", gap:4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {city}
                </span>
              </>}
              {rating > 0 && <><span style={{ color:"rgba(155,116,80,0.3)" }}>·</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <Stars r={rating} sz={13}/>
                  <span style={{ fontSize:14, fontWeight:700, color:ink }}>{rating.toFixed(1)}</span>
                  {reviews.length > 0 && <span style={{ fontSize:12.5, color:muted }}>({reviews.length})</span>}
                </div>
              </>}
            </div>
            {vendor.bio && <p style={{ fontSize:14.5, color:"#5A3820", lineHeight:1.8, maxWidth:520, margin:"0 0 6px" }}>{vendor.bio.length > 220 ? vendor.bio.slice(0,220)+"…" : vendor.bio}</p>}
            <div className="gp-dt-ctas">
              <button onClick={onBook} style={{ padding:"13px 32px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font, boxShadow:"0 4px 18px rgba(196,122,46,0.35)" }}>
                Book Now
              </button>
              <button onClick={onChat} style={{ padding:"13px 28px", borderRadius:100, background:"transparent", border:`1.5px solid rgba(196,122,46,0.28)`, color:ink, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>
                Message
              </button>
              {vendor.phoneNumber && (
                <a href={`tel:${vendor.phoneNumber}`} style={{ padding:"13px 20px", borderRadius:100, border:"1.5px solid rgba(196,122,46,0.14)", color:muted, fontSize:13, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center" }}>Call</a>
              )}
            </div>
          </div>

          {/* ── Stats strip ── */}
          {stats.length > 0 && (
            <div className="gp-stats-strip">
              {stats.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width:1, background:"rgba(196,122,46,0.12)", margin:"0 28px" }}/>}
                  <div>
                    <div style={{ fontFamily:serif, fontSize:"1.45rem", fontWeight:700, color:ink, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:11.5, color:muted, marginTop:4, letterSpacing:"0.02em" }}>{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Tab bar */}
          <div className="gp-tabbar" style={{ marginTop:8 }}>
            {tabs.map(t => (
              <button key={t} className={`gp-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</button>
            ))}
          </div>

          {/* Tab content */}
          <div className="gp-content">

            {/* ── PORTFOLIO ── */}
            {tab === "Portfolio" && (
              allPhotos.length > 0 ? (
                <div>
                  {/* Category filter tabs */}
                  {photoCategories.length > 1 && (
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                      {photoCategories.map(c => (
                        <button key={c} onClick={() => setCatFilter(c)}
                          style={{ padding:"6px 16px", borderRadius:100, border:`1.5px solid ${catFilter===c ? gold : "rgba(196,122,46,0.18)"}`, background:catFilter===c ? gold : "transparent", color:catFilter===c ? "#fff" : muted, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:font, transition:"all 0.12s" }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Masonry grid — editorial, varied sizes */}
                  <div className="gp-masonry">
                    {visiblePhotos.map((p, i) => {
                      const url = typeof p === "string" ? p : p.url;
                      // Vary the aspect ratio for editorial feel
                      const aspectRatios = ["3/4","4/3","1/1","16/9","2/3","4/3"];
                      const ar = aspectRatios[i % aspectRatios.length];
                      return (
                        <div key={i} className="gp-masonry-item">
                          <img src={url} alt={`${vendor.name} ${i+1}`} style={{ aspectRatio:ar }}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"80px 20px", color:muted }}>
                  <div style={{ fontSize:40, marginBottom:16, opacity:0.2 }}>🎭</div>
                  <div style={{ fontFamily:serif, fontSize:"1.25rem", color:ink, marginBottom:8 }}>Portfolio coming soon</div>
                  <p style={{ fontSize:13.5, lineHeight:1.7, maxWidth:280, margin:"0 auto" }}>Chat with {vendor.name?.split(" ")[0] || "this artist"} to see past work.</p>
                </div>
              )
            )}

            {/* ── ABOUT ── */}
            {tab === "About" && (
              <div style={{ display:"flex", flexDirection:"column", gap:32, maxWidth:580 }}>
                {vendor.bio && (
                  <p style={{ fontSize:15, color:"#4A3020", lineHeight:1.85, margin:0 }}>{vendor.bio}</p>
                )}

                {/* Feature highlights */}
                {highlights.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                    {highlights.filter(h => h.label).map((h, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:16, paddingBlock:18, borderBottom:i < highlights.length-1 ? "1px solid rgba(196,122,46,0.07)" : "none" }}>
                        <div style={{ width:42, height:42, borderRadius:12, background:"rgba(196,122,46,0.08)", display:"flex", alignItems:"center", justifyContent:"center", color:gold, flexShrink:0 }}>
                          {H_ICONS[i % H_ICONS.length]}
                        </div>
                        <div>
                          <div style={{ fontSize:14.5, fontWeight:700, color:ink, marginBottom:3 }}>{h.label}</div>
                          <div style={{ fontSize:13, color:muted, lineHeight:1.55 }}>{h.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Genre/style chips */}
                {(genres.length > 0 || instr.length > 0) && (
                  <div>
                    <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:12 }}>
                      {genres.length > 0 ? "Genres & Styles" : "Instruments"}
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {[...genres, ...instr].map(g => (
                        <span key={g} style={{ background:"#fff", border:"1px solid rgba(196,122,46,0.18)", borderRadius:100, padding:"6px 15px", fontSize:13, color:"#4A3020", fontWeight:500 }}>{g}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social links */}
                {(social.showreel || social.instagram || social.youtube) && (
                  <div>
                    <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:12 }}>Find Me Online</div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {social.showreel && (
                        <a href={social.showreel} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(196,122,46,0.2)", color:ink, textDecoration:"none", fontSize:13, fontWeight:600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Watch Showreel
                        </a>
                      )}
                      {social.instagram && (
                        <a href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(196,122,46,0.15)", color:"#C62B6D", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg>
                          {social.instagram}
                        </a>
                      )}
                      {social.youtube && (
                        <a href={`https://${social.youtube.replace(/^https?:\/\//,"")}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(196,122,46,0.15)", color:"#FF0000", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
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
                <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:24 }}>
                  {vendor.serviceType === "Band" || vendor.serviceType === "Singer" || vendor.serviceType === "Musician"
                    ? "Song List / Repertoire"
                    : vendor.serviceType === "Choreographer"
                    ? "Routines & Performances"
                    : "Performance Rundown"}
                </div>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {setlistArr.map((line, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:18, paddingBlock:16, borderBottom:i < setlistArr.length-1 ? "1px solid rgba(196,122,46,0.07)" : "none" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:gold, minWidth:26, paddingTop:2, fontFamily:"monospace", flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                      <span style={{ fontSize:14.5, color:"#4A3020", lineHeight:1.6 }}>{line}</span>
                    </div>
                  ))}
                </div>
                {(social.showreel || vendor.showreel) && (
                  <div style={{ marginTop:32 }}>
                    <a href={social.showreel || vendor.showreel} target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 24px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", textDecoration:"none", fontSize:13.5, fontWeight:700, boxShadow:"0 4px 18px rgba(196,122,46,0.3)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Watch Full Showreel
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ── PACKAGES ── */}
            {tab === "Packages" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:600 }}>
                {pkgs.map((pkg, i) => (
                  <div key={i} style={{ background:i===1?ink:"#fff", borderRadius:20, padding:"28px", border:i!==1?"1px solid rgba(196,122,46,0.12)":"none" }}>
                    {pkg.badge && <span style={{ display:"inline-block", background:gold, color:"#fff", fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:100, letterSpacing:"0.06em", marginBottom:12 }}>{pkg.badge}</span>}
                    <div style={{ fontFamily:serif, fontSize:"1.35rem", fontWeight:500, color:i===1?"#FFF8EC":ink, marginBottom:4 }}>{pkg.name}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:16 }}>
                      <span style={{ fontFamily:serif, fontSize:"1.9rem", fontWeight:700, color:i===1?goldLt:gold }}>{fmt(pkg.price)}</span>
                      <span style={{ fontSize:12.5, color:i===1?"rgba(255,248,236,0.5)":muted }}>{pkg.unit}</span>
                    </div>
                    {pkg.bestFor && <div style={{ fontSize:12.5, color:i===1?"rgba(255,248,236,0.5)":muted, marginBottom:14, fontStyle:"italic" }}>Best for: {pkg.bestFor}</div>}
                    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                      {pkg.items.map((item, j) => (
                        <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={i===1?goldLt:gold} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginTop:3 }}><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ fontSize:13.5, color:i===1?"rgba(255,248,236,0.8)":"#4A3020", lineHeight:1.45 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── REVIEWS ── */}
            {tab === "Reviews" && (
              <div style={{ maxWidth:600 }}>
                {rating > 0 && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
                    <Stars r={rating} sz={16}/>
                    <span style={{ fontSize:16, fontWeight:800, color:ink }}>{rating.toFixed(1)}</span>
                    <span style={{ fontSize:13.5, color:muted }}>({reviews.length} {reviews.length===1?"review":"reviews"})</span>
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ paddingBottom:24, marginBottom:24, borderBottom:i<reviews.length-1?"1px solid rgba(196,122,46,0.08)":"none" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div>
                          <div style={{ fontWeight:700, color:ink, fontSize:14 }}>{r.consumerName || "Client"}</div>
                          <div style={{ fontSize:12, color:muted, marginTop:2 }}>{r.eventType || "Event"}</div>
                        </div>
                        <Stars r={r.averageRating || r.ratings?.overall || 5} sz={13}/>
                      </div>
                      <p style={{ fontSize:14, color:"#4A3020", lineHeight:1.8, margin:0 }}>{r.reviewText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="gp-mob-footer">
        <button onClick={onBook} style={{ flex:1, padding:"13px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font }}>Book Now</button>
        <button onClick={onChat} style={{ padding:"13px 24px", borderRadius:100, background:"transparent", border:`1.5px solid rgba(196,122,46,0.25)`, color:ink, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>Message</button>
      </div>
    </div>
  );
}
