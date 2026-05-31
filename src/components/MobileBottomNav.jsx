import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const font = "'Outfit', sans-serif";

const HIDE_PATHS = [
  "/booking/payment", "/booking/payment-processing",
  "/booking/payment-success", "/booking/payment-failed",
  "/booking/confirmation", "/booking/review",
  "/login", "/signup", "/otp", "/vendor/register",
];

const CATEGORIES = [
  { emoji: "📸", label: "Photography", path: "/top-rated/Photographer" },
  { emoji: "🍽", label: "Catering",    path: "/top-rated/Caterer" },
  { emoji: "🎵", label: "DJ & Music",  path: "/top-rated/DJ" },
  { emoji: "🎀", label: "Decoration",  path: "/top-rated/Decorator" },
];

const NAV_ICONS = {
  Home: (on) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? "#C47A2E" : "none"} stroke={on ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  ),
  Browse: (on) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plan: (on) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Chats: (on) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Profile: (on) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

function BottomNavInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((s) => s.auth);
  const [visible, setVisible] = useState(true);
  const [browseOpen, setBrowseOpen] = useState(false);
  const scrollTimer = useRef(null);

  // Hide while scrolling, show when stopped
  useEffect(() => {
    const onScroll = () => {
      setVisible(false);
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setVisible(true), 350);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(scrollTimer.current); };
  }, []);

  // Close browse sheet + reset visible on route change
  useEffect(() => {
    setVisible(true);
    setBrowseOpen(false);
  }, [location.pathname]);

  const shouldHide = HIDE_PATHS.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (paths) =>
    paths.some((p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  const items = [
    { label: "Home",    paths: ["/"],                              onTap: () => navigate("/") },
    { label: "Browse",  paths: ["/listings","/top-rated","/search"], onTap: () => setBrowseOpen(o => !o) },
    { label: "Plan",    paths: ["/booking","/plan-event"],          onTap: () => navigate("/booking") },
    { label: "Chats",   paths: ["/chats","/chat"],                  onTap: () => navigate("/chats") },
    { label: "Profile", paths: ["/dashboard","/AdminDashboard"],    onTap: () => navigate(token ? (user?.isAdmin ? "/AdminDashboard" : "/dashboard") : "/login") },
  ];

  return (
    <>
      {/* Browse category picker — pops up just above the bottom nav */}
      {browseOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setBrowseOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 99991 }}
          />
          {/* Sheet — sits just above the nav bar */}
          <div style={{
            position: "fixed", bottom: 60, left: 0, right: 0,
            zIndex: 99992,
            background: "#FFFCF5",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -6px 32px rgba(139,69,19,0.18)",
            padding: "10px 20px 20px",
            fontFamily: font,
            animation: "sheet-up 0.24s cubic-bezier(0.4,0,0.2,1)",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(196,122,46,0.25)" }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", margin: "0 0 14px" }}>Browse Vendors</p>

            {/* 2×2 grid of category buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {CATEGORIES.map(({ emoji, label, path }) => (
                <button key={label}
                  onClick={() => { navigate(path); setBrowseOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 14,
                    border: "1.5px solid rgba(196,122,46,0.15)",
                    background: "#fff",
                    cursor: "pointer", fontFamily: font,
                    boxShadow: "0 2px 8px rgba(196,122,46,0.08)",
                    transition: "background 0.15s",
                  }}
                  onTouchStart={e => e.currentTarget.style.background = "rgba(196,122,46,0.06)"}
                  onTouchEnd={e => e.currentTarget.style.background = "#fff"}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", textAlign: "left", lineHeight: 1.3 }}>{label}</span>
                </button>
              ))}
            </div>

            {/* All Vendors full-width button */}
            <button
              onClick={() => { navigate("/listings"); setBrowseOpen(false); }}
              style={{
                width: "100%", padding: "12px",
                borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: font,
                boxShadow: "0 4px 14px rgba(196,122,46,0.3)",
              }}>
              Browse All Vendors →
            </button>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 99990,
          height: 60,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "#FFFCF5",
          borderTop: "1px solid rgba(196,122,46,0.14)",
          boxShadow: "0 -2px 20px rgba(139,69,19,0.08)",
          display: "flex",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s ease",
          fontFamily: font,
        }}
      >
        {items.map(({ label, paths, onTap }) => {
          const active = isActive(paths);
          const Icon = NAV_ICONS[label];
          const isBrowseActive = label === "Browse" && browseOpen;
          return (
            <button
              key={label}
              onClick={onTap}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3, border: "none",
                background: isBrowseActive ? "rgba(196,122,46,0.06)" : "none",
                cursor: "pointer", padding: "6px 0 4px",
                position: "relative",
                WebkitTapHighlightColor: "transparent",
                outline: "none", fontFamily: font,
                transition: "background 0.15s",
              }}
            >
              {/* Active pill at top */}
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 3, borderRadius: "0 0 4px 4px",
                background: (active || isBrowseActive) ? "#C47A2E" : "transparent",
                transition: "background 0.2s",
              }} />
              {Icon(active || isBrowseActive)}
              <span style={{
                fontSize: 10, fontWeight: (active || isBrowseActive) ? 700 : 400,
                color: (active || isBrowseActive) ? "#C47A2E" : "#999",
                lineHeight: 1, letterSpacing: "0.01em",
                transition: "color 0.2s",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @media (min-width: 768px) { .mobile-bottom-nav { display: none !important; } }
        @media (max-height: 450px) { .mobile-bottom-nav { display: none !important; } }
      `}</style>
    </>
  );
}

export default function MobileBottomNav() {
  return createPortal(<BottomNavInner />, document.body);
}
