import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const gold="#C47A2E",goldLt="#CCAB4A",ink="#1C0A04",cream="#FAF7F2",muted="#9B7450";
const font="'Outfit',sans-serif",serif="'Cormorant Garamond',Georgia,serif";

// ── Public sync key (customer VendorDemo reads this) ─────────────────────────
export const pubKey = (type) => `tendr_pub_demo_${type}`;
// ── Coordinator transfer key ──────────────────────────────────────────────────
export const COORD_KEY = "tendr_coord_transfers";

// ── Mock profiles per type ────────────────────────────────────────────────────
const PROFILES = {
  Caterer:{name:"Royal Feast Caterers",type:"Caterer",city:"Mumbai",phone:"+91 98001 22333",email:"orders@royalfeast.in",bio:"Mumbai's most trusted full-service catering company with 14 years of experience. 600+ events catered — from intimate 30-pax family lunches to 2,000-guest wedding buffets. Specialists in North Indian, Punjabi, South Indian, and live counter setups.",rating:4.8,reviewCount:112,events:620,responseTime:"< 2 hrs",teamSize:28,years:14,instagram:"@royalfeastcaterers",youtube:"",website:"royalfeast.in",specialties:["Wedding Buffet","Live Counters","Corporate Luncheons","Cocktail Snacks","Multi-Cuisine"],menuType:["Veg","Non-Veg","Jain"],serviceStyle:["Buffet","Live Stations","Plated Service","Food Trucks"]},
  Decorator:{name:"Blooms & Beyond Decor Studio",type:"Decorator",city:"Delhi",phone:"+91 98001 11222",email:"hello@bloomsandbeyond.in",bio:"Full-service decoration studio from South Delhi with 8 years transforming 380+ venues. Specialists in luxury floral arrangements, LED backdrops, fabric draping, and balloon art. Every setup is custom-designed — no two events look alike.",rating:4.9,reviewCount:142,events:380,responseTime:"< 2 hrs",teamSize:14,years:8,instagram:"@bloomsandbeyond",youtube:"",website:"bloomsandbeyond.in",specialties:["Floral Arch & Mandap","Balloon Canopy","LED Backdrop","Fabric Draping","Table Centrepieces","Fairy Light Ceiling"],typesOfDecoration:["Floral","Balloon","Lighting","Fabric Draping","Backdrop","Prop-Based","Minimalist"],themes:["Floral Focused","Balloon Dominant","Lighting Emphasis","Fabric Draping","Mixed Media","Minimalist Touch"]},
  Photographer:{name:"Frames by Kabir",type:"Photographer",city:"Noida",phone:"+91 98001 44555",email:"kabir@framesbyKabir.in",bio:"Candid wedding and portrait photographer based in Noida. 6 years, 220+ events. We specialise in natural-light storytelling — capturing real laughs, tears, and stolen glances. Shooting on Sony mirrorless + drone. Delivery: 400 edited photos in 21 days.",rating:4.8,reviewCount:97,events:220,responseTime:"< 4 hrs",teamSize:4,years:6,instagram:"@framesbyKabir",youtube:"Frames by Kabir",website:"",specialties:["Candid Wedding","Pre-Wedding Shoot","Drone Coverage","Corporate Headshots","Same-Day Edit Reel"],photographyType:["Candid","Drone","Traditional","Cinematic"],hoursIncluded:["4","8","Full Day"],editingDays:["7","14","21"]},
  DJ:{name:"DJ Arjun Mehta — Event Services",type:"DJ",city:"Mumbai",phone:"+91 98000 11234",email:"arjun@arjunmehta.dj",bio:"Mumbai-based professional DJ and sound setup provider. 8 years, 312+ events. Full setup packages include Pioneer CDJ-3000 decks, professional PA systems, and lighting. Available for weddings, corporates, and club nights.",rating:4.9,reviewCount:67,events:312,responseTime:"< 1 hr",teamSize:2,years:8,instagram:"@arjunmehta.dj",youtube:"",website:"",specialties:["Full DJ Setup","Bollywood Mixes","Corporate Events","Club Nights","Wedding Reception"],setup:["Basic Setup","Full Production"],eventTypes:["House Party","Corporate","Wedding","Club Night"]},
};

// ── Packages per type ─────────────────────────────────────────────────────────
const INIT_PACKAGES = {
  Caterer:[
    {id:1,name:"Veg Buffet",price:"₹850",unit:"per plate",icon:"🥗",minPlates:50,badge:"",items:"North Indian + South Indian spread\nLive chaat counter\nDessert station\nService staff (1 per 25 plates)\nSetup & breakdown"},
    {id:2,name:"Non-Veg Buffet",price:"₹1,200",unit:"per plate",icon:"🍗",minPlates:50,badge:"Most Popular",items:"Full veg + non-veg spread\nLive kebab grill counter\nSignature curry selection\nDessert + ice cream station\nService staff & crockery"},
    {id:3,name:"Premium Live Counters",price:"₹1,800",unit:"per plate",icon:"✨",minPlates:100,badge:"",items:"8-cuisine live counter setup\nDedicated station chefs\nCustom branded menus\nPremium crockery & linen\nBar setup assistance\nPre-event menu tasting"},
  ],
  Decorator:[
    {id:1,name:"Essential Package",price:18000,unit:"per event",icon:"🌸",badge:"",items:"Entrance floral gate\nStage backdrop (8×6 ft)\n2 centrepiece tables\nBalloon clusters\nBasic fairy lights\nSetup & breakdown"},
    {id:2,name:"Premium Package",price:42000,unit:"per event",icon:"✨",badge:"Most Popular",items:"Grand floral arch (12 ft)\nFull draping & valance\nLED star backdrop\n6 centrepiece tables\nFairy light canopy ceiling\nPhoto-booth corner\nCustomised name board\nFull-day standby crew"},
    {id:3,name:"Luxury Package",price:95000,unit:"starting at",icon:"💎",badge:"",items:"Bespoke theme concept\nFull-venue floral installation\nCrystal & chandelier draping\nBranded signage & monogram\n12+ centrepiece tables\nDedicated art director\nPre-event site visit"},
  ],
  Photographer:[
    {id:1,name:"Half Day",price:22000,unit:"4 hours",icon:"📷",badge:"",items:"1 photographer\nUp to 4 hrs coverage\n150 edited photos\nOnline gallery (30 days)\nDelivery in 15 days"},
    {id:2,name:"Full Day",price:48000,unit:"full day",icon:"🎞",badge:"Most Popular",items:"2 photographers + assistant\nFull day (10 hrs)\n400 edited photos\n1 highlight reel (3 min)\nDrone session (30 min)\nPrivate gallery link\nDelivery in 21 days"},
    {id:3,name:"Wedding Package",price:110000,unit:"2-day coverage",icon:"💍",badge:"",items:"2-day full coverage\n3 photographers + drone pilot\n2000+ edited photos\n10-min cinematic film\nPre-wedding session\nPriority delivery in 14 days"},
  ],
  DJ:[
    {id:1,name:"2-Hour Mix",price:15000,unit:"2 hours",icon:"🎵",badge:"",items:"2 hrs live DJing\nBasic PA + subwoofer\nBollywood + commercial set"},
    {id:2,name:"4-Hour Party",price:28000,unit:"4 hours",icon:"🎶",badge:"Most Popular",items:"4 hrs live DJing\nProfessional PA system\nCustom playlist consultation\nWireless mic\nSmoke machine"},
    {id:3,name:"Full Night Production",price:55000,unit:"6-8 hours",icon:"🔊",badge:"",items:"6–8 hrs DJing\nLine-array PA\nFull LED lighting rig\nLaser show\nCustom event mix prep"},
  ],
};

