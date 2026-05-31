// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { useState, useEffect } from "react";
import "./App.css";
import router from "./router";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatButton from "./components/FloatingChatButton";
import VendorChatModal from "./components/VendorChatModal";
import { ChatProvider } from "./context/ChatContext";
import ComingSoon from "./pages/ComingSoon";
import tendrLogo from "./assets/logos/tendr-logo-secondary.png";

const LIVE_DOMAINS = ["tendr.co.in", "www.tendr.co.in"];
const isLiveDomain = LIVE_DOMAINS.includes(window.location.hostname);

// Scroll to top on every navigation
router.subscribe(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
});

function SplashScreen({ onDone }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 900);
    const t2 = setTimeout(() => onDone(), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#FFFCF5",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
      transition: "opacity 0.4s ease",
      opacity: fade ? 0 : 1,
      pointerEvents: fade ? "none" : "all",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <img src={tendrLogo} alt="Tendr" style={{ height: 48, objectFit: "contain" }} />
      <div style={{ fontSize: 13, color: "#C47A2E", fontWeight: 600, letterSpacing: "0.1em" }}>
        Plan. Connect. Celebrate.
      </div>
      <div style={{ width: 40, height: 3, borderRadius: 2, background: "rgba(196,122,46,0.2)", overflow: "hidden", marginTop: 8 }}>
        <div style={{ height: "100%", background: "#C47A2E", borderRadius: 2, animation: "splash-bar 0.9s ease forwards" }} />
      </div>
      <style>{`@keyframes splash-bar { from { width: 0 } to { width: 100% } }`}</style>
    </div>
  );
}

// Only show splash on first visit per session
const SPLASH_KEY = "tendr_splash_shown";
const showSplash = !sessionStorage.getItem(SPLASH_KEY);

function App() {
  const [splashDone, setSplashDone] = useState(!showSplash);

  const handleSplashDone = () => {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setSplashDone(true);
  };

  // On tendr.co.in — lock entire app to Coming Soon, no routing possible
  if (isLiveDomain) {
    return (
      <HelmetProvider>
        <ComingSoon />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ChatProvider>
          {!splashDone && <SplashScreen onDone={handleSplashDone} />}
          <RouterProvider router={router} />
          <FloatingChatButton />
          <VendorChatModal />
        </ChatProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
export default App;
