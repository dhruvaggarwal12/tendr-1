import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const APP_URL = "https://tendr-1.vercel.app";

// iOS steps (no programmatic install API on iOS)
const IOS_STEPS = [
  { num: 1, icon: "🌐", text: "Open Safari and go to", highlight: APP_URL },
  { num: 2, icon: "⬆️", text: 'Tap the Share button at the bottom (the square with an arrow)' },
  { num: 3, icon: "📱", text: 'Scroll down and tap "Add to Home Screen"' },
  { num: 4, icon: "✅", text: 'Tap "Add" in the top-right corner — done!' },
];

export default function InstallApp() {
  const navigate = useNavigate();
  const [active, setActive] = useState("android");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Capture the beforeinstallprompt event for Android/Desktop
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback: open the app URL if prompt isn't available
      window.open(APP_URL, "_blank");
      return;
    }
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    setInstalling(false);
  };

  const tabs = [
    { id: "android", icon: "🤖", label: "Android" },
    { id: "desktop", icon: "💻", label: "Desktop" },
    { id: "ios",     icon: "🍎", label: "iPhone / iPad" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <HamburgerNav title="Install App" noSidebar />

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📲</div>
          <h1 style={{ fontSize: "clamp(1.5rem,5vw,2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Tendr on your phone
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
            Get instant notifications, chat with vendors and track bookings from your home screen.
          </p>
        </div>

        {/* Device tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#fff", borderRadius: 14, padding: 5, border: "1.5px solid rgba(196,122,46,0.12)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active === t.id ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "transparent",
                color: active === t.id ? "#fff" : "#9B7450",
                fontFamily: font, transition: "all 0.18s",
              }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* Android / Desktop — direct install button */}
        {(active === "android" || active === "desktop") && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", boxShadow: "0 4px 24px rgba(196,122,46,0.08)" }}>
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{active === "android" ? "🤖" : "💻"}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#CCAB4A", marginBottom: 4 }}>
                {active === "android" ? "Install on Android" : "Install on Desktop"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {active === "android" ? "Chrome browser" : "Chrome or Edge"}
              </div>
            </div>
            <div style={{ padding: "28px 24px" }}>
              {installed ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#15803d", marginBottom: 6 }}>Already installed!</div>
                  <div style={{ fontSize: 13, color: "#9B7450" }}>Tendr is on your home screen.</div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: "#7A5535", margin: "0 0 24px", textAlign: "center", lineHeight: 1.6 }}>
                    {active === "android"
                      ? "Tap the button below to install Tendr directly to your Android home screen — no app store needed."
                      : "Click the button below to install Tendr as a desktop app — opens instantly without a browser."}
                  </p>
                  <button onClick={handleInstall} disabled={installing}
                    style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: installing ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: installing ? "#9ca3af" : "#fff", fontSize: 16, fontWeight: 800, cursor: installing ? "not-allowed" : "pointer", fontFamily: font, boxShadow: installing ? "none" : "0 4px 18px rgba(196,122,46,0.35)", marginBottom: 12 }}>
                    {installing ? "Installing..." : "📲 Install Tendr App"}
                  </button>
                  {!deferredPrompt && (
                    <p style={{ fontSize: 12, color: "#9B7450", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                      💡 If the button doesn't work, open {APP_URL} in{" "}
                      {active === "android" ? "Chrome" : "Chrome or Edge"} and look for the
                      {active === "android" ? " install banner at the bottom" : " ⊕ icon in the address bar"}.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* iOS — step-by-step only (no programmatic API) */}
        {active === "ios" && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", boxShadow: "0 4px 24px rgba(196,122,46,0.08)", marginBottom: 16 }}>
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>🍎</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#CCAB4A" }}>iPhone / iPad</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Safari browser required</div>
              </div>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
              {IOS_STEPS.map(({ num, icon, text, highlight }) => (
                <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(196,122,46,0.3)" }}>
                    {num}
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <span style={{ fontSize: 14, color: "#2C1A0E", lineHeight: 1.5 }}>{text}</span>
                    {highlight && (
                      <a href={highlight} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", marginTop: 4, fontSize: 13, fontWeight: 700, color: "#C47A2E", textDecoration: "none", background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, padding: "5px 12px", wordBreak: "break-all" }}>
                        {highlight}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ margin: "0 22px 22px", background: "rgba(196,122,46,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#7A5535" }}>
              ⚠️ Only works in Safari — not Chrome or Firefox on iPhone
            </div>
          </div>
        )}

        <button onClick={() => navigate("/")}
          style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          Go to Home →
        </button>
      </div>
    </div>
  );
}
