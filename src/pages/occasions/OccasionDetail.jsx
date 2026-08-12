import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";
const gold   = "#C47A2E";
const goldLt = "#D4A848";
const bg     = "#FDFAF5";
const ink    = "#1C0900";
const muted  = "rgba(28,9,0,0.42)";
const border = "rgba(196,122,46,0.14)";

/* ── Hub routes ─────────────────────────────────────────────────────────────── */
const HUB_ROUTES = {
  "birthday-party":  "/birthday-hub", "first-birthday":  "/birthday-hub",
  "anniversary":     "/anniversary-hub", "baby-shower":  "/baby-shower-hub",
  "gender-reveal":   "/baby-shower-hub", "newborn-welcome": "/baby-shower-hub",
  "housewarming":    "/housewarming-hub", "get-together": "/get-together-hub",
  "naming-ceremony": "/naming-ceremony-hub",
};

/* ── Equipment data ─────────────────────────────────────────────────────────── */
function getEquipment(id, guests) {
  const g = guests, t = Math.ceil(g / 6);
  const common = [
    { cat: "Seating & Tables", items: [{ name: "Folding chairs", qty: `${g+5} chairs` }, { name: "Tables (6-seater)", qty: `${t} tables` }] },
    { cat: "Serving", items: [{ name: "Disposable plates", qty: `${Math.ceil(g*1.5)} pcs` }, { name: "Cups / glasses", qty: `${g*2} pcs` }, { name: "Napkins", qty: `${g*3} pcs` }, { name: "Serving spoons", qty: "5–6 pcs" }, { name: "Garbage bags", qty: "4–5 bags" }] },
  ];
  const extra = {
    "birthday-party":  [{ cat:"Décor", items:[{ name:"Balloon bouquets", qty:`${Math.ceil(g/3)} bouquets` },{ name:"Fairy lights", qty:"3 sets" },{ name:"Photo backdrop", qty:"1" },{ name:"Birthday banner", qty:"1" }] },{ cat:"Entertainment", items:[{ name:g>40?"Sound system":"Bluetooth speaker", qty:g>40?"1 system":"1–2" },{ name:"Cake knife+server", qty:"1 set" }] }],
    "first-birthday":  [{ cat:"Décor", items:[{ name:"Balloon arch", qty:"1" },{ name:"Theme backdrop", qty:"1" },{ name:"Highchair deco kit", qty:"1 set" }] },{ cat:"Baby Safety", items:[{ name:"Soft play mat", qty:"1–2" },{ name:"Baby gate", qty:"1–2" }] }],
    "baby-shower":     [{ cat:"Décor", items:[{ name:"Pastel balloon clusters", qty:`${Math.ceil(g/5)}` },{ name:"Fairy lights", qty:"2–3 sets" },{ name:"Floral centrepieces", qty:`${t} pcs` }] },{ cat:"Activity Supplies", items:[{ name:"Plain onesies", qty:`${Math.ceil(g*0.5)}` },{ name:"Fabric markers", qty:"6–8" }] }],
    "anniversary":     [{ cat:"Décor", items:[{ name:"Candles (pillar+tea lights)", qty:`${Math.ceil(g/2)} pcs` },{ name:"Flower centrepieces", qty:`${t} pcs` },{ name:"Fairy lights", qty:"3 sets" }] },{ cat:"Table Setting", items:[{ name:"Champagne glasses", qty:`${g+5}` },{ name:"Cloth napkins", qty:`${g}` },{ name:"Table runners", qty:`${t}` }] }],
    "housewarming":    [{ cat:"Décor", items:[{ name:"Welcome floral arch", qty:"1" },{ name:"Indoor fairy lights", qty:"2 sets" },{ name:"Potted plants", qty:"3–4" }] },{ cat:"Serving", items:[{ name:"Serving trays", qty:`${Math.ceil(g/10)}` },{ name:"Chafing dishes", qty:"4–5 pcs" }] }],
    "get-together":    [{ cat:"Entertainment", items:[{ name:"Bluetooth speaker", qty:"1–2" },{ name:"Board games", qty:"2–3" }] }],
    "naming-ceremony": [{ cat:"Ceremony", items:[{ name:"Marigold garlands", qty:"4–6" },{ name:"Diyas", qty:"10–15" },{ name:"Puja thali", qty:"1–2 sets" }] },{ cat:"Décor", items:[{ name:"Fabric backdrop (saffron)", qty:"1" },{ name:"Fairy lights", qty:"2 sets" }] }],
    "gender-reveal":   [{ cat:"Reveal Items", items:[{ name:"Gender reveal box", qty:"1" },{ name:"Pink & blue balloons", qty:`${Math.ceil(g*1.5)}` },{ name:"Confetti cannons", qty:"4–6" }] }],
    "graduation":      [{ cat:"Décor", items:[{ name:"Graduation balloon arch", qty:"1" },{ name:"Memory photo wall", qty:"1" },{ name:"Graduation banner", qty:"1" }] }],
    "farewell":        [{ cat:"Décor", items:[{ name:"Memory photo wall", qty:"1" },{ name:"Farewell banner", qty:"1" }] },{ cat:"Keepsakes", items:[{ name:"Memory scrapbook", qty:"1" },{ name:"Card signing station", qty:"1" }] }],
    "retirement":      [{ cat:"Décor", items:[{ name:"Retirement banner", qty:"1" },{ name:"Career memory wall", qty:"1" }] },{ cat:"Keepsakes", items:[{ name:"Memory book", qty:"1" },{ name:"Gift & card table", qty:"1" }] }],
    "newborn-welcome": [{ cat:"Décor", items:[{ name:"Flower arch", qty:"1" },{ name:"Welcome balloons", qty:`${Math.ceil(g/4)}` }] },{ cat:"Comfort", items:[{ name:"Baby-safe floor mat", qty:"1" },{ name:"Extra chairs for elders", qty:`${Math.ceil(g*0.3)}` }] }],
  };
  return [...common, ...(extra[id] || [])];
}

