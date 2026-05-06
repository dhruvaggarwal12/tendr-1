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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-2 pb-4">
              {vendors.map((vendor, index) => {
                const isSelected = compareSelected.some((v) => v._id === vendor._id);

                return (
                  <div
                    key={vendor._id || index}
                    className="group vendor-card bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Vendor Image */}
                    <div className="relative">
                      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-50">
                        <img
                          src={vendor.image || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80"}
                          alt={vendor.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>

                      {/* Verified badge */}
                      {vendor.isVerified && (
                        <div className="absolute top-2 right-2 rounded-full bg-green-500 text-white p-1.5 shadow">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1">
                        {vendor.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1">
                        {vendor.location}
                      </p>

                      {/* Verified badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified Vendor
                        </span>
                        <span className="text-[11px] sm:text-xs text-gray-400">{vendor.serviceType}</span>
                      </div>

                      {/* Vendor stats — always shown, styled like Verified badge */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7a6527] bg-[#fffaea] border border-[#CCAB4A]/50 px-2.5 py-1 rounded-full">
                          Experience: {vendor.yearsOfExperience ?? "—"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7a6527] bg-[#fffaea] border border-[#CCAB4A]/50 px-2.5 py-1 rounded-full">
                          Rating: {vendor.avgReviewScore ?? vendor.rating ?? "—"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7a6527] bg-[#fffaea] border border-[#CCAB4A]/50 px-2.5 py-1 rounded-full">
                          Team size: {vendor.teamSize ?? "—"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7a6527] bg-[#fffaea] border border-[#CCAB4A]/50 px-2.5 py-1 rounded-full">
                          Response: {vendor.responseTime ?? vendor.avgResponseTime ?? "—"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleCardClick(vendor._id)}
                          className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-[#CCAB4A]/60 focus:outline-none focus:ring-2 focus:ring-[#CCAB4A]/40 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare?.(vendor);
                          }}
                          className={`flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#CCAB4A]/40 ${
                            isSelected
                              ? "bg-[#CCAB4A] text-white border-[#CCAB4A]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#CCAB4A]/60"
                          }`}
                          aria-pressed={isSelected}
                        >
                          {isSelected ? "Added ✓" : "Add to Compare"}
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
