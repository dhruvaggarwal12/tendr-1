import { useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useTour } from "../context/TourContext";

const GOLD = "#C47A2E";
const GOLD_LIGHT = "#E8A84A";
const font = "'Outfit', sans-serif";

// Only what's visible on the landing page — other pages have their own tours
const STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Tendr 🎉",
    content: "Plan your event, find verified vendors, and book everything across Delhi NCR — all in one place. Here's a quick look at what's on this page.",
  },
  {
    target: '[data-tour="search-bar"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Search anything 🔍",
    content: 'Type naturally — "photographer under ₹20K in Noida" or "decorator for 150 guests". It finds vendors, navigates to tools, and understands budgets and locations.',
  },
  {
    target: '[data-tour="nav-browse"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Browse Vendors",
    content: "Decorators, Caterers, Photographers, DJs — filter by location, budget, guest count and ratings. Top Rated shows only our highest-reviewed vendors.",
  },
  {
    target: '[data-tour="nav-booking"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Plan Your Event",
    content: "Pick vendors one by one, or let Smart Plan pick the best combination within your total budget automatically. Two modes, same great result.",
  },
  {
    target: '[data-tour="nav-tools"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Event Tools",
    content: "Budget Allocator, Timeline Builder, Guest List, Seating Chart and more — free tools that make event planning actually manageable.",
  },
];

function TourTooltip({ continuous, index, step, backProps, closeProps, primaryProps, tooltipProps, size }) {
  const isLast = index === size - 1;
  return (
    <div
      {...tooltipProps}
      style={{
        background: "#FFFCF5",
        borderRadius: 18,
        maxWidth: 360,
        width: 340,
        boxShadow: "0 20px 60px rgba(28,9,0,0.14), 0 0 0 1.5px rgba(196,122,46,0.18)",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      {/* Gold progress bar */}
      <div style={{ height: 3, background: "rgba(196,122,46,0.1)" }}>
        <div style={{
          height: "100%",
          width: `${Math.round(((index + 1) / size) * 100)}%`,
          background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
          transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      <div style={{ padding: "16px 20px 18px" }}>
        {/* Step badge + dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
            color: "#fff", fontWeight: 800, fontSize: 10,
            padding: "3px 10px", borderRadius: 100, letterSpacing: "0.07em",
          }}>
            {index + 1} / {size}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: size }).map((_, i) => (
              <div key={i} style={{
                width: i === index ? 18 : 5, height: 4, borderRadius: 100,
                background: i < index ? `${GOLD}55` : i === index ? GOLD : "rgba(196,122,46,0.15)",
                transition: "all 0.25s",
              }} />
            ))}
          </div>
        </div>

        {step.title && (
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1C0900", marginBottom: 8, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            {step.title}
          </div>
        )}

        <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "#5A3520" }}>
          {step.content}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, gap: 10 }}>
          <button
            {...closeProps}
            style={{
              background: "none", border: "none", fontSize: 12,
              color: "rgba(90,53,32,0.4)", cursor: "pointer",
              fontFamily: font, fontWeight: 600, padding: 0,
            }}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {index > 0 && (
              <button
                {...backProps}
                style={{
                  padding: "8px 14px", borderRadius: 10,
                  border: "1.5px solid rgba(196,122,46,0.3)",
                  background: "rgba(196,122,46,0.06)",
                  fontSize: 13, fontWeight: 700,
                  color: GOLD, cursor: "pointer", fontFamily: font,
                }}
              >
                ←
              </button>
            )}
            <button
              {...primaryProps}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                color: "#fff", fontSize: 13.5, fontWeight: 800,
                cursor: "pointer", fontFamily: font,
                boxShadow: "0 4px 16px rgba(196,122,46,0.38)",
                letterSpacing: "0.01em",
              }}
            >
              {isLast ? "Let's go →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteTour({ onDone } = {}) {
  const { tourActive, endTour } = useTour();

  const handleCallback = useCallback(
    (data) => {
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
        endTour();
        onDone?.();
      }
    },
    [endTour, onDone]
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
          arrowColor: "#FFFCF5",
        },
        overlay: { backgroundColor: "rgba(28, 9, 0, 0.38)" },
        spotlight: { borderRadius: 12 },
      }}
    />
  );
}
