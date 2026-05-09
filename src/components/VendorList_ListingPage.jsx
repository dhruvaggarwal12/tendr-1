// src/components/VendorList_ListingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  isLoggedIn = false,
}) => {
  const navigate = useNavigate();
  const [quickViewVendor, setQuickViewVendor] = useState(null);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border border-gray-100 bg-white p-3 sm:p-4">
                  <div className="aspect-[16/10] w-full rounded-md bg-gray-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-16 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full border border-dashed border-[#CCAB4A] flex items-center justify-center">
                <svg className="h-6 w-6 text-[#CCAB4A]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-gray-600">No vendors found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2 pb-4">
              {vendors.map((vendor, index) => {
                const isSelected = compareSelected.some((v) => v._id === vendor._id);
                const rating = vendor.avgReviewScore ?? vendor.rating;

                return (
                  <div
                    key={vendor._id || index}
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
                    {/* Image */}
                    <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                      <img
                        src={vendor.image || vendor.portfolioPhotos?.[0] || FALLBACK_IMG}
                        alt={vendor.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        loading="lazy"
                      />
                      {rating != null && (
                        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(196,122,46,0.92)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          ⭐ {Number(rating).toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: 0, lineHeight: 1.3 }}>{vendor.name}</h3>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "rgba(196,122,46,0.1)", color: "#C47A2E", whiteSpace: "nowrap", marginLeft: 6 }}>
                          {vendor.serviceType}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9B7450", marginBottom: 14, flexWrap: "wrap" }}>
                        {(vendor.city || vendor.address?.city || vendor.locations?.[0]) && (
                          <span>📍 {vendor.city || vendor.address?.city || vendor.locations?.[0]}</span>
                        )}
                        {vendor.yearsOfExperience > 0 && <span>⏱ {vendor.yearsOfExperience}y exp</span>}
                        {vendor.teamSize > 0 && <span>👥 Team {vendor.teamSize}</span>}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setQuickViewVendor(vendor); }}
                          style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
                        >
                          Quick View
                        </button>
                        {isLoggedIn && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleCompare?.(vendor); }}
                            style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(139,69,19,0.2)"}`, background: isSelected ? "rgba(196,122,46,0.1)" : "#fff", color: isSelected ? "#C47A2E" : "#6B3A1F", fontSize: 16, fontWeight: 700, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
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
                <button
                  onClick={(e) => { closePanel(); handleViewProfile(e, quickViewVendor._id); }}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
                >
                  View Full Profile →
                </button>
                <button
                  onClick={() => {
                    closePanel();
                    sessionStorage.setItem("listings_scroll_y", String(window.scrollY));
                    navigate("/chat", {
                      state: {
                        vendor: { _id: quickViewVendor._id, name: quickViewVendor.name, serviceType: quickViewVendor.serviceType, approved: false },
                        from: "listing",
                      },
                    });
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                >
                  💬 Request to Chat
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
    </div>
  );
};

export default VendorList_ListingPage;
