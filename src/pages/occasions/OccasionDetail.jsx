import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

/* ── tokens ── */
const font  = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold  = "#C47A2E";
const goldLt= "#D4A848";
const bg    = "#FDFAF5";
const ink   = "#1C0900";
const muted = "rgba(28,9,0,0.42)";
const border= "rgba(196,122,46,0.14)";

const HUB_ROUTES = {
  "birthday-party":"\/birthday-hub","first-birthday":"\/birthday-hub",
  "anniversary":"\/anniversary-hub","baby-shower":"\/baby-shower-hub",
  "gender-reveal":"\/baby-shower-hub","newborn-welcome":"\/baby-shower-hub",
  "housewarming":"\/housewarming-hub","get-together":"\/get-together-hub",
  "naming-ceremony":"\/naming-ceremony-hub",
};

/* ── lookup tables ── */
const AGE_GROUPS = [
  { id:"Toddlers", label:"Toddlers", sub:"0–5 yrs", icon:"👶" },
  { id:"Kids",     label:"Kids",     sub:"6–12 yrs", icon:"🧒" },
  { id:"Teens",    label:"Teens",    sub:"13–19 yrs", icon:"🧑" },
  { id:"Adults",   label:"Adults",   sub:"20–60 yrs", icon:"👨" },
  { id:"Seniors",  label:"Seniors",  sub:"60+ yrs",   icon:"👴" },
];

const ALL_VENDORS = [
  "Decorator","Caterer","DJ","Photographer","Videographer",
  "Florist","Entertainer","Photo Booth","Live Band","Emcee / Host",
  "Lighting Setup","Sound System","Makeup Artist","Balloon Artist","Cake Artist",
];

const CATERING_OPTS = {
  default:            ["Full Buffet","Finger Foods","Snacks & Starters","High Tea","Dessert Station"],
  "birthday-party":   ["Full Buffet","Snacks & Starters","Finger Foods","Dessert Spread","Bar Setup"],
  "anniversary":      ["Plated Dinner","Cocktail Reception","Full Buffet","Intimate Meal"],
  "baby-shower":      ["High Tea","Light Snacks","Full Buffet","Customised Menu"],
  "first-birthday":   ["Kids Bites & Snacks","Full Buffet","Dessert Spread","Custom Menu"],
  "naming-ceremony":  ["Full Vegetarian Meal","Snacks & Mithai","Traditional Thali","Custom Menu"],
  "housewarming":     ["Full Meal","Snacks & Starters","Sweets & Mithai","Custom Menu"],
  "get-together":     ["Finger Foods","Full Buffet","Bar Setup","Light Snacks"],
  "newborn-welcome":  ["Light Snacks","Sweets & Mithai","Custom Menu"],
  "graduation":       ["Full Buffet","Snacks & Starters","Dessert Spread"],
  "farewell":         ["Finger Foods","Full Buffet","Dessert Spread"],
  "retirement":       ["Plated Dinner","Full Buffet","Cocktail Reception"],
  "gender-reveal":    ["Finger Foods","Dessert Spread","High Tea","Custom Menu"],
};

const CAKE_OPTS   = ["Single Tier","Multi-Tier","Cupcake Tower","Jar Cakes","Themed Cake","No Cake","Custom"];
const INVITE_OPTS = ["WhatsApp E-invite","Printed Card","Both","Digital Only","Skip — Word of Mouth"];

/* ── equipment calculator ── */
function getEquipment(id, guests) {
  const g=guests, t=Math.ceil(g/6);
  const common=[
    {cat:"Seating & Tables",items:[{name:"Folding chairs",qty:`${g+5} chairs`},{name:"Tables (6-seater)",qty:`${t} tables`}]},
    {cat:"Serving",items:[{name:"Disposable plates",qty:`${Math.ceil(g*1.5)} pcs`},{name:"Cups / glasses",qty:`${g*2} pcs`},{name:"Napkins",qty:`${g*3} pcs`},{name:"Serving spoons",qty:"5–6 pcs"},{name:"Garbage bags",qty:"4–5 bags"}]},
  ];
  const extra={
    "birthday-party":[{cat:"Décor",items:[{name:"Balloon bouquets",qty:`${Math.ceil(g/3)}`},{name:"Fairy lights",qty:"3 sets"},{name:"Photo backdrop",qty:"1"},{name:"Birthday banner",qty:"1"}]},{cat:"Entertainment",items:[{name:g>40?"Sound system":"Bluetooth speaker",qty:g>40?"1 system":"1–2"},{name:"Cake knife+server",qty:"1 set"}]}],
    "first-birthday":[{cat:"Décor",items:[{name:"Balloon arch",qty:"1"},{name:"Theme backdrop",qty:"1"},{name:"Highchair deco kit",qty:"1 set"}]},{cat:"Baby Safety",items:[{name:"Soft play mat",qty:"1–2"},{name:"Baby gate",qty:"1–2"}]}],
    "baby-shower":[{cat:"Décor",items:[{name:"Pastel balloon clusters",qty:`${Math.ceil(g/5)}`},{name:"Fairy lights",qty:"2–3 sets"},{name:"Floral centrepieces",qty:`${t} pcs`}]},{cat:"Activity Supplies",items:[{name:"Plain onesies",qty:`${Math.ceil(g*0.5)}`},{name:"Fabric markers",qty:"6–8"}]}],
    "anniversary":[{cat:"Décor",items:[{name:"Candles",qty:`${Math.ceil(g/2)} pcs`},{name:"Flower centrepieces",qty:`${t} pcs`},{name:"Fairy lights",qty:"3 sets"}]},{cat:"Table Setting",items:[{name:"Champagne glasses",qty:`${g+5}`},{name:"Cloth napkins",qty:`${g}`},{name:"Table runners",qty:`${t}`}]}],
    "housewarming":[{cat:"Décor",items:[{name:"Welcome floral arch",qty:"1"},{name:"Indoor fairy lights",qty:"2 sets"},{name:"Potted plants",qty:"3–4"}]},{cat:"Serving",items:[{name:"Serving trays",qty:`${Math.ceil(g/10)}`},{name:"Chafing dishes",qty:"4–5 pcs"}]}],
    "get-together":[{cat:"Entertainment",items:[{name:"Bluetooth speaker",qty:"1–2"},{name:"Board games",qty:"2–3"}]}],
    "naming-ceremony":[{cat:"Ceremony",items:[{name:"Marigold garlands",qty:"4–6"},{name:"Diyas",qty:"10–15"},{name:"Puja thali",qty:"1–2 sets"}]},{cat:"Décor",items:[{name:"Fabric backdrop",qty:"1"},{name:"Fairy lights",qty:"2 sets"}]}],
    "gender-reveal":[{cat:"Reveal Items",items:[{name:"Gender reveal box",qty:"1"},{name:"Confetti cannons",qty:"4–6"}]}],
    "graduation":[{cat:"Décor",items:[{name:"Graduation balloon arch",qty:"1"},{name:"Memory photo wall",qty:"1"}]}],
    "farewell":[{cat:"Décor",items:[{name:"Memory photo wall",qty:"1"},{name:"Farewell banner",qty:"1"}]},{cat:"Keepsakes",items:[{name:"Memory scrapbook",qty:"1"}]}],
    "retirement":[{cat:"Décor",items:[{name:"Retirement banner",qty:"1"},{name:"Career memory wall",qty:"1"}]}],
    "newborn-welcome":[{cat:"Décor",items:[{name:"Flower arch",qty:"1"},{name:"Welcome balloons",qty:`${Math.ceil(g/4)}`}]}],
  };
  return [...common,...(extra[id]||[])];
}

