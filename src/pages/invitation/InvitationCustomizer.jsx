import React, { useState, useEffect, useRef } from "react";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

/* ─── Shared Editable field ─────────────────────────────────────────────── */
function Editable({ value, onChange, placeholder, style = {}, width = "100%", align = "center" }) {
  return (
    <input
      type="text" value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "transparent", border: "none",
        borderBottom: value ? "none" : "1px dashed rgba(150,120,60,0.4)",
        outline: "none", width, textAlign: align,
        cursor: "text", color: "inherit", fontFamily: "inherit",
        fontSize: "inherit", fontWeight: "inherit",
        letterSpacing: "inherit", lineHeight: "inherit",
        ...style,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 1 — Botanical Watercolour (existing)
══════════════════════════════════════════════════════════════════════════ */
const LeafTL = () => (
  <svg viewBox="0 0 220 200" width="220" height="200" style={{ position:"absolute",top:0,left:0,pointerEvents:"none" }}>
    <ellipse cx="60" cy="50" rx="55" ry="28" fill="rgba(96,130,90,0.22)" transform="rotate(-35 60 50)"/>
    <ellipse cx="90" cy="80" rx="50" ry="22" fill="rgba(80,115,75,0.18)" transform="rotate(-50 90 80)"/>
    <path d="M10 160 Q40 40 160 10" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <path d="M15 140 Q35 100 60 60 Q45 85 25 120Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.12)"/>
    {[[120,35],[135,25],[150,20]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.5" fill="#C8A74A" opacity="0.5"/>)}
  </svg>
);
const LeafTR = () => (
  <svg viewBox="0 0 220 200" width="220" height="200" style={{ position:"absolute",top:0,right:0,pointerEvents:"none",transform:"scaleX(-1)" }}>
    <ellipse cx="60" cy="50" rx="55" ry="28" fill="rgba(96,130,90,0.20)" transform="rotate(-35 60 50)"/>
    <path d="M10 160 Q40 40 160 10" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.5"/>
    <path d="M15 140 Q35 100 60 60 Q45 85 25 120Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.1)"/>
  </svg>
);
const LeafBL = () => (
  <svg viewBox="0 0 200 220" width="200" height="220" style={{ position:"absolute",bottom:0,left:0,pointerEvents:"none" }}>
    <ellipse cx="70" cy="160" rx="58" ry="25" fill="rgba(96,130,90,0.22)" transform="rotate(25 70 160)"/>
    <path d="M10 60 Q50 150 180 210" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.55"/>
    <path d="M20 100 Q38 140 65 175 Q45 150 28 115Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.12)"/>
  </svg>
);
const LeafBR = () => (
  <svg viewBox="0 0 220 240" width="220" height="240" style={{ position:"absolute",bottom:0,right:0,pointerEvents:"none",transform:"scaleX(-1)" }}>
    <ellipse cx="70" cy="170" rx="62" ry="27" fill="rgba(96,130,90,0.25)" transform="rotate(20 70 170)"/>
    <path d="M10 50 Q70 160 200 230" stroke="#C8A74A" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <path d="M50 90 Q90 180 175 210 Q155 185 80 125Z" stroke="#B8A040" strokeWidth="0.7" fill="rgba(184,160,64,0.13)"/>
  </svg>
);

function BotanicalFlyer({ data, onChange }) {
  const dark = "#3B5048"; const gold = "#B8922A";
  return (
    <div style={{ width:460, minHeight:660, background:"#F7F2E9", border:`1.5px solid ${gold}`, borderRadius:3, position:"relative", padding:"44px 52px 46px", boxShadow:"0 12px 48px rgba(0,0,0,0.22)", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-30, left:-40, width:300, height:260, borderRadius:"60% 40% 55% 50%", background:"radial-gradient(ellipse, rgba(110,140,100,0.18) 0%, transparent 75%)", transform:"rotate(-15deg)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-20, right:-30, width:280, height:230, borderRadius:"45% 55% 50% 60%", background:"radial-gradient(ellipse, rgba(110,140,100,0.16) 0%, transparent 75%)", transform:"rotate(20deg)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:10, border:`0.8px solid rgba(184,146,42,0.3)`, borderRadius:1, pointerEvents:"none" }}/>
      <LeafTL/><LeafTR/><LeafBL/><LeafBR/>
      <div style={{ position:"relative", zIndex:5, textAlign:"center", fontFamily:"Georgia,'Times New Roman',serif" }}>
        <p style={{ fontSize:10.5, letterSpacing:"0.26em", textTransform:"uppercase", color:dark, margin:"0 0 7px", fontFamily:"'Cormorant Garamond','Georgia',serif", fontWeight:500 }}>You are<br/>cordially invited to</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, margin:"6px 0 8px" }}>
          <div style={{ height:"0.8px", width:44, background:`linear-gradient(to right, transparent, ${gold})` }}/>
          <svg width="14" height="12" viewBox="0 0 20 16"><path d="M10 0 L12 6 L10 4 L8 6Z" fill={gold} opacity="0.8"/><path d="M10 16 L12 10 L10 12 L8 10Z" fill={gold} opacity="0.8"/><circle cx="10" cy="8" r="1.5" fill={gold}/></svg>
          <div style={{ height:"0.8px", width:44, background:`linear-gradient(to left, transparent, ${gold})` }}/>
        </div>
        <div style={{ fontSize:46, fontWeight:700, color:dark, letterSpacing:"0.12em", textTransform:"uppercase", lineHeight:0.9, fontFamily:"'Cormorant Garamond','Playfair Display',Georgia,serif" }}>You're</div>
        <div style={{ fontSize:62, color:gold, lineHeight:1.05, margin:"-2px 0 4px", fontFamily:"'Great Vibes','Dancing Script',cursive" }}>Invited!</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, margin:"2px 0 10px" }}>
          <div style={{ height:"0.8px", flex:1, maxWidth:60, background:gold, opacity:0.7 }}/>
          <svg width="14" height="13" viewBox="0 0 24 22" fill={dark}><path d="M12 21.6C12 21.6 1 14 1 6.5C1 3.4 3.4 1 6.5 1C8.2 1 9.8 1.8 11 3C12.2 1.8 13.8 1 15.5 1C18.6 1 21 3.4 21 6.5C21 14 12 21.6 12 21.6Z"/></svg>
          <div style={{ height:"0.8px", flex:1, maxWidth:60, background:gold, opacity:0.7 }}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <Editable value={data.eventTitle} onChange={v=>onChange("eventTitle",v)} placeholder="Join us for a Special Celebration" style={{ fontSize:11.5, letterSpacing:"0.20em", textTransform:"uppercase", color:dark, fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:500 }}/>
        </div>
        <div style={{ textAlign:"left" }}>
          {[{icon:"📅",label:"DATE",key:"date",placeholder:"Saturday, 15th June 2025"},{icon:"🕐",label:"TIME",key:"time",placeholder:"7:00 PM Onwards"},{icon:"📍",label:"VENUE",key:"venue",placeholder:"Venue name & full address"},{icon:"✉️",label:"RSVP",key:"rsvp",placeholder:"+91 9XXXXXXXXX"}].map(({icon,label,key,placeholder})=>(
            <div key={key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(180,146,42,0.1)", border:`1px solid rgba(180,146,42,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{icon}</div>
              <div style={{ flex:1, borderBottom:"1px dashed rgba(150,120,60,0.3)", paddingBottom:2 }}>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", color:dark, fontFamily:"'Outfit',sans-serif", textTransform:"uppercase" }}>{label}: </span>
                <Editable value={data[key]} onChange={v=>onChange(key,v)} placeholder={placeholder} style={{ fontSize:12.5, color:"#444", fontFamily:"'Outfit',sans-serif", letterSpacing:"0.01em", textAlign:"left" }} width="calc(100% - 52px)" align="left"/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:18, textAlign:"center" }}>
          <div style={{ fontSize:22, fontFamily:"'Great Vibes','Dancing Script',cursive", color:"#5a4a2a", marginBottom:2 }}>We look forward to</div>
          <p style={{ fontSize:10.5, letterSpacing:"0.22em", textTransform:"uppercase", color:dark, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Celebrating with you!</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14 }}>
          <div style={{ height:"0.8px", width:32, background:gold, opacity:0.7 }}/>
          <svg width="14" height="12" viewBox="0 0 20 16"><path d="M10 0 L12 6 L10 4 L8 6Z" fill={gold} opacity="0.7"/><path d="M10 16 L12 10 L10 12 L8 10Z" fill={gold} opacity="0.7"/><circle cx="10" cy="8" r="1.5" fill={gold}/></svg>
          <div style={{ height:"0.8px", width:32, background:gold, opacity:0.7 }}/>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 2 — Night Glam (dark, gold stars, birthday/anniversary)
══════════════════════════════════════════════════════════════════════════ */
function NightGlamFlyer({ data, onChange }) {
  const stars = [[30,40],[80,20],[140,55],[200,30],[260,15],[320,45],[390,25],[420,60],[50,120],[370,100],[410,140],[20,200],[100,180],[300,160],[440,190],[60,280],[380,270],[430,320],[15,350],[110,340],[440,380],[30,440],[390,430],[80,500],[420,490]];
  return (
    <div style={{ width:460, minHeight:660, background:"#0D0D1A", border:"1.5px solid #C8A74A", borderRadius:4, position:"relative", padding:"48px 48px 44px", boxShadow:"0 16px 60px rgba(0,0,0,0.7)", overflow:"hidden" }}>
      {/* Star field */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} viewBox="0 0 460 660">
        {stars.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?1.2:0.7} fill="#C8A74A" opacity={0.3+Math.sin(i)*0.3}/>)}
      </svg>
      {/* Glow orbs */}
      <div style={{ position:"absolute", top:-60, left:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle, rgba(200,167,74,0.12) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-60, right:-60, width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle, rgba(200,167,74,0.1) 0%, transparent 70%)", pointerEvents:"none" }}/>
      {/* Inner border */}
      <div style={{ position:"absolute", inset:12, border:"0.8px solid rgba(200,167,74,0.25)", borderRadius:2, pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:5, textAlign:"center", fontFamily:"Georgia,serif" }}>
        {/* Sparkle top */}
        <div style={{ fontSize:22, marginBottom:8, letterSpacing:"0.3em", color:"#C8A74A", opacity:0.8 }}>✦ ✦ ✦</div>
        <p style={{ fontSize:10, letterSpacing:"0.32em", textTransform:"uppercase", color:"rgba(200,167,74,0.7)", margin:"0 0 10px", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>You are invited to celebrate</p>
        <div style={{ fontSize:52, fontWeight:800, color:"#C8A74A", lineHeight:1, margin:"0 0 6px", fontFamily:"'Cormorant Garamond','Playfair Display',Georgia,serif", textShadow:"0 0 30px rgba(200,167,74,0.4)" }}>
          <Editable value={data.eventTitle} onChange={v=>onChange("eventTitle",v)} placeholder="A Special Evening" style={{ color:"#C8A74A", fontSize:42, fontWeight:800, fontFamily:"'Cormorant Garamond',Georgia,serif", textAlign:"center" }}/>
        </div>
        {/* Gold line */}
        <div style={{ width:"100%", height:1, background:"linear-gradient(to right, transparent, #C8A74A, transparent)", margin:"14px 0" }}/>
        {/* Fields */}
        {[{icon:"✦",label:"DATE",key:"date",placeholder:"Saturday, 15th June 2025"},{icon:"✦",label:"TIME",key:"time",placeholder:"8:00 PM Onwards"},{icon:"✦",label:"VENUE",key:"venue",placeholder:"Venue & address"},{icon:"✦",label:"RSVP",key:"rsvp",placeholder:"+91 9XXXXXXXXX"}].map(({icon,label,key,placeholder})=>(
          <div key={key} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:13, textAlign:"left" }}>
            <span style={{ color:"#C8A74A", fontSize:10, flexShrink:0 }}>{icon}</span>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.2em", color:"rgba(200,167,74,0.6)", fontFamily:"'Outfit',sans-serif", textTransform:"uppercase" }}>{label} </span>
              <Editable value={data[key]} onChange={v=>onChange(key,v)} placeholder={placeholder} style={{ fontSize:13, color:"rgba(255,255,255,0.85)", fontFamily:"'Outfit',sans-serif", letterSpacing:"0.02em" }} width="calc(100% - 40px)" align="left"/>
            </div>
          </div>
        ))}
        <div style={{ width:"100%", height:1, background:"linear-gradient(to right, transparent, #C8A74A, transparent)", margin:"14px 0 16px" }}/>
        <div style={{ fontSize:28, fontFamily:"'Great Vibes','Dancing Script',cursive", color:"rgba(200,167,74,0.9)", marginBottom:4 }}>We can't wait to see you</div>
        <div style={{ fontSize:9, letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(200,167,74,0.5)", fontFamily:"'Outfit',sans-serif" }}>✦ ✦ ✦</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 3 — Minimal Ivory (clean elegant, all occasions)
══════════════════════════════════════════════════════════════════════════ */
function MinimalFlyer({ data, onChange }) {
  return (
    <div style={{ width:460, minHeight:660, background:"#FAFAF8", border:"1px solid #D4C4A0", borderRadius:2, position:"relative", padding:"56px 60px 48px", boxShadow:"0 8px 32px rgba(0,0,0,0.1)", overflow:"hidden" }}>
      {/* Corner marks */}
      {[{top:16,left:16},{top:16,right:16},{bottom:16,left:16},{bottom:16,right:16}].map((pos,i)=>(
        <div key={i} style={{ position:"absolute", width:16, height:16, ...pos, borderTop: (pos.top!==undefined)?"1px solid #B8922A":"none", borderBottom:(pos.bottom!==undefined)?"1px solid #B8922A":"none", borderLeft:(pos.left!==undefined)?"1px solid #B8922A":"none", borderRight:(pos.right!==undefined)?"1px solid #B8922A":"none" }}/>
      ))}
      <div style={{ position:"relative", zIndex:5, textAlign:"center" }}>
        {/* Thin rule */}
        <div style={{ width:40, height:1, background:"#B8922A", margin:"0 auto 20px" }}/>
        <p style={{ fontSize:9.5, letterSpacing:"0.35em", textTransform:"uppercase", color:"#9B7450", margin:"0 0 20px", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>You are kindly invited</p>
        <div style={{ fontFamily:"'Cormorant Garamond','Playfair Display',Georgia,serif", fontSize:48, fontWeight:300, color:"#1A1A1A", lineHeight:1.1, margin:"0 0 4px", letterSpacing:"0.04em" }}>
          <Editable value={data.eventTitle} onChange={v=>onChange("eventTitle",v)} placeholder="A Special Occasion" style={{ fontSize:42, fontWeight:300, color:"#1A1A1A", fontFamily:"'Cormorant Garamond',Georgia,serif" }}/>
        </div>
        {/* Ornament */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0 22px" }}>
          <div style={{ flex:1, height:"0.5px", background:"#D4C4A0" }}/>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2L13.5 8.5L20 6L15 11L22 12L15 13L20 18L13.5 15.5L12 22L10.5 15.5L4 18L9 13L2 12L9 11L4 6L10.5 8.5Z" fill="none" stroke="#B8922A" strokeWidth="0.8"/></svg>
          <div style={{ flex:1, height:"0.5px", background:"#D4C4A0" }}/>
        </div>
        <div style={{ textAlign:"left", marginBottom:24 }}>
          {[{key:"date",label:"Date",placeholder:"Saturday, 15th June 2025"},{key:"time",label:"Time",placeholder:"7:00 PM Onwards"},{key:"venue",label:"Venue",placeholder:"Venue name & address"},{key:"rsvp",label:"RSVP",placeholder:"+91 9XXXXXXXXX"}].map(({key,label,placeholder})=>(
            <div key={key} style={{ display:"flex", gap:16, alignItems:"baseline", marginBottom:14, paddingBottom:10, borderBottom:"0.5px solid #E8E0D0" }}>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#B8922A", fontFamily:"'Outfit',sans-serif", flexShrink:0, width:40 }}>{label}</span>
              <Editable value={data[key]} onChange={v=>onChange(key,v)} placeholder={placeholder} style={{ fontSize:13.5, color:"#333", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"0.02em" }} width="calc(100% - 56px)" align="left"/>
            </div>
          ))}
        </div>
        <div style={{ width:40, height:1, background:"#B8922A", margin:"0 auto 16px" }}/>
        <p style={{ fontSize:11, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#6B4226", margin:0, fontStyle:"italic", letterSpacing:"0.05em" }}>Your presence is our greatest gift</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATE 4 — Indian Festive (vibrant, for mehndi/sangeet/haldi)
══════════════════════════════════════════════════════════════════════════ */
function FestiveFlyer({ data, onChange }) {
  const saffron = "#D4500A"; const maroon = "#7B1E1E"; const gold = "#C8971A";
  return (
    <div style={{ width:460, minHeight:660, background:"#FFF8ED", border:`3px solid ${gold}`, borderRadius:6, position:"relative", padding:"44px 48px 44px", boxShadow:"0 12px 48px rgba(0,0,0,0.18)", overflow:"hidden" }}>
      {/* Paisley-style corner SVG */}
      {[{style:{top:0,left:0}},{style:{top:0,right:0,transform:"scaleX(-1)"}},{style:{bottom:0,left:0,transform:"scaleY(-1)"}},{style:{bottom:0,right:0,transform:"scale(-1,-1)"}}].map((c,i)=>(
        <svg key={i} width="110" height="110" viewBox="0 0 110 110" style={{ position:"absolute", ...c.style, pointerEvents:"none" }}>
          <path d="M0 0 Q30 10 55 55 Q10 30 0 0Z" fill={`${saffron}22`}/>
          <path d="M0 0 Q20 5 30 30 Q5 20 0 0Z" fill={`${gold}30`}/>
          <circle cx="8" cy="8" r="3" fill={gold} opacity="0.6"/>
          <circle cx="18" cy="6" r="1.5" fill={saffron} opacity="0.5"/>
          <circle cx="6" cy="18" r="1.5" fill={saffron} opacity="0.5"/>
          <path d="M2 40 Q12 28 25 20" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.5"/>
          <path d="M40 2 Q28 12 20 25" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.5"/>
        </svg>
      ))}
      {/* Double border */}
      <div style={{ position:"absolute", inset:8, border:`1px solid ${gold}`, opacity:0.4, borderRadius:3, pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:5, textAlign:"center" }}>
        {/* Om / Diya */}
        <div style={{ fontSize:28, marginBottom:4 }}>🪔</div>
        <p style={{ fontSize:9.5, letterSpacing:"0.3em", textTransform:"uppercase", color:maroon, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>With love & joy</p>
        {/* Ornamental rule */}
        <div style={{ display:"flex", alignItems:"center", gap:6, margin:"8px 0" }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${gold})` }}/>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2C12 2 14 8 20 8C14 8 14 14 20 20C14 14 12 22 12 22C12 22 10 14 4 20C10 14 10 8 4 8C10 8 12 2 12 2Z" fill={gold}/></svg>
          <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${gold})` }}/>
        </div>
        <div style={{ fontFamily:"'Cormorant Garamond','Playfair Display',Georgia,serif", fontSize:44, fontWeight:700, color:maroon, lineHeight:1.1, margin:"4px 0" }}>
          <Editable value={data.eventTitle} onChange={v=>onChange("eventTitle",v)} placeholder="Mehndi Celebration" style={{ fontSize:40, fontWeight:700, color:maroon, fontFamily:"'Cormorant Garamond',Georgia,serif" }}/>
        </div>
        <div style={{ fontSize:28, fontFamily:"'Great Vibes','Dancing Script',cursive", color:saffron, margin:"4px 0 8px" }}>you're invited!</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, margin:"8px 0 16px" }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${gold})` }}/>
          <span style={{ fontSize:14 }}>🌸</span>
          <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${gold})` }}/>
        </div>
        {/* Fields */}
        <div style={{ textAlign:"left" }}>
          {[{icon:"🌼",label:"DATE",key:"date",placeholder:"Saturday, 15th June 2025"},{icon:"⏰",label:"TIME",key:"time",placeholder:"6:00 PM Onwards"},{icon:"📍",label:"VENUE",key:"venue",placeholder:"Venue & full address"},{icon:"📱",label:"RSVP",key:"rsvp",placeholder:"+91 9XXXXXXXXX"}].map(({icon,label,key,placeholder})=>(
            <div key={key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11, background:"rgba(200,151,26,0.06)", borderRadius:8, padding:"8px 12px", border:`1px solid rgba(200,151,26,0.2)` }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", color:saffron, fontFamily:"'Outfit',sans-serif", textTransform:"uppercase" }}>{label}: </span>
                <Editable value={data[key]} onChange={v=>onChange(key,v)} placeholder={placeholder} style={{ fontSize:12.5, color:"#2C1A0E", fontFamily:"'Outfit',sans-serif" }} width="calc(100% - 50px)" align="left"/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${gold})` }}/>
          <span style={{ fontSize:13 }}>🌸 🎊 🌸</span>
          <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${gold})` }}/>
        </div>
        <p style={{ fontSize:11, fontFamily:"'Cormorant Garamond',Georgia,serif", color:maroon, margin:"12px 0 0", fontStyle:"italic" }}>Blessings & celebrations await</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEMPLATES REGISTRY
══════════════════════════════════════════════════════════════════════════ */
const TEMPLATES = [
  { id:"botanical", name:"Botanical", subtitle:"Green & Gold", emoji:"🌿", Component: BotanicalFlyer },
  { id:"nightglam", name:"Night Glam", subtitle:"Dark & Dramatic", emoji:"✨", Component: NightGlamFlyer },
  { id:"minimal",   name:"Minimal",   subtitle:"Clean Elegant",   emoji:"🤍", Component: MinimalFlyer },
  { id:"festive",   name:"Festive",   subtitle:"Indian Vibrant",  emoji:"🪔", Component: FestiveFlyer },
];

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function InvitationCustomizer() {
  const _ik = "tendr_invitation_draft_v2";
  const [templateId, setTemplateId] = useState(() => {
    try { return JSON.parse(localStorage.getItem(_ik) || '{}').templateId || "botanical"; } catch { return "botanical"; }
  });
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(_ik) || '{}').data || { eventTitle:"", date:"", time:"", venue:"", rsvp:"" }; } catch { return { eventTitle:"", date:"", time:"", venue:"", rsvp:"" }; }
  });
  const [copies, setCopies] = useState(50);
  const [ordered, setOrdered] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef(null);

  const change = (k, v) => setData(p => ({ ...p, [k]: v }));

  useEffect(() => {
    try { localStorage.setItem(_ik, JSON.stringify({ templateId, data })); } catch {}
  }, [templateId, data]);

  const allFilled = data.date && data.time && data.venue;

  const downloadFlyer = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(flyerRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = "invitation.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch(e) { alert("Download failed — try screenshotting the flyer instead."); }
    setDownloading(false);
  };

  const ActiveTemplate = TEMPLATES.find(t => t.id === templateId)?.Component || BotanicalFlyer;

  return (
    <div style={{ minHeight:"100vh", background:"#F0EBE0", fontFamily: font }}>
      <SEO title="Invitation Flyer — Tendr" description="Customise a beautiful invitation flyer." path="/invitation/customize"/>
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Dancing+Script:wght@600&display=swap" rel="stylesheet"/>
      <HamburgerNav/>

      <div style={{ maxWidth: 1180, margin:"0 auto", padding:"28px 20px 80px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <p style={{ fontSize:11, fontWeight:800, color:"#C47A2E", textTransform:"uppercase", letterSpacing:"0.16em", margin:"0 0 6px" }}>Invitation Flyer</p>
          <h1 style={{ fontSize:"clamp(1.4rem,2.5vw,2rem)", fontWeight:900, color:"#2C1A0E", margin:"0 0 6px" }}>Customise Your Invite</h1>
          <p style={{ fontSize:13, color:"#7A5535", margin:0 }}>Pick a template, fill in your details, download or share</p>
        </div>

        {/* Template picker */}
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:28 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplateId(t.id)}
              style={{ padding:"10px 18px", borderRadius:12, border:`2px solid ${templateId===t.id ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: templateId===t.id ? "rgba(196,122,46,0.1)" : "#fff", cursor:"pointer", fontFamily:font, display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth:90, transition:"all 0.15s" }}>
              <span style={{ fontSize:22 }}>{t.emoji}</span>
              <span style={{ fontSize:12, fontWeight:700, color: templateId===t.id ? "#C47A2E" : "#2C1A0E" }}>{t.name}</span>
              <span style={{ fontSize:10, color:"#9B7450" }}>{t.subtitle}</span>
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:36, justifyContent:"center", alignItems:"flex-start", flexWrap:"wrap" }}>
          {/* Flyer */}
          <div ref={flyerRef} style={{ flexShrink:0 }}>
            <ActiveTemplate data={data} onChange={change}/>
          </div>

          {/* Controls */}
          <div style={{ width:300, display:"flex", flexDirection:"column", gap:14, flexShrink:0 }}>

            {/* Quick fill */}
            <div style={{ background:"#FFFCF5", borderRadius:16, border:"1.5px solid rgba(196,122,46,0.2)", padding:"20px" }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#2C1A0E", margin:"0 0 12px" }}>Fill in Details</h3>
              {[
                { key:"eventTitle", label:"Event / Occasion", placeholder:"e.g. Birthday Celebration" },
                { key:"date",       label:"Date *",            placeholder:"e.g. 15th June 2025" },
                { key:"time",       label:"Time *",            placeholder:"e.g. 7:00 PM Onwards" },
                { key:"venue",      label:"Venue *",           placeholder:"Venue name & address" },
                { key:"rsvp",       label:"RSVP",              placeholder:"Phone or email" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:10.5, fontWeight:700, color:"#9B7450", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:4 }}>{label}</label>
                  <input value={data[key]} onChange={e => change(key, e.target.value)} placeholder={placeholder}
                    style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:"1.5px solid rgba(196,122,46,0.22)", fontSize:13, fontFamily:font, outline:"none", boxSizing:"border-box" }}/>
                </div>
              ))}
            </div>

            {/* Download + Share */}
            <div style={{ background:"#FFFCF5", borderRadius:16, border:"1.5px solid rgba(196,122,46,0.2)", padding:"20px", display:"flex", flexDirection:"column", gap:10 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#2C1A0E", margin:"0 0 4px" }}>Save & Share</h3>
              <button onClick={downloadFlyer} disabled={downloading}
                style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", background:downloading?"#e5e7eb":"linear-gradient(135deg,#C47A2E,#CCAB4A)", color:downloading?"#9ca3af":"#fff", fontSize:14, fontWeight:700, cursor:downloading?"not-allowed":"pointer", fontFamily:font, boxShadow:downloading?"none":"0 3px 12px rgba(196,122,46,0.35)" }}>
                {downloading ? "Downloading…" : "⬇ Download as Image"}
              </button>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`You're Invited!${data.eventTitle ? " to " + data.eventTitle : ""}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.venue}${data.rsvp ? "\nRSVP: " + data.rsvp : ""}`)}`, "_blank")}
                style={{ width:"100%", padding:"9px", borderRadius:10, border:"1.5px solid rgba(37,211,102,0.4)", background:"rgba(37,211,102,0.07)", color:"#15803d", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:font }}>
                📲 Share via WhatsApp
              </button>
            </div>

            {/* Printed copies */}
            <div style={{ background:"#FFFCF5", borderRadius:16, border:"1.5px solid rgba(196,122,46,0.2)", padding:"20px" }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#2C1A0E", margin:"0 0 4px" }}>Order Printed Copies</h3>
              <p style={{ fontSize:12, color:"#9B7450", margin:"0 0 12px", lineHeight:1.5 }}>High-quality prints delivered to you.</p>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12 }}>
                {[25,50,100,200].map(n => (
                  <button key={n} onClick={() => setCopies(n)}
                    style={{ padding:"5px 14px", borderRadius:100, border:`1.5px solid ${copies===n?"#C47A2E":"rgba(196,122,46,0.25)"}`, background:copies===n?"#C47A2E":"#fff", color:copies===n?"#fff":"#6B3A1F", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:font }}>
                    {n}
                  </button>
                ))}
              </div>
              {!allFilled && <p style={{ fontSize:11, color:"#b45309", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"6px 10px", margin:"0 0 10px" }}>Fill Date, Time & Venue to continue</p>}
              {ordered ? (
                <div style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:10, padding:"12px", textAlign:"center" }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>✅</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#15803d" }}>Request submitted!</div>
                  <div style={{ fontSize:11, color:"#9B7450", marginTop:3 }}>Our team will confirm printing details.</div>
                </div>
              ) : (
                <button disabled={!allFilled} onClick={() => setOrdered(true)}
                  style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", background:allFilled?"linear-gradient(135deg,#C47A2E,#CCAB4A)":"#e5e7eb", color:allFilled?"#fff":"#9ca3af", fontSize:14, fontWeight:800, cursor:allFilled?"pointer":"not-allowed", fontFamily:font, boxShadow:allFilled?"0 3px 12px rgba(196,122,46,0.35)":"none" }}>
                  Book {copies} Printed Copies →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
