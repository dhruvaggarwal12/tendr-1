import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaChevronDown, FaWhatsapp, FaUserCircle } from "react-icons/fa";

const Navbar = ({
  handleLogoClick,
  tendrLogo,
  handleGiftHampersClick,
  handleSignInClick,
}) => {
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
      label: "Explore Vendors",
      items: [
        { icon: "⭐", label: "Top Rated Vendors", onClick: () => scrollToSection("events") },
        { icon: "💼", label: "Vendor Portfolio", onClick: () => scrollToSection("events") },
      ],
    },
    {
      label: "Planning Tools",
      items: [
        { icon: "✅", label: "Checklist", href: "/checklist" },
        { icon: "🕐", label: "Timeline", href: "/timeline-picker" },
        { icon: "💰", label: "Budget Allocator", href: "/budget-allocator" },
        { icon: "🎬", label: "Aftermovie", href: "/aftermovie" },
        { icon: "💌", label: "Invitation Flyers", href: "/invitation" },
      ],
    },
    {
      label: "Booking",
      items: [
        { icon: "🏢", label: "Corporate Booking", onClick: () => scrollToSection("corporate-section") },
        { icon: "🥂", label: "Other Celebrations", href: "/booking" },
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

            {/* Gift Hampers — disabled */}
            <span
              title="Coming Soon"
              style={{
                color: "#bbb",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: "not-allowed",
                userSelect: "none",
              }}
            >
              🎁 Gift Hampers
            </span>

            {divider}

            {/* List Your Service */}
            <a
              href="/vendor/register"
              style={{
                color: "#6B3A1F",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "7px 12px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              List Your Service
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

            {/* My Profile icon */}
            <a
              href="/login"
              onClick={handleSignInClick}
              title="My Profile"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid rgba(139,69,19,0.22)",
                background: "rgba(255,248,240,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7A4A1E",
                textDecoration: "none",
                flexShrink: 0,
                marginLeft: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg,#C47A2E,#DEB887)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(196,122,46,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,248,240,0.9)";
                e.currentTarget.style.color = "#7A4A1E";
                e.currentTarget.style.borderColor = "rgba(139,69,19,0.22)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FaUserCircle size={20} />
            </a>
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
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://wa.me/919211668427"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#25D366",
                color: "#fff",
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
              }}
            >
              <FaWhatsapp size={19} />
            </a>

            <span
              title="Coming Soon"
              style={{
                color: "#bbb",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "10px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: 9,
                whiteSpace: "nowrap",
                fontFamily: font,
                cursor: "not-allowed",
                userSelect: "none",
              }}
            >
              🎁 Gift Hampers
            </span>

            <a
              href="/login"
              onClick={handleSignInClick}
              title="My Profile"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "2px solid rgba(139,69,19,0.22)",
                background: "rgba(255,248,240,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7A4A1E",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <FaUserCircle size={21} />
            </a>
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
      `}</style>
    </nav>
  );
};

export default Navbar;
