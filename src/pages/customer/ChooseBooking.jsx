import React from "react";
import PageTour from "../../components/PageTour";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setBookingType, resetEventPlanning } from "../../redux/eventPlanningSlice";
import { clearVendorCompare, clearFinalisedVendor } from "../../redux/listingFiltersSlice";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";

const FLOWS = [
  {
    type: "you-do-it",
    emoji: "🔍",
    title: "You Do It",
    subtitle: "Browse vendors, compare profiles, book at your own pace",
    description: "Browse our verified vendors, compare profiles side by side, chat directly with each one, and negotiate your own price — all in one place.",
    bestFor: "People who know what they want and enjoy the process.",
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
  },
  {
    type: "let-us-do-it",
    emoji: "✨",
    title: "Let Us Do It — Smart Planner",
    subtitle: "Tell us once. We build your complete vendor package.",
    description: "Tell us your event details once. We suggest a complete package — one vendor per service, within your budget. You confirm, we coordinate everything.",
    bestFor: "People who want it handled without going back and forth.",
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
  },
];

export default function ChooseBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChoose = (type) => {
    // Don't reset form — preserve session data so returning users keep their details
    dispatch(clearVendorCompare());
    dispatch(clearFinalisedVendor());
    dispatch(setBookingType(type));
    navigate("/plan-event/form?bookingType=" + type);
  };

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
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, width: "100%", maxWidth: 660 }}
        className="choose-booking-grid"
      >
        {FLOWS.map((flow) => (
          <div
            key={flow.type}
            style={{
              background: "#FFFCF5",
              border: "2px solid " + flow.borderColor,
              borderRadius: 16,
              padding: "14px 14px 10px",
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
              <div style={{ width: 32, height: 32, borderRadius: 10, background: flow.bgAccent, border: "1.5px solid " + flow.borderColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 7 }}>
                {flow.emoji}
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
                {flow.title}
              </h2>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: flow.accentColor, margin: 0 }}>
                {flow.subtitle}
              </p>
            </div>

            {/* Steps — 4 points, prominent */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18, flex: 1 }}>
              {flow.steps.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: flow.bgAccent, border: "2px solid " + flow.borderColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: flow.accentColor, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: "#2C1A0E", fontWeight: 600, lineHeight: 1.3 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleChoose(flow.type)}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: font,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(196,122,46,0.32)",
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

      <p style={{ marginTop: 32, fontSize: 13, color: "#9B7450", textAlign: "center" }}>
        Both options start with the same event form — you can always switch later.
      </p>

      <style>{`
        @media (max-width: 640px) {
          .choose-booking-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </div>{/* inner flex column */}
    </div>
  );
}
