import React, { useState } from "react";
import PageTour from "../../components/PageTour";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setBookingType } from "../../redux/eventPlanningSlice";
import { clearVendorCompare } from "../../redux/listingFiltersSlice";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold = "#C47A2E";
const goldLt = "#CCAB4A";
const ink = "#1C0E04";
const inkMid = "#2C1A0E";
const cream = "#FFF8EC";

const IconSearch = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/>
  </svg>
);
const IconChat = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const FLOWS = [
  {
    type: "you-do-it",
    Icon: IconSearch,
    title: "Book It Yourself",
    tag: "DIY",
    subtitle: "Browse profiles, compare vendors, book at your own pace — full control, zero commitment.",
    steps: [
      "Fill event details in 2 minutes",
      "Browse vendors by category & budget",
      "Chat directly to confirm pricing",
      "Finalise & pay when you're ready",
    ],
    cta: "Browse Vendors",
    accent: gold,
    cardBg: "#FFFDF7",
    borderColor: `rgba(196,122,46,0.22)`,
    shadowColor: "rgba(196,122,46,0.18)",
    iconBg: `rgba(196,122,46,0.1)`,
    ctaBg: `linear-gradient(135deg,${gold},${goldLt})`,
    ctaShadow: "rgba(196,122,46,0.4)",
    tag3D: "rgba(196,122,46,0.12)",
    route: null,
  },
  {
    type: "let-us-do-it",
    Icon: IconSparkle,
    title: "Smart Booking",
    tag: "Recommended",
    subtitle: "Tell us your budget once. We auto-select the best vendor package and coordinate everything.",
    steps: [
      "Fill event details in 2 minutes",
      "Set budget per service category",
      "Get a complete package instantly",
      "Confirm & we handle the rest",
    ],
    cta: "Build My Package",
    accent: "#fff",
    cardBg: `linear-gradient(145deg,${inkMid},${ink})`,
    borderColor: `rgba(204,171,74,0.35)`,
    shadowColor: "rgba(28,14,4,0.45)",
    iconBg: "rgba(204,171,74,0.12)",
    ctaBg: `linear-gradient(135deg,${goldLt},${gold})`,
    ctaShadow: "rgba(196,122,46,0.5)",
    tag3D: "rgba(204,171,74,0.15)",
    route: null,
    dark: true,
  },
  {
    type: "baat-karo",
    Icon: IconChat,
    title: "Baat Karo",
    tag: "Just Chat",
    subtitle: "Bas likh do apni requirements — Tendr Team 2 ghante mein reply karegi aur sab handle kar legi.",
    steps: [
      "Apni requirements likh do",
      "Send tap karo",
      "Team 2 ghante mein reply karegi",
      "Hum sab coordinate kar lete hain",
    ],
    cta: "Start Chat",
    accent: "#0a7a6e",
    cardBg: "#F5FFFD",
    borderColor: "rgba(18,140,126,0.22)",
    shadowColor: "rgba(18,140,126,0.18)",
    iconBg: "rgba(37,211,102,0.1)",
    ctaBg: "linear-gradient(135deg,#25D366,#128C7E)",
    ctaShadow: "rgba(18,140,126,0.4)",
    tag3D: "rgba(37,211,102,0.1)",
    route: "/baat-karo",
  },
];

const FLYER_FIELDS = [
  { key: "eventName",  label: "Event name",                  placeholder: "e.g. Rahul's 30th Birthday",      required: true },
  { key: "hostedBy",  label: "Hosted by",                   placeholder: "e.g. Priya & Family",             required: true },
  { key: "date",      label: "Date",                        placeholder: "e.g. 20th July 2026",             required: true, type: "text" },
  { key: "time",      label: "Time",                        placeholder: "e.g. 7:00 PM onwards",            required: true },
  { key: "venue",     label: "Venue / Location",            placeholder: "e.g. The Grand Ballroom, Mumbai", required: true },
  { key: "rsvp",      label: "RSVP contact",               placeholder: "Phone number or email",           required: false },
  { key: "dressCode", label: "Dress code (optional)",       placeholder: "e.g. Cocktail attire",            required: false },
  { key: "tagline",   label: "Special message (optional)",  placeholder: "e.g. Join us for a night to remember!", required: false },
];

const emptyFlyer = Object.fromEntries(FLYER_FIELDS.map(f => [f.key, ""]));

