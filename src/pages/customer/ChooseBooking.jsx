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

const FLOWS = [
  {
    type: "you-do-it",
    emoji: "🔍",
    title: "You Do It",
    subtitle: "Browse vendors, compare profiles, book at your own pace",
    steps: [
      "Fill event details (takes 2 minutes)",
      "Browse & compare vendors by category",
      "Chat directly to confirm price & details",
      "Finalise vendors & pay",
    ],
    cta: "Start Browsing Vendors",
    accentColor: "#C47A2E",
    bgAccent: "rgba(196,122,46,0.06)",
    borderColor: "rgba(196,122,46,0.25)",
    route: null,
  },
  {
    type: "let-us-do-it",
    emoji: "✨",
    title: "Smart Planner",
    subtitle: "Tell us once. We build your complete vendor package.",
    steps: [
      "Fill event details (takes 2 minutes)",
      "Set your budget per service category",
      "Get a complete vendor package instantly",
      "Confirm & our team coordinates for you",
    ],
    cta: "Build My Package",
    accentColor: "#7A4A1E",
    bgAccent: "rgba(122,74,30,0.05)",
    borderColor: "rgba(122,74,30,0.18)",
    route: null,
  },
  {
    type: "baat-karo",
    emoji: "💬",
    title: "Baat Karo",
    subtitle: "Bas likh do — Tendr Team yahin app mein reply karegi",
    steps: [
      "Apni requirements likh do",
      "Send tap karo",
      "Tendr team 2 ghante mein reply karegi",
      "Hum sab handle kar lete hain",
    ],
    cta: "Baat Karo",
    accentColor: "#25D366",
    bgAccent: "rgba(37,211,102,0.06)",
    borderColor: "rgba(37,211,102,0.28)",
    route: "/baat-karo",
  },
];

const FLYER_FIELDS = [
  { key: "eventName",    label: "Event name",           placeholder: "e.g. Rahul's 30th Birthday", required: true },
  { key: "hostedBy",    label: "Hosted by",             placeholder: "e.g. Priya & Family", required: true },
  { key: "date",        label: "Date",                  placeholder: "e.g. 20th July 2026", required: true, type: "text" },
  { key: "time",        label: "Time",                  placeholder: "e.g. 7:00 PM onwards", required: true },
  { key: "venue",       label: "Venue / Location",      placeholder: "e.g. The Grand Ballroom, Mumbai", required: true },
  { key: "rsvp",        label: "RSVP contact",          placeholder: "Phone number or email", required: false },
  { key: "dressCode",   label: "Dress code (optional)", placeholder: "e.g. Cocktail attire, White theme", required: false },
  { key: "tagline",     label: "Special message (optional)", placeholder: "e.g. Join us for a night to remember!", required: false },
];

const emptyFlyer = Object.fromEntries(FLYER_FIELDS.map(f => [f.key, ""]));

