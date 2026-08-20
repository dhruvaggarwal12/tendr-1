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
  "/chat",
];

const ic = (d, extra) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}{extra}</svg>
);
const CATEGORIES = [
  { icon: ic(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>), label: "Photography", path: "/search?categories=Photographer" },
  { icon: ic(<><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></>), label: "Catering", path: "/search?categories=Caterer" },
  { icon: ic(<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>), label: "DJ & Music", path: "/search?categories=DJ" },
  { icon: ic(<><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.47-.688-.47-1.125A1.64 1.64 0 0 1 14.828 17h1.93C19.858 17 22 14.858 22 12 22 6.477 17.523 2 12 2z"/></>), label: "Decoration", path: "/search?categories=Decorator" },
  { icon: ic(<><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>), label: "Gift Hampers", path: "/gift-hampers-cakes" },
  { icon: ic(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>), label: "Wedding Stationeries", path: "/stationery" },
];

const NAV_COLORS = {
  Home:     { active: "#C47A2E", bg: "rgba(196,122,46,0.14)", shadow: "rgba(196,122,46,0.5)" },
  Browse:   { active: "#C47A2E", bg: "rgba(196,122,46,0.14)", shadow: "rgba(196,122,46,0.5)" },
  Tools: { active: "#C47A2E", bg: "rgba(196,122,46,0.14)", shadow: "rgba(196,122,46,0.5)" },
  Plan:     { active: "#C47A2E", bg: "rgba(196,122,46,0.14)", shadow: "rgba(196,122,46,0.5)" },
  Profile:  { active: "#C47A2E", bg: "rgba(196,122,46,0.14)", shadow: "rgba(196,122,46,0.5)" },
  Tips:     { active: "#4F8EF7", bg: "rgba(79,142,247,0.12)", shadow: "rgba(79,142,247,0.4)" },
};

const NAV_ICONS = {
  Home: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? color : "none"} stroke={on ? color : "#BFA080"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  ),
  Browse: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#BFA080"} strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plan: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#BFA080"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Chats: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#BFA080"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Profile: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#BFA080"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Tools: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#BFA080"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="6" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/>
      <rect x="2" y="11" width="6" height="6" rx="1"/><rect x="9" y="11" width="6" height="6" rx="1"/><rect x="16" y="11" width="6" height="6" rx="1"/>
    </svg>
  ),
  Tips: (on, color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? color : "#BFA080"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 015.29 11.56l-.01.01A4.98 4.98 0 0015 17v1H9v-1a4.98 4.98 0 00-2.28-3.43A7 7 0 0112 2z"/>
      <line x1="9" y1="21" x2="15" y2="21"/>
    </svg>
  ),
};

function BottomNavInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((s) => s.auth);
  const finalisedVendors = useSelector((s) => s.listingFilters?.finalisedVendors || {});
  const finalisedCount = Object.keys(finalisedVendors).length;
  const [visible, setVisible] = useState(true);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollTimer = useRef(null);

  // Hide while scrolling, show 400ms after scroll stops
  useEffect(() => {
    const onScroll = () => {
      setVisible(false);
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setVisible(true), 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(scrollTimer.current); };
  }, []);

  // Close sheets + reset visible on route change
  useEffect(() => {
    setVisible(true);
    setBrowseOpen(false);
    setProductsOpen(false);
    setPlanOpen(false);
    setTipsOpen(false);
  }, [location.pathname]);

  // Listen for drawer open/close events (WS cart, quick view, etc.)
  useEffect(() => {
    const h = () => setDrawerOpen((window.__tendrDrawers?.size || 0) > 0);
    window.addEventListener('tendr:drawer', h);
    return () => window.removeEventListener('tendr:drawer', h);
  }, []);

  const shouldHide = HIDE_PATHS.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;
  if (drawerOpen) return null;

  const fromPlan = location.pathname === "/listings" && new URLSearchParams(location.search).get("fromPlan") === "1";

  const isActive = (paths, label) => {
    if (fromPlan) {
      if (label === "Plan") return true;
      if (label === "Browse") return false;
    }
    return paths.some((p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));
  };

  const isHomePage = location.pathname === "/";

  const PRODUCTS = [
    { icon: ic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>), label: "Timeline",         href: "/timeline-picker" },
    { icon: ic(<><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></>), label: "Budget Allocator", href: "/budget-picker" },
    { icon: ic(<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>), label: "Find by Style",    href: "/find-by-style" },
  ];

  const items = [
    { label: "Home",     paths: ["/"],                                onTap: () => navigate("/") },
    { label: "Browse", paths: ["/listings","/search"], onTap: () => { setProductsOpen(false); setTipsOpen(false); setBrowseOpen(o => !o); } },
    { label: "Tools", paths: ["/checklist","/timeline","/budget","/decor"], onTap: () => { setBrowseOpen(false); setTipsOpen(false); setProductsOpen(o => !o); } },
    { label: "Plan",     paths: ["/booking","/plan-event","/baat-karo"], onTap: () => { setBrowseOpen(false); setProductsOpen(false); setTipsOpen(false); setPlanOpen(o => !o); } },
    { label: "Tips", paths: ["/guides","/community"], onTap: () => { setBrowseOpen(false); setProductsOpen(false); setPlanOpen(false); setTipsOpen(o => !o); } },
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 99991, pointerEvents: "auto" }}
          />
          {/* Sheet — sits just above the nav bar */}
          <div style={{
            position: "fixed", bottom: "calc(60px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0,
            zIndex: 99992, pointerEvents: "auto",
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
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", margin: "0 0 12px" }}>Browse Vendors</p>

            {/* Register as Vendor — top of sheet for visibility */}
            <button
              onClick={() => { navigate("/vendor/register"); setBrowseOpen(false); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.35)", background: "rgba(196,122,46,0.06)", cursor: "pointer", fontFamily: font, marginBottom: 12, boxShadow: "0 2px 8px rgba(196,122,46,0.08)" }}
              onTouchStart={e => e.currentTarget.style.background = "rgba(196,122,46,0.12)"}
              onTouchEnd={e => e.currentTarget.style.background = "rgba(196,122,46,0.06)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#7A4A1E" }}>Register as Vendor</div>
                <div style={{ fontSize: 11, color: "#9B7450", marginTop: 1 }}>List your business on Tendr</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 14, color: "#C47A2E" }}>→</span>
            </button>

            {/* Category grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
              {[
                ...CATEGORIES,
                { icon: ic(<><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>), label: "Fun Activities", path: "/fun-activities" },
              ].map(({ icon, label, path, soon }) => (
                <button key={label}
                  onClick={() => { navigate(path); setBrowseOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(196,122,46,0.08)", transition: "background 0.15s", position: "relative" }}
                  onTouchStart={e => e.currentTarget.style.background = "rgba(196,122,46,0.06)"}
                  onTouchEnd={e => e.currentTarget.style.background = "#fff"}
                >
                  {soon && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 9, fontWeight: 800, color: "#C47A2E", background: "rgba(196,122,46,0.12)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 100, padding: "1px 5px", letterSpacing: "0.04em" }}>SOON</span>}
                  <span style={{ color: "#7A5535", display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", textAlign: "left", lineHeight: 1.3 }}>{label}</span>
                </button>
              ))}
            </div>

            {/* All Vendors full-width button */}
            <button
              onClick={() => { navigate("/listings"); setBrowseOpen(false); }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
              Browse All Vendors →
            </button>
          </div>
        </>
      )}

      {/* Plan options sheet */}
      {planOpen && (
        <>
          <div onClick={() => setPlanOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 99991, pointerEvents: "auto" }} />
          <div style={{ position: "fixed", bottom: "calc(60px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, zIndex: 99992, pointerEvents: "auto", background: "#FFFCF5", borderRadius: "20px 20px 0 0", boxShadow: "0 -6px 32px rgba(139,69,19,0.18)", padding: "10px 20px 20px", fontFamily: font, animation: "sheet-up 0.24s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(196,122,46,0.25)" }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", margin: "0 0 14px" }}>How do you want to plan?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: ic(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>), title: "You Do It", desc: "Browse vendors, compare & book yourself", path: "/booking", active: location.pathname === "/booking" || location.pathname.startsWith("/plan-event") },
                { icon: ic(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>), title: "Smart Planner", desc: "Tell us once, we build your full package", path: "/booking", active: false },
                { icon: ic(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>), title: "Baat Karo", desc: "Likh do apni requirements — Tendr Team yahin reply karegi", path: "/baat-karo", active: location.pathname === "/baat-karo", green: true },
                { icon: ic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>), title: "Plan by Occasion", desc: "Birthday, Anniversary, House Party & more", path: null, active: false, action: () => { setPlanOpen(false); navigate("/"); setTimeout(() => document.getElementById("plan-by-occasion")?.scrollIntoView({ behavior: "smooth" }), 150); } },
              ].map(({ icon, title, desc, path, active, green, action }) => (
                <button key={title}
                  onClick={() => { if (action) { action(); } else { navigate(path); setPlanOpen(false); } }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${active ? (green ? "rgba(37,211,102,0.5)" : "rgba(196,122,46,0.5)") : "rgba(196,122,46,0.15)"}`, background: active ? (green ? "rgba(37,211,102,0.06)" : "rgba(196,122,46,0.06)") : "#fff", cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(196,122,46,0.08)", textAlign: "left" }}
                  onTouchStart={e => e.currentTarget.style.background = "rgba(196,122,46,0.08)"}
                  onTouchEnd={e => e.currentTarget.style.background = active ? (green ? "rgba(37,211,102,0.06)" : "rgba(196,122,46,0.06)") : "#fff"}>
                  <span style={{ color: green ? "#25D366" : "#7A5535", display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", display: "flex", alignItems: "center", gap: 6 }}>
                      {title}
                      {active && <span style={{ fontSize: 9, fontWeight: 800, color: green ? "#25D366" : "#C47A2E", background: green ? "rgba(37,211,102,0.12)" : "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 7px" }}>Active</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Our Products popup sheet */}
      {productsOpen && (
        <>
          <div onClick={() => setProductsOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 99991, pointerEvents: "auto" }} />
          <div style={{ position: "fixed", bottom: "calc(60px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, zIndex: 99992, pointerEvents: "auto", background: "#FFFCF5", borderRadius: "20px 20px 0 0", boxShadow: "0 -6px 32px rgba(139,69,19,0.18)", padding: "10px 20px 20px", fontFamily: font, animation: "sheet-up 0.24s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(196,122,46,0.25)" }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", margin: "0 0 14px" }}>Our Tools</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {PRODUCTS.map(({ icon, label, href, newTab, path }) => {
                const savedKey = label === "Timeline" ? "tendr_timeline_v2" : label === "Budget Allocator" ? "tendr_budget_v2" : null;
                const isSaved = savedKey ? (() => { try { return !!localStorage.getItem(savedKey); } catch { return false; } })() : false;
                return (
                  <button key={label}
                    onClick={() => { if (newTab) { window.open(path, "_blank"); } else { navigate(href); } setProductsOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 14, border: `1.5px solid ${isSaved ? "rgba(34,197,94,0.3)" : "rgba(196,122,46,0.15)"}`, background: isSaved ? "rgba(34,197,94,0.04)" : "#fff", cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(196,122,46,0.08)", position: "relative" }}
                    onTouchStart={e => e.currentTarget.style.background = "rgba(196,122,46,0.06)"}
                    onTouchEnd={e => e.currentTarget.style.background = isSaved ? "rgba(34,197,94,0.04)" : "#fff"}
                  >
                    <span style={{ color: "#7A5535", display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", textAlign: "left", lineHeight: 1.3, flex: 1 }}>{label}</span>
                    {isSaved && <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.12)", borderRadius: 100, padding: "2px 7px", flexShrink: 0 }}>✓ Saved</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tips by Tendr popup sheet */}
      {tipsOpen && (
        <>
          <div onClick={() => setTipsOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99991, pointerEvents: "auto" }} />
          <div style={{ position: "fixed", bottom: "calc(60px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, zIndex: 99992, pointerEvents: "auto", background: "#0F1629", borderRadius: "20px 20px 0 0", boxShadow: "0 -6px 32px rgba(0,0,0,0.5)", padding: "10px 20px 24px", fontFamily: font, animation: "sheet-up 0.24s cubic-bezier(0.4,0,0.2,1)", borderTop: "1px solid rgba(79,142,247,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(79,142,247,0.25)" }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#4F8EF7", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", margin: "0 0 16px" }}>Tips by Tendr</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Guide Store */}
              <button
                onClick={() => { navigate("/guides"); setTipsOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: 14, border: "1px solid rgba(79,142,247,0.2)", background: "#0A0E1A", cursor: "pointer", fontFamily: font, textAlign: "left" }}
                onTouchStart={(e) => e.currentTarget.style.background = "rgba(79,142,247,0.08)"}
                onTouchEnd={(e) => e.currentTarget.style.background = "#0A0E1A"}
              >
                <span style={{ color: "#4F8EF7", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Guide Store</div>
                  <div style={{ fontSize: 12, color: "#7A8BA8", marginTop: 2 }}>Free event planning guides — unlock with WhatsApp</div>
                </div>
              </button>
              {/* Community Wall */}
              <button
                onClick={() => { navigate("/community"); setTipsOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: 14, border: "1px solid rgba(79,142,247,0.2)", background: "#0A0E1A", cursor: "pointer", fontFamily: font, textAlign: "left" }}
                onTouchStart={(e) => e.currentTarget.style.background = "rgba(79,142,247,0.08)"}
                onTouchEnd={(e) => e.currentTarget.style.background = "#0A0E1A"}
              >
                <span style={{ color: "#4F8EF7", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Community Wall</div>
                  <div style={{ fontSize: 12, color: "#7A8BA8", marginTop: 2 }}>See real events shared by customers — photos, setups, ideas</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav
        className="mobile-bottom-nav"
        data-tour="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 99990,
          height: "calc(60px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "rgba(255,252,245,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1.5px solid rgba(196,122,46,0.28)",
          boxShadow: "0 -4px 24px rgba(139,69,19,0.16)",
          display: "flex",
          alignItems: "flex-start",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s ease",
          pointerEvents: visible ? "auto" : "none",
          fontFamily: font,
          boxSizing: "border-box",
        }}
      >
        {items.map(({ label, paths, onTap }) => {
          const active = isActive(paths, label);
          const Icon = NAV_ICONS[label];
          const isBrowseActive = label === "Browse" && browseOpen;
          const isOn = active || isBrowseActive;
          const navColor = NAV_COLORS[label] || NAV_COLORS.Home;
          // Green dot: Products tab gets a dot if any tool has been saved
          const hasProductsSaved = label === "Tools" && (() => {
            try {
              return !!localStorage.getItem("tendr_timeline_v2") ||
                     !!localStorage.getItem("tendr_budget_v2");
            } catch { return false; }
          })();
          return (
            <button
              key={label}
              onClick={onTap}
              data-tour={`mob-nav-${label.toLowerCase()}`}
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
                touchAction: "manipulation",
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
                fontSize: 9, fontWeight: isOn ? 700 : 400,
                color: isOn ? navColor.active : "#B08060",
                lineHeight: 1, letterSpacing: "0.01em",
                transition: "color 0.18s, font-weight 0.18s",
              }}>
                {label}
              </span>
              {/* Active dot below label */}
              <div style={{
                width: isOn ? 4 : 0, height: 4, borderRadius: "50%",
                background: navColor.active,
                marginTop: 2,
                transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
              }} />
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