// ── Bookings per type ─────────────────────────────────────────────────────────
const INIT_BOOKINGS = {
  Caterer:[
    {id:"B001",client:"Mehta–Kapoor Wedding",event:"Wedding Reception Dinner",date:"2026-10-28",venue:"Grand Hyatt, Mumbai",plates:350,amount:420000,status:"Confirmed",note:"Full non-veg buffet + 3 live counters. Final guest count by 21 Oct."},
    {id:"B002",client:"Infosys Mumbai",event:"Annual Day Lunch",date:"2026-11-05",venue:"Infosys Campus, Pune",plates:600,amount:510000,status:"Pending",note:"Veg-only buffet for 600 employees. Jain food required for 40 guests."},
    {id:"B003",client:"Priya & Arjun Sangeet",event:"Sangeet Cocktail Dinner",date:"2026-10-18",venue:"Juhu Residence, Mumbai",plates:120,amount:144000,status:"Confirmed",note:"Premium live counters. Rooftop garden setup."},
    {id:"B004",client:"HDFC Bank",event:"Q3 Town Hall Lunch",date:"2026-10-22",venue:"HDFC HO, BKC",plates:250,amount:212500,status:"Pending",note:"Corporate lunch, veg only, plated service preferred."},
    {id:"B005",client:"Patel 25th Anniversary",event:"Anniversary Dinner",date:"2026-11-12",venue:"Home Residence, Bandra",plates:80,amount:96000,status:"Declined",note:"Intimate family dinner, 80 guests, multi-cuisine."},
  ],
  Decorator:[
    {id:"B001",client:"Sharma–Kapoor Wedding",event:"Wedding Decoration (Full)",date:"2026-10-28",venue:"Grand Hyatt, Mumbai",amount:185000,status:"Confirmed",note:"Floral + LED backdrop + full mandap. Theme: Royal Ivory. 3-day setup."},
    {id:"B002",client:"Mehra Engagement",event:"Engagement Stage & Décor",date:"2026-11-05",venue:"Taj Lands End, Mumbai",amount:62000,status:"Pending",note:"Gold & white theme. Stage + 8 table centrepieces + entrance arch."},
    {id:"B003",client:"Amazon India",event:"Diwali Office Decoration",date:"2026-10-20",venue:"Amazon Office, BKC",amount:38000,status:"Confirmed",note:"Festive Diwali theme. Diyas, fairy lights, marigold arrangements."},
    {id:"B004",client:"Kavya Sharma Birthday",event:"30th Birthday Setup",date:"2026-10-15",venue:"Rooftop, Bandra West",amount:28000,status:"Pending",note:"Boho theme. Macrame backdrop, florals, balloon arch."},
    {id:"B005",client:"TCS Mumbai",event:"Annual Conference Stage Décor",date:"2026-11-14",venue:"Taj Convention Centre",amount:55000,status:"Declined",note:"Corporate stage decor. Branded backdrop, podium flowers."},
  ],
  Photographer:[
    {id:"B001",client:"Verma–Singh Wedding",event:"Full Wedding Coverage",date:"2026-10-28",venue:"ITC Maratha, Mumbai",amount:145000,status:"Confirmed",note:"2-day coverage: mehendi + wedding + reception. 3 photographers + drone."},
    {id:"B002",client:"Priya & Rahul",event:"Pre-Wedding Shoot",date:"2026-10-12",venue:"Lonavala + Studio",amount:32000,status:"Confirmed",note:"Outdoor + studio session. 1 day. Cinematic + candid style."},
    {id:"B003",client:"Microsoft India",event:"Executive Team Headshots",date:"2026-11-03",venue:"Microsoft Office, BKC",amount:28000,status:"Pending",note:"LinkedIn & corporate headshots for 12 executives. Studio lighting setup."},
    {id:"B004",client:"Sneha Gupta",event:"Maternity Shoot",date:"2026-10-20",venue:"Bandstand, Bandra",amount:18000,status:"Pending",note:"Outdoor maternity session. Golden hour. Props provided."},
    {id:"B005",client:"Patel Family",event:"50th Anniversary",date:"2026-11-10",venue:"Home, Juhu",amount:22000,status:"Declined",note:"Half-day anniversary family photography. 30 family members."},
  ],
  DJ:[
    {id:"B001",client:"Sharma Wedding",event:"Wedding Reception",date:"2026-09-20",venue:"Leela Palace, Delhi",amount:28000,status:"Confirmed",note:"4-hr set. Mix of Bollywood and EDM. 300 guests."},
    {id:"B002",client:"StartupFest",event:"Corporate After-Party",date:"2026-09-27",venue:"The Clubhouse, BKC",amount:55000,status:"Confirmed",note:"Full night production. 150 attendees."},
    {id:"B003",client:"Riya Kapoor",event:"25th Birthday Pool Party",date:"2026-10-05",venue:"Juhu Beach Club",amount:22000,status:"Pending",note:"4-hr set. EDM and hip-hop. 60 friends."},
    {id:"B004",client:"Taj Hotels",event:"New Year's Eve Gala",date:"2026-12-31",venue:"Taj Mahal Palace",amount:90000,status:"Pending",note:"Premium NYE gala. 400 guests. Full production."},
    {id:"B005",client:"IndiGo Airlines",event:"Employee Awards Night",date:"2026-10-18",venue:"Hyatt Regency",amount:35000,status:"Declined",note:"Corporate DJ, clean mix."},
  ],
};

