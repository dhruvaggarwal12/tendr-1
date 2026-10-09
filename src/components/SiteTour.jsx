import { useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useTour } from "../context/TourContext";

const GOLD = "#C47A2E";
const GOLD_LIGHT = "#E8A84A";
const font = "'Outfit', sans-serif";

const FEATURES = [
  { emoji: "💌", label: "Wedding Stationeries" },
  { emoji: "🎁", label: "Gift Hampers" },
  { emoji: "🎊", label: "Fun Activities" },
  { emoji: "🏛️", label: "Party Places" },
  { emoji: "✨", label: "Occasions" },
  { emoji: "📸", label: "Community Wall" },
  { emoji: "🎞️", label: "Memories" },
  { emoji: "📄", label: "Event Documents" },
  { emoji: "🏠", label: "Your Dashboard" },
];

// Only what's visible on the landing page — other pages have their own tours
const STEPS = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Tendr 🎉",
    content: "Plan your event, find verified vendors, and book everything across Delhi NCR — all in one place. Here's a quick look at what's here.",
  },
  {
    target: '[data-tour="hero-ctas"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Two ways to start",
    content: '"Book Vendors" lets you browse and filter the full directory. "Plan an Occasion" walks you through a step-by-step flow — pick your occasion, date, budget and we do the rest.',
  },
  {
    target: '[data-tour="search-bar"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Search anything 🔍",
    content: 'Type naturally — "photographer under ₹20K in Noida" or "decorator for 150 guests". Finds vendors, navigates to tools, understands budgets and locations.',
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
    content: "Pick vendors one by one, or let Smart Plan pick the best combo within your total budget automatically.",
  },
  {
    target: '[data-tour="nav-tools"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Event Tools",
    content: "Budget Allocator, Timeline Builder, Guest List, Seating Chart and more — free tools that make event planning manageable.",
  },
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "And there's a lot more…",
    content: "__FEATURES__",
  },
];

function TourTooltip({ index, step, backProps, skipProps, primaryProps, tooltipProps, size, onFinish }) {
  const isLast = index === size - 1;
  // Belt-and-suspenders: in addition to onEvent's STATUS.FINISHED/SKIPPED detection,
  // call onFinish directly from the buttons that end the tour, so a library-side
  // quirk in status propagation can't leave the app stuck thinking the tour is
  // still active (which was blocking clicks sitewide — see SiteTour fix history).
  const handlePrimaryClick = (e) => {
    primaryProps.onClick(e);
    if (isLast) onFinish?.();
  };
  const handleSkipClick = (e) => {
    skipProps.onClick(e);
    onFinish?.();
  };
  const isFeaturesStep = step.content === "__FEATURES__";
  return (
    <div
      {...tooltipProps}
      style={{
        background: "#FFFCF5",
        borderRadius: 18,
        maxWidth: isFeaturesStep ? 440 : 360,
        width: isFeaturesStep ? 420 : 340,
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
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1C0900", marginBottom: isFeaturesStep ? 14 : 8, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            {step.title}
          </div>
        )}

        {isFeaturesStep ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {FEATURES.map(({ emoji, label }) => (
              <div key={label} style={{
                background: "#fff",
                border: "1.5px solid rgba(196,122,46,0.14)",
                borderRadius: 12,
                padding: "10px 8px",
                textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#3A1E0A", lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "#5A3520" }}>
            {step.content}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, gap: 10 }}>
          <button
            {...skipProps}
            onClick={handleSkipClick}
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
              onClick={handlePrimaryClick}
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

  const finishTour = useCallback(() => {
    endTour();
    onDone?.();
  }, [endTour, onDone]);

  const handleCallback = useCallback(
    (data) => {
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
        finishTour();
      }
    },
    [finishTour]
  );

  const tooltipComponent = useCallback(
    (props) => <TourTooltip {...props} onFinish={finishTour} />,
    [finishTour]
  );

  if (!tourActive) return null;

  return (
    <Joyride
      steps={STEPS}
      run={tourActive}
      onEvent={handleCallback}
      tooltipComponent={tooltipComponent}
      continuous
      scrollToFirstStep
      options={{
        hideOverlay: true,
        zIndex: 10000,
        primaryColor: GOLD,
        arrowColor: "#FFFCF5",
      }}
    />
  );
}
