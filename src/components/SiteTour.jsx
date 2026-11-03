import { useCallback, useState, useEffect } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useTour } from "../context/TourContext";

const GOLD = "#C47A2E";
const GOLD_LIGHT = "#E8A84A";
const font = "'Outfit', sans-serif";

// Only what's visible on the landing page — other pages have their own tours.
// Desktop and mobile get different target selectors because the desktop nav
// (search bar + Browse/Booking/Tools dropdowns) is `display:none` under the
// 768px breakpoint (see Navbar.jsx) — pointing a mobile run at those desktop-only
// selectors meant Joyride couldn't find the target and silently skipped straight
// from step 2 to the final step. Mobile points at the equivalents that are
// actually in the DOM there: the mobile search pill and the bottom-nav tabs.
const WELCOME_STEP = {
  target: "body",
  placement: "center",
  disableBeacon: true,
  title: "Welcome to Tendr 🎉",
  content: "Plan your event, find verified vendors, and book everything across Delhi NCR — all in one place. Here's a quick look at what's here.",
};

const HERO_CTAS_STEP = {
  target: '[data-tour="hero-ctas"]',
  // "top" (not "bottom") keeps the tooltip anchored inside the hero itself —
  // placing it below the CTAs on a short mobile hero pushed the scroll position
  // down far enough that the next section peeked in behind the tooltip.
  placement: "top",
  disableBeacon: true,
  title: "Two ways to start",
  content: '"Book Vendors" lets you browse and filter the full directory. "Plan an Occasion" walks you through a step-by-step flow — pick your occasion, date, budget and we do the rest.',
};

const STEPS_DESKTOP = [
  WELCOME_STEP,
  HERO_CTAS_STEP,
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
    target: '[data-tour="nav-tools"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Event Tools",
    content: "Budget Allocator, Timeline Builder, Guest List, Seating Chart and more — free tools that make event planning manageable.",
  },
];

const STEPS_MOBILE = [
  WELCOME_STEP,
  HERO_CTAS_STEP,
  {
    target: '[data-tour="mob-search"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Search anything 🔍",
    content: 'Type naturally — "photographer under ₹20K in Noida" or "decorator for 150 guests". Finds vendors, navigates to tools, understands budgets and locations.',
  },
  {
    target: '[data-tour="mob-nav-book vendors"]',
    placement: "top",
    disableBeacon: true,
    title: "Browse Vendors",
    content: "Decorators, Caterers, Photographers, DJs — filter by location, budget, guest count and ratings. Tap here any time to open the full directory.",
  },
  {
    target: '[data-tour="mob-nav-tools"]',
    placement: "top",
    disableBeacon: true,
    title: "Event Tools",
    content: "Budget Allocator, Timeline Builder, Guest List, Seating Chart and more — free tools that make event planning manageable.",
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
  return (
    <div
      {...tooltipProps}
      style={{
        background: "#FFFCF5",
        borderRadius: 18,
        maxWidth: "min(360px, calc(100vw - 32px))",
        width: "min(340px, calc(100vw - 32px))",
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

// `steps` (optional): { desktop: [...], mobile: [...] } to run a different tour
// than the homepage default (e.g. HomeTourFlow's mobile/tablet-only tour) while
// reusing all of this component's Joyride wiring and tooltip styling. Omitted
// entirely by the existing global caller (FirstTimeExperience), which keeps
// getting the original STEPS_DESKTOP/STEPS_MOBILE — zero behavior change there.
export default function SiteTour({ onDone, steps: stepsOverride } = {}) {
  const { tourActive, endTour } = useTour();
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const steps = stepsOverride
    ? (isMobile ? stepsOverride.mobile : stepsOverride.desktop)
    : (isMobile ? STEPS_MOBILE : STEPS_DESKTOP);

  // react-joyride only honors a step's disableBeacon on a genuine false->true
  // transition of `run` — mounting already-run=true (which happens here since
  // tourActive flips true in the same commit that mounts this component)
  // makes it show the beacon on step 1 regardless of disableBeacon. Mount
  // paused, then flip true a tick later so the transition is real.
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!tourActive) { setRun(false); return; }
    const t = setTimeout(() => setRun(true), 0);
    return () => clearTimeout(t);
  }, [tourActive]);

  // Belt-and-suspenders for a known react-joyride quirk: even with the above
  // fix, the very first step can still render its click-to-open beacon
  // instead of the tooltip directly (a long-standing library issue — clicking
  // the beacon itself always correctly reveals the tooltip, confirming
  // disableBeacon is otherwise honored). Auto-click it the moment it appears
  // so the product behavior matches disableBeacon's intent on every step.
  useEffect(() => {
    if (!run) return;
    let tries = 0;
    const id = setInterval(() => {
      const beacon = document.querySelector(".react-joyride__beacon");
      if (beacon) { beacon.click(); clearInterval(id); }
      else if (++tries > 20) clearInterval(id); // ~2s, give up quietly
    }, 100);
    return () => clearInterval(id);
  }, [run]);

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
      steps={steps}
      run={run}
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
