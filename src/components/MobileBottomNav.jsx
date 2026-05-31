import React, { useEffect, useRef, useState } from "react";
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
  "/login",
  "/signup",
  "/otp",
  "/vendor/register",
];

const ITEMS = [
  {
    label: "Home",
    paths: ["/"],
    href: "/",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#C47A2E" : "none"} stroke={active ? "#C47A2E" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
        <polyline points="9 21 9 12 15 12 15 21"/>
      </svg>
    ),
  },
  {
    label: "Browse",
    paths: ["/listings", "/top-rated", "/search"],
    href: "/top-rated/Photographer",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#888"} strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    label: "Plan",
    paths: ["/booking", "/plan-event"],
    href: "/booking",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Chats",
    paths: ["/chats", "/chat"],
    href: "/chats",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    label: "Profile",
    paths: ["/dashboard", "/AdminDashboard"],
    href: null, // dynamic
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#C47A2E" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((s) => s.auth);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  // Scroll hide/show
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastY.current;
        if (diff > 6 && y > 80) setHidden(true);   // scrolling down → hide
        else if (diff < -6) setHidden(false);        // scrolling up → show
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset hidden on route change
  useEffect(() => { setHidden(false); }, [location.pathname]);

  const shouldHide = HIDE_PATHS.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (paths) =>
    paths.some((p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  const getHref = (item) => {
    if (item.label === "Profile") {
      if (!token) return "/login";
      return user?.isAdmin ? "/AdminDashboard" : "/dashboard";
    }
    if (item.label === "Chats") return token ? "/chats" : "/login";
    return item.href;
  };

  return (
    <>
      {/* Spacer so last content isn't hidden behind bar */}
      <div style={{ height: 64 }} className="mobile-bottom-nav-spacer" />

      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 9000,
          background: "rgba(255, 252, 245, 0.97)",
          borderTop: "1px solid rgba(196,122,46,0.14)",
          display: "flex",
          height: 60,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          transform: hidden ? "translateY(100%)" : "translateY(0)",
          transition: "transform 0.25s ease",
          fontFamily: font,
        }}
      >
        {ITEMS.map((item) => {
          const active = isActive(item.paths);
          return (
            <button
              key={item.label}
              onClick={() => navigate(getHref(item))}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 4,
                border: "none", background: "none",
                cursor: "pointer",
                padding: "6px 0 4px",
                position: "relative",
                WebkitTapHighlightColor: "transparent",
                fontFamily: font,
              }}
            >
              {/* Active indicator dot at top */}
              {active && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 32, height: 3, borderRadius: "0 0 3px 3px",
                  background: "#C47A2E",
                }} />
              )}
              {item.icon(active)}
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? "#C47A2E" : "#888",
                lineHeight: 1, letterSpacing: "0.01em",
              }}>
                {item.label}
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
        @media (max-height: 500px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-bottom-nav-spacer { display: none !important; }
        }
      `}</style>
    </>
  );
}
