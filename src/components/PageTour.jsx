import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { Joyride, STATUS, ACTIONS, EVENTS } from "react-joyride";

const TOUR_PREFIX = "tendr_tour_";

// Session-level cache — persists across re-mounts/re-renders within the same page load
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

const GOLD  = "#C47A2E";
const CREAM = "#FFFCF7";
const DARK  = "#2C1A0E";
const MUTED = "#9B7450";
const font  = "'Outfit', sans-serif";

function TourTooltip({ index, step, backProps, closeProps, primaryProps, tooltipProps, size }) {
  return (
    <div
      {...tooltipProps}
      style={{
        background: CREAM,
        borderRadius: 20,
        padding: "28px 28px 22px",
        maxWidth: 360,
        boxShadow: "0 20px 60px rgba(44,26,14,0.22), 0 0 0 2px rgba(196,122,46,0.18)",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${GOLD},#CCAB4A,${GOLD})` }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
        {index + 1} / {size}
      </div>
      {step.title && (
        <div style={{ fontSize: 19, fontWeight: 900, color: DARK, marginBottom: 10, lineHeight: 1.25 }}>
          {step.title}
        </div>
      )}
      <div style={{ fontSize: 15, lineHeight: 1.65, color: "#5C3D1E" }}>
        {step.content}
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 18, marginBottom: 14 }}>
        {Array.from({ length: size }).map((_, i) => (
          <div key={i} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 100, background: i === index ? GOLD : "rgba(196,122,46,0.25)", transition: "all 0.25s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button {...closeProps} style={{ background: "none", border: "none", fontSize: 13, color: MUTED, cursor: "pointer", padding: "3px 0", fontFamily: font, fontWeight: 600 }}>
          Skip
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {index > 0 && (
            <button {...backProps} style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "transparent", fontSize: 13, fontWeight: 700, color: GOLD, cursor: "pointer", fontFamily: font }}>
              ← Back
            </button>
          )}
          <button {...primaryProps} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 12px rgba(196,122,46,0.35)" }}>
            {index === size - 1 ? "Got it! ✓" : "Next →"}
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

  // Save to localStorage BEFORE browser paints — so if user closes mid-tour it won't repeat
  useLayoutEffect(() => {
    if (run) {
      lsSet(storageKey, "1");
      _seen.add(storageKey);
    }
  }, [run, storageKey]);

  // Handle condition becoming true after initial mount (e.g. data-dependent tours)
  useEffect(() => {
    if (condition && !alreadySeen()) {
      setRun(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  const markDone = useCallback(() => {
    lsSet(storageKey, "1");
    _seen.add(storageKey);
    setRun(false);
    onDone?.();
    // Remove any lingering Joyride beacon/floater elements
    try {
      setTimeout(() => {
        document.querySelectorAll('[class*="joyride-beacon"]').forEach(el => el.remove());
        document.querySelectorAll('[class*="__floater"]').forEach(el => el.remove());
      }, 50);
    } catch {}
  }, [storageKey, onDone]);

  const handleCallback = useCallback(
    ({ status, action, type }) => {
      // STATUS.ERROR does not exist in this version — do NOT check it
      const done =
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        type === EVENTS.TARGET_NOT_FOUND ||
        action === ACTIONS.CLOSE ||
        action === ACTIONS.SKIP;

      if (done) markDone();
    },
    [markDone]
  );

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
          options: { zIndex: 10000, primaryColor: GOLD, arrowColor: CREAM },
          overlay: { backgroundColor: "rgba(28,10,0,0.45)" },
          spotlight: { borderRadius: 12 },
        }}
      />
    </>
  );
}
