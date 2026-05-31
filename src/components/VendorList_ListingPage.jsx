// src/components/VendorList_ListingPage.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useChatOverlay } from "../context/ChatContext";
import { setMultipleFormData, setBookingType } from "../redux/eventPlanningSlice";

const SAVED_KEY = "tendr_saved_vendors";
const getSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; } };
const isSaved = (id) => getSaved().some(v => v._id === id);
const toggleSaved = (vendor) => {
  const list = getSaved();
  const exists = list.some(v => v._id === vendor._id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(
    exists ? list.filter(v => v._id !== vendor._id) : [...list, { _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, image: vendor.image || vendor.portfolioPhotos?.[0] || "", city: vendor.city || "" }]
  ));
};

const font = "'Outfit', sans-serif";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80";

const VendorList_ListingPage = ({
  eventType,
  serviceType,
  date,
  locationType,
  guestCount,
  vendors = [],
  paginationInfo = {},
  currentPage = 1,
  handleShowMore,
  isLoading,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  compareSelected = [],
  onToggleCompare,
  hideCompare = false,
  isLoggedIn = false,
  requireFormBeforeChat = false, // when true: show event form before opening chat
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openVendorChat } = useChatOverlay();
  const { token } = useSelector(s => s.auth);
  const [quickViewVendor, setQuickViewVendor] = useState(null);
  const [chatFormVendor, setChatFormVendor] = useState(null);
  const [chatEventForm, setChatEventForm] = useState({ eventType: "", guests: "", date: "", location: "" });
  const [savedTick, setSavedTick] = useState(0); // re-render trigger after save toggle
  const [shareCopiedId, setShareCopiedId] = useState(null); // tracks which vendor URL was copied

  const handleToggleSave = useCallback((vendor) => {
    toggleSaved(vendor);
    setSavedTick(t => t + 1);
  }, []);

  // Keyboard: Esc closes QuickView/form, arrows navigate between vendors in QuickView
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (chatFormVendor) { setChatFormVendor(null); return; }
        if (quickViewVendor) { setQuickViewVendor(null); return; }
      }
      if (!quickViewVendor || vendors.length < 2) return;
      const idx = vendors.findIndex(v => v._id === quickViewVendor._id);
      if (e.key === "ArrowRight" && idx < vendors.length - 1) setQuickViewVendor(vendors[idx + 1]);
      if (e.key === "ArrowLeft"  && idx > 0)                  setQuickViewVendor(vendors[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickViewVendor, chatFormVendor, vendors]);

  const handleViewProfile = (e, vendorId) => {
    e.stopPropagation();
    // Save scroll position before leaving
    sessionStorage.setItem("listings_scroll_y", String(window.scrollY));
    navigate(`/vendor/${vendorId}`, {
      state: {
        from: "listing",
        filters: { eventType, serviceType, locationType, date, guestCount, sortBy, sortOrder },
      },
    });
  };

  const closePanel = () => setQuickViewVendor(null);

  return (
    <div className="flex flex-col min-h-full">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5">


        <div className="vendor-list">
          {isLoading ? (
            <div className="vendor-list-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                /* Skeleton matches horizontal card layout on mobile, vertical on desktop */
                <div key={i} className="vendor-card animate-pulse"
                  style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.08)", overflow: "hidden", display: "flex" }}>
                  {/* Image placeholder */}
                  <div className="vendor-card-img"
                    style={{ width: 110, minWidth: 110, height: "auto", minHeight: 120, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", flexShrink: 0 }} />
                  {/* Info placeholder */}
                  <div className="vendor-card-info" style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                    <div style={{ height: 14, width: "65%", borderRadius: 6, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                    <div style={{ height: 11, width: "45%", borderRadius: 6, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                    <div style={{ height: 30, borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginTop: 4 }} />
                  </div>
                </div>
              ))}
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          ) : vendors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px 40px", fontFamily: font }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>No vendors found</h3>
              <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 6px", lineHeight: 1.6 }}>
                {serviceType ? `No ${serviceType.toLowerCase()} vendors matched your filters.` : "No vendors matched your filters."}
              </p>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 6px" }}>Want to see all {serviceType ? `${serviceType.toLowerCase()} vendors` : "vendors"}?</p>
              <p style={{ fontSize: 12, color: "#bbb", margin: "0 0 24px" }}>Start your event planning and browse all available vendors.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/booking")}
                  style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  Plan Your Event →
                </button>
                <button
                  onClick={() => navigate(-1)}
                  style={{ padding: "10px 22px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  ← Go back
                </button>
              </div>
            </div>
          ) : (
            <div className="vendor-list-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2 pb-4">
              {serviceType === "Decorator" && (
                <div style={{ background: "linear-gradient(145deg,#2C1A0E,#3D2210)", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.3)", overflow: "hidden", fontFamily: font, display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 220, background: "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.1))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
                    <div style={{ fontSize: 52 }}>🎁</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "#CCAB4A", color: "#2C1A0E", padding: "3px 9px", borderRadius: 20 }}>Coming Soon</span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(255,255,255,0.12)", color: "#fff", padding: "3px 9px", borderRadius: 20 }}>Under ₹2K</span>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Tendr Celebration Kit</h3>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", margin: "0 0 10px", lineHeight: 1.45, flex: 1 }}>Balloons, fairy lights, confetti, table runners &amp; more — curated for your event theme. DIY, delivered.</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A" }}>✦ Decor</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Pan India delivery</span>
                    </div>
                  </div>
                </div>
              )}
              {vendors.map((vendor, index) => {
                const isSelected = compareSelected.some((v) => v._id === vendor._id);
                const rating = vendor.avgReviewScore ?? vendor.rating;

                return (
                  <div
                    key={vendor._id || index}
                    className="vendor-card"
                    onClick={() => setQuickViewVendor(vendor)}
                    style={{
                      background: "#FFFCF5", borderRadius: 20,
                      border: "1.5px solid rgba(196,122,46,0.12)",
                      boxShadow: "0 4px 20px rgba(139,69,19,0.07)",
                      overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
                      fontFamily: font, cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(139,69,19,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.07)"; }}
                  >
                    {/* Image — 60% of card */}
                    <div className="vendor-card-img" style={{ height: 220, overflow: "hidden", position: "relative" }}>
                      <img
                        src={vendor.image || vendor.portfolioPhotos?.[0] || FALLBACK_IMG}
                        alt={vendor.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,10,0,0.55) 0%, transparent 55%)", pointerEvents: "none" }} />
                      {/* Top Rated star badge */}
                      {vendor.isTopRated && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(196,122,46,0.5)" }}>
                          ⭐ Top Rated
                        </div>
                      )}
                      {/* Rating badge — only if has real reviews; else Verified badge */}
                      {rating != null && rating > 0 ? (
                        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#FFCC55", borderRadius: 100, padding: "4px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          ★ {Number(rating).toFixed(1)}
                        </div>
                      ) : (
                        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(196,122,46,0.88)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          ✓ Verified
                        </div>
                      )}
                      {/* Service type at bottom-left over image */}
                      <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.9)", color: "#fff", padding: "3px 9px", borderRadius: 20 }}>
                        {vendor.serviceType}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="vendor-card-info" style={{ padding: "14px 16px 16px" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px", lineHeight: 1.3 }}>{vendor.name}</h3>

                      <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#9B7450", marginBottom: 10, flexWrap: "wrap" }}>
                        {(vendor.city || vendor.address?.city || vendor.locations?.[0]) && (
                          <span>📍 {vendor.city || vendor.address?.city || vendor.locations?.[0]}</span>
                        )}
                        {vendor.yearsOfExperience > 0 && <span>⏱ {vendor.yearsOfExperience}y exp</span>}
                        {vendor.startingPrice && <span style={{ fontWeight: 700, color: "#C47A2E" }}>₹{Number(vendor.startingPrice).toLocaleString("en-IN")}+</span>}
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        {vendor.avgReviewScore > 0 ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, background: "rgba(204,171,74,0.1)", color: "#7A4A1A", border: "1px solid rgba(196,122,46,0.22)", borderRadius: 100, padding: "3px 11px" }}>
                            ★ {Number(vendor.avgReviewScore).toFixed(1)} rated
                            {vendor.totalEventsCompleted > 0 && ` · ${vendor.totalEventsCompleted}+ events`}
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, background: "rgba(196,122,46,0.07)", color: "#7A4A1A", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 100, padding: "3px 11px" }}>
                            ✓ Verified by Tendr
                            {vendor.yearsOfExperience > 0 && ` · ${vendor.yearsOfExperience} yrs`}
                            {vendor.totalEventsCompleted > 0 && ` · ${vendor.totalEventsCompleted}+ events`}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {/* Primary CTA */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setQuickViewVendor(vendor); }}
                          style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 12px rgba(196,122,46,0.35)", transition: "box-shadow 0.18s" }}
                          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 18px rgba(196,122,46,0.5)")}
                          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(196,122,46,0.35)")}
                        >
                          View Profile
                        </button>
                        {/* Save button — always visible */}
                        {(() => { const saved = isSaved(vendor._id); return (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleSave(vendor); }}
                            title={saved ? "Saved" : "Save vendor"}
                            style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${saved ? "#C47A2E" : "rgba(139,69,19,0.2)"}`, background: saved ? "rgba(196,122,46,0.1)" : "transparent", color: saved ? "#C47A2E" : "#9B7450", fontSize: 16, cursor: "pointer", flexShrink: 0, transition: "all 0.15s", lineHeight: 1 }}
                          >
                            {saved ? "♥" : "♡"}
                          </button>
                        ); })()}
                        {/* Compare CTA — hidden when hideCompare=true */}
                        {isLoggedIn && !hideCompare && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleCompare?.(vendor); }}
                            style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(139,69,19,0.25)"}`, background: isSelected ? "rgba(196,122,46,0.08)" : "transparent", color: isSelected ? "#C47A2E" : "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, fontFamily: font, transition: "all 0.15s" }}
                          >
                            {isSelected ? "✓" : "+"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Show More */}
        {paginationInfo?.totalPages > currentPage && (
          <div className="flex justify-center mt-4 sm:mt-6 mb-10">
            <button
              type="button"
              onClick={handleShowMore}
              disabled={isLoading}
              className={`rounded-full shadow-sm px-6 py-2.5 font-semibold border border-[#CCAB4A] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#CCAB4A]/30 ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-md"}`}
            >
              {isLoading ? "Loading..." : "Show More"}
            </button>
          </div>
        )}
      </div>

      {/* ── Quick-view side panel ── */}
      {quickViewVendor && (
        <>
          {/* Backdrop */}
          <div
            onClick={closePanel}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1100, animation: "qv-fade 0.2s ease" }}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed", right: 0, top: 0, height: "100vh",
              width: 420, maxWidth: "92vw",
              background: "#FFFCF5", zIndex: 1101,
              boxShadow: "-8px 0 48px rgba(139,69,19,0.18)",
              overflowY: "auto", fontFamily: font,
              animation: "qv-slide 0.32s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Cover image */}
            <div style={{ position: "relative", height: 230, flexShrink: 0 }}>
              <img
                src={quickViewVendor.portfolioPhotos?.[0] || quickViewVendor.image || FALLBACK_IMG}
                alt={quickViewVendor.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={closePanel}
                style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
              {(quickViewVendor.avgReviewScore ?? quickViewVendor.rating) != null && (
                <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(196,122,46,0.92)", color: "#fff", borderRadius: 100, padding: "5px 12px", fontSize: 13, fontWeight: 700 }}>
                  ⭐ {Number(quickViewVendor.avgReviewScore ?? quickViewVendor.rating).toFixed(1)}
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ padding: "22px 24px 32px" }}>
              {/* Name + type */}
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                  {quickViewVendor.name}
                </h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: "rgba(196,122,46,0.12)", color: "#C47A2E" }}>
                  {quickViewVendor.serviceType}
                </span>
              </div>

              {/* Stats pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  (quickViewVendor.city || quickViewVendor.address?.city || quickViewVendor.locations?.[0]) && {
                    icon: "📍",
                    val: quickViewVendor.city || quickViewVendor.address?.city || quickViewVendor.locations?.[0],
                  },
                  quickViewVendor.yearsOfExperience > 0 && { icon: "⏱", val: `${quickViewVendor.yearsOfExperience}y experience` },
                  quickViewVendor.teamSize > 0 && { icon: "👥", val: `Team of ${quickViewVendor.teamSize}` },
                ]
                  .filter(Boolean)
                  .map(({ icon, val }) => (
                    <div key={val} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#7A5535", background: "rgba(196,122,46,0.07)", borderRadius: 20, padding: "5px 12px", border: "1px solid rgba(196,122,46,0.12)" }}>
                      <span style={{ fontSize: 14 }}>{icon}</span> {val}
                    </div>
                  ))}
              </div>

              {/* ── About (base schema) ── */}
              {(() => {
                const v = quickViewVendor;
                const base = [
                  v.totalEventsCompleted > 0 && { label: "Events completed", value: v.totalEventsCompleted },
                  v.teamSize > 0             && { label: "Team size",         value: v.teamSize },
                  v.yearsOfExperience > 0    && { label: "Experience",        value: `${v.yearsOfExperience} years` },
                  v.locations?.length > 0    && { label: "Serves",            value: v.locations.join(", ") },
                ].filter(Boolean);
                if (!base.length) return null;
                return (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>About</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {base.map(({ label, value }) => (
                        <div key={label} style={{ background: "rgba(196,122,46,0.05)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(196,122,46,0.1)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", lineHeight: 1.35 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ── Specialties (service-specific) ── */}
              {(() => {
                const v = quickViewVendor;
                const specific = [
                  // DJ
                  v.setup?.length          && { label: "Setup",            value: v.setup.join(", ") },
                  v.eventTypes?.length     && { label: "Event types",      value: v.eventTypes.join(", ") },
                  v.lightsIncluded != null && { label: "Lights",           value: v.lightsIncluded ? "Included ✓" : "Not included" },
                  // Decorator
                  v.themes?.length             && { label: "Themes",           value: v.themes.join(", ") },
                  v.typesOfDecoration?.length  && { label: "Decor types",      value: v.typesOfDecoration.join(", ") },
                  v.venueCoverage?.length      && { label: "Venue coverage",   value: v.venueCoverage.join(", ") },
                  // Caterer
                  v.cuisine?.length            && { label: "Cuisine",          value: v.cuisine.join(", ") },
                  v.serviceStyle?.length       && { label: "Service style",    value: v.serviceStyle.join(", ") },
                  v.menuType?.length           && { label: "Menu type",        value: v.menuType.join(", ") },
                  v.beveragesIncluded != null  && { label: "Beverages",        value: v.beveragesIncluded ? "Included ✓" : "Not included" },
                  // Photographer
                  v.services?.length           && { label: "Services",         value: v.services.join(", ") },
                  v.photographyType?.length    && { label: "Style",            value: v.photographyType.join(", ") },
                  v.hoursIncluded > 0          && { label: "Hours included",   value: `${v.hoursIncluded}h` },
                  v.editingTimeDays > 0        && { label: "Editing time",     value: `${v.editingTimeDays} days` },
                  v.photographersCount > 0     && { label: "Photographers",    value: v.photographersCount },
                  v.videographersCount > 0     && { label: "Videographers",    value: v.videographersCount },
                ].filter(Boolean);
                if (!specific.length) return null;
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "0 0 14px" }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Specialties</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {specific.map(({ label, value }) => (
                        <div key={label} style={{ background: "rgba(196,122,46,0.05)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(196,122,46,0.1)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", lineHeight: 1.35 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Portfolio thumbnails */}
              {quickViewVendor.portfolioPhotos?.length > 1 && (
                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                    Portfolio
                  </p>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                    {quickViewVendor.portfolioPhotos.slice(0, 5).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt=""
                        style={{ width: 82, height: 72, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1.5px solid rgba(196,122,46,0.12)" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 0 20px" }} />

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => { closePanel(); handleViewProfile(e, quickViewVendor._id); }}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
                  >
                    View Full Profile →
                  </button>
                  {/* Share button — uses shareCopiedId from component state (no hooks-in-IIFE) */}
                  {(() => {
                    const copied = shareCopiedId === quickViewVendor._id;
                    const share = async () => {
                      const url = `${window.location.origin}/vendor/${quickViewVendor._id}`;
                      if (navigator.share) { try { await navigator.share({ title: quickViewVendor.name, url }); } catch {} }
                      else { await navigator.clipboard.writeText(url); setShareCopiedId(quickViewVendor._id); setTimeout(() => setShareCopiedId(null), 2000); }
                    };
                    return (
                      <button onClick={share} title={copied ? "Copied!" : "Share"}
                        style={{ padding: "13px 14px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: copied ? "rgba(196,122,46,0.08)" : "#fff", color: "#C47A2E", cursor: "pointer", flexShrink: 0, fontSize: 16, transition: "all 0.2s" }}>
                        {copied ? "✓" : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        )}
                      </button>
                    );
                  })()}
                </div>
                <button
                  onClick={() => {
                    if (!token) {
                      navigate("/login", { state: { returnTo: window.location.pathname + window.location.search } });
                      return;
                    }
                    if (requireFormBeforeChat) {
                      setChatFormVendor(quickViewVendor);
                      setChatEventForm({ eventType: "", guests: "", date: "", location: "" });
                      closePanel();
                    } else {
                      closePanel();
                      openVendorChat({ _id: quickViewVendor._id, name: quickViewVendor.name, serviceType: quickViewVendor.serviceType });
                    }
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                >
                  💬 {token ? "Request to Chat" : "Sign In to Chat"}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes qv-fade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes qv-slide { from { transform: translateX(100%) } to { transform: translateX(0) } }
          `}</style>
        </>
      )}

      {/* Pre-chat event form (shown when requireFormBeforeChat=true) */}
      {chatFormVendor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font }}
          onClick={() => setChatFormVendor(null)}>
          <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px", maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Your Event Details</h2>
                <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Tell us about your event — this goes to {chatFormVendor.name}</p>
              </div>
              <button onClick={() => setChatFormVendor(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9B7450", padding: 0 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "What's the occasion?", field: "eventType", placeholder: "e.g. Birthday, Wedding, Anniversary..." },
                { label: "Guest count", field: "guests", placeholder: "Approx. number of guests" },
                { label: "Event date", field: "date", placeholder: "", type: "date" },
                { label: "Location", field: "location", placeholder: "City / area" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
                  <input type={type || "text"} placeholder={placeholder} value={chatEventForm[field]}
                    onChange={e => setChatEventForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                // Save event details to Redux so wizard skips already-answered questions
                dispatch(setMultipleFormData({
                  eventType: chatEventForm.eventType,
                  guests: chatEventForm.guests,
                  date: chatEventForm.date,
                  location: chatEventForm.location,
                }));
                dispatch(setBookingType("you-do-it"));
                openVendorChat({ _id: chatFormVendor._id, name: chatFormVendor.name, serviceType: chatFormVendor.serviceType });
                setChatFormVendor(null);
              }}
              style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
              Request to Chat with {chatFormVendor.name} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList_ListingPage;
