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
        background: "#1C0900",
        borderRadius: 18,
        padding: "22px 22px 18px",
        maxWidth: 290,
        width: 290,
        boxShadow: "0 24px 56px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(200,155,60,0.2)",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(200,155,60,0.12)" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg,#C89B3C,#EDBD5A)",
          transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
          borderRadius: "0 3px 3px 0",
        }} />
      </div>

      {/* Counter */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#C89B3C", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
        {index + 1} / {size}
      </div>

      {/* Title */}
      {step.title && (
        <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF8EC", marginBottom: 7, lineHeight: 1.3 }}>
          {step.title}
        </div>
      )}

      {/* Content */}
      <div style={{ fontSize: 13, color: "rgba(255,248,236,0.6)", lineHeight: 1.6, marginBottom: 18 }}>
        {step.content}
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {Array.from({ length: size }).map((_, i) => (
          <div key={i} style={{
            width: i === index ? 16 : 5,
            height: 5,
            borderRadius: 100,
            background: i === index ? "#C89B3C" : "rgba(200,155,60,0.2)",
            transition: "all 0.25s",
          }} />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          {...closeProps}
          style={{ background: "none", border: "none", fontSize: 12, color: "rgba(255,248,236,0.3)", cursor: "pointer", padding: 0, fontFamily: font, fontWeight: 600 }}
        >
          Skip
        </button>
        <button
          {...primaryProps}
          style={{
            padding: "8px 18px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#C89B3C,#EDBD5A)",
            color: "#1C0900",
            fontSize: 12.5,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: font,
            boxShadow: "0 3px 10px rgba(200,155,60,0.35)",
          }}
        >
          {index === size - 1 ? "Got it ✓" : "Next →"}
        </button>
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
          options: { zIndex: 10000, primaryColor: "#C89B3C", arrowColor: "#1C0900" },
          overlay: { backgroundColor: "rgba(14,6,0,0.55)" },
          spotlight: { borderRadius: 14, boxShadow: "0 0 0 2px rgba(200,155,60,0.35)" },
        }}
      />
    </>
  );
}
