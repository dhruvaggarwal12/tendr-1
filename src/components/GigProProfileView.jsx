/**
 * GigProProfileView — premium minimal profile.
 * Clean, Airbnb-inspired. No clutter.
 * Props: vendor, reviews, onBook, onChat
 */
import React, { useState } from "react";

const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";

const FALLBACK = {
  Anchor:        "https://randomuser.me/api/portraits/men/45.jpg",
  Band:          "https://randomuser.me/api/portraits/men/67.jpg",
  Choreographer: "https://randomuser.me/api/portraits/women/26.jpg",
};

function fmt(n) {
  return n ? "₹" + Number(n).toLocaleString("en-IN") : "Price on request";
}

function Stars({ r = 0, sz = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
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

  const portrait = vendor.portfolioPhotos?.[0] || FALLBACK[vendor.serviceType] || FALLBACK.Anchor;
  const photos   = (vendor.portfolioPhotos || []).filter(u => u && typeof u === "string" && u.startsWith("http"));
  const city     = vendor.city || vendor.location || vendor.address?.city || vendor.locations?.[0] || "";
  const rating   = Number(vendor.avgReviewScore) || 0;
  const events   = vendor.totalEventsCompleted || 0;
  const genres   = vendor.genres || [];
  const instr    = vendor.instruments || [];
  const social   = vendor.social || {};
  const pkgs     = (vendor.packages || []).map(p => ({
    ...p,
    items: Array.isArray(p.items) ? p.items : (p.items || "").split("\n").filter(Boolean),
  }));
  const setlistArr = Array.isArray(vendor.setlist)
    ? vendor.setlist
    : typeof vendor.setlist === "string"
    ? vendor.setlist.split("\n").filter(Boolean)
    : [];

  const tabs = ["Portfolio", "About", "Packages", "Reviews"].filter(t => {
    if (t === "Packages") return pkgs.length > 0;
    if (t === "Reviews")  return reviews.length > 0;
    return true;
  });

  const bioSnippet = vendor.bio
    ? (vendor.bio.length > 200 ? vendor.bio.slice(0, 200) + "…" : vendor.bio)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Outfit:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        .gp-tab{padding:14px 0;font-size:13.5px;font-weight:600;border:none;background:none;cursor:pointer;color:${muted};border-bottom:2px solid transparent;transition:all 0.15s;font-family:${font};white-space:nowrap}
        .gp-tab.on{color:${ink};border-color:${gold}}
        .gp-tab:hover:not(.on){color:${ink}}
        .gp-tabbar{border-bottom:1px solid rgba(196,122,46,0.1);display:flex;gap:24px;overflowX:auto;scrollbar-width:none;padding:0 44px}
        .gp-content{padding:36px 44px 80px}
        .gp-portrait{position:sticky;top:0;height:100vh;overflow:hidden}
        .gp-mobile-hero{display:none}
        .gp-desktop-header{padding:52px 44px 28px}
        .gp-dt-ctas{display:flex;gap:10px;margin-top:24px}
        .gp-mob-footer{display:none;position:fixed;bottom:0;left:0;right:0;padding:12px 20px;background:#fff;border-top:1px solid rgba(196,122,46,0.1);gap:10px;z-index:50}
        @media(min-width:900px){.gp-layout{display:grid;grid-template-columns:400px 1fr}}
        @media(max-width:899px){
          .gp-portrait{display:none!important}
          .gp-mobile-hero{display:block!important}
          .gp-desktop-header{display:none!important}
          .gp-dt-ctas{display:none!important}
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
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 45%, rgba(250,247,242,0.6) 78%, #FAF7F2 100%)" }}/>
            </div>
            <div style={{ padding:"0 20px 8px" }}>
              <h1 style={{ fontFamily:serif, fontSize:"2rem", fontWeight:500, color:ink, lineHeight:1.1, margin:"0 0 6px" }}>{vendor.name}</h1>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                {(vendor.phoneVerified || vendor.verified) && (
                  <span style={{ fontSize:11, fontWeight:700, color:"#16A34A", background:"rgba(34,197,94,0.08)", padding:"2px 9px", borderRadius:100 }}>✓ Verified</span>
                )}
                <span style={{ fontSize:13, color:muted }}>{vendor.serviceType}{city ? ` · ${city}` : ""}</span>
              </div>
              {rating > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <Stars r={rating} sz={13}/>
                  <span style={{ fontSize:13.5, fontWeight:700, color:ink }}>{rating.toFixed(1)}</span>
                  {events > 0 && <span style={{ fontSize:12.5, color:muted }}>· {events}+ events</span>}
                </div>
              )}
            </div>
          </div>

          {/* Desktop header */}
          <div className="gp-desktop-header">
            <h1 style={{ fontFamily:serif, fontSize:"clamp(1.9rem,3vw,2.7rem)", fontWeight:500, color:ink, lineHeight:1.05, marginBottom:10 }}>{vendor.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom: bioSnippet ? 14 : 0 }}>
              {(vendor.phoneVerified || vendor.verified) && (
                <span style={{ fontSize:11.5, fontWeight:700, color:"#16A34A", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", padding:"3px 10px", borderRadius:100, display:"flex", alignItems:"center", gap:4 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
              )}
              <span style={{ fontSize:14, color:muted }}>{vendor.serviceType}</span>
              {city && <>
                <span style={{ color:"rgba(155,116,80,0.3)" }}>·</span>
                <span style={{ fontSize:13.5, color:muted, display:"flex", alignItems:"center", gap:4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {city}
                </span>
              </>}
              {rating > 0 && <>
                <span style={{ color:"rgba(155,116,80,0.3)" }}>·</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <Stars r={rating} sz={13}/>
                  <span style={{ fontSize:14, fontWeight:700, color:ink }}>{rating.toFixed(1)}</span>
                  {reviews.length > 0 && <span style={{ fontSize:12.5, color:muted }}>({reviews.length})</span>}
                </div>
              </>}
              {events > 0 && <>
                <span style={{ color:"rgba(155,116,80,0.3)" }}>·</span>
                <span style={{ fontSize:13, color:muted }}>{events}+ events</span>
              </>}
            </div>
            {bioSnippet && (
              <p style={{ fontSize:14.5, color:"#5A3820", lineHeight:1.8, maxWidth:540, margin:"0 0 6px" }}>{bioSnippet}</p>
            )}
            <div className="gp-dt-ctas">
              <button onClick={onBook}
                style={{ padding:"13px 32px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font, boxShadow:"0 4px 18px rgba(196,122,46,0.35)", letterSpacing:"0.01em" }}>
                Book Now
              </button>
              <button onClick={onChat}
                style={{ padding:"13px 28px", borderRadius:100, background:"transparent", border:`1.5px solid rgba(196,122,46,0.28)`, color:ink, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>
                Message
              </button>
              {vendor.phoneNumber && (
                <a href={`tel:${vendor.phoneNumber}`}
                  style={{ padding:"13px 20px", borderRadius:100, background:"transparent", border:"1.5px solid rgba(196,122,46,0.14)", color:muted, fontSize:13, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center" }}>
                  Call
                </a>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <div className="gp-tabbar">
            {tabs.map(t => (
              <button key={t} className={`gp-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</button>
            ))}
          </div>

          {/* Tab content */}
          <div className="gp-content">

            {/* ── PORTFOLIO ── */}
            {tab === "Portfolio" && (
              photos.length > 0 ? (
                <div style={{ display:"grid", gap:10, gridTemplateColumns:"1fr 1fr" }}>
                  {photos.map((url, i) => (
                    <div key={i} style={{ gridColumn:i===0?"1/-1":"auto", borderRadius:18, overflow:"hidden", aspectRatio:i===0?"16/9":"4/3" }}>
                      <img src={url} alt={`${vendor.name} ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"80px 20px", color:muted }}>
                  <div style={{ fontSize:40, marginBottom:16, opacity:0.2 }}>🎭</div>
                  <div style={{ fontFamily:serif, fontSize:"1.25rem", color:ink, marginBottom:8 }}>Portfolio coming soon</div>
                  <p style={{ fontSize:13.5, lineHeight:1.7, maxWidth:280, margin:"0 auto", color:muted }}>
                    Chat with {vendor.name?.split(" ")[0] || "this artist"} to see past work.
                  </p>
                </div>
              )
            )}

            {/* ── ABOUT ── */}
            {tab === "About" && (
              <div style={{ display:"flex", flexDirection:"column", gap:36, maxWidth:600 }}>
                {vendor.bio && (
                  <p style={{ fontSize:15, color:"#4A3020", lineHeight:1.85, margin:0 }}>{vendor.bio}</p>
                )}
                {(genres.length > 0 || instr.length > 0) && (
                  <div>
                    <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:12 }}>
                      {genres.length > 0 ? "Genres & Styles" : "Instruments & Gear"}
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {[...genres, ...instr].map(g => (
                        <span key={g} style={{ background:"#fff", border:"1px solid rgba(196,122,46,0.18)", borderRadius:100, padding:"6px 15px", fontSize:13, color:"#4A3020", fontWeight:500 }}>{g}</span>
                      ))}
                    </div>
                  </div>
                )}
                {setlistArr.length > 0 && (
                  <div>
                    <div style={{ fontSize:10.5, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:16 }}>Sample Set</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {setlistArr.map((line, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                          <span style={{ fontSize:11, fontWeight:800, color:gold, minWidth:22, paddingTop:2, fontFamily:"monospace" }}>{String(i+1).padStart(2,"0")}</span>
                          <span style={{ fontSize:14, color:"#4A3020", lineHeight:1.55 }}>{line}</span>
                        </div>
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
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(196,122,46,0.2)", color:ink, textDecoration:"none", fontSize:13, fontWeight:600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Watch Showreel
                        </a>
                      )}
                      {social.instagram && (
                        <a href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(196,122,46,0.15)", color:"#C62B6D", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                          {social.instagram}
                        </a>
                      )}
                      {social.youtube && (
                        <a href={`https://${social.youtube}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(196,122,46,0.15)", color:"#FF0000", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PACKAGES ── */}
            {tab === "Packages" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:600 }}>
                {pkgs.map((pkg, i) => (
                  <div key={i} style={{ background:i===1?ink:"#fff", borderRadius:20, padding:"28px", border:i!==1?"1px solid rgba(196,122,46,0.12)":"none" }}>
                    {pkg.badge && (
                      <span style={{ display:"inline-block", background:gold, color:"#fff", fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:100, letterSpacing:"0.06em", marginBottom:12 }}>
                        {pkg.badge}
                      </span>
                    )}
                    <div style={{ fontFamily:serif, fontSize:"1.35rem", fontWeight:500, color:i===1?"#FFF8EC":ink, marginBottom:4 }}>{pkg.name}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:16 }}>
                      <span style={{ fontFamily:serif, fontSize:"1.9rem", fontWeight:500, color:i===1?goldLt:gold }}>{fmt(pkg.price)}</span>
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
                          <div style={{ fontSize:12, color:muted, marginTop:2 }}>
                            {r.eventType || "Event"}{r.createdAt ? `, ${new Date(r.createdAt).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}` : ""}
                          </div>
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
        <button onClick={onBook}
          style={{ flex:1, padding:"13px", borderRadius:100, background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:font }}>
          Book Now
        </button>
        <button onClick={onChat}
          style={{ padding:"13px 24px", borderRadius:100, background:"transparent", border:`1.5px solid rgba(196,122,46,0.25)`, color:ink, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>
          Message
        </button>
      </div>
    </div>
  );
}
