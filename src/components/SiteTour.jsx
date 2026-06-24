import { useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useTour } from "../context/TourContext";

const GOLD = "#C47A2E";
const CREAM = "#FFFCF7";
const DARK = "#2C1A0E";
const MUTED = "#9B7450";
const font = "'Outfit', sans-serif";

const STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Tendr! 🎉",
    content:
      "India's smartest event vendor platform. This quick tour covers everything — search, compare, chat, plan, and the documents you get after booking.",
  },
  {
    target: '[data-tour="search-bar"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Smart Search",
    content:
      "Type naturally — \"photographer under ₹20K in Noida\", \"decorator for 150 guests\". The search understands vendor types, budgets, and locations automatically and filters results for you.",
  },
  {
    target: '[data-tour="nav-browse"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Browse & Top Rated",
    content:
      "Browse vendors by category — Decorators, Caterers, Photographers, DJs. Filter by location, budget, guest count, ratings, and availability. Top Rated shows only our highest-reviewed vendors.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Quick View & Compare",
    content:
      "Click any vendor card to open Quick View — photos, packages, pricing, and reviews without leaving the page. Add up to 3 vendors to Compare to see them side-by-side across every attribute.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Chat & Availability Check",
    content:
      "Hit Chat on any vendor card to begin booking. Fill in your event details — we automatically check if the vendor is available on your date. If they're booked, we show you alternatives instantly.",
  },
  {
    target: '[data-tour="nav-booking"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Planning Wizard",
    content:
      "Plan your whole event in one flow — choose You Do It (you pick each vendor) or Smart Plan (we pick the best combination within your total budget across Decorator, Caterer, Photographer, and DJ).",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Tools: Budget, Timeline & Decor",
    content:
      "The Tools menu has a Budget Allocator (split your budget across vendor categories), a Day-of Timeline builder, and a Decor Finder to explore decoration styles and themes.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "After Booking — 4 Documents",
    content:
      "Once payment is confirmed, instantly download: Invoice, Event Details PDF, Day-of Timeline slip, and a personalised Invitation Flyer with your event type, date, venue, time, and guest's name.",
  },
  {
    target: '[data-tour="profile-btn"]',
    placement: "bottom-end",
    disableBeacon: true,
    title: "Active Chats & Profile",
    content:
      "All vendor conversations, booking statuses, and pinned messages live here. The badge shows pending requests or admin actions. That's the full Tendr experience! 🎊",
  },
];

function TourTooltip({ continuous, index, step, backProps, closeProps, primaryProps, tooltipProps, size }) {
  return (
    <div
      {...tooltipProps}
      style={{
        background: CREAM,
        borderRadius: 18,
        padding: "26px 28px 22px",
        maxWidth: 380,
        boxShadow: "0 20px 60px rgba(44,26,14,0.2), 0 0 0 2px rgba(196,122,46,0.18)",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gold top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${GOLD}, #CCAB4A, ${GOLD})` }} />

      <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
        Step {index + 1} of {size}
      </div>

      {step.title && (
        <div style={{ fontSize: 17, fontWeight: 800, color: DARK, marginBottom: 10, lineHeight: 1.3 }}>
          {step.title}
        </div>
      )}

      <div style={{ fontSize: 14, lineHeight: 1.7, color: "#5C3D1E" }}>
        {step.content}
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 5, marginTop: 18, marginBottom: 14 }}>
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 18 : 6,
              height: 6,
              borderRadius: 100,
              background: i === index ? GOLD : "rgba(196,122,46,0.25)",
              transition: "all 0.25s",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <button
          {...closeProps}
          style={{ background: "none", border: "none", fontSize: 12.5, color: MUTED, cursor: "pointer", padding: "4px 0", fontFamily: font, fontWeight: 600 }}
        >
          Skip tour
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{ padding: "7px 16px", borderRadius: 9, border: `1.5px solid rgba(196,122,46,0.35)`, background: "transparent", fontSize: 13, fontWeight: 700, color: GOLD, cursor: "pointer", fontFamily: font }}
            >
              ← Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${GOLD}, #CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
          >
            {index === size - 1 ? "Done! 🎊" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiteTour() {
  const { tourActive, endTour } = useTour();

  const handleCallback = useCallback(
    (data) => {
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
        endTour();
      }
    },
    [endTour]
  );

  if (!tourActive) return null;

  return (
    <Joyride
      steps={STEPS}
      run={tourActive}
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      continuous
      scrollToFirstStep
      showSkipButton
      disableOverlayClose
      floaterProps={{ disableAnimation: false }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: GOLD,
          arrowColor: CREAM,
        },
        overlay: { backgroundColor: "rgba(28, 10, 0, 0.52)" },
        spotlight: { borderRadius: 14 },
      }}
    />
  );
}