export default function ChooseBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [flyerData, setFlyerData] = useState(emptyFlyer);

  const handleChoose = (type, route) => {
    if (type === "baat-karo") {
      setShowFlyerModal(true);
      return;
    }
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

  const CHOOSE_BOOKING_STEPS = [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "How would you like to plan?",
      content: "You Do It: you browse vendors yourself and chat with each one to finalise. Smart Plan: fill in your budget and guest count once — Tendr picks the best Decorator, Caterer, Photographer, and DJ combination for you.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", fontFamily: font }}>
      <PageTour pageKey="choose-booking" steps={CHOOSE_BOOKING_STEPS} />
      <SEO title="Plan an Event" description="Start planning your perfect event. Choose how you want to work — browse and book vendors yourself or let Tendr handle everything for you." path="/booking" />
      <HamburgerNav />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 80px" }}>
      <BasicSpeedDial />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2 }}>
          How would you like to plan?
        </h1>
        <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>
          Both start with the same quick form. Choose how involved you want to be.
        </p>
      </div>

      {/* Flow cards */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, width: "100%", maxWidth: 980 }}
        className="choose-booking-grid"
      >
        {FLOWS.map((flow) => (
          <div
            key={flow.type}
            className="choose-booking-card"
            style={{
              background: "#FFFCF5",
              border: "2px solid " + flow.borderColor,
              borderRadius: 16,
              padding: "16px 14px 12px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 12px rgba(139,69,19,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(139,69,19,0.14)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(139,69,19,0.08)"; }}
          >
            {/* Icon + title */}
            <div style={{ marginBottom: 8 }}>
              <div className="cbcard-icon" style={{ width: 32, height: 32, borderRadius: 10, background: flow.bgAccent, border: "1.5px solid " + flow.borderColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 7 }}>
                {flow.emoji}
              </div>
              <h2 className="cbcard-title" style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
                {flow.title}
              </h2>
              <p className="cbcard-subtitle" style={{ fontSize: 12, fontWeight: 600, color: flow.accentColor, margin: 0 }}>
                {flow.subtitle}
              </p>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, flex: 1, marginTop: 12 }}>
              {flow.steps.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span className="cbcard-step-num" style={{ width: 20, height: 20, borderRadius: "50%", background: flow.bgAccent, border: "2px solid " + flow.borderColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: flow.accentColor, flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </span>
                  <span className="cbcard-step-text" style={{ fontSize: 12, color: "#2C1A0E", fontWeight: 600, lineHeight: 1.4 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleChoose(flow.type, flow.route)}
              className="cbcard-cta"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                border: "none",
                background: flow.type === "baat-karo"
                  ? "linear-gradient(135deg,#25D366,#128C7E)"
                  : "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: font,
                cursor: "pointer",
                boxShadow: flow.type === "baat-karo"
                  ? "0 4px 14px rgba(37,211,102,0.32)"
                  : "0 4px 14px rgba(196,122,46,0.32)",
                transition: "opacity 0.18s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {flow.cta} →
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 28, fontSize: 13, color: "#9B7450", textAlign: "center" }}>
        Pehle do options ek hi form se shuru hote hain — aap baad mein bhi switch kar sakte hain.
      </p>

      <style>{`
        @media (max-width: 760px) {
          .choose-booking-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 761px) and (max-width: 980px) {
          .choose-booking-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 761px) {
          .choose-booking-grid { max-width: 1140px !important; gap: 20px !important; }
          .choose-booking-card { padding: 26px 22px 20px !important; }
          .cbcard-icon { width: 42px !important; height: 42px !important; font-size: 20px !important; margin-bottom: 10px !important; }
          .cbcard-title { font-size: 19px !important; margin-bottom: 4px !important; }
          .cbcard-subtitle { font-size: 13.5px !important; margin-bottom: 8px !important; }
          .cbcard-step-num { width: 22px !important; height: 22px !important; font-size: 11px !important; }
          .cbcard-step-text { font-size: 13.5px !important; }
          .cbcard-cta { font-size: 15px !important; padding: 13px !important; border-radius: 13px !important; }
        }
      `}</style>
      </div>

      {/* Invitation Flyer Modal — shown before Baat Karo */}
      {showFlyerModal && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(20,10,4,0.6)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setShowFlyerModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"#FFFCF5", borderRadius:22, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(20,10,4,0.3)", display:"flex", flexDirection:"column" }}
          >
            {/* Modal header */}
            <div style={{ padding:"22px 22px 0", borderBottom:"1px solid rgba(196,122,46,0.12)", paddingBottom:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.13em", color:"#C47A2E", textTransform:"uppercase", marginBottom:5 }}>Optional</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#2C1A0E", lineHeight:1.25 }}>Invitation Flyer</div>
                  <div style={{ fontSize:12, color:"#9B7450", marginTop:4 }}>Fill this in and we'll design a flyer for your event</div>
                </div>
                <button
                  onClick={handleFlyerSkip}
                  style={{ background:"none", border:"1.5px solid rgba(196,122,46,0.3)", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:500, color:"#9B7450", cursor:"pointer", flexShrink:0, fontFamily:font, marginTop:2 }}
                >
                  Skip →
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:13 }}>
              {FLYER_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6B4226", display:"block", marginBottom:4 }}>
                    {f.label}{f.required && <span style={{ color:"#C47A2E" }}> *</span>}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={flyerData[f.key]}
                    onChange={e => setFlyerData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:9, border:"1.5px solid rgba(196,122,46,0.25)", background:"#FFF8EE", fontSize:13, fontFamily:font, color:"#2C1A0E", outline:"none" }}
                    onFocus={e => e.target.style.borderColor = "#C47A2E"}
                    onBlur={e => e.target.style.borderColor = "rgba(196,122,46,0.25)"}
                  />
                </div>
              ))}
            </div>

            {/* Footer buttons */}
            <div style={{ padding:"0 22px 22px", display:"flex", flexDirection:"column", gap:8 }}>
              <button
                onClick={handleFlyerSubmit}
                disabled={!requiredFilled}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background: requiredFilled ? "linear-gradient(135deg,#25D366,#128C7E)" : "rgba(196,122,46,0.18)", color: requiredFilled ? "#fff" : "#C4A882", fontSize:14, fontWeight:600, fontFamily:font, cursor: requiredFilled ? "pointer" : "default", transition:"opacity 0.18s" }}
              >
                Save & go to Baat Karo →
              </button>
              <button
                onClick={handleFlyerSkip}
                style={{ width:"100%", padding:"10px", borderRadius:12, border:"1.5px solid rgba(196,122,46,0.25)", background:"transparent", color:"#9B7450", fontSize:13, fontWeight:500, fontFamily:font, cursor:"pointer" }}
              >
                Skip — go to Baat Karo without flyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
