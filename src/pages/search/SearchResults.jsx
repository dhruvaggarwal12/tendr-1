import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFilters } from "../../redux/listingFiltersSlice";
import HamburgerNav from "../../components/HamburgerNav";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import VendorList_ListingPage from "../../components/VendorList_ListingPage";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const PLATFORM_CATEGORIES = ["Caterer", "Decorator", "Photographer", "DJ"];
const PLATFORM_LOCATIONS  = ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Greater Noida", "Faridabad"];
const CAT_EMOJI = { Caterer: "🍽️", Decorator: "🎨", Photographer: "📸", DJ: "🎵" };

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();

  const rawCats    = (searchParams.get("categories") || "").split(",").filter(Boolean);
  const rawLocs    = (searchParams.get("locations")  || "").split(",").filter(Boolean);
  const rawBudget  = searchParams.get("budget") ? Number(searchParams.get("budget")) : null;
  const rawQuery   = searchParams.get("q") || "";
  const isUnknown  = searchParams.get("unknown") === "1";

  // Active filter state (for swap chips)
  const [activeCat, setActiveCat] = useState(rawCats[0] || "");
  const [activeLoc, setActiveLoc] = useState(rawLocs[0] || "");
  const [topRatedOnly, setTopRatedOnly] = useState(false);

  // Vendors state
  const [vendors, setVendors]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pagination, setPagination]   = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Loading overlay (1.5s on first mount)
  const [showOverlay, setShowOverlay] = useState(true);
  const overlayText = (() => {
    const parts = [];
    if (activeCat) parts.push(`${activeCat.toLowerCase()}s`);
    if (activeLoc) parts.push(`in ${activeLoc}`);
    if (rawBudget)  parts.push(`under ₹${Number(rawBudget).toLocaleString("en-IN")}`);
    return parts.length ? `Showing ${parts.join(" ")}...` : "Finding the best vendors...";
  })();

  useEffect(() => {
    const t = setTimeout(() => setShowOverlay(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Fetch vendors when filters change — show all vendors if no category detected
  useEffect(() => {
    if (isUnknown) return; // unknown screen handled separately
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCat) params.set("serviceTypes", activeCat);
    // Pass first location only (backend filters by single location)
    // If multiple locations, we fetch per-location and merge — for now use first
    if (rawLocs.length === 1) params.set("location", rawLocs[0]);
    // If multiple locations or none — no location filter (show all)
    if (rawBudget) params.set("maxPrice", rawBudget);
    if (topRatedOnly) params.set("isTopRated", "true");
    params.set("sortBy", "rankingScore");
    params.set("limit", "20");
    params.set("page", currentPage);

    fetch(`${BASE_URL}/vendors?${params}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { vendors: [] })
      .then(d => { setVendors(d.vendors || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat, activeLoc, rawBudget, currentPage, topRatedOnly]);

  // Sync to Redux so vendor cards work
  useEffect(() => {
    if (activeCat) dispatch(setFilters({ serviceType: activeCat, locationType: activeLoc || "" }));
  }, [activeCat, activeLoc]);

  // Unknown search screen
  if (isUnknown) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
        <BasicSpeedDial />
        <HamburgerNav active="Browse" />
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>
            "{rawQuery}" isn't on Tendr yet
          </h2>
          <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 32px", lineHeight: 1.65 }}>
            We currently cover four service categories for events in Delhi NCR. Here's what we offer:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
            {PLATFORM_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => navigate(`/top-rated/${cat}`)}
                style={{ padding: "16px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", cursor: "pointer", fontFamily: font, textAlign: "center", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.background = "rgba(196,122,46,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.2)"; e.currentTarget.style.background = "#fff"; }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{CAT_EMOJI[cat]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{cat}</div>
              </button>
            ))}
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <BasicSpeedDial />
      <HamburgerNav active="Browse" />

      {/* Loading overlay */}
      {showOverlay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,252,245,0.96)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ width: 52, height: 52, border: "4px solid rgba(196,122,46,0.15)", borderTopColor: "#C47A2E", borderRadius: "50%", animation: "searchSpin 0.7s linear infinite" }} />
          <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", textAlign: "center", maxWidth: 340 }}>{overlayText}</div>
          <div style={{ fontSize: 13, color: "#9B7450" }}>Finding the best matches for you</div>
          <style>{`@keyframes searchSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: 0, textTransform: "capitalize" }}>
              {rawQuery || (activeCat
                ? `${activeCat}s${activeLoc ? ` in ${activeLoc}` : ""}${rawBudget ? ` under ₹${Number(rawBudget).toLocaleString("en-IN")}` : ""}`
                : "Search Results")}
            </h1>
            <button
              onClick={() => { setTopRatedOnly(v => !v); setCurrentPage(1); }}
              style={{ padding: "7px 16px", borderRadius: 100, border: `2px solid ${topRatedOnly ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: topRatedOnly ? "rgba(196,122,46,0.1)" : "#fff", color: topRatedOnly ? "#C47A2E" : "#9B7450", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 5 }}>
              ⭐ Top Rated {topRatedOnly ? "✓" : ""}
            </button>
          </div>
        </div>

        {/* Category swap chips — only the categories that were searched, only if 2+ */}
        {rawCats.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {rawCats.map(cat => (
              <button key={cat} onClick={() => { setActiveCat(cat); setCurrentPage(1); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 100, border: `2px solid ${activeCat === cat ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: activeCat === cat ? "rgba(196,122,46,0.08)" : "#fff", color: activeCat === cat ? "#C47A2E" : "#7A5535", fontSize: 14, fontWeight: activeCat === cat ? 800 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.18s", boxShadow: activeCat === cat ? "0 3px 10px rgba(196,122,46,0.2)" : "none" }}>
                <span style={{ fontSize: 16 }}>{CAT_EMOJI[cat] || "🏷"}</span> {cat}
                {activeCat === cat && <span style={{ fontSize: 10, fontWeight: 700 }}>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Budget badge */}
        {rawBudget > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.2)", fontSize: 12, fontWeight: 600, color: "#7A5535", marginBottom: 16 }}>
            💰 Budget: up to ₹{Number(rawBudget).toLocaleString("en-IN")}
          </div>
        )}

        {/* Vendor results */}
        {!loading && vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>No vendors found</h3>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px" }}>
              {rawBudget ? "Try increasing your budget or removing the budget filter." : "Try a different location or category."}
            </p>
            {rawBudget && (
              <button onClick={() => navigate(`/search?categories=${rawCats.join(",")}&locations=${rawLocs.join(",")}&q=${encodeURIComponent(rawQuery)}`)}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Search without budget filter →
              </button>
            )}
          </div>
        ) : (
          <VendorList_ListingPage
            vendors={vendors}
            serviceType={activeCat}
            locationType={rawLocs.length === 1 ? rawLocs[0] : ""}
            isLoading={loading}
            paginationInfo={pagination}
            handleShowMore={() => setCurrentPage(p => p + 1)}
            isLoggedIn={true}
            hideCompare={true}
            requireFormBeforeChat={true}
          />
        )}
      </div>
    </div>
  );
}