/* ── Inline styles ──────────────────────────────────────────────────────────── */
const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .occ-step { animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1); }
  .occ-card { background:#fff; border-radius:18px; border:1.5px solid ${border}; padding:18px; transition:all 0.2s; }
  .occ-card:hover { border-color:rgba(196,122,46,0.35); box-shadow:0 6px 24px rgba(196,122,46,0.1); transform:translateY(-2px); }
  .occ-chip { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:100px; border:1.5px solid ${border}; background:#fff; color:${muted}; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; font-family:${font}; }
  .occ-chip:hover { border-color:rgba(196,122,46,0.4); color:${gold}; }
  .occ-chip.sel { border-color:${gold}; background:rgba(196,122,46,0.1); color:${gold}; font-weight:700; }
  input[type="date"]::-webkit-calendar-picker-indicator { opacity:0.4; cursor:pointer; }
  ::-webkit-scrollbar { display:none; }
  @media(min-width:768px) {
    .occ-grid-2 { grid-template-columns:repeat(2,1fr) !important; }
    .occ-grid-3 { grid-template-columns:repeat(3,1fr) !important; }
  }
`;

/* ── Download plan card as image ─────────────────────────────────────────────── */
async function downloadPlanCard(cardEl, name) {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardEl, { scale: 2, useCORS: true, backgroundColor: "#FDFAF5" });
    const link = document.createElement("a");
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-plan.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch {
    window.print();
  }
}

/* ── Progress indicator ─────────────────────────────────────────────────────── */
function Progress({ step, withTheme }) {
  const steps = withTheme
    ? ["Details", "Theme", "Vendors", "Gifts", "Your Plan"]
    : ["Details", "Vendors", "Gifts", "Your Plan"];
  const display = step === 0 ? 0 : withTheme ? step : step <= 1 ? step : step - 1;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 20px 14px", overflowX:"auto", scrollbarWidth:"none" }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < display;
        const cur  = n === display;
        return (
          <React.Fragment key={n}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <div style={{ width:cur?28:22, height:cur?28:22, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s", background: done?gold : cur?`linear-gradient(135deg,${gold},${goldLt})` : "rgba(196,122,46,0.08)", border: done||cur ? "none" : "1.5px solid rgba(196,122,46,0.18)", boxShadow: cur?"0 0 0 4px rgba(196,122,46,0.14)":"none" }}>
                {done
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontSize:cur?11:10, fontWeight:700, color:cur?"#fff":"rgba(196,122,46,0.4)", fontFamily:font }}>{n}</span>
                }
              </div>
              <span style={{ fontSize:9, fontWeight:cur?700:500, color:cur?gold:"rgba(196,122,46,0.32)", fontFamily:font, whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:1.5, minWidth:8, background:done?gold:"rgba(196,122,46,0.14)", marginBottom:14, transition:"background 0.3s" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function OccasionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cardRef  = useRef(null);

  /* wizard state */
  const [planMode, setPlanMode] = useState(null); // null | "with" | "without"
  const [step,     setStep]     = useState(0);    // 0=mode choice,1=details,2=theme(opt),3=vendors,4=gifts,5=blueprint
  const [guests,   setGuests]   = useState(20);
  const [date,     setDate]     = useState("");
  const [budget,   setBudget]   = useState("");
  const [theme,    setTheme]    = useState(null);
  const [vendors,  setVendors]  = useState([]);
  const [gifts,    setGifts]    = useState([]);
  const [checked,  setChecked]  = useState({});
  const [downloading, setDownloading] = useState(false);

  const occasion = getOccasionById(slug);
  if (!occasion) { navigate("/"); return null; }

  const hub       = HUB_ROUTES[slug];
  const equipment = getEquipment(slug, guests);
  const tasksDone = Object.values(checked).filter(Boolean).length;
  const tasksTotal = (occasion.checklist || []).length;
  const fmtNum    = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const withTheme = planMode === "with";

  /* navigation helpers */
  const next = () => {
    if (step === 1) { setStep(withTheme ? 2 : 3); return; }
    if (step === 2) { setStep(3); return; }
    setStep(s => Math.min(s + 1, 5));
  };
  const back = () => {
    if (step === 0) { navigate(-1); return; }
    if (step === 1) { setStep(0); return; }
    if (step === 3 && !withTheme) { setStep(1); return; }
    setStep(s => s - 1);
  };

  const toggleVendor = (c) => setVendors(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c]);
  const toggleGift   = (n) => setGifts(g  => g.includes(n)  ? g.filter(x => x !== n) : [...g, n]);
  const catVendors   = vendors.filter(v => (occasion.vendorCategories || []).includes(v));

  /* ── shared button styles ─────────────────────────────── */
  const btnPrimary = {
    flex:1, padding:"15px 20px", borderRadius:14, border:"none",
    background:`linear-gradient(135deg,${gold},${goldLt})`,
    color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer",
    fontFamily:font, boxShadow:"0 4px 18px rgba(196,122,46,0.28)",
    transition:"all 0.2s", letterSpacing:"0.01em",
  };
  const btnGhost = {
    padding:"13px 18px", borderRadius:14,
    border:`1.5px solid rgba(196,122,46,0.22)`,
    background:"transparent", color:gold,
    fontSize:14, fontWeight:600, cursor:"pointer",
    fontFamily:font, transition:"all 0.2s", whiteSpace:"nowrap",
  };

  /* ── section heading ────────────────────────────────────── */
  const SLabel = ({ children }) => (
    <div style={{ fontSize:10, fontWeight:800, color:gold, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:10, fontFamily:font }}>{children}</div>
  );

  /* ── field wrapper ──────────────────────────────────────── */
  const Field = ({ label, optional, children }) => (
    <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px", border:`1.5px solid ${border}`, marginBottom:12 }}>
      <div style={{ fontSize:10, fontWeight:800, color:gold, textTransform:"uppercase", letterSpacing:"0.13em", marginBottom:12, fontFamily:font, display:"flex", gap:6, alignItems:"center" }}>
        {label}
        {optional && <span style={{ fontWeight:400, color:"rgba(196,122,46,0.38)", textTransform:"none", letterSpacing:0, fontSize:10 }}>— optional</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight:"100dvh", background:bg, fontFamily:font, display:"flex", flexDirection:"column" }}>
      <style>{css}</style>
      <SEO title={`Plan your ${occasion.name} — Tendr`} description={`Guided ${occasion.name} planner — theme, vendors, checklist & blueprint.`} path={`/occasions/${slug}`} />

      {/* ── Sticky header ───────────────────────────────────── */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:bg, borderBottom:`1px solid ${border}` }}>
        <HamburgerNav active="Occasions" />

        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 20px 4px" }}>
          <button onClick={back} aria-label="Back" style={{ width:36, height:36, borderRadius:10, border:"none", background:"rgba(196,122,46,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.18s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{ fontSize:24 }}>{occasion.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:800, color:ink, lineHeight:1.2, letterSpacing:"-0.01em" }}>{occasion.name}</div>
            {occasion.localName && <div style={{ fontSize:10, color:gold, fontWeight:600 }}>{occasion.localName}</div>}
          </div>
          {hub && (
            <button onClick={() => navigate(hub)} style={{ fontSize:11, fontWeight:700, color:"#7C3AED", background:"rgba(124,58,237,0.07)", border:"1px solid rgba(124,58,237,0.18)", borderRadius:8, padding:"6px 11px", cursor:"pointer", fontFamily:font, flexShrink:0, transition:"all 0.18s" }}>
              🛠️ Party Tools
            </button>
          )}
        </div>

        {step > 0 && <Progress step={step} withTheme={withTheme} />}
      </div>

      {/* ── Scrollable content ──────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px 140px", maxWidth:700, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* ════ STEP 0: PLAN MODE CHOICE ════ */}
        {step === 0 && (
          <div className="occ-step">
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:11, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px", fontFamily:font }}>Planning mode</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, color:ink, margin:"0 0 8px", lineHeight:1.12, letterSpacing:"-0.01em" }}>How would you like to plan your {occasion.name}?</h2>
              <p style={{ fontSize:13.5, color:muted, margin:0, lineHeight:1.65, fontFamily:font }}>Choose a planning style — you can always explore themes later.</p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* With theme */}
              <button onClick={() => { setPlanMode("with"); setStep(1); }}
                style={{ padding:"22px 22px 20px", borderRadius:20, textAlign:"left", cursor:"pointer", border:`2px solid rgba(196,122,46,0.25)`, background:"#fff", fontFamily:font, position:"relative", overflow:"hidden", transition:"all 0.22s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background="rgba(196,122,46,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(196,122,46,0.25)"; e.currentTarget.style.background="#fff"; }}
              >
                <div aria-hidden style={{ position:"absolute", left:0, top:0, bottom:0, width:5, background:`linear-gradient(180deg,${gold},${goldLt})` }} />
                <div style={{ paddingLeft:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"rgba(196,122,46,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:18 }}>🎨</span>
                    </div>
                    <div>
                      <div style={{ fontFamily:serif, fontSize:18, fontWeight:500, color:ink, lineHeight:1.15 }}>Plan with a Theme</div>
                      <div style={{ fontSize:11, color:gold, fontWeight:600, marginTop:1 }}>Recommended</div>
                    </div>
                    <svg style={{ marginLeft:"auto", flexShrink:0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <p style={{ fontSize:13, color:muted, margin:0, lineHeight:1.6 }}>Browse {(occasion.decorThemes||[]).length} curated décor themes, pick the one that fits your vibe, and build your entire plan around it.</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
                    {["Theme picker","Vendor match","Full blueprint"].map(t => (
                      <span key={t} style={{ fontSize:10, fontWeight:600, color:gold, background:"rgba(196,122,46,0.08)", border:"1px solid rgba(196,122,46,0.18)", borderRadius:100, padding:"3px 9px" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </button>

              {/* Without theme */}
              <button onClick={() => { setPlanMode("without"); setStep(1); }}
                style={{ padding:"22px 22px 20px", borderRadius:20, textAlign:"left", cursor:"pointer", border:`1.5px solid ${border}`, background:"#fff", fontFamily:font, position:"relative", overflow:"hidden", transition:"all 0.22s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(196,122,46,0.32)"; e.currentTarget.style.background="rgba(196,122,46,0.025)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=border; e.currentTarget.style.background="#fff"; }}
              >
                <div aria-hidden style={{ position:"absolute", left:0, top:0, bottom:0, width:5, background:"rgba(196,122,46,0.18)" }} />
                <div style={{ paddingLeft:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"rgba(196,122,46,0.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:18 }}>⚡</span>
                    </div>
                    <div style={{ fontFamily:serif, fontSize:18, fontWeight:500, color:ink, lineHeight:1.15 }}>Jump straight in</div>
                    <svg style={{ marginLeft:"auto", flexShrink:0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(196,122,46,0.45)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <p style={{ fontSize:13, color:muted, margin:0, lineHeight:1.6 }}>Skip the theme step — go straight to picking vendors, gifts and building your plan. Great if you already know what you want.</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
                    {["Faster","Direct to vendors","Full blueprint"].map(t => (
                      <span key={t} style={{ fontSize:10, fontWeight:600, color:"rgba(196,122,46,0.55)", background:"rgba(196,122,46,0.05)", border:"1px solid rgba(196,122,46,0.12)", borderRadius:100, padding:"3px 9px" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 1: DETAILS ════ */}
        {step === 1 && (
          <div className="occ-step">
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>Step 1 of {withTheme?5:4}</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, color:ink, margin:"0 0 6px", lineHeight:1.12 }}>Let's set the scene</h2>
              <p style={{ fontSize:13.5, color:muted, margin:0, lineHeight:1.65 }}>Tell us about your celebration — we'll tailor every suggestion.</p>
            </div>

            {/* Guest count */}
            <Field label="How many guests?">
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
                <button onClick={() => setGuests(g => Math.max(5, g-5))} aria-label="Fewer guests" style={{ width:44, height:44, borderRadius:12, border:`1.5px solid rgba(196,122,46,0.2)`, background:"#F8F4EF", color:gold, fontSize:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontWeight:300 }}>−</button>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:52, fontWeight:900, color:ink, lineHeight:1, letterSpacing:"-0.03em" }}>{guests}</div>
                  <div style={{ fontSize:12, color:muted, marginTop:4, fontFamily:font }}>guests expected</div>
                </div>
                <button onClick={() => setGuests(g => g+5)} aria-label="More guests" style={{ width:44, height:44, borderRadius:12, border:"none", background:`linear-gradient(135deg,${gold},${goldLt})`, color:"#fff", fontSize:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontWeight:300 }}>+</button>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[10,20,30,50,75,100,150].map(n => (
                  <button key={n} onClick={() => setGuests(n)} style={{ fontSize:12, fontWeight:600, padding:"6px 13px", borderRadius:100, border:`1.5px solid ${guests===n?gold:"rgba(196,122,46,0.15)"}`, background:guests===n?"rgba(196,122,46,0.1)":"transparent", color:guests===n?gold:muted, cursor:"pointer", fontFamily:font, transition:"all 0.15s" }}>{n}</button>
                ))}
              </div>
            </Field>

            {/* Date */}
            <Field label="Party date" optional>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width:"100%", padding:"12px 15px", borderRadius:12, border:`1.5px solid rgba(196,122,46,0.15)`, background:"#FDFAF5", fontSize:14, fontFamily:font, color:ink, outline:"none", boxSizing:"border-box", cursor:"pointer", minHeight:44 }} />
            </Field>

            {/* Budget */}
            <Field label="Your budget" optional>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", fontSize:15, fontWeight:700, color:"rgba(30,15,0,0.25)", fontFamily:font }}>₹</span>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                  placeholder={String(Math.round((occasion.budgetMin+occasion.budgetMax)/2))}
                  style={{ width:"100%", padding:"12px 15px 12px 30px", borderRadius:12, border:`1.5px solid rgba(196,122,46,0.15)`, background:"#FDFAF5", fontSize:14, fontFamily:font, color:ink, outline:"none", boxSizing:"border-box", minHeight:44 }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                <span style={{ fontSize:11, color:"rgba(30,15,0,0.3)" }}>Typical for {guests} guests</span>
                <span style={{ fontSize:11, fontWeight:700, color:gold }}>{fmtNum(occasion.budgetMin)} – {fmtNum(occasion.budgetMax)}</span>
              </div>
            </Field>
          </div>
        )}

        {/* ════ STEP 2: THEME (with-theme only) ════ */}
        {step === 2 && withTheme && (
          <div className="occ-step">
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>Step 2 of 5</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, color:ink, margin:"0 0 6px", lineHeight:1.12 }}>Pick your décor theme</h2>
              <p style={{ fontSize:13.5, color:muted, margin:0, lineHeight:1.65 }}>This sets the look and feel for your entire plan — vendors, gifts and checklist will reflect it.</p>
            </div>

            <div className="occ-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr", gap:12 }}>
              {(occasion.decorThemes || []).map((t, i) => {
                const sel = theme?.name === t.name;
                return (
                  <button key={i} onClick={() => setTheme(sel ? null : t)}
                    style={{ padding:"20px 20px 18px", borderRadius:18, textAlign:"left", cursor:"pointer", border:`2px solid ${sel?gold:"rgba(196,122,46,0.14)"}`, background:sel?"rgba(196,122,46,0.06)":"#fff", fontFamily:font, position:"relative", overflow:"hidden", transition:"all 0.2s" }}
                    onMouseEnter={e => { if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.35)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(196,122,46,0.1)";} }}
                    onMouseLeave={e => { if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.14)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none";} }}
                  >
                    {sel && <div aria-hidden style={{ position:"absolute", left:0, top:0, bottom:0, width:5, background:`linear-gradient(180deg,${gold},${goldLt})` }} />}
                    <div style={{ paddingLeft:sel?10:0, transition:"padding 0.2s" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <div style={{ fontSize:15, fontWeight:800, color:sel?gold:ink, letterSpacing:"-0.01em" }}>{t.name}</div>
                        <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${sel?gold:"rgba(196,122,46,0.2)"}`, background:sel?gold:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:10, transition:"all 0.2s" }}>
                          {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </div>
                      <p style={{ fontSize:12.5, color:muted, margin:"0 0 12px", lineHeight:1.6 }}>{t.desc}</p>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {(t.tags||[]).slice(0,4).map(tag => (
                          <span key={tag} style={{ fontSize:10, fontWeight:600, color:sel?gold:"rgba(196,122,46,0.6)", background:sel?"rgba(196,122,46,0.1)":"rgba(196,122,46,0.06)", borderRadius:100, padding:"2px 8px" }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {!theme && <p style={{ fontSize:12, color:"rgba(30,15,0,0.28)", textAlign:"center", marginTop:16 }}>Tap a theme to select it — or continue without one</p>}
          </div>
        )}

        {/* ════ STEP 3: VENDORS ════ */}
        {step === 3 && (
          <div className="occ-step">
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>Step {withTheme?3:2} of {withTheme?5:4}</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, color:ink, margin:"0 0 6px", lineHeight:1.12 }}>What do you need?</h2>
              <p style={{ fontSize:13.5, color:muted, margin:0, lineHeight:1.65 }}>
                {theme ? `For a ${theme.name} theme, here's what pairs well:` : "Select everything you'd like to arrange — we'll match you with verified vendors."}
              </p>
            </div>

            {/* Theme hint */}
            {theme && (
              <div style={{ background:"rgba(196,122,46,0.06)", border:`1px solid rgba(196,122,46,0.18)`, borderRadius:14, padding:"12px 16px", marginBottom:18, display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:18 }}>🎨</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:gold }}>Theme: {theme.name}</div>
                  <div style={{ fontSize:11.5, color:muted, marginTop:1 }}>{(theme.tags||[]).join(" · ")}</div>
                </div>
              </div>
            )}

            <SLabel>Vendor categories</SLabel>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:22 }}>
              {(occasion.vendorCategories || []).map(cat => {
                const sel = vendors.includes(cat);
                return (
                  <button key={cat} onClick={() => toggleVendor(cat)} className={`occ-chip${sel?" sel":""}`}>
                    {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {cat}
                  </button>
                );
              })}
            </div>

            <SLabel>Activities & entertainment</SLabel>
            <div className="occ-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }}>
              {(occasion.activities || []).map((a, i) => {
                const sel = vendors.includes(a.name);
                return (
                  <button key={i} onClick={() => toggleVendor(a.name)}
                    style={{ padding:"14px 16px", borderRadius:14, border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.12)"}`, background:sel?"rgba(196,122,46,0.06)":"#fff", textAlign:"left", cursor:"pointer", fontFamily:font, transition:"all 0.18s", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:sel?gold:ink, marginBottom:2 }}>{a.name}</div>
                      <div style={{ fontSize:11.5, color:muted, lineHeight:1.4 }}>{(a.desc||"").slice(0,65)}{(a.desc||"").length>65?"…":""}</div>
                    </div>
                    <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${sel?gold:"rgba(196,122,46,0.18)"}`, background:sel?gold:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s" }}>
                      {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
            {vendors.length===0 && <p style={{ fontSize:12, color:"rgba(30,15,0,0.28)", textAlign:"center", marginTop:14 }}>Select at least one, or skip to continue</p>}
          </div>
        )}

        {/* ════ STEP 4: GIFTS ════ */}
        {step === 4 && (
          <div className="occ-step">
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>Step {withTheme?4:3} of {withTheme?5:4}</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, color:ink, margin:"0 0 6px", lineHeight:1.12 }}>Any gifts or hampers?</h2>
              <p style={{ fontSize:13.5, color:muted, margin:0, lineHeight:1.65 }}>Add gift ideas to your plan — or skip this step and go straight to your blueprint.</p>
            </div>

            <div className="occ-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr", gap:12 }}>
              {(occasion.giftIdeas || []).map((g, i) => {
                const sel = gifts.includes(g.name);
                return (
                  <button key={i} onClick={() => toggleGift(g.name)}
                    style={{ padding:"16px", borderRadius:16, textAlign:"left", cursor:"pointer", border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.12)"}`, background:sel?"rgba(196,122,46,0.06)":"#fff", fontFamily:font, transition:"all 0.18s" }}
                    onMouseEnter={e => { if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.3)"; e.currentTarget.style.transform="translateY(-1px)";} }}
                    onMouseLeave={e => { if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.12)"; e.currentTarget.style.transform="translateY(0)";} }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:7 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:sel?gold:ink, lineHeight:1.3 }}>{g.name}</div>
                      <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${sel?gold:"rgba(196,122,46,0.18)"}`, background:sel?gold:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s" }}>
                        {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:muted, lineHeight:1.5, marginBottom:8 }}>{(g.desc||"").slice(0,80)}{(g.desc||"").length>80?"…":""}</div>
                    <div style={{ display:"inline-block", fontSize:12, fontWeight:800, color:gold, background:"rgba(196,122,46,0.08)", borderRadius:100, padding:"3px 10px" }}>{g.price}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ STEP 5: BLUEPRINT ════ */}
        {step === 5 && (
          <div className="occ-step">
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:11, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>Your plan is ready ✦</p>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, color:ink, margin:"0 0 6px", lineHeight:1.12 }}>Your celebration blueprint</h2>
              <p style={{ fontSize:13.5, color:muted, margin:0, lineHeight:1.65 }}>Review everything, tick off tasks, and download your plan card.</p>
            </div>

            {/* ── Downloadable plan card ── */}
            <div ref={cardRef} style={{ background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)", border:`2px solid rgba(196,122,46,0.2)`, borderRadius:22, overflow:"hidden", marginBottom:20 }}>
              {/* Card header */}
              <div style={{ background:`linear-gradient(135deg,${gold},${goldLt})`, padding:"20px 22px 18px", position:"relative", overflow:"hidden" }}>
                <div aria-hidden style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.15)" }} />
                <div aria-hidden style={{ position:"absolute", top:-10, right:-10, width:70, height:70, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.1)" }} />
                <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
                  <span style={{ fontSize:36 }}>{occasion.icon}</span>
                  <div>
                    <div style={{ fontFamily:serif, fontSize:22, fontWeight:400, color:"#fff", lineHeight:1.1 }}>{occasion.name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", fontWeight:600, marginTop:2, fontFamily:font }}>Celebration Plan · Tendr</div>
                  </div>
                </div>
              </div>

              {/* Card details grid */}
              <div style={{ padding:"18px 20px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[
                    { icon:"👥", label:"Guests",  val:`${guests} people` },
                    { icon:"💰", label:"Budget",  val:budget?`₹${Number(budget).toLocaleString("en-IN")}`:`${fmtNum(occasion.budgetMin)}–${fmtNum(occasion.budgetMax)}` },
                    { icon:"📅", label:"Date",    val:date ? new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "TBD" },
                    { icon:"🎨", label:"Theme",   val:theme?.name||"No theme" },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", border:`1px solid rgba(196,122,46,0.1)` }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"rgba(196,122,46,0.45)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:3 }}>{icon} {label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color: val==="TBD"||val==="No theme" ? "rgba(30,15,0,0.28)" : ink }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Vendors selected */}
                {catVendors.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Vendors needed</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {catVendors.map(v => (
                        <span key={v} style={{ fontSize:11, fontWeight:600, color:gold, background:"rgba(196,122,46,0.08)", border:"1px solid rgba(196,122,46,0.18)", borderRadius:100, padding:"4px 10px" }}>{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gifts selected */}
                {gifts.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:gold, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Gift ideas</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {gifts.map(n => {
                        const g = (occasion.giftIdeas||[]).find(g=>g.name===n);
                        return g ? <span key={n} style={{ fontSize:11, fontWeight:600, color:"rgba(30,15,0,0.6)", background:"rgba(196,122,46,0.05)", border:`1px solid ${border}`, borderRadius:100, padding:"4px 10px" }}>{g.name} · {g.price}</span> : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Tendr footer on card */}
                <div style={{ borderTop:`1px solid rgba(196,122,46,0.1)`, paddingTop:12, marginTop:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, color:muted, fontFamily:font }}>Generated with Tendr · tendr.in</span>
                  <div style={{ display:"flex", gap:4 }}>
                    {["⭐","⭐","⭐","⭐","⭐"].map((s,i)=><span key={i} style={{fontSize:10}}>{s}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={async () => { setDownloading(true); await downloadPlanCard(cardRef.current, occasion.name); setDownloading(false); }}
              disabled={downloading}
              style={{ width:"100%", padding:"14px 20px", borderRadius:14, border:`1.5px solid rgba(196,122,46,0.3)`, background:"#fff", color:gold, fontSize:14, fontWeight:700, cursor:downloading?"wait":"pointer", fontFamily:font, transition:"all 0.2s", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {downloading
                ? <><div style={{ width:16,height:16,borderRadius:"50%",border:`2px solid rgba(196,122,46,0.2)`,borderTopColor:gold,animation:"spin 0.7s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Generating…</>
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download Plan Card</>
              }
            </button>

            {/* Vendor CTAs */}
            {catVendors.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <SLabel>Book your vendors</SLabel>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {catVendors.map(cat => (
                    <button key={cat} onClick={() => window.open(`/listings?serviceType=${cat}`, '_blank', 'noopener')}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderRadius:14, border:`1.5px solid ${border}`, background:"#fff", cursor:"pointer", fontFamily:font, transition:"all 0.18s" }}>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:14, fontWeight:700, color:ink }}>{cat}</div>
                        <div style={{ fontSize:11.5, color:muted, marginTop:1 }}>Opens in new tab · verified vendors</div>
                      </div>
                      <div style={{ background:`linear-gradient(135deg,${gold},${goldLt})`, borderRadius:9, padding:"7px 14px", flexShrink:0 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>Find ↗</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Baat Karo Tendr Se — WhatsApp CTA */}
            <a
              href={`https://wa.me/919211668427?text=Hi%20Tendr%2C%20I%27m%20planning%20a%20${encodeURIComponent(occasion.name)}%20and%20need%20help%20finding%20vendors.`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderRadius:14, background:"#25D366", marginBottom:20, textDecoration:"none", transition:"opacity 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity="0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity="1"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.065-1.112l-.29-.173-3.013.866.847-3.093-.19-.307A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#fff", lineHeight:1.2 }}>Baat Karo Tendr Se</div>
                <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.82)", marginTop:2 }}>Chat with us on WhatsApp — we'll help you plan</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            {/* Gifts browse */}
            {gifts.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <SLabel>Gift ideas</SLabel>
                {gifts.map(name => {
                  const g = (occasion.giftIdeas||[]).find(g=>g.name===name);
                  return g ? (
                    <div key={name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderRadius:12, background:"#fff", border:`1px solid ${border}`, marginBottom:7 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:ink }}>{g.name}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:gold, marginTop:1 }}>{g.price}</div>
                      </div>
                      <button onClick={() => navigate("/gift-hampers-cakes")} style={{ fontSize:11, fontWeight:700, color:gold, background:"rgba(196,122,46,0.08)", border:`1px solid rgba(196,122,46,0.2)`, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontFamily:font }}>View →</button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Checklist */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <SLabel>Planning checklist</SLabel>
                {tasksDone > 0 && <span style={{ fontSize:11, fontWeight:700, color:gold, marginTop:-8 }}>{tasksDone}/{tasksTotal}</span>}
              </div>
              {tasksDone > 0 && (
                <div style={{ height:4, background:"rgba(196,122,46,0.1)", borderRadius:3, overflow:"hidden", marginBottom:12 }}>
                  <div style={{ height:"100%", width:`${(tasksDone/tasksTotal)*100}%`, background:`linear-gradient(90deg,${gold},${goldLt})`, borderRadius:3, transition:"width 0.3s" }} />
                </div>
              )}
              {(occasion.checklist || []).map((item, i) => (
                <div key={i} onClick={() => setChecked(c => ({ ...c, [i]:!c[i] }))}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:checked[i]?"rgba(196,122,46,0.04)":"#fff", borderRadius:12, border:`1.5px solid ${checked[i]?"rgba(196,122,46,0.18)":border}`, marginBottom:6, cursor:"pointer", transition:"all 0.15s", minHeight:44, boxSizing:"border-box" }}>
                  <div style={{ width:22, height:22, borderRadius:7, border:`2px solid ${checked[i]?gold:"rgba(196,122,46,0.22)"}`, background:checked[i]?gold:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1, transition:"all 0.15s" }}>
                    {checked[i] && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize:13, color:checked[i]?"rgba(30,15,0,0.35)":ink, textDecoration:checked[i]?"line-through":"none", lineHeight:1.55, transition:"all 0.15s" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Equipment */}
            <div style={{ marginBottom:20 }}>
              <SLabel>What to arrange · {guests} guests</SLabel>
              {equipment.map(({ cat, items }) => (
                <div key={cat} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(196,122,46,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{cat}</div>
                  {items.map(({ name, qty }) => (
                    <div key={name} style={{ display:"flex", justifyContent:"space-between", padding:"9px 13px", background:"#fff", borderRadius:9, marginBottom:5, border:`1px solid rgba(196,122,46,0.08)` }}>
                      <span style={{ fontSize:13, color:ink }}>{name}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:gold, flexShrink:0, marginLeft:8 }}>{qty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Hub banner */}
            {hub && (
              <div onClick={() => navigate(hub)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", background:"linear-gradient(135deg,#1a0a2e,#2d1060)", borderRadius:16, cursor:"pointer" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>Party day is here? 🎉</div>
                  <div style={{ fontSize:11, color:"rgba(167,139,250,0.8)", marginTop:2 }}>Games, playlists, bill split & more</div>
                </div>
                <div style={{ background:"rgba(124,58,237,0.35)", border:"1px solid rgba(124,58,237,0.5)", borderRadius:10, padding:"8px 14px", flexShrink:0 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#C4B5FD" }}>Open Hub →</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed bottom CTA ─────────────────────────────────── */}
      {step > 0 && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:bg, borderTop:`1px solid ${border}`, padding:"12px 20px calc(12px + env(safe-area-inset-bottom,0px))", zIndex:50 }}>
          <div style={{ maxWidth:700, margin:"0 auto", display:"flex", gap:10 }}>
            {step > 1 && <button onClick={back} style={btnGhost}>← Back</button>}
            {step === 1 && <button onClick={back} style={btnGhost}>← Back</button>}
            {step < 5 && (
              <button onClick={next} style={btnPrimary}>
                {step===1 && (withTheme ? "Choose a theme →" : "What do you need? →")}
                {step===2 && (theme ? `Use "${theme.name}" →` : "Skip, pick vendors →")}
                {step===3 && (vendors.length>0 ? `Next — Gifts (${vendors.length} selected) →` : "Skip →")}
                {step===4 && (gifts.length>0 ? `See my plan (${gifts.length} gift${gifts.length>1?"s":""}) →` : "Skip, see my plan →")}
              </button>
            )}
            {step===5 && (
              <button onClick={() => { const cats=catVendors; window.open(cats.length>0?`/listings?serviceType=${cats[0]}`:"/listings", '_blank', 'noopener'); }} style={btnPrimary}>
                Start Booking Vendors ↗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
