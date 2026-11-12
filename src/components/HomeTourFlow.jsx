import React, { useState, useCallback, useEffect } from "react";
import { useTour } from "../context/TourContext";
import SiteTour from "./SiteTour";

const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const INK = "#2C1A0E";
const MUTED = "#9B7450";
const CREAM = "#FFFCF5";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', sans-serif";

const DONE_LS_KEY = "tendr_home_tour_completed";
const SKIPPED_LS_KEY = "tendr_home_tour_skipped";
const OLD_LS_KEY = "tendr-ftv-done"; // the existing global mascot-tour flag

// 4 real pointers (not 5) — the homepage has no dedicated invitations/guest-list
// section of its own, so that pointer and "Celebration Tools" are merged into
// one pointer on the Tools nav, per plan. Desktop/mobile variants mirror
// SiteTour's own existing pattern (Navbar's dropdowns are display:none under
// 768px — mobile points at the hamburger menu instead).
const HOME_TOUR_STEPS = {
  desktop: [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Start here! 🎉",
      content: "Choose your occasion and tell us about your celebration to discover relevant services.",
    },
    {
      target: '[data-tour="nav-browse"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Explore services",
      content: "Discover event services, explore options and find the right professionals for your celebration.",
    },
    {
      target: '[data-tour="nav-tools"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Invitations & celebration tools",
      content: "Create invitations, share them with guests and track RSVPs — plus budget, timeline and other tools that help organise every part of your celebration.",
    },
    {
      target: '[data-tour="hero-ctas"]',
      placement: "top",
      disableBeacon: true,
      title: "Ready to plan?",
      content: "Start creating your celebration with Tendr.",
    },
    {
      target: '[data-tour="earn"]',
      placement: "top",
      disableBeacon: true,
      title: "Refer & Earn 🎁",
      content: "Share your code with friends — they get a discount, and you earn real money every time they book. Tap this any time.",
    },
  ],
  mobile: [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Start here! 🎉",
      content: "Choose your occasion and tell us about your celebration to discover relevant services.",
    },
    {
      target: '[data-tour="mob-nav-book vendors"]',
      placement: "top",
      disableBeacon: true,
      title: "Explore services",
      content: "Discover event services, explore options and find the right professionals for your celebration.",
    },
    {
      target: '[data-tour="mob-nav-tools"]',
      placement: "top",
      disableBeacon: true,
      title: "Invitations & celebration tools",
      content: "Create invitations, share them with guests and track RSVPs — plus budget, timeline and other tools that help organise every part of your celebration.",
    },
    {
      target: '[data-tour="hero-ctas"]',
      placement: "top",
      disableBeacon: true,
      title: "Ready to plan?",
      content: "Start creating your celebration with Tendr.",
    },
    {
      target: '[data-tour="earn"]',
      placement: "top",
      disableBeacon: true,
      title: "Refer & Earn 🎁",
      content: "Share your code with friends — they get a discount, and you earn real money every time they book. Tap this any time.",
    },
  ],
};

function markDone(localKey) {
  try {
    localStorage.setItem(localKey, "1");
    localStorage.setItem(OLD_LS_KEY, "1"); // suppress the old global mascot prompt too
  } catch {}
}