/* ── theme helpers ── */
function themeColor(tags=[]) {
  const t=tags.join(" ").toLowerCase();
  if(t.includes("pastel")||t.includes("floral")||t.includes("pink")) return "#FFB6C1";
  if(t.includes("neon")||t.includes("glow"))  return "#A855F7";
  if(t.includes("green")||t.includes("nature")||t.includes("garden")||t.includes("jungle")) return "#4D8C6F";
  if(t.includes("navy")||t.includes("stars")) return "#2D3A8C";
  if(t.includes("bollywood")||t.includes("indian")) return "#FF6B35";
  if(t.includes("red")||t.includes("red-carpet")) return "#C0392B";
  if(t.includes("gold")||t.includes("elegant")||t.includes("glam")) return "#D4A848";
  if(t.includes("minimal")||t.includes("white")||t.includes("modern")) return "#A09080";
  return "#C47A2E";
}

/* ── vendor recommendations based on theme + age groups ── */
function getRecommended(occasion, theme, ageGroups) {
  const recs = new Set(occasion.vendorCategories||[]);
  if(theme) {
    const t=(theme.tags||[]).join(" ").toLowerCase();
    if(t.includes("floral")||t.includes("garden")||t.includes("nature")) recs.add("Florist");
    if(t.includes("neon")||t.includes("glow")||t.includes("teen")) recs.add("DJ");
    if(t.includes("bollywood")||t.includes("indian")) recs.add("Emcee / Host");
    if(t.includes("gold")||t.includes("elegant")||t.includes("glam")) recs.add("Lighting Setup");
    if(t.includes("photo")||t.includes("memories")||t.includes("red-carpet")) recs.add("Photo Booth");
  }
  if(ageGroups.includes("Kids")||ageGroups.includes("Toddlers")) {
    recs.add("Entertainer"); recs.add("Balloon Artist");
  }
  if(ageGroups.includes("Teens")) { recs.add("DJ"); recs.add("Photo Booth"); }
  if(ageGroups.includes("Seniors")) { recs.add("Live Band"); }
  return recs;
}

/* ── timeline ── */
function buildTimeline(dateStr) {
  if(!dateStr) return null;
  const event=new Date(dateStr+"T00:00:00");
  const today=new Date(); today.setHours(0,0,0,0);
  const days=Math.round((event-today)/86400000);
  if(days<0) return null;
  const fmt=d=>d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
  const offset=n=>{const d=new Date(event);d.setDate(d.getDate()+n);return d;};
  const phases=[];
  if(days>=30) phases.push({when:"Right now",date:null,tasks:["Book decorator & caterer","Lock the venue","Draft your guest list"]});
  else if(days>=7) phases.push({when:"Right now — urgent",date:null,tasks:["Call your decorator today","Confirm caterer & menu urgently"]});
  else phases.push({when:"Right now",date:null,tasks:["Arrange decor supplies","Call vendors immediately"]});
  if(days>=21) phases.push({when:"3 weeks out",date:fmt(offset(-21)),tasks:["Send invitations","Order the cake","Plan the menu"]});
  if(days>=14) phases.push({when:"2 weeks out",date:fmt(offset(-14)),tasks:["Confirm headcount with caterer","Finalise entertainment"]});
  if(days>=7)  phases.push({when:"1 week out",date:fmt(offset(-7)),tasks:["All vendor confirmations","Buy decor supplies","Prep the playlist"]});
  if(days>=1)  phases.push({when:"Day before",date:fmt(offset(-1)),tasks:["Set up décor","Charge cameras","Confirm deliveries"]});
  phases.push({when:"🎉 Party day",date:fmt(event),tasks:["Welcome your guests","Take lots of photos","Enjoy every moment"]});
  return {days,phases};
}

/* ── budget split ── */
function buildBudgetSplit(total) {
  const n=Number(total);
  if(!n||n<=0) return null;
  return [
    {label:"Décor & Setup",   pct:28,color:"#C47A2E"},
    {label:"Catering",        pct:32,color:"#D4A848"},
    {label:"Photography",     pct:14,color:"#B8956A"},
    {label:"Entertainment",   pct:12,color:"#9B7450"},
    {label:"Cake & Sweets",   pct:8, color:"#8B6545"},
    {label:"Miscellaneous",   pct:6, color:"#7A5535"},
  ].map(c=>({...c,amt:Math.round(n*c.pct/100)}));
}

