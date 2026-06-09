import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { removeVendorFromCompare, clearVendorCompare, clearFinalisedVendor, setFilters } from "../redux/listingFiltersSlice";
import { useChatOverlay } from "../context/ChatContext";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";
import { FaChevronDown, FaTimes, FaInstagram, FaFacebookF } from "react-icons/fa";
import MobileBottomNav from "./MobileBottomNav";
import SearchOverlay from "./SearchOverlay";
import CompareModal from "./CompareModal";

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
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [savedOpen,       setSavedOpen]       = useState(false);
  const [searchOverlay,   setSearchOverlay]   = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [bookmarkTick,  setBookmarkTick]  = useState(0);
  const getSavedVendors = () => { try { return JSON.parse(localStorage.getItem("tendr_saved_vendors") || "[]"); } catch { return []; } };
  const removeSaved = (id) => { localStorage.setItem("tendr_saved_vendors", JSON.stringify(getSavedVendors().filter(v => v._id !== id))); setBookmarkTick(t => t + 1); };
  // Saved vendor mini-form (shown before opening profile)
  const [savedMiniForm, setSavedMiniForm] = useState({ eventType: "", date: "", location: "", guests: "", occasion: "" });
  const [savedMiniOpen, setSavedMiniOpen] = useState(false);
  const [savedVendorTarget, setSavedVendorTarget] = useState(null);
  const CITIES_LIST = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];
  const openSavedVendor = (v) => { setSavedVendorTarget(v); setSavedMiniOpen(true); setBookmarksOpen(false); };
  const [reviewPopup,   setReviewPopup]   = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [showSuggest,      setShowSuggest]      = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const profileRef = useRef(null);

  const SEARCH_SUGGESTIONS = [
    { text: "Photographers in Delhi", cat: "Photographer", loc: "Delhi" },
    { text: "Caterers in Noida", cat: "Caterer", loc: "Noida" },
    { text: "DJ for birthday party", cat: "DJ" },
    { text: "Wedding decorators", cat: "Decorator" },
    { text: "Photographers in Ghaziabad", cat: "Photographer", loc: "Ghaziabad" },
  ];
  const SVC_KW2 = { caterer: "Caterer", catering: "Caterer", food: "Caterer", decorator: "Decorator", decoration: "Decorator", decor: "Decorator", photographer: "Photographer", photography: "Photographer", dj: "DJ", music: "DJ" };
  const LOC_KW2 = { delhi: "Delhi", noida: "Noida", gurgaon: "Gurgaon", gurugram: "Gurgaon", ghaziabad: "Ghaziabad", "greater noida": "Greater Noida", faridabad: "Faridabad" };
  const PAGE_KW2 = { budget: "/budget-picker", "gift hamper": "/gift-hampers-cakes", "gift hampers": "/gift-hampers-cakes", hampers: "/gift-hampers-cakes", cakes: "/gift-hampers-cakes", "decor finder": "/decor-finder", checklist: "/checklist-picker", timeline: "/timeline-picker", invitation: "/invitation", flyer: "/invitation", stationery: "/stationery", aftermovie: "/aftermovie" };

  const handleNavSearch = (q) => {
    const query = q || searchQuery;
    if (!query.trim()) return;
    const lower = query.toLowerCase();
    const pageHref = Object.entries(PAGE_KW2).find(([k]) => lower.includes(k))?.[1];
    if (pageHref) { navigate(pageHref); setSearchQuery(""); setShowSuggest(false); return; }
    const cats = [...new Set(Object.entries(SVC_KW2).filter(([k]) => lower.includes(k)).map(([,v]) => v))];
    const locs = [...new Set(Object.entries(LOC_KW2).filter(([k]) => lower.includes(k)).sort((a,b)=>b[0].length-a[0].length).map(([,v]) => v))];
    const budgetM = lower.match(/(?:under|below|₹)\s*(\d[\d,]*)\s*k?/i);
    const budget = budgetM ? parseFloat(budgetM[1].replace(/,/g,"")) * (/k\b/.test(budgetM[0]) ? 1000 : 1) : null;
    const isUnknown = query.trim().length > 2 && cats.length === 0 && locs.length === 0 && !budget;
    if (isUnknown) { navigate(`/search?unknown=1&q=${encodeURIComponent(query)}`); }
    else {
      const p = new URLSearchParams();
      if (cats.length) p.set("categories", cats.join(","));
      if (locs.length) p.set("locations", locs.join(","));
      if (budget) p.set("budget", budget);
      p.set("q", query);
      navigate(`/search?${p.toString()}`);
    }
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

  // Listen for save/unsave events from VendorList_ListingPage to refresh sidebar count
  useEffect(() => {
    const onSaved = () => setBookmarkTick(t => t + 1);
    window.addEventListener("tendr:saved-updated", onSaved);
    window.addEventListener("tendr:checklist-saved", onSaved);
    window.addEventListener("tendr:timeline-saved", onSaved);
    window.addEventListener("tendr:budget-saved", onSaved);
    return () => { window.removeEventListener("tendr:saved-updated", onSaved); window.removeEventListener("tendr:checklist-saved", onSaved); window.removeEventListener("tendr:timeline-saved", onSaved); window.removeEventListener("tendr:budget-saved", onSaved); };
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
  const bookingType         = useSelector((s) => s.eventPlanning.bookingType || "");

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
  const browseDisabled = false;

  // Pages where the user is deep in the vendor flow — always send to listings
  const vendorFlowPaths = ["/listings", "/vendor/", "/booking/review", "/booking/payment", "/chat", "/chats", "/dashboard", "/top-rated", "/search"];
  const isOnVendorFlow = vendorFlowPaths.some(p => location.pathname.startsWith(p));
  const isHomePage = location.pathname === "/";

  // Floating cluster helpers
  const savedVendorCount = (() => { void bookmarkTick; return getSavedVendors().length; })();
  const hasActiveActions = finalisedCount > 0 || ghCartCount > 0 || compareSelected.length > 0 || savedVendorCount > 0;
  // Desktop: cluster only on home page; sidebar shows them on all other pages
  // Mobile: cluster on ALL pages but only when there are active items
  const shouldRenderCluster = isDesktop ? (isHomePage && hasActiveActions) : hasActiveActions;

  const handleBrowseVendors = () => {
    // Always land on flow-choosing page so user picks You Do It vs Smart Planner
    navigate("/booking");
  };


  // Desktop sidebar: Vendors first (original order)
  // Mobile drawer: Gift & Hampers shown as standalone button above these sections
  const NAV_SECTIONS = [
    { label: "Vendors", items: [
      { label: "Browse Vendors",       href: "/listings",   onClickOverride: handleBrowseVendors, disabled: browseDisabled, activePaths: ["/listings", "/search", "/vendor/"] },
      { label: "Top Rated Vendors",    href: "/top-rated/Photographer", activePaths: ["/top-rated/"] },
      { label: "Register as Vendor",   href: "/vendor/register" },
    ]},
    { label: "Our Products", hideOnMobile: true, items: [
      ...(user?.isAdmin ? [
        { label: "🎉 Plan by Occasion", onClickOverride: () => { close(); window.open("/occasions", "_blank"); } },
        { label: "🏡 Party Places",     href: "/party-places" },
        { label: "🎭 Fun Activities",   href: "/fun-activities" },
      ] : []),
      { label: "Checklist",        href: "/checklist-picker", activePaths: ["/checklist-picker","/checklist","/prebuilt-checklist"],
        onClickOverride: () => { close(); try { const raw = localStorage.getItem("tendr_checklist_v2"); const saved = raw ? JSON.parse(raw) : null; navigate(saved?.categories?.length > 0 ? "/prebuilt-checklist" : "/checklist-picker"); } catch { navigate("/checklist-picker"); } } },
      { label: "Timeline",         href: "/timeline-picker",  activePaths: ["/timeline-picker","/timeline","/prebuilt-timeline"],
        onClickOverride: () => { close(); try { const raw = localStorage.getItem("tendr_timeline_v2"); const saved = raw ? JSON.parse(raw) : null; navigate(saved?.phases?.length > 0 ? "/prebuilt-timeline" : "/timeline-picker"); } catch { navigate("/timeline-picker"); } } },
      { label: "Budget Allocator", href: "/budget-picker",    activePaths: ["/budget-picker","/budget-allocator"] },
      { label: "Decor Finder",       href: "/decor-finder" },
    ]},
    ...(user?.isAdmin ? [{ label: "Memories", hideOnMobile: true, items: [
      { label: "Invitation Flyers",  href: "/invitation" },
      { label: "Wedding Stationery", href: "/stationery" },
      { label: "Aftermovie",         href: "/aftermovie" },
    ]}] : []),
    { label: "Booking", items: [
      { label: "Plan Your Event",      href: "/booking", activePaths: ["/booking", "/plan-event"] },
    ]},
    { label: "Company", items: [
      { label: "About Us",             href: "/about-us" },
      { label: "Contact Us",           href: "/contact-us" },
      ...(user?.isAdmin ? [{ label: "🌟 Community Wall",    href: "/community" }] : []),
      ...(user?.isAdmin ? [{ label: "🎉 Celebration Hub",  href: "/celebration-hub" }] : []),
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
          background: "linear-gradient(180deg,#5C3418 0%,#3D2210 100%)",
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

          {/* Search bar + suggestions */}
          <div style={{ padding: "8px 14px 0", borderBottom: "1px solid rgba(196,122,46,0.1)", flexShrink: 0 }}>
            <style>{`.sb-search::placeholder{color:rgba(255,255,255,0.35);}`}</style>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: showSuggest && (searchQuery.length > 0 || true) ? "8px 8px 0 0" : 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: 9 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="sb-search"
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                onKeyDown={e => { if (e.key === "Enter") { handleNavSearch(); setShowSuggest(false); } }}
                placeholder="Search vendors, tools..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "8px 8px 8px 7px", fontSize: 12, color: "#fff", fontFamily: font }}
              />
              <button onClick={() => { handleNavSearch(); setShowSuggest(false); }}
                style={{ padding: "8px 10px", background: "transparent", border: "none", cursor: "pointer", color: "#CCAB4A", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>›</button>
            </div>
            {/* Suggestions dropdown */}
            {showSuggest && (
              <div style={{ background: "rgba(20,10,5,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden", marginBottom: 8 }}>
                {/* Category chips */}
                <div style={{ padding: "8px 10px 6px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Browse by category</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {[
                      { id: "Caterer",      emoji: "🍽", label: "Catering" },
                      { id: "Decorator",    emoji: "🎀", label: "Decor" },
                      { id: "Photographer", emoji: "📸", label: "Photo" },
                      { id: "DJ",           emoji: "🎵", label: "DJ" },
                    ].map(({ id, emoji, label }) => (
                      <button key={id}
                        onMouseDown={() => { navigate(`/search?categories=${id}`); setShowSuggest(false); setSearchQuery(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.08)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(196,122,46,0.22)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(196,122,46,0.08)"}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredSuggestions.length > 0 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />}
                {filteredSuggestions.map((s, i) => (
                  <button key={i}
                    onMouseDown={() => { handleNavSearch(s.text); setShowSuggest(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", fontSize: 11.5, color: "rgba(255,255,255,0.75)", cursor: "pointer", fontFamily: font, borderBottom: i < filteredSuggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(196,122,46,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    🔍 {s.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compare Vendors (below search) */}
          {!isHomePage && compareSelected.length > 0 && (
            <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(196,122,46,0.08)", flexShrink: 0 }}>
              <button onClick={() => setCompareModalOpen(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.35)", background: "rgba(196,122,46,0.1)", cursor: "pointer", fontFamily: font }}>
                <span style={{ fontSize: 13 }}>🔀</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#C47A2E", textAlign: "left" }}>Compare Vendors</span>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#C47A2E", color: "#fff", borderRadius: 100, padding: "1px 7px" }}>{compareSelected.length}</span>
              </button>
            </div>
          )}

          {/* Saved Vendors (below compare, if any) */}
          {!isHomePage && (() => { const sv = getSavedVendors(); return sv.length > 0 ? (
            <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(196,122,46,0.08)", flexShrink: 0 }}>
              <button onClick={() => setBookmarksOpen(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.25)", background: "rgba(196,122,46,0.08)", cursor: "pointer", fontFamily: font }}>
                <span style={{ fontSize: 13 }}>♥</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#CCAB4A", textAlign: "left" }}>Saved Vendors</span>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#C47A2E", color: "#fff", borderRadius: 100, padding: "1px 7px" }}>{sv.length}</span>
              </button>
            </div>
          ) : null; })()}

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

          {/* Sign In — for logged-out users, shown prominently near top */}
          {!token && (
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <button onClick={() => navigate("/login")}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
                Sign In / Sign Up →
              </button>
            </div>
          )}

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
              {!isHomePage && (finalisedCount > 0 || ghCartCount > 0) && (
                <button onClick={() => navigate("/booking/review")} style={{ width: "100%", marginTop: 7, padding: "7px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Review & Pay ({finalisedCount}) →
                </button>
              )}
            </div>
          )}

          {/* My Services checklist — only in normal (you-do-it) booking flow */}
          {selectedVendors.length > 0 && (location.pathname.startsWith('/listings') || location.pathname.startsWith('/vendor/')) && bookingType === 'you-do-it' && (
            <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: "rgba(204,171,74,0.95)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>My Services</p>
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

          {/* Nav sections */}
          <div style={{ padding: "8px 0" }}>
            {/* Gift Hampers — above Browse Vendors */}
            {(() => {
              const isGiftActive = location.pathname === "/gift-hampers-cakes";
              return (
                <div style={{ marginBottom: 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(204,171,74,0.95)", textTransform: "uppercase", letterSpacing: "0.14em", padding: "8px 16px 4px" }}>Gift &amp; Hampers</div>
                  <button
                    onClick={() => navigate("/gift-hampers-cakes")}
                    style={{ display: "flex", alignItems: "center", width: "100%", textAlign: "left", padding: "9px 16px", border: "none", background: isGiftActive ? "rgba(196,122,46,0.18)" : "transparent", fontSize: 13, fontWeight: isGiftActive ? 700 : 500, color: isGiftActive ? "#FFCC66" : "rgba(255,255,255,0.85)", cursor: "pointer", fontFamily: font, transition: "all 0.15s", borderLeft: isGiftActive ? "3px solid #C9A84C" : "3px solid transparent" }}
                    onMouseEnter={e => { if (!isGiftActive) { e.currentTarget.style.background = "rgba(196,122,46,0.1)"; e.currentTarget.style.color = "#fff"; } }}
                    onMouseLeave={e => { if (!isGiftActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                  >
                    🎁 Gift Hampers &amp; Cakes
                  </button>
                  <div style={{ height: 1, background: "rgba(196,122,46,0.08)", margin: "4px 18px" }} />
                </div>
              );
            })()}
            {NAV_SECTIONS.map((sec, si) => (
              <div key={sec.label} style={{ marginBottom: 2 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(204,171,74,0.95)", textTransform: "uppercase", letterSpacing: "0.14em", padding: "8px 16px 4px", textAlign: "left" }}>{sec.label}</div>
                {sec.items.map(item => {
                  const isSoon     = !!item.comingSoon;
                  const isDisabled = !!item.disabled;
                  const isActive   = !isSoon && !isDisabled && (
                    location.pathname === item.href ||
                    (item.href !== "/" && location.pathname.startsWith(item.href)) ||
                    (item.activePaths || []).some(p => location.pathname === p || location.pathname.startsWith(p))
                  );
                  const checklistSaved = item.href === "/checklist-picker" && (() => { try { return localStorage.getItem("tendr_checklist_saved") === "true"; } catch { return false; } })();
                  const timelineSaved  = item.href === "/timeline-picker"  && (() => { try { return localStorage.getItem("tendr_timeline_saved")  === "true"; } catch { return false; } })();
                  const budgetSaved    = item.href === "/budget-picker"     && (() => { try { return localStorage.getItem("tendr_budget_saved")    === "true"; } catch { return false; } })();
                  if (isSoon) {
                    return (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderLeft: "3px solid transparent", gap: 10 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: font, textAlign: "left" }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(204,171,74,0.15)", color: "#CCAB4A", padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>Soon</span>
                      </div>
                    );
                  }
                  if (isDisabled) {
                    return (
                      <div key={item.label} title="Fill your event details first" style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderLeft: "3px solid transparent", opacity: 0.4, cursor: "not-allowed", gap: 10 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: font, textAlign: "left" }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#CCAB4A", flexShrink: 0 }}>fill form first</span>
                      </div>
                    );
                  }
                  return (
                    <button key={item.label}
                      onClick={() => { close(); item.onClickOverride ? item.onClickOverride() : navigate(item.href); }}
                      style={{
                        display: "flex", alignItems: "center",
                        width: "100%", textAlign: "left",
                        padding: "9px 16px", border: "none",
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
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left", flex: 1 }}>{item.label}</span>
                      {(checklistSaved || timelineSaved || budgetSaved) && <span style={{ fontSize: 8, fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 100, padding: "1px 5px", flexShrink: 0, letterSpacing: "0.05em" }}>✓ CHECK</span>}
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

        {/* Compare Vendors modal — proper side-by-side comparison */}
        <CompareModal open={compareModalOpen} onClose={() => setCompareModalOpen(false)} vendors={compareSelected} />

        {/* Saved Vendors modal — sidebar mode */}
        {bookmarksOpen && (() => { const savedList = getSavedVendors(); return (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
            onClick={() => setBookmarksOpen(false)}>
            <div style={{ width: "92%", maxWidth: 500, background: "#FFFCF5", borderRadius: 20, maxHeight: "80vh", display: "flex", flexDirection: "column", fontFamily: font, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>♥ Saved Vendors ({savedList.length})</h3>
                <button onClick={() => setBookmarksOpen(false)} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              {savedList.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center", color: "#9B7450", fontSize: 14 }}>No saved vendors yet.</div>
              ) : (
                <div style={{ overflowY: "auto", padding: "10px 16px", flex: 1 }}>
                  {savedList.map(v => (
                    <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.12)", background: "#fff", marginBottom: 8 }}>
                      {v.image ? <img src={v.image} alt={v.name} style={{ width: 46, height: 38, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} /> : <div style={{ width: 46, height: 38, borderRadius: 8, background: "rgba(196,122,46,0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏷</div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 14 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: "#9B7450" }}>{v.serviceType}{v.city ? ` · ${v.city}` : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => openSavedVendor(v)}
                          style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", cursor: "pointer", fontWeight: 600 }}>View</button>
                        <button onClick={() => removeSaved(v._id)}
                          style={{ fontSize: 14, padding: "4px 8px", borderRadius: 7, border: "1.5px solid rgba(0,0,0,0.08)", background: "#f5f5f5", color: "#C47A2E", cursor: "pointer" }}>♥</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ); })()}

        {/* Mini form — before opening saved vendor profile */}
        {savedMiniOpen && savedVendorTarget && (
          <>
            <div onClick={() => setSavedMiniOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, backdropFilter: "blur(3px)" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 401, background: "#FFFCF5", borderRadius: 20, width: "min(95vw,440px)", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font, overflow: "hidden" }}>
              <div style={{ padding: "16px 22px 12px", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", margin: "0 0 2px" }}>Quick Event Details</h3>
                <p style={{ fontSize: 11.5, color: "#9B7450", margin: 0 }}>Viewing: <strong>{savedVendorTarget.name}</strong> · {savedVendorTarget.serviceType}</p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                dispatch(setFilters({ eventType: savedMiniForm.eventType, locationType: savedMiniForm.location, date: savedMiniForm.date, guestCount: parseInt(savedMiniForm.guests) || 0 }));
                setSavedMiniOpen(false);
                window.open(`/vendor/${savedVendorTarget._id}`, "_blank");
                setSavedVendorTarget(null);
              }} style={{ padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>Event Type *</label>
                  <select required value={savedMiniForm.eventType} onChange={e => setSavedMiniForm(p => ({ ...p, eventType: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                    <option value="">Select event type</option>
                    {["Birthday", "Anniversary", "Pre Wedding", "Get-together", "Office Party", "Festival", "Others"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>City *</label>
                  <select required value={savedMiniForm.location} onChange={e => setSavedMiniForm(p => ({ ...p, location: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                    <option value="">Select city</option>
                    {CITIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>Event Date *</label>
                  <input required type="date" value={savedMiniForm.date} min={new Date().toISOString().split("T")[0]}
                    onChange={e => setSavedMiniForm(p => ({ ...p, date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>No. of Guests *</label>
                  <input required type="number" min="1" placeholder="e.g. 50" value={savedMiniForm.guests}
                    onChange={e => setSavedMiniForm(p => ({ ...p, guests: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
                <button type="submit"
                  style={{ width: "100%", marginTop: 4, padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
                  View Vendor Profile ↗
                </button>
              </form>
            </div>
          </>
        )}

        <SearchOverlay isOpen={searchOverlay} onClose={() => setSearchOverlay(false)} />

        {/* ── Floating action cluster (desktop: home page; mobile: all pages) ── */}
        {shouldRenderCluster && (
          <div style={{ position: "fixed", bottom: 28, right: 24, zIndex: 9500, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
            {(finalisedCount > 0 || ghCartCount > 0) && (
              <button onClick={() => navigate("/booking/review")} title="Review & Pay"
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#22c55e)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(21,128,61,0.45)", color: "#fff" }}>
                💳
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: "#166534", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>{finalisedCount || ghCartCount}</span>
              </button>
            )}
            {compareSelected.length > 0 && (
              <button onClick={() => setCompareModalOpen(true)} title="Compare Vendors"
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(196,122,46,0.45)" }}>
                🔀
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: "#92400e", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>{compareSelected.length}</span>
              </button>
            )}
            {savedVendorCount > 0 && (
              <button onClick={() => setBookmarksOpen(true)} title="Saved Vendors"
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#be185d,#ec4899)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(190,24,93,0.35)", color: "#fff" }}>
                ♥
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: "#9d174d", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>{savedVendorCount}</span>
              </button>
            )}
            {/* Chat icon — anchor, desktop only */}
            <button onClick={() => navigate("/chats")} title="My Chats"
              style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", border: "2px solid rgba(196,122,46,0.4)", color: "#CCAB4A", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(44,26,14,0.35)" }}>
              💬
            </button>
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
        {/* Left: Logo on home, back arrow on all other pages */}
        {location.pathname === "/" ? (
          <img src={tendrLogo} alt="Tendr" onClick={() => navigate("/")} style={{ height: 18, cursor: "pointer", objectFit: "contain", flexShrink: 0 }} />
        ) : (
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "rgba(196,122,46,0.05)", cursor: "pointer", flexShrink: 0, color: "#6B3A1F", fontSize: 18, fontWeight: 400 }}
          >
            ‹
          </button>
        )}

        {/* Center: Search bar — tapping opens full-screen overlay */}
        <button
          onClick={() => setSearchOverlay(true)}
          style={{ flex: 1, minWidth: 0, margin: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(196,122,46,0.05)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "7px 12px", cursor: "pointer", lineHeight: 1 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, display: "block" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ fontSize: 12, fontFamily: font, color: "#9B7450", whiteSpace: "nowrap", lineHeight: 1 }}>Search vendors, tools...</span>
        </button>

        {/* Right: Hamburger + optional actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Hamburger — opens drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)", background: "rgba(196,122,46,0.06)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, flexShrink: 0 }}
          >
            {[0,1,2].map(i => <div key={i} style={{ width: 13, height: 1.8, borderRadius: 2, background: "#C47A2E" }} />)}
          </button>
          {/* Saved Vendors button — shows when there are saved vendors */}
          {(() => { const saved = getSavedVendors(); return saved.length > 0 ? (
            <button onClick={() => setBookmarksOpen(true)}
              style={{ position: "relative", width: 34, height: 34, borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "rgba(196,122,46,0.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, color: "#C47A2E" }}
              title="Saved Vendors">
              ♥
              <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#C47A2E", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{saved.length}</span>
            </button>
          ) : null; })()}
          {/* Review & Pay button — shows when vendors finalised OR gift hampers in cart */}
          {(finalisedCount > 0 || ghCartCount > 0) && (
            <button
              onClick={() => setReviewPopup(true)}
              style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
            >
              Review & Pay {finalisedCount > 0 ? `(${finalisedCount})` : ghCartCount > 0 ? "🎁" : ""}
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

            {/* My Services — only in normal (you-do-it) booking flow */}
            {selectedVendors.length > 0 && (location.pathname.startsWith('/listings') || location.pathname.startsWith('/vendor/')) && bookingType === 'you-do-it' && (
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

            {/* Gift Hampers quick-link — drawer (mobile) only, above Browse Vendors */}
            <div style={{ padding: "8px 16px 8px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <button onClick={() => { close(); navigate("/gift-hampers-cakes"); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", background: "rgba(196,122,46,0.07)", cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; }}
              >
                <span style={{ fontSize: 17 }}>🎁</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#CCAB4A" }}>Gift Hampers &amp; Cakes</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(204,171,74,0.6)" }}>→</span>
              </button>
            </div>

            {/* Nav sections */}
            <div style={{ padding: "12px 0", flex: 1 }}>
              {NAV_SECTIONS.filter(sec => !sec.hideOnMobile).map((sec, si) => (
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

      {/* Compare Vendors modal — drawer mode */}
      <CompareModal open={compareModalOpen} onClose={() => setCompareModalOpen(false)} vendors={compareSelected} />

      {/* Saved Vendors panel */}
      {bookmarksOpen && (() => { const savedList = getSavedVendors(); return (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setBookmarksOpen(false)}>
          <div style={{ width: "92%", maxWidth: 500, background: "#FFFCF5", borderRadius: 20, maxHeight: "80vh", display: "flex", flexDirection: "column", fontFamily: font, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>♥ Saved Vendors ({savedList.length})</h3>
              <button onClick={() => setBookmarksOpen(false)} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            {savedList.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#9B7450", fontSize: 14 }}>No saved vendors yet.<br />Tap ♡ on any vendor card to save them here.</div>
            ) : (
              <div style={{ overflowY: "auto", padding: "10px 16px", flex: 1 }}>
                {savedList.map(v => (
                  <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.12)", background: "#fff", marginBottom: 8 }}>
                    {v.image ? <img src={v.image} alt={v.name} style={{ width: 46, height: 38, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} /> : <div style={{ width: 46, height: 38, borderRadius: 8, background: "rgba(196,122,46,0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏷</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 14, textAlign: "left" }}>{v.name}</div>
                      <div style={{ fontSize: 11, color: "#9B7450", textAlign: "left" }}>{v.serviceType}{v.city ? ` · ${v.city}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setBookmarksOpen(false); navigate(`/vendor/${v._id}`); }}
                        style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", cursor: "pointer", fontWeight: 600 }}>View</button>
                      <button onClick={() => removeSaved(v._id)}
                        style={{ fontSize: 14, padding: "4px 8px", borderRadius: 7, border: "1.5px solid rgba(0,0,0,0.08)", background: "#f5f5f5", color: "#C47A2E", cursor: "pointer" }}>♥</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ); })()}

      <MobileBottomNav />

      {/* ── Floating action cluster — mobile: above bottom nav, left of FloatingChatButton ── */}
      {shouldRenderCluster && (
        <div style={{ position: "fixed", bottom: "calc(72px + env(safe-area-inset-bottom, 0px))", right: 70, zIndex: 9500, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
          {(finalisedCount > 0 || ghCartCount > 0) && (
            <button onClick={() => setReviewPopup(true)} title="Review & Pay"
              style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#22c55e)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(21,128,61,0.45)", color: "#fff" }}>
              💳
              <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: "#166534", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>{finalisedCount || ghCartCount}</span>
            </button>
          )}
          {compareSelected.length > 0 && (
            <button onClick={() => setCompareModalOpen(true)} title="Compare Vendors"
              style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(196,122,46,0.45)" }}>
              🔀
              <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: "#92400e", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>{compareSelected.length}</span>
            </button>
          )}
          {savedVendorCount > 0 && (
            <button onClick={() => setBookmarksOpen(true)} title="Saved Vendors"
              style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#be185d,#ec4899)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(190,24,93,0.35)", color: "#fff" }}>
              ♥
              <span style={{ position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, background: "#9d174d", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>{savedVendorCount}</span>
            </button>
          )}
        </div>
      )}

      <SearchOverlay isOpen={searchOverlay} onClose={() => setSearchOverlay(false)} />
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
