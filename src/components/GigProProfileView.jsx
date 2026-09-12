import React, { useState } from "react";

const bg    = "#F6F0E6";
const cream = "#EFE6D8";
const ink   = "#211A1A";
const gold  = "#C99032";
const goldLt = "#D4A84B";
const hero  = "#1D1512";
const muted = "#8B7355";
const font  = "'Jost', sans-serif";
const serif = "'Playfair Display', Georgia, serif";

const FALLBACK = {
  Anchor:        "https://randomuser.me/api/portraits/men/45.jpg",
  Band:          "https://randomuser.me/api/portraits/men/67.jpg",
  Choreographer: "https://randomuser.me/api/portraits/women/26.jpg",
};

const H_ICONS = [
  <svg key="h0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>,
  <svg key="h1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  <svg key="h2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg key="h3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
];

function StatIcon({ type }) {
  if (type === "events") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  if (type === "experience") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5"/>
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function fmt(n) { return n ? "₹" + Number(n).toLocaleString("en-IN") : "Price on request"; }

function Stars({ r = 0, sz = 13 }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={sz} height={sz} viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? gold : "rgba(201,144,50,0.22)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function GigProProfileView({ vendor, reviews = [], onBook, onChat }) {
  const [tab, setTab] = useState("Portfolio");
  const [catFilter, setCatFilter] = useState("All");

  const rawPhotos  = vendor.portfolioPhotos || [];
  const allPhotos  = rawPhotos.map(p => typeof p === "string" ? { url: p, category: "All" } : p);
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
    events > 0 && { val: `${events}+`, label: "Events Done",  iconType: "events" },
    yrs > 0    && { val: `${yrs}+ yrs`, label: "Experience",  iconType: "experience" },
    city       && { val: city,           label: "Based In",    iconType: "location" },
  ].filter(Boolean);

  return (
    <div style={{ minHeight:"100vh", background:bg, fontFamily:font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Jost:wght@300;400;500;600;700;800&family=Dancing+Script:wght@500;700&display=swap');
        *{box-sizing:border-box}

        .gp-hero {
          background: #1D1512;
          padding: 44px 52px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0 44px;
          align-items: start;
        }

        .gp-photo-card {
          width: 255px;
          height: 345px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }

        .gp-hero-divider { width:1px; background:rgba(255,255,255,0.07); align-self:stretch; }

        .gp-v-stats { display:flex; flex-direction:column; gap:26px; }

        .gp-tab-bar {
          display: flex;
          padding: 0 52px;
          background: ${bg};
          border-bottom: 1px solid rgba(33,26,26,0.1);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .gp-tab-bar::-webkit-scrollbar { display:none; }
        .gp-tab {
          padding: 16px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: rgba(33,26,26,0.38);
          font-size: 14px;
          font-weight: 700;
          font-family: 'Jost', sans-serif;
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          border-bottom: 2.5px solid transparent;
          margin-bottom: -1px;
          letter-spacing: 0.01em;
        }
        .gp-tab.on { color: ${ink}; border-bottom-color: ${gold}; }
        .gp-tab:hover:not(.on) { color: rgba(33,26,26,0.72); }

        .gp-content { padding: 36px 52px 80px; background: ${bg}; }

        .gp-highlights-row {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 6px;
        }
        .gp-highlights-row::-webkit-scrollbar { display:none; }

        .gp-evt-card {
          flex-shrink: 0;
          width: 280px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          aspect-ratio: 16/10;
          cursor: pointer;
          background: #2A1F18;
        }

        .gp-mob-footer { display:none; position:fixed; bottom:0; left:0; right:0; padding:12px 20px; background:#fff; border-top:1px solid rgba(33,26,26,0.08); gap:10px; z-index:50; }

        .gp-masonry { columns:2; column-gap:10px; }
        .gp-masonry-item { break-inside:avoid; margin-bottom:10px; border-radius:14px; overflow:hidden; }
        .gp-masonry-item img { width:100%; display:block; object-fit:cover; }

        @media(max-width:899px) {
          .gp-hero { grid-template-columns:1fr; padding:24px 20px; gap:24px; }
          .gp-photo-card { width:100%; height:62vw; max-height:320px; }
          .gp-hero-divider { display:none!important; }
          .gp-v-stats { flex-direction:row!important; flex-wrap:wrap; gap:18px!important; }
          .gp-tab-bar { padding:0 20px; }
          .gp-content { padding:28px 20px 80px; }
          .gp-mob-footer { display:flex!important; }
          .gp-evt-card { width:220px; }
        }
      `}</style>

      {/* ── Dark hero card ── */}
      <div className="gp-hero">

        {/* Photo card */}
        <div className="gp-photo-card">
          <img src={portrait} alt={vendor.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.65) 100%)" }}/>
          <div style={{ position:"absolute", bottom:54, right:14, fontFamily:"'Dancing Script', cursive", fontSize:19, color:"rgba(255,255,255,0.38)", lineHeight:1.5, textAlign:"right", pointerEvents:"none", textShadow:"0 1px 4px rgba(0,0,0,0.4)" }}>
            Turning<br/>Moments<br/>Into Memories
          </div>
          <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(0,0,0,0.52)", backdropFilter:"blur(7px)", color:"#fff", fontSize:10.5, fontWeight:600, padding:"5px 12px", borderRadius:100, display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", flexShrink:0 }}/>
            Available for Bookings
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingLeft:4 }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:14 }}>
            Professional {vendor.serviceType || "Artist"}
          </div>

          <h1 style={{ fontFamily:serif, fontSize:"clamp(2.4rem,3.2vw,3.2rem)", fontWeight:800, color:"#fff", lineHeight:1.0, marginBottom:14, letterSpacing:"-0.03em", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            {vendor.name}
            {(vendor.phoneVerified || vendor.verified) && (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
          </h1>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            {city && (
              <span style={{ fontSize:13.5, color:"rgba(255,255,255,0.52)", display:"flex", alignItems:"center", gap:5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {city}
              </span>
            )}
            {rating > 0 && (
              <>
                <span style={{ color:"rgba(255,255,255,0.18)" }}>•</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <Stars r={rating} sz={13}/>
                  <span style={{ fontSize:14.5, fontWeight:800, color:"#fff" }}>{rating.toFixed(1)}</span>
                  {reviews.length > 0 && <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.38)" }}>({reviews.length} reviews)</span>}
                </div>
              </>
            )}
          </div>

          {vendor.bio && (
            <p style={{ fontSize:14.5, color:"rgba(255,255,255,0.58)", lineHeight:1.85, marginBottom:28, maxWidth:500, fontWeight:400 }}>
              {vendor.bio.length > 260 ? vendor.bio.slice(0,260)+"…" : vendor.bio}
            </p>
          )}

          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:14 }}>
            <button onClick={onBook} style={{ display:"flex", alignItems:"center", gap:9, padding:"13px 28px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font, boxShadow:"0 4px 22px rgba(201,144,50,0.48)", letterSpacing:"0.01em" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Book Now
            </button>
            <button onClick={onChat} style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:100, background:"transparent", border:"1.5px solid rgba(255,255,255,0.18)", color:"rgba(255,255,255,0.82)", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
            {vendor.phoneNumber && (
              <a href={`tel:${vendor.phoneNumber}`} style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 22px", borderRadius:100, background:"transparent", border:"1.5px solid rgba(255,255,255,0.18)", color:"rgba(255,255,255,0.82)", fontSize:14, fontWeight:600, textDecoration:"none", fontFamily:font }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.9 19.79 19.79 0 0 1 1.07 5.23 2 2 0 0 1 3 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                Call
              </a>
            )}
          </div>

          <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.32)", display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", flexShrink:0 }}/>
            Typically replies in &lt; 2 hrs
          </div>
        </div>

        {/* Stats + script */}
        <div style={{ display:"flex", gap:32, alignItems:"flex-start" }}>
          <div className="gp-hero-divider"/>
          <div className="gp-v-stats">
            {stats.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:50, height:50, borderRadius:14, background:"rgba(201,144,50,0.1)", border:"1px solid rgba(201,144,50,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:gold, flexShrink:0 }}>
                  <StatIcon type={s.iconType}/>
                </div>
                <div>
                  <div style={{ fontFamily:serif, fontSize:"1.65rem", fontWeight:700, color:"#fff", lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.32)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"'Dancing Script', cursive", fontSize:24, color:gold, opacity:0.4, lineHeight:1.55, paddingTop:6, textAlign:"center", whiteSpace:"nowrap" }}>
            Good<br/>People<br/>Great<br/>Events
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="gp-tab-bar">
        {tabs.map(t => (
          <button key={t} className={`gp-tab${tab===t?" on":""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="gp-content">

        {/* PORTFOLIO */}
        {tab === "Portfolio" && (
          allPhotos.length > 0 ? (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <h2 style={{ fontFamily:serif, fontSize:"1.55rem", fontWeight:700, color:ink, margin:0, letterSpacing:"-0.01em" }}>Highlights from past events</h2>
                <span style={{ fontSize:13.5, fontWeight:600, color:muted }}>View All →</span>
              </div>

              {photoCategories.length > 1 && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:22, overflowX:"auto", paddingBottom:4 }}>
                  {photoCategories.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)}
                      style={{ padding:"7px 18px", borderRadius:100, border:"none", background:catFilter===c ? gold : cream, color:catFilter===c ? "#fff" : muted, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:font, transition:"all 0.12s", flexShrink:0 }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Horizontal cinematic event cards */}
              <div className="gp-highlights-row">
                {visiblePhotos.map((p, i) => {
                  const url = typeof p === "string" ? p : p.url;
                  const cat = typeof p === "string" ? "Event" : (p.category || "Event");
                  return (
                    <div key={i} className="gp-evt-card">
                      <img src={url} alt={`${vendor.name} ${i+1}`}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72) 100%)" }}/>
                      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.88)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={ink} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px" }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:5 }}>{cat}</div>
                        <div style={{ width:28, height:2, background:gold, borderRadius:2 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Also show masonry below for full portfolio */}
              {visiblePhotos.length > 3 && (
                <div style={{ marginTop:32 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Full Portfolio</div>
                  <div className="gp-masonry">
                    {visiblePhotos.map((p, i) => {
                      const url = typeof p === "string" ? p : p.url;
                      const aspectRatios = ["3/4","4/3","1/1","16/9","2/3","4/3"];
                      return (
                        <div key={i} className="gp-masonry-item">
                          <img src={url} alt={`${vendor.name} ${i+1}`} style={{ aspectRatio:aspectRatios[i % aspectRatios.length] }}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"80px 20px" }}>
              <svg style={{ opacity:0.16, marginBottom:16 }} width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div style={{ fontFamily:serif, fontSize:"1.3rem", fontWeight:700, color:ink, marginBottom:8 }}>Portfolio coming soon</div>
              <p style={{ fontSize:13.5, color:muted, lineHeight:1.7, maxWidth:280, margin:"0 auto" }}>
                Chat with {vendor.name?.split(" ")[0] || "this artist"} to see past work.
              </p>
            </div>
          )
        )}

        {/* ABOUT */}
        {tab === "About" && (
          <div style={{ display:"flex", flexDirection:"column", gap:32, maxWidth:580 }}>
            {vendor.bio && (
              <p style={{ fontSize:15.5, color:"#3A2A1A", lineHeight:1.9, margin:0 }}>{vendor.bio}</p>
            )}
            {highlights.length > 0 && (
              <div>
                {highlights.filter(h => h.label).map((h, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:16, paddingBlock:18, borderBottom:i < highlights.length-1 ? "1px solid rgba(33,26,26,0.07)" : "none" }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:"rgba(201,144,50,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:gold, flexShrink:0 }}>
                      {H_ICONS[i % H_ICONS.length]}
                    </div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:ink, marginBottom:4 }}>{h.label}</div>
                      <div style={{ fontSize:13, color:muted, lineHeight:1.6 }}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(genres.length > 0 || instr.length > 0) && (
              <div>
                <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:12 }}>
                  {genres.length > 0 ? "Genres & Styles" : "Instruments"}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {[...genres, ...instr].map(g => (
                    <span key={g} style={{ background:cream, border:"1px solid rgba(33,26,26,0.1)", borderRadius:100, padding:"6px 16px", fontSize:13, color:"#3A2A1A", fontWeight:500 }}>{g}</span>
                  ))}
                </div>
              </div>
            )}
            {(social.showreel || social.instagram || social.youtube) && (
              <div>
                <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:12 }}>Find Me Online</div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {social.showreel && (
                    <a href={social.showreel} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:cream, border:"1.5px solid rgba(33,26,26,0.1)", color:ink, textDecoration:"none", fontSize:13, fontWeight:600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Watch Showreel
                    </a>
                  )}
                  {social.instagram && (
                    <a href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:cream, border:"1.5px solid rgba(33,26,26,0.1)", color:"#C62B6D", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg>
                      {social.instagram}
                    </a>
                  )}
                  {social.youtube && (
                    <a href={`https://${social.youtube.replace(/^https?:\/\//,"")}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:cream, border:"1.5px solid rgba(33,26,26,0.1)", color:"#FF0000", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETLIST */}
        {tab === "Setlist" && (
          <div style={{ maxWidth:600 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:24 }}>
              {vendor.serviceType === "Band" || vendor.serviceType === "Singer" || vendor.serviceType === "Musician"
                ? "Song List / Repertoire"
                : vendor.serviceType === "Choreographer"
                ? "Routines & Performances"
                : "Performance Rundown"}
            </div>
            {setlistArr.map((line, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:18, paddingBlock:16, borderBottom:i < setlistArr.length-1 ? "1px solid rgba(33,26,26,0.07)" : "none" }}>
                <span style={{ fontSize:12, fontWeight:700, color:gold, minWidth:26, paddingTop:2, fontFamily:"monospace", flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                <span style={{ fontSize:15, color:"#3A2A1A", lineHeight:1.6, fontWeight:500 }}>{line}</span>
              </div>
            ))}
            {(social.showreel || vendor.showreel) && (
              <div style={{ marginTop:32 }}>
                <a href={social.showreel || vendor.showreel} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 24px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", textDecoration:"none", fontSize:13.5, fontWeight:700, boxShadow:"0 4px 18px rgba(201,144,50,0.32)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Full Showreel
                </a>
              </div>
            )}
          </div>
        )}

        {/* PACKAGES */}
        {tab === "Packages" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:600 }}>
            {pkgs.map((pkg, i) => (
              <div key={i} style={{ background:i===1?ink:"#fff", borderRadius:20, padding:"28px", border:i!==1?"1px solid rgba(33,26,26,0.1)":"none" }}>
                {pkg.badge && <span style={{ display:"inline-block", background:gold, color:"#fff", fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:100, letterSpacing:"0.06em", marginBottom:12 }}>{pkg.badge}</span>}
                <div style={{ fontFamily:serif, fontSize:"1.35rem", fontWeight:700, color:i===1?"#FFF8EC":ink, marginBottom:4 }}>{pkg.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:16 }}>
                  <span style={{ fontFamily:serif, fontSize:"1.9rem", fontWeight:700, color:i===1?goldLt:gold }}>{fmt(pkg.price)}</span>
                  <span style={{ fontSize:12.5, color:i===1?"rgba(255,248,236,0.5)":muted }}>{pkg.unit}</span>
                </div>
                {pkg.bestFor && <div style={{ fontSize:12.5, color:i===1?"rgba(255,248,236,0.5)":muted, marginBottom:14, fontStyle:"italic" }}>Best for: {pkg.bestFor}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {pkg.items.map((item, j) => (
                    <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={i===1?goldLt:gold} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginTop:3 }}><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ fontSize:13.5, color:i===1?"rgba(255,248,236,0.8)":"#3A2A1A", lineHeight:1.45 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {tab === "Reviews" && (
          <div style={{ maxWidth:600 }}>
            {rating > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
                <Stars r={rating} sz={16}/>
                <span style={{ fontSize:16, fontWeight:800, color:ink }}>{rating.toFixed(1)}</span>
                <span style={{ fontSize:13.5, color:muted }}>({reviews.length} {reviews.length===1?"review":"reviews"})</span>
              </div>
            )}
            {reviews.map((r, i) => (
              <div key={i} style={{ paddingBottom:24, marginBottom:24, borderBottom:i<reviews.length-1?"1px solid rgba(33,26,26,0.07)":"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:700, color:ink, fontSize:14.5 }}>{r.consumerName || "Client"}</div>
                    <div style={{ fontSize:12, color:muted, marginTop:2 }}>{r.eventType || "Event"}</div>
                  </div>
                  <Stars r={r.averageRating || r.ratings?.overall || 5} sz={13}/>
                </div>
                <p style={{ fontSize:14.5, color:"#3A2A1A", lineHeight:1.85, margin:0 }}>{r.reviewText}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Mobile sticky footer */}
      <div className="gp-mob-footer">
        <button onClick={onBook} style={{ flex:1, padding:"13px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font }}>Book Now</button>
        <button onClick={onChat} style={{ padding:"13px 24px", borderRadius:100, background:"transparent", border:`1.5px solid rgba(33,26,26,0.2)`, color:ink, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>Message</button>
      </div>
    </div>
  );
}
