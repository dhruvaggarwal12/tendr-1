import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaChevronDown, FaWhatsapp, FaSearch, FaInstagram, FaFacebookF } from "react-icons/fa";
import { PlanIconButton } from "./PlanSummaryModal";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { removeVendorFromCompare, clearVendorCompare } from "../redux/listingFiltersSlice";
import { useChatOverlay } from "../context/ChatContext";
import { useTour } from "../context/TourContext";
import SearchOverlay from "./SearchOverlay";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";
import tendrIcon from "../assets/logos/tendr.png";

const SEARCH_SUGGESTIONS = [
  { text: "Photographers in Delhi" },
  { text: "Caterers in Noida" },
  { text: "DJ in Gurgaon" },
  { text: "Stationery by Tendr",               type: "page", href: "/stationery" },
  { text: "Gift Hampers",               type: "page", href: "/gift-hampers-cakes" },
  { text: "Budget Allocator",                   type: "page", href: "/budget-picker" },
  // { text: "Decor Finder", type: "page", href: "/decor-finder" }, // disabled
  { text: "Decorators under ₹30,000" },
  { text: "Photographer and caterer in Noida" },
];
// ── Smart search parser ───────────────────────────────────────────────────────
const SVC_KW = { caterer: "Caterer", catering: "Caterer", food: "Caterer", cook: "Caterer", decorator: "Decorator", decoration: "Decorator", decor: "Decorator", photographer: "Photographer", photography: "Photographer", photo: "Photographer", dj: "DJ", music: "DJ", entertainment: "DJ", disc: "DJ" };
const LOC_KW = { delhi: "Delhi", "new delhi": "Delhi", noida: "Noida", gurgaon: "Gurgaon", gurugram: "Gurgaon", ghaziabad: "Ghaziabad", "greater noida": "Greater Noida" };
const PAGE_KW = { budget: "/budget-picker", "gift hamper": "/gift-hampers-cakes", "gift hampers": "/gift-hampers-cakes", hampers: "/gift-hampers-cakes", cakes: "/gift-hampers-cakes", /* "decor finder": "/decor-finder", */timeline: "/timeline-picker", invitation: "/stationery", flyer: "/stationery", invite: "/stationery", stationery: "/stationery", "wedding card": "/stationery", aftermovie: "/stationery" };
const BUDGET_PATTERNS = [
  // "under/below 1 lakh", "1.5 lakh"
  /(?:under|below|within|upto|up to|less than|around|approx\.?|~)?\s*₹?\s*(\d+(?:\.\d+)?)\s*lakh/i,
  // "under/below 20k", "under ₹20000"
  /(?:under|below|within|upto|up to|less than|around|approx\.?|<|~)\s*₹?\s*(\d[\d,]*)\s*k?\b/i,
  // "₹20000 budget", "budget 20k"
  /₹\s*(\d[\d,]*)\s*k?\s*(?:budget|max|limit)?/i,
  /(?:budget|max|limit)\s*(?:of\s*)?₹?\s*(\d[\d,]*)\s*k?\b/i,
  // plain number with k: "20k"
  /\b(\d+)\s*k\b/i,
];

