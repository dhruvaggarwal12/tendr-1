// src/App.jsx
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { useState, useEffect, Suspense } from "react";
import "./App.css";
import router from "./router";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatButton from "./components/FloatingChatButton";
import VendorChatModal from "./components/VendorChatModal";
import SignInPromptController from "./components/SignInPromptController";
import { ChatProvider } from "./context/ChatContext";
import { StationeryCartProvider } from "./context/StationeryCartContext";
import { TourProvider } from "./context/TourContext";
import SiteTour from "./components/SiteTour";
import ComingSoon from "./pages/ComingSoon";
import CommunityWall from "./pages/community/CommunityWall";
import tendrLogo from "./assets/logos/tendr-logo-secondary.png";

// Minimal router for tendr.co.in: coming soon at / and community at /community
const liveSiteRouter = createBrowserRouter([
  { path: "/community", element: <CommunityWall />, errorElement: <ComingSoon /> },
  { path: "*",          element: <ComingSoon />,    errorElement: <ComingSoon /> },
]);

const LIVE_DOMAINS = ["tendr.co.in", "www.tendr.co.in"];
const isLiveDomain = LIVE_DOMAINS.includes(window.location.hostname);

// NOTE: Scroll-to-top on forward nav is handled by ScrollRestoration in RootLayout.
// Removed the blanket router.subscribe scroll-to-top which was breaking back-button scroll restoration.

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
  const [liveStatus, setLiveStatus] = useState(null); // null=loading, true/false

  const handleSplashDone = () => {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setSplashDone(true);
  };

  // On tendr.co.in — fetch launch status, fall back to Coming Soon on any failure
  useEffect(() => {
    if (!isLiveDomain) return;
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); setLiveStatus(false); }, 4000);
    fetch(`${import.meta.env.VITE_BASE_URL}/launch-status`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("not ok"); return r.json(); })
      .then(d => { clearTimeout(timer); setLiveStatus(!!d.isLive); })
      .catch(() => { clearTimeout(timer); setLiveStatus(false); });
    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  if (isLiveDomain) {
    // Live — show full app
    if (liveStatus === true) {
      return (
        <HelmetProvider>
          <ErrorBoundary>
            <StationeryCartProvider>
            <TourProvider>
            <ChatProvider>
              <SiteTour />
              <SignInPromptController />
              {!splashDone && <SplashScreen onDone={handleSplashDone} />}
              <Suspense fallback={
                <div style={{ minHeight: "100vh", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 36, height: 36, border: "3px solid rgba(196,122,46,0.2)", borderTopColor: "#C47A2E", borderRadius: "50%", animation: "tendr-spin 0.65s linear infinite" }} />
                  <style>{`@keyframes tendr-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              }>
                <RouterProvider router={router} />
              </Suspense>
              <FloatingChatButton hideOnRoutes={["/chat", "/chats", "/login", "/signup", "/otp", "/guides"]} />
              <VendorChatModal />
            </ChatProvider>
            </TourProvider>
            </StationeryCartProvider>
          </ErrorBoundary>
        </HelmetProvider>
      );
    }
    // Not live — Coming Soon
    return (
      <HelmetProvider>
        <ErrorBoundary>
          {!splashDone && <SplashScreen onDone={handleSplashDone} />}
          <RouterProvider router={liveSiteRouter} />
        </ErrorBoundary>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <StationeryCartProvider>
        <TourProvider>
        <ChatProvider>
          <SiteTour />
          <SignInPromptController />
          {!splashDone && <SplashScreen onDone={handleSplashDone} />}
          <Suspense fallback={
            <div style={{ minHeight: "100vh", background: "#FFFCF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid rgba(196,122,46,0.2)", borderTopColor: "#C47A2E", borderRadius: "50%", animation: "tendr-spin 0.65s linear infinite" }} />
              <style>{`@keyframes tendr-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <RouterProvider router={router} />
          </Suspense>
          <FloatingChatButton hideOnRoutes={["/chat", "/chats", "/login", "/signup", "/otp", "/guides"]} />
          <VendorChatModal />
        </ChatProvider>
        </TourProvider>
        </StationeryCartProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
export default App;
