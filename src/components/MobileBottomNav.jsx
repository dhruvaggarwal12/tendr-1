import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const font = "'Outfit', sans-serif";

const HIDE_PATHS = [
  "/booking/payment",
  "/booking/payment-processing",
  "/booking/payment-success",
  "/booking/payment-failed",
  "/booking/confirmation",
  "/booking/review",
  "/login", "/signup", "/otp",
  "/vendor/register",
];

const ICONS = {
  Home: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#C47A2E" : "none"} stroke={active ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  ),
  Browse: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plan: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="8" y2="18" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="16" y2="18"/>
    </svg>
  ),
  Chats: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Profile: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // Always show on route change
  useEffect(() => { setVisible(true); }, [location.pathname]);

  const shouldHide = HIDE_PATHS.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (paths) =>
    paths.some((p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  const items = [
    { label: "Home",    paths: ["/"],                       href: "/" },
    { label: "Browse",  paths: ["/listings","/top-rated","/search"], href: "/top-rated/Photographer" },
    { label: "Plan",    paths: ["/booking","/plan-event"],  href: "/booking" },
    { label: "Chats",   paths: ["/chats","/chat"],          href: token ? "/chats" : "/login" },
    { label: "Profile", paths: ["/dashboard","/AdminDashboard"], href: token ? (user?.isAdmin ? "/AdminDashboard" : "/dashboard") : "/login" },
  ];

  return (
    <>
      {/* Bottom spacer inside document flow — pushed by portal below */}
      <div style={{ height: 64 }} className="mobile-bottom-nav-spacer" />

      <nav
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 99990,
          height: 60,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "#FFFCF5",
          borderTop: "1px solid rgba(196,122,46,0.15)",
          boxShadow: "0 -2px 20px rgba(139,69,19,0.1)",
          display: "flex",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s ease",
          fontFamily: font,
        }}
        className="mobile-bottom-nav"
      >
        {items.map(({ label, paths, href }) => {
          const active = isActive(paths);
          const Icon = ICONS[label];
          return (
            <button
              key={label}
              onClick={() => navigate(href)}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3,
                border: "none", background: "none",
                cursor: "pointer", padding: "6px 0 4px",
                position: "relative",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
                fontFamily: font,
              }}
            >
              {/* Active pill indicator at top */}
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 3, borderRadius: "0 0 4px 4px",
                background: active ? "#C47A2E" : "transparent",
                transition: "background 0.2s",
              }} />
              {Icon(active)}
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 400,
                color: active ? "#C47A2E" : "#999",
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
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-bottom-nav-spacer { display: none !important; }
        }
        @media (max-height: 450px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-bottom-nav-spacer { display: none !important; }
        }
      `}</style>
    </>
  );
}

// Portal renders directly to document.body — bypasses any backdrop-filter stacking context
export default function MobileBottomNav() {
  return createPortal(<BottomNavInner />, document.body);
}