/* ── plan card download ── */
async function downloadPlanCard(el,name){
  try{
    const h2c=(await import("html2canvas")).default;
    const canvas=await h2c(el,{scale:2,useCORS:true,backgroundColor:"#FDFAF5"});
    const a=document.createElement("a");
    a.download=`${name.replace(/\s+/g,"-").toLowerCase()}-plan.png`;
    a.href=canvas.toDataURL("image/png");a.click();
  }catch{window.print();}
}

/* ── fmtNum ── */
const fmtNum=n=>`₹${Number(n).toLocaleString("en-IN")}`;

/* ── inline CSS ── */
const css=`
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .os{animation:fadeUp 0.28s cubic-bezier(0.22,1,0.36,1);}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:100px;border:1.5px solid ${border};background:#fff;color:${muted};font-size:13px;font-weight:500;cursor:pointer;transition:all 0.16s;font-family:${font};white-space:nowrap;position:relative;}
  .chip:hover{border-color:rgba(196,122,46,0.4);color:${gold};}
  .chip.sel{border-color:${gold};background:rgba(196,122,46,0.09);color:${gold};font-weight:700;}
  .chip-lg{padding:11px 20px;font-size:14px;}
  input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.45;cursor:pointer;filter:invert(60%) sepia(60%) saturate(400%) hue-rotate(5deg);}
  ::-webkit-scrollbar{display:none;}
  @media(min-width:600px){.g2{grid-template-columns:repeat(2,1fr)!important;}}
  @media(min-width:600px){.age-g{grid-template-columns:repeat(5,1fr)!important;}}
`;

