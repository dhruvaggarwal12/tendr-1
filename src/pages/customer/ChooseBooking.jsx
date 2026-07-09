import React, { useState } from "react";
import PageTour from "../../components/PageTour";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setBookingType, resetEventPlanning } from "../../redux/eventPlanningSlice";
import { clearVendorCompare, clearFinalisedVendor } from "../../redux/listingFiltersSlice";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

const FLOWS = [
  {
    type: "you-do-it",
    emoji: "🔍",
    title: "You Do It",
    tag: "Browse & Book",
    subtitle: "Browse vendors, compare profiles, book at your own pace",
    steps: [
      "Fill event details (takes 2 minutes)",
      "Browse & compare vendors by category",
      "Chat directly to confirm price & details",
      "Finalise vendors & pay",
    ],
    cta: "Start Browsing Vendors",
    accent: "#C47A2E",
    ctaBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
    ctaShadow: "rgba(196,122,46,0.35)",
    border: "rgba(196,122,46,0.18)",
    tagBg: "rgba(196,122,46,0.08)",
    route: null,
  },
  {
    type: "let-us-do-it",
    emoji: "✨",
    title: "Smart Planner",
    tag: "We Build It",
    subtitle: "Tell us once. We build your complete vendor package.",
    steps: [
      "Fill event details (takes 2 minutes)",
      "Set your budget per service category",
      "Get a complete vendor package instantly",
      "Confirm & our team coordinates for you",
    ],
    cta: "Build My Package",
    accent: "#7A4A1E",
    ctaBg: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
    ctaShadow: "rgba(196,122,46,0.35)",
    border: "rgba(122,74,30,0.16)",
    tagBg: "rgba(122,74,30,0.07)",
    route: null,
  },
  {
    type: "baat-karo",
    emoji: "💬",
    title: "Baat Karo",
    tag: "Just Chat",
    subtitle: "Bas likh do — Tendr Team yahin app mein reply karegi",
    steps: [
      "Apni requirements likh do",
      "Send tap karo",
      "Tendr team 2 ghante mein reply karegi",
      "Hum sab handle kar lete hain",
    ],
    cta: "Baat Karo",
    accent: "#128C7E",
    ctaBg: "linear-gradient(135deg,#25D366,#128C7E)",
    ctaShadow: "rgba(37,211,102,0.3)",
    border: "rgba(37,211,102,0.22)",
    tagBg: "rgba(37,211,102,0.07)",
    route: "/baat-karo",
  },
];

const FLYER_FIELDS = [
  { key: "eventName",  label: "Event name",            placeholder: "e.g. Rahul's 30th Birthday",      required: true },
  { key: "hostedBy",  label: "Hosted by",              placeholder: "e.g. Priya & Family",             required: true },
  { key: "date",      label: "Date",                   placeholder: "e.g. 20th July 2026",             required: true, type: "text" },
  { key: "time",      label: "Time",                   placeholder: "e.g. 7:00 PM onwards",            required: true },
  { key: "venue",     label: "Venue / Location",       placeholder: "e.g. The Grand Ballroom, Mumbai", required: true },
  { key: "rsvp",      label: "RSVP contact",           placeholder: "Phone number or email",           required: false },
  { key: "dressCode", label: "Dress code (optional)",  placeholder: "e.g. Cocktail attire",            required: false },
  { key: "tagline",   label: "Special message (optional)", placeholder: "e.g. Join us for a night to remember!", required: false },
];

const emptyFlyer = Object.fromEntries(FLYER_FIELDS.map(f => [f.key, ""]));

