import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const font = "'Outfit', sans-serif";

// Pages where the bottom nav should NOT appear
const HIDE_PATHS = [
  "/booking/payment",
  "/booking/payment-processing",
  "/booking/payment-success",
  "/booking/payment-failed",
  "/booking/confirmation",
  "/booking/review",
  "/login",
  "/signup",
  "/otp",
  "/vendor/register",
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((s) => s.auth);

  // Hide on certain pages
  const shouldHide = HIDE_PATHS.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const active = (paths) =>
    paths.some((p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  const items = [
    {
      label: "Home",
      icon: (on) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? "#C47A2E" : "none"} stroke={on ? "#C47A2E" : "#9B7450"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      ),
      paths: ["/"],
      action: () => navigate("/"),
    },
    {
      label: "Browse",
      icon: (on) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#9B7450"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      paths: ["/listings", "/top-rated", "/search"],
      action: () => navigate("/listings"),
    },
    {
      label: "Plan",
      icon: (on) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#9B7450"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      paths: ["/booking", "/plan-event"],
      action: () => navigate("/booking"),
    },
    {
      label: "Chats",
      icon: (on) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#9B7450"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
      paths: ["/chats", "/chat"],
      action: () => navigate(token ? "/chats" : "/login"),
    },
    {
      label: "Profile",
      icon: (on) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? "#C47A2E" : "#9B7450"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      paths: ["/dashboard", "/AdminDashboard"],
      action: () => navigate(token ? (user?.isAdmin ? "/AdminDashboard" : "/dashboard") : "/login"),
    },
  ];

  return (
    <>
      {/* Spacer so page content doesn't hide behind the bar */}
      <div style={{ height: 60, flexShrink: 0 }} className="mobile-bottom-nav-spacer" />

      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          background: "rgba(255,252,245,0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(196,122,46,0.12)",
          boxShadow: "0 -4px 24px rgba(139,69,19,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          height: 56,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          fontFamily: font,
        }}
      >
        {items.map(({ label, icon, paths, action }) => {
          const on = active(paths);
          return (
            <button
              key={label}
              onClick={action}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 0",
                fontFamily: font,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {icon(on)}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: on ? 700 : 500,
                  color: on ? "#C47A2E" : "#9B7450",
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
              {on && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: 24,
                    height: 2.5,
                    borderRadius: "2px 2px 0 0",
                    background: "#C47A2E",
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <style>{`
        /* Only show on mobile */
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-bottom-nav-spacer { display: none !important; }
        }
        /* Hide when keyboard is open (viewport shrinks to < 70% of screen) */
        @supports (height: 100dvh) {
          @media (max-height: 500px) {
            .mobile-bottom-nav { display: none !important; }
            .mobile-bottom-nav-spacer { display: none !important; }
          }
        }
      `}</style>
    </>
  );
}