// ── Reviews per type ──────────────────────────────────────────────────────────
const INIT_REVIEWS = {
  Caterer:[
    {id:1,name:"Priya & Rohit Sharma Wedding",event:"Wedding Dinner, Sep 2025",rating:5,text:"The food was absolutely incredible — every single guest complimented the biryani live counter. The service team was professional and everything was on time. Royal Feast made our wedding night perfect.",response:"Thank you Priya & Rohit! Your 350-guest wedding was one of our proudest events. Wishing you both endless happiness!"},
    {id:2,name:"Infosys Annual Day",event:"Corporate Lunch, Aug 2025",rating:5,text:"Handled 700 employees without a single hiccup. The variety was great — Jain options were well-labeled and plentiful. Our CEO personally praised the food at the event.",response:"Thank you Infosys team! Corporate events at scale are our speciality. Looking forward to your next event!"},
    {id:3,name:"Kapoor Engagement Party",event:"Cocktail Dinner, Jul 2025",rating:5,text:"The live kebab station was a massive hit. Guests kept going back for seconds. The presentation was beautiful — not just tasty but visually stunning too.",response:null},
    {id:4,name:"HCL Technologies",event:"Q2 Town Hall, Jun 2025",rating:4,text:"Good food, good presentation. One live counter ran out of stock mid-event but the team restocked quickly. Would book again for our next town hall.",response:"Thank you for the honest feedback! We've since increased our live counter buffer stocks. Looking forward to your Q3 event!"},
  ],
  Decorator:[
    {id:1,name:"Priya & Rohan Kapoor",event:"Wedding, Feb 2025",rating:5,text:"The mandap was beyond beautiful — exactly the aesthetic I'd pinned for years. The floral arch was magazine-worthy. Every guest kept complimenting the décor. 100% recommend!",response:"Priya & Rohan, your wedding was a dream to decorate! The gold and ivory theme came alive exactly as we'd planned. Wishing you both a beautiful life!"},
    {id:2,name:"Sneha Agarwal",event:"30th Birthday, Dec 2024",rating:5,text:"I gave them one photo reference and they turned the entire venue into a dream. The balloon canopy and fairy lights were perfect. On time, professional, and so creative.",response:"Sneha, the boho balloon canopy was one of our favourite setups of 2024! Thank you for trusting our vision."},
    {id:3,name:"TechStar India",event:"Product Launch, Jan 2025",rating:4,text:"Handled a 250-pax corporate event beautifully. Clean, branded setup. Minor delivery delay but the crew resolved it quickly. Would book again.",response:null},
    {id:4,name:"Anjali Mehta",event:"Baby Shower, Nov 2024",rating:5,text:"The pastel floral setup was so delicate and perfect. Loved that they brought their own props. Saved us so much stress on the day itself.",response:"Anjali, baby showers are our absolute favourite! The blush and sage theme was gorgeous. Congratulations again!"},
  ],
  Photographer:[
    {id:1,name:"Anjali & Dev Wedding",event:"Full Wedding, Mar 2025",rating:5,text:"Kabir and team captured every single emotion perfectly. The candid shots of my parents seeing me in my lehenga made everyone cry. The cinematic film is a masterpiece we'll cherish forever.",response:"Anjali & Dev, your wedding was a photographer's dream — the light at the venue was magical and you both were so natural. Thank you for having us!"},
    {id:2,name:"Microsoft India",event:"Executive Headshots, Jan 2025",rating:5,text:"Incredibly professional. Our 12 executives were in and out in under 3 hours and every single shot was boardroom-ready. Fast delivery too — gallery was up in 5 days.",response:"Thank you Microsoft team! Corporate portraits are all about confidence and lighting — your executives nailed both. Looking forward to your next one!"},
    {id:3,name:"Priya & Karan Pre-Wedding",event:"Pre-Wedding, Feb 2025",rating:5,text:"The Lonavala shoot was unreal. Kabir found angles and light we didn't even know existed. Our families cried looking at the photos. Best investment of our wedding budget.",response:null},
    {id:4,name:"Meghna Patel",event:"Maternity Shoot, Dec 2024",rating:5,text:"So comfortable and calm throughout. Made me feel beautiful at every angle. The golden hour shots at Bandstand are my most treasured photos ever.",response:"Meghna, maternity shoots are so special — capturing this season of life is an honour. Congratulations on your little one!"},
  ],
  DJ:[
    {id:1,name:"Sharma Family Wedding",event:"Wedding Reception, Sep 2025",rating:5,text:"Arjun read the crowd perfectly — started with Bollywood classics for the family, transitioned to EDM for the younger crowd seamlessly. The dance floor was packed all night.",response:"Thank you! The Sharma wedding had such a great energy — 300 guests all on the floor at once is what we live for!"},
    {id:2,name:"StartupFest 2025",event:"After-Party, Aug 2025",rating:5,text:"Exactly the vibe a startup after-party needs. High energy, great production quality, professional setup. Our attendees are asking if we'll book Arjun for next year's fest.",response:"StartupFest crowd was electric! Tech + music = perfect combo. See you next year!"},
    {id:3,name:"Riya Kapoor",event:"Birthday Party, Jul 2025",rating:5,text:"The pool party set was immaculate. Perfect for a 25th birthday — fun, energetic, and he even took song requests which everyone loved.",response:null},
    {id:4,name:"IndiGo Airlines",event:"Awards Night, Jun 2025",rating:4,text:"Great music, good setup. The transition between the formal awards segment and the dance floor was smooth. Would recommend for corporate events.",response:"Thank you IndiGo! Corporate events require a delicate balance — glad we got it right."},
  ],
};

