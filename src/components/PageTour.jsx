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
const CHAMP     = "#C4973A";

/* ─── Mobile full-screen onboarding ─────────────────────────────────── */
function MobileTour({ steps, onDone }) {
  const [idx, setIdx] = useState(0);
  const total = steps.length;
  const step  = steps[idx];
  const isLast = idx === total - 1;

  const next = () => (isLast ? onDone() : setIdx((i) => i + 1));

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "#fff", display: "flex", flexDirection: "column",
        fontFamily: font, overflowY: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", flexShrink: 0,
          borderBottom: "1px solid rgba(28,14,4,0.07)",
        }}
      >
        <span
          style={{
            fontFamily: serifFont, fontSize: 22, fontWeight: 400,
            color: "#1C0E04", letterSpacing: "0.06em",
          }}
        >
          TENDR
        </span>
        <span style={{ fontSize: 13, color: "rgba(28,14,4,0.4)", fontWeight: 500, fontFamily: font }}>
          {idx + 1} / {total}
        </span>
        <button
          onClick={onDone}
          aria-label="Close tour"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, lineHeight: 1, borderRadius: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(28,14,4,0.38)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Hero image */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
        {step.image ? (
          <>
            <img
              src={step.image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)",
              }}
            />
          </>
        ) : (
          <div
            style={{
              width: "100%", height: "100%",
              background: "linear-gradient(155deg, #1C0E04 0%, #3A2010 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: serifFont, fontSize: 120, fontWeight: 700, lineHeight: 1,
                color: "rgba(196,151,58,0.13)", userSelect: "none",
              }}
            >
              T
            </span>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div
        style={{
          padding: "24px 24px 44px", background: "#fff",
          flexShrink: 0, borderTop: "1px solid rgba(28,14,4,0.05)",
        }}
      >
        <h2
          style={{
            fontFamily: serifFont, fontSize: 27, fontWeight: 400,
            color: "#1C0E04", marginBottom: 8, lineHeight: 1.22,
          }}
        >
          {step.title}
        </h2>
        <p
          style={{
            fontSize: 14, lineHeight: 1.68,
            color: "rgba(28,14,4,0.52)", margin: "0 0 26px",
          }}
        >
          {step.content}
        </p>

        {/* Dots + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 5,
                  width: i === idx ? 20 : 5,
                  borderRadius: 100,
                  background: i === idx ? CHAMP : "rgba(28,14,4,0.13)",
                  transition: "width 0.25s ease, background 0.25s ease",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            style={{
              padding: "12px 30px", borderRadius: 100,
              background: CHAMP, color: "#fff",
              border: "none", fontSize: 14.5, fontWeight: 600,
              cursor: "pointer", fontFamily: font, letterSpacing: "0.01em",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isLast ? "Get started" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Joyride tooltip ────────────────────────────────────────── */
function TourTooltip({ index, step, closeProps, primaryProps, tooltipProps, size }) {
  const dots   = Array.from({ length: size });
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
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 10, right: 14,
            fontFamily: serifFont, fontSize: 72, fontWeight: 700,
            lineHeight: 1, color: "rgba(196,122,46,0.07)",
            userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <button
          {...closeProps}
          style={{
            position: "absolute", top: 12, right: 14,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(44,26,14,0.22)", fontSize: 20, lineHeight: 1,
            padding: "0 2px", fontFamily: font, fontWeight: 300,
          }}
        >
          ×
        </button>

        {step.title && (
          <div
            style={{
              fontFamily: serifFont, fontSize: 21, fontWeight: 400,
              lineHeight: 1.22, color: "#2C1A0E",
              marginBottom: 9, paddingRight: 26, textWrap: "balance",
            }}
          >
            {step.title}
          </div>
        )}

        <div
          style={{
            fontSize: 13, lineHeight: 1.72,
            color: "rgba(44,26,14,0.58)", marginBottom: 16,
          }}
        >
          {step.content}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

          <button
            {...primaryProps}
            style={{
              padding: "7px 17px", borderRadius: 7,
              border: "1.5px solid #C47A2E",
              background: isLast ? "#C47A2E" : "transparent",
              color: isLast ? "#FFFCF5" : "#C47A2E",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              fontFamily: font, letterSpacing: "0.01em",
            }}
          >
            {isLast ? "Done" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────── */
export default function PageTour({ pageKey, steps, condition = true, onDone }) {
  const storageKey  = TOUR_PREFIX + pageKey;
  const alreadySeen = () => _seen.has(storageKey) || !!lsGet(storageKey);
  const [run, setRun]         = useState(() => condition && !alreadySeen());
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
        document.querySelectorAll('[class*="joyride-beacon"]').forEach((el) => el.remove());
        document.querySelectorAll('[class*="__floater"]').forEach((el) => el.remove());
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

  /* Mobile: bypass Joyride entirely */
  if (isMobile) {
    return <MobileTour steps={steps} onDone={markDone} />;
  }

  /* Desktop: Joyride spotlight tour */
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