function parseSearch(q) {
  const lower = q.toLowerCase();

  // Page keywords (tools, gift hampers) — check first
  const pageHref = Object.entries(PAGE_KW).find(([k]) => lower.includes(k))?.[1];
  if (pageHref) return { cats: [], locs: [], budget: null, pageHref, isUnknown: false };

  // Categories — deduplicated
  const cats = [...new Set(Object.entries(SVC_KW).filter(([k]) => lower.includes(k)).map(([, v]) => v))];

  // Locations — check multi-word first
  const locs = [...new Set(
    Object.entries(LOC_KW)
      .filter(([k]) => lower.includes(k))
      .sort((a, b) => b[0].length - a[0].length) // longer match first
      .map(([, v]) => v)
  )];

  // Budget
  let budget = null;
  for (const pat of BUDGET_PATTERNS) {
    const m = lower.match(pat);
    if (m) {
      let num = parseFloat(m[1].replace(/,/g, ""));
      if (/lakh/i.test(m[0])) num *= 100000;
      else if (/k\b/i.test(m[0].replace(m[1], ""))) num *= 1000;
      budget = Math.round(num);
      break;
    }
  }

  // Unknown — has input but nothing matched platform
  const isUnknown = q.trim().length > 2 && cats.length === 0 && locs.length === 0 && !budget && !pageHref;

  return { cats, locs, budget, pageHref: null, isUnknown };
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Compare Vendors — asStrip renders a small strip below profile icon; default is a pill
function SavedVendorsInline({ asStrip = false }) {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const { openVendorChat } = useChatOverlay();
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected);
  const [open, setOpen] = React.useState(false);
  const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80";
  if (!compareSelected.length) return null;

  return (
    <>
      {asStrip ? (
        <button onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", padding: "4px 10px", borderRadius: "0 0 100px 100px", border: "1.5px solid rgba(196,122,46,0.22)", borderTop: "none", background: "rgba(196,122,46,0.07)", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Compare ({compareSelected.length})
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(204,171,74,0.4)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Compare
          <span style={{ background: "#CCAB4A", color: "#fff", borderRadius: 100, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{compareSelected.length}</span>
        </button>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}>
          <div style={{ width: "92%", maxWidth: 560, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "80vh", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f0e8dc" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>Compare Vendors <span style={{ fontSize: 13, fontWeight: 500, color: "#9B7450" }}>({compareSelected.length})</span></h3>
              <button onClick={() => setOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "12px 24px", flex: 1 }}>
              {compareSelected.map((v) => (
                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #f0e8dc", background: "#fffcf5", marginBottom: 8 }}>
                  <img src={v.image || FALLBACK} alt={v.name} style={{ width: 46, height: 38, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name || "Vendor"}</div>
                    {(v.serviceType || v.city) && <div style={{ fontSize: 12, color: "#9B7450" }}>{v.serviceType || v.city}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setOpen(false); navigate("/vendor/" + v._id); }}
                      style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 7, border: "none", background: "#f5eedf", color: "#7A4A1E", cursor: "pointer" }}>View</button>
                    <button onClick={() => dispatch(removeVendorFromCompare(v._id))}
                      style={{ fontSize: 14, padding: "4px 8px", borderRadius: 7, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#888", cursor: "pointer" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid #f0e8dc" }}>
              <button onClick={() => { dispatch(clearVendorCompare()); setOpen(false); }}
                style={{ fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#555", cursor: "pointer" }}>Clear All</button>
              <button onClick={() => { setOpen(false); navigate("/listings"); }}
                style={{ fontSize: 13, fontWeight: 700, padding: "7px 22px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", cursor: "pointer", boxShadow: "0 3px 12px rgba(196,122,46,0.35)" }}>Go to Listings</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const Navbar = ({
  handleLogoClick,
  handleGiftHampersClick,
  handleSignInClick,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resetAllTours } = useTour() || {};
  const { user, token } = useSelector((state) => state.auth);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected || []);
  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const finalisedCount = Object.keys(finalisedVendors).length;
  const formData = useSelector((s) => s.eventPlanning.formData || {});
  const formEventType = formData.eventType;
  const isFormFilled = !!(
    (formData.eventType && formData.guests && formData.budget && formData.location && formData.date) ||
    finalisedCount > 0 ||
    (() => { try { const d = JSON.parse(localStorage.getItem("tendr_ep_session") || "{}"); const fd = d.formData || {}; return !!(fd.eventType && fd.guests && fd.budget && fd.location && fd.date); } catch { return false; } })()
  );
  const browseDisabled = false;
  const ghCartCount = useSelector((s) => s.giftHamperCart?.items?.length || 0);
  const [activeChatCount, setActiveChatCount] = useState(0);
  const [adminCounts, setAdminCounts] = useState(null);

  // Regular user — count active vendor chats
  useEffect(() => {
    if (!token || !user || user.isAdmin) return;
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : { conversations: [] })
      .then((data) => {
        const active = (data.conversations || []).filter((c) => c.chatApproved);
        setActiveChatCount(active.length);
      })
      .catch(() => {});
  }, [token, user]);

  // Admin — fetch per-category pending counts
  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    fetch(`${BASE_URL}/admin/pending-counts`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setAdminCounts(data); })
      .catch(() => {});
  }, [token, user]);

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
    navigate("/");
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchOverlay, setSearchOverlay] = useState(false);
  const searchRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q) => {
    const query = q || searchQuery;
    if (!query.trim()) return;
    const { cats, locs, budget, pageHref, isUnknown } = parseSearch(query);
    if (pageHref) { navigate(pageHref); }
    else if (isUnknown) { navigate(`/search?unknown=1&q=${encodeURIComponent(query)}`); }
    else {
      const p = new URLSearchParams();
      if (cats.length)  p.set("categories", cats.join(","));
      if (locs.length)  p.set("locations",  locs.join(","));
      if (budget)        p.set("budget",     budget);
      p.set("q", query);
      navigate(`/search?${p.toString()}`);
    }
    setSearchQuery(""); setShowSuggestions(false);
  };

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSuggestions = searchQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_SUGGESTIONS.slice(0, 5);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const y = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const NAV_ITEMS = [
    {
      label: "Browse",
      megaMenu: true,
      items: [
        { id: "Decorator",    label: "Decorator",    href: "/search?categories=Decorator" },
        { id: "Caterer",      label: "Caterer",      href: "/search?categories=Caterer" },
        { id: "Photographer", label: "Photographer", href: "/search?categories=Photographer" },
        { id: "DJ",           label: "DJ",           href: "/search?categories=DJ" },
        { id: "Band",         label: "Band",         href: "/search?categories=Band" },
        { id: "Emcee",        label: "Emcee / Host", href: "/search?categories=Emcee" },
      ],
      sideItems: [
        { label: "Top Rated Vendors",  href: "/search?sort=topRated" },
        { label: "Register as Vendor", href: "/vendor/register" },
      ],
    },
    {
      label: "Our Products",
      items: [
        { label: "Gift Hampers",        href: "/gift-hampers-cakes" },
        { label: "Stationery by Tendr", href: "/stationery" },
        { label: "Fun Activities",      href: "/fun-activities" },
      ],
    },
    {
      label: "Plan",
      items: [
        { label: "You Do It",           href: "/booking" },
        { label: "Smart Planner",       href: "/booking" },
        { label: "Baat Karo",           href: "/baat-karo" },
        { label: "🎉 Plan by Occasion", onClick: () => { navigate("/"); setTimeout(() => document.getElementById("plan-by-occasion")?.scrollIntoView({ behavior: "smooth" }), 120); } },
      ],
    },
    {
      label: "More",
      items: [
        { label: "Plan My Event",      href: "/plan" },
        { label: "Planning Timeline",  href: "/timeline-picker" },
        { label: "Budget Allocator",   href: "/budget-picker" },
        { label: "Find by Style",      href: "/find-by-style" },
        { label: "Community",          href: "/community" },
        { label: "Guide Store",        href: "/guides" },
        { label: "About Us",           href: "/about-us" },
        { label: "Contact Us",         href: "/contact-us" },
      ],
    },
  ];

  const font = "'Outfit', sans-serif";

  const divider = (
    <div
      style={{
        width: 1,
        height: 18,
        background: "rgba(139,69,19,0.18)",
        flexShrink: 0,
        alignSelf: "center",
      }}
    />
  );

  const dropdownItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 8,
    color: "#1C0E04",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.01em",
    lineHeight: 1.45,
    transition: "background 0.15s",
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: font,
    whiteSpace: "nowrap",
  };

  const hoverOn = (e) => (e.currentTarget.style.background = "rgba(139,69,19,0.07)");
  const hoverOff = (e) => (e.currentTarget.style.background = "transparent");

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        fontFamily: font,
      }}
    >

      {/* ── Main bar ── */}
      <div
        style={{
          background: "rgba(255,252,247,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(196,122,46,0.16)",
          boxShadow: scrolled ? "0 2px 28px rgba(139,69,19,0.1)" : "0 1px 0 rgba(196,122,46,0.08)",
          transition: "box-shadow 0.35s ease",
        }}
      >
        <div
          className="navbar-main-bar"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 40px",
            height: scrolled ? 62 : 68,
            display: "flex",
            alignItems: "center",
            transition: "height 0.3s ease",
          }}
        >
          {/* Logo */}
          <a
            href="/"
            onClick={handleLogoClick}
            style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none", gap: 8 }}
          >
            <img
              src={tendrLogo}
              alt="Tendr"
              style={{
                height: 34,
                width: "auto",
                maxWidth: 150,
                objectFit: "contain",
                display: "block",
                borderRadius: 6,
              }}
            />
          </a>

          {/* ── Desktop nav — search LEFT of Browse, then links ── */}
          <div
            className="desktop-nav"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}
          >
          {/* Search pill — left of Browse */}
          <button
            data-tour="search-bar"
            onClick={() => setSearchOverlay(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px 9px 13px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.22)", background: "rgba(196,122,46,0.04)", cursor: "pointer", fontFamily: font, marginRight: 10, flexShrink: 0, transition: "all 0.2s ease", minWidth: 200 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.09)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.04)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.22)"; }}
          >
            <FaSearch size={12} style={{ color: "#C47A2E", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#A07850", whiteSpace: "nowrap", flex: 1, letterSpacing: "0.01em" }}>Search vendors, services…</span>
            <span style={{ fontSize: 9.5, color: "rgba(160,120,80,0.45)", border: "1px solid rgba(160,120,80,0.18)", borderRadius: 5, padding: "2px 6px", whiteSpace: "nowrap", fontFamily: "monospace", letterSpacing: "0.04em" }}>⌘K</span>
          </button>
          {/* Primary nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {NAV_ITEMS.map((group) => (
              group.directLink ? (
                <div key={group.label} style={{ position: "relative" }}>
                  <a
                    href={group.href}
                    style={{
                      background: "transparent",
                      color: "#1C0E04",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.01em",
                      padding: "7px 12px",
                      borderRadius: 0,
                      border: "none",
                      borderBottom: "2px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      textDecoration: "none",
                      transition: "color 0.15s, border-color 0.15s",
                      fontFamily: font,
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#C47A2E"; e.currentTarget.style.borderBottomColor = "rgba(196,122,46,0.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#1C0E04"; e.currentTarget.style.borderBottomColor = "transparent"; }}
                  >
                    {group.label}
                  </a>
                </div>
              ) : (
              <div
                key={group.label}
                data-tour={group.label === "Browse" ? "nav-browse" : group.label === "Our Products" ? "nav-products" : group.label === "Plan" ? "nav-booking" : group.label === "More" ? "nav-more" : undefined}
                style={{ position: "relative" }}
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeDropdown === group.label ? "2px solid #C47A2E" : "2px solid transparent",
                    color: activeDropdown === group.label ? "#C47A2E" : "#1C0E04",
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    padding: "7px 11px",
                    borderRadius: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "color 0.18s, border-color 0.18s",
                    fontFamily: font,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {group.label}
                  <FaChevronDown
                    size={8}
                    style={{
                      transform: activeDropdown === group.label ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      opacity: activeDropdown === group.label ? 0.7 : 0.35,
                      marginTop: 1,
                    }}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    left: group.megaMenu ? "0" : "50%",
                    transform: group.megaMenu
                      ? (activeDropdown === group.label ? "translateY(0)" : "translateY(-8px)")
                      : (activeDropdown === group.label ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-8px)"),
                    background: "#FFFEF9",
                    borderRadius: 16,
                    boxShadow: "0 16px 48px rgba(139,69,19,0.15), 0 2px 10px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(196,122,46,0.18)",
                    minWidth: group.megaMenu ? 400 : 200,
                    padding: group.megaMenu ? "16px" : "8px",
                    opacity: activeDropdown === group.label ? 1 : 0,
                    visibility: activeDropdown === group.label ? "visible" : "hidden",
                    transition: "opacity 0.18s ease, transform 0.18s ease, visibility 0.18s",
                    zIndex: 999,
                  }}
                >
                  {group.megaMenu ? (
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#B8956A", textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 10px 2px" }}>Find a Vendor</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 12 }}>
                        {[
                          { id: "Decorator",    label: "Decorator",    href: "/search?categories=Decorator",    color: "#F9EEF4", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C47A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="#C47A2E"/><circle cx="17.5" cy="10.5" r=".5" fill="#C47A2E"/><circle cx="8.5" cy="7.5" r=".5" fill="#C47A2E"/><circle cx="6.5" cy="12.5" r=".5" fill="#C47A2E"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.47-.688-.47-1.125A1.64 1.64 0 0 1 14.828 17h1.93C19.858 17 22 14.858 22 12 22 6.477 17.523 2 12 2z"/></svg> },
                          { id: "Caterer",      label: "Caterer",      href: "/search?categories=Caterer",      color: "#F0F5EE", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A8A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
                          { id: "Photographer", label: "Photographer", href: "/search?categories=Photographer", color: "#EEF2FA", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A6FB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
                          { id: "DJ",           label: "DJ",           href: "/search?categories=DJ",           color: "#F5EDFE", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> },
                        ].map(item => (
                          <a key={item.id} href={item.href}
                            style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 10, background: "#F9F6F1", textDecoration: "none", cursor: "pointer", transition: "all 0.15s", border: "1px solid transparent" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.18)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(196,122,46,0.09)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#F9F6F1"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
                          >
                            <span style={{ width: 28, height: 28, borderRadius: 7, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</span>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1C0E04", letterSpacing: "0.01em" }}>{item.label}</span>
                          </a>
                        ))}
                      </div>
                      <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 9 }}>
                        {group.sideItems.map(item => (
                          <a key={item.label} href={item.href}
                            style={{ ...dropdownItemStyle, fontSize: 12.5, color: "#B07040", fontWeight: 600 }}
                            onMouseEnter={hoverOn} onMouseLeave={hoverOff}
                          >{item.label} →</a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    group.items.map((item) =>
                      item.comingSoon ? (
                        <div key={item.label} style={{ ...dropdownItemStyle, cursor: "default", opacity: 0.5, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{item.label}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 7px", borderRadius: 20, marginLeft: 8, whiteSpace: "nowrap" }}>Soon</span>
                        </div>
                      ) : item.disabled ? (
                        <div key={item.label} title="Fill your event details first" style={{ ...dropdownItemStyle, cursor: "not-allowed", opacity: 0.4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{item.label}</span>
                        </div>
                      ) : item.href ? (
                        <a key={item.label} href={item.href} style={dropdownItemStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                          {item.label}
                        </a>
                      ) : (
                        <button key={item.label} onClick={item.onClick} style={dropdownItemStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                          {item.label}
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
              )
            ))}
          </div>
          </div>{/* end centered desktop-nav */}

          {/* Mobile search bar — sits between logo and burger on mobile */}
          <button
            className="mobile-search-bar"
            data-tour="mob-search"
            onClick={() => setSearchOverlay(true)}
            style={{ flex: 1, minWidth: 0, margin: "0 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(196,122,46,0.05)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "7px 12px", cursor: "pointer" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 12, fontFamily: font, color: "#9B7450", whiteSpace: "nowrap" }}>Search vendors, tools...</span>
          </button>

          {/* ── Right action cluster (desktop) ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} className="desktop-nav">

          {/* Right cluster: conditional buttons + profile — always together */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* Auth area */}
            {token && user ? (
              <div ref={profileMenuRef} style={{ position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                <button
                  data-tour="profile-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: "rgba(139,69,19,0.06)", border: "1.5px solid rgba(139,69,19,0.18)", borderRadius: 100, padding: "6px 14px 6px 8px", cursor: "pointer", fontFamily: font, transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.06)")}
                >
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    {/* Badge: user shows active chat count; admin shows total pending */}
                    {!user?.isAdmin && activeChatCount > 0 && (
                      <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, background: "#ef4444", color: "#fff", borderRadius: 100, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff", lineHeight: 1 }}>
                        {activeChatCount > 9 ? "9+" : activeChatCount}
                      </span>
                    )}
                    {user?.isAdmin && adminCounts && (adminCounts.chatRequests + adminCounts.vendorApps) > 0 && (
                      <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, background: "#b45309", color: "#fff", borderRadius: 100, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff", lineHeight: 1 }}>
                        {Math.min(adminCounts.chatRequests + adminCounts.vendorApps, 99)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#3B2F2F", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
                  <FaChevronDown size={9} style={{ color: "#9B7450", transform: showProfileMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                </div>{/* end flex column */}

                {showProfileMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowProfileMenu(false)} />
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#FFFEF9", borderRadius: 12, boxShadow: "0 8px 32px rgba(139,69,19,0.12)", border: "1px solid rgba(139,69,19,0.08)", minWidth: 210, padding: 6, zIndex: 999 }}>
                      {/* Name + email */}
                      <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid rgba(139,69,19,0.08)", marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>{user.name}</p>
                        {user.email && <p style={{ fontSize: 11.5, color: "#9B7450", margin: "2px 0 0" }}>{user.email}</p>}
                      </div>

                      {user.isAdmin ? (
                        /* ── Admin dropdown ── */
                        <>
                          <button onClick={() => { navigate("/AdminDashboard"); setShowProfileMenu(false); }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "#3B2F2F", cursor: "pointer", fontFamily: font }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.07)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >Admin Dashboard</button>

                          <button
                            onClick={() => { setShowProfileMenu(false); resetAllTours?.(); navigate("/"); }}
                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "#C47A2E", cursor: "pointer", fontFamily: font }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                            Take the tour
                          </button>

                          {/* Per-category counts */}
                          <div style={{ padding: "2px 8px 6px" }}>
                            {[
                              { label: "Chat Requests",   count: adminCounts?.chatRequests,  section: "chatrequests", color: "#b45309" },
                              { label: "Vendor Apps",     count: adminCounts?.vendorApps,    section: "vendors",      color: "#7c3aed" },
                              { label: "Support",         count: adminCounts?.supportChats,  section: "chatsupport",  color: "#0369a1" },
                              { label: "Smart Plans",     count: adminCounts?.smartPlanChats,section: "smartplans",   color: "#16a34a" },
                              { label: "Chat",            count: adminCounts?.activeChats,   section: "chat",         color: "#0369a1" },
                              { label: "Change Requests", count: adminCounts?.changeRequests, section: "bookings",    color: "#c0392b" },
                            ].map(({ label, count, section, color }) => (
                              <button key={label}
                                onClick={() => { navigate(`/AdminDashboard?section=${section}`); setShowProfileMenu(false); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 10px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontFamily: font, transition: "background 0.15s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.07)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <span style={{ fontSize: 12.5, color: "#6B3A1F" }}>↳ {label}</span>
                                {count > 0 && (
                                  <span style={{ fontSize: 11, fontWeight: 700, background: color, color: "#fff", borderRadius: 100, padding: "1px 7px", minWidth: 20, textAlign: "center" }}>
                                    {count}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        /* ── Regular user dropdown ── */
                        <>
                          <button onClick={() => { navigate("/dashboard"); setShowProfileMenu(false); }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 14, fontWeight: 500, color: "#3B2F2F", cursor: "pointer", fontFamily: font }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.07)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >Dashboard</button>
                        </>
                      )}

                      <div style={{ borderTop: "1px solid rgba(139,69,19,0.08)", marginTop: 4, paddingTop: 4 }}>
                        <button onClick={handleLogout}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 14, fontWeight: 500, color: "#C0392B", cursor: "pointer", fontFamily: font, transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(192,57,43,0.07)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >Logout</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a href="/vendor/register" style={{ fontSize: 13, fontWeight: 600, color: "#C47A2E", padding: "9px 16px", borderRadius: 9, textDecoration: "none", border: "1.5px solid rgba(196,122,46,0.32)", background: "transparent", transition: "all 0.18s", whiteSpace: "nowrap", fontFamily: font }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; e.currentTarget.style.borderColor = "#C47A2E"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.32)"; }}
                >List Your Service</a>
                <a href="/login" data-tour="signin-btn" style={{ fontSize: 13, fontWeight: 700, color: "#fff", padding: "9px 20px", borderRadius: 9, textDecoration: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", boxShadow: "0 3px 12px rgba(196,122,46,0.3)", transition: "opacity 0.2s", whiteSpace: "nowrap", fontFamily: font }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >Sign In</a>
              </div>
            )}
            {/* My Event / Plan icon — desktop only */}
            <PlanIconButton />

            {/* WhatsApp — always rightmost, with clear gap */}
            <a
              href="https://wa.me/919211668427"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#25D366", color: "#fff", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(37,211,102,0.3)", textDecoration: "none", flexShrink: 0, transition: "transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <FaWhatsapp size={14} />
            </a>
          </div>{/* end inner right cluster */}
          </div>{/* end right action cluster desktop-nav */}

          {/* My Event icon — mobile only (shown outside desktop-nav class) */}
          <div className="mobile-plan-btn">
            <PlanIconButton />
          </div>

          {/* Burger (mobile) */}
          <button
            className="burger-btn-custom"
            data-tour="mob-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", color: "#1C0E04", cursor: "pointer", padding: "6px 4px", display: "flex", alignItems: "center", borderRadius: 8, flexShrink: 0 }}
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>{/* end navbar-main-bar */}
      </div>{/* end main bar wrapper */}

      {/* ── Mobile menu ── */}
      <div
        style={{
          maxHeight: menuOpen ? 700 : 0,
          overflow: "hidden",
          transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1)",
          background: "#FFFEF9",
          borderTop: menuOpen ? "1px solid rgba(139,69,19,0.08)" : "none",
        }}
      >
        <div style={{ padding: "8px 24px 24px" }}>
          {NAV_ITEMS.map((group) => (
            group.directLink ? (
              <div key={group.label} style={{ marginBottom: 2 }}>
                <a
                  href={group.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "14px 2px",
                    color: "#3B2F2F",
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    fontFamily: font,
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(139,69,19,0.07)",
                  }}
                >
                  {group.label}
                </a>
              </div>
            ) : (
            <div key={group.label} style={{ marginBottom: 2 }}>
              <button
                onClick={() =>
                  setMobileExpanded(mobileExpanded === group.label ? null : group.label)
                }
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 2px",
                  color: "#3B2F2F",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  fontFamily: font,
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(139,69,19,0.07)",
                }}
              >
                {group.label}
                <FaChevronDown
                  size={10}
                  style={{
                    transform: mobileExpanded === group.label
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.22s ease",
                    opacity: 0.45,
                  }}
                />
              </button>

              <div
                style={{
                  maxHeight: mobileExpanded === group.label ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}
              >
                {group.items.map((item) =>
                  item.comingSoon ? (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", color: "#9B7450", fontSize: 14.5, opacity: 0.55, fontFamily: font }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.1)", color: "#C47A2E", padding: "2px 7px", borderRadius: 20 }}>Coming Soon</span>
                    </div>
                  ) : item.disabled ? (
                    <div key={item.label} title="Fill your event details first" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", color: "#9B7450", fontSize: 14.5, opacity: 0.45, cursor: "not-allowed", fontFamily: font }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#C47A2E" }}>fill form first</span>
                    </div>
                  ) : item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 14px", color: "#5C3317",
                        textDecoration: "none", fontSize: 14.5,
                        fontWeight: 500, letterSpacing: "0.01em", fontFamily: font,
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 14px", color: "#5C3317",
                        fontSize: 14.5, fontWeight: 500, letterSpacing: "0.01em",
                        background: "none", border: "none", width: "100%",
                        textAlign: "left", cursor: "pointer", fontFamily: font,
                      }}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>
            )
          ))}


          {/* Dark footer — user info + social icons + logout — matches HamburgerNav drawer */}
          <div style={{ marginTop: 20, borderRadius: 14, background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 100%)", padding: "16px 16px 14px" }}>
            {token && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 12px", background: "rgba(255,255,255,0.07)", borderRadius: 10, border: "1px solid rgba(196,122,46,0.25)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user.name}</div>
                  {user.email && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>}
                </div>
                <button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                  style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(196,122,46,0.35)", background: "rgba(196,122,46,0.12)", color: "#CCAB4A", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Dashboard
                </button>
              </div>
            ) : (
              <a href="/login" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "10px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", fontFamily: font, marginBottom: 12 }}>
                Sign In
              </a>
            )}
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
              {[
                { Icon: FaInstagram, href: "https://www.instagram.com/justtendrit?igsh=ZzlxcDhqOXo0dzVu&utm_source=qr", bg: null },
                { Icon: FaFacebookF, href: "https://www.facebook.com/share/1RENaQTgyj/?mibextid=wwXIfr", bg: null },
                { Icon: FaWhatsapp, href: "https://wa.me/919211668427", bg: "#25d366", color: "#fff" },
              ].map(({ Icon, href, bg, color }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: "50%", background: bg || "rgba(196,122,46,0.15)", border: bg ? "none" : "1px solid rgba(196,122,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: color || "#C47A2E", fontSize: 15, textDecoration: "none" }}>
                  <Icon />
                </a>
              ))}
            </div>
            {token && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid rgba(252,165,165,0.4)", background: "rgba(192,57,43,0.15)", color: "#fca5a5", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                Logout
              </button>
            )}
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: "10px 0 0" }}>tendr.co.in · Delhi NCR</p>
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={searchOverlay} onClose={() => setSearchOverlay(false)} />
      <style>{`
        @keyframes tendrMarquee {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @media (min-width: 768px) {
          .burger-btn-custom { display: none !important; }
          .desktop-nav { display: flex !important; }
          .desktop-search { display: block !important; }
          .mobile-search-bar { display: none !important; }
          .mobile-plan-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .burger-btn-custom { display: none !important; }
          .mobile-search-bar { display: flex !important; }
          .mobile-plan-btn { display: flex !important; align-items: center; }
          .nav-announcement { display: none !important; }
          .navbar-main-bar img { height: 28px !important; }
          .navbar-main-bar { padding: 0 12px !important; height: 60px !important; }
          .mobile-menu-content { padding: 6px 14px 20px !important; }
        }
        @media (max-width: 380px) {
          .navbar-main-bar { padding: 0 8px !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
