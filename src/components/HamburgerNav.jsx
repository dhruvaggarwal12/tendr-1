import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { removeVendorFromCompare, clearVendorCompare, clearFinalisedVendor } from "../redux/listingFiltersSlice";
import { useChatOverlay } from "../context/ChatContext";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";
import { FaChevronDown, FaTimes, FaInstagram, FaFacebookF } from "react-icons/fa";

const font = "'Outfit', sans-serif";
const STEPS = ["Plan", "Browse", "Chat", "Pay"];
const SIDEBAR_W = 220; // px

const BASE_SPLITS = {
  Caterer:      { pct: 40, emoji: "🍽️", label: "Catering" },
  Decorator:    { pct: 25, emoji: "🎨", label: "Decoration" },
  Photographer: { pct: 20, emoji: "📸", label: "Photography" },
  DJ:           { pct: 15, emoji: "🎵", label: "DJ & Music" },
  Anchor:       { pct: 10, emoji: "🎤", label: "Anchor" },
  Transport:    { pct: 8,  emoji: "🚗", label: "Transport" },
  Mehendi:      { pct: 8,  emoji: "🌿", label: "Mehendi" },
  Makeup:       { pct: 12, emoji: "💄", label: "Makeup" },
};

function normalizeSplit(services, budget) {
  const raw   = services.map(s => ({ s, pct: BASE_SPLITS[s]?.pct ?? 10 }));
  const total = raw.reduce((a, b) => a + b.pct, 0);
  return raw.map(r => ({
    service: r.s,
    pct:    Math.round((r.pct / total) * 100),
    amount: Math.round((r.pct / total) * budget),
    emoji:  BASE_SPLITS[r.s]?.emoji ?? "✦",
    label:  BASE_SPLITS[r.s]?.label ?? r.s,
  }));
}

function fmtINR(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }

