import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeVendorFromCompare, clearVendorCompare } from "../redux/listingFiltersSlice";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80";

export default function SelectedVendorsFloat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const compareSelected = useSelector((state) => state.listingFilters.compareSelected);
  const { token } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  if (!token || compareSelected.length === 0) return null;

  const grouped = compareSelected.reduce((acc, v) => {
    const cat = v?.primaryService || v?.serviceType || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 90,
          left: 24,
          zIndex: 900,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 20px",
          borderRadius: 100,
          border: "none",
          background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Outfit', sans-serif",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(196,122,46,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(196,122,46,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 18px rgba(196,122,46,0.45)";
        }}
      >
        Selected Vendors
        <span
          style={{
            background: "rgba(255,255,255,0.3)",
            borderRadius: 100,
            padding: "2px 9px",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {compareSelected.length}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: "96%",
              maxWidth: 640,
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
              fontFamily: "'Outfit', sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid #f0e8dc",
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>
                Selected Vendors
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: "#9B7450" }}>
                  ({compareSelected.length})
                </span>
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#555",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                overflowY: "auto",
                padding: "12px 24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {Object.entries(grouped).map(([cat, vendors]) => (
                <div key={cat}>
                  <p
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#C47A2E",
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      margin: "10px 0 6px",
                    }}
                  >
                    {cat}
                  </p>
                  {vendors.map((v) => (
                    <div
                      key={v._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1.5px solid #f0e8dc",
                        background: "#fffcf5",
                        marginBottom: 6,
                      }}
                    >
                      <img
                        src={
                          v.image ||
                          v.coverImage ||
                          (v.images && v.images[0]) ||
                          FALLBACK_IMG
                        }
                        alt={v.name || "Vendor"}
                        style={{
                          width: 52,
                          height: 42,
                          objectFit: "cover",
                          borderRadius: 8,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#2C1A0E",
                            fontSize: 14,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {v.name || v.businessName || "Verified Vendor"}
                        </div>
                        {v.city && (
                          <div style={{ fontSize: 12, color: "#9B7450" }}>{v.city}</div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => { setOpen(false); navigate("/vendor/" + v._id); }}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "#f5eedf",
                            color: "#7A4A1E",
                            cursor: "pointer",
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => dispatch(removeVendorFromCompare(v._id))}
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            padding: "3px 10px",
                            borderRadius: 8,
                            border: "1.5px solid rgba(0,0,0,0.1)",
                            background: "#f5f5f5",
                            color: "#888",
                            cursor: "pointer",
                            fontFamily: "'Outfit', sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 24px",
                borderTop: "1px solid #f0e8dc",
              }}
            >
              <button
                onClick={() => { dispatch(clearVendorCompare()); setOpen(false); }}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  background: "#f5f5f5",
                  color: "#555",
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => { setOpen(false); navigate("/listings"); }}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "7px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 3px 12px rgba(196,122,46,0.35)",
                }}
              >
                Go to Listings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
