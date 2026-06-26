import React, { useState, useEffect, useRef } from "react";
import router from "../router";

const font = "'Outfit', sans-serif";
const KEY_DISMISSED = "tendr_pwa_dismissed_at";
const KEY_INSTALLED = "tendr_pwa_installed";
const DISMISS_TTL   = 3 * 24 * 60 * 60 * 1000; // 3 days
const FIVE_MIN      = 5 * 60 * 1000;

function isInstalledPWA() {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  } catch { return false; }
}

function isIOSDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
}

function dismissedRecently() {
  try {
    const t = localStorage.getItem(KEY_DISMISSED);
    return !!t && Date.now() - Number(t) < DISMISS_TTL;
  } catch { return false; }
}

export default function PWAInstallPrompt() {
  const [visible,         setVisible]         = useState(false);
  const [showIOSSteps,    setShowIOSSteps]     = useState(false);
  const [showAndroidSteps, setShowAndroidSteps] = useState(false);
  const [deferredPrompt,  setDeferredPrompt]   = useState(null);
  const [installing,      setInstalling]       = useState(false);
  const [justInstalled,   setJustInstalled]    = useState(false);
  const [source,          setSource]           = useState("auto"); // "signup" | "auto"
  const timerRef = useRef(null);

  // ── Capture beforeinstallprompt (Android / Desktop) ──────────────────────
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__tendrPWAPrompt = e;
    };
    const onInstalled = () => {
      try { localStorage.setItem(KEY_INSTALLED, "true"); } catch {}
      setJustInstalled(true);
      setVisible(false);
      setTimeout(() => setJustInstalled(false), 3000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // ── Manual trigger (e.g. fired by signup page) ────────────────────────────
  useEffect(() => {
    const onTrigger = (e) => {
      if (isInstalledPWA()) return;
      setSource(e.detail?.source || "auto");
      // Signup overrides recent dismiss
      if (e.detail?.source !== "signup" && dismissedRecently()) return;
      setShowIOSSteps(false);
      setVisible(true);
    };
    window.addEventListener("tendr:show-pwa-prompt", onTrigger);
    return () => window.removeEventListener("tendr:show-pwa-prompt", onTrigger);
  }, []);

  // ── 5-minute auto popup ───────────────────────────────────────────────────
  useEffect(() => {
    if (isInstalledPWA()) return;
    timerRef.current = setTimeout(() => {
      if (isInstalledPWA() || dismissedRecently()) return;
      setSource("auto");
      setShowIOSSteps(false);
      setVisible(true);
    }, FIVE_MIN);
    return () => clearTimeout(timerRef.current);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(KEY_DISMISSED, String(Date.now())); } catch {}
    setVisible(false);
    setShowIOSSteps(false);
    setShowAndroidSteps(false);
  };

  const handleInstall = () => {
    dismiss();
    router.navigate("/install");
  };

  // ── "Installed!" toast ────────────────────────────────────────────────────
  if (justInstalled) {
    return (
      <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#15803d", color: "#fff", padding: "12px 28px", borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: font, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", pointerEvents: "none" }}>
        ✓ Tendr installed on your home screen!
      </div>
    );
  }

  if (!visible) return null;

  const ios = isIOSDevice();

  const showingSteps = showIOSSteps || showAndroidSteps;
  const isLarge = source === "signup" || showingSteps;

  return (
    <>
      {/* Backdrop (for signup source, steps, or iOS) */}
      {(isLarge) && (
        <div onClick={dismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9997, backdropFilter: "blur(3px)" }} />
      )}

      {/* Main popup */}
      <div style={{
        position: "fixed",
        bottom: isLarge ? "50%" : 16,
        left: isLarge ? "50%" : "auto",
        right: isLarge ? "auto" : 12,
        transform: isLarge ? "translate(-50%, 50%)" : "none",
        width: isLarge ? "min(93vw, 400px)" : "min(82vw, 300px)",
        background: "#FFFCF5",
        borderRadius: 18,
        boxShadow: "0 16px 48px rgba(28,10,0,0.2)",
        border: "1.5px solid rgba(196,122,46,0.18)",
        zIndex: 9998,
        fontFamily: font,
        overflow: "auto",
        maxHeight: "85dvh",
        animation: "pwaSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Dark header */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: source === "signup" ? "20px 22px 18px" : "14px 18px 12px", position: "relative" }}>
          <button onClick={dismiss} style={{ position: "absolute", top: 10, right: 12, width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
          <div style={{ fontSize: source === "signup" ? 36 : 26, marginBottom: 8 }}>📲</div>
          <h3 style={{ fontSize: source === "signup" ? 17 : 14, fontWeight: 900, color: "#fff", margin: "0 0 3px", letterSpacing: "-0.01em" }}>
            {source === "signup" ? "Welcome to Tendr! 🎉" : "Install Tendr App"}
          </h3>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            {source === "signup"
              ? "Add us to your home screen for the best experience."
              : "Get instant access from your home screen."}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: source === "signup" ? "18px 22px 20px" : "12px 16px 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {[
              "Opens instantly from your home screen",
              "Get notified for bookings & vendor replies",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C47A2E", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#4A2810", fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
          <button onClick={handleInstall}
            style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)", marginBottom: 6 }}>
            Install Tendr — Free
          </button>
          <button onClick={dismiss}
            style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Not now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pwaSlideUp {
          from { opacity: 0; transform: ${isLarge ? "translate(-50%, 60%)" : "translateY(20px)"} }
          to   { opacity: 1; transform: ${isLarge ? "translate(-50%, 50%)" : "translateY(0)"} }
        }
      `}</style>
    </>
  );
}
