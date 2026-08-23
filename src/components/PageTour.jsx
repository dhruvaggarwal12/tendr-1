import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { Joyride, STATUS, ACTIONS, EVENTS } from "react-joyride";

const TOUR_PREFIX = "tendr_tour_";
const _seen = new Set();

const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export const resetAllPageTours = () => {
  _seen.clear();
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(TOUR_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
};

const font      = "'Outfit', sans-serif";
const serifFont = "'Cormorant Garamond', Georgia, serif";

function TourTooltip({ index, step, closeProps, primaryProps, tooltipProps, size }) {
  const dots = Array.from({ length: size });
  const isLast = index === size - 1;

  return (
    <div
      {...tooltipProps}
      style={{
        background: "#FFFCF5",
        borderRadius: 11,
        width: 288,
        maxWidth: 288,
        boxShadow: "0 10px 48px rgba(44,26,14,0.13), 0 2px 8px rgba(44,26,14,0.06)",
        fontFamily: font,
        overflow: "hidden",
        borderLeft: "3.5px solid #C47A2E",
        position: "relative",
      }}
    >
      <div style={{ padding: "18px 18px 16px", position: "relative" }}>
        {/* Ghost step number — very faint, editorial background texture */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 10,
            right: 14,
            fontFamily: serifFont,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1,
            color: "rgba(196,122,46,0.07)",
            userSelect: "none",
            pointerEvents: "none",
            letterSpacing: "-0.04em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Close × */}
        <button
          {...closeProps}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(44,26,14,0.22)",
            fontSize: 20,
            lineHeight: 1,
            padding: "0 2px",
            fontFamily: font,
            fontWeight: 300,
          }}
        >
          ×
        </button>

        {/* Title */}
        {step.title && (
          <div
            style={{
              fontFamily: serifFont,
              fontSize: 21,
              fontWeight: 400,
              lineHeight: 1.22,
              color: "#2C1A0E",
              marginBottom: 9,
              paddingRight: 26,
              textWrap: "balance",
            }}
          >
            {step.title}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.72,
            color: "rgba(44,26,14,0.58)",
            marginBottom: 16,
          }}
        >
          {step.content}
        </div>

        {/* Footer: dots + action */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Expanding pill dots */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {dots.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 4,
                  width: i === index ? 16 : 4,
                  borderRadius: 100,
                  background: i === index ? "#C47A2E" : "rgba(44,26,14,0.14)",
                  transition: "width 0.25s ease, background 0.25s ease",
                }}
              />
            ))}
          </div>

          {/* Next / Done */}
          <button
            {...primaryProps}
            style={{
              padding: "7px 17px",
              borderRadius: 7,
              border: "1.5px solid #C47A2E",
              background: isLast ? "#C47A2E" : "transparent",
              color: isLast ? "#FFFCF5" : "#C47A2E",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: font,
              letterSpacing: "0.01em",
            }}
          >
            {isLast ? "Done" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PageTour({ pageKey, steps, condition = true, onDone }) {
  const storageKey = TOUR_PREFIX + pageKey;
  const alreadySeen = () => _seen.has(storageKey) || !!lsGet(storageKey);
  const [run, setRun] = useState(() => condition && !alreadySeen());

  useLayoutEffect(() => {
    if (run) { lsSet(storageKey, "1"); _seen.add(storageKey); }
  }, [run, storageKey]);

  useEffect(() => {
    if (condition && !alreadySeen()) setRun(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  const markDone = useCallback(() => {
    lsSet(storageKey, "1");
    _seen.add(storageKey);
    setRun(false);
    onDone?.();
    try {
      setTimeout(() => {
        document.querySelectorAll('[class*="joyride-beacon"]').forEach(el => el.remove());
        document.querySelectorAll('[class*="__floater"]').forEach(el => el.remove());
      }, 50);
    } catch {}
  }, [storageKey, onDone]);

  const handleCallback = useCallback(({ status, action, type }) => {
    const done =
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      type === EVENTS.TARGET_NOT_FOUND ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.SKIP;
    if (done) markDone();
  }, [markDone]);

  if (!run || !condition) return null;

  const safeSteps = steps.map((s) => ({ ...s, disableBeacon: true }));

  return (
    <>
      <style>{`.react-joyride__beacon { display: none !important; }`}</style>
      <Joyride
        steps={safeSteps}
        run={run}
        disableBeacon
        callback={handleCallback}
        tooltipComponent={TourTooltip}
        continuous
        scrollToFirstStep
        showSkipButton
        disableOverlayClose={false}
        disableScrolling={false}
        spotlightClicks={false}
        styles={{
          options: { zIndex: 10000, primaryColor: "#C47A2E", arrowColor: "#FFFCF5" },
          overlay: { backgroundColor: "rgba(44,26,14,0.45)" },
          spotlight: { borderRadius: 12, boxShadow: "0 0 0 2px rgba(196,122,46,0.28)" },
        }}
      />
    </>
  );
}
