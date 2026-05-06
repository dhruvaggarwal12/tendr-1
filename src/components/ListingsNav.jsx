import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";

const itemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "9px 14px",
  borderRadius: 8,
  border: "none",
  background: "transparent",
  fontSize: 14,
  fontWeight: 500,
  color: "#3B2F2F",
  cursor: "pointer",
  fontFamily: "'Outfit', sans-serif",
  transition: "background 0.15s",
};

const ListingsNav = ({
  hasSelections = false,
  onOpenSelected,
  selectedCount = 0,
  showFinalisedBtn = false,
  hideTitle = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const finalisedVendors = useSelector((state) => state.listingFilters.finalisedVendors || {});
  const finalisedCount = Object.keys(finalisedVendors).length;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setShowUserMenu(false);
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,252,245,0.98)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,69,19,0.12)",
        boxShadow: "0 2px 16px rgba(139,69,19,0.07)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Center — either "Vendor Listings" title or "Selected Vendors" button */}
        {onOpenSelected ? (
          <button
            onClick={() => onOpenSelected()}
            disabled={selectedCount === 0}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Outfit', sans-serif",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: selectedCount === 0 ? "not-allowed" : "pointer",
              background: selectedCount === 0 ? "#f3f4f6" : "#CCAB4A",
              color: selectedCount === 0 ? "#aaa" : "#fff",
              transition: "background 0.2s",
              boxShadow: selectedCount > 0 ? "0 4px 14px rgba(204,171,74,0.35)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            Selected Vendors
            {selectedCount > 0 && (
              <span
                style={{
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: 100,
                  padding: "2px 9px",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {selectedCount}
              </span>
            )}
          </button>
        ) : !hideTitle ? (
          <h1
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 18,
              fontWeight: 700,
              color: "#2C1A0E",
              letterSpacing: "-0.01em",
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            Vendor Listings
          </h1>
        ) : null}

        {/* Left: Return to Home */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#6B3A1F",
            background: "rgba(139,69,19,0.06)",
            border: "1px solid rgba(139,69,19,0.18)",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.06)")}
        >
          Return to Home
        </button>

        {/* Right: Finalised Vendor (optional) + user menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {showFinalisedBtn && (
            <button
              onClick={() => finalisedCount > 0 && navigate("/booking/review")}
              disabled={finalisedCount === 0}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: finalisedCount > 0 ? "#fff" : "#aaa",
                background: finalisedCount > 0 ? "linear-gradient(135deg, #C47A2E, #CCAB4A)" : "#f3f4f6",
                border: finalisedCount > 0 ? "none" : "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "7px 16px",
                cursor: finalisedCount > 0 ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: finalisedCount > 0 ? "0 3px 10px rgba(196,122,46,0.35)" : "none",
                transition: "all 0.2s",
              }}
            >
              {finalisedCount > 0 ? `Finalised (${finalisedCount})` : "Finalised Vendors"}
            </button>
          )}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "1px solid rgba(139,69,19,0.18)",
                borderRadius: 10,
                padding: "7px 14px",
                cursor: "pointer",
                color: "#3B2F2F",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <FaUserCircle size={18} style={{ color: "#7A4A1E" }} />
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Account"}
              </span>
              <FaChevronDown
                size={10}
                style={{
                  opacity: 0.45,
                  transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.22s ease",
                }}
              />
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 998 }}
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "#FFFEF9",
                    borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(139,69,19,0.11), 0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(139,69,19,0.08)",
                    minWidth: 190,
                    padding: 6,
                    zIndex: 999,
                  }}
                >
                  <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid rgba(139,69,19,0.08)", marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>
                      {user?.name || "User"}
                    </p>
                    {user?.email && (
                      <p style={{ fontSize: 11.5, color: "#9B7450", margin: "2px 0 0" }}>
                        {user.email}
                      </p>
                    )}
                  </div>

                  {[
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Profile", path: "/profile" },
                  ].map(({ label, path }) => (
                    <button
                      key={label}
                      onClick={() => { navigate(path); setShowUserMenu(false); }}
                      style={itemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,69,19,0.07)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {label}
                    </button>
                  ))}

                  <div style={{ borderTop: "1px solid rgba(139,69,19,0.08)", marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={handleLogout}
                      style={{ ...itemStyle, color: "#C0392B" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(192,57,43,0.07)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ListingsNav;
