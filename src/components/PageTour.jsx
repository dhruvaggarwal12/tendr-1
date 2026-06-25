import { useState, useCallback, useEffect, useRef } from "react";
import { Joyride, STATUS, ACTIONS, EVENTS } from "react-joyride";

const TOUR_PREFIX = "tendr_tour_";

// Module-level session cache — survives re-renders and re-mounts within the same session
const _seenThisSession = new Set();

const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export const resetAllPageTours = () => {
  _seenThisSession.clear();
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(TOUR_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
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
        borderRadius: 20,
        padding: "28px 28px 22px",
        maxWidth: 360,
        boxShadow: "0 20px 60px rgba(44,26,14,0.22), 0 0 0 2px rgba(196,122,46,0.18)",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${GOLD}, #CCAB4A, ${GOLD})` }} />

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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          {...closeProps}
          style={{ background: "none", border: "none", fontSize: 13, color: MUTED, cursor: "pointer", padding: "3px 0", fontFamily: font, fontWeight: 600 }}
        >
          Skip
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid rgba(196,122,46,0.35)`, background: "transparent", fontSize: 13, fontWeight: 700, color: GOLD, cursor: "pointer", fontFamily: font }}
            >
              ← Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, #CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 12px rgba(196,122,46,0.35)" }}
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
  const markedDone = useRef(false);

  const isDone = () => markedDone.current || _seenThisSession.has(storageKey) || !!lsGet(storageKey);

  const [run, setRun] = useState(() => condition && !isDone());

  // Mark done immediately when tour starts so re-mounts never re-run it
  const markDone = useCallback(() => {
    if (markedDone.current) return;
    markedDone.current = true;
    _seenThisSession.add(storageKey);
    lsSet(storageKey, "1");
    setRun(false);
  }, [storageKey]);

  // Start tour if condition becomes true after mount (and not already seen)
  useEffect(() => {
    if (condition && !isDone()) {
      setRun(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  const handleCallback = useCallback(
    (data) => {
      const { status, action, type } = data;

      // Save to localStorage the moment the tour actually starts showing
      if (type === EVENTS.TOUR_START) {
        lsSet(storageKey, "1");
        _seenThisSession.add(storageKey);
      }

      // Stop on any terminal state or user dismissal
      const isTerminal =
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        status === STATUS.ERROR ||
        type === EVENTS.TARGET_NOT_FOUND ||
        action === ACTIONS.CLOSE ||
        action === ACTIONS.STOP ||
        action === ACTIONS.SKIP ||
        action === ACTIONS.RESET;

      if (isTerminal) {
        markDone();
      }
    },
    [storageKey, markDone]
  );

  if (!run || !condition) return null;

  // Inject disableBeacon on every step so no pulsing black dot ever appears
  const safeSteps = steps.map((s) => ({ ...s, disableBeacon: true }));

  return (
    <Joyride
      key={storageKey}
      steps={safeSteps}
      run={run}
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      continuous
      scrollToFirstStep
      showSkipButton
      disableOverlayClose={false}
      disableScrolling={false}
      spotlightClicks={false}
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
