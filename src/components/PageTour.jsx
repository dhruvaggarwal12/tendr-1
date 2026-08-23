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
  const progress = ((index + 1) / size) * 100;

  return (
    <div
      {...tooltipProps}
      style={{
        background: "#0E0700",
        border: "1px solid rgba(196,122,46,0.15)",
        borderRadius: 10,
        maxWidth: 288,
        width: 288,
        boxShadow: "0 24px 56px rgba(0,0,0,0.72)",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      {/* Progress bar — thin, no gradient */}
      <div style={{ height: 2, background: "rgba(196,122,46,0.08)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "#C47A2E", transition: "width 0.4s ease" }} />
      </div>

      <div style={{ padding: "16px 18px 15px" }}>
        {/* Step counter — minimal, no uppercase */}
        <div style={{ fontSize: 10, fontWeight: 400, color: "rgba(196,122,46,0.45)", marginBottom: 11, letterSpacing: "0.04em" }}>
          {index + 1} / {size}
        </div>

        {/* Title — serif, light weight */}
        {step.title && (
          <div style={{ fontFamily: serifFont, fontSize: 19, fontWeight: 400, color: "#FFF8EC", marginBottom: 8, lineHeight: 1.2 }}>
            {step.title}
          </div>
        )}

        {/* Content */}
        <div style={{ fontSize: 12, color: "rgba(255,238,208,0.48)", lineHeight: 1.7, marginBottom: 16 }}>
          {step.content}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button {...closeProps} style={{ background: "none", border: "none", fontSize: 11, color: "rgba(255,238,208,0.18)", cursor: "pointer", padding: 0, fontFamily: font }}>
            skip
          </button>
          <button {...primaryProps} style={{ padding: "7px 19px", borderRadius: 6, border: "none", background: "#C47A2E", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            {index === size - 1 ? "Done" : "Continue"}
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
