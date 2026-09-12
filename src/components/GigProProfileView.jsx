import React, { useState } from "react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const BG      = "#2E1F12";   // warm sienna — lighter, less AI-brown
const SURF    = "#3A271A";
const CARD    = "#2A1C10";
const INK     = "#F5EDD8";
const MUTED   = "rgba(245,237,216,0.68)";
const DIM     = "rgba(245,237,216,0.4)";
// photo card width — used to align tabs
const PHOTO_W = 400;
const GOLD    = "#C49B30";
const GOLD_D  = "rgba(196,155,48,0.22)";
const font    = "'DM Sans', system-ui, sans-serif";
const serif   = "'Playfair Display', Georgia, serif";

const FALLBACK = {
  Anchor:        "https://randomuser.me/api/portraits/men/45.jpg",
  Band:          "https://randomuser.me/api/portraits/men/67.jpg",
  Choreographer: "https://randomuser.me/api/portraits/women/26.jpg",
};

function fmt(n) { return n ? "₹" + Number(n).toLocaleString("en-IN") : "Price on request"; }

function Stars({ r = 0, sz = 13 }) {
  return (
    <span style={{ display:"inline-flex", gap:1.5 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={sz} height={sz} viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? GOLD : "rgba(196,155,48,0.2)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:26, height:26, borderRadius:"50%", background:GOLD, flexShrink:0, marginLeft:8, verticalAlign:"middle" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A1209" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  );
}

function StatCircle({ type }) {
  const icons = {
    events: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="2.5"/>
        <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5"/>
        <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="2.5"/>
        <line x1="8" y1="18" x2="8.01" y2="18" strokeWidth="2.5"/>
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/>
      </svg>
    ),
    experience: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    location: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  };
  return (
    <div style={{
      width:54, height:54, borderRadius:"50%",
      background:CARD,
      border:`1px solid rgba(196,155,48,0.32)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0,
    }}>
      {icons[type]}
    </div>
  );
}

// Removed heavy grain — replaced by background gradient variation

function BgDecor({ serviceType = "" }) {
  const isBand  = /band|singer|musician/i.test(serviceType);
  const isDance = /choreograph|dancer/i.test(serviceType);
  const isPhoto = /photograph/i.test(serviceType);

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {/* Directional light wash — from upper-right, warm amber */}
      <div style={{ position:"absolute", top:0, right:0, width:"55%", height:"100%", background:"linear-gradient(210deg, rgba(200,140,50,0.10) 0%, rgba(180,110,30,0.05) 40%, transparent 72%)", pointerEvents:"none" }}/>
      {/* Single soft warm glow — top-right focal point */}
      <div style={{ position:"absolute", top:"-8%", right:"12%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(196,145,40,0.11) 0%, transparent 60%)", pointerEvents:"none" }}/>

      {/* ── Microphone silhouette — right side, very faint */}
      <svg style={{ position:"absolute", right:"7%", top:"6%", opacity:0.055 }} width="90" height="180" viewBox="0 0 90 180">
        <rect x="25" y="0"  width="40" height="76" rx="20" fill={GOLD}/>
        <path d="M8 66 Q8 110 45 110 Q82 110 82 66" fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round"/>
        <line x1="45" y1="110" x2="45" y2="145" stroke={GOLD} strokeWidth="5"/>
        <line x1="24" y1="145" x2="66" y2="145" stroke={GOLD} strokeWidth="5" strokeLinecap="round"/>
        <line x1="33" y1="22" x2="57" y2="22" stroke="rgba(0,0,0,0.25)" strokeWidth="2"/>
        <line x1="33" y1="36" x2="57" y2="36" stroke="rgba(0,0,0,0.25)" strokeWidth="2"/>
        <line x1="33" y1="50" x2="57" y2="50" stroke="rgba(0,0,0,0.25)" strokeWidth="2"/>
      </svg>

      {/* ── 4-point sparkle stars — minimal, only 3 */}
      {[
        { x:"74%", y:"12%", s:12, op:0.15 },
        { x:"91%", y:"44%", s:8,  op:0.10 },
        { x:"68%", y:"68%", s:7,  op:0.08 },
      ].map((d,i) => (
        <svg key={i} style={{ position:"absolute", left:d.x, top:d.y, opacity:d.op }} width={d.s} height={d.s} viewBox="0 0 24 24">
          <path d="M12 2v20M2 12h20" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round"/>
        </svg>
      ))}

      {/* ── Type-specific prop */}
      {isBand && (
        <svg style={{ position:"absolute", left:"4%", top:"22%", opacity:0.06 }} width="52" height="52" viewBox="0 0 60 60">
          <circle cx="12" cy="46" r="10" fill={GOLD}/>
          <line x1="22" y1="46" x2="22" y2="8" stroke={GOLD} strokeWidth="4"/>
          <line x1="22" y1="8"  x2="48" y2="3" stroke={GOLD} strokeWidth="4"/>
          <line x1="48" y1="3"  x2="48" y2="41" stroke={GOLD} strokeWidth="4"/>
          <circle cx="38" cy="41" r="10" fill={GOLD}/>
        </svg>
      )}
      {isDance && (
        <svg style={{ position:"absolute", left:"5%", top:"18%", opacity:0.06 }} width="48" height="72" viewBox="0 0 48 72">
          <ellipse cx="24" cy="28" rx="16" ry="22" fill="none" stroke={GOLD} strokeWidth="3"/>
          <path d="M14 48 C6 58 4 68 10 72" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
          <path d="M34 48 C42 58 44 68 38 72" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )}
      {isPhoto && (
        <svg style={{ position:"absolute", left:"4%", top:"18%", opacity:0.06 }} width="72" height="58" viewBox="0 0 72 58">
          <rect x="0" y="10" width="72" height="48" rx="7" fill="none" stroke={GOLD} strokeWidth="3"/>
          <circle cx="36" cy="32" r="14" fill="none" stroke={GOLD} strokeWidth="3"/>
          <circle cx="36" cy="32" r="6"  fill="none" stroke={GOLD} strokeWidth="2"/>
          <path d="M44 2 L52 10 L44 10Z" fill={GOLD}/>
        </svg>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function GigProProfileView({ vendor, reviews = [], onBook, onChat }) {
  const [tab, setTab] = useState("Portfolio");
  const [catFilter, setCatFilter] = useState("All");

  const rawPhotos  = vendor.portfolioPhotos || [];
  const allPhotos  = rawPhotos.map(p => typeof p === "string" ? { url:p, category:"All" } : p);
  const photoCats  = ["All", ...Array.from(new Set(allPhotos.map(p => p.category).filter(c => c && c !== "All")))];
  const visible    = catFilter === "All" ? allPhotos : allPhotos.filter(p => p.category === catFilter);

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
    items: Array.isArray(p.items) ? p.items : (p.items||"").split("\n").filter(Boolean),
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
    events > 0 && { type:"events",     val:`${events}+`,  label:"Events Done" },
    yrs > 0    && { type:"experience",  val:`${yrs}+ yrs`, label:"Experience"  },
    city       && { type:"location",    val:city,           label:"Based In"    },
  ].filter(Boolean);

  const PORT_SPANS = [
    { ar:"16/9", col:"span 2" }, { ar:"3/4",  col:"span 1" },
    { ar:"1/1",  col:"span 1" }, { ar:"4/3",  col:"span 1" },
    { ar:"16/9", col:"span 2" }, { ar:"3/4",  col:"span 1" },
    { ar:"1/1",  col:"span 1" }, { ar:"4/3",  col:"span 1" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(165deg, #3A2515 0%, ${BG} 38%, #261608 100%)`, fontFamily:font, color:INK, overflowX:"hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=Dancing+Script:wght@500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}

        .gp-nav{display:flex;align-items:center;padding:0 56px;height:64px;position:relative;z-index:10}
        .gp-nav-logo{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:400;letter-spacing:.28em;color:${INK};margin-right:auto;text-decoration:none}
        .gp-nav-links{display:flex;gap:36px;margin-right:40px}
        .gp-nav-link{font-size:14px;color:${MUTED};text-decoration:none;font-weight:400;cursor:pointer;transition:color .15s}
        .gp-nav-link:hover{color:${INK}}
        .gp-nav-actions{display:flex;align-items:center;gap:18px}
        .gp-search-btn{background:none;border:none;cursor:pointer;color:${MUTED};display:flex;padding:4px;transition:color .15s}
        .gp-search-btn:hover{color:${INK}}
        .gp-plan-btn{padding:10px 22px;border-radius:100px;border:1px solid rgba(196,155,48,.55);background:transparent;color:${GOLD};font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;white-space:nowrap;transition:background .15s}
        .gp-plan-btn:hover{background:rgba(196,155,48,.1)}

        .gp-hero{position:relative;display:flex;align-items:center;padding:28px 56px 40px;gap:48px;min-height:520px}

        .gp-photo-card{flex-shrink:0;width:${PHOTO_W}px;height:568px;border-radius:16px;overflow:hidden;position:relative;box-shadow:0 28px 70px rgba(0,0,0,.55),0 0 0 1px rgba(196,155,48,.1)}
        .gp-photo-card img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
        .gp-photo-gradient{position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(to top,rgba(15,8,2,.9) 0%,transparent 100%)}
        .gp-photo-cursive{position:absolute;bottom:48px;right:14px;font-family:'Dancing Script',cursive;font-size:17px;font-weight:500;color:rgba(237,224,197,.72);line-height:1.5;text-align:right;pointer-events:none;transform:rotate(-2deg)}
        .gp-avail-badge{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:6px;background:rgba(20,13,5,.82);backdrop-filter:blur(8px);border-radius:100px;padding:6px 12px;font-size:11.5px;font-weight:500;color:${INK};white-space:nowrap}
        .gp-green-dot{width:7px;height:7px;border-radius:50%;background:#3CCA6B;flex-shrink:0}

        .gp-info{flex:1;min-width:0;display:flex;flex-direction:column}
        .gp-eyebrow{font-size:10.5px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:${MUTED};margin-bottom:14px}
        .gp-name{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.4rem,3.2vw,3.4rem);font-weight:800;color:${INK};line-height:.95;margin-bottom:16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px}
        .gp-meta-row{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
        .gp-bio{font-size:14px;color:${MUTED};line-height:1.85;margin-bottom:26px;max-width:460px;font-weight:400}
        .gp-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
        .gp-btn-book{display:flex;align-items:center;gap:9px;padding:14px 28px;border-radius:100px;background:linear-gradient(135deg,#D4A940 0%,#B07E1A 100%);color:#1A1209;font-size:14.5px;font-weight:700;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(196,155,48,.22);white-space:nowrap;transition:filter .15s}
        .gp-btn-book:hover{filter:brightness(1.07)}
        .gp-btn-msg{display:flex;align-items:center;gap:9px;padding:13px 24px;border-radius:100px;background:transparent;border:1px solid rgba(196,155,48,.3);color:rgba(237,224,197,.68);font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:background .15s,border-color .15s}
        .gp-btn-msg:hover{background:rgba(196,155,48,.07);border-color:rgba(196,155,48,.45)}
        .gp-reply-line{display:flex;align-items:center;gap:7px;font-size:12.5px;color:${DIM}}

        .gp-v-divider{width:1px;align-self:stretch;background:linear-gradient(to bottom,transparent 5%,rgba(196,155,48,.22) 30%,rgba(196,155,48,.22) 70%,transparent 95%);flex-shrink:0;margin:24px 0}

        .gp-stats-panel{display:flex;align-items:center;gap:56px;flex-shrink:0}
        .gp-v-stats{display:flex;flex-direction:column;gap:26px}
        .gp-stat-row{display:flex;align-items:center;gap:14px}
        .gp-stat-val{font-family:'Playfair Display',Georgia,serif;font-size:23px;font-weight:800;line-height:1.1;color:${GOLD}}
        .gp-stat-label{font-size:10px;color:${MUTED};font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:.1em}
        .gp-script-tagline{font-family:'Dancing Script',cursive;font-size:33px;font-weight:700;line-height:1.25;white-space:nowrap;color:rgba(245,220,136,0.68)}

        .gp-tabs{background:rgba(28,18,8,.96);border-bottom:1px solid rgba(196,155,48,.1);display:flex;padding:14px 56px 14px ${56+PHOTO_W+48}px;gap:10px;overflow-x:auto;scrollbar-width:none;position:sticky;top:0;z-index:50}
        .gp-tabs::-webkit-scrollbar{display:none}
        .gp-tab{padding:9px 22px;border-radius:100px;background:transparent;border:1px solid rgba(196,155,48,.28);cursor:pointer;color:rgba(242,232,208,.45);font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all .18s;flex-shrink:0}
        .gp-tab.on{color:${INK};background:rgba(196,155,48,.12);border-color:${GOLD};font-weight:600}
        .gp-tab:hover:not(.on){color:rgba(242,232,208,.72);border-color:rgba(196,155,48,.5);background:rgba(196,155,48,.05)}

        .gp-content{background:${BG};padding:48px 56px 80px}

        .gp-port-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
        .gp-port-tile{position:relative;overflow:hidden;cursor:pointer;background:#0E0A06}
        .gp-port-tile img{width:100%;height:100%;object-fit:cover;display:block;opacity:.88;transition:transform .5s cubic-bezier(.25,.46,.45,.94),opacity .28s}
        .gp-port-tile:hover img{transform:scale(1.06);opacity:1}
        .gp-port-tile-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,6,2,.65) 0%,transparent 55%);opacity:0;transition:opacity .24s;display:flex;align-items:flex-end;padding:14px 16px}
        .gp-port-tile:hover .gp-port-tile-ov{opacity:1}
        .gp-port-cat{font-size:10.5px;font-weight:600;color:rgba(237,224,197,.8);text-transform:uppercase;letter-spacing:.1em}

        .gp-cat-pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
        .gp-cat-pill{padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:.04em;transition:all .15s}

        .gp-highlight-row{display:flex;gap:18px;padding:20px 0;border-bottom:1px solid ${GOLD_D}}
        .gp-tag{background:${SURF};border:1px solid ${GOLD_D};border-radius:100px;padding:7px 16px;font-size:12.5px;color:${MUTED};font-weight:500}
        .gp-setlist-row{display:flex;align-items:flex-start;gap:20px;padding:17px 0;border-bottom:1px solid ${GOLD_D}}
        .gp-pkg-card{border-radius:6px;padding:30px 34px;margin-bottom:12px}

        .gp-mob-footer{display:none;position:fixed;bottom:0;left:0;right:0;padding:12px 20px;background:rgba(20,12,4,.97);backdrop-filter:blur(16px);border-top:1px solid ${GOLD_D};gap:10px;z-index:200}

        @media(max-width:999px){
          .gp-nav{padding:0 24px}
          .gp-hero{flex-direction:column;align-items:flex-start;padding:20px 24px 28px;gap:24px;min-height:auto}
          .gp-photo-card{width:100%;height:60vw;max-height:380px}
          .gp-tabs{padding:12px 24px!important}
          .gp-v-divider,.gp-script-tagline{display:none}
          .gp-tabs{padding:0 24px}
          .gp-content{padding:28px 24px 80px}
          .gp-port-grid{grid-template-columns:repeat(2,1fr)}
          .gp-mob-footer{display:flex!important}
        }
        @media(max-width:599px){
          .gp-port-grid{grid-template-columns:1fr}
          .gp-port-tile{grid-column:span 1!important}
        }
      `}</style>

      {/* NAV */}
      <nav className="gp-nav">
        <span className="gp-nav-logo">T E N D R</span>
        <div className="gp-nav-actions">
          <button className="gp-search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="gp-plan-btn">Plan Your Event</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="gp-hero">
        <BgDecor serviceType={vendor.serviceType || ""}/>

        {/* Photo card */}
        <div className="gp-photo-card" style={{ zIndex:1 }}>
          <img src={portrait} alt={vendor.name}/>
          <div className="gp-photo-gradient"/>
          <div className="gp-photo-cursive">Turning Moments<br/>Into Memories</div>
          <div className="gp-avail-badge">
            <div className="gp-green-dot"/>
            Available for Bookings
          </div>
        </div>

        {/* Info */}
        <div className="gp-info" style={{ zIndex:1 }}>
          <div className="gp-eyebrow">Professional {vendor.serviceType || "Performer"}</div>

          <h1 className="gp-name">
            {vendor.name}
            {(vendor.phoneVerified || vendor.verified) && <VerifiedBadge/>}
          </h1>

          <div className="gp-meta-row">
            {city && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:13.5, color:MUTED }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {city}
              </span>
            )}
            {city && rating > 0 && <span style={{ color:"rgba(196,155,48,0.3)", fontSize:13 }}>|</span>}
            {rating > 0 && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <Stars r={rating} sz={13}/>
                <span style={{ fontSize:14, fontWeight:700, color:INK }}>{rating.toFixed(1)}</span>
                {reviews.length > 0 && <span style={{ fontSize:13, color:MUTED }}>({reviews.length} reviews)</span>}
              </span>
            )}
          </div>

          {vendor.bio && (
            <p className="gp-bio">
              {vendor.bio.length > 240 ? vendor.bio.slice(0,240)+"…" : vendor.bio}
            </p>
          )}

          <div className="gp-ctas">
            <button className="gp-btn-book" onClick={onBook}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Book Now
            </button>
            <button className="gp-btn-msg" onClick={onChat}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message
            </button>
          </div>

          <div className="gp-reply-line">
            <div className="gp-green-dot"/>
            Typically replies in &lt; 2 hrs
          </div>
        </div>

        {/* Vertical divider */}
        <div className="gp-v-divider" style={{ zIndex:1 }}/>

        {/* Stats + tagline */}
        <div className="gp-stats-panel" style={{ zIndex:1 }}>
          <div className="gp-v-stats">
            {stats.map(s => (
              <div key={s.label} className="gp-stat-row">
                <StatCircle type={s.type}/>
                <div>
                  <div className="gp-stat-val">{s.val}</div>
                  <div className="gp-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="gp-script-tagline">
            Good<br/>People<br/>Great<br/>Events
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="gp-tabs">
        {tabs.map(t => (
          <button key={t} className={`gp-tab${tab===t?" on":""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="gp-content">

        {/* PORTFOLIO */}
        {tab === "Portfolio" && (
          allPhotos.length > 0 ? (
            <div>
              {photoCats.length > 1 && (
                <div className="gp-cat-pills">
                  {photoCats.map(c => (
                    <button key={c} className="gp-cat-pill"
                      onClick={() => setCatFilter(c)}
                      style={{
                        border:`1px solid ${catFilter===c ? GOLD : GOLD_D}`,
                        background:catFilter===c ? GOLD : "transparent",
                        color:catFilter===c ? "#1A1209" : MUTED,
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="gp-port-grid">
                {visible.map((p, i) => {
                  const url = typeof p === "string" ? p : p.url;
                  const cat = typeof p === "string" ? "" : (p.category || "");
                  const s   = PORT_SPANS[i % PORT_SPANS.length];
                  return (
                    <div key={i} className="gp-port-tile" style={{ gridColumn:s.col, aspectRatio:s.ar }}>
                      <img src={url} alt={`${vendor.name} ${i+1}`}/>
                      <div className="gp-port-tile-ov">
                        {cat && <span className="gp-port-cat">{cat}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"100px 20px" }}>
              <div style={{ fontFamily:serif, fontSize:"1.4rem", fontStyle:"italic", color:MUTED, marginBottom:10 }}>No portfolio yet</div>
              <p style={{ fontSize:13.5, color:DIM, maxWidth:240, margin:"0 auto", lineHeight:1.7 }}>
                Upload photos from your dashboard to showcase past events.
              </p>
            </div>
          )
        )}

        {/* ABOUT */}
        {tab === "About" && (
          <div style={{ maxWidth:620 }}>
            {vendor.bio && (
              <p style={{ fontSize:16, color:MUTED, lineHeight:1.95, marginBottom:44, fontWeight:300, fontStyle:"italic" }}>
                {vendor.bio}
              </p>
            )}
            {highlights.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:24, opacity:0.7 }}>
                  What Sets Me Apart
                </div>
                {highlights.filter(h => h.label).map((h, i) => (
                  <div key={i} className="gp-highlight-row">
                    <div style={{ color:GOLD, flexShrink:0, marginTop:1, opacity:0.7 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:INK, marginBottom:4 }}>{h.label}</div>
                      <div style={{ fontSize:13, color:MUTED, lineHeight:1.65 }}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(genres.length > 0 || instr.length > 0) && (
              <div style={{ marginTop:40 }}>
                <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:16, opacity:0.7 }}>
                  {genres.length > 0 ? "Genres & Styles" : "Instruments"}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {[...genres,...instr].map(g => <span key={g} className="gp-tag">{g}</span>)}
                </div>
              </div>
            )}
            {(social.showreel || social.instagram || social.youtube) && (
              <div style={{ marginTop:40 }}>
                <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:16, opacity:0.7 }}>
                  Find Me Online
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {social.showreel && (
                    <a href={social.showreel} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:SURF, border:`1px solid ${GOLD_D}`, color:INK, textDecoration:"none", fontSize:13, fontWeight:500 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Watch Showreel
                    </a>
                  )}
                  {social.instagram && (
                    <a href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:SURF, border:`1px solid ${GOLD_D}`, color:"#E1306C", textDecoration:"none", fontSize:13, fontWeight:500 }}>
                      Instagram
                    </a>
                  )}
                  {social.youtube && (
                    <a href={`https://${social.youtube.replace(/^https?:\/\//,"")}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:SURF, border:`1px solid ${GOLD_D}`, color:"#FF4444", textDecoration:"none", fontSize:13, fontWeight:500 }}>
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
            <div style={{ fontSize:10, fontWeight:600, color:GOLD, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:28, opacity:0.7 }}>
              Performance Rundown
            </div>
            {setlistArr.map((line, i) => (
              <div key={i} className="gp-setlist-row">
                <span style={{ fontSize:11, fontWeight:700, color:GOLD, opacity:0.55, minWidth:26, paddingTop:2, fontFamily:"monospace", letterSpacing:"0.04em", flexShrink:0 }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <span style={{ fontSize:14.5, color:"rgba(237,224,197,0.72)", lineHeight:1.6 }}>{line}</span>
              </div>
            ))}
            {(social.showreel || vendor.showreel) && (
              <div style={{ marginTop:36 }}>
                <a href={social.showreel || vendor.showreel} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 26px", borderRadius:100, background:"linear-gradient(135deg,#D4A940,#B07E1A)", color:"#1A1209", textDecoration:"none", fontSize:13.5, fontWeight:700, boxShadow:"0 4px 18px rgba(196,155,48,.22)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Full Showreel
                </a>
              </div>
            )}
          </div>
        )}

        {/* PACKAGES */}
        {tab === "Packages" && (
          <div style={{ display:"flex", flexDirection:"column", maxWidth:620 }}>
            {pkgs.map((pkg, i) => (
              <div key={i} className="gp-pkg-card" style={{
                background: i===1 ? "#221A10" : SURF,
                border: i===1 ? `1px solid rgba(196,155,48,0.3)` : `1px solid ${GOLD_D}`,
              }}>
                {pkg.badge && <div style={{ fontSize:9.5, fontWeight:700, color:GOLD, textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:10, opacity:0.8 }}>{pkg.badge}</div>}
                <div style={{ fontFamily:serif, fontSize:"1.35rem", fontWeight:700, color:INK, marginBottom:6 }}>{pkg.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:18 }}>
                  <span style={{ fontFamily:serif, fontSize:"1.9rem", fontWeight:800, fontStyle:"italic", color:GOLD }}>{fmt(pkg.price)}</span>
                  {pkg.unit && <span style={{ fontSize:12, color:MUTED }}>{pkg.unit}</span>}
                </div>
                {pkg.bestFor && <div style={{ fontSize:12.5, color:MUTED, marginBottom:16, fontStyle:"italic" }}>Best for: {pkg.bestFor}</div>}
                {pkg.items.map((item, j) => (
                  <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:12, marginTop:10 }}>
                    <div style={{ width:1, borderRight:`1px solid ${GOLD}`, alignSelf:"stretch", opacity:0.35, flexShrink:0, marginTop:3 }}/>
                    <span style={{ fontSize:13.5, color:MUTED, lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {tab === "Reviews" && (
          <div style={{ maxWidth:620 }}>
            {rating > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:40, paddingBottom:28, borderBottom:`1px solid ${GOLD_D}` }}>
                <div style={{ fontFamily:serif, fontSize:"3rem", fontWeight:800, fontStyle:"italic", color:INK, lineHeight:1 }}>{rating.toFixed(1)}</div>
                <div>
                  <Stars r={rating} sz={15}/>
                  <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>{reviews.length} {reviews.length===1?"review":"reviews"}</div>
                </div>
              </div>
            )}
            {reviews.map((r, i) => (
              <div key={i} style={{ paddingBlock:28, borderBottom:`1px solid ${GOLD_D}` }}>
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
        <button className="gp-btn-book" onClick={onBook} style={{ flex:1, justifyContent:"center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Book Now
        </button>
        <button className="gp-btn-msg" onClick={onChat} style={{ padding:"13px 20px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Message
        </button>
      </div>
    </div>
  );
}
