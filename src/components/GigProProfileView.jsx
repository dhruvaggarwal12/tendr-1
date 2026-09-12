import React, { useState } from "react";
import { MapPin, Clock, CalendarCheck, Share2, CheckCircle2 } from "lucide-react";

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
// Light content area tokens
const CINK    = "#1C1205";
const CMUTED  = "rgba(28,18,5,0.58)";
const CDIM    = "rgba(28,18,5,0.36)";
const CBG     = "#F4EFE4";
const CSURF   = "#EBE5D7";
const CGOLD_D = "rgba(196,155,48,0.28)";

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
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:6, verticalAlign:"middle", color:GOLD }}>
      <CheckCircle2 size={24} strokeWidth={2} fill={GOLD} color="#1A1209"/>
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
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {/* Directional light wash — from upper-right */}
      <div style={{ position:"absolute", top:0, right:0, width:"50%", height:"100%", background:"linear-gradient(210deg, rgba(200,140,50,0.07) 0%, transparent 65%)", pointerEvents:"none" }}/>
      {/* Barely-visible microphone — structural, not decorative */}
      <svg style={{ position:"absolute", right:"6%", bottom:"10%", opacity:0.018 }} width="80" height="160" viewBox="0 0 90 180">
        <rect x="25" y="0" width="40" height="76" rx="20" fill={INK}/>
        <path d="M8 66 Q8 110 45 110 Q82 110 82 66" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round"/>
        <line x1="45" y1="110" x2="45" y2="145" stroke={INK} strokeWidth="5"/>
        <line x1="24" y1="145" x2="66" y2="145" stroke={INK} strokeWidth="5" strokeLinecap="round"/>
      </svg>
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
        .gp-name{font-family:'Playfair Display',Georgia,serif;font-size:clamp(3.2rem,4.5vw,5.2rem);font-weight:800;color:${INK};line-height:.88;margin-bottom:20px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;letter-spacing:-0.01em}
        .gp-meta-row{display:flex;align-items:center;gap:10px;margin-bottom:22px;flex-wrap:wrap}
        .gp-bio{font-size:16.5px;color:rgba(245,237,216,0.8);line-height:1.85;margin-bottom:28px;max-width:460px;font-weight:400}
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

        .gp-tabs{background:${CBG};border-bottom:1px solid ${CGOLD_D};display:flex;padding:14px 56px 14px ${56+PHOTO_W+48}px;gap:10px;overflow-x:auto;scrollbar-width:none;position:sticky;top:0;z-index:50}
        .gp-tabs::-webkit-scrollbar{display:none}
        .gp-tab{padding:9px 22px;border-radius:100px;background:transparent;border:1px solid ${CGOLD_D};cursor:pointer;color:${CDIM};font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all .18s;flex-shrink:0}
        .gp-tab.on{color:${CINK};background:rgba(196,155,48,.12);border-color:${GOLD};font-weight:600}
        .gp-tab:hover:not(.on){color:${CMUTED};border-color:rgba(196,155,48,.45);background:rgba(196,155,48,.06)}

        .gp-content{background:${CBG};padding:48px 56px 80px;position:relative}
        .gp-content-grid{display:grid;grid-template-columns:1fr 296px;gap:48px;align-items:start}
        .gp-sidebar{position:sticky;top:80px;display:flex;flex-direction:column;gap:16px}
        .gp-sb-card{background:${CSURF};border:1px solid ${CGOLD_D};border-radius:14px;padding:26px 24px}
        .gp-sb-btn-book{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:13px;border-radius:100px;background:linear-gradient(135deg,#D4A940,#B07E1A);color:#1A1209;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;margin-bottom:10px;transition:filter .15s}
        .gp-sb-btn-book:hover{filter:brightness(1.07)}
        .gp-sb-btn-msg{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:12px;border-radius:100px;background:transparent;border:1px solid ${CGOLD_D};color:${CMUTED};font-size:13.5px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
        .gp-sb-btn-msg:hover{background:rgba(196,155,48,.08);border-color:rgba(196,155,48,.45)}
        .gp-sb-divider{border:none;border-top:1px solid ${CGOLD_D};margin:18px 0}
        .gp-sb-row{display:flex;align-items:center;gap:9px;margin-bottom:11px;font-size:13px;color:${CMUTED}}
        .gp-sb-row:last-child{margin-bottom:0}
        .gp-sb-icon{flex-shrink:0;opacity:.7}

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

        .gp-mob-footer{display:none;position:fixed;bottom:0;left:0;right:0;padding:12px 20px;background:${CSURF};backdrop-filter:blur(16px);border-top:1px solid ${CGOLD_D};gap:10px;z-index:200}

        @media(max-width:999px){
          .gp-nav{padding:0 24px}
          .gp-hero{flex-direction:column;align-items:flex-start;padding:20px 24px 28px;gap:24px;min-height:auto}
          .gp-photo-card{width:100%;height:60vw;max-height:380px}
          .gp-tabs{padding:12px 24px!important}
          .gp-v-divider,.gp-script-tagline{display:none}
          .gp-content{padding:28px 24px 80px}
          .gp-content-grid{grid-template-columns:1fr;gap:28px}
          .gp-sidebar{position:static;display:none}
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
        {/* Stage atmosphere backdrop */}
        <div style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
          {/* Blurred portrait — visible enough to add performer-specific texture */}
          <img src={portrait} alt="" aria-hidden="true" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 15%", filter:"blur(22px) brightness(0.35) saturate(0.55)", transform:"scale(1.06)", pointerEvents:"none" }}/>
          {/* Base warm veil — less opaque so portrait shows through */}
          <div style={{ position:"absolute", inset:0, background:"rgba(18,10,3,0.55)" }}/>
          {/* Stage floor light — strong warm amber sweep from bottom-center */}
          <div style={{ position:"absolute", bottom:"-15%", left:"10%", right:"10%", height:"70%", background:"radial-gradient(ellipse at 50% 100%, rgba(210,140,20,0.28) 0%, rgba(180,100,10,0.14) 38%, transparent 65%)", pointerEvents:"none" }}/>
          {/* Left fill — warm copper from the photo side */}
          <div style={{ position:"absolute", top:"10%", left:0, width:"45%", height:"80%", background:"radial-gradient(ellipse at 0% 50%, rgba(180,105,25,0.18) 0%, transparent 60%)", pointerEvents:"none" }}/>
          {/* Right warmth — keeps it from going cold on the stats side */}
          <div style={{ position:"absolute", top:"5%", right:"4%", width:320, height:520, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(165,100,20,0.13) 0%, transparent 60%)", pointerEvents:"none" }}/>
          {/* Grain texture overlay for depth and richness */}
          <div style={{ position:"absolute", inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat", mixBlendMode:"soft-light", opacity:0.6, pointerEvents:"none" }}/>
          {/* Top vignette to keep nav readable */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"28%", background:"linear-gradient(to bottom, rgba(8,4,1,0.55) 0%, transparent 100%)", pointerEvents:"none" }}/>
        </div>
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
              <CalendarCheck size={16} strokeWidth={2.2}/>
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

        {/* Stats — large, clear, editorial */}
        <div style={{ display:"flex", flexDirection:"column", gap:32, flexShrink:0, zIndex:1, minWidth:130 }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily:serif, fontSize:"2.4rem", fontWeight:800, color:INK, lineHeight:1, letterSpacing:"-0.01em" }}>{s.val}</div>
              <div style={{ fontSize:10.5, fontWeight:500, color:"rgba(245,237,216,0.45)", textTransform:"uppercase", letterSpacing:"0.18em", marginTop:6 }}>{s.label}</div>
            </div>
          ))}
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
        {/* Faint performer prop — content area watermark */}
        <svg aria-hidden="true" style={{ position:"absolute", right:48, bottom:120, opacity:0.04, pointerEvents:"none", zIndex:0 }} width="100" height="180" viewBox="0 0 90 180">
          <rect x="25" y="0" width="40" height="76" rx="20" fill={CINK}/>
          <path d="M8 66 Q8 110 45 110 Q82 110 82 66" fill="none" stroke={CINK} strokeWidth="6" strokeLinecap="round"/>
          <line x1="45" y1="110" x2="45" y2="145" stroke={CINK} strokeWidth="6"/>
          <line x1="24" y1="145" x2="66" y2="145" stroke={CINK} strokeWidth="6" strokeLinecap="round"/>
          <line x1="33" y1="22" x2="57" y2="22" stroke={CINK} strokeWidth="2.5"/>
          <line x1="33" y1="36" x2="57" y2="36" stroke={CINK} strokeWidth="2.5"/>
          <line x1="33" y1="50" x2="57" y2="50" stroke={CINK} strokeWidth="2.5"/>
        </svg>

        {/* PORTFOLIO — full width, no sidebar */}
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

        {/* NON-PORTFOLIO: two-column layout with sticky sidebar */}
        {tab !== "Portfolio" && (
        <div className="gp-content-grid">
        <div> {/* left main column */}

        {/* ── ABOUT ── */}
        {tab === "About" && (
          <div>
            {vendor.bio && (
              <p style={{ fontSize:17, color:CMUTED, lineHeight:1.85, marginBottom:52, fontWeight:400 }}>
                {vendor.bio}
              </p>
            )}

            {highlights.filter(h=>h.label).length > 0 && (
              <div style={{ marginBottom:52 }}>
                <div style={{ fontFamily:serif, fontSize:"1.25rem", fontWeight:700, color:CINK, marginBottom:32 }}>
                  Why people book {vendor.name?.split(" ")[0] || "this performer"}
                </div>
                {highlights.filter(h => h.label).map((h, i) => (
                  <div key={i} style={{ marginBottom:28 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:CINK, marginBottom:6 }}>{h.label}</div>
                    {h.desc && <div style={{ fontSize:15, color:CMUTED, lineHeight:1.75, fontWeight:400 }}>{h.desc}</div>}
                  </div>
                ))}
              </div>
            )}

            {([...genres,...instr]).length > 0 && (
              <div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {[...genres,...instr].map(g => (
                    <span key={g} style={{ padding:"7px 18px", borderRadius:20, background:"rgba(196,155,48,0.08)", border:`1px solid rgba(196,155,48,0.22)`, fontSize:14, color:CMUTED, fontWeight:500 }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(social.showreel || social.instagram || social.youtube) && (
              <div style={{ marginTop:44, display:"flex", gap:28, flexWrap:"wrap" }}>
                {social.showreel && (
                  <a href={social.showreel} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:13.5, color:GOLD, textDecoration:"none", borderBottom:`1px solid rgba(196,155,48,0.35)`, paddingBottom:2 }}>
                    Watch Showreel →
                  </a>
                )}
                {social.instagram && (
                  <a href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:13.5, color:CDIM, textDecoration:"none" }}>
                    {social.instagram}
                  </a>
                )}
                {social.youtube && (
                  <a href={`https://${social.youtube.replace(/^https?:\/\//,"")}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:13.5, color:CDIM, textDecoration:"none" }}>
                    YouTube
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SETLIST ── */}
        {tab === "Setlist" && (
          <div>
            <div style={{ fontFamily:serif, fontSize:"1.5rem", fontWeight:700, color:CINK, marginBottom:8 }}>The Experience</div>
            <p style={{ fontSize:15, color:CMUTED, lineHeight:1.75, marginBottom:44, fontWeight:400, maxWidth:460 }}>
              Here's how the performance unfolds — from setting the tone to leaving the room energised.
            </p>

            <div>
              {setlistArr.map((line, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"32px 1fr", gap:"0 20px", marginBottom:32 }}>
                  <div style={{ fontSize:12, color:CDIM, fontVariantNumeric:"tabular-nums", paddingTop:4, fontWeight:500 }}>{String(i+1).padStart(2,"0")}</div>
                  <div style={{ fontSize:17.5, color:CINK, fontWeight:600, lineHeight:1.45 }}>{line}</div>
                </div>
              ))}
            </div>

            {(social.showreel || vendor.showreel) && (
              <div style={{ marginTop:52 }}>
                <a href={social.showreel || vendor.showreel} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"14px 32px", borderRadius:100, background:`linear-gradient(135deg,${GOLD},#9A7010)`, color:"#1A1000", textDecoration:"none", fontSize:14.5, fontWeight:700 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Full Showreel
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── PACKAGES ── */}
        {tab === "Packages" && (
          <div>
            <p style={{ fontSize:15.5, color:CMUTED, lineHeight:1.75, marginBottom:44, fontWeight:400 }}>
              Choose the kind of experience you want for your event.
            </p>
            {pkgs.map((pkg, i) => {
              const featured = i === 1 || pkg.badge;
              return (
                <div key={i} style={{
                  marginBottom: 36,
                  padding: featured ? "32px 28px" : "28px 0",
                  borderTop: featured ? "none" : `1px solid ${CGOLD_D}`,
                  background: featured ? "rgba(196,155,48,0.07)" : "transparent",
                  borderRadius: featured ? 10 : 0,
                  borderLeft: featured ? `3px solid ${GOLD}` : "none",
                  paddingLeft: featured ? 28 : 0,
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:8 }}>
                    <div style={{ fontFamily:serif, fontSize:"1.65rem", fontWeight:700, color:CINK }}>{pkg.name}</div>
                    {(pkg.badge || featured) && (
                      <span style={{ fontSize:11.5, color:GOLD, fontWeight:600, letterSpacing:"0.08em", paddingTop:8 }}>
                        {pkg.badge || "Recommended"}
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:pkg.bestFor ? 8 : 20 }}>
                    <span style={{ fontFamily:serif, fontSize:"2.3rem", fontWeight:800, fontStyle:"italic", color:GOLD }}>{fmt(pkg.price)}</span>
                    {pkg.unit && <span style={{ fontSize:14, color:CDIM }}>{pkg.unit}</span>}
                  </div>
                  {pkg.bestFor && (
                    <div style={{ fontSize:14, color:CDIM, marginBottom:20, fontStyle:"italic" }}>Ideal for {pkg.bestFor}</div>
                  )}
                  <div style={{ marginBottom:22 }}>
                    {pkg.items.map((item, j) => (
                      <div key={j} style={{ fontSize:15, color:CMUTED, lineHeight:1.7, paddingBlock:4, fontWeight:400 }}>
                        — {item}
                      </div>
                    ))}
                  </div>
                  <button onClick={onBook} style={{ padding:"10px 22px", borderRadius:100, background: featured ? `linear-gradient(135deg,${GOLD},#9A7010)` : "transparent", border: featured ? "none" : `1px solid ${CGOLD_D}`, color: featured ? "#1A1000" : CMUTED, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:font }}>
                    {featured ? "Book this package" : "Enquire"}
                  </button>
                </div>
              );
            })}
            {pkgs.length > 0 && (
              <div style={{ paddingTop:20, borderTop:`1px solid ${CGOLD_D}` }}>
                <div style={{ fontSize:13, color:CDIM }}>
                  Need something different?&nbsp;
                  <button onClick={onChat} style={{ background:"none", border:"none", color:GOLD, fontSize:13, cursor:"pointer", fontFamily:font, textDecoration:"underline", textDecorationColor:"rgba(196,155,48,0.4)", padding:0 }}>
                    Ask about a custom package
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "Reviews" && (
          <div>
            {rating > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:48, paddingBottom:32, borderBottom:`1px solid ${CGOLD_D}` }}>
                <div style={{ fontFamily:serif, fontSize:"3rem", fontWeight:800, fontStyle:"italic", color:CINK, lineHeight:1 }}>{rating.toFixed(1)}</div>
                <div>
                  <Stars r={rating} sz={14}/>
                  <div style={{ fontSize:12.5, color:CDIM, marginTop:5 }}>{reviews.length} {reviews.length===1?"review":"reviews"}</div>
                </div>
              </div>
            )}
            {reviews.map((r, i) => {
              const name = r.consumerName || "Client";
              const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
              const rev = r.averageRating || r.ratings?.overall || 5;
              const featured = i === 0;
              return (
                <div key={i} style={{ marginBottom: featured ? 52 : 36, paddingBottom: featured ? 52 : 32, borderBottom:`1px solid rgba(196,155,48,0.14)` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                    <div style={{ width:featured ? 46 : 38, height:featured ? 46 : 38, borderRadius:"50%", background:"rgba(196,155,48,0.1)", border:`1px solid rgba(196,155,48,0.28)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:featured?14:12, fontWeight:700, color:"rgba(150,100,15,0.85)", flexShrink:0 }}>
                      {initials}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:featured?16.5:15, fontWeight:700, color:CINK }}>{name}</div>
                      <div style={{ fontSize:13, color:CDIM, marginTop:3 }}>
                        {r.eventType || "Event"}{r.date ? ` · ${r.date}` : ""}
                      </div>
                    </div>
                    <Stars r={rev} sz={featured?14:12}/>
                  </div>
                  <p style={{ fontSize:featured?16.5:15, color:CMUTED, lineHeight:1.85, margin:0, fontWeight:featured?400:400, paddingLeft:60 }}>
                    {r.reviewText}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        </div>

        {/* SIDEBAR */}
        <aside className="gp-sidebar">
          <div className="gp-sb-card">
            {/* Starting price */}
            {pkgs.length > 0 && (() => {
              const min = Math.min(...pkgs.map(p=>Number(p.price)||0).filter(p=>p>0));
              return min > 0 ? (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:CMUTED, marginBottom:5 }}>Starting from</div>
                  <div style={{ fontFamily:serif, fontSize:"1.75rem", fontWeight:800, fontStyle:"italic", color:GOLD, lineHeight:1 }}>
                    ₹{min.toLocaleString("en-IN")}
                  </div>
                </div>
              ) : null;
            })()}
            <button className="gp-sb-btn-book" onClick={onBook}>
              <CalendarCheck size={15} strokeWidth={2.2}/>
              Book Now
            </button>
            <button className="gp-sb-btn-msg" onClick={onChat}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message
            </button>

            <hr className="gp-sb-divider"/>

            {rating > 0 && (
              <div className="gp-sb-row">
                <Stars r={rating} sz={13}/>
                <span style={{ fontWeight:700, color:CINK, marginLeft:2 }}>{rating.toFixed(1)}</span>
                <span style={{ color:CDIM }}>({reviews.length} reviews)</span>
              </div>
            )}
            <div className="gp-sb-row">
              <span className="gp-sb-icon"><div style={{ width:7, height:7, borderRadius:"50%", background:"#28A85A", boxShadow:"0 0 6px rgba(40,168,90,0.5)" }}/></span>
              Available for bookings
            </div>
            <div className="gp-sb-row">
              <span className="gp-sb-icon"><Clock size={13} color={GOLD} strokeWidth={1.8}/></span>
              Replies in &lt; 2 hrs
            </div>
            {events > 0 && (
              <div className="gp-sb-row">
                <span className="gp-sb-icon"><CalendarCheck size={13} color={GOLD} strokeWidth={1.8}/></span>
                {events}+ events completed
              </div>
            )}
            {city && (
              <div className="gp-sb-row">
                <span className="gp-sb-icon"><MapPin size={12} color={GOLD} strokeWidth={1.8}/></span>
                {city}
              </div>
            )}

            <hr className="gp-sb-divider"/>

            <div style={{ fontSize:11, color:CDIM, textAlign:"center", lineHeight:1.7 }}>
              Secure booking &nbsp;·&nbsp; No hidden fees<br/>
              <span style={{ color:GOLD, opacity:0.7 }}>Tendr</span> verified performer
            </div>
          </div>

          {/* Quick share */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <button onClick={() => navigator.clipboard?.writeText(window.location.href)} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:100, background:"transparent", border:`1px solid ${CGOLD_D}`, color:CMUTED, fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:font }}>
              <Share2 size={12} strokeWidth={1.8}/>
              Share Profile
            </button>
          </div>
        </aside>

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