const CheckIcon = ({ color }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color || "#fff"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function ChooseBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [flyerData, setFlyerData] = useState(emptyFlyer);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleChoose = (type, route) => {
    if (type === "baat-karo") { navigate("/baat-karo"); return; }
    if (route) { navigate(route); return; }
    dispatch(clearVendorCompare());
    dispatch(setBookingType(type));
    navigate("/plan-event/form?bookingType=" + type);
  };

  const handleFlyerSubmit = () => {
    try { localStorage.setItem("tendr_flyer_draft", JSON.stringify({ ...flyerData, savedAt: Date.now() })); } catch {}
    navigate("/baat-karo");
  };

  const handleFlyerSkip = () => {
    try { localStorage.removeItem("tendr_flyer_draft"); } catch {}
    navigate("/baat-karo");
  };

  const requiredFilled = FLYER_FIELDS.filter(f => f.required).every(f => flyerData[f.key]?.trim());

  const CHOOSE_BOOKING_STEPS = [{
    target: "body", placement: "center", disableBeacon: true,
    title: "How would you like to book?",
    content: "Book yourself, use our Smart Booking, or just chat with our team — all lead to perfect vendors.",
  }];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: font }}>
      <PageTour pageKey="choose-booking" steps={CHOOSE_BOOKING_STEPS} />
      <SEO title="Book Vendors — Tendr" description="Choose how you'd like to book vendors for your event." path="/booking" />
      <HamburgerNav />
      <BasicSpeedDial />

      {/* Hero header */}
      <div style={{
        background: `linear-gradient(160deg,${ink} 0%,${inkMid} 60%,#3A1A08 100%)`,
        padding: "80px 24px 72px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative orbs */}
        <div style={{ position:"absolute", top:"-60px", left:"-80px", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,122,46,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-40px", right:"-60px", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(204,171,74,0.14) 0%,transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          {/* eyebrow */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            fontSize:10, fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase",
            color:goldLt, background:"rgba(204,171,74,0.1)", border:`1px solid rgba(204,171,74,0.28)`,
            borderRadius:100, padding:"6px 18px", marginBottom:24,
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:goldLt, display:"inline-block" }} />
            Book Vendors
          </div>

          <h1 style={{
            fontFamily:serif,
            fontSize:"clamp(2.2rem,5vw,3.4rem)",
            fontWeight:300,
            color:cream,
            margin:"0 0 18px",
            letterSpacing:"0.01em",
            lineHeight:1.1,
            textWrap:"balance",
          }}>
            How would you like to book?
          </h1>

          <p style={{
            fontSize:16, fontWeight:400, color:"rgba(255,248,236,0.62)",
            margin:"0 auto", maxWidth:440, lineHeight:1.7,
          }}>
            Pick your style — from full DIY to total hands-off. All options start with the same 2-minute form.
          </p>
        </div>
      </div>

      {/* Cards section */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px 80px" }}>

        {/* Cards grid — overlaps header slightly */}
        <div className="cb-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginTop:-36 }}>
          {FLOWS.map((flow) => {
            const { Icon } = flow;
            const isHovered = hoveredCard === flow.type;
            const isDark = !!flow.dark;
            const textColor = isDark ? cream : ink;
            const subColor = isDark ? "rgba(255,248,236,0.58)" : "#7A5A3A";
            const stepColor = isDark ? "rgba(255,248,236,0.78)" : "#4A2C0E";
            const dividerColor = isDark ? "rgba(204,171,74,0.18)" : `rgba(196,122,46,0.12)`;

            return (
              <div
                key={flow.type}
                className="cb-card"
                style={{
                  background: flow.cardBg,
                  border: `1.5px solid ${flow.borderColor}`,
                  borderRadius:24,
                  padding:"32px 26px 26px",
                  display:"flex", flexDirection:"column",
                  cursor:"pointer",
                  position:"relative",
                  /* 3-D raised card: base shadow + lift shadow */
                  boxShadow: isHovered
                    ? `0 0 0 2px ${flow.borderColor}, 0 6px 0 ${flow.shadowColor}, 0 24px 48px ${flow.shadowColor}, 0 8px 20px rgba(0,0,0,0.18)`
                    : `0 4px 0 ${flow.shadowColor}, 0 10px 32px ${flow.shadowColor}, 0 2px 8px rgba(0,0,0,0.08)`,
                  transform: isHovered ? "translateY(-8px) scale(1.012)" : "translateY(0) scale(1)",
                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
                  zIndex: isHovered ? 2 : 1,
                }}
                onMouseEnter={() => setHoveredCard(flow.type)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleChoose(flow.type, flow.route)}
              >
                {/* Recommended badge */}
                {flow.type === "let-us-do-it" && (
                  <div style={{
                    position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
                    background:`linear-gradient(135deg,${gold},${goldLt})`,
                    borderRadius:100, padding:"4px 16px", whiteSpace:"nowrap",
                    boxShadow:"0 4px 12px rgba(196,122,46,0.4)",
                  }}>
                    <span style={{ fontSize:9.5, fontWeight:800, color:"#fff", letterSpacing:"0.1em", textTransform:"uppercase" }}>Recommended</span>
                  </div>
                )}

                {/* Icon + tag row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                  <div style={{
                    width:52, height:52, borderRadius:16,
                    background:flow.iconBg, border:`1.5px solid ${flow.borderColor}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: isDark ? goldLt : flow.accent,
                    boxShadow:`0 4px 12px ${flow.shadowColor}`,
                  }}>
                    <Icon />
                  </div>
                  <span style={{
                    fontSize:9.5, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase",
                    color: isDark ? goldLt : flow.accent,
                    background:flow.tag3D, padding:"5px 12px", borderRadius:100,
                    border:`1px solid ${flow.borderColor}`,
                  }}>
                    {flow.tag}
                  </span>
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily:font,
                  fontSize:"clamp(1.15rem,2vw,1.4rem)",
                  fontWeight:800,
                  color:textColor,
                  margin:"0 0 8px",
                  letterSpacing:"-0.01em",
                  lineHeight:1.2,
                }}>
                  {flow.title}
                </h2>

                {/* Subtitle */}
                <p style={{ fontSize:13.5, fontWeight:400, color:subColor, margin:"0 0 22px", lineHeight:1.65 }}>
                  {flow.subtitle}
                </p>

                {/* Divider */}
                <div style={{ height:1, background:dividerColor, marginBottom:20 }} />

                {/* Steps */}
                <div style={{ display:"flex", flexDirection:"column", gap:13, flex:1, marginBottom:26 }}>
                  {flow.steps.map((step, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <span style={{
                        width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                        background:flow.iconBg, border:`1.5px solid ${flow.borderColor}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <CheckIcon color={isDark ? goldLt : flow.accent} />
                      </span>
                      <span style={{ fontSize:13, fontWeight:500, color:stepColor, lineHeight:1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={e => { e.stopPropagation(); handleChoose(flow.type, flow.route); }}
                  style={{
                    width:"100%", padding:"14px 0", borderRadius:14, border:"none",
                    background:flow.ctaBg, color:"#fff",
                    fontSize:14, fontWeight:700, fontFamily:font,
                    cursor:"pointer", letterSpacing:"0.025em",
                    boxShadow:`0 4px 18px ${flow.ctaShadow}`,
                    transition:"opacity 0.15s, transform 0.12s",
                    touchAction:"manipulation",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity="0.9"; e.currentTarget.style.transform="scale(0.98)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="scale(1)"; }}
                >
                  {flow.cta} →
                </button>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @media (max-width: 680px) {
          .cb-grid { grid-template-columns: 1fr !important; gap: 14px !important; margin-top: -20px !important; }
          .cb-card { padding: 22px 18px 18px !important; border-radius: 18px !important; }
        }
        @media (min-width: 681px) and (max-width: 960px) {
          .cb-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Invitation Flyer Modal */}
      {showFlyerModal && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(20,10,4,0.65)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setShowFlyerModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"#FFFCF5", borderRadius:22, width:"100%", maxWidth:480, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(20,10,4,0.3)" }}
          >
            <div style={{ padding:"22px 22px 16px", borderBottom:"1px solid rgba(196,122,46,0.12)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.13em", color:gold, textTransform:"uppercase", marginBottom:5 }}>Optional</div>
                  <div style={{ fontFamily:serif, fontSize:20, fontWeight:400, color:inkMid, lineHeight:1.25 }}>Invitation Flyer</div>
                  <div style={{ fontSize:12, fontWeight:400, color:"#9B7450", marginTop:4 }}>Fill this in and we'll design a flyer for your event</div>
                </div>
                <button onClick={handleFlyerSkip} style={{ background:"none", border:"1.5px solid rgba(196,122,46,0.3)", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:500, color:"#9B7450", cursor:"pointer", flexShrink:0, fontFamily:font, marginTop:2 }}>Skip →</button>
              </div>
            </div>

            <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:13, overflowY:"auto", flex:1 }}>
              {FLYER_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6B4226", display:"block", marginBottom:4 }}>
                    {f.label}{f.required && <span style={{ color:gold }}> *</span>}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={flyerData[f.key]}
                    onChange={e => setFlyerData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:9, border:"1.5px solid rgba(196,122,46,0.22)", background:"#FFF8EE", fontSize:13, fontFamily:font, color:inkMid, outline:"none" }}
                    onFocus={e => e.target.style.borderColor = gold}
                    onBlur={e => e.target.style.borderColor = "rgba(196,122,46,0.22)"}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding:"12px 22px calc(16px + env(safe-area-inset-bottom,0px))", display:"flex", flexDirection:"column", gap:8, borderTop:"1px solid rgba(196,122,46,0.1)", flexShrink:0 }}>
              <button
                onClick={handleFlyerSubmit}
                disabled={!requiredFilled}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background: requiredFilled ? "linear-gradient(135deg,#25D366,#128C7E)" : "rgba(196,122,46,0.14)", color: requiredFilled ? "#fff" : "#C4A882", fontSize:14, fontWeight:700, fontFamily:font, cursor: requiredFilled ? "pointer" : "default" }}
              >Save & go to Baat Karo →</button>
              <button
                onClick={handleFlyerSkip}
                style={{ width:"100%", padding:"10px", borderRadius:12, border:"1.5px solid rgba(196,122,46,0.22)", background:"transparent", color:"#9B7450", fontSize:13, fontWeight:400, fontFamily:font, cursor:"pointer" }}
              >Skip — go to Baat Karo without flyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
