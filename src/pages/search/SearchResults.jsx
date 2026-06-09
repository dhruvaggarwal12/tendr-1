import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../redux/listingFiltersSlice";
import HamburgerNav from "../../components/HamburgerNav";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import VendorList_ListingPage from "../../components/VendorList_ListingPage";
import FunActivitiesSection from "../../components/FunActivitiesSection";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const PLATFORM_CATEGORIES = ["Caterer", "Decorator", "Photographer", "DJ"];
const PLATFORM_LOCATIONS  = ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Greater Noida", "Faridabad"];
const CAT_EMOJI = { Caterer: "🍽️", Decorator: "🎨", Photographer: "📸", DJ: "🎵", "Fun Activities": "🎭" };

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();

  const { user } = useSelector(s => s.auth);
  const rawCats    = (searchParams.get("categories") || "").split(",").filter(Boolean);
  const rawLocs    = (searchParams.get("locations")  || "").split(",").filter(Boolean);
  const rawBudget  = searchParams.get("budget") ? Number(searchParams.get("budget")) : null;
  const rawQuery   = searchParams.get("q") || "";
  const isUnknown  = searchParams.get("unknown") === "1";
  const allCategories = user?.isAdmin ? [...PLATFORM_CATEGORIES, "Fun Activities"] : PLATFORM_CATEGORIES;

  // Active filter state — sync whenever URL params change
  const [activeCat,   setActiveCat]   = useState(rawCats[0] || "");
  const [localLoc,    setLocalLoc]    = useState(rawLocs[0] || "");
  const [localBudget, setLocalBudget] = useState(null);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortBy, setSortBy]             = useState("rankingScore");
  const [sortOrder, setSortOrder]       = useState("desc");
  const [dateFilter, setDateFilter]     = useState("");
  const [showTip, setShowTip] = useState(false);
  const [showHowToBook, setShowHowToBook] = useState(true);
  const todayStr = new Date().toISOString().split("T")[0];
  useEffect(() => { const t = setTimeout(() => setShowTip(true), 20000); return () => clearTimeout(t); }, []);

  // Re-sync when URL changes (user searches again from this page)
  useEffect(() => {
    setActiveCat(rawCats[0] || "");
    setLocalLoc(rawLocs[0] || "");
    setLocalBudget(null);
    setCurrentPage(1);
    setTopRatedOnly(false);
  }, [searchParams.toString()]);

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

  // Fetch vendors when filters change
  useEffect(() => {
    if (isUnknown) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCat) params.set("serviceTypes", activeCat);
    const effectiveLoc = localLoc || (rawLocs.length === 1 ? rawLocs[0] : "");
    if (effectiveLoc) params.set("location", effectiveLoc);
    const effectiveBudget = localBudget || rawBudget;
    if (effectiveBudget) params.set("maxPrice", effectiveBudget);
    if (topRatedOnly) params.set("isTopRated", "true");
    if (dateFilter)   params.set("date", dateFilter);
    params.set("sortBy", "rankingScore");
    params.set("limit", "20");
    params.set("page", currentPage);

    fetch(`${BASE_URL}/vendors?${params}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { vendors: [] })
      .then(d => { setVendors(d.vendors || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat, localLoc, rawBudget, localBudget, currentPage, topRatedOnly, dateFilter]);

  // Sync to Redux so vendor cards work
  useEffect(() => {
    if (activeCat) dispatch(setFilters({ serviceType: activeCat, locationType: localLoc || "" }));
  }, [activeCat, localLoc]);

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
            {allCategories.map(cat => (
              <button key={cat}
                onClick={() => cat === "Fun Activities" ? navigate("/fun-activities") : navigate(`/top-rated/${cat}`)}
                style={{ padding: "16px", borderRadius: 14, border: `1.5px solid ${cat === "Fun Activities" ? "rgba(124,58,237,0.25)" : "rgba(196,122,46,0.2)"}`, background: cat === "Fun Activities" ? "rgba(124,58,237,0.04)" : "#fff", cursor: "pointer", fontFamily: font, textAlign: "center", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat === "Fun Activities" ? "#7C3AED" : "#C47A2E"; e.currentTarget.style.background = cat === "Fun Activities" ? "rgba(124,58,237,0.08)" : "rgba(196,122,46,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cat === "Fun Activities" ? "rgba(124,58,237,0.25)" : "rgba(196,122,46,0.2)"; e.currentTarget.style.background = cat === "Fun Activities" ? "rgba(124,58,237,0.04)" : "#fff"; }}>
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
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 12px", textTransform: "capitalize" }}>
            {rawQuery || (activeCat
              ? `${activeCat}s${localLoc ? ` in ${localLoc}` : ""}${(localBudget || rawBudget) ? ` under ₹${Number(localBudget || rawBudget).toLocaleString("en-IN")}` : ""}`
              : "Search Results")}
          </h1>

          {/* ── Filter bar ── */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", padding: "14px 16px", marginBottom: 10 }}>
            {/* Location row */}
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em" }}>📍 Location</span>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginTop: 7, paddingBottom: 2 }}>
                {["All", ...PLATFORM_LOCATIONS].map(loc => {
                  const active = loc === "All" ? !localLoc : localLoc === loc;
                  return (
                    <button key={loc}
                      onClick={() => { setLocalLoc(loc === "All" ? "" : loc); setCurrentPage(1); }}
                      style={{ padding: "5px 14px", borderRadius: 100, border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.18)"}`, background: active ? "rgba(196,122,46,0.1)" : "transparent", color: active ? "#C47A2E" : "#7A5535", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, flexShrink: 0, whiteSpace: "nowrap", transition: "all 0.15s" }}>
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date + Budget row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Date */}
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em" }}>📅 Date</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                  <input
                    type="date"
                    value={dateFilter}
                    min={todayStr}
                    onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    style={{ fontFamily: font, fontSize: 12, padding: "5px 11px", borderRadius: 100, border: `1.5px solid ${dateFilter ? "#C47A2E" : "rgba(196,122,46,0.18)"}`, background: dateFilter ? "rgba(196,122,46,0.07)" : "transparent", color: "#4a2c0e", cursor: "pointer", outline: "none" }}
                  />
                  {dateFilter && (
                    <button onClick={() => { setDateFilter(""); setCurrentPage(1); }} style={{ fontSize: 13, color: "#9B7450", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1 }}>✕</button>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em" }}>💰 Budget (per vendor)</span>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>
                  {[
                    { label: "Under ₹10k",  val: 10000 },
                    { label: "Under ₹25k",  val: 25000 },
                    { label: "Under ₹50k",  val: 50000 },
                    { label: "Under ₹1L",   val: 100000 },
                  ].map(({ label, val }) => {
                    const active = localBudget === val || (!localBudget && rawBudget === val);
                    return (
                      <button key={val}
                        onClick={() => { setLocalBudget(active ? null : val); setCurrentPage(1); }}
                        style={{ padding: "5px 13px", borderRadius: 100, border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.18)"}`, background: active ? "rgba(196,122,46,0.1)" : "transparent", color: active ? "#C47A2E" : "#7A5535", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", transition: "all 0.15s" }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sort row */}
          <div className="listings-sort-sticky" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: "#9B7450" }}>Sort:</span>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                style={{ fontFamily: font, fontSize: 11, padding: "3px 8px", borderRadius: 100, border: "1px solid rgba(204,171,74,0.6)", background: "#fff", color: "#4a2c0e", cursor: "pointer", outline: "none" }}>
                <option value="rankingScore">Best Match</option>
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="experience">Experience</option>
              </select>
              <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }}
                style={{ fontFamily: font, fontSize: 11, padding: "3px 8px", borderRadius: 100, border: "1px solid rgba(204,171,74,0.6)", background: "#fff", color: "#4a2c0e", cursor: "pointer", outline: "none" }}>
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
            <button
              onClick={() => { setTopRatedOnly(v => !v); setCurrentPage(1); }}
              style={{ padding: "5px 14px", borderRadius: 100, border: `2px solid ${topRatedOnly ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: topRatedOnly ? "rgba(196,122,46,0.1)" : "#fff", color: topRatedOnly ? "#C47A2E" : "#9B7450", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 5 }}>
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
        {(localBudget || rawBudget) > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.2)", fontSize: 12, fontWeight: 600, color: "#7A5535", marginBottom: 16 }}>
            💰 Budget: up to ₹{Number(localBudget || rawBudget).toLocaleString("en-IN")}
          </div>
        )}

        {/* How to book strip */}
        {showHowToBook && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 12, padding: "11px 16px", marginBottom: 16, fontFamily: font, boxShadow: "0 4px 16px rgba(44,26,14,0.18)" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500, flexShrink: 0 }}>How to book:</span>
            {[{ step: "1", label: "Quick View" }, { step: "→" }, { step: "2", label: "Request to Chat" }, { step: "→" }, { step: "3", label: "Finalise Vendor" }, { step: "→" }, { step: "4", label: "Review & Pay" }].map((item, i) =>
              item.label ? <span key={i} style={{ background: "rgba(204,171,74,0.22)", color: "#CCAB4A", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>{item.step}. {item.label}</span>
              : <span key={i} style={{ color: "rgba(204,171,74,0.4)", fontSize: 11, flexShrink: 0 }}>›</span>
            )}
            <button onClick={() => setShowHowToBook(false)} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
        )}
        {showTip && (
          <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 9000, background: "#FFFCF5", borderRadius: 14, padding: "14px 18px", boxShadow: "0 8px 32px rgba(44,26,14,0.2)", border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, maxWidth: 320, width: "90%" }}>
            <button onClick={() => setShowTip(false)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 14, lineHeight: 1 }}>✕</button>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>💡 Don't lose a great vendor</div>
            <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5 }}>Tap the <strong>Save button</strong> on any vendor card to bookmark them. Find saved vendors in the sidebar anytime.</div>
          </div>
        )}

        {/* Fun Activities category chip (admin only) */}
        {user?.isAdmin && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => { setActiveCat(c => c === "Fun Activities" ? "" : "Fun Activities"); setCurrentPage(1); }}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:100, border:`2px solid ${activeCat === "Fun Activities" ? "#7C3AED" : "rgba(124,58,237,0.25)"}`, background: activeCat === "Fun Activities" ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)", color: activeCat === "Fun Activities" ? "#7C3AED" : "#5B21B6", fontSize:14, fontWeight: activeCat === "Fun Activities" ? 800 : 600, cursor:"pointer", fontFamily:font, transition:"all 0.18s" }}>
              <span style={{ fontSize:16 }}>🎭</span> Fun Activities
              {activeCat === "Fun Activities" && <span style={{ fontSize:10, fontWeight:700 }}>✓</span>}
            </button>
          </div>
        )}

        {/* Fun Activities results panel */}
        {activeCat === "Fun Activities" ? (
          <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid rgba(124,58,237,0.15)", padding:"24px 20px" }}>
            <FunActivitiesSection
              heading="🎭 Fun Activities"
              subheading="Fixed-price entertainment add-ons · Confirmed within 2 hours"
              grid={true}
            />
          </div>
        ) : (
          /* Vendor results */
          !loading && vendors.length === 0 ? (
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
              sortBy={sortBy}
              sortOrder={sortOrder}
              setSortBy={setSortBy}
              setSortOrder={setSortOrder}
              isLoggedIn={true}
              hideCompare={true}
              requireFormBeforeChat={true}
            />
          )
        )}
      </div>
    </div>
  );
}
