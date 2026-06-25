import { useState, useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";

const TOUR_PREFIX = "tendr_tour_";

export const resetAllPageTours = () => {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(TOUR_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
};

const GOLD = "#C47A2E";
const CREAM = "#FFFCF7";
const DARK = "#2C1A0E";
const MUTED = "#9B7450";
const font = "'Outfit', sans-serif";

function TourTooltip({ index, step, backProps, closeProps, primaryProps, tooltipProps, size }) {
  return (
    <div
      {...tooltipProps}
      style={{
        background: CREAM,
        borderRadius: 18,
        padding: "24px 26px 20px",
        maxWidth: 380,
        boxShadow: "0 20px 60px rgba(44,26,14,0.2), 0 0 0 2px rgba(196,122,46,0.18)",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${GOLD}, #CCAB4A, ${GOLD})` }} />

      <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 9 }}>
        {index + 1} / {size}
      </div>

      {step.title && (
        <div style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 8, lineHeight: 1.3 }}>
          {step.title}
        </div>
      )}

      <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "#5C3D1E" }}>
        {step.content}
      </div>

      <div style={{ display: "flex", gap: 4, marginTop: 16, marginBottom: 12, flexWrap: "wrap" }}>
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 16 : 5,
              height: 5,
              borderRadius: 100,
              background: i === index ? GOLD : "rgba(196,122,46,0.25)",
              transition: "all 0.25s",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          {...closeProps}
          style={{ background: "none", border: "none", fontSize: 12, color: MUTED, cursor: "pointer", padding: "3px 0", fontFamily: font, fontWeight: 600 }}
        >
          Skip
        </button>
        <div style={{ display: "flex", gap: 7 }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid rgba(196,122,46,0.35)`, background: "transparent", fontSize: 12.5, fontWeight: 700, color: GOLD, cursor: "pointer", fontFamily: font }}
            >
              ← Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{ padding: "7px 18px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${GOLD}, #CCAB4A)`, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 12px rgba(196,122,46,0.35)" }}
          >
            {index === size - 1 ? "Got it! ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PageTour({ pageKey, steps, condition = true }) {
  const storageKey = TOUR_PREFIX + pageKey;
  const [run, setRun] = useState(() => condition && !localStorage.getItem(storageKey));

  const handleCallback = useCallback(
    (data) => {
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
        localStorage.setItem(storageKey, "1");
        setRun(false);
      }
    },
    [storageKey]
  );

  if (!run || !condition) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      continuous
      scrollToFirstStep
      showSkipButton
      disableOverlayClose
      disableScrolling={false}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: GOLD,
          arrowColor: CREAM,
        },
        overlay: { backgroundColor: "rgba(28, 10, 0, 0.45)" },
        spotlight: { borderRadius: 12 },
      }}
    />
  );
}
