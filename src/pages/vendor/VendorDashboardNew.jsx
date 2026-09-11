import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Tokens ────────────────────────────────────────────────────────────────────
const gold="#C47A2E",goldLt="#CCAB4A",ink="#1C0A04",cream="#FAF7F2",muted="#9B7450";
const font="'Outfit',sans-serif",serif="'Cormorant Garamond',Georgia,serif";
const BASE=import.meta.env.VITE_BASE_URL;
const aH=(t)=>({...(t?{Authorization:`Bearer ${t}`}:{}),"Content-Type":"application/json"});
const fmt=(n)=>"₹"+Number(n||0).toLocaleString("en-IN");
const todayStr=new Date().toISOString().slice(0,10);
const ls=(k,fb=[])=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};

// ── i18n ─────────────────────────────────────────────────────────────────────
const TR={
  EN:{home:"Home",work:"Work",money:"Money",clients:"Clients",quotes:"Quotes",reviews:"Reviews",profile:"Profile",calendar:"Calendar",insights:"Insights",flyer:"Flyer & Links",grow:"Grow",save:"Save",edit:"Edit",cancel:"Cancel",add:"Add",delete:"Delete",saving:"Saving…",confirmed:"Confirmed",pending:"Pending",cancelled:"Cancelled",completed:"Completed",upcoming:"Upcoming",noData:"No data yet.",setup:"DJ Setup",menu:"Menu",decor:"Decor",services:"Services",greeting:"Good day","switch":"हिन्दी"},
  HI:{home:"होम",work:"काम",money:"पैसे",clients:"क्लाइंट",quotes:"कोटेशन",reviews:"समीक्षाएं",profile:"प्रोफाइल",calendar:"कैलेंडर",insights:"अंतर्दृष्टि",flyer:"फ्लायर & लिंक",grow:"बढ़ें",save:"सहेजें",edit:"संपादित करें",cancel:"रद्द करें",add:"जोड़ें",delete:"हटाएं",saving:"सहेज रहे हैं…",confirmed:"पुष्टि",pending:"लंबित",cancelled:"रद्द",completed:"पूर्ण",upcoming:"आगामी",noData:"अभी कोई डेटा नहीं।",setup:"डीजे सेटअप",menu:"मेनू",decor:"सजावट",services:"सेवाएं",greeting:"नमस्ते","switch":"English"},
};

// ── Category options ──────────────────────────────────────────────────────────
const OPT={
  DJ:{setup:["Basic Setup","Full Production"],eventTypes:["House Party","Corporate","Venue"]},
  Caterer:{cuisine:["North Indian","South Indian","Snacks","Chinese Starters","Punjabi","Desserts","Italian","Other"],serviceStyle:["Buffet","Food Stations","Live Counters","Family Style"],menuType:["Veg","Non Veg","Jain"]},
  Decorator:{typesOfDecoration:["Floral","Balloon","Lighting","Fabric Draping","Backdrop","Prop-Based","Minimalist"],venueCoverage:["Interior","Exterior","Full","Backdrop Stage Setup","Extreme Focus"],themes:["Floral Focused","Balloon Dominant","Lighting Emphasis","Fabric Draping","Mixed Media","Prop Centered","Minimalist Touch"]},
  Photographer:{services:["Photographer","Videographer","Both"],photographyType:["Candid","Drone","Traditional","Cinematic"],hoursIncluded:["2","4","8","Full day"],editingTimeDays:["2","5","7","10+"]},
};