// ── Monthly P&L ───────────────────────────────────────────────────────────────
const MONTHLY = [
  {month:"Apr",revenue:185000,expenses:42000},
  {month:"May",revenue:220000,expenses:55000},
  {month:"Jun",revenue:310000,expenses:78000},
  {month:"Jul",revenue:280000,expenses:65000},
  {month:"Aug",revenue:395000,expenses:92000},
  {month:"Sep",revenue:145000,expenses:31000},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const LS=(k,fb)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}};
const LSSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};

function usePersisted(key,init){
  const [val,setVal]=useState(()=>LS(key,init));
  const set=useCallback((v)=>{const n=typeof v==="function"?v(val):v;setVal(n);LSSet(key,n);},[key]);
  return [val,set];
}

const gold0="rgba(196,122,46,0.1)";
const Ico=({d,sz=16,c="currentColor"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const Stars=({r=0,sz=12})=><span style={{display:"inline-flex",gap:1}}>{[1,2,3,4,5].map(i=><svg key={i} width={sz} height={sz} viewBox="0 0 24 24" fill={i<=Math.round(r)?goldLt:"none"} stroke={goldLt} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</span>;
const Pill=({s})=>{const m={Confirmed:["#DCFCE7","#16A34A"],Pending:["#FEF9C3","#CA8A04"],Declined:["#FEE2E2","#DC2626"],Transferred:["#EDE9FE","#7C3AED"]};const[bg,tc]=m[s]||["#F3F4F6","#6B7280"];return <span style={{background:bg,color:tc,borderRadius:100,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s}</span>;};
const Card=({children,style})=><div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid rgba(196,122,46,0.1)",boxShadow:"0 2px 10px rgba(28,10,4,0.04)",...style}}>{children}</div>;
const SL=({children})=><div style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>{children}</div>;
const Inp=({label,value,onChange,type="text",placeholder=""})=><div style={{marginBottom:12}}>{label&&<label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>{label}</label>}<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:14,fontFamily:font,color:ink,background:cream,boxSizing:"border-box"}}/></div>;
const Btn=({onClick,children,style})=><button onClick={onClick} style={{padding:"10px 22px",borderRadius:100,background:`linear-gradient(135deg,${gold},${goldLt})`,color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font,...style}}>{children}</button>;
const fmt=(n)=>typeof n==="string"?n:"₹"+Number(n||0).toLocaleString("en-IN");

// ── Type-specific tab config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  Caterer:{tabLabel:"Menu",tabIcon:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"},
  Decorator:{tabLabel:"Decor",tabIcon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"},
  Photographer:{tabLabel:"Services",tabIcon:"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
  DJ:{tabLabel:"Setup",tabIcon:"M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"},
};

// ════════════════════════════════════════════════════════════════════════════════
export default function ServiceDemoDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser } = useSelector(s => s.auth);
  // URL param ?type=Decorator overrides auth — allows no-login demo browsing
  const sType = searchParams.get("type") || authUser?.serviceType || "Caterer";
  const cfg = TYPE_CONFIG[sType] || TYPE_CONFIG.Caterer;

  const [tab, setTab] = useState("home");
  const [profile, setProfile] = usePersisted(`sdemo_${sType}_profile`, PROFILES[sType] || PROFILES.Caterer);
  const [bookings, setBookings] = usePersisted(`sdemo_${sType}_bookings`, INIT_BOOKINGS[sType] || []);
  const [packages, setPackages] = usePersisted(`sdemo_${sType}_packages`, INIT_PACKAGES[sType] || []);
  const [reviews, setReviews] = usePersisted(`sdemo_${sType}_reviews`, INIT_REVIEWS[sType] || []);

  const [profEdit, setProfEdit] = useState(false);
  const [profDraft, setProfDraft] = useState({});
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [pkgModal, setPkgModal] = useState(null);
  const [pkgDraft, setPkgDraft] = useState({});
  const [moneyView, setMoneyView] = useState("chart");
  const [transferConfirm, setTransferConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [calMonth] = useState({y:2026,m:9});

  // ── Sync profile to public key (customer VendorDemo reads this) ───────────
  useEffect(()=>{LSSet(pubKey(sType), profile);},[profile,sType]);

  function showToast(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),3000);}

  // ── Transfer booking to coordinator ──────────────────────────────────────
  function transferToCoordinator(booking){
    const existing = LS(COORD_KEY,[]);
    if(existing.find(b=>b.id===booking.id&&b.vendorType===sType)){
      showToast("Already transferred to coordinator","warn");
      return;
    }
    const transfer = {...booking,vendorType:sType,vendorName:profile.name,transferredAt:new Date().toISOString(),coordStatus:"Pending"};
    LSSet(COORD_KEY,[...existing,transfer]);
    setBookings(prev=>prev.map(b=>b.id===booking.id?{...b,status:"Transferred"}:b));
    setTransferConfirm(null);
    showToast("Booking transferred to coordinator!");
  }

  // ── Pending count ─────────────────────────────────────────────────────────
  const pendingCount = bookings.filter(b=>b.status==="Pending").length;
  const unrespondedReviews = reviews.filter(r=>!r.response).length;

  const NAV=[
    {key:"home",group:"OVERVIEW",label:"Home",icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},
    {key:"work",group:"WORK",label:"Work",icon:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"},
    {key:"money",group:"MONEY",label:"Money",icon:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"},
    {key:"packages",group:"MANAGE",label:"Packages",icon:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"},
    {key:"reviews",group:"MANAGE",label:"Reviews",icon:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"},
    {key:"typespec",group:"MANAGE",label:cfg.tabLabel,icon:cfg.tabIcon},
    {key:"profile",group:"MANAGE",label:"Profile",icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"},
    {key:"calendar",group:"SCHEDULE",label:"Calendar",icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"},
    {key:"grow",group:"GROW",label:"Grow",icon:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"},
  ];

  // ── Sidebar ───────────────────────────────────────────────────────────────
  function Sidebar(){
    let prevGroup=null;
    return(
      <div style={{width:200,background:ink,display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0}}>
        <div style={{padding:"22px 20px 16px",borderBottom:"1px solid rgba(204,171,74,0.12)"}}>
          <div style={{fontFamily:serif,fontSize:"1.45rem",color:goldLt,fontWeight:400,letterSpacing:"0.02em"}}>tendr</div>
          <div style={{fontSize:10,color:"rgba(255,248,236,0.35)",marginTop:2,fontWeight:600,letterSpacing:"0.12em"}}>{sType.toUpperCase()} DEMO</div>
        </div>
        <div style={{flex:1,padding:"12px 0",overflowY:"auto"}}>
          {NAV.map(item=>{
            const showDiv=item.group!==prevGroup;prevGroup=item.group;
            return(
              <React.Fragment key={item.key}>
                {showDiv&&<div style={{padding:"14px 20px 4px",fontSize:9.5,fontWeight:700,letterSpacing:"0.16em",color:"rgba(204,171,74,0.35)",textTransform:"uppercase"}}>{item.group}</div>}
                <button onClick={()=>setTab(item.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 20px",background:tab===item.key?"rgba(204,171,74,0.12)":"none",border:"none",cursor:"pointer",color:tab===item.key?goldLt:"rgba(255,248,236,0.55)",fontSize:13,fontWeight:tab===item.key?700:500,fontFamily:font,textAlign:"left",borderLeft:tab===item.key?`3px solid ${goldLt}`:"3px solid transparent",transition:"all 0.15s"}}>
                  <Ico d={item.icon} sz={15} c="currentColor"/>
                  {item.label}
                  {item.key==="work"&&pendingCount>0&&<span style={{background:"#DC2626",color:"#fff",borderRadius:100,padding:"1px 6px",fontSize:10,fontWeight:800,marginLeft:4}}>{pendingCount}</span>}
                  {item.key==="reviews"&&unrespondedReviews>0&&<span style={{background:gold,color:"#fff",borderRadius:100,padding:"1px 6px",fontSize:10,fontWeight:800,marginLeft:4}}>{unrespondedReviews}</span>}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {/* Type switcher — browse all service types without login */}
        <div style={{padding:"10px 16px",borderTop:"1px solid rgba(204,171,74,0.1)"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:"rgba(204,171,74,0.4)",textTransform:"uppercase",marginBottom:7}}>Switch Type</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {Object.keys(PROFILES).map(t=>(
              <button key={t} onClick={()=>setSearchParams({type:t})}
                style={{padding:"3px 8px",borderRadius:100,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:font,border:"1px solid",transition:"all 0.12s",
                  background:sType===t?goldLt:"transparent",
                  color:sType===t?ink:"rgba(204,171,74,0.5)",
                  borderColor:sType===t?goldLt:"rgba(204,171,74,0.2)"}}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(204,171,74,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${gold},${goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:serif,color:"#fff"}}>{(profile.name||"V")[0]}</div>
            <div><div style={{fontSize:12,fontWeight:700,color:"rgba(255,248,236,0.85)"}}>{profile.name}</div><div style={{fontSize:10,color:"rgba(255,248,236,0.35)"}}>{profile.type}</div></div>
          </div>
          <button onClick={()=>{
            const extras = sType==='Photographer'
              ? {services:profile.specialties,editingTimeDays:profile.editingDays}
              : sType==='Caterer'
              ? {cuisine:profile.specialties}
              : {};
            navigate(`/vendor/demo_${sType}`,{state:{vendor:{
              _id:`demo_${sType}`,
              avgReviewScore:profile.rating,
              verified:true,
              portfolioPhotos:[],
              serviceType:sType,
              ...profile,
              ...extras,
            }}});
          }} style={{width:"100%",padding:"6px 0",borderRadius:8,background:"rgba(204,171,74,0.12)",color:goldLt,fontSize:11,fontWeight:600,border:`1px solid rgba(204,171,74,0.2)`,cursor:"pointer",fontFamily:font}}>View Public Profile →</button>
        </div>
      </div>
    );
  }

  // ── Revenue stats ─────────────────────────────────────────────────────────
  const totalRev = MONTHLY.reduce((s,m)=>s+m.revenue,0);
  const totalExp = MONTHLY.reduce((s,m)=>s+m.expenses,0);
  const maxRev = Math.max(...MONTHLY.map(m=>m.revenue));

  // ── HOME TAB ──────────────────────────────────────────────────────────────
  function HomeTab(){
    const confirmed=bookings.filter(b=>b.status==="Confirmed");
    return(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[
          {label:"Total Revenue (6m)",val:fmt(totalRev),sub:"across "+bookings.length+" bookings",icon:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"},
          {label:"Confirmed Events",val:confirmed.length,sub:"next: "+( confirmed[0]?.date||"—"),icon:"M9 11l3 3L22 4"},
          {label:"Avg Rating",val:profile.rating,sub:profile.reviewCount+" reviews",icon:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2"},
          {label:"Response Time",val:profile.responseTime,sub:"team size: "+profile.teamSize,icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"},
        ].map(s=>(
          <Card key={s.label}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{s.label}</div>
                <div style={{fontSize:28,fontWeight:800,color:ink,fontFamily:serif}}>{s.val}</div>
                <div style={{fontSize:12,color:muted,marginTop:4}}>{s.sub}</div>
              </div>
              <div style={{width:40,height:40,borderRadius:"50%",background:gold0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico d={s.icon} sz={18} c={gold}/>
              </div>
            </div>
          </Card>
        ))}
        <Card style={{gridColumn:"1/-1"}}>
          <SL>Recent Bookings</SL>
          {bookings.slice(0,3).map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(196,122,46,0.08)"}}>
              <div><div style={{fontWeight:700,color:ink,fontSize:14}}>{b.client}</div><div style={{fontSize:12,color:muted}}>{b.event} · {b.date}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontWeight:700,color:ink}}>{fmt(b.amount)}</span><Pill s={b.status}/></div>
            </div>
          ))}
          <button onClick={()=>setTab("work")} style={{marginTop:12,background:"none",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"7px 16px",fontSize:12,color:gold,fontWeight:600,cursor:"pointer",fontFamily:font}}>View all bookings →</button>
        </Card>
      </div>
    );
  }

  // ── WORK TAB ──────────────────────────────────────────────────────────────
  function WorkTab(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:serif,fontSize:"1.35rem",fontWeight:600,color:ink}}>All Bookings</div>
          <div style={{fontSize:12,color:muted}}>Click <strong>Transfer to Coordinator</strong> to hand off a booking</div>
        </div>
        {bookings.map(b=>(
          <Card key={b.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <Pill s={b.status}/>
                  <span style={{fontSize:11,color:muted}}>{b.id}</span>
                </div>
                <div style={{fontWeight:700,color:ink,fontSize:15,marginBottom:2}}>{b.client}</div>
                <div style={{fontSize:13,color:muted,marginBottom:4}}>{b.event}</div>
                <div style={{fontSize:12,color:muted}}>{b.date} · {b.venue||"—"}</div>
                {b.note&&<div style={{fontSize:12,color:muted,marginTop:6,fontStyle:"italic"}}>"{b.note}"</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <div style={{fontSize:18,fontWeight:800,color:ink}}>{fmt(b.amount)}</div>
                {b.plates&&<div style={{fontSize:11,color:muted}}>{b.plates} plates</div>}
                {b.status!=="Transferred"&&b.status!=="Declined"&&(
                  <button onClick={()=>setTransferConfirm(b)} style={{padding:"7px 14px",borderRadius:8,background:"rgba(124,58,237,0.08)",border:"1.5px solid rgba(124,58,237,0.3)",color:"#7C3AED",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:font}}>
                    Transfer to Coordinator
                  </button>
                )}
                {b.status==="Transferred"&&<div style={{fontSize:11,color:"#7C3AED",fontWeight:600}}>✓ Sent to coordinator</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // ── MONEY TAB ─────────────────────────────────────────────────────────────
  function MoneyTab(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",gap:8}}>
          {["chart","breakdown"].map(v=><button key={v} onClick={()=>setMoneyView(v)} style={{padding:"8px 18px",borderRadius:100,fontFamily:font,fontSize:13,fontWeight:600,border:"none",cursor:"pointer",background:moneyView===v?gold:"rgba(196,122,46,0.1)",color:moneyView===v?"#fff":muted}}>{v==="chart"?"Revenue Chart":"Booking Breakdown"}</button>)}
        </div>
        {moneyView==="chart"?(
          <Card>
            <SL>Monthly Revenue (6 months)</SL>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140,paddingTop:8}}>
              {MONTHLY.map(m=>(
                <div key={m.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{width:"100%",borderRadius:"6px 6px 0 0",background:`linear-gradient(180deg,${gold},${goldLt})`,height:`${(m.revenue/maxRev)*120}px`,opacity:0.85}}/>
                  <div style={{fontSize:11,color:muted,fontWeight:600}}>{m.month}</div>
                  <div style={{fontSize:10,color:gold,fontWeight:700}}>{(m.revenue/1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:24,marginTop:16,paddingTop:12,borderTop:"1px solid rgba(196,122,46,0.1)"}}>
              {[{l:"Total Revenue",v:totalRev},{l:"Total Expenses",v:totalExp},{l:"Net Profit",v:totalRev-totalExp}].map(s=>(
                <div key={s.l}><div style={{fontSize:11,color:muted,fontWeight:600,marginBottom:4}}>{s.l}</div><div style={{fontSize:18,fontWeight:800,color:s.l.includes("Profit")?gold:ink}}>{fmt(s.v)}</div></div>
              ))}
            </div>
          </Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {bookings.filter(b=>b.status!=="Declined").map(b=>(
              <Card key={b.id} style={{padding:"14px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700,color:ink}}>{b.client}</div><div style={{fontSize:12,color:muted}}>{b.date}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontWeight:800,color:ink,fontSize:15}}>{fmt(b.amount)}</span><Pill s={b.status}/></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── PACKAGES TAB ─────────────────────────────────────────────────────────
  function PackagesTab(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:serif,fontSize:"1.35rem",fontWeight:600,color:ink}}>Your Packages</div>
          <Btn onClick={()=>{setPkgDraft({name:"",price:"",unit:"per event",items:""});setPkgModal("new");}}>+ Add Package</Btn>
        </div>
        {packages.map(p=>(
          <Card key={p.id} style={{position:"relative"}}>
            {p.badge&&<div style={{position:"absolute",top:14,right:14,background:gold,color:"#fff",borderRadius:100,padding:"2px 10px",fontSize:10,fontWeight:700}}>{p.badge}</div>}
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <div style={{fontSize:28}}>{p.icon||"📦"}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:ink,fontSize:15,marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:18,fontWeight:800,color:gold,marginBottom:8}}>{typeof p.price==="number"?fmt(p.price):p.price} <span style={{fontSize:13,color:muted,fontWeight:500}}>{p.unit}</span></div>
                {(typeof p.items==="string"?p.items.split("\n"):p.items).map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:muted,marginBottom:3}}>
                    <Ico d="M20 6L9 17l-5-5" sz={12} c={gold}/>{item}
                  </div>
                ))}
                {p.minPlates&&<div style={{marginTop:6,fontSize:12,color:muted}}>Min. {p.minPlates} plates</div>}
              </div>
              <button onClick={()=>{setPkgDraft({...p});setPkgModal(p.id);}} style={{background:"none",border:"none",cursor:"pointer",color:muted,fontSize:20,lineHeight:1}}>✏️</button>
            </div>
          </Card>
        ))}
        {pkgModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(28,10,4,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setPkgModal(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:28,width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(28,10,4,0.2)"}}>
              <h3 style={{fontFamily:serif,fontSize:"1.2rem",fontWeight:500,color:ink,margin:"0 0 20px"}}>{pkgModal==="new"?"New Package":"Edit Package"}</h3>
              <Inp label="Package Name" value={pkgDraft.name} onChange={v=>setPkgDraft(d=>({...d,name:v}))}/>
              <Inp label="Price" value={pkgDraft.price} onChange={v=>setPkgDraft(d=>({...d,price:v}))}/>
              <Inp label="Unit (e.g. per plate, per event)" value={pkgDraft.unit} onChange={v=>setPkgDraft(d=>({...d,unit:v}))}/>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>Inclusions (one per line)</label>
                <textarea value={pkgDraft.items||""} onChange={e=>setPkgDraft(d=>({...d,items:e.target.value}))} rows={4} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:14,fontFamily:font,color:ink,background:cream,boxSizing:"border-box",resize:"vertical"}}/>
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                {pkgModal!=="new"&&<button onClick={()=>{setPackages(p=>p.filter(x=>x.id!==pkgModal));setPkgModal(null);}} style={{padding:"9px 18px",borderRadius:100,background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:font}}>Delete</button>}
                <button onClick={()=>setPkgModal(null)} style={{padding:"9px 18px",borderRadius:100,background:cream,border:"1px solid rgba(196,122,46,0.2)",color:muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:font}}>Cancel</button>
                <Btn onClick={()=>{
                  if(pkgModal==="new"){setPackages(p=>[...p,{...pkgDraft,id:Date.now()}]);}
                  else{setPackages(p=>p.map(x=>x.id===pkgModal?{...pkgDraft,id:pkgModal}:x));}
                  setPkgModal(null);showToast("Package saved!");
                }}>Save</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── REVIEWS TAB ───────────────────────────────────────────────────────────
  function ReviewsTab(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{fontFamily:serif,fontSize:"1.35rem",fontWeight:600,color:ink}}>Client Reviews <span style={{fontSize:14,color:muted,fontWeight:400}}>({profile.rating}★ · {profile.reviewCount} total)</span></div>
        {reviews.map(r=>(
          <Card key={r.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{fontWeight:700,color:ink}}>{r.name}</div><div style={{fontSize:12,color:muted}}>{r.event}</div></div>
              <Stars r={r.rating}/>
            </div>
            <p style={{fontSize:14,color:ink,lineHeight:1.6,margin:"0 0 10px"}}>"{r.text}"</p>
            {r.response?(
              <div style={{background:"rgba(196,122,46,0.06)",borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${gold}`}}>
                <div style={{fontSize:11,color:gold,fontWeight:700,marginBottom:4}}>YOUR REPLY</div>
                <div style={{fontSize:13,color:ink}}>{r.response}</div>
              </div>
            ):(
              replyId===r.id?(
                <div>
                  <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply…" rows={2} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream,boxSizing:"border-box",resize:"none"}}/>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <Btn onClick={()=>{setReviews(rv=>rv.map(x=>x.id===r.id?{...x,response:replyText}:x));setReplyId(null);setReplyText("");showToast("Reply posted!");}}>Post Reply</Btn>
                    <button onClick={()=>{setReplyId(null);setReplyText("");}} style={{padding:"8px 16px",borderRadius:100,background:cream,border:"1px solid rgba(196,122,46,0.2)",color:muted,fontSize:13,cursor:"pointer",fontFamily:font}}>Cancel</button>
                  </div>
                </div>
              ):(
                <button onClick={()=>{setReplyId(r.id);setReplyText("");}} style={{background:"none",border:`1px solid rgba(196,122,46,0.2)`,borderRadius:8,padding:"6px 14px",fontSize:12,color:gold,fontWeight:600,cursor:"pointer",fontFamily:font}}>Reply</button>
              )
            )}
          </Card>
        ))}
      </div>
    );
  }

  // ── TYPE-SPECIFIC TAB ─────────────────────────────────────────────────────
  function TypeTab(){
    if(sType==="Caterer") return(
      <Card>
        <SL>Cuisine & Service Options</SL>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Menu Types Offered</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.menuType||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Service Styles</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.serviceStyle||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
        <div><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Specialties</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.specialties||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
      </Card>
    );
    if(sType==="Decorator") return(
      <Card>
        <SL>Decoration Capabilities</SL>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Decoration Types</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.typesOfDecoration||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Themes</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.themes||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
        <div><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Specialties</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.specialties||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
      </Card>
    );
    if(sType==="Photographer") return(
      <Card>
        <SL>Photography Services</SL>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Photography Types</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.photographyType||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Hours Available</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.hoursIncluded||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t} hrs</span>)}</div></div>
        <div><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Editing Turnaround</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.editingDays||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t} days</span>)}</div></div>
      </Card>
    );
    if(sType==="DJ") return(
      <Card>
        <SL>DJ Setup Options</SL>
        <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Setup Types</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.setup||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
        <div><div style={{fontSize:13,fontWeight:600,color:ink,marginBottom:8}}>Event Types Served</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{(profile.eventTypes||[]).map(t=><span key={t} style={{padding:"5px 12px",borderRadius:100,background:"rgba(196,122,46,0.1)",color:gold,fontSize:12,fontWeight:600}}>{t}</span>)}</div></div>
      </Card>
    );
    return null;
  }

  // ── PROFILE TAB ──────────────────────────────────────────────────────────
  function ProfileTab(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:serif,fontSize:"1.35rem",fontWeight:600,color:ink}}>Business Profile</div>
          {!profEdit?(
            <Btn onClick={()=>{setProfDraft({...profile});setProfEdit(true);}}>Edit Profile</Btn>
          ):(
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>{setProfile({...profile,...profDraft});setProfEdit(false);showToast("Profile saved! Customer view updated ✓");}}>Save & Sync</Btn>
              <button onClick={()=>setProfEdit(false)} style={{padding:"9px 18px",borderRadius:100,background:cream,border:"1px solid rgba(196,122,46,0.2)",color:muted,fontSize:13,cursor:"pointer",fontFamily:font}}>Cancel</button>
            </div>
          )}
        </div>
        {profEdit?(
          <Card>
            <Inp label="Business Name" value={profDraft.name} onChange={v=>setProfDraft(d=>({...d,name:v}))}/>
            <Inp label="City" value={profDraft.city} onChange={v=>setProfDraft(d=>({...d,city:v}))}/>
            <Inp label="Phone" value={profDraft.phone} onChange={v=>setProfDraft(d=>({...d,phone:v}))}/>
            <Inp label="Email" value={profDraft.email} onChange={v=>setProfDraft(d=>({...d,email:v}))}/>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:700,color:muted,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>Bio</label>
              <textarea value={profDraft.bio||""} onChange={e=>setProfDraft(d=>({...d,bio:e.target.value}))} rows={4} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:14,fontFamily:font,color:ink,background:cream,boxSizing:"border-box",resize:"vertical"}}/>
            </div>
            <Inp label="Instagram" value={profDraft.instagram} onChange={v=>setProfDraft(d=>({...d,instagram:v}))}/>
            <Inp label="Website" value={profDraft.website} onChange={v=>setProfDraft(d=>({...d,website:v}))}/>
            <div style={{fontSize:12,color:gold,fontWeight:600,marginTop:4}}>💡 Saving will update the customer-facing demo profile in real time</div>
          </Card>
        ):(
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {[{l:"Business Name",v:profile.name},{l:"City",v:profile.city},{l:"Phone",v:profile.phone},{l:"Email",v:profile.email},{l:"Team Size",v:profile.teamSize+" people"},{l:"Experience",v:profile.years+" years"},{l:"Instagram",v:profile.instagram||"—"},{l:"Website",v:profile.website||"—"}].map(f=>(
                <div key={f.l}><div style={{fontSize:11,color:muted,fontWeight:600,marginBottom:3}}>{f.l}</div><div style={{fontSize:14,color:ink,fontWeight:600}}>{f.v}</div></div>
              ))}
            </div>
            <div><div style={{fontSize:11,color:muted,fontWeight:600,marginBottom:6}}>BIO</div><p style={{fontSize:14,color:ink,lineHeight:1.65,margin:0}}>{profile.bio}</p></div>
          </Card>
        )}
      </div>
    );
  }

  // ── CALENDAR TAB ─────────────────────────────────────────────────────────
  function CalendarTab(){
    const {y,m}=calMonth;
    const first=new Date(y,m,1).getDay();
    const days=new Date(y,m+1,0).getDate();
    const booked=new Set(bookings.filter(b=>b.status==="Confirmed").map(b=>b.date));
    return(
      <Card>
        <SL>October 2026 Availability</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:muted,padding:"4px 0"}}>{d}</div>)}
          {Array(first).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {Array.from({length:days},(_,i)=>{const ds=`${y}-${String(m+1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;const isBooked=booked.has(ds);return(
            <div key={i} style={{textAlign:"center",padding:"8px 4px",borderRadius:8,background:isBooked?"rgba(196,122,46,0.12)":"transparent",border:isBooked?`1px solid ${gold}`:"1px solid transparent",fontSize:13,color:isBooked?gold:ink,fontWeight:isBooked?700:400}}>{i+1}</div>
          );})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><div style={{width:12,height:12,borderRadius:3,background:"rgba(196,122,46,0.12)",border:`1px solid ${gold}`}}/><span style={{fontSize:12,color:muted}}>Booked dates</span></div>
      </Card>
    );
  }

  // ── GROW TAB ─────────────────────────────────────────────────────────────
  function GrowTab(){
    const profileUrl=`${window.location.origin}/vendor/demo?type=${sType}`;
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card>
          <SL>Your Public Profile Link</SL>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input readOnly value={profileUrl} style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid rgba(196,122,46,0.2)",fontSize:13,fontFamily:font,color:ink,background:cream}}/>
            <Btn onClick={()=>{navigator.clipboard?.writeText(profileUrl);showToast("Link copied!");}}>Copy</Btn>
          </div>
          <p style={{fontSize:12,color:muted,marginTop:10}}>Changes you make in <strong>Profile</strong> tab appear here instantly for customers.</p>
        </Card>
        <Card>
          <SL>Performance Stats</SL>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[{l:"Events Done",v:profile.events},{l:"Rating",v:profile.rating+"★"},{l:"Reviews",v:profile.reviewCount}].map(s=>(
              <div key={s.l} style={{textAlign:"center",padding:"14px 8px",borderRadius:12,background:"rgba(196,122,46,0.06)"}}>
                <div style={{fontSize:22,fontWeight:800,color:ink,fontFamily:serif}}>{s.v}</div>
                <div style={{fontSize:11,color:muted,marginTop:4}}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const TABS = {home:<HomeTab/>,work:<WorkTab/>,money:<MoneyTab/>,packages:<PackagesTab/>,reviews:<ReviewsTab/>,typespec:<TypeTab/>,profile:<ProfileTab/>,calendar:<CalendarTab/>,grow:<GrowTab/>};

  return(
    <div style={{display:"flex",minHeight:"100vh",fontFamily:font,background:cream}}>
      <Sidebar/>
      <div style={{flex:1,overflowY:"auto",padding:28,maxHeight:"100vh"}}>
        {/* Toast */}
        {toast&&<div style={{position:"fixed",top:20,right:20,background:toast.ok===false?"#FEF3C7":ink,color:toast.ok===false?ink:"#FAF7F2",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,zIndex:500,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",fontFamily:font}}>{toast.msg}</div>}

        {/* Transfer confirm modal */}
        {transferConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(28,10,4,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setTransferConfirm(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:28,maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(28,10,4,0.2)"}}>
              <h3 style={{fontFamily:serif,fontSize:"1.2rem",fontWeight:500,color:ink,margin:"0 0 12px"}}>Transfer to Coordinator?</h3>
              <p style={{fontSize:14,color:muted,marginBottom:20,lineHeight:1.6}}>Send <strong>{transferConfirm.client}</strong>'s booking ({transferConfirm.date}) to the event coordinator for management. They will see it in their dashboard and can accept or decline.</p>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setTransferConfirm(null)} style={{padding:"9px 18px",borderRadius:100,background:cream,border:"1px solid rgba(196,122,46,0.2)",color:muted,fontSize:13,cursor:"pointer",fontFamily:font}}>Cancel</button>
                <Btn onClick={()=>transferToCoordinator(transferConfirm)}>Yes, Transfer</Btn>
              </div>
            </div>
          </div>
        )}

        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:serif,fontSize:"1.8rem",fontWeight:400,color:ink}}>{profile.name}</div>
            <div style={{fontSize:13,color:muted,marginTop:2}}>{profile.type} · {profile.city} · {profile.rating}★ ({profile.reviewCount} reviews)</div>
          </div>
          {TABS[tab]}
        </div>
      </div>
    </div>
  );
}
