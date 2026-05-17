import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { removeVendorFromCompare, clearVendorCompare } from "../redux/listingFiltersSlice";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";
import { FaChevronDown, FaTimes, FaInstagram, FaFacebookF } from "react-icons/fa";

const font = "'Outfit', sans-serif";
const STEPS = ["Plan", "Browse", "Chat", "Pay"];

// title: shown in center; showReviewPay: Review & Pay button; active: journey step
export default function HamburgerNav({ title = "", showReviewPay = false, active = "" }) {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const compareSelected  = useSelector((s) => s.listingFilters.compareSelected || []);
  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const finalisedCount   = Object.keys(finalisedVendors).length;

  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [savedOpen,     setSavedOpen]     = useState(false);
  const [reviewPopup,   setReviewPopup]   = useState(false);
  const profileRef = useRef(null);
  const FALLBACK = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80";

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const close = () => setDrawerOpen(false);

  const NAV_SECTIONS = [
    { label: "Vendors", items: [
      { label: "Browse Vendors",             href: "/listings",                  icon: "📂" },
      { label: "Top Rated Vendors",          href: "/top-rated/Photographer",    icon: "⭐" },
      { label: "Register as Vendor",         href: "/vendor/register",           icon: "🤝" },
    ]},
    { label: "Planning Tools", items: [
      { label: "Checklist",                  href: "/checklist-picker",          icon: "✅" },
      { label: "Timeline",                   href: "/timeline-picker",           icon: "⏱" },
      { label: "Budget Allocator",           href: "/budget-picker",             icon: "💰" },
      { label: "Aftermovie",                 href: "/aftermovie",                icon: "🎬" },
      { label: "Invitation Flyers",          href: "/invitation",                icon: "💌" },
      { label: "Gift Hampers & Cakes",       href: "/gift-hampers-cakes",        icon: "🎁" },
    ]},
    { label: "Booking", items: [
      { label: "Plan Your Event",            href: "/booking",                   icon: "🥂" },
    ]},
    { label: "Company", items: [
      { label: "About Us",                   href: "/about-us",                  icon: "ℹ️" },
      { label: "Contact Us",                 href: "/contact-us",                icon: "📞" },
    ]},
  ];

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

        {/* Center: progress bar when active, otherwise title or logo */}
        <div style={{ flex: 1, padding: "0 10px", overflow: "hidden" }}>
          {active ? (
            // Inline compact progress bar
            <div style={{ display: "flex", alignItems: "center" }}>
              {STEPS.map((step, i) => {
                const activeIdx = STEPS.indexOf(active);
                const isDone   = i < activeIdx;
                const isActive = i === activeIdx;
                return (
                  <React.Fragment key={step}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: isDone ? "#C47A2E" : isActive ? "rgba(196,122,46,0.12)" : "#f0ebe3",
                        border: isActive ? "2px solid #C47A2E" : isDone ? "2px solid #C47A2E" : "2px solid transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, fontWeight: 800, color: isDone ? "#fff" : isActive ? "#C47A2E" : "#bbb",
                      }}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? "#2C1A0E" : isDone ? "#C47A2E" : "#bbb" }}>
                        {step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 1.5, background: isDone ? "#C47A2E" : "rgba(196,122,46,0.15)", margin: "0 6px", borderRadius: 2, minWidth: 8 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : title ? (
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", textAlign: "center" }}>{title}</span>
          ) : (
            <div style={{ textAlign: "center" }}>
              <img src={tendrLogo} alt="Tendr" onClick={() => navigate("/")} style={{ height: 28, cursor: "pointer", objectFit: "contain" }} />
            </div>
          )}
        </div>

        {/* Right: Review & Pay + profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Review & Pay button — only shows after at least one vendor is finalised */}
          {finalisedCount > 0 && (
            <button
              onClick={() => setReviewPopup(true)}
              style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
            >
              Review & Pay {finalisedCount > 0 ? `(${finalisedCount})` : ""}
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

              {/* Saved strip */}
              {compareSelected.length > 0 && (
                <button onClick={() => setSavedOpen(true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", padding: "2px 8px", borderRadius: "0 0 100px 100px", border: "1.5px solid rgba(196,122,46,0.2)", borderTop: "none", background: "rgba(196,122,46,0.07)", color: "#C47A2E", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                  💛 {compareSelected.length}
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
                      { label: "My Chats",     path: "/dashboard?tab=Chats" },
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
                    <button onClick={() => { navigate("/dashboard?tab=Chats"); close(); }}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      My Chats
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button onClick={() => { navigate("/login"); close(); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 9, border: "1px solid rgba(196,122,46,0.4)", background: "transparent", color: "#CCAB4A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    Sign In
                  </button>
                  <button onClick={() => { navigate("/signup"); close(); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Nav sections */}
            <div style={{ padding: "12px 0", flex: 1 }}>
              {NAV_SECTIONS.map((sec, si) => (
                <div key={sec.label} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.14em", padding: "10px 20px 6px" }}>
                    {sec.label}
                  </div>
                  {sec.items.map(item => (
                    <button key={item.label}
                      onClick={() => { navigate(item.href); close(); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "10px 20px", border: "none", background: "transparent", fontSize: 14, fontWeight: 500, color: "#2C1A0E", cursor: "pointer", fontFamily: font, transition: "all 0.15s", borderRadius: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; e.currentTarget.style.paddingLeft = "26px"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "20px"; }}
                    >
                      <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
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
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>Saved Vendors ({compareSelected.length})</h3>
              <button onClick={() => setSavedOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "12px 24px", flex: 1 }}>
              {compareSelected.map((v) => (
                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #f0e8dc", background: "#fffcf5", marginBottom: 8 }}>
                  <img src={v.image || FALLBACK} alt={v.name} style={{ width: 52, height: 42, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 14 }}>{v.name || "Vendor"}</div>
                    {v.city && <div style={{ fontSize: 12, color: "#9B7450" }}>{v.city}</div>}
                  </div>
                  <button onClick={() => dispatch(removeVendorFromCompare(v._id))}
                    style={{ fontSize: 14, padding: "3px 10px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#888", cursor: "pointer" }}>×</button>
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