const TYPE_TAB={
  DJ:{key:"setup",icon:"M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"},
  Caterer:{key:"menu",icon:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"},
  Decorator:{key:"decor",icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"},
  Photographer:{key:"services",icon:"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
};

// ── Micro components ──────────────────────────────────────────────────────────
const Ico=({d,sz=16,c="currentColor"})=>(
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const Stars=({r=0,sz=13})=>(
  <span style={{display:"inline-flex",gap:1}}>
    {[1,2,3,4,5].map(i=><svg key={i} width={sz} height={sz} viewBox="0 0 24 24" fill={i<=Math.round(r)?goldLt:"none"} stroke={goldLt} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
  </span>
);
const Pill=({s})=>{
  const m={CONFIRMED:["#DCFCE7","#16A34A"],PENDING:["#FEF9C3","#CA8A04"],CANCELLED:["#FEE2E2","#DC2626"],COMPLETED:["#EFF6FF","#2563EB"]};
  const [bg,tc]=m[s]||["#F3F4F6","#6B7280"];
  return <span style={{background:bg,color:tc,borderRadius:100,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s}</span>;
};
const Card=({children,style})=>(
  <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid rgba(196,122,46,0.1)",boxShadow:"0 2px 10px rgba(28,10,4,0.04)",...style}}>{children}</div>
);
const SL=({children})=>(<div style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{children}</div>);
const Chips=({options,selected=[],onChange,disabled})=>(
  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {options.map(o=><button key={o} onClick={()=>!disabled&&onChange(selected.includes(o)?selected.filter(x=>x!==o):[...selected,o])} style={{padding:"6px 14px",borderRadius:100,fontSize:12.5,fontWeight:600,cursor:disabled?"default":"pointer",border:selected.includes(o)?`1.5px solid ${gold}`:"1px solid rgba(196,122,46,0.2)",background:selected.includes(o)?"rgba(196,122,46,0.1)":"#fff",color:selected.includes(o)?gold:muted,fontFamily:font}}>{o}</button>)}
  </div>
);
const Inp=({label,value,onChange,type="text",placeholder=""})=>(
  <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>{label}</label>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:14,fontFamily:font,color:ink,background:cream,boxSizing:"border-box"}}/>
  </div>
);
const Sel=({label,value,onChange,options})=>(
  <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>{label}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:14,fontFamily:font,color:ink,background:cream,boxSizing:"border-box",appearance:"none"}}>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  </div>
);
const Modal=({title,onClose,children,wide})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(28,10,4,0.55)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:28,width:"100%",maxWidth:wide?600:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(28,10,4,0.25)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontFamily:serif,fontSize:"1.3rem",fontWeight:500,color:ink,margin:0}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:22,lineHeight:1}}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ── SVG Charts ────────────────────────────────────────────────────────────────
function BarChart({data,color=gold}){
  if(!data.length)return<p style={{color:muted,fontSize:13}}>Not enough data.</p>;
  const max=Math.max(...data.map(d=>d.v),1);
  const W=500,H=140,pad=36,bw=Math.min(38,(W-pad*2)/data.length-6);
  return(
    <svg viewBox={`0 0 ${W} ${H+28}`} style={{width:"100%",maxWidth:W,fontFamily:font}}>
      {data.map((d,i)=>{
        const bh=Math.max(4,((d.v/max)*(H-20)));
        const x=pad+(i*(W-pad*2)/data.length)+(W-pad*2)/data.length/2-bw/2;
        return(
          <g key={i}>
            <rect x={x} y={H-bh} width={bw} height={bh} rx={4} fill={color} opacity={0.82}/>
            {d.v>0&&<text x={x+bw/2} y={H-bh-4} textAnchor="middle" fontSize={10} fill={muted}>{d.v}</text>}
            <text x={x+bw/2} y={H+16} textAnchor="middle" fontSize={10} fill={muted}>{d.l}</text>
          </g>
        );
      })}
      <line x1={pad} y1={H} x2={W-pad} y2={H} stroke="rgba(196,122,46,0.15)" strokeWidth={1}/>
    </svg>
  );
}
function LineChart({data,color=goldLt}){
  if(data.length<2)return<p style={{color:muted,fontSize:13}}>Not enough data.</p>;
  const max=Math.max(...data.map(d=>d.v),1);
  const W=500,H=120,pad=36;
  const pts=data.map((d,i)=>({x:pad+(i*(W-pad*2)/(data.length-1)),y:H-((d.v/max)*(H-20))-4}));
  const path="M"+pts.map(p=>`${p.x},${p.y}`).join("L");
  const area="M"+pts[0].x+","+H+"L"+pts.map(p=>`${p.x},${p.y}`).join("L")+`L${pts[pts.length-1].x},${H}Z`;
  return(
    <svg viewBox={`0 0 ${W} ${H+28}`} style={{width:"100%",maxWidth:W,fontFamily:font}}>
      <defs><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.22"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill="url(#lg2)"/>
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke={color} strokeWidth={2}/>
          <text x={p.x} y={H+16} textAnchor="middle" fontSize={10} fill={muted}>{data[i].l}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Button styles ─────────────────────────────────────────────────────────────
const bPrimary={padding:"10px 20px",borderRadius:100,background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font};
const bSecondary={padding:"10px 20px",borderRadius:100,background:cream,border:`1px solid rgba(196,122,46,0.2)`,color:muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:font};
const bDanger={padding:"8px 16px",borderRadius:100,background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:font};

// ════════════════════════════════════════════════════════════════════════════════
export default function VendorDashboardNew(){
  const navigate=useNavigate();
  const {user,token}=useSelector(s=>s.auth);
  const sType=user?.serviceType||"";
  const vId=user?._id||user?.id||"";
  const vName=user?.name||"Vendor";

  // Redirect GigPro types to their dashboard
  useEffect(()=>{
    if(["Anchor","Band","Choreographer"].includes(sType)) navigate("/vendor/demo-dashboard",{replace:true});
  },[sType]); // eslint-disable-line

  // ── Language ─────────────────────────────────────────────────────────────────
  const [lang,setLang]=useState(()=>ls(`tendr:lang:${vId}`,"EN"));
  const t=useCallback((k)=>TR[lang]?.[k]||TR.EN[k]||k,[lang]);
  useEffect(()=>lsSet(`tendr:lang:${vId}`,lang),[lang,vId]);

  // ── Tab ───────────────────────────────────────────────────────────────────────
  const [tab,setTab]=useState("home");

  // ── API data ──────────────────────────────────────────────────────────────────
  const [bookings,setBookings]=useState([]);
  const [outside,setOutside]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [loading,setLoading]=useState(true);

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const [toast,setToast]=useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3200);};

  // ── Profile ───────────────────────────────────────────────────────────────────
  const [profEdit,setProfEdit]=useState(false);
  const [profDraft,setProfDraft]=useState({});
  const [profSaving,setProfSaving]=useState(false);

  // ── Type-specific ─────────────────────────────────────────────────────────────
  const [specEdit,setSpecEdit]=useState(false);
  const [specDraft,setSpecDraft]=useState({});
  const [specSaving,setSpecSaving]=useState(false);

  // ── Packages (localStorage) ───────────────────────────────────────────────────
  const PKG_KEY=`tendr:pkgs:${vId}`;
  const [packages,setPackages]=useState(()=>ls(PKG_KEY));
  const [pkgModal,setPkgModal]=useState(null);
  const [pkgDraft,setPkgDraft]=useState({name:"",price:"",unit:"per event",items:""});
  const savePkgs=(up)=>{setPackages(up);lsSet(PKG_KEY,up);};

  // ── Calendar ──────────────────────────────────────────────────────────────────
  const [calMonth,setCalMonth]=useState(new Date().getMonth());
  const [calYear,setCalYear]=useState(new Date().getFullYear());
  const BLK_KEY=`tendr:blocked:${vId}`;
  const [blocked,setBlocked]=useState(()=>ls(BLK_KEY));
  const toggleBlock=(ds)=>{const nw=blocked.includes(ds)?blocked.filter(d=>d!==ds):[...blocked,ds];setBlocked(nw);lsSet(BLK_KEY,nw);};

  // ── CRM ───────────────────────────────────────────────────────────────────────
  const CRM_KEY=`tendr:crm:${vId}`;
  const [clients,setClients]=useState(()=>ls(CRM_KEY));
  const [cModal,setCModal]=useState(null);
  const [cDraft,setCDraft]=useState({name:"",phone:"",email:"",eventType:"",eventDate:"",budget:"",status:"Lead",notes:""});
  const saveClients=(up)=>{setClients(up);lsSet(CRM_KEY,up);};

  // ── Quotes ────────────────────────────────────────────────────────────────────
  const QT_KEY=`tendr:quotes:${vId}`;
  const [quotes,setQuotes]=useState(()=>ls(QT_KEY));
  const [qModal,setQModal]=useState(null);
  const [qDraft,setQDraft]=useState({clientName:"",eventDate:"",validTill:"",status:"Draft",items:[{desc:"",qty:1,rate:""}],notes:""});
  const saveQuotes=(up)=>{setQuotes(up);lsSet(QT_KEY,up);};

  // ── Expenses ──────────────────────────────────────────────────────────────────
  const EXP_KEY=`tendr:expenses:${vId}`;
  const [expenses,setExpenses]=useState(()=>ls(EXP_KEY));
  const [eModal,setEModal]=useState(false);
  const [eDraft,setEDraft]=useState({desc:"",amount:"",date:todayStr,category:"Materials"});
  const saveExpenses=(up)=>{setExpenses(up);lsSet(EXP_KEY,up);};

  // ── Reminders ─────────────────────────────────────────────────────────────────
  const REM_KEY=`tendr:reminders:${vId}`;
  const [reminders,setReminders]=useState(()=>ls(REM_KEY));
  const [rModal,setRModal]=useState(false);
  const [rDraft,setRDraft]=useState({text:"",date:todayStr,done:false});
  const saveRem=(up)=>{setReminders(up);lsSet(REM_KEY,up);};

  // ── Links hub ─────────────────────────────────────────────────────────────────
  const LNK_KEY=`tendr:links:${vId}`;
  const [links,setLinks]=useState(()=>ls(LNK_KEY,[{id:1,label:"Instagram",url:"",icon:"📸"},{id:2,label:"YouTube",url:"",icon:"▶️"},{id:3,label:"WhatsApp",url:"",icon:"💬"}]));
  const [lModal,setLModal]=useState(null);
  const [lDraft,setLDraft]=useState({label:"",url:"",icon:"🔗"});
  const saveLinks=(up)=>{setLinks(up);lsSet(LNK_KEY,up);};

  // ── Flyer ─────────────────────────────────────────────────────────────────────
  const [flyerBg,setFlyerBg]=useState(ink);
  const [flyerTag,setFlyerTag]=useState(`Book ${sType||"us"} for your next event`);
  const flyerRef=useRef();
  const printFlyer=()=>{
    const c=flyerRef.current;
    if(!c)return;
    const w=window.open("","_blank","width=600,height=800");
    w.document.write(`<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Cormorant+Garamond:wght@400;500&display=swap');body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;}@media print{body{background:transparent;}}</style></head><body>${c.outerHTML}</body></html>`);
    w.document.close();setTimeout(()=>w.print(),600);
  };

  // ── Data fetch ────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const h=token?{Authorization:`Bearer ${token}`}:{};
    fetch(`${BASE}/vendor/bookings`,{credentials:"include",headers:h})
      .then(r=>r.ok?r.json():{data:[]})
      .then(d=>setBookings(Array.isArray(d)?d:d.data||[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  },[token]);

  useEffect(()=>{
    if(!token)return;
    fetch(`${BASE}/vendors/outside-orders`,{headers:aH(token)})
      .then(r=>r.ok?r.json():{orders:[]})
      .then(d=>setOutside(d.orders||[]))
      .catch(()=>{});
  },[token]);

  useEffect(()=>{
    if(tab!=="reviews"||!token||!vId||reviews.length)return;
    fetch(`${BASE}/vendors/${vId}/reviews`,{headers:aH(token)})
      .then(r=>r.ok?r.json():null)
      .then(d=>{if(d)setReviews(d.reviews||d||[]);})
      .catch(()=>{});
  },[tab,token,vId]); // eslint-disable-line

  useEffect(()=>{
    if(!user)return;
    setProfDraft({name:user.name||"",phoneNumber:user.phoneNumber||"",yearsOfExperience:user.yearsOfExperience||"",teamSize:user.teamSize||"",gstNumber:user.gstNumber||""});
    setSpecDraft({
      setup:user.setup||[],lightsIncluded:user.lightsIncluded||false,eventTypes:user.eventTypes||[],
      cuisine:user.cuisine||[],serviceStyle:user.serviceStyle||[],menuType:user.menuType||[],
      typesOfDecoration:user.typesOfDecoration||[],venueCoverage:user.venueCoverage||[],themes:user.themes||[],
      services:user.services||[],photographyType:user.photographyType||[],hoursIncluded:user.hoursIncluded||"8",
      editingTimeDays:user.editingTimeDays||"5",photographersCount:user.photographersCount||1,
      videographersCount:user.videographersCount||0,socialMedia:user.socialMedia||false,album:user.album||true,
    });
  },[user]);

  // Browser reminder notifications
  useEffect(()=>{
    const due=reminders.filter(r=>!r.done&&r.date===todayStr);
    if(!due.length)return;
    if(Notification.permission==="granted") due.forEach(r=>new Notification("Tendr Reminder",{body:r.text}));
  },[reminders]);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const confirmed=bookings.filter(b=>b.status==="CONFIRMED");
  const pendingBkgs=bookings.filter(b=>b.status==="PENDING");
  const outsideRev=outside.reduce((s,o)=>s+(o.paidAmount||0),0);
  const rating=user?.avgReviewScore||0;
  const upcoming=confirmed.filter(b=>b.eventDate>=todayStr).sort((a,b)=>a.eventDate?.localeCompare(b.eventDate)).slice(0,3);
  const totalExp=expenses.reduce((s,e)=>s+Number(e.amount||0),0);

  // Booked dates for calendar
  const bookedDates=new Set([
    ...confirmed.filter(b=>b.eventDate).map(b=>b.eventDate.slice(0,10)),
    ...outside.filter(o=>o.status==="Upcoming"&&o.eventDate).map(o=>o.eventDate.slice(0,10)),
  ]);

  // Conflict detection: same date booked + blocked, or 2+ bookings same date
  const dateCounts={};
  [...confirmed.map(b=>b.eventDate?.slice(0,10)),...blocked].filter(Boolean).forEach(d=>{dateCounts[d]=(dateCounts[d]||0)+1;});
  const conflicts=Object.entries(dateCounts).filter(([,c])=>c>1).map(([d])=>d);

  const dueReminders=reminders.filter(r=>!r.done&&r.date<=todayStr);

  // Insights: monthly data
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const curMonth=new Date().getMonth();
  const bkgByMonth=MONTHS.slice(0,curMonth+1).map((l,i)=>({l,v:bookings.filter(b=>b.eventDate&&new Date(b.eventDate).getMonth()===i).length}));
  const revByMonth=MONTHS.slice(0,curMonth+1).map((l,i)=>({l,v:outside.filter(o=>o.eventDate&&new Date(o.eventDate).getMonth()===i).reduce((s,o)=>s+(o.paidAmount||0),0)}));

  // ── Save handlers ──────────────────────────────────────────────────────────────
  const saveProfile=async()=>{
    setProfSaving(true);
    try{
      const r=await fetch(`${BASE}/vendors/${vId}`,{method:"PATCH",headers:aH(token),credentials:"include",body:JSON.stringify(profDraft)});
      if(r.ok){setProfEdit(false);showToast("Profile saved!");}
      else{const d=await r.json();showToast(d.error||"Failed",false);}
    }catch{showToast("Network error",false);}
    setProfSaving(false);
  };
  const saveSpec=async()=>{
    setSpecSaving(true);
    try{
      const r=await fetch(`${BASE}/vendors/${vId}`,{method:"PATCH",headers:aH(token),credentials:"include",body:JSON.stringify(specDraft)});
      if(r.ok){setSpecEdit(false);showToast("Saved!");}
      else{const d=await r.json();showToast(d.error||"Failed",false);}
    }catch{showToast("Network error",false);}
    setSpecSaving(false);
  };

  // ── NAV ───────────────────────────────────────────────────────────────────────
  const typeTab=TYPE_TAB[sType];
  const typeTabKey=typeTab?.key;
  const NAV=[
    {key:"home",    label:t("home"),     group:"OVERVIEW", icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},
    {key:"work",    label:t("work"),     group:"EVENTS",   icon:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",badge:pendingBkgs.length},
    {key:"calendar",label:t("calendar"), group:"EVENTS",   icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",badge:conflicts.length,badgeColor:"#DC2626"},
    {key:"clients", label:t("clients"),  group:"MANAGE",   icon:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"},
    {key:"quotes",  label:t("quotes"),   group:"MANAGE",   icon:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"},
    {key:"money",   label:t("money"),    group:"MANAGE",   icon:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"},
    ...(typeTab?[{key:typeTabKey,label:t(typeTabKey),group:"MANAGE",icon:typeTab.icon}]:[]),
    {key:"packages",label:"Packages",   group:"MANAGE",   icon:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"},
    {key:"reviews", label:t("reviews"), group:"MANAGE",   icon:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"},
    {key:"insights",label:t("insights"),group:"GROW",     icon:"M18 20V10M12 20V4M6 20v-6"},
    {key:"flyer",   label:t("flyer"),   group:"GROW",     icon:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"},
    {key:"profile", label:t("profile"), group:"GROW",     icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"},
    {key:"grow",    label:t("grow"),    group:"GROW",     icon:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"},
  ];

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  let prevGrp=null;
  const sidebar=(
    <div style={{width:210,background:ink,display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0}}>
      <div style={{padding:"22px 20px 14px",borderBottom:"1px solid rgba(204,171,74,0.12)"}}>
        <div style={{fontFamily:serif,fontSize:"1.45rem",color:goldLt,fontWeight:400}}>tendr</div>
        <div style={{fontSize:10,color:"rgba(255,248,236,0.3)",marginTop:2,fontWeight:700,letterSpacing:"0.12em"}}>VENDOR DASHBOARD</div>
      </div>
      <div style={{flex:1,padding:"10px 0",overflowY:"auto"}}>
        {NAV.map(item=>{
          const showDiv=item.group!==prevGrp;prevGrp=item.group;
          return(
            <React.Fragment key={item.key}>
              {showDiv&&<div style={{padding:"12px 20px 3px",fontSize:9.5,fontWeight:700,letterSpacing:"0.16em",color:"rgba(204,171,74,0.3)",textTransform:"uppercase"}}>{item.group}</div>}
              <button onClick={()=>setTab(item.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 20px",background:tab===item.key?"rgba(204,171,74,0.12)":"none",border:"none",cursor:"pointer",color:tab===item.key?goldLt:"rgba(255,248,236,0.5)",fontSize:12.5,fontWeight:tab===item.key?700:500,fontFamily:font,textAlign:"left",borderLeft:tab===item.key?`3px solid ${goldLt}`:"3px solid transparent"}}>
                <Ico d={item.icon} sz={15} c="currentColor"/>
                {item.label}
                {!!item.badge&&<span style={{background:item.badgeColor||"#CA8A04",color:"#fff",borderRadius:100,padding:"1px 6px",fontSize:10,fontWeight:800,marginLeft:"auto"}}>{item.badge}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{padding:"14px 20px",borderTop:"1px solid rgba(204,171,74,0.1)"}}>
        <button onClick={()=>setLang(l=>l==="EN"?"HI":"EN")} style={{...bSecondary,width:"100%",fontSize:11.5,padding:"7px 12px",marginBottom:10}}>{t("switch")}</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:serif,color:"#fff",flexShrink:0}}>{vName[0]}</div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,248,236,0.8)",fontFamily:font,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{vName}</div>
            <div style={{fontSize:10,color:"rgba(255,248,236,0.35)"}}>{sType}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Alert banner ──────────────────────────────────────────────────────────────
  const alertBanner=(conflicts.length>0||dueReminders.length>0)&&(
    <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",gap:12,alignItems:"flex-start"}}>
      <Ico d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" sz={18} c="#DC2626"/>
      <div>
        {conflicts.length>0&&<div style={{fontSize:13,fontWeight:700,color:"#991B1B"}}>⚠️ Booking conflict detected on {conflicts.join(", ")} — <button onClick={()=>setTab("calendar")} style={{background:"none",border:"none",cursor:"pointer",color:"#DC2626",fontWeight:700,textDecoration:"underline",padding:0,fontFamily:font}}>view Calendar</button></div>}
        {dueReminders.map((r,i)=><div key={i} style={{fontSize:12.5,color:"#B91C1C",marginTop:4}}>🔔 {r.text}</div>)}
      </div>
    </div>
  );

  // ════════════ HOME ════════════════════════════════════════════════════════════
  const homeTab=(
    <div>
      {alertBanner}
      <h2 style={{fontFamily:serif,fontSize:"1.8rem",fontWeight:400,color:ink,marginBottom:4}}>{t("greeting")}, {vName.split(" ")[0]} 👋</h2>
      <p style={{color:muted,fontSize:13.5,marginBottom:22}}>Here's your business at a glance</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{label:t("confirmed"),value:confirmed.length,sub:"Tendr bookings"},{label:t("pending"),value:pendingBkgs.length,sub:"awaiting reply"},{label:"Earned",value:fmt(outsideRev),sub:"outside orders"},{label:"Rating",value:rating?`${rating.toFixed(1)} ★`:"—",sub:"avg score"}].map((s,i)=>(
          <Card key={i}><div style={{fontSize:22,fontWeight:800,color:ink}}>{s.value}</div><div style={{fontSize:11,color:muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3}}>{s.label}</div><div style={{fontSize:11,color:"rgba(155,116,80,0.6)",marginTop:1}}>{s.sub}</div></Card>
        ))}
      </div>
      {upcoming.length>0&&(
        <Card style={{marginBottom:16}}>
          <SL>{t("upcoming")}</SL>
          {upcoming.map((b,i)=>(
            <div key={b._id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i?"1px solid rgba(196,122,46,0.08)":"none"}}>
              <div><div style={{fontSize:14,fontWeight:700,color:ink}}>{b.consumerName||b.consumer?.name||"Client"}</div><div style={{fontSize:12,color:muted}}>{b.eventType} · {b.eventDate?.slice(0,10)}</div></div>
              <Pill s={b.status}/>
            </div>
          ))}
        </Card>
      )}
      <Card>
        <SL>Quick Actions</SL>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[["View Profile",()=>navigate(`/vendor/${vId}`)],["Add Client",()=>{setCDraft({name:"",phone:"",email:"",eventType:"",eventDate:"",budget:"",status:"Lead",notes:""});setCModal("new");}],["New Quote",()=>{setQDraft({clientName:"",eventDate:"",validTill:"",status:"Draft",items:[{desc:"",qty:1,rate:""}],notes:""});setQModal("new");}],["Add Reminder",()=>{setRDraft({text:"",date:todayStr,done:false});setRModal(true);}]].map(([l,a],i)=>(
            <button key={i} onClick={a} style={{...bSecondary,padding:"8px 16px"}}>{l}</button>
          ))}
        </div>
      </Card>
    </div>
  );

  // ════════════ CALENDAR ════════════════════════════════════════════════════════
  const calTab=(()=>{
    const fd=new Date(calYear,calMonth,1).getDay();
    const dim=new Date(calYear,calMonth+1,0).getDate();
    const cells=[...Array(fd).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
    while(cells.length%7)cells.push(null);
    const mStr=new Date(calYear,calMonth,1).toLocaleString("default",{month:"long",year:"numeric"});
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>Availability</h2>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>{const d=new Date(calYear,calMonth-1);setCalMonth(d.getMonth());setCalYear(d.getFullYear());}} style={bSecondary}>‹</button>
            <span style={{fontSize:13.5,fontWeight:600,color:ink,fontFamily:font,minWidth:160,textAlign:"center"}}>{mStr}</span>
            <button onClick={()=>{const d=new Date(calYear,calMonth+1);setCalMonth(d.getMonth());setCalYear(d.getFullYear());}} style={bSecondary}>›</button>
          </div>
        </div>
        {conflicts.length>0&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#991B1B",fontWeight:600}}>⚠️ Conflict on: {conflicts.join(", ")}</div>}
        <Card style={{marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{textAlign:"center",fontSize:10.5,fontWeight:700,color:muted,padding:"6px 0",textTransform:"uppercase",letterSpacing:"0.06em"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {cells.map((day,i)=>{
              if(!day)return<div key={i}/>;
              const ds=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isBook=bookedDates.has(ds),isBlk=blocked.includes(ds),isTd=ds===todayStr,isConf=conflicts.includes(ds);
              return(
                <div key={i} onClick={()=>toggleBlock(ds)} title={isBook?"Booked (from booking)":isBlk?"Blocked — click to unblock":"Click to block"} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:isBook||isBlk||isTd?700:400,background:isConf?"#FEE2E2":isBook?`linear-gradient(135deg,${gold},${goldLt})`:isBlk?"#374151":isTd?cream:"transparent",color:isConf?"#DC2626":isBook?"#fff":isBlk?"#fff":ink,border:isTd&&!isBook&&!isBlk?`1.5px solid ${gold}`:isConf?"1.5px solid #FCA5A5":"none",transition:"all 0.12s"}}>
                  {day}
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:10}}>
          {[["Booked",`linear-gradient(135deg,${gold},${goldLt})`,"#fff",null],["Blocked","#374151","#fff",null],["Today",cream,ink,`1.5px solid ${gold}`],["Conflict","#FEE2E2","#DC2626","1.5px solid #FCA5A5"]].map(([l,bg,tc,br])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:muted}}>
              <div style={{width:14,height:14,borderRadius:4,background:bg,border:br||"none",flexShrink:0}}/>{l}
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:muted}}>Click any date to block/unblock it. Blocked dates signal unavailability.</p>
      </div>
    );
  })();

  // ════════════ CLIENTS CRM ═════════════════════════════════════════════════════
  const crmTab=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>{t("clients")}</h2>
        <button onClick={()=>{setCDraft({name:"",phone:"",email:"",eventType:"",eventDate:"",budget:"",status:"Lead",notes:""});setCModal("new");}} style={bPrimary}>+ Add Client</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["All","Lead","Prospect","Confirmed","Completed"].map(s=>{
          const cnt=s==="All"?clients.length:clients.filter(c=>c.status===s).length;
          return<span key={s} style={{padding:"5px 14px",borderRadius:100,fontSize:12,fontWeight:600,background:cream,border:"1px solid rgba(196,122,46,0.15)",color:muted}}>{s} ({cnt})</span>;
        })}
      </div>
      {clients.length===0?<Card><p style={{color:muted,fontSize:13.5}}>{t("noData")}</p></Card>:
        clients.map((c,i)=>(
          <Card key={c.id||i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",fontFamily:serif,flexShrink:0}}>{c.name?.[0]||"?"}</div>
                  <div><div style={{fontSize:15,fontWeight:700,color:ink}}>{c.name}</div><div style={{fontSize:12,color:muted}}>{c.phone}{c.email?` · ${c.email}`:""}</div></div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:c.notes?8:0}}>
                  {c.eventType&&<span style={{fontSize:11.5,color:muted,background:cream,padding:"3px 10px",borderRadius:100,border:"1px solid rgba(196,122,46,0.15)"}}>{c.eventType}</span>}
                  {c.eventDate&&<span style={{fontSize:11.5,color:muted,background:cream,padding:"3px 10px",borderRadius:100,border:"1px solid rgba(196,122,46,0.15)"}}>{c.eventDate}</span>}
                  {c.budget&&<span style={{fontSize:11.5,color:gold,fontWeight:700}}>{fmt(c.budget)}</span>}
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:c.status==="Confirmed"?"#DCFCE7":c.status==="Lead"?"#FEF9C3":c.status==="Completed"?"#EFF6FF":"#F3F4F6",color:c.status==="Confirmed"?"#16A34A":c.status==="Lead"?"#CA8A04":c.status==="Completed"?"#2563EB":"#6B7280"}}>{c.status}</span>
                </div>
                {c.notes&&<p style={{fontSize:12.5,color:"#4A3020",margin:0,lineHeight:1.5}}>{c.notes}</p>}
              </div>
              <div style={{display:"flex",gap:6,marginLeft:12,flexShrink:0}}>
                <button onClick={()=>{setCDraft({...c});setCModal(c);}} style={bSecondary}>{t("edit")}</button>
                <button onClick={()=>saveClients(clients.filter(x=>x.id!==c.id))} style={bDanger}>×</button>
              </div>
            </div>
          </Card>
        ))
      }
      {cModal&&(
        <Modal title={cModal==="new"?"New Client":"Edit Client"} onClose={()=>setCModal(null)}>
          <Inp label="Name" value={cDraft.name} onChange={v=>setCDraft(p=>({...p,name:v}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Phone" value={cDraft.phone} onChange={v=>setCDraft(p=>({...p,phone:v}))} type="tel"/>
            <Inp label="Email" value={cDraft.email} onChange={v=>setCDraft(p=>({...p,email:v}))} type="email"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Event Type" value={cDraft.eventType} onChange={v=>setCDraft(p=>({...p,eventType:v}))}/>
            <Inp label="Event Date" value={cDraft.eventDate} onChange={v=>setCDraft(p=>({...p,eventDate:v}))} type="date"/>
          </div>
          <Inp label="Budget (₹)" value={cDraft.budget} onChange={v=>setCDraft(p=>({...p,budget:v}))} type="number"/>
          <Sel label="Status" value={cDraft.status} onChange={v=>setCDraft(p=>({...p,status:v}))} options={["Lead","Prospect","Confirmed","Completed"]}/>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Notes</label>
            <textarea value={cDraft.notes||""} onChange={e=>setCDraft(p=>({...p,notes:e.target.value}))} rows={3} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream,resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{const e={...cDraft,id:cModal==="new"?Date.now():cModal.id};saveClients(cModal==="new"?[...clients,e]:clients.map(x=>x.id===cModal.id?e:x));setCModal(null);showToast("Client saved!");}} style={{...bPrimary,flex:1,padding:12}}>Save Client</button>
            <button onClick={()=>setCModal(null)} style={{...bSecondary,padding:"12px 20px"}}>{t("cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ════════════ QUOTES ══════════════════════════════════════════════════════════
  const quotesTab=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>Quotes & Invoices</h2>
        <button onClick={()=>{setQDraft({clientName:"",eventDate:"",validTill:"",status:"Draft",items:[{desc:"",qty:1,rate:""}],notes:""});setQModal("new");}} style={bPrimary}>+ New Quote</button>
      </div>
      {quotes.length===0?<Card><p style={{color:muted,fontSize:13.5}}>No quotes yet.</p></Card>:
        quotes.map((q,i)=>{
          const total=q.items.reduce((s,it)=>s+Number(it.qty||1)*Number(it.rate||0),0);
          const stMap={Draft:["#F3F4F6","#6B7280"],Sent:["#FEF9C3","#CA8A04"],Accepted:["#DCFCE7","#16A34A"],Paid:["#EFF6FF","#2563EB"]};
          const [sbg,stc]=stMap[q.status]||stMap.Draft;
          return(
            <Card key={q.id||i} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div><div style={{fontSize:15,fontWeight:700,color:ink}}>#{String(q.id).slice(-4)} · {q.clientName}</div><div style={{fontSize:12,color:muted}}>{q.eventDate} · Valid till {q.validTill}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:800,color:ink}}>{fmt(total)}</div><span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:100,background:sbg,color:stc}}>{q.status}</span></div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
                <thead><tr style={{background:cream}}>{["Description","Qty","Rate","Amount"].map(h=><th key={h} style={{padding:"6px 10px",fontSize:11,fontWeight:700,color:muted,textAlign:h==="Description"?"left":"right",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>)}</tr></thead>
                <tbody>{q.items.map((it,j)=><tr key={j}><td style={{padding:"6px 10px",fontSize:13,color:ink}}>{it.desc}</td><td style={{padding:"6px 10px",fontSize:13,color:ink,textAlign:"right"}}>{it.qty}</td><td style={{padding:"6px 10px",fontSize:13,color:ink,textAlign:"right"}}>{fmt(it.rate)}</td><td style={{padding:"6px 10px",fontSize:13,fontWeight:700,color:ink,textAlign:"right"}}>{fmt(Number(it.qty||1)*Number(it.rate||0))}</td></tr>)}</tbody>
                <tfoot><tr style={{borderTop:"2px solid rgba(196,122,46,0.15)"}}><td colSpan={3} style={{padding:"8px 10px",fontSize:13,fontWeight:700,color:ink,textAlign:"right"}}>Total</td><td style={{padding:"8px 10px",fontSize:15,fontWeight:800,color:gold,textAlign:"right"}}>{fmt(total)}</td></tr></tfoot>
              </table>
              {q.notes&&<p style={{fontSize:12.5,color:muted,marginBottom:10}}>{q.notes}</p>}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>{setQDraft({...q});setQModal(q);}} style={bSecondary}>{t("edit")}</button>
                {q.status==="Draft"&&<button onClick={()=>saveQuotes(quotes.map(x=>x.id===q.id?{...x,status:"Sent"}:x))} style={bSecondary}>Mark Sent</button>}
                {q.status==="Sent"&&<button onClick={()=>saveQuotes(quotes.map(x=>x.id===q.id?{...x,status:"Accepted"}:x))} style={{...bSecondary,borderColor:"#86EFAC",color:"#16A34A"}}>Mark Accepted</button>}
                {q.status==="Accepted"&&<button onClick={()=>saveQuotes(quotes.map(x=>x.id===q.id?{...x,status:"Paid"}:x))} style={{...bSecondary,borderColor:"#93C5FD",color:"#2563EB"}}>Mark Paid</button>}
                <button onClick={()=>saveQuotes(quotes.filter(x=>x.id!==q.id))} style={bDanger}>{t("delete")}</button>
              </div>
            </Card>
          );
        })
      }
      {qModal&&<QuoteModal draft={qDraft} setDraft={setQDraft} isNew={qModal==="new"} onClose={()=>setQModal(null)} onSave={(e)=>{saveQuotes(qModal==="new"?[...quotes,e]:quotes.map(x=>x.id===qModal.id?e:x));setQModal(null);showToast("Quote saved!");}}/>}
    </div>
  );

  // ════════════ MONEY ═══════════════════════════════════════════════════════════
  const moneyTab=(
    <div>
      <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink,marginBottom:18}}>{t("money")}</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:18}}>
        {[{l:"Collected (Outside)",v:fmt(outsideRev)},{l:"Total Expenses",v:fmt(totalExp)},{l:"Net Profit",v:fmt(outsideRev-totalExp)},{l:"Quotes Value",v:fmt(quotes.filter(q=>q.status==="Paid").reduce((s,q)=>s+q.items.reduce((ss,it)=>ss+Number(it.qty||1)*Number(it.rate||0),0),0))}].map((s,i)=>(
          <Card key={i}><div style={{fontSize:22,fontWeight:800,color:ink}}>{s.v}</div><div style={{fontSize:11,color:muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3}}>{s.l}</div></Card>
        ))}
      </div>
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SL>Expenses Log</SL>
          <button onClick={()=>{setEDraft({desc:"",amount:"",date:todayStr,category:"Materials"});setEModal(true);}} style={{...bPrimary,padding:"7px 14px",fontSize:12}}>+ Add Expense</button>
        </div>
        {expenses.length===0?<p style={{color:muted,fontSize:13.5}}>No expenses logged.</p>:
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}>
              <thead><tr style={{background:cream}}>{["Date","Description","Category","Amount",""].map(h=><th key={h} style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:muted,textAlign:h==="Amount"?"right":"left",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>)}</tr></thead>
              <tbody>{expenses.map((e,i)=>(
                <tr key={e.id||i} style={{borderTop:"1px solid rgba(196,122,46,0.07)"}}>
                  <td style={{padding:"8px 10px",fontSize:13,color:muted}}>{e.date}</td>
                  <td style={{padding:"8px 10px",fontSize:13,color:ink}}>{e.desc}</td>
                  <td style={{padding:"8px 10px",fontSize:13,color:muted}}>{e.category}</td>
                  <td style={{padding:"8px 10px",fontSize:13,fontWeight:700,color:"#DC2626",textAlign:"right"}}>{fmt(e.amount)}</td>
                  <td style={{padding:"8px 10px",textAlign:"center"}}><button onClick={()=>saveExpenses(expenses.filter(x=>x.id!==e.id))} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:16}}>×</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
      </Card>
      <Card>
        <SL>Outside Orders</SL>
        {outside.length===0?<p style={{color:muted,fontSize:13.5}}>{t("noData")}</p>:
          outside.slice(0,8).map((o,i)=>(
            <div key={o._id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i?"1px solid rgba(196,122,46,0.08)":"none"}}>
              <div><div style={{fontSize:14,fontWeight:700,color:ink}}>{o.clientName}</div><div style={{fontSize:12,color:muted}}>{o.eventType} · {o.eventDate?.slice(0,10)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:700,color:"#16A34A"}}>{fmt(o.paidAmount||0)}</div><div style={{fontSize:11,color:muted}}>of {fmt(o.amount||0)}</div></div>
            </div>
          ))
        }
      </Card>
      {eModal&&(
        <Modal title="Log Expense" onClose={()=>setEModal(false)}>
          <Inp label="Description" value={eDraft.desc} onChange={v=>setEDraft(p=>({...p,desc:v}))}/>
          <Inp label="Amount (₹)" value={eDraft.amount} onChange={v=>setEDraft(p=>({...p,amount:v}))} type="number"/>
          <Inp label="Date" value={eDraft.date} onChange={v=>setEDraft(p=>({...p,date:v}))} type="date"/>
          <Sel label="Category" value={eDraft.category} onChange={v=>setEDraft(p=>({...p,category:v}))} options={["Materials","Travel","Food","Labour","Equipment","Marketing","Other"]}/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{if(!eDraft.desc||!eDraft.amount)return;saveExpenses([...expenses,{...eDraft,id:Date.now()}]);setEModal(false);showToast("Expense logged!");}} style={{...bPrimary,flex:1,padding:12}}>Save</button>
            <button onClick={()=>setEModal(false)} style={{...bSecondary,padding:"12px 20px"}}>{t("cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ════════════ TYPE-SPECIFIC ═══════════════════════════════════════════════════
  const editBtns=!specEdit
    ?<button onClick={()=>setSpecEdit(true)} style={bSecondary}>{t("edit")}</button>
    :<div style={{display:"flex",gap:8}}><button onClick={saveSpec} disabled={specSaving} style={bPrimary}>{specSaving?t("saving"):t("save")}</button><button onClick={()=>setSpecEdit(false)} style={bSecondary}>{t("cancel")}</button></div>;

  const typeSpecTab=(()=>{
    if(sType==="DJ")return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>{t("setup")}</h2>{editBtns}</div>
        <Card style={{marginBottom:14}}><SL>Setup Type</SL><Chips options={OPT.DJ.setup} selected={specDraft.setup} onChange={v=>setSpecDraft(p=>({...p,setup:v}))} disabled={!specEdit}/></Card>
        <Card style={{marginBottom:14}}><SL>Event Types</SL><Chips options={OPT.DJ.eventTypes} selected={specDraft.eventTypes} onChange={v=>setSpecDraft(p=>({...p,eventTypes:v}))} disabled={!specEdit}/></Card>
        <Card><SL>Lights Included</SL><button onClick={()=>specEdit&&setSpecDraft(p=>({...p,lightsIncluded:!p.lightsIncluded}))} style={{padding:"8px 20px",borderRadius:100,fontSize:13,fontWeight:600,cursor:specEdit?"pointer":"default",fontFamily:font,background:specDraft.lightsIncluded?"rgba(196,122,46,0.1)":cream,border:specDraft.lightsIncluded?`1.5px solid ${gold}`:"1px solid rgba(196,122,46,0.2)",color:specDraft.lightsIncluded?gold:muted}}>{specDraft.lightsIncluded?"Yes — Lights included":"No lights"}</button></Card>
      </div>
    );
    if(sType==="Caterer")return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>{t("menu")}</h2>{editBtns}</div>
        {[["Cuisine Types","cuisine",OPT.Caterer.cuisine],["Service Style","serviceStyle",OPT.Caterer.serviceStyle],["Menu Type","menuType",OPT.Caterer.menuType]].map(([l,k,opts])=>(
          <Card key={k} style={{marginBottom:14}}><SL>{l}</SL><Chips options={opts} selected={specDraft[k]||[]} onChange={v=>setSpecDraft(p=>({...p,[k]:v}))} disabled={!specEdit}/></Card>
        ))}
      </div>
    );
    if(sType==="Decorator")return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>{t("decor")}</h2>{editBtns}</div>
        {[["Types of Decoration","typesOfDecoration",OPT.Decorator.typesOfDecoration],["Venue Coverage","venueCoverage",OPT.Decorator.venueCoverage],["Themes","themes",OPT.Decorator.themes]].map(([l,k,opts])=>(
          <Card key={k} style={{marginBottom:14}}><SL>{l}</SL><Chips options={opts} selected={specDraft[k]||[]} onChange={v=>setSpecDraft(p=>({...p,[k]:v}))} disabled={!specEdit}/></Card>
        ))}
      </div>
    );
    if(sType==="Photographer")return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>{t("services")}</h2>{editBtns}</div>
        {[["Services Offered","services",OPT.Photographer.services],["Photography Style","photographyType",OPT.Photographer.photographyType]].map(([l,k,opts])=>(
          <Card key={k} style={{marginBottom:14}}><SL>{l}</SL><Chips options={opts} selected={specDraft[k]||[]} onChange={v=>setSpecDraft(p=>({...p,[k]:v}))} disabled={!specEdit}/></Card>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {[["Hours Included","hoursIncluded",OPT.Photographer.hoursIncluded,"hrs"],["Editing Time","editingTimeDays",OPT.Photographer.editingTimeDays,"days"]].map(([l,k,opts,sfx])=>(
            <Card key={k}><SL>{l}</SL><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{opts.map(h=><button key={h} onClick={()=>specEdit&&setSpecDraft(p=>({...p,[k]:h}))} style={{padding:"6px 14px",borderRadius:100,fontSize:12.5,fontWeight:600,cursor:specEdit?"pointer":"default",fontFamily:font,border:specDraft[k]===h?`1.5px solid ${gold}`:"1px solid rgba(196,122,46,0.2)",background:specDraft[k]===h?"rgba(196,122,46,0.1)":"#fff",color:specDraft[k]===h?gold:muted}}>{h} {sfx}</button>)}</div></Card>
          ))}
        </div>
        <Card><SL>Add-ons</SL><div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{[["socialMedia","Social Media Reels"],["album","Photo Album"]].map(([k,l])=><button key={k} onClick={()=>specEdit&&setSpecDraft(p=>({...p,[k]:!p[k]}))} style={{padding:"8px 18px",borderRadius:100,fontSize:13,fontWeight:600,cursor:specEdit?"pointer":"default",fontFamily:font,background:specDraft[k]?"rgba(196,122,46,0.1)":cream,border:specDraft[k]?`1.5px solid ${gold}`:"1px solid rgba(196,122,46,0.2)",color:specDraft[k]?gold:muted}}>{l}</button>)}</div></Card>
      </div>
    );
    return null;
  })();

  // ════════════ PACKAGES ════════════════════════════════════════════════════════
  const packagesTab=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>Packages</h2>
        <button onClick={()=>{setPkgDraft({name:"",price:"",unit:"per event",items:""});setPkgModal("new");}} style={bPrimary}>+ Add Package</button>
      </div>
      {packages.length===0&&<Card><p style={{color:muted,fontSize:13.5}}>No packages yet.</p></Card>}
      {packages.map((pkg,i)=>(
        <Card key={pkg.id||i} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:16,fontWeight:700,color:ink}}>{pkg.name}</div><div style={{fontSize:14,color:gold,fontWeight:700}}>{fmt(pkg.price)} <span style={{fontSize:12,color:muted,fontWeight:400}}>/ {pkg.unit}</span></div></div>
            {pkg.badge&&<span style={{background:gold,color:"#fff",borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700}}>{pkg.badge}</span>}
          </div>
          <ul style={{margin:"0 0 14px 18px",padding:0}}>{(pkg.items||"").split("\n").filter(Boolean).map((it,j)=><li key={j} style={{fontSize:13,color:"#4A3020",marginBottom:3}}>{it}</li>)}</ul>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setPkgDraft({...pkg});setPkgModal(pkg);}} style={bSecondary}>{t("edit")}</button>
            <button onClick={()=>savePkgs(packages.filter(x=>x.id!==pkg.id))} style={bDanger}>{t("delete")}</button>
          </div>
        </Card>
      ))}
      {pkgModal&&(
        <Modal title={pkgModal==="new"?"New Package":"Edit Package"} onClose={()=>setPkgModal(null)}>
          <Inp label="Package Name" value={pkgDraft.name} onChange={v=>setPkgDraft(p=>({...p,name:v}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Inp label="Price (₹)" value={pkgDraft.price} onChange={v=>setPkgDraft(p=>({...p,price:v}))} type="number"/>
            <Inp label="Unit" value={pkgDraft.unit} onChange={v=>setPkgDraft(p=>({...p,unit:v}))}/>
          </div>
          <Inp label="Badge (optional)" value={pkgDraft.badge} onChange={v=>setPkgDraft(p=>({...p,badge:v}))}/>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Inclusions (one per line)</label>
            <textarea value={pkgDraft.items||""} onChange={e=>setPkgDraft(p=>({...p,items:e.target.value}))} rows={4} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream,resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{const e={...pkgDraft,id:pkgModal==="new"?Date.now():pkgModal.id,price:Number(pkgDraft.price)};savePkgs(pkgModal==="new"?[...packages,e]:packages.map(x=>x.id===pkgModal.id?e:x));setPkgModal(null);showToast("Package saved!");}} style={{...bPrimary,flex:1,padding:12}}>Save Package</button>
            <button onClick={()=>setPkgModal(null)} style={{...bSecondary,padding:"12px 20px"}}>{t("cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ════════════ REVIEWS ═════════════════════════════════════════════════════════
  const reviewsTab=(
    <div>
      <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink,marginBottom:18}}>{t("reviews")}</h2>
      {reviews.length===0?<Card><p style={{color:muted,fontSize:13.5}}>{t("noData")}</p></Card>:
        reviews.map((r,i)=>(
          <Card key={r._id||i} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{fontSize:15,fontWeight:700,color:ink}}>{r.consumerName||r.name||"Customer"}</div><div style={{fontSize:12,color:muted}}>{r.eventType||r.event}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><Stars r={r.averageRating||r.rating||0}/><span style={{fontSize:13,color:ink,fontWeight:700}}>{(r.averageRating||r.rating||0).toFixed(1)}</span></div>
            </div>
            <p style={{fontSize:13.5,color:"#4A3020",lineHeight:1.65,margin:0}}>{r.reviewText||r.text}</p>
          </Card>
        ))
      }
    </div>
  );

  // ════════════ INSIGHTS ════════════════════════════════════════════════════════
  const insightsTab=(
    <div>
      <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink,marginBottom:18}}>{t("insights")}</h2>
      <Card style={{marginBottom:16}}><SL>Monthly Bookings</SL><BarChart data={bkgByMonth} color={gold}/></Card>
      <Card style={{marginBottom:16}}><SL>Monthly Revenue — Outside Orders</SL><LineChart data={revByMonth} color={goldLt}/></Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <SL>Booking Sources</SL>
          {[{l:"Tendr",v:bookings.length,c:gold},{l:"Outside",v:outside.length,c:goldLt}].map((s,i)=>{
            const pct=Math.round((s.v/Math.max(bookings.length+outside.length,1))*100);
            return(<div key={i} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:ink,marginBottom:4}}><span>{s.l}</span><span>{s.v}</span></div><div style={{height:8,borderRadius:4,background:"rgba(196,122,46,0.1)"}}><div style={{height:8,borderRadius:4,background:s.c,width:`${pct}%`,transition:"width 0.4s"}}/></div></div>);
          })}
        </Card>
        <Card>
          <SL>Client Pipeline</SL>
          {["Lead","Prospect","Confirmed","Completed"].map(s=>{
            const cnt=clients.filter(c=>c.status===s).length;
            const pct=Math.round((cnt/Math.max(clients.length,1))*100);
            return(<div key={s} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:ink,marginBottom:3}}><span>{s}</span><span>{cnt}</span></div><div style={{height:6,borderRadius:3,background:"rgba(196,122,46,0.1)"}}><div style={{height:6,borderRadius:3,background:s==="Confirmed"?gold:s==="Completed"?goldLt:muted,width:`${pct}%`,transition:"width 0.4s"}}/></div></div>);
          })}
        </Card>
      </div>
    </div>
  );

  // ════════════ FLYER & LINKS ═══════════════════════════════════════════════════
  const flyerTab=(
    <div>
      <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink,marginBottom:18}}>{t("flyer")}</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>
        <div>
          <Card style={{marginBottom:14}}>
            <SL>Flyer Preview</SL>
            <div ref={flyerRef} style={{background:flyerBg,borderRadius:16,padding:"32px 24px",textAlign:"center",position:"relative",overflow:"hidden",minHeight:280,fontFamily:serif}}>
              <div style={{position:"absolute",top:-30,right:-30,width:150,height:150,borderRadius:"50%",background:"rgba(204,171,74,0.07)",pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(204,171,74,0.05)",pointerEvents:"none"}}/>
              <div style={{fontFamily:font,fontSize:"0.75rem",color:goldLt,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>✦ Tendr Verified ✦</div>
              <div style={{fontSize:"2rem",fontWeight:400,color:"#fff",lineHeight:1.1,marginBottom:6}}>{vName}</div>
              <div style={{fontSize:12,color:goldLt,fontWeight:600,letterSpacing:"0.1em",marginBottom:16,fontFamily:font}}>{sType?.toUpperCase()}</div>
              <div style={{height:1,background:"rgba(204,171,74,0.25)",marginBottom:14}}/>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.78)",lineHeight:1.6,marginBottom:14,fontFamily:font}}>{flyerTag}</p>
              {user?.phoneNumber&&<div style={{fontSize:13,color:goldLt,fontWeight:700,fontFamily:font}}>📞 {user.phoneNumber}</div>}
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:14,fontFamily:font}}>tendr.in · Book on the Tendr app</div>
            </div>
            <div style={{marginTop:14}}>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Tagline</label>
                <input value={flyerTag} onChange={e=>setFlyerTag(e.target.value)} style={{width:"100%",padding:"9px 13px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream,boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:8}}>Background</label>
                <div style={{display:"flex",gap:10}}>{[ink,"#1a2744","#1a1a2e","#2D1B0E","#1B3A2E","#2D2D00"].map(c=><button key={c} onClick={()=>setFlyerBg(c)} style={{width:30,height:30,borderRadius:8,background:c,border:flyerBg===c?`3px solid ${gold}`:"2px solid rgba(196,122,46,0.2)",cursor:"pointer"}}/>)}</div>
              </div>
              <button onClick={printFlyer} style={{...bPrimary,width:"100%",padding:12}}>🖨️ Print / Save as PDF</button>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <SL>Link Hub</SL>
              <button onClick={()=>{setLDraft({label:"",url:"",icon:"🔗"});setLModal("new");}} style={{...bPrimary,padding:"6px 14px",fontSize:12}}>+ Add</button>
            </div>
            <div style={{background:cream,borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{textAlign:"center",marginBottom:14}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 8px",fontFamily:serif,color:"#fff"}}>{vName[0]}</div>
                <div style={{fontSize:15,fontWeight:700,color:ink,fontFamily:serif}}>{vName}</div>
                <div style={{fontSize:12,color:muted}}>{sType}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <a href={`/vendor/${vId}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"#fff",border:"1px solid rgba(196,122,46,0.15)",textDecoration:"none",color:ink,fontSize:13,fontWeight:600,fontFamily:font}}>🌐 Tendr Profile</a>
                {links.filter(l=>l.url).map(l=><a key={l.id} href={l.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"#fff",border:"1px solid rgba(196,122,46,0.15)",textDecoration:"none",color:ink,fontSize:13,fontWeight:600,fontFamily:font}}>{l.icon} {l.label}</a>)}
              </div>
            </div>
            {links.map((l,i)=>(
              <div key={l.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:18,width:28,flexShrink:0}}>{l.icon}</span>
                <div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12,fontWeight:700,color:ink}}>{l.label}</div><div style={{fontSize:11,color:muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.url||"—"}</div></div>
                <button onClick={()=>{setLDraft({...l});setLModal(l);}} style={{...bSecondary,padding:"5px 12px",fontSize:11}}>Edit</button>
                <button onClick={()=>saveLinks(links.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:16}}>×</button>
              </div>
            ))}
          </Card>
        </div>
      </div>
      {lModal&&(
        <Modal title={lModal==="new"?"New Link":"Edit Link"} onClose={()=>setLModal(null)}>
          <Inp label="Label" value={lDraft.label} onChange={v=>setLDraft(p=>({...p,label:v}))} placeholder="e.g. Instagram"/>
          <Inp label="URL" value={lDraft.url} onChange={v=>setLDraft(p=>({...p,url:v}))} placeholder="https://..."/>
          <Inp label="Emoji Icon" value={lDraft.icon} onChange={v=>setLDraft(p=>({...p,icon:v}))} placeholder="🔗"/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{const e={...lDraft,id:lModal==="new"?Date.now():lModal.id};saveLinks(lModal==="new"?[...links,e]:links.map(x=>x.id===lModal.id?e:x));setLModal(null);showToast("Link saved!");}} style={{...bPrimary,flex:1,padding:12}}>Save</button>
            <button onClick={()=>setLModal(null)} style={{...bSecondary,padding:"12px 20px"}}>{t("cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ════════════ PROFILE ═════════════════════════════════════════════════════════
  const profileTab=(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink}}>{t("profile")}</h2>
        {!profEdit?<button onClick={()=>setProfEdit(true)} style={bSecondary}>{t("edit")} Profile</button>:
          <div style={{display:"flex",gap:8}}><button onClick={saveProfile} disabled={profSaving} style={bPrimary}>{profSaving?t("saving"):t("save")}</button><button onClick={()=>setProfEdit(false)} style={bSecondary}>{t("cancel")}</button></div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontFamily:serif,color:"#fff"}}>{vName[0]}</div>
        <div><div style={{fontSize:18,fontFamily:serif,fontWeight:500,color:ink}}>{vName}</div><div style={{fontSize:13,color:muted}}>{sType}{user?.address?.city?` · ${user.address.city}`:""}</div><Stars r={rating}/></div>
      </div>
      <Card style={{marginBottom:14}}>
        <SL>Basic Info</SL>
        {[["name","Name"],["phoneNumber","Phone"],["yearsOfExperience","Years of Experience","number"],["teamSize","Team Size","number"],["gstNumber","GST Number"]].map(([k,l,tp])=>(
          <div key={k} style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:4}}>{l}</label>
            {profEdit
              ?<input type={tp||"text"} value={profDraft[k]||""} onChange={e=>setProfDraft(p=>({...p,[k]:e.target.value}))} style={{width:"100%",padding:"9px 13px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:14,fontFamily:font,color:ink,background:cream,boxSizing:"border-box"}}/>
              :<div style={{fontSize:14,color:ink,padding:"9px 0",fontFamily:k==="gstNumber"?"monospace":font}}>{user?.[k]||<span style={{color:muted,fontStyle:"italic"}}>Not set</span>}</div>}
          </div>
        ))}
      </Card>
      {(user?.portfolioPhotos||[]).length>0&&(
        <Card>
          <SL>Portfolio</SL>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {(user.portfolioPhotos||[]).slice(0,9).map((p,i)=>(
              <div key={i} style={{aspectRatio:"1",borderRadius:10,overflow:"hidden",background:cream}}>
                <img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  // ════════════ GROW ════════════════════════════════════════════════════════════
  const growTab=(
    <div>
      <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink,marginBottom:18}}>{t("grow")}</h2>
      <Card style={{marginBottom:16}}>
        <SL>Profile Sharing</SL>
        <p style={{fontSize:13.5,color:muted,marginBottom:14}}>Share your Tendr profile link to get direct bookings.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>navigate(`/vendor/${vId}`)} style={bPrimary}>View Profile</button>
          <button onClick={()=>{try{navigator.clipboard.writeText(`${window.location.origin}/vendor/${vId}`);}catch{}showToast("Link copied!");}} style={bSecondary}>Copy Link</button>
        </div>
      </Card>
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SL>Reminders</SL>
          <button onClick={()=>{setRDraft({text:"",date:todayStr,done:false});setRModal(true);}} style={{...bPrimary,padding:"7px 14px",fontSize:12}}>+ Add</button>
        </div>
        {reminders.length===0?<p style={{color:muted,fontSize:13.5}}>No reminders set.</p>:reminders.map((r,i)=>(
          <div key={r.id||i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderTop:i?"1px solid rgba(196,122,46,0.08)":"none"}}>
            <input type="checkbox" checked={r.done} onChange={()=>saveRem(reminders.map(x=>x.id===r.id?{...x,done:!x.done}:x))} style={{accentColor:gold,width:16,height:16,flexShrink:0}}/>
            <div style={{flex:1}}><span style={{fontSize:13.5,color:r.done?"#9CA3AF":ink,textDecoration:r.done?"line-through":"none"}}>{r.text}</span><span style={{fontSize:11.5,color:muted,marginLeft:8}}>{r.date}</span></div>
            <button onClick={()=>saveRem(reminders.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:18}}>×</button>
          </div>
        ))}
      </Card>
      <Card>
        <SL>Tips to Grow</SL>
        {["Add all your packages so clients know what to expect.","Keep your availability calendar up to date.","Reply to enquiries within 2 hours — boosts your rank.","Upload portfolio photos to stand out in search results.","Create and share a flyer on WhatsApp groups.","Ask satisfied clients to leave a review on your Tendr profile."].map((tip,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
            <span style={{width:22,height:22,borderRadius:"50%",background:cream,border:`1px solid rgba(196,122,46,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:700,color:gold,flexShrink:0}}>{i+1}</span>
            <span style={{fontSize:13.5,color:"#4A3020",lineHeight:1.55}}>{tip}</span>
          </div>
        ))}
      </Card>
      {rModal&&(
        <Modal title="New Reminder" onClose={()=>setRModal(false)}>
          <Inp label="Reminder" value={rDraft.text} onChange={v=>setRDraft(p=>({...p,text:v}))} placeholder="e.g. Follow up with Priya re: Dec booking"/>
          <Inp label="Date" value={rDraft.date} onChange={v=>setRDraft(p=>({...p,date:v}))} type="date"/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{if(!rDraft.text.trim())return;saveRem([...reminders,{...rDraft,id:Date.now()}]);setRModal(false);showToast("Reminder set!");}} style={{...bPrimary,flex:1,padding:12}}>Set Reminder</button>
            <button onClick={()=>setRModal(false)} style={{...bSecondary,padding:"12px 20px"}}>{t("cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ════════════ TAB ROUTER ══════════════════════════════════════════════════════
  const TABS={home:homeTab,calendar:calTab,clients:crmTab,quotes:quotesTab,money:moneyTab,reviews:reviewsTab,insights:insightsTab,flyer:flyerTab,profile:profileTab,packages:packagesTab,grow:growTab,...(typeTabKey?{[typeTabKey]:typeSpecTab}:{})};

  // ════════════ RENDER ══════════════════════════════════════════════════════════
  return(
    <div style={{display:"flex",minHeight:"100dvh",fontFamily:font,background:cream}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500&display=swap');*{box-sizing:border-box;}input,textarea,select{outline:none;}`}</style>
      {sidebar}
      <div style={{flex:1,padding:"32px 36px",overflowY:"auto",maxWidth:920}}>
        {tab==="work"?<WorkTab bookings={bookings} outside={outside} loading={loading} lang={lang}/>:TABS[tab]||homeTab}
      </div>
      {toast&&<div style={{position:"fixed",bottom:28,right:28,background:toast.ok?ink:"#BE123C",color:"#fff",borderRadius:12,padding:"12px 20px",fontSize:13.5,fontWeight:600,fontFamily:font,boxShadow:"0 8px 30px rgba(0,0,0,0.2)",zIndex:999}}>{toast.msg}</div>}
    </div>
  );
}

// ── Work Tab ──────────────────────────────────────────────────────────────────
function WorkTab({bookings,outside,loading,lang}){
  const [view,setView]=useState("tendr");
  const t=(k)=>TR[lang]?.[k]||TR.EN[k]||k;
  const grps=[{l:"Pending",arr:bookings.filter(b=>b.status==="PENDING"),bg:"#FEF9C3",tc:"#CA8A04"},{l:"Confirmed",arr:bookings.filter(b=>b.status==="CONFIRMED"),bg:"#DCFCE7",tc:"#16A34A"},{l:"Past",arr:bookings.filter(b=>["CANCELLED","COMPLETED"].includes(b.status)),bg:"#F3F4F6",tc:"#6B7280"}];
  return(
    <div>
      <h2 style={{fontFamily:serif,fontSize:"1.7rem",fontWeight:400,color:ink,marginBottom:18}}>{t("work")}</h2>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"#fff",borderRadius:100,padding:4,width:"fit-content",border:"1px solid rgba(196,122,46,0.15)"}}>
        {[["tendr","Tendr Bookings"],["outside","Outside Orders"]].map(([k,l])=>(
          <button key={k} onClick={()=>setView(k)} style={{padding:"8px 20px",borderRadius:100,fontSize:13,fontWeight:view===k?700:500,background:view===k?`linear-gradient(135deg,${gold},${goldLt})`:"transparent",color:view===k?"#fff":muted,border:"none",cursor:"pointer",fontFamily:font}}>{l}</button>
        ))}
      </div>
      {view==="tendr"&&(
        loading?<div style={{color:muted,fontSize:13.5}}>Loading…</div>:
        bookings.length===0?<div style={{background:"#fff",borderRadius:16,padding:24,border:"1px solid rgba(196,122,46,0.1)",color:muted,fontSize:13.5}}>No Tendr bookings yet.</div>:
        grps.map(({l,arr,bg,tc})=>arr.length>0&&(
          <div key={l} style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>{l} ({arr.length})</div>
            {arr.map((b,i)=>(
              <div key={b._id||i} style={{background:"#fff",borderRadius:16,padding:20,marginBottom:10,border:"1px solid rgba(196,122,46,0.1)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontSize:15,fontWeight:700,color:ink}}>{b.consumerName||b.consumer?.name||"Client"}</div><div style={{fontSize:12.5,color:muted}}>{b.eventType} · {b.eventDate?.slice(0,10)}</div></div>
                  <span style={{background:bg,color:tc,borderRadius:100,padding:"2px 10px",fontSize:11,fontWeight:700}}>{b.status}</span>
                </div>
                {b.amount&&<div style={{fontSize:13.5,fontWeight:700,color:gold}}>₹{Number(b.amount).toLocaleString("en-IN")}</div>}
                {b.message&&<p style={{fontSize:13,color:"#4A3020",marginTop:8,lineHeight:1.5,margin:"8px 0 0"}}>{b.message}</p>}
              </div>
            ))}
          </div>
        ))
      )}
      {view==="outside"&&(
        outside.length===0?<div style={{background:"#fff",borderRadius:16,padding:24,border:"1px solid rgba(196,122,46,0.1)",color:muted,fontSize:13.5}}>No outside orders yet.</div>:
        outside.map((o,i)=>(
          <div key={o._id||i} style={{background:"#fff",borderRadius:16,padding:20,marginBottom:10,border:"1px solid rgba(196,122,46,0.1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{fontSize:15,fontWeight:700,color:ink}}>{o.clientName}</div><div style={{fontSize:12.5,color:muted}}>{o.eventType} · {o.eventDate?.slice(0,10)}</div></div>
              <span style={{background:o.status==="Completed"?"#EFF6FF":"#FEF9C3",color:o.status==="Completed"?"#2563EB":"#CA8A04",borderRadius:100,padding:"2px 10px",fontSize:11,fontWeight:700}}>{o.status}</span>
            </div>
            <div style={{display:"flex",gap:20}}>
              <div><span style={{fontSize:11,color:muted}}>Billed </span><span style={{fontSize:14,fontWeight:700,color:ink}}>₹{Number(o.amount||0).toLocaleString("en-IN")}</span></div>
              <div><span style={{fontSize:11,color:muted}}>Paid </span><span style={{fontSize:14,fontWeight:700,color:"#16A34A"}}>₹{Number(o.paidAmount||0).toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Quote editor modal ────────────────────────────────────────────────────────
function QuoteModal({draft,setDraft,onSave,onClose,isNew}){
  const addItem=()=>setDraft(p=>({...p,items:[...p.items,{desc:"",qty:1,rate:""}]}));
  const updItem=(i,k,v)=>setDraft(p=>({...p,items:p.items.map((it,j)=>j===i?{...it,[k]:v}:it)}));
  const remItem=(i)=>setDraft(p=>({...p,items:p.items.filter((_,j)=>j!==i)}));
  const total=draft.items.reduce((s,it)=>s+Number(it.qty||1)*Number(it.rate||0),0);
  return(
    <Modal title={isNew?"New Quote":"Edit Quote"} onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Client Name" value={draft.clientName} onChange={v=>setDraft(p=>({...p,clientName:v}))}/>
        <Inp label="Event Date" value={draft.eventDate} onChange={v=>setDraft(p=>({...p,eventDate:v}))} type="date"/>
        <Inp label="Valid Till" value={draft.validTill} onChange={v=>setDraft(p=>({...p,validTill:v}))} type="date"/>
        <Sel label="Status" value={draft.status} onChange={v=>setDraft(p=>({...p,status:v}))} options={["Draft","Sent","Accepted","Paid"]}/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Line Items</label>
          <button onClick={addItem} style={{fontSize:12,color:gold,fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:font}}>+ Add Item</button>
        </div>
        {draft.items.map((it,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 56px 90px 24px",gap:8,marginBottom:8,alignItems:"center"}}>
            <input value={it.desc} onChange={e=>updItem(i,"desc",e.target.value)} placeholder="Description" style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream}}/>
            <input type="number" value={it.qty} onChange={e=>updItem(i,"qty",e.target.value)} style={{padding:"8px 8px",borderRadius:8,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream,textAlign:"center"}}/>
            <input type="number" value={it.rate} onChange={e=>updItem(i,"rate",e.target.value)} placeholder="₹" style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream}}/>
            <button onClick={()=>remItem(i)} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:20,lineHeight:1}}>×</button>
          </div>
        ))}
        <div style={{textAlign:"right",fontSize:16,fontWeight:800,color:ink,padding:"8px 0",borderTop:"2px solid rgba(196,122,46,0.15)"}}>Total: ₹{Number(total).toLocaleString("en-IN")}</div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Notes</label>
        <textarea value={draft.notes||""} onChange={e=>setDraft(p=>({...p,notes:e.target.value}))} rows={2} style={{width:"100%",padding:"9px 13px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream,resize:"vertical",boxSizing:"border-box"}}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>onSave({...draft,id:isNew?Date.now():draft.id})} style={{padding:"12px 0",borderRadius:100,background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font,flex:1}}>Save Quote</button>
        <button onClick={onClose} style={{padding:"12px 20px",borderRadius:100,background:cream,border:"1px solid rgba(196,122,46,0.2)",color:muted,fontSize:13,cursor:"pointer",fontFamily:font}}>Cancel</button>
      </div>
    </Modal>
  );
}