export default function ChooseBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [flyerData, setFlyerData] = useState(emptyFlyer);

  const handleChoose = (type, route) => {
    if (type === "baat-karo") { setShowFlyerModal(true); return; }
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
    title: "How would you like to plan?",
    content: "You Do It: browse vendors yourself. Smart Plan: fill budget once, Tendr picks the best package. Baat Karo: just chat with our team.",
  }];

  return (
    <div style={{ minHeight: "100vh", background: "#F9F5EF", fontFamily: font }}>
      <PageTour pageKey="choose-booking" steps={CHOOSE_BOOKING_STEPS} />
      <SEO title="Plan an Event — Tendr" description="Choose how you'd like to plan your event." path="/booking" />
      <HamburgerNav />
      <BasicSpeedDial />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 96px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 14px" }}>
            Start Planning
          </p>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 14px", letterSpacing: "0.01em", lineHeight: 1.15 }}>
            How would you like to plan?
          </h1>
          <p style={{ fontSize: 15, fontWeight: 400, color: "#9B7450", margin: 0, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Both start with the same quick form. Choose how involved you want to be.
          </p>
        </div>

        {/* Cards */}
        <div className="cb-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {FLOWS.map((flow) => (
            <div
              key={flow.type}
              className="cb-card"
              style={{
                background: "#FFFCF7",
                border: `1px solid ${flow.border}`,
                borderRadius: 20,
                padding: "28px 24px 24px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 16px rgba(44,26,14,0.06)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(44,26,14,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(44,26,14,0.06)"; }}
            >
              {/* Tag + icon */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: flow.accent, background: flow.tagBg, padding: "4px 10px", borderRadius: 100 }}>
                  {flow.tag}
                </span>
                <span style={{ fontSize: 22 }}>{flow.emoji}</span>
              </div>

              {/* Title + subtitle */}
              <h2 style={{ fontFamily: serif, fontSize: "clamp(1.4rem,2vw,1.7rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "0.01em" }}>
                {flow.title}
              </h2>
              <p style={{ fontSize: 13, fontWeight: 400, color: flow.accent, margin: "0 0 22px", lineHeight: 1.5 }}>
                {flow.subtitle}
              </p>

              {/* Divider */}
              <div style={{ height: 1, background: flow.border, marginBottom: 20 }} />

              {/* Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, marginBottom: 24 }}>
                {flow.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `1.5px solid ${flow.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 500, color: flow.accent,
                      flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 400, color: "#4A2C0E", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleChoose(flow.type, flow.route)}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                  background: flow.ctaBg, color: "#fff",
                  fontSize: 14, fontWeight: 600, fontFamily: font,
                  cursor: "pointer", letterSpacing: "0.02em",
                  boxShadow: `0 4px 16px ${flow.ctaShadow}`,
                  transition: "opacity 0.18s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {flow.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 36, fontSize: 13, fontWeight: 400, color: "#B08A6A", textAlign: "center" }}>
          Pehle do options ek hi form se shuru hote hain — aap baad mein bhi switch kar sakte hain.
        </p>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .cb-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
        @media (min-width: 681px) and (max-width: 900px) {
          .cb-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Invitation Flyer Modal */}
      {showFlyerModal && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(20,10,4,0.6)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setShowFlyerModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"#FFFCF5", borderRadius:22, width:"100%", maxWidth:480, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(20,10,4,0.3)" }}
          >
            {/* Modal header */}
            <div style={{ padding:"22px 22px 16px", borderBottom:"1px solid rgba(196,122,46,0.12)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.13em", color:"#C47A2E", textTransform:"uppercase", marginBottom:5 }}>Optional</div>
                  <div style={{ fontFamily:serif, fontSize:20, fontWeight:400, color:"#2C1A0E", lineHeight:1.25 }}>Invitation Flyer</div>
                  <div style={{ fontSize:12, fontWeight:400, color:"#9B7450", marginTop:4 }}>Fill this in and we'll design a flyer for your event</div>
                </div>
                <button
                  onClick={handleFlyerSkip}
                  style={{ background:"none", border:"1.5px solid rgba(196,122,46,0.3)", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:500, color:"#9B7450", cursor:"pointer", flexShrink:0, fontFamily:font, marginTop:2 }}
                >Skip →</button>
              </div>
            </div>

            {/* Form fields — scrollable */}
            <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:13, overflowY:"auto", flex:1 }}>
              {FLYER_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:11, fontWeight:500, color:"#6B4226", display:"block", marginBottom:4 }}>
                    {f.label}{f.required && <span style={{ color:"#C47A2E" }}> *</span>}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={flyerData[f.key]}
                    onChange={e => setFlyerData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:9, border:"1.5px solid rgba(196,122,46,0.22)", background:"#FFF8EE", fontSize:13, fontFamily:font, color:"#2C1A0E", outline:"none" }}
                    onFocus={e => e.target.style.borderColor = "#C47A2E"}
                    onBlur={e => e.target.style.borderColor = "rgba(196,122,46,0.22)"}
                  />
                </div>
              ))}
            </div>

            {/* Footer — pinned */}
            <div style={{ padding:"12px 22px calc(16px + env(safe-area-inset-bottom,0px))", display:"flex", flexDirection:"column", gap:8, borderTop:"1px solid rgba(196,122,46,0.1)", flexShrink:0 }}>
              <button
                onClick={handleFlyerSubmit}
                disabled={!requiredFilled}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background: requiredFilled ? "linear-gradient(135deg,#25D366,#128C7E)" : "rgba(196,122,46,0.14)", color: requiredFilled ? "#fff" : "#C4A882", fontSize:14, fontWeight:600, fontFamily:font, cursor: requiredFilled ? "pointer" : "default" }}
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