/* ── Progress bar ── */
function Progress({step,withTheme}){
  const labels=withTheme?["Details","Guests","Theme","Services","Gifts","Plan"]:["Details","Guests","Services","Gifts","Plan"];
  const total=labels.length;
  const cur=withTheme?step:(step<=2?step:step>=4?step-1:step);
  return(
    <div style={{padding:"0 20px 0"}}>
      <div style={{display:"flex",gap:3,marginBottom:8}}>
        {labels.map((_,i)=>(
          <div key={i} style={{flex:1,height:2,borderRadius:1,background:i<cur?gold:"rgba(196,122,46,0.14)",transition:"background 0.3s"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:0,overflow:"hidden"}}>
        {labels.map((l,i)=>(
          <div key={l} style={{flex:1,fontSize:9,fontWeight:i+1===cur?700:400,color:i+1===cur?gold:"rgba(196,122,46,0.35)",fontFamily:font,textAlign:"center",textTransform:"uppercase",letterSpacing:"0.06em",transition:"all 0.3s",paddingBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function OccasionDetail(){
  const {slug}=useParams();
  const navigate=useNavigate();
  const cardRef=useRef(null);

  const [planMode,setPlanMode]=useState(null);
  const [step,setStep]=useState(0);
  const [guests,setGuests]=useState(20);
  const [date,setDate]=useState("");
  const [budget,setBudget]=useState("");
  const [ageGroups,setAgeGroups]=useState([]);
  const [theme,setTheme]=useState(null);
  const [vendors,setVendors]=useState([]);
  const [cateringType,setCateringType]=useState("");
  const [cakeType,setCakeType]=useState("");
  const [inviteType,setInviteType]=useState("");
  const [customVendor,setCustomVendor]=useState("");
  const [gifts,setGifts]=useState([]);
  const [checked,setChecked]=useState({});
  const [downloading,setDownloading]=useState(false);

  const occasion=getOccasionById(slug);
  if(!occasion){navigate("/");return null;}

  const hub=HUB_ROUTES[slug];
  const equipment=getEquipment(slug,guests);
  const withTheme=planMode==="with";
  const recommended=getRecommended(occasion,theme,ageGroups);
  const tasksDone=Object.values(checked).filter(Boolean).length;
  const tasksTotal=(occasion.checklist||[]).length;
  const catVendors=vendors.filter(v=>(occasion.vendorCategories||[]).includes(v)||ALL_VENDORS.includes(v));
  const timeline=buildTimeline(date);
  const budgetSplit=buildBudgetSplit(budget);

  /* navigation */
  const next=()=>{
    if(step===1){setStep(2);return;}
    if(step===2){setStep(withTheme?3:4);return;}
    if(step===3){setStep(4);return;}
    setStep(s=>Math.min(s+1,6));
  };
  const back=()=>{
    if(step===0){navigate(-1);return;}
    if(step===1){setStep(0);return;}
    if(step===2){setStep(1);return;}
    if(step===4&&!withTheme){setStep(2);return;}
    setStep(s=>s-1);
  };
  const canNext=()=>{
    if(step===1) return !!date&&guests>0;
    return true;
  };

  const toggleVendor=c=>setVendors(v=>v.includes(c)?v.filter(x=>x!==c):[...v,c]);
  const toggleGift=n=>setGifts(g=>g.includes(n)?g.filter(x=>x!==n):[...g,n]);
  const toggleAge=id=>setAgeGroups(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  const addCustomVendor=()=>{
    if(!customVendor.trim())return;
    if(!vendors.includes(customVendor.trim())) toggleVendor(customVendor.trim());
    setCustomVendor("");
  };

  /* styles */
  const btnPrimary={flex:1,padding:"15px 20px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:"0 4px 18px rgba(196,122,46,0.26)",transition:"all 0.2s",letterSpacing:"0.01em",opacity:canNext()?1:0.45};
  const btnGhost={padding:"13px 18px",borderRadius:14,border:`1.5px solid rgba(196,122,46,0.22)`,background:"transparent",color:gold,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:font,transition:"all 0.2s",whiteSpace:"nowrap"};
  const sLabel={fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font};
  const fieldCard={background:"#fff",borderRadius:18,padding:"20px 22px",border:`1.5px solid ${border}`,marginBottom:12,transition:"border-color 0.2s"};

  /* theme-aware gift filter: boost gifts that mention theme tags */
  const sortedGifts=[...(occasion.giftIdeas||[])].sort((a,b)=>{
    if(!theme) return 0;
    const tags=(theme.tags||[]).join(" ").toLowerCase();
    const aScore=[a.name,a.desc].join(" ").toLowerCase().split(" ").filter(w=>tags.includes(w)).length;
    const bScore=[b.name,b.desc].join(" ").toLowerCase().split(" ").filter(w=>tags.includes(w)).length;
    return bScore-aScore;
  });

  return(
    <div style={{minHeight:"100dvh",background:bg,fontFamily:font,display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      <SEO title={`Plan your ${occasion.name} — Tendr`} description={`Guided ${occasion.name} planner`} path={`/occasions/${slug}`}/>

      {/* sticky header */}
      <div style={{position:"sticky",top:0,zIndex:100,background:bg,borderBottom:`1px solid ${border}`}}>
        <HamburgerNav active="Occasions"/>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px 6px"}}>
          <button onClick={back} style={{width:36,height:36,borderRadius:10,border:"none",background:"rgba(196,122,46,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{fontSize:22}}>{occasion.icon}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:ink,letterSpacing:"-0.01em"}}>{occasion.name}</div>
            {occasion.localName&&<div style={{fontSize:10,color:gold,fontWeight:600}}>{occasion.localName}</div>}
          </div>
          {hub&&<button onClick={()=>navigate(hub)} style={{fontSize:11,fontWeight:700,color:"#7C3AED",background:"rgba(124,58,237,0.07)",border:"1px solid rgba(124,58,237,0.18)",borderRadius:8,padding:"6px 11px",cursor:"pointer",fontFamily:font,flexShrink:0}}>🛠️ Tools</button>}
        </div>
        {step>0&&<Progress step={step} withTheme={withTheme}/>}
      </div>

      {/* content */}
      <div style={{flex:1,overflowY:"auto",padding:"28px 20px 140px",maxWidth:680,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* ══ STEP 0: mode choice ══ */}
        {step===0&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.5rem,4vw,2rem)",color:ink,lineHeight:1.25,marginBottom:6}}>
              How would you like to plan?
            </p>
            <p style={{fontSize:13,color:muted,marginBottom:28,lineHeight:1.6}}>Pick a style — you can always change your mind.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <button onClick={()=>{setPlanMode("with");setStep(1);}}
                style={{padding:"22px 22px 20px",borderRadius:20,textAlign:"left",cursor:"pointer",border:`1.5px solid rgba(196,122,46,0.22)`,background:"#fff",fontFamily:font,position:"relative",overflow:"hidden",transition:"all 0.22s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=gold;e.currentTarget.style.background="rgba(196,122,46,0.04)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.22)";e.currentTarget.style.background="#fff";}}>
                <div aria-hidden style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:`linear-gradient(180deg,${gold},${goldLt})`}}/>
                <div style={{paddingLeft:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:40,height:40,borderRadius:12,background:"rgba(196,122,46,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎨</div>
                    <div>
                      <div style={{fontFamily:serif,fontSize:17,fontWeight:500,color:ink}}>Plan with a Theme</div>
                      <div style={{fontSize:10,color:gold,fontWeight:700,marginTop:1,letterSpacing:"0.06em",textTransform:"uppercase"}}>Recommended</div>
                    </div>
                    <svg style={{marginLeft:"auto",flexShrink:0}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <p style={{fontSize:12.5,color:muted,margin:"0 0 10px",lineHeight:1.6,paddingLeft:0}}>Browse curated décor themes and build your entire plan around one aesthetic.</p>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {["Theme picker","Vendor match","Full blueprint"].map(t=>(
                      <span key={t} style={{fontSize:10,fontWeight:600,color:gold,background:"rgba(196,122,46,0.08)",border:"1px solid rgba(196,122,46,0.16)",borderRadius:100,padding:"3px 9px"}}>{t}</span>
                    ))}
                  </div>
                </div>
              </button>

              <button onClick={()=>{setPlanMode("without");setStep(1);}}
                style={{padding:"22px 22px 20px",borderRadius:20,textAlign:"left",cursor:"pointer",border:`1.5px solid ${border}`,background:"#fff",fontFamily:font,position:"relative",overflow:"hidden",transition:"all 0.22s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.32)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=border;}}>
                <div aria-hidden style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:"rgba(196,122,46,0.18)"}}/>
                <div style={{paddingLeft:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:40,height:40,borderRadius:12,background:"rgba(196,122,46,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
                    <div style={{fontFamily:serif,fontSize:17,fontWeight:500,color:ink}}>Jump straight in</div>
                    <svg style={{marginLeft:"auto",flexShrink:0}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(196,122,46,0.4)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <p style={{fontSize:12.5,color:muted,margin:"0 0 10px",lineHeight:1.6}}>Skip theme selection — go straight to vendors and gifts. Great if you already know what you want.</p>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {["Faster","Direct to vendors","Full blueprint"].map(t=>(
                      <span key={t} style={{fontSize:10,fontWeight:600,color:"rgba(196,122,46,0.5)",background:"rgba(196,122,46,0.05)",border:"1px solid rgba(196,122,46,0.12)",borderRadius:100,padding:"3px 9px"}}>{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 1: details (conversational) ══ */}
        {step===1&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.35,marginBottom:28}}>
              Tell us about your<br/>
              <span style={{color:gold}}>{occasion.name} {occasion.icon}</span>
            </p>

            {/* guests */}
            <div style={{...fieldCard,borderColor:guests?"rgba(196,122,46,0.22)":border}}>
              <div style={sLabel}>How many guests?</div>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                <button onClick={()=>setGuests(g=>Math.max(5,g-5))} style={{width:44,height:44,borderRadius:12,border:`1.5px solid rgba(196,122,46,0.2)`,background:"#F8F4EF",color:gold,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:300,transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(196,122,46,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="#F8F4EF"}>−</button>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{fontFamily:serif,fontSize:52,fontWeight:900,color:ink,lineHeight:1,letterSpacing:"-0.03em"}}>{guests}</div>
                  <div style={{fontSize:11,color:muted,marginTop:3}}>guests</div>
                </div>
                <button onClick={()=>setGuests(g=>g+5)} style={{width:44,height:44,borderRadius:12,border:"none",background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:300,boxShadow:"0 3px 10px rgba(196,122,46,0.3)"}}>+</button>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[10,20,30,50,75,100,150].map(n=>(
                  <button key={n} onClick={()=>setGuests(n)} style={{fontSize:12,fontWeight:600,padding:"6px 13px",borderRadius:100,border:`1.5px solid ${guests===n?gold:"rgba(196,122,46,0.15)"}`,background:guests===n?"rgba(196,122,46,0.1)":"transparent",color:guests===n?gold:muted,cursor:"pointer",fontFamily:font,transition:"all 0.15s"}}>{n}</button>
                ))}
              </div>
            </div>

            {/* date — mandatory */}
            <div style={{...fieldCard,borderColor:date?gold:border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={sLabel}>Party date</div>
                {!date&&<span style={{fontSize:10,color:"#E05252",fontWeight:700,letterSpacing:"0.06em"}}>Required</span>}
                {date&&<span style={{fontSize:10,color:gold,fontWeight:700,letterSpacing:"0.06em"}}>✓ Set</span>}
              </div>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${date?"rgba(196,122,46,0.25)":"rgba(196,122,46,0.12)"}`,background:"#FDFAF5",fontSize:15,fontFamily:font,color:date?ink:"rgba(28,9,0,0.3)",outline:"none",boxSizing:"border-box",cursor:"pointer",minHeight:44}}/>
              {timeline&&<div style={{fontSize:11,color:gold,marginTop:8,fontWeight:600}}>⏳ {timeline.days} days away</div>}
            </div>

            {/* budget */}
            <div style={fieldCard}>
              <div style={sLabel}>Budget — optional</div>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:17,fontWeight:700,color:"rgba(30,15,0,0.22)",fontFamily:serif}}>₹</span>
                <input type="number" value={budget} onChange={e=>setBudget(e.target.value)}
                  placeholder={String(Math.round((occasion.budgetMin+occasion.budgetMax)/2))}
                  style={{width:"100%",padding:"12px 14px 12px 32px",borderRadius:12,border:`1.5px solid rgba(196,122,46,0.12)`,background:"#FDFAF5",fontSize:16,fontFamily:font,color:ink,outline:"none",boxSizing:"border-box",minHeight:44}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                <span style={{fontSize:11,color:"rgba(30,15,0,0.28)"}}>Typical for {guests} guests</span>
                <span style={{fontSize:11,fontWeight:700,color:gold}}>{fmtNum(occasion.budgetMin)} – {fmtNum(occasion.budgetMax)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2: who's coming ══ */}
        {step===2&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Who's coming?</p>
            <p style={{fontSize:13,color:muted,marginBottom:28,lineHeight:1.6}}>Helps us tailor entertainment and catering suggestions.</p>
            <div className="age-g" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {AGE_GROUPS.map(ag=>{
                const sel=ageGroups.includes(ag.id);
                return(
                  <button key={ag.id} onClick={()=>toggleAge(ag.id)}
                    style={{padding:"18px 10px",borderRadius:16,border:`1.5px solid ${sel?gold:border}`,background:sel?"rgba(196,122,46,0.07)":"#fff",cursor:"pointer",textAlign:"center",transition:"all 0.18s",display:"flex",flexDirection:"column",alignItems:"center",gap:8,minHeight:44}}>
                    <span style={{fontSize:26}}>{ag.icon}</span>
                    <div style={{fontSize:13,fontWeight:700,color:sel?gold:ink}}>{ag.label}</div>
                    <div style={{fontSize:10,color:muted}}>{ag.sub}</div>
                    {sel&&<div style={{width:6,height:6,borderRadius:"50%",background:gold,marginTop:2}}/>}
                  </button>
                );
              })}
            </div>
            {ageGroups.length===0&&<p style={{fontSize:12,color:"rgba(30,15,0,0.28)",textAlign:"center",marginTop:18}}>Select all that apply — or skip to continue</p>}
          </div>
        )}

        {/* ══ STEP 3: theme ══ */}
        {step===3&&withTheme&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Pick your vibe</p>
            <p style={{fontSize:13,color:muted,marginBottom:24,lineHeight:1.6}}>Sets the look for everything — vendors and gifts will reflect it.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(occasion.decorThemes||[]).map((t,i)=>{
                const sel=theme?.name===t.name;
                const tc=themeColor(t.tags);
                return(
                  <button key={i} onClick={()=>setTheme(sel?null:t)}
                    style={{padding:"16px 18px",borderRadius:16,border:`1.5px solid ${sel?gold:border}`,background:sel?"rgba(196,122,46,0.06)":"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.2s",display:"flex",alignItems:"center",gap:14,minHeight:44}}
                    onMouseEnter={e=>{if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.32)";e.currentTarget.style.transform="translateY(-1px)";}}}
                    onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor=border;e.currentTarget.style.transform="translateY(0)";}}}
                  >
                    <div style={{width:32,height:32,borderRadius:9,background:tc,flexShrink:0,boxShadow:`0 2px 8px ${tc}60`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:sel?gold:ink}}>{t.name}</div>
                      <div style={{fontSize:11,color:muted,marginTop:2}}>{(t.tags||[]).join(" · ")}</div>
                    </div>
                    {sel&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
            </div>
            {!theme&&<p style={{fontSize:12,color:"rgba(30,15,0,0.28)",textAlign:"center",marginTop:14}}>Tap to select — or skip without a theme</p>}
          </div>
        )}

        {/* ══ STEP 4: services ══ */}
        {step===4&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>What do you need?</p>
            {theme&&<div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:100,padding:"4px 12px",marginBottom:18}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:themeColor(theme.tags)}}/>
              <span style={{fontSize:11,fontWeight:700,color:gold}}>{theme.name} theme selected</span>
            </div>}
            {!theme&&<p style={{fontSize:13,color:muted,marginBottom:20,lineHeight:1.6}}>Select what you'd like to arrange for the celebration.</p>}

            {/* vendors — mandatory */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={sLabel}>Who do you need?</div>
                <span style={{fontSize:10,fontWeight:700,color:"#E05252",letterSpacing:"0.06em",marginTop:-2}}>Required</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
                {ALL_VENDORS.map(v=>{
                  const sel=vendors.includes(v);
                  const rec=recommended.has(v);
                  return(
                    <button key={v} onClick={()=>toggleVendor(v)} className={`chip${sel?" sel":""}`}>
                      {rec&&!sel&&<span style={{width:6,height:6,borderRadius:"50%",background:gold,flexShrink:0}}/>}
                      {v}
                      {rec&&!sel&&<span style={{fontSize:8,fontWeight:800,color:gold,opacity:0.7}}>✦</span>}
                    </button>
                  );
                })}
              </div>
              {recommended.size>0&&<p style={{fontSize:11,color:muted,marginBottom:10}}>✦ Recommended based on your theme and guests</p>}
              {/* add your own */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="text" value={customVendor} onChange={e=>setCustomVendor(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCustomVendor();}}
                  placeholder="Add your own vendor…"
                  style={{flex:1,padding:"9px 14px",borderRadius:100,border:`1.5px solid ${border}`,background:"#fff",fontSize:12,fontFamily:font,outline:"none",minHeight:38}}/>
                {customVendor.trim()&&<button onClick={addCustomVendor} style={{width:36,height:36,borderRadius:"50%",background:gold,border:"none",color:"#fff",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300,flexShrink:0}}>+</button>}
              </div>
            </div>

            {/* catering */}
            <div style={{marginBottom:20}}>
              <div style={sLabel}>Catering style</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {(CATERING_OPTS[occasion.id]||CATERING_OPTS.default).map(opt=>(
                  <button key={opt} onClick={()=>setCateringType(t=>t===opt?"":opt)} className={`chip${cateringType===opt?" sel":""}`}>{opt}</button>
                ))}
              </div>
            </div>

            {/* cake */}
            <div style={{marginBottom:20}}>
              <div style={sLabel}>Cake</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {CAKE_OPTS.map(opt=>(
                  <button key={opt} onClick={()=>setCakeType(t=>t===opt?"":opt)} className={`chip${cakeType===opt?" sel":""}`}>{opt}</button>
                ))}
              </div>
            </div>

            {/* invitations */}
            <div style={{marginBottom:20}}>
              <div style={sLabel}>Invitations</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {INVITE_OPTS.map(opt=>(
                  <button key={opt} onClick={()=>setInviteType(t=>t===opt?"":opt)} className={`chip${inviteType===opt?" sel":""}`}>{opt}</button>
                ))}
              </div>
            </div>

            {/* decor ideas from theme */}
            {theme&&(
              <div style={{background:"rgba(196,122,46,0.04)",border:`1px solid ${border}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{...sLabel,marginBottom:8}}>Perfect for {theme.name}</div>
                <p style={{fontSize:12.5,color:muted,margin:0,lineHeight:1.6}}>{theme.desc}</p>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 5: gifts ══ */}
        {step===5&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:6}}>Any gifts?</p>
            <p style={{fontSize:13,color:muted,marginBottom:24,lineHeight:1.6}}>Add to your plan or skip straight to the blueprint.</p>
            {theme&&<div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:100,padding:"4px 12px",marginBottom:16}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:themeColor(theme.tags)}}/>
              <span style={{fontSize:11,fontWeight:700,color:gold}}>Curated for {theme.name}</span>
            </div>}
            <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
              {sortedGifts.map((g,i)=>{
                const sel=gifts.includes(g.name);
                return(
                  <button key={i} onClick={()=>toggleGift(g.name)}
                    style={{padding:"15px 16px",borderRadius:14,textAlign:"left",cursor:"pointer",border:`1.5px solid ${sel?gold:"rgba(196,122,46,0.12)"}`,background:sel?"rgba(196,122,46,0.06)":"#fff",fontFamily:font,transition:"all 0.18s",minHeight:44}}
                    onMouseEnter={e=>{if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.3)";}}}
                    onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor="rgba(196,122,46,0.12)";}}}
                  >
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:5}}>
                      <div style={{fontSize:13,fontWeight:700,color:sel?gold:ink,lineHeight:1.3}}>{g.name}</div>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?gold:"rgba(196,122,46,0.18)"}`,background:sel?gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",marginTop:1}}>
                        {sel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <div style={{fontSize:11.5,color:muted,lineHeight:1.5,marginBottom:6}}>{(g.desc||"").slice(0,70)}{(g.desc||"").length>70?"…":""}</div>
                    <div style={{display:"inline-block",fontSize:11.5,fontWeight:800,color:gold,background:"rgba(196,122,46,0.08)",borderRadius:100,padding:"3px 10px"}}>{g.price}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STEP 6: blueprint ══ */}
        {step===6&&(
          <div className="os">
            <p style={{fontFamily:serif,fontSize:"clamp(1.4rem,3.5vw,1.9rem)",color:ink,lineHeight:1.3,marginBottom:4}}>Your plan is ready ✦</p>
            <p style={{fontSize:13,color:muted,marginBottom:24,lineHeight:1.6}}>Download your card, then book vendors and tick off the list.</p>

            {/* ── downloadable card ── */}
            <div ref={cardRef} style={{background:"linear-gradient(145deg,#FFF8EE,#FFFDF7)",border:`1.5px solid rgba(196,122,46,0.2)`,borderRadius:20,overflow:"hidden",marginBottom:12}}>
              <div style={{background:`linear-gradient(135deg,${gold},${goldLt})`,padding:"18px 20px 16px",position:"relative",overflow:"hidden"}}>
                <div aria-hidden style={{position:"absolute",top:-24,right:-24,width:90,height:90,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.14)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:10,position:"relative"}}>
                  <span style={{fontSize:30}}>{occasion.icon}</span>
                  <div>
                    <div style={{fontFamily:serif,fontSize:18,fontWeight:400,color:"#fff",lineHeight:1.1}}>{occasion.name}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:600,marginTop:2,fontFamily:font}}>Celebration Plan · Tendr</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {[
                    {icon:"👥",label:"Guests",val:`${guests} people`},
                    {icon:"💰",label:"Budget",val:budget?`₹${Number(budget).toLocaleString("en-IN")}`:`${fmtNum(occasion.budgetMin)}–${fmtNum(occasion.budgetMax)}`},
                    {icon:"📅",label:"Date",val:date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"TBD"},
                    {icon:"🎨",label:"Theme",val:theme?.name||"No theme"},
                  ].map(({icon,label,val})=>(
                    <div key={label} style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:`1px solid rgba(196,122,46,0.1)`}}>
                      <div style={{fontSize:9,fontWeight:700,color:"rgba(196,122,46,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>{icon} {label}</div>
                      <div style={{fontSize:12.5,fontWeight:700,color:val==="TBD"||val==="No theme"?"rgba(30,15,0,0.25)":ink}}>{val}</div>
                    </div>
                  ))}
                </div>
                {cateringType&&<div style={{marginBottom:8,fontSize:11.5,color:muted}}>🍽️ {cateringType} · {cakeType||"Cake TBD"} · {inviteType||"Invites TBD"}</div>}
                {catVendors.length>0&&(
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Vendors needed</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {catVendors.map(v=><span key={v} style={{fontSize:10.5,fontWeight:600,color:gold,background:"rgba(196,122,46,0.08)",border:"1px solid rgba(196,122,46,0.16)",borderRadius:100,padding:"3px 9px"}}>{v}</span>)}
                    </div>
                  </div>
                )}
                {gifts.length>0&&(
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Gift ideas</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {gifts.map(n=>{const g=(occasion.giftIdeas||[]).find(g=>g.name===n);return g?<span key={n} style={{fontSize:10.5,fontWeight:600,color:"rgba(30,15,0,0.55)",background:"rgba(196,122,46,0.04)",border:`1px solid ${border}`,borderRadius:100,padding:"3px 9px"}}>{g.name} · {g.price}</span>:null;})}
                    </div>
                  </div>
                )}
                <div style={{borderTop:`1px solid rgba(196,122,46,0.1)`,paddingTop:10,marginTop:2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9.5,color:muted,fontFamily:font}}>Generated with Tendr</span>
                  <span style={{fontSize:10,letterSpacing:2}}>★★★★★</span>
                </div>
              </div>
            </div>

            {/* download button */}
            <button onClick={async()=>{setDownloading(true);await downloadPlanCard(cardRef.current,occasion.name);setDownloading(false);}} disabled={downloading}
              style={{width:"100%",padding:"13px 20px",borderRadius:12,border:`1px solid rgba(196,122,46,0.25)`,background:"#fff",color:gold,fontSize:13.5,fontWeight:700,cursor:downloading?"wait":"pointer",fontFamily:font,transition:"all 0.2s",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {downloading?<><div style={{width:15,height:15,borderRadius:"50%",border:`2px solid rgba(196,122,46,0.2)`,borderTopColor:gold,animation:"spin 0.7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Generating…</>:<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download Plan Card</>}
            </button>

            {/* ── timeline ── */}
            {timeline&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:16,fontFamily:font}}>Your timeline · {timeline.days} days to go</div>
                <div style={{position:"relative",paddingLeft:24}}>
                  <div style={{position:"absolute",left:7,top:8,bottom:8,width:1.5,background:`linear-gradient(180deg,${gold},rgba(196,122,46,0.1))`}}/>
                  {timeline.phases.map((p,i)=>(
                    <div key={i} style={{position:"relative",marginBottom:i<timeline.phases.length-1?20:0}}>
                      <div style={{position:"absolute",left:-21,top:2,width:10,height:10,borderRadius:"50%",background:i===timeline.phases.length-1?gold:"#fff",border:`2px solid ${gold}`,transition:"all 0.3s"}}/>
                      <div style={{fontSize:10.5,fontWeight:700,color:i===timeline.phases.length-1?gold:gold,marginBottom:4,letterSpacing:"0.02em"}}>{p.when}{p.date&&<span style={{color:muted,fontWeight:400,marginLeft:6}}>{p.date}</span>}</div>
                      {p.tasks.map((t,j)=><div key={j} style={{fontSize:12,color:muted,lineHeight:1.5,marginBottom:1}}>· {t}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── budget split ── */}
            {budgetSplit&&(
              <div style={{marginBottom:24}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:14,fontFamily:font}}>Budget breakdown · {fmtNum(Number(budget))}</div>
                {budgetSplit.map(c=>(
                  <div key={c.label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:ink}}>{c.label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:gold}}>{fmtNum(c.amt)}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(196,122,46,0.1)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${c.pct}%`,background:c.color,borderRadius:3,transition:"width 0.8s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── vendor booking ── */}
            {catVendors.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>Book your vendors</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {catVendors.map(cat=>(
                    <button key={cat} onClick={()=>window.open(`/listings?serviceType=${cat}`,"_blank","noopener")}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderRadius:12,border:`1.5px solid ${border}`,background:"#fff",cursor:"pointer",fontFamily:font,transition:"all 0.18s",minHeight:44}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(196,122,46,0.35)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=border;}}>
                      <div>
                        <div style={{fontSize:13.5,fontWeight:700,color:ink}}>{cat}</div>
                        <div style={{fontSize:11,color:muted,marginTop:1}}>Opens in new tab</div>
                      </div>
                      <div style={{background:`linear-gradient(135deg,${gold},${goldLt})`,borderRadius:8,padding:"6px 13px",flexShrink:0}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Find ↗</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Baat Karo ── */}
            <a href={`https://wa.me/919211668427?text=Hi%20Tendr%2C%20I%27m%20planning%20a%20${encodeURIComponent(occasion.name)}%20for%20${guests}%20guests${date?`%20on%20${encodeURIComponent(new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}))}`:""}.%20Need%20help%20finding%20vendors!`}
              target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderRadius:14,background:"#25D366",marginBottom:20,textDecoration:"none",transition:"opacity 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.065-1.112l-.29-.173-3.013.866.847-3.093-.19-.307A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1.2}}>Baat Karo Tendr Se</div>
                <div style={{fontSize:11.5,color:"rgba(255,255,255,0.82)",marginTop:2}}>Chat on WhatsApp — we'll help you plan</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            {/* ── gifts list ── */}
            {gifts.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>Gift ideas</div>
                {gifts.map(name=>{
                  const g=(occasion.giftIdeas||[]).find(g=>g.name===name);
                  return g?(
                    <div key={name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:10,background:"#fff",border:`1px solid ${border}`,marginBottom:6}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:ink}}>{g.name}</div>
                        <div style={{fontSize:11,fontWeight:700,color:gold,marginTop:1}}>{g.price}</div>
                      </div>
                      <button onClick={()=>window.open("/gift-hampers-cakes","_blank","noopener")} style={{fontSize:11,fontWeight:700,color:gold,background:"rgba(196,122,46,0.07)",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontFamily:font}}>View ↗</button>
                    </div>
                  ):null;
                })}
              </div>
            )}

            {/* ── checklist ── */}
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:font}}>Checklist</div>
                {tasksDone>0&&<span style={{fontSize:11,fontWeight:700,color:gold}}>{tasksDone}/{tasksTotal}</span>}
              </div>
              {tasksDone>0&&(
                <div style={{height:4,background:"rgba(196,122,46,0.1)",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",width:`${(tasksDone/tasksTotal)*100}%`,background:`linear-gradient(90deg,${gold},${goldLt})`,borderRadius:2,transition:"width 0.3s"}}/>
                </div>
              )}
              {(occasion.checklist||[]).map((item,i)=>(
                <div key={i} onClick={()=>setChecked(c=>({...c,[i]:!c[i]}))}
                  style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 13px",background:checked[i]?"rgba(196,122,46,0.04)":"#fff",borderRadius:10,border:`1.5px solid ${checked[i]?"rgba(196,122,46,0.18)":border}`,marginBottom:5,cursor:"pointer",transition:"all 0.15s",minHeight:44,boxSizing:"border-box"}}>
                  <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checked[i]?gold:"rgba(196,122,46,0.2)"}`,background:checked[i]?gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,transition:"all 0.15s"}}>
                    {checked[i]&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{fontSize:12.5,color:checked[i]?"rgba(30,15,0,0.3)":ink,textDecoration:checked[i]?"line-through":"none",lineHeight:1.55,transition:"all 0.15s"}}>{item}</span>
                </div>
              ))}
            </div>

            {/* ── equipment ── */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:800,color:gold,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontFamily:font}}>What to arrange · {guests} guests</div>
              {equipment.map(({cat,items})=>(
                <div key={cat} style={{marginBottom:12}}>
                  <div style={{fontSize:9.5,fontWeight:700,color:"rgba(196,122,46,0.5)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{cat}</div>
                  {items.map(({name,qty})=>(
                    <div key={name} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#fff",borderRadius:8,marginBottom:4,border:`1px solid rgba(196,122,46,0.08)`}}>
                      <span style={{fontSize:12.5,color:ink}}>{name}</span>
                      <span style={{fontSize:11.5,fontWeight:700,color:gold,flexShrink:0,marginLeft:8}}>{qty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* hub banner */}
            {hub&&(
              <div onClick={()=>navigate(hub)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"linear-gradient(135deg,#1a0a2e,#2d1060)",borderRadius:14,cursor:"pointer",marginBottom:20}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>Party day is here? 🎉</div>
                  <div style={{fontSize:11,color:"rgba(167,139,250,0.8)",marginTop:2}}>Games, playlists, bill split & more</div>
                </div>
                <div style={{background:"rgba(124,58,237,0.35)",border:"1px solid rgba(124,58,237,0.5)",borderRadius:9,padding:"7px 13px",flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#C4B5FD"}}>Open Hub →</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── fixed bottom CTA ── */}
      {step>0&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:bg,borderTop:`1px solid ${border}`,padding:"12px 20px calc(12px + env(safe-area-inset-bottom,0px))",zIndex:50}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",gap:10}}>
            {step>1&&<button onClick={back} style={btnGhost}>← Back</button>}
            {step===1&&<button onClick={back} style={btnGhost}>← Back</button>}
            {step<6&&(
              <button onClick={next} disabled={!canNext()} style={btnPrimary}>
                {step===1&&(!date?"Set a date first →":"Next — Who's coming? →")}
                {step===2&&"Next →"}
                {step===3&&(theme?`Use "${theme.name}" →`:"Skip — no theme →")}
                {step===4&&(vendors.length>0?`Next — Gifts →`:"Skip →")}
                {step===5&&(gifts.length>0?`See my plan →`:"Skip — see plan →")}
              </button>
            )}
            {step===6&&(
              <button onClick={()=>{const cats=catVendors;window.open(cats.length>0?`/listings?serviceType=${cats[0]}`:"/listings","_blank","noopener");}} style={btnPrimary}>
                Start Booking Vendors ↗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