// title: shown in center; showReviewPay: Review & Pay button; active: journey step
// noSidebar: force drawer mode (use on form-filling pages like EventPlanning)
export default function HamburgerNav({ title = "", showReviewPay = false, active = "", noSidebar = false, noCompare = false }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();
  const { openVendorChat } = useChatOverlay();

  // Track viewport width — sidebar only on desktop (≥1024px)
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fixed sidebar mode = desktop AND not explicitly disabled
  const isSidebar = isDesktop && !noSidebar;

  // All state declared before any useEffect that references them
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [savedOpen,     setSavedOpen]     = useState(false);
  const [reviewPopup,   setReviewPopup]   = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [showSuggest,   setShowSuggest]   = useState(false);
  const profileRef = useRef(null);

  const SEARCH_SUGGESTIONS = [
    { text: "Photographers in Delhi", cat: "Photographer", loc: "Delhi" },
    { text: "Caterers in Noida", cat: "Caterer", loc: "Noida" },
    { text: "DJ for birthday party", cat: "DJ" },
    { text: "Wedding decorators", cat: "Decorator" },
    { text: "Photographers in Ghaziabad", cat: "Photographer", loc: "Ghaziabad" },
  ];
  const SVC_KW = { caterer: "Caterer", catering: "Caterer", food: "Caterer", decorator: "Decorator", decoration: "Decorator", decor: "Decorator", photographer: "Photographer", photography: "Photographer", dj: "DJ", music: "DJ" };
  const LOC_KW = ["delhi", "noida", "gurgaon", "gurugram", "ghaziabad", "greater noida", "faridabad"];

  const handleNavSearch = (q) => {
    const query = (q || searchQuery).toLowerCase();
    if (!query.trim()) return;
    const cats = [...new Set(Object.entries(SVC_KW).filter(([k]) => query.includes(k)).map(([,v]) => v))];
    const loc = LOC_KW.find(l => query.includes(l));
    const locParam = loc ? loc.split(' ').map(w => w[0].toUpperCase()+w.slice(1)).join(' ') : '';
    if (cats.length === 1) navigate(`/top-rated/${cats[0]}${locParam ? `?location=${locParam}` : ''}`);
    else if (cats.length > 1) navigate(`/listings?serviceTypes=${cats.join(',')}${locParam ? `&location=${locParam}` : ''}`);
    else navigate(`/listings${locParam ? `?location=${encodeURIComponent(locParam)}` : ''}`);
    setSearchQuery(""); setShowSuggest(false);
  };

  const filteredSuggestions = searchQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_SUGGESTIONS.slice(0, 4);

  const { user, token } = useSelector((s) => s.auth);
  const compareSelected  = useSelector((s) => s.listingFilters.compareSelected || []);
  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const finalisedCount   = Object.keys(finalisedVendors).length;
  const ghCartCount      = useSelector(s => s.giftHamperCart?.items?.length || 0);

  // Push body content right when sidebar is active and open
  useEffect(() => {
    if (isSidebar && sidebarOpen) {
      document.body.style.marginLeft = `${SIDEBAR_W}px`;
    } else {
      document.body.style.marginLeft = "";
    }
    return () => { document.body.style.marginLeft = ""; };
  }, [isSidebar, sidebarOpen]);
  const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80";

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Check backend: if user has a paid EventPlan, silently clear Review & Pay state
  useEffect(() => {
    if (!token || !finalisedCount || user?.isAdmin) return;
    const BASE = import.meta.env.VITE_BASE_URL;
    fetch(`${BASE}/event-plans`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const plans = data.plans || data.eventPlans || (Array.isArray(data) ? data : []);
        const hasPaid = plans.some(p => ["in_progress", "completed"].includes(p.status));
        if (hasPaid) {
          dispatch(clearFinalisedVendor());
          try {
            localStorage.removeItem("tendr_finalised");
            Object.keys(localStorage).filter(k => k.startsWith("finalisedVendors_")).forEach(k => localStorage.removeItem(k));
          } catch {}
        }
      })
      .catch(() => {});
  }, [token, finalisedCount]); // eslint-disable-line

  const close = () => setDrawerOpen(false);

  const listingServiceType  = useSelector((s) => s.listingFilters.serviceType);
  const formData            = useSelector((s) => s.eventPlanning.formData || {});
  const formEventType       = formData.eventType;
  const selectedVendors     = useSelector((s) => s.eventPlanning.selectedVendors || []);

  // Form is fully filled only when ALL 5 fields are answered
  const isFormFilled = !!(
    (formData.eventType && formData.guests && formData.budget && formData.location && formData.date) ||
    finalisedCount > 0 ||
    (() => {
      try {
        const d = JSON.parse(localStorage.getItem("tendr_ep_session") || "{}");
        const fd = d.formData || {};
        return !!(fd.eventType && fd.guests && fd.budget && fd.location && fd.date);
      } catch { return false; }
    })()
  );
  // Disable Browse Vendors for logged-in non-admin customers who haven't filled the whole form
  const browseDisabled = !!(token && !user?.isAdmin && !isFormFilled);

  // Pages where the user is deep in the vendor flow — always send to listings
  const vendorFlowPaths = ["/listings", "/vendor/", "/booking/review", "/booking/payment", "/chat", "/chats", "/dashboard", "/top-rated"];
  const isOnVendorFlow = vendorFlowPaths.some(p => location.pathname.startsWith(p));

  const handleBrowseVendors = () => {
    if (browseDisabled) { navigate("/booking"); return; }
    navigate("/listings");
  };


  const NAV_SECTIONS = [
    { label: "Vendors", items: [
      { label: "Browse Vendors",       href: "/listings",   onClickOverride: handleBrowseVendors, disabled: browseDisabled },
      { label: "Top Rated Vendors",    href: "/top-rated/Photographer" },
      { label: "Register as Vendor",   href: "/vendor/register" },
    ]},
    { label: "Our Products", items: [
      { label: "✅ Checklist",          href: "/checklist-picker" },
      { label: "⏱️ Timeline",           href: "/timeline-picker" },
      { label: "💰 Budget Allocator",   href: "/budget-picker" },
      { label: "💳 Payment Tracker",    href: "/payment-tracker" },
      { label: "👥 Guest List",         href: "/guest-list" },
      { label: "🎨 Decor Finder",       href: "/decor-finder" },
      { label: "💒 Wedding Stationery", href: "/stationery", comingSoon: !user?.isAdmin },
      { label: "✉️ Invitation Flyers",  href: "/invitation" },
      { label: "🎬 Aftermovie",         href: "/aftermovie" },
    ]},
    { label: "Gift & Hampers", items: [
      { label: "Gift Hampers & Cakes", href: "/gift-hampers-cakes" },
    ]},
    { label: "Booking", items: [
      { label: "Plan Your Event",      href: "/booking" },
    ]},
    { label: "Company", items: [
      { label: "About Us",             href: "/about-us" },
      { label: "Contact Us",           href: "/contact-us" },
    ]},
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR MODE (desktop ≥1024px, default)
  // ─────────────────────────────────────────────────────────────────────────
  if (isSidebar) {
    return (
      <>
        {/* Collapse arrow — shows when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ position: "fixed", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 201, width: 22, height: 48, background: "linear-gradient(180deg,#3D2410,#2C1A0C)", border: "none", borderRadius: "0 8px 8px 0", color: "#CCAB4A", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 0 12px rgba(0,0,0,0.2)" }}
            title="Open navigation"
          >›</button>
        )}

        {/* Fixed left sidebar */}
        {sidebarOpen && (
        <aside style={{
          position: "fixed", left: 0, top: 0, zIndex: 200,
          width: SIDEBAR_W, height: "100vh",
          background: "linear-gradient(180deg,#3D2410 0%,#2C1A0C 100%)",
          display: "flex", flexDirection: "column",
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          overflowY: "auto", overflowX: "hidden",
          fontFamily: font,
        }}>
          {/* Logo + collapse arrow */}
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <img src={tendrLogo} alt="Tendr" onClick={() => navigate("/")} style={{ height: 28, cursor: "pointer", filter: "brightness(1.1)", display: "block" }} />
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "5px 0 0", letterSpacing: "0.04em" }}>We Curate, You Celebrate</p>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              title="Close navigation"
            >‹</button>
          </div>

          {/* Journey progress — shown when active prop is passed */}
          {active && (
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: "rgba(204,171,74,0.7)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px" }}>Your Journey</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                {STEPS.map((step, i) => {
                  const activeIdx = STEPS.indexOf(active);
                  const isDone   = i < activeIdx;
                  const isActive = i === activeIdx;
                  return (
                    <React.Fragment key={step}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: isDone ? "#C47A2E" : isActive ? "rgba(196,122,46,0.2)" : "rgba(255,255,255,0.08)", border: isActive ? "2px solid #C47A2E" : isDone ? "2px solid #C47A2E" : "2px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: isDone ? "#fff" : isActive ? "#C47A2E" : "rgba(255,255,255,0.3)" }}>
                          {isDone ? "✓" : i + 1}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, color: isActive ? "#FFCC66" : isDone ? "#CCAB4A" : "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{step}</span>
                      </div>
                      {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, background: isDone ? "#C47A2E" : "rgba(255,255,255,0.1)", margin: "0 4px 14px", borderRadius: 2 }} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(196,122,46,0.1)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,122,46,0.2)" }}>
              <span style={{ fontSize: 12, color: "#CCAB4A", flexShrink: 0 }}>🔍</span>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onKeyDown={e => { if (e.key === "Enter") handleNavSearch(); }}
                placeholder="Search vendors..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12, fontFamily: font, color: "#fff" }}
              />
              {searchQuery && <button onClick={() => { setSearchQuery(""); setShowSuggest(false); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>}
            </div>
            {showSuggest && (
              <div style={{ position: "absolute", left: 10, right: 10, top: "calc(100% - 4px)", background: "#FFFEF9", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: "1px solid rgba(196,122,46,0.12)", padding: 4, zIndex: 300 }}>
                {filteredSuggestions.map((s, i) => (
                  <button key={i} onClick={() => handleNavSearch(s.text)}
                    style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: "#3B2F2F", fontFamily: font }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(196,122,46,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    🔍 {s.text}
                  </button>
                ))}
                {filteredSuggestions.length === 0 && <div style={{ padding: "8px 10px", fontSize: 12, color: "#9B7450" }}>Press Enter to search</div>}
              </div>
            )}
          </div>

          {/* User info */}
          {token && user && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => navigate("/dashboard")} style={{ flex: 1, padding: "6px", borderRadius: 7, border: "1px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.1)", color: "#CCAB4A", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Dashboard</button>
              </div>
              {/* Review & Pay if vendors finalised or gift hampers in cart */}
              {(finalisedCount > 0 || ghCartCount > 0) && (
                <button onClick={() => navigate("/booking/review")} style={{ width: "100%", marginTop: 7, padding: "7px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Review & Pay ({finalisedCount}) →
                </button>
              )}
            </div>
          )}

          {/* My Services checklist */}
          {selectedVendors.length > 0 && (
            <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: "rgba(204,171,74,0.75)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>My Services</p>
              {selectedVendors.map(svc => {
                const isBooked = !!finalisedVendors[svc];
                return (
                  <div key={svc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: isBooked ? "#22c55e" : "rgba(196,122,46,0.15)", border: isBooked ? "none" : "1.5px solid rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>
                      {isBooked ? "✓" : ""}
                    </div>
                    <span style={{ flex: 1, fontSize: 12, color: isBooked ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", fontWeight: isBooked ? 700 : 400 }}>{svc}</span>
                    <button
                      onClick={() => navigate(`/listings?serviceType=${encodeURIComponent(svc)}`)}
                      style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 6, border: "none", background: isBooked ? "rgba(34,197,94,0.18)" : "rgba(196,122,46,0.22)", color: isBooked ? "#4ade80" : "#CCAB4A", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                    >
                      {isBooked ? "✓ Done" : "Browse →"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gift Hampers quick-link */}
          {token && user && (
            <div style={{ padding: "8px 16px 8px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <button onClick={() => navigate("/gift-hampers-cakes")}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", background: "rgba(196,122,46,0.07)", cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; }}
              >
                <span style={{ fontSize: 17 }}>🎁</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#CCAB4A" }}>Gift Hampers &amp; Cakes</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(204,171,74,0.6)" }}>→</span>
              </button>
            </div>
          )}

          {/* Nav sections */}
          <div style={{ padding: "8px 0" }}>
            {NAV_SECTIONS.map((sec, si) => (
              <div key={sec.label} style={{ marginBottom: 2 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(204,171,74,0.75)", textTransform: "uppercase", letterSpacing: "0.14em", padding: "8px 18px 4px" }}>{sec.label}</div>
                {sec.items.map(item => {
                  const isSoon     = !!item.comingSoon;
                  const isDisabled = !!item.disabled;
                  const isActive   = !isSoon && !isDisabled && (location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href)));
                  if (isSoon) {
                    return (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px 9px 14px", borderLeft: "3px solid transparent" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: font }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(204,171,74,0.15)", color: "#CCAB4A", padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>Soon</span>
                      </div>
                    );
                  }
                  if (isDisabled) {
                    return (
                      <div key={item.label} title="Fill your event details first" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px 9px 14px", borderLeft: "3px solid transparent", opacity: 0.4, cursor: "not-allowed" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: font }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#CCAB4A", flexShrink: 0 }}>fill form first</span>
                      </div>
                    );
                  }
                  return (
                    <button key={item.label}
                      onClick={() => item.onClickOverride ? item.onClickOverride() : navigate(item.href)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", textAlign: "left",
                        padding: "9px 18px 9px 14px", border: "none",
                        background: isActive ? "rgba(196,122,46,0.18)" : "transparent",
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#FFCC66" : "rgba(255,255,255,0.85)",
                        cursor: "pointer",
                        fontFamily: font, transition: "all 0.15s", borderRadius: 0,
                        borderLeft: isActive ? "3px solid #C9A84C" : "3px solid transparent",
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(196,122,46,0.1)"; e.currentTarget.style.color = "#fff"; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                    </button>
                  );
                })}
                {si < NAV_SECTIONS.length - 1 && (
                  <div style={{ height: 1, background: "rgba(196,122,46,0.08)", margin: "4px 18px" }} />
                )}
              </div>
            ))}
          </div>

          {/* Bottom: logout */}
          {token && user && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
              <button onClick={() => { dispatch(logout()); navigate("/"); }}
                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid rgba(192,57,43,0.25)", background: "rgba(192,57,43,0.08)", color: "#e74c3c", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                Logout
              </button>
            </div>
          )}
        </aside>
        )}

        {/* Top bar for title — sits to the right of sidebar on desktop */}
        {title && (
          <div style={{
            position: "sticky", top: 0, zIndex: 100,
            height: 48, background: "rgba(255,252,245,0.97)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(196,122,46,0.1)",
            boxShadow: "0 1px 8px rgba(139,69,19,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 24px", fontFamily: font,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{title}</span>
          </div>
        )}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DRAWER MODE (mobile, or noSidebar=true)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Compact sticky header — progress bar in center when active prop given */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 54,
        background: "rgba(255,252,245,0.98)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(196,122,46,0.12)",
        boxShadow: "0 2px 10px rgba(139,69,19,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: font,
      }}>
        {/* Left: hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)", background: "rgba(196,122,46,0.06)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, flexShrink: 0 }}
        >
          {[0,1,2].map(i => <div key={i} style={{ width: 14, height: 1.8, borderRadius: 2, background: "#C47A2E" }} />)}
        </button>

        {/* Center: title or logo */}
        <div style={{ flex: 1, padding: "0 10px", overflow: "hidden" }}>
          {title ? (
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", textAlign: "center" }}>{title}</span>
          ) : (
            <div style={{ textAlign: "center" }}>
              <img src={tendrLogo} alt="Tendr" onClick={() => navigate("/")} style={{ height: 28, cursor: "pointer", objectFit: "contain" }} />
            </div>
          )}
        </div>

        {/* Right: Review & Pay + profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Review & Pay button — shows when vendors finalised OR gift hampers in cart */}
          {(finalisedCount > 0 || ghCartCount > 0) && (
            <button
              onClick={() => setReviewPopup(true)}
              style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
            >
              Review & Pay {finalisedCount > 0 ? `(${finalisedCount})` : ghCartCount > 0 ? "🎁" : ""}
            </button>
          )}

          {/* Profile */}
          {token && user ? (
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(139,69,19,0.06)", border: "1.5px solid rgba(139,69,19,0.15)", borderRadius: 100, padding: "4px 10px 4px 5px", cursor: "pointer", fontFamily: font }}
              >
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <FaChevronDown size={8} style={{ color: "#9B7450", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {/* Saved strip — hidden in smart planner flow */}
              {!noCompare && compareSelected.length > 0 && (
                <button onClick={() => setSavedOpen(true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", padding: "2px 8px", borderRadius: "0 0 100px 100px", border: "1.5px solid rgba(196,122,46,0.2)", borderTop: "none", background: "rgba(196,122,46,0.07)", color: "#C47A2E", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                  🔀 {compareSelected.length}
                </button>
              )}

              {profileOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setProfileOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#FFFEF9", borderRadius: 12, boxShadow: "0 8px 32px rgba(139,69,19,0.12)", border: "1px solid rgba(139,69,19,0.08)", minWidth: 180, padding: 6, zIndex: 999 }}>
                    <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid rgba(139,69,19,0.08)", marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>{user.name}</p>
                    </div>
                    {[
                      { label: "Dashboard",    path: "/dashboard" },
                      ...(user.isAdmin ? [{ label: "Admin", path: "/AdminDashboard" }] : []),
                    ].map(({ label, path }) => (
                      <button key={label} onClick={() => { navigate(path); setProfileOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13, color: "#3B2F2F", cursor: "pointer", fontFamily: font }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,69,19,0.07)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >{label}</button>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(139,69,19,0.08)", marginTop: 4, paddingTop: 4 }}>
                      <button onClick={() => { dispatch(logout()); navigate("/"); setProfileOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 13, color: "#C0392B", cursor: "pointer", fontFamily: font }}>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => navigate("/login")} style={{ fontSize: 12, fontWeight: 600, color: "#6B3A1F", padding: "6px 12px", borderRadius: 8, border: "1.5px solid rgba(139,69,19,0.2)", background: "#fff", cursor: "pointer", fontFamily: font }}>
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Slide-in Drawer */}
      {drawerOpen && (
        <>
          <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, backdropFilter: "blur(2px)" }} />
          <div style={{
            position: "fixed", left: 0, top: 0, height: "100vh", width: 310,
            background: "#FFFCF5", zIndex: 201,
            display: "flex", flexDirection: "column",
            animation: "drawerSlideIn 0.24s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "8px 0 48px rgba(139,69,19,0.22)",
            fontFamily: font,
            overflowY: "auto",
          }}>
            {/* Drawer header */}
            <div style={{ padding: "20px 20px 16px", background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 100%)", position: "relative", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <img src={tendrLogo} alt="Tendr" onClick={() => { navigate("/"); close(); }} style={{ height: 32, cursor: "pointer", filter: "brightness(1.1)" }} />
                <button onClick={close} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#CCAB4A" }}>
                  <FaTimes size={12} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, letterSpacing: "0.03em" }}>We Curate, You Celebrate</p>

              {/* User info in header */}
              {token && user ? (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(255,255,255,0.07)", borderRadius: 12, border: "1px solid rgba(196,122,46,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { navigate("/dashboard"); close(); }}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.35)", background: "rgba(196,122,46,0.12)", color: "#CCAB4A", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { navigate("/login"); close(); }}
                  style={{ width: "100%", marginTop: 14, padding: "10px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Sign In
                </button>
              )}
            </div>

            {/* My Services — drawer: tick when finalised but always show Browse */}
            {selectedVendors.length > 0 && (
              <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(196,122,46,0.12)", background: "rgba(196,122,46,0.04)" }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 7px" }}>My Services</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selectedVendors.map(svc => {
                    const isBooked = !!finalisedVendors[svc];
                    return (
                      <div key={svc} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: isBooked ? "#22c55e" : "rgba(196,122,46,0.15)", border: isBooked ? "none" : "1.5px solid rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>
                          {isBooked ? "✓" : ""}
                        </div>
                        <span style={{ flex: 1, fontSize: 13, color: "#2C1A0E", fontWeight: 600 }}>{svc}</span>
                        <button onClick={() => { navigate(`/listings?serviceType=${encodeURIComponent(svc)}`); close(); }}
                          style={{ flexShrink: 0, padding: "4px 11px", borderRadius: 7, border: "none", background: isBooked ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: isBooked ? "#15803d" : "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                          {isBooked ? "✓ Browse" : "Browse"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nav sections */}
            <div style={{ padding: "12px 0", flex: 1 }}>
              {NAV_SECTIONS.map((sec, si) => (
                <div key={sec.label} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", padding: "10px 20px 6px" }}>
                    {sec.label}
                  </div>
                  {sec.items.map(item => (
                    item.comingSoon ? (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", opacity: 0.5 }}>
                        <span style={{ fontSize: 14, color: "#9B7450", fontFamily: font }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 7px", borderRadius: 20 }}>Coming Soon</span>
                      </div>
                    ) : item.disabled ? (
                      <div key={item.label} title="Fill your event details first" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", opacity: 0.4, cursor: "not-allowed" }}>
                        <span style={{ fontSize: 14, color: "#9B7450", fontFamily: font }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#C47A2E" }}>fill form first</span>
                      </div>
                    ) : (
                      <button key={item.label}
                        onClick={() => { if (item.onClickOverride) { item.onClickOverride(); close(); } else { navigate(item.href); close(); } }}
                        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "10px 20px", border: "none", background: "transparent", fontSize: 14, fontWeight: 500, color: "#2C1A0E", cursor: "pointer", fontFamily: font, transition: "all 0.15s", borderRadius: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; e.currentTarget.style.paddingLeft = "26px"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "20px"; }}
                      >
                        <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  ))}
                  {si < NAV_SECTIONS.length - 1 && (
                    <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(196,122,46,0.12),transparent)", margin: "8px 20px" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Social + Footer */}
            <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(196,122,46,0.1)", flexShrink: 0 }}>
              {/* Social row */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
                {[
                  { Icon: FaInstagram, href: "https://www.instagram.com/justtendrit?igsh=ZzlxcDhqOXo0dzVu&utm_source=qr" },
                  { Icon: FaFacebookF, href: "https://www.facebook.com/share/1RENaQTgyj/?mibextid=wwXIfr" },
                  { Icon: FaChevronDown, href: "https://wa.me/919211668427", isWA: true },
                ].map(({ Icon, href, isWA }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", fontSize: 14, textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#C47A2E,#CCAB4A)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.08)"; e.currentTarget.style.color = "#C47A2E"; }}
                  >
                    <Icon />
                  </a>
                ))}
                <a href="https://wa.me/919211668427" target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, textDecoration: "none" }}>
                  💬
                </a>
              </div>

              {/* Logout if logged in */}
              {token && (
                <button onClick={() => { dispatch(logout()); navigate("/"); close(); }}
                  style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 10 }}>
                  Logout
                </button>
              )}
              <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", margin: 0 }}>tendr.co.in · Delhi NCR</p>
            </div>
          </div>
        </>
      )}

      {/* Saved vendors modal */}
      {savedOpen && compareSelected.length > 0 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSavedOpen(false)}>
          <div style={{ width: "92%", maxWidth: 540, background: "#fff", borderRadius: 20, maxHeight: "80vh", display: "flex", flexDirection: "column", fontFamily: font }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f0e8dc" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>Compare Vendors ({compareSelected.length})</h3>
              <button onClick={() => setSavedOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "12px 24px", flex: 1 }}>
              {compareSelected.map((v) => (
                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #f0e8dc", background: "#fffcf5", marginBottom: 8 }}>
                  <img src={v.image || FALLBACK} alt={v.name} style={{ width: 46, height: 38, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name || "Vendor"}</div>
                    {v.city && <div style={{ fontSize: 12, color: "#9B7450" }}>{v.serviceType || v.city}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => { setSavedOpen(false); navigate(`/vendor/${v._id}`); }}
                      style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                      View
                    </button>
                    <button onClick={() => dispatch(removeVendorFromCompare(v._id))}
                      style={{ fontSize: 14, padding: "4px 8px", borderRadius: 7, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#888", cursor: "pointer" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid #f0e8dc" }}>
              <button onClick={() => { dispatch(clearVendorCompare()); setSavedOpen(false); }}
                style={{ fontSize: 13, padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#555", cursor: "pointer" }}>Clear All</button>
              <button onClick={() => { setSavedOpen(false); navigate("/listings"); }}
                style={{ fontSize: 13, fontWeight: 700, padding: "7px 22px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", cursor: "pointer" }}>Go to Listings</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes drawerSlideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>

      {/* Review & Pay popup */}
      {reviewPopup && (
        <>
          <div onClick={() => setReviewPopup(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, background: "#FFFCF5", borderRadius: 20, padding: "32px 28px", width: "90%", maxWidth: 400, boxShadow: "0 20px 60px rgba(139,69,19,0.2)", fontFamily: font, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.01em" }}>Ready to confirm?</h2>
            <p style={{ fontSize: 14, color: "#9B7450", lineHeight: 1.65, margin: "0 0 24px" }}>
              Do you want to complete your booking, add more vendors, or go back home?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setReviewPopup(false); navigate("/booking/review"); }}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
              >
                Continue to Payment →
              </button>
              <button
                onClick={() => { setReviewPopup(false); navigate("/listings"); }}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font }}
              >
                Add More Vendors
              </button>
              <button
                onClick={() => { setReviewPopup(false); navigate("/"); }}
                style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: "#9B7450", fontSize: 13, cursor: "pointer", fontFamily: font }}
              >
                Return to Home
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
