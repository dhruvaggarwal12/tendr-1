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

const font = "'Outfit', sans-serif";

function TourTooltip({ index, step, closeProps, primaryProps, tooltipProps, size }) {
  const progress = ((index + 1) / size) * 100;

  return (
    <div
      {...tooltipProps}
      style={{
        background: "linear-gradient(150deg, #1E0E03 0%, #110700 100%)",
        border: "1px solid rgba(196,122,46,0.22)",
        borderRadius: 15,
        maxWidth: 295,
        width: 295,
        boxShadow: "0 28px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(196,122,46,0.1)",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      {/* Progress bar */}
      <div style={{ height: 2.5, background: "rgba(196,122,46,0.1)" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "#C47A2E",
          transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>

      <div style={{ padding: "18px 20px 16px" }}>
        {/* Counter + dots row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.18em" }}>
            {index + 1} of {size}
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {Array.from({ length: size }).map((_, i) => (
              <div key={i} style={{
                width: i === index ? 14 : 4,
                height: 4,
                borderRadius: 100,
                background: i < index ? "rgba(196,122,46,0.45)" : i === index ? "#C47A2E" : "rgba(255,255,255,0.1)",
                transition: "all 0.25s",
              }} />
            ))}
          </div>
        </div>

        {/* Title */}
        {step.title && (
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "#FFF8EC", marginBottom: 8, lineHeight: 1.28 }}>
            {step.title}
          </div>
        )}

        {/* Content */}
        <div style={{ fontSize: 12.5, color: "rgba(255,240,215,0.52)", lineHeight: 1.68, marginBottom: 18 }}>
          {step.content}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            {...closeProps}
            style={{ background: "none", border: "none", fontSize: 11.5, color: "rgba(255,240,215,0.22)", cursor: "pointer", padding: 0, fontFamily: font, fontWeight: 600 }}
          >
            Skip tour
          </button>
          <button
            {...primaryProps}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: "#C47A2E",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: font,
              letterSpacing: "0.01em",
            }}
          >
            {index === size - 1 ? "Got it" : "Next →"}
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
          options: { zIndex: 10000, primaryColor: "#C47A2E", arrowColor: "#1E0E03" },
          overlay: { backgroundColor: "rgba(14,6,0,0.55)" },
          spotlight: { borderRadius: 14, boxShadow: "0 0 0 2px rgba(200,155,60,0.35)" },
        }}
      />
    </>
  );
}
