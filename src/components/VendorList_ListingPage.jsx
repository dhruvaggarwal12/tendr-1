// src/components/VendorList_ListingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

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
  // NEW props
  compareSelected = [],
  onToggleCompare,
}) => {
  const navigate = useNavigate();

  const handleCardClick = (vendorId) => {
    // ✅ SPA navigation (no full reload, Redux state stays intact)
    navigate(`/vendor/${vendorId}`, {
      state: {
        from: "listing",
        filters: {
          eventType,
          serviceType,
          locationType,
          date,
          guestCount,
          sortBy,
          sortOrder,
        },
      },
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Content container */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5">
        {/* Vendor Cards */}
        <div className="vendor-list">
          {isLoading ? (
            // Skeleton grid—keeps layout stable
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-gray-100 bg-white p-3 sm:p-4"
                >
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
                <svg
                  className="h-6 w-6 text-[#CCAB4A]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 5v14m-7-7h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                No vendors found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2 pb-4">
              {vendors.map((vendor, index) => {
                const isSelected = compareSelected.some((v) => v._id === vendor._id);
                const rating = vendor.avgReviewScore ?? vendor.rating;

                return (
                  <div
                    key={vendor._id || index}
                    style={{ background: "#FFFCF5", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 4px 20px rgba(139,69,19,0.07)", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "'Outfit', sans-serif" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(139,69,19,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.07)"; }}
                  >
                    {/* Image */}
                    <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                      <img
                        src={vendor.image || vendor.portfolioPhotos?.[0] || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80"}
                        alt={vendor.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        loading="lazy"
                      />
                      {/* Rating badge */}
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
                          onClick={() => handleCardClick(vendor._id)}
                          style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleCompare?.(vendor); }}
                          style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(139,69,19,0.2)"}`, background: isSelected ? "rgba(196,122,46,0.1)" : "#fff", color: isSelected ? "#C47A2E" : "#6B3A1F", fontSize: 16, fontWeight: 700, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {isSelected ? "✓" : "+"}
                        </button>
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
              className={`rounded-full shadow-sm px-6 py-2.5 font-semibold border border-[#CCAB4A] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#CCAB4A]/30 ${
                isLoading ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              {isLoading ? "Loading..." : "Show More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorList_ListingPage;
