import { useSelector, useDispatch } from "react-redux";
import { setFilters, addVendorToCompare, removeVendorFromCompare, clearVendorCompare } from "../../redux/listingFiltersSlice.js";


import { useNavigate, useLocation } from "react-router-dom";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

import ListingsNav from "../../components/ListingsNav";
import PrimaryFilters_ListingPage from "../../components/PrimaryFilters_ListingPage";
import SecondaryFilters_ListingPage from "../../components/SecondaryFilters_ListingPage";
import VendorList_ListingPage from "../../components/VendorList_ListingPage";
import { useEffect, useState } from "react";
import { getVendors } from "../../apis/vendorApi";
import CompareModal from "../../components/CompareModal";
import Footer from "../../components/Footer.jsx";
import BasicSpeedDial from "../../components/BasicSpeedDial.jsx";

const VendorList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();

  const {
    eventType,
    serviceType,
    locationType,
    date,
    guestCount,
  } = useSelector((state) => state.listingFilters);

  const {
    eventName,
    eventType: formEventType,
    budget,
    additionalInfo,
  } = useSelector((state) => state.eventPlanning.formData);

  // Categories pre-selected on the service category page
  const selectedCategories = location.state?.selectedCategories || [];

  // Active category tab — default to first selected or redux serviceType
  const [activeCategory, setActiveCategory] = useState(
    selectedCategories[0] || serviceType || null
  );

  const [vendorList, setVendorList] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secondaryFilters, setSecondaryFilters] = useState({});
  const [sortBy, setSortBy] = useState("rankingScore");
  const [sortOrder, setSortOrder] = useState("desc");

  // Compare — persisted in Redux so VendorDetails can read it
  const compareSelected = useSelector((state) => state.listingFilters.compareSelected);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const toggleCompare = (vendor) => {
    const exists = compareSelected.find((v) => v._id === vendor._id);
    if (exists) {
      dispatch(removeVendorFromCompare(vendor._id));
    } else {
      dispatch(addVendorToCompare(vendor));
    }
  };
  const removeFromCompare = (id) => dispatch(removeVendorFromCompare(id));
  const clearCompare = () => dispatch(clearVendorCompare());

  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [modalCompareIds, setModalCompareIds] = useState([]);

  // Group compareSelected by service category
  const groupedByCategory = compareSelected.reduce((acc, v) => {
    const cat = v?.primaryService || v?.serviceType || serviceType || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});
  const modalCategories = Object.keys(groupedByCategory);

  const openSelectedModal = () => {
    setActiveModalCategory(modalCategories[0] ?? null);
    setModalCompareIds([]);
    setIsSelectedModalOpen(true);
  };

  const toggleModalCompare = (id) => {
    setModalCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  // Booking review navigation after vendor selection
  const handleGoToBookingReview = () => {
    // Example: collect all event and vendor data here
    const bookingDetails = {
      eventName: eventType,
      service: serviceType,
      date: date,
      guests: guestCount,
      vendors: vendorList.filter(v => v.selected), // or your selection logic
      address: locationType,
      basePrice: 250, // replace with actual price logic
      customerId: localStorage.getItem("userId"),
      addons: [],
      amount: 250,
    };
    navigate('/booking/review', { state: { booking: bookingDetails } });
  };

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // fetch on changes — always filter by activeCategory only (one category at a time)
  useEffect(() => {
    setIsLoading(true);

    const categoryToFetch = activeCategory || serviceType || null;

    const payload = {
      ...(locationType && { location: locationType }),
      ...(categoryToFetch && { serviceTypes: [categoryToFetch] }),
      sortBy,
      sortOrder,
      page: 1,
      limit: 20,
      serviceFilters: secondaryFilters,
    };

    getVendors(payload)
      .then((data) => {
        setVendorList(data.vendors || []);
        setPaginationInfo(data.pagination || {});
        setCurrentPage(1);
      })
      .catch((err) => console.error("Error fetching vendors:", err))
      .finally(() => setIsLoading(false));
  }, [sortBy, sortOrder, secondaryFilters, locationType, serviceType, activeCategory]);

  const fetchPage = (pageNum) => {
    setIsLoading(true);
    const categoryToFetch = activeCategory || serviceType || null;
    const payload = {
      ...(locationType && { location: locationType }),
      ...(categoryToFetch && { serviceTypes: [categoryToFetch] }),
      sortBy,
      sortOrder,
      page: pageNum,
      limit: 20,
      serviceFilters: secondaryFilters,
    };
    getVendors(payload)
      .then((data) => {
        if (pageNum === 1) {
          setVendorList(data.vendors || []);
        } else {
          setVendorList((prev) => [...prev, ...(data.vendors || [])]);
        }
        setPaginationInfo(data.pagination || {});
        setCurrentPage(pageNum);
      })
      .catch((err) => console.error("Error fetching vendors:", err))
      .finally(() => setIsLoading(false));
  };

  const handleShowMore = () => fetchPage(currentPage + 1);

  const handleSearch = () => {
    if (!locationType || !serviceType) return;

    setIsLoading(true);
    const payload = {
      location: locationType,
      serviceTypes: [serviceType],
      sortBy,
      sortOrder,
      page: 1,
      limit: 10,
      serviceFilters: secondaryFilters,
    };

    getVendors(payload)
      .then((data) => {
        setVendorList(data.vendors || []);
        setPaginationInfo(data.pagination || {});
        setCurrentPage(1);
      })
      .catch((err) => console.error("Error fetching vendors:", err))
      .finally(() => setIsLoading(false));
  };


  // Category labels mapping
  const CATEGORY_LABELS = { Caterer: "Catering", Photographer: "Photography", DJ: "DJ & Music", Decorator: "Decoration" };

  return (
    <div className="min-h-screen bg-gray-50">
      <BasicSpeedDial />
      <ListingsNav hasSelections={compareSelected.length > 0} />

      {/* Category tabs — shown when multiple categories selected */}
      {selectedCategories.length > 1 && (
        <div style={{ background: "#FFFCF5", borderBottom: "1px solid rgba(196,122,46,0.15)", padding: "0 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 4, overflowX: "auto", paddingBottom: 0 }}>
            {selectedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  background: "transparent",
                  borderBottom: activeCategory === cat ? "3px solid #C47A2E" : "3px solid transparent",
                  color: activeCategory === cat ? "#C47A2E" : "#9B7450",
                  fontWeight: activeCategory === cat ? 700 : 500,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.18s",
                }}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 bg-white shadow-lg lg:shadow-none lg:border-r border-gray-200">
          <div className="p-4 lg:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 lg:mb-6">
              Filters
            </h2>

            {/* Primary filters */}
            <div className="mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3">
                Primary Filters
              </h3>
              <PrimaryFilters_ListingPage
                onSearch={handleSearch}
                allowedServiceTypes={selectedCategories}
              />
            </div>

          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-3 lg:p-4">
          {/* Page header */}
          <div className="mb-1">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: "#1a1a1a", margin: 0, lineHeight: 1.2, textDecoration: "underline", textDecorationColor: "rgba(196,122,46,0.5)", textUnderlineOffset: 5 }}>
                {serviceType || "All"} Vendors
              </h1>
              <button
                onClick={openSelectedModal}
                disabled={compareSelected.length === 0}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 32px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  cursor: compareSelected.length === 0 ? "not-allowed" : "pointer",
                  background: compareSelected.length === 0 ? "#f3f4f6" : "#CCAB4A",
                  color: compareSelected.length === 0 ? "#aaa" : "#fff",
                  transition: "background 0.2s",
                  boxShadow: compareSelected.length > 0 ? "0 4px 14px rgba(204,171,74,0.35)" : "none",
                }}
              >
                Selected Vendors
                {compareSelected.length > 0 && (
                  <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: 100, padding: "2px 9px", fontSize: 13, fontWeight: 800 }}>
                    {compareSelected.length}
                  </span>
                )}
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                eventName ? { label: "Event", value: eventName, showLabel: false } : null,
                (formEventType || eventType) ? { label: "Type", value: formEventType || eventType, showLabel: false } : null,
                locationType ? { label: "Location", value: locationType, showLabel: false } : null,
                date ? { label: "Date", value: date, showLabel: false } : null,
                guestCount ? { label: "Guests", value: guestCount, showLabel: false } : null,
                budget ? { label: "Budget", value: budget, showLabel: false } : null,
                additionalInfo ? { label: "Note", value: additionalInfo, showLabel: false } : null,
              ]
                .filter(Boolean)
                .map(({ label, value, showLabel }) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "5px 14px",
                      borderRadius: 100,
                      background: "#f5f0e8",
                      color: "#4a2c0e",
                      border: "1px solid rgba(139,69,19,0.18)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {showLabel && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#9B6B3A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {label}
                      </span>
                    )}
                    {value}
                  </span>
                ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "#9B7450" }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(204,171,74,0.6)", background: "#fff", color: "#4a2c0e", cursor: "pointer", outline: "none" }}
              >
                <option value="rankingScore">Best Match</option>
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="experience">Experience</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(204,171,74,0.6)", background: "#fff", color: "#4a2c0e", cursor: "pointer", outline: "none" }}
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>

          <VendorList_ListingPage
            eventType={eventType}
            serviceType={serviceType}
            date={date}
            locationType={locationType}
            guestCount={guestCount}
            vendors={vendorList}
            paginationInfo={paginationInfo}
            handleShowMore={handleShowMore}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
            compareSelected={compareSelected}
            onToggleCompare={toggleCompare}
          />

          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchPage(Math.max(1, currentPage - 1))}
                  disabled={isLoading || currentPage === 1}
                  className="px-3 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(5, paginationInfo.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          pageNum > currentPage ? handleShowMore() : fetchPage(pageNum)
                        }
                        className={`px-3 py-2 text-sm sm:text-base rounded-lg ${currentPage === pageNum
                          ? "bg-[#CCAB4A] text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => fetchPage(currentPage + 1)}
                  disabled={
                    isLoading ||
                    (paginationInfo.totalPages &&
                      currentPage >= paginationInfo.totalPages)
                  }
                  className="px-3 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CompareModal
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        vendors={compareSelected.filter((v) => modalCompareIds.includes(v._id))}
      />

      {isSelectedModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsSelectedModalOpen(false)}
        >
          <div
            style={{ width: "96%", maxWidth: 768, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", maxHeight: "88vh", fontFamily: "'Outfit', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #f0e8dc" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>
                Selected Vendors
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: "#9B7450" }}>
                  ({compareSelected.length} total)
                </span>
              </h3>
              <button
                onClick={() => setIsSelectedModalOpen(false)}
                style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 14, color: "#555" }}
              >
                x
              </button>
            </div>

            {compareSelected.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#9B7450", fontSize: 14 }}>
                No vendors selected yet. Use the Select button on vendor cards.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, padding: "16px 24px 4px", flexWrap: "wrap" }}>
                  {modalCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveModalCategory(cat); setModalCompareIds([]); }}
                      style={{
                        padding: "6px 18px",
                        borderRadius: 100,
                        fontSize: 13,
                        fontWeight: 600,
                        border: "2px solid",
                        cursor: "pointer",
                        transition: "all 0.18s",
                        fontFamily: "'Outfit', sans-serif",
                        borderColor: activeModalCategory === cat ? "#C47A2E" : "rgba(139,69,19,0.18)",
                        background: activeModalCategory === cat ? "#C47A2E" : "#fff",
                        color: activeModalCategory === cat ? "#fff" : "#6B3A1F",
                      }}
                    >
                      {cat}
                      <span
                        style={{
                          marginLeft: 6,
                          background: activeModalCategory === cat ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.12)",
                          color: activeModalCategory === cat ? "#fff" : "#C47A2E",
                          borderRadius: 100,
                          padding: "1px 7px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {groupedByCategory[cat].length}
                      </span>
                    </button>
                  ))}
                </div>

                <p style={{ padding: "4px 24px 4px", fontSize: 12, color: "#aaa", margin: 0 }}>
                  Select vendors in this category to compare them side by side.
                </p>

                <div style={{ overflowY: "auto", padding: "8px 24px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  {(groupedByCategory[activeModalCategory] || []).map((v) => {
                    const isChecked = modalCompareIds.includes(v._id);
                    return (
                      <div
                        key={v._id}
                        style={{
                          border: isChecked ? "2px solid #C47A2E" : "1.5px solid #f0e8dc",
                          borderRadius: 14,
                          padding: "12px 14px",
                          display: "flex",
                          gap: 14,
                          alignItems: "flex-start",
                          background: isChecked ? "#fffaf4" : "#fff",
                          transition: "border 0.18s, background 0.18s",
                        }}
                      >
                        <img
                          src={v.image || v.coverImage || (v.images && v.images[0]) || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80"}
                          alt={v.name || "Vendor"}
                          style={{ width: 88, height: 66, objectFit: "cover", borderRadius: 10, flexShrink: 0, background: "#f5f5f5" }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {v.name || v.businessName || "Verified Vendor"}
                          </div>
                          <div style={{ fontSize: 13, color: "#7A5535" }}>
                            {v.primaryService || activeModalCategory}
                            {v.city ? " - " + v.city : ""}
                          </div>
                          {v.startingPrice != null && (
                            <div style={{ fontSize: 13, color: "#3B2F2F", marginTop: 2 }}>
                              {String.fromCharCode(8377)}{Number(v.startingPrice).toLocaleString("en-IN")}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button
                              onClick={() => toggleModalCompare(v._id)}
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "5px 12px",
                                borderRadius: 8,
                                border: "1.5px solid " + (isChecked ? "#C47A2E" : "rgba(139,69,19,0.22)"),
                                background: isChecked ? "#C47A2E" : "#fff",
                                color: isChecked ? "#fff" : "#6B3A1F",
                                cursor: "pointer",
                                fontFamily: "'Outfit', sans-serif",
                                transition: "all 0.15s",
                              }}
                            >
                              {isChecked ? "Comparing" : "Add to Compare"}
                            </button>
                            <button
                              onClick={() => removeFromCompare(v._id)}
                              style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#555", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => navigate("/vendor/" + v._id)}
                              style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "none", background: "#f5eedf", color: "#7A4A1E", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid #f0e8dc", flexShrink: 0 }}>
                  <button
                    onClick={clearCompare}
                    style={{ fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#555", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                  >
                    Clear All
                  </button>
                  <button
                    disabled={modalCompareIds.length < 2}
                    onClick={() => {
                      setIsSelectedModalOpen(false);
                      setIsCompareOpen(true);
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "7px 22px",
                      borderRadius: 8,
                      border: "none",
                      background: modalCompareIds.length >= 2 ? "linear-gradient(135deg, #C47A2E, #DEB887)" : "#e5e7eb",
                      color: modalCompareIds.length >= 2 ? "#fff" : "#9ca3af",
                      cursor: modalCompareIds.length >= 2 ? "pointer" : "not-allowed",
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: modalCompareIds.length >= 2 ? "0 3px 12px rgba(196,122,46,0.3)" : "none",
                      transition: "all 0.18s",
                    }}
                  >
                    Compare Selected ({modalCompareIds.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer (unchanged) */}
      <Footer />
    </div>
  );
};

export default VendorList;