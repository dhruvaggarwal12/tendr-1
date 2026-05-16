import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaChevronDown, FaWhatsapp, FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { removeVendorFromCompare, clearVendorCompare } from "../redux/listingFiltersSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Saved Vendors — asStrip renders a small strip below profile icon; default is a pill
function SavedVendorsInline({ asStrip = false }) {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected);
  const [open, setOpen] = React.useState(false);
  const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80";
  if (!compareSelected.length) return null;

  return (
    <>
      {asStrip ? (
        <button onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", padding: "4px 10px", borderRadius: "0 0 100px 100px", border: "1.5px solid rgba(196,122,46,0.22)", borderTop: "none", background: "rgba(196,122,46,0.07)", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
          💛 Saved ({compareSelected.length})
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid rgba(204,171,74,0.4)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
          Saved Vendors
          <span style={{ background: "#CCAB4A", color: "#fff", borderRadius: 100, padding: "1px 8px", fontSize: 12, fontWeight: 800 }}>{compareSelected.length}</span>
        </button>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}>
          <div style={{ width: "92%", maxWidth: 560, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "80vh", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f0e8dc" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>Saved Vendors <span style={{ fontSize: 13, fontWeight: 500, color: "#9B7450" }}>({compareSelected.length})</span></h3>
              <button onClick={() => setOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "12px 24px", flex: 1 }}>
              {compareSelected.map((v) => (
                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #f0e8dc", background: "#fffcf5", marginBottom: 8 }}>
                  <img src={v.image || FALLBACK} alt={v.name} style={{ width: 52, height: 42, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name || "Vendor"}</div>
                    {v.city && <div style={{ fontSize: 12, color: "#9B7450" }}>{v.city}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setOpen(false); navigate("/vendor/" + v._id); }}
                      style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "none", background: "#f5eedf", color: "#7A4A1E", cursor: "pointer" }}>View</button>
                    <button onClick={() => dispatch(removeVendorFromCompare(v._id))}
                      style={{ fontSize: 14, padding: "3px 10px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#888", cursor: "pointer" }}>×</button>
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
  tendrLogo,
  handleGiftHampersClick,
  handleSignInClick,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const compareSelected = useSelector((s) => s.listingFilters.compareSelected || []);
  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const finalisedCount = Object.keys(finalisedVendors).length;
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
      label: "Vendors",
      items: [
        { icon: "⭐", label: "Top Rated Vendors",            href: "/top-rated/Photographer" },
        { icon: "📂", label: "Browse Vendors",               href: "/listings" },
        { icon: "🤝", label: "Register as Vendor with Tendr", href: "/vendor/register" },
      ],
    },
    {
      label: "Planning Tools",
      items: [
        { icon: "✅", label: "Checklist", href: "/checklist-picker" },
        { icon: "🕐", label: "Timeline", href: "/timeline-picker" },
        { icon: "💰", label: "Budget Allocator", href: "/budget-picker" },
        { icon: "🎬", label: "Aftermovie", href: "/aftermovie" },
        { icon: "💌", label: "Invitation Flyers", href: "/invitation" },
      ],
    },
    {
      label: "Booking",
      items: [
        { icon: "🥂", label: "Plan an Event", href: "/booking" },
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
    color: "#3B2F2F",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
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
        background: scrolled ? "rgba(255,252,245,0.98)" : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(139,69,19,0.12)"
          : "1px solid rgba(139,69,19,0.07)",
        boxShadow: scrolled
          ? "0 2px 24px rgba(139,69,19,0.07)"
          : "0 1px 6px rgba(0,0,0,0.03)",
        transition: "all 0.3s ease",
        fontFamily: font,
      }}
    >
      {/* ── Main bar ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px",
          height: scrolled ? 64 : 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "height 0.3s ease",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          onClick={handleLogoClick}
          style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}
        >
          <img
            src={tendrLogo}
            alt="Tendr"
            style={{
              height: scrolled ? 42 : 50,
              width: "auto",
              transition: "height 0.3s ease",
              display: "block",
            }}
          />
        </a>

        {/* ── Desktop nav ── */}
        <div
          className="desktop-nav"
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* Primary nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_ITEMS.map((group) => (
              <div
                key={group.label}
                style={{ position: "relative" }}
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  style={{
                    background: activeDropdown === group.label
                      ? "rgba(139,69,19,0.07)"
                      : "transparent",
                    border: "none",
                    color: activeDropdown === group.label ? "#8B4513" : "#3B2F2F",
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    padding: "8px 15px",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.2s",
                    fontFamily: font,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {group.label}
                  <FaChevronDown
                    size={9}
                    style={{
                      transform: activeDropdown === group.label
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.22s ease",
                      opacity: 0.45,
                      marginTop: 1,
                    }}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: activeDropdown === group.label
                      ? "translateX(-50%) translateY(0)"
                      : "translateX(-50%) translateY(-6px)",
                    background: "#FFFEF9",
                    borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(139,69,19,0.11), 0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(139,69,19,0.08)",
                    minWidth: 210,
                    padding: "6px",
                    opacity: activeDropdown === group.label ? 1 : 0,
                    visibility: activeDropdown === group.label ? "visible" : "hidden",
                    transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
                    zIndex: 999,
                  }}
                >
                  {group.items.map((item) =>
                    item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        style={dropdownItemStyle}
                        onMouseEnter={hoverOn}
                        onMouseLeave={hoverOff}
                      >
                        <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </a>
                    ) : (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        style={dropdownItemStyle}
                        onMouseEnter={hoverOn}
                        onMouseLeave={hoverOff}
                      >
                        <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Divider — between primary nav and secondary actions */}
          <div
            style={{
              width: 1,
              height: 22,
              background: "rgba(139,69,19,0.15)",
              margin: "0 20px",
              flexShrink: 0,
            }}
          />

          {/* Secondary actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Gift Hampers & Cakes */}
            <a
              href="/gift-hampers-cakes"
              style={{
                color: "#C47A2E",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "7px 14px",
                borderRadius: 8,
                border: "1.5px solid rgba(196,122,46,0.3)",
                background: "rgba(196,122,46,0.06)",
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
                textDecoration: "none",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.14)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.3)"; }}
            >
              🎁 Gift Hampers & Cakes
            </a>

            {divider}

            {/* WhatsApp */}
            <a
              href="https://wa.me/919211668427"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#25D366",
                color: "#fff",
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
                textDecoration: "none",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.06)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,211,102,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,211,102,0.35)";
              }}
            >
              <FaWhatsapp size={17} />
            </a>

            {/* Review & Pay — visible when vendors are finalised */}
            {finalisedCount > 0 && (
              <button
                onClick={() => navigate("/booking/review")}
                style={{ fontSize: 13, fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(196,122,46,0.35)", flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Review & Pay ({finalisedCount})
              </button>
            )}

            {/* Auth area */}
            {token && user ? (
              <div ref={profileMenuRef} style={{ position: "relative", marginLeft: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: "rgba(139,69,19,0.06)", border: "1.5px solid rgba(139,69,19,0.18)", borderRadius: compareSelected.length > 0 && !user?.isAdmin ? "100px 100px 0 0" : 100, padding: "6px 14px 6px 8px", cursor: "pointer", fontFamily: font, transition: "background 0.2s" }}
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

                {/* Saved Vendors strip — directly below profile button */}
                {!user?.isAdmin && compareSelected.length > 0 && (
                  <SavedVendorsInline asStrip />
                )}
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

                          {/* Per-category counts */}
                          <div style={{ padding: "2px 8px 6px" }}>
                            {[
                              { label: "Chat Requests",   count: adminCounts?.chatRequests,  section: "chatrequests", color: "#b45309" },
                              { label: "Vendor Apps",     count: adminCounts?.vendorApps,    section: "vendors",      color: "#7c3aed" },
                              { label: "Support",         count: adminCounts?.supportChats,  section: "chatsupport",  color: "#0369a1" },
                              { label: "Concierge",       count: adminCounts?.conciergeChats,section: "chatconcierge",color: "#0369a1" },
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

                          <button onClick={() => { navigate("/dashboard?tab=Ongoing"); setShowProfileMenu(false); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "9px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 14, fontWeight: activeChatCount > 0 ? 600 : 500, color: activeChatCount > 0 ? "#C47A2E" : "#3B2F2F", cursor: "pointer", fontFamily: font }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.07)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            {activeChatCount > 0 ? `My Chats (${activeChatCount} active)` : "My Chats"}
                            {activeChatCount > 0 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />}
                          </button>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
                <a href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#6B3A1F", padding: "7px 14px", borderRadius: 8, textDecoration: "none", border: "1.5px solid rgba(139,69,19,0.2)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >Sign In</a>
                <a href="/signup" style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "7px 16px", borderRadius: 8, textDecoration: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", boxShadow: "0 3px 10px rgba(196,122,46,0.3)", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >Sign Up</a>
              </div>
            )}
          </div>
        </div>

        {/* Burger (mobile) */}
        <button
          className="burger-btn-custom"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#3B2F2F",
            cursor: "pointer",
            padding: 8,
            display: "flex",
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

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
                  item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 14px",
                        color: "#5C3317",
                        textDecoration: "none",
                        fontSize: 14.5,
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                        fontFamily: font,
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 14px",
                        color: "#5C3317",
                        fontSize: 14.5,
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Mobile action row */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/919211668427" target="_blank" rel="noopener noreferrer"
              style={{ background: "#25D366", color: "#fff", width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0, boxShadow: "0 2px 8px rgba(37,211,102,0.35)" }}>
              <FaWhatsapp size={19} />
            </a>

            {/* Auth section — mobile */}
            {token && user ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(196,122,46,0.07)", borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", fontFamily: font }}>{user.name}</div>
                    {user.email && <div style={{ fontSize: 11, color: "#9B7450" }}>{user.email}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                    style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "1.5px solid rgba(139,69,19,0.2)", background: "#fff", color: "#6B3A1F", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                    My Dashboard
                  </button>
                  {user.isAdmin && (
                    <button onClick={() => { navigate("/AdminDashboard"); setMenuOpen(false); }}
                      style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "none", background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                      Admin
                    </button>
                  )}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", gap: 8 }}>
                <a href="/login" style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1.5px solid rgba(139,69,19,0.2)", background: "#fff", color: "#6B3A1F", fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center", fontFamily: font }}>
                  Sign In
                </a>
                <a href="/signup" style={{ flex: 1, padding: "11px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .burger-btn-custom { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .burger-btn-custom { display: flex !important; }
        }
        @media (max-width: 480px) {
          .mobile-menu-content { padding: 6px 16px 20px !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