function OverlayShell({ children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(28,9,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 380, background: CREAM, borderRadius: 22, padding: "28px 24px", boxShadow: "0 24px 64px rgba(28,10,4,0.3)", fontFamily: SANS, textAlign: "center", animation: "htf-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <style>{`@keyframes htf-pop{from{opacity:0;transform:scale(0.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
          @media (prefers-reduced-motion: reduce){ [style*="htf-pop"]{ animation: none !important; } }`}</style>
        {children}
      </div>
    </div>
  );
}

function WelcomeCard({ onStart, onExplore }) {
  return (
    <OverlayShell>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>
        🎉
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: INK, margin: "0 0 8px" }}>Welcome to Tendr!</h2>
      <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: "0 0 22px" }}>
        Let's take a quick look around and show you how to make the most of Tendr.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <button onClick={onStart} style={{ width: "100%", minHeight: 48, padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: "#fff", fontSize: 14.5, fontWeight: 700, fontFamily: SANS, cursor: "pointer", boxShadow: `0 4px 16px ${GOLD}55` }}>
          Start Tour
        </button>
        <button onClick={onExplore} style={{ width: "100%", minHeight: 44, padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: MUTED, fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: "pointer" }}>
          Explore on my own
        </button>
      </div>
    </OverlayShell>
  );
}

function DoneCard({ onClose }) {
  return (
    <OverlayShell>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>
        ✓
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: INK, margin: "0 0 8px" }}>You're all set!</h2>
      <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: "0 0 22px" }}>
        Explore Tendr and start planning your next celebration.
      </p>
      <button onClick={onClose} style={{ width: "100%", minHeight: 48, padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: "#fff", fontSize: 14.5, fontWeight: 700, fontFamily: SANS, cursor: "pointer", boxShadow: `0 4px 16px ${GOLD}55` }}>
        Let's Explore
      </button>
    </OverlayShell>
  );
}

// Mounted once from Home.jsx, only right after the 3-screen intro's "Show me
// around" action fires (the `active` prop — a short-lived, non-persisted
// trigger) and only on mobile/tablet (caller already gates on
// useIsMobileOrTablet()). Phases: welcome -> tour -> done. Deliberately
// skips the existing global IntentPicker step — ends right at "done", per plan.
export default function HomeTourFlow({ active, onClose }) {
  const { startTour } = useTour();
  const [phase, setPhase] = useState("welcome");

  // Hide the mobile bottom nav during the welcome/done full-screen cards (same
  // convention FirstTimeExperience uses) — but NOT during the tour itself,
  // since two of the tour's own pointers target real buttons on that bar.
  const hideBottomNav = active && phase !== "tour";
  useEffect(() => {
    if (typeof window === "undefined" || !hideBottomNav) return;
    if (!window.__tendrDrawers) window.__tendrDrawers = new Set();
    window.__tendrDrawers.add("hometour");
    window.dispatchEvent(new Event("tendr:drawer"));
    return () => {
      window.__tendrDrawers?.delete("hometour");
      window.dispatchEvent(new Event("tendr:drawer"));
    };
  }, [hideBottomNav]);

  // Phase flips to "tour" (mounting SiteTour) first, with startTour() fired a
  // tick later from an effect — not synchronously in the same click handler —
  // so SiteTour's very first render genuinely sees tourActive=false before it
  // flips true. Doing both in one batched commit (as FirstTimeExperience's
  // own handleYes does) mounts SiteTour with tourActive already true, which
  // makes react-joyride ignore disableBeacon on the first step.
  const handleStart = useCallback(() => {
    setPhase("tour");
  }, []);
  useEffect(() => {
    if (phase !== "tour") return;
    const t = setTimeout(() => startTour(), 0);
    return () => clearTimeout(t);
  }, [phase, startTour]);

  const handleExplore = useCallback(() => {
    markDone(SKIPPED_LS_KEY);
    onClose?.();
  }, [onClose]);

  const handleTourDone = useCallback(() => {
    setPhase("done");
  }, []);

  const handleFinalClose = useCallback(() => {
    // "done" is only reachable via the tour phase (the welcome popup's "Explore
    // on my own" exits directly through handleExplore above) — so reaching here
    // always means the tour ran, whether finished normally or via its own
    // "Skip tour" button (SiteTour's onDone doesn't distinguish the two, and
    // the completion screen is intentionally the same either way per plan).
    markDone(DONE_LS_KEY);
    onClose?.();
  }, [onClose]);

  if (!active) return null;

  if (phase === "welcome") return <WelcomeCard onStart={handleStart} onExplore={handleExplore} />;
  if (phase === "tour") {
    return <SiteTour steps={HOME_TOUR_STEPS} onDone={handleTourDone} />;
  }
  if (phase === "done") return <DoneCard onClose={handleFinalClose} />;
  return null;
}
