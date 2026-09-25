// src/App.jsx
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { useState, useEffect, Suspense, lazy } from "react";
import "./App.css";
import router from "./router";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatButton from "./components/FloatingChatButton";
import VendorChatModal from "./components/VendorChatModal";
import { MyEventFloatDesktop } from "./components/PlanSummaryModal";
import ShortlistFloat from "./components/ShortlistFloat";
import SignInPromptController from "./components/SignInPromptController";
import { ChatProvider } from "./context/ChatContext";
import { StationeryCartProvider } from "./context/StationeryCartContext";
import { TourProvider } from "./context/TourContext";
import SiteTour from "./components/SiteTour";
import ComingSoon from "./pages/ComingSoon";
import CommunityWall from "./pages/community/CommunityWall";
import tendrLogo from "./assets/logos/tendr-logo-secondary.png";
import DecorAnalyzer from "./components/DecorAnalyzer";

const HIDE_DECOR_FLOAT_ROUTES = ["/login", "/signup", "/otp", "/vendor/", "/admin/", "/coordinator/", "/decor-analyser"];

function DecorAnalyzerFloat() {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(() => router.state?.location?.pathname || "/");
  useEffect(() => {
    const unsub = router.subscribe(state => setPath(state.location.pathname));
    return unsub;
  }, []);
  const hidden = HIDE_DECOR_FLOAT_ROUTES.some(p => path.startsWith(p));
  if (hidden) return null;
  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Analyse your venue decor"
        style={{
          position: "fixed", bottom: 148, right: 18, zIndex: 4990,
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg,#2C1A0E,#4A2810)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(44,26,14,0.3)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </button>

      {/* Full-screen modal */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(28,9,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ width: "100%", maxWidth: 640, background: "#FFFCF5", borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", maxHeight: "93dvh", overflowY: "auto", fontFamily: "'Outfit',sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em" }}>AI Tool</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1C0900", marginTop: 2 }}>Venue Decor Analyser</div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: "pointer", fontSize: 16, color: "#9B7450", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <DecorAnalyzer onClose={() => setOpen(false)} compact />
          </div>
        </div>
      )}
    </>
  );
}

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

// Minimal router for tendr.co.in: coming soon at / and community at /community
// AdminDashboard is included so admin can always log in and toggle launch status
const liveSiteRouter = createBrowserRouter([
  { path: "/community",      element: <CommunityWall />,  errorElement: <ComingSoon /> },
  { path: "/AdminDashboard", element: <AdminDashboard />, errorElement: <ComingSoon /> },
  { path: "*",               element: <ComingSoon />,     errorElement: <ComingSoon /> },
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
              <MyEventFloatDesktop />
              <DecorAnalyzerFloat />
              <ShortlistFloat />
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
          <MyEventFloatDesktop />
          <DecorAnalyzerFloat />
          <ShortlistFloat />
          <VendorChatModal />
        </ChatProvider>
        </TourProvider>
        </StationeryCartProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
export default App;
