import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ListingsNav = ({
  onOpenSelected,
  selectedCount = 0,
  showFinalisedBtn = false,
  hideTitle = false,
}) => {
  const navigate = useNavigate();
  const finalisedVendors = useSelector((state) => state.listingFilters.finalisedVendors || {});
  const finalisedCount = Object.keys(finalisedVendors).length;

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
        {/* Left: spacer (keeps center button truly centered) */}
        <div style={{ flex: 1 }} />

        {/* Center — "Saved Vendors" button or "Vendor Listings" title */}
        {onOpenSelected ? (
          <button
            onClick={() => onOpenSelected()}
            disabled={selectedCount === 0}
            style={{
              fontFamily: "'Outfit', sans-serif",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              border: selectedCount === 0 ? "1.5px solid rgba(139,69,19,0.18)" : "none",
              cursor: selectedCount === 0 ? "not-allowed" : "pointer",
              background: selectedCount === 0 ? "transparent" : "#CCAB4A",
              color: selectedCount === 0 ? "#bbb" : "#fff",
              transition: "all 0.2s",
              boxShadow: selectedCount > 0 ? "0 4px 14px rgba(204,171,74,0.35)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            Saved Vendors
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

        {/* Right: Review & Pay — active only after finalising a vendor */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {showFinalisedBtn && (
            <button
              onClick={() => finalisedCount > 0 && navigate("/booking/review")}
              disabled={finalisedCount === 0}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: finalisedCount > 0 ? "#fff" : "#bbb",
                background: finalisedCount > 0 ? "linear-gradient(135deg, #C47A2E, #CCAB4A)" : "transparent",
                border: finalisedCount > 0 ? "none" : "1.5px solid rgba(139,69,19,0.18)",
                borderRadius: 8,
                padding: "9px 20px",
                cursor: finalisedCount > 0 ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: finalisedCount > 0 ? "0 3px 10px rgba(196,122,46,0.35)" : "none",
                transition: "all 0.2s",
              }}
            >
              {finalisedCount > 0 ? `Review & Pay (${finalisedCount})` : "Review & Pay"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ListingsNav;
