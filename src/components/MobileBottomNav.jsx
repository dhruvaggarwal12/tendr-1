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
  { emoji: "🎁", label: "Gift Hampers",path: "/gift-hampers-cakes" },
];

const NAV_COLORS = {
  Home:     { active: "#F59E0B", bg: "rgba(245,158,11,0.12)",  shadow: "rgba(245,158,11,0.4)" },
  Browse:   { active: "#F97316", bg: "rgba(249,115,22,0.12)",  shadow: "rgba(249,115,22,0.4)" },
  Products: { active: "#EC4899", bg: "rgba(236,72,153,0.12)",  shadow: "rgba(236,72,153,0.4)" },
  Plan:     { active: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  shadow: "rgba(139,92,246,0.4)" },
  Profile:  { active: "#0EA5E9", bg: "rgba(14,165,233,0.12)",  shadow: "rgba(14,165,233,0.4)" },
};

const NAV_ICONS = {
  Home: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? color : "none"} stroke={on ? color : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  ),
  Browse: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#bbb"} strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plan: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Chats: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Profile: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Products: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="6" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/>
      <rect x="2" y="11" width="6" height="6" rx="1"/><rect x="9" y="11" width="6" height="6" rx="1"/><rect x="16" y="11" width="6" height="6" rx="1"/>
    </svg>
  ),
};

function BottomNavInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((s) => s.auth);
  const finalisedVendors = useSelector((s) => s.listingFilters?.finalisedVendors || {});
  const ghCartCount = useSelector((s) => s.giftHamperCart?.items?.length || 0);
  const finalisedCount = Object.keys(finalisedVendors).length;
  const [visible, setVisible] = useState(true);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
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

  // Close sheets + reset visible on route change
  useEffect(() => {
    setVisible(true);
    setBrowseOpen(false);
    setProductsOpen(false);
  }, [location.pathname]);

  const shouldHide = HIDE_PATHS.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (paths) =>
    paths.some((p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  const PRODUCTS = [
    { emoji: "✅", label: "Checklist",        href: "/checklist-picker" },
    { emoji: "⏱️", label: "Timeline",         href: "/timeline-picker" },
    { emoji: "💰", label: "Budget Allocator", href: "/budget-picker" },
    { emoji: "🎨", label: "Decor Finder",     href: "/decor-finder" },
    ...(user?.isAdmin ? [{ emoji: "🎉", label: "Occasions", href: null, newTab: true, path: "/occasions" }] : []),
  ];

  const items = [
    { label: "Home",     paths: ["/"],                                onTap: () => navigate("/") },
    { label: "Browse",   paths: ["/listings","/top-rated","/search"], onTap: () => { setProductsOpen(false); setBrowseOpen(o => !o); } },
    { label: "Products", paths: ["/checklist","/timeline","/budget","/decor"], onTap: () => { setBrowseOpen(false); setProductsOpen(o => !o); } },
    { label: "Plan",     paths: ["/booking","/plan-event"],           onTap: () => navigate("/booking") },
    { label: "Profile",  paths: ["/dashboard","/AdminDashboard"],     onTap: () => navigate(token ? (user?.isAdmin ? "/AdminDashboard" : "/dashboard") : "/login") },
  ];

  return (
    <div className="mobile-bottom-nav-root">
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

            {/* Category grid — auto-fills based on count */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
              {[
                ...CATEGORIES,
                ...(user?.isAdmin ? [{ emoji: "🎉", label: "Plan by Occasion", path: null, newTab: true }] : []),
              ].map(({ emoji, label, path, newTab }) => (
                <button key={label}
                  onClick={() => { if (newTab) { window.open("/occasions", "_blank"); setBrowseOpen(false); } else { navigate(path); setBrowseOpen(false); } }}
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

      {/* Our Products popup sheet */}
      {productsOpen && (
        <>
          <div onClick={() => setProductsOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 99991 }} />
          <div style={{ position: "fixed", bottom: 60, left: 0, right: 0, zIndex: 99992, background: "#FFFCF5", borderRadius: "20px 20px 0 0", boxShadow: "0 -6px 32px rgba(139,69,19,0.18)", padding: "10px 20px 20px", fontFamily: font, animation: "sheet-up 0.24s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(196,122,46,0.25)" }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", margin: "0 0 14px" }}>Our Products</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {PRODUCTS.map(({ emoji, label, href, newTab, path }) => {
                const savedKey = label === "Checklist" ? "tendr_checklist_saved" : label === "Timeline" ? "tendr_timeline_saved" : label === "Budget Allocator" ? "tendr_budget_saved" : null;
                const isSaved = savedKey ? (() => { try { return localStorage.getItem(savedKey) === "true"; } catch { return false; } })() : false;
                return (
                  <button key={label}
                    onClick={() => { if (newTab) { window.open(path, "_blank"); } else { navigate(href); } setProductsOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 14, border: `1.5px solid ${isSaved ? "rgba(34,197,94,0.3)" : "rgba(196,122,46,0.15)"}`, background: isSaved ? "rgba(34,197,94,0.04)" : "#fff", cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(196,122,46,0.08)", position: "relative" }}
                    onTouchStart={e => e.currentTarget.style.background = "rgba(196,122,46,0.06)"}
                    onTouchEnd={e => e.currentTarget.style.background = isSaved ? "rgba(34,197,94,0.04)" : "#fff"}
                  >
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", textAlign: "left", lineHeight: 1.3, flex: 1 }}>{label}</span>
                    {isSaved && <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.12)", borderRadius: 100, padding: "2px 7px", flexShrink: 0 }}>✓ Saved</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Floating Review & Pay bar — appears above nav when vendor finalised */}
      {(finalisedCount > 0 || ghCartCount > 0) && (
        <div style={{
          position: "fixed",
          bottom: 60,
          left: 0, right: 0,
          zIndex: 89990,
          background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
          padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 -3px 16px rgba(196,122,46,0.4)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s ease",
          fontFamily: font,
        }}>
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>
              {finalisedCount > 0 ? `${finalisedCount} vendor${finalisedCount > 1 ? "s" : ""} confirmed` : "Gift hampers in cart 🎁"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Tap to review & pay</div>
          </div>
          <button
            onClick={() => navigate("/booking/review")}
            style={{ background: "#fff", color: "#C47A2E", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            Review & Pay →
          </button>
        </div>
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
          const isOn = active || isBrowseActive;
          const navColor = NAV_COLORS[label] || NAV_COLORS.Home;
          // Green dot: Products tab gets a dot if any tool has been saved
          const hasProductsSaved = label === "Products" && (() => {
            try {
              return localStorage.getItem("tendr_checklist_saved") === "true" ||
                     localStorage.getItem("tendr_timeline_saved") === "true" ||
                     localStorage.getItem("tendr_budget_saved") === "true";
            } catch { return false; }
          })();
          return (
            <button
              key={label}
              onClick={onTap}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 3, border: "none",
                background: isOn ? navColor.bg : "transparent",
                cursor: "pointer", padding: "6px 0 4px",
                position: "relative",
                WebkitTapHighlightColor: "transparent",
                outline: "none", fontFamily: font,
                transition: "background 0.18s",
              }}
            >
              {/* Active bar at top */}
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: isOn ? 32 : 0, height: 3, borderRadius: "0 0 6px 6px",
                background: navColor.active,
                boxShadow: isOn ? `0 2px 8px ${navColor.shadow}` : "none",
                transition: "width 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s",
              }} />
              {/* Icon wrapper with colored glow ring when active */}
              <div style={{
                position: "relative",
                padding: isOn ? "4px 6px" : "0",
                borderRadius: 10,
                background: isOn ? `${navColor.active}18` : "transparent",
                transition: "all 0.18s",
              }}>
                {Icon(isOn, navColor.active)}
                {hasProductsSaved && (
                  <div style={{ position: "absolute", top: isOn ? 2 : -2, right: isOn ? 3 : -3, width: 8, height: 8, borderRadius: "50%", background: "#22c55e", border: "1.5px solid #FFFCF5" }} />
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isOn ? 800 : 400,
                color: isOn ? navColor.active : "#999",
                lineHeight: 1, letterSpacing: "0.01em",
                transition: "color 0.18s, font-weight 0.18s",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        /* Hide EVERYTHING in this portal on desktop — the entire root wrapper */
        @media (min-width: 768px) { .mobile-bottom-nav-root { display: none !important; } }
        @media (max-height: 450px) { .mobile-bottom-nav-root { display: none !important; } }
      `}</style>
    </div>
  );
}

export default function MobileBottomNav() {
  return createPortal(<BottomNavInner />, document.body);
}
