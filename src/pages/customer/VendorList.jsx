import { useSelector, useDispatch } from "react-redux";
import SEO, { vendorListTitle, vendorListDescription } from "../../components/SEO";
import { setFilters, addVendorToCompare, removeVendorFromCompare, clearVendorCompare } from "../../redux/listingFiltersSlice.js";


import { useNavigate, useLocation } from "react-router-dom";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

import ListingsNav from "../../components/ListingsNav";
import PrimaryFilters_ListingPage from "../../components/PrimaryFilters_ListingPage";
import SecondaryFilters_ListingPage, { applySecondaryFilters } from "../../components/SecondaryFilters_ListingPage";
import VendorList_ListingPage from "../../components/VendorList_ListingPage";
import { useEffect, useState } from "react";
import { getVendors } from "../../apis/vendorApi";
import CompareModal from "../../components/CompareModal";
import Footer from "../../components/Footer.jsx";
import BasicSpeedDial from "../../components/BasicSpeedDial.jsx";
import JourneyProgress from "../../components/JourneyProgress";
import HamburgerNav from "../../components/HamburgerNav";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";

const VendorList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

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

  // Categories from event planning flow — persists in Redux
  const planningSelectedVendors = useSelector((s) => s.eventPlanning.selectedVendors || []);
  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const finalisedCount = Object.keys(finalisedVendors).length;

  // Categories pre-selected on the service category page, or restored after auth-gate sign-in
  const selectedCategories = (() => {
    if (location.state?.selectedCategories?.length) return location.state.selectedCategories;
    try {
      const saved = sessionStorage.getItem("auth_return_categories");
      if (saved) { sessionStorage.removeItem("auth_return_categories"); return JSON.parse(saved); }
    } catch {}
    // Fall back to Redux selectedVendors from the planning flow
    if (planningSelectedVendors.length) return planningSelectedVendors;
    return [];
  })();

  const [showHint, setShowHint] = useState(true);
  const [vendorList, setVendorList] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secondaryFilters, setSecondaryFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(true);
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

  // Restore saved scroll position (from vendor detail back-nav) or scroll to top
  useEffect(() => {
    const saved = sessionStorage.getItem("listings_scroll_y");
    if (saved) {
      sessionStorage.removeItem("listings_scroll_y");
      const y = Number(saved);
      // Double rAF ensures layout is complete before scrolling
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" })));
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // fetch on changes — one category at a time using Redux serviceType
  useEffect(() => {
    setIsLoading(true);

    const payload = {
      ...(locationType && { location: locationType }),
      ...(serviceType && { serviceTypes: [serviceType] }),
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
  }, [sortBy, sortOrder, secondaryFilters, locationType, serviceType]);

  const fetchPage = (pageNum) => {
    setIsLoading(true);
    const payload = {
      ...(locationType && { location: locationType }),
      ...(serviceType && { serviceTypes: [serviceType] }),
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


  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={vendorListTitle(serviceType, locationType)}
        description={vendorListDescription(serviceType, locationType)}
        path={serviceType || locationType ? `/listings?service=${serviceType || ""}&city=${locationType || ""}` : "/listings"}
        city={locationType || null}
        noIndex={false}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: serviceType ? `${serviceType}s` : "All Vendors", path: "/listings" }]}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": vendorListTitle(serviceType, locationType),
          "description": vendorListDescription(serviceType, locationType),
          "url": "https://tendr.co.in/listings",
          "provider": { "@type": "Organization", "name": "Tendr", "url": "https://tendr.co.in" },
          "about": {
            "@type": "ItemList",
            "name": "Event Vendor Categories on Tendr",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Birthday Decorators in Delhi NCR", "url": "https://tendr.co.in/top-rated/Decorator" },
              { "@type": "ListItem", "position": 2, "name": "Event Caterers in Delhi NCR",      "url": "https://tendr.co.in/top-rated/Caterer" },
              { "@type": "ListItem", "position": 3, "name": "Event Photographers in Delhi NCR", "url": "https://tendr.co.in/top-rated/Photographer" },
              { "@type": "ListItem", "position": 4, "name": "DJs & Entertainment in Delhi NCR", "url": "https://tendr.co.in/top-rated/DJ" },
            ],
          },
        }}
      />
      <BasicSpeedDial />
      <HamburgerNav title="Vendor Listings" active="Browse" />
      <div className="flex flex-col lg:flex-row">
        {/* Filters sidebar */}
        <div className="w-full lg:w-1/4 bg-white shadow-lg lg:shadow-none lg:border-r border-gray-200">
          {/* Filters toggle header */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", background: "none", border: "none",
              borderBottom: filtersOpen ? "1px solid rgba(196,122,46,0.12)" : "none",
              cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>Filters</span>
              {(secondaryFilters && Object.values(secondaryFilters).some(v => v !== undefined && (!Array.isArray(v) || v.length > 0))) && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "#C47A2E", color: "#fff", borderRadius: 100, padding: "2px 7px" }}>Active</span>
              )}
            </div>
            <span style={{ fontSize: 18, color: "#C47A2E", display: "inline-block", transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>⌄</span>
          </button>

          {filtersOpen && (
            <div style={{ padding: "16px 20px", overflowY: "auto", maxHeight: "calc(100vh - 80px)" }}>
              {/* Primary filters */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 12px" }}>
                  Service & Location
                </p>
                <PrimaryFilters_ListingPage
                  onSearch={handleSearch}
                  allowedServiceTypes={selectedCategories}
                />
              </div>

              {/* Secondary filters — category specific */}
              {serviceType && (
                <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 18 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 14px" }}>
                    {serviceType} Filters
                  </p>
                  <SecondaryFilters_ListingPage
                    serviceType={serviceType}
                    onFiltersChange={(f) => setSecondaryFilters(f)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 p-3 lg:p-4" style={{ position: "relative" }}>
          {/* Page header */}
          <div className="mb-1">
            {/* Category tab switcher — shown when customer selected multiple service types */}
            {planningSelectedVendors.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                {planningSelectedVendors.map(cat => (
                  <button
                    key={cat}
                    onClick={() => dispatch(setFilters({ serviceType: cat }))}
                    style={{
                      padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif", cursor: "pointer", border: "1.5px solid",
                      transition: "all 0.15s",
                      borderColor: serviceType === cat ? "#C47A2E" : "rgba(196,122,46,0.25)",
                      background: serviceType === cat ? "#C47A2E" : "#fff",
                      color: serviceType === cat ? "#fff" : "#6B3A1F",
                      boxShadow: serviceType === cat ? "0 3px 10px rgba(196,122,46,0.3)" : "none",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: "#1a1a1a", margin: 0, lineHeight: 1.2, textDecoration: "underline", textDecorationColor: "rgba(196,122,46,0.5)", textUnderlineOffset: 5 }}>
                {serviceType || "All"} Vendors
              </h1>
              <button
                onClick={openSelectedModal}
                disabled={compareSelected.length === 0}
                style={{
                  display: token ? "inline-flex" : "none",
                  fontFamily: "'Outfit', sans-serif",
                  flexShrink: 0,
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
                Compare Vendors
                {compareSelected.length > 0 && (
                  <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: 100, padding: "2px 9px", fontSize: 13, fontWeight: 800 }}>
                    {compareSelected.length}
                  </span>
                )}
              </button>
              {/* Review & Pay — visible once at least one vendor is finalised */}
              {finalisedCount > 0 && token && (
                <button
                  onClick={() => navigate("/booking/review")}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 12px rgba(21,128,61,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
                  Review & Pay ({finalisedCount}) →
                </button>
              )}
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

          {/* What to do next hint — horizontal single-line banner */}
          {token && showHint && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              background: "linear-gradient(135deg,#2C1A0E,#4A2810)",
              borderRadius: 12, padding: "11px 16px", marginBottom: 16,
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 16px rgba(44,26,14,0.18)",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500, flexShrink: 0 }}>How to book:</span>
              {[
                { step: "1", label: "Quick View" },
                { step: "→" },
                { step: "2", label: "Request to Chat" },
                { step: "→" },
                { step: "3", label: "Finalise Vendor" },
                { step: "→" },
                { step: "4", label: "Review & Pay" },
              ].map((item, i) =>
                item.label ? (
                  <span key={i} style={{ background: "rgba(204,171,74,0.22)", color: "#CCAB4A", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>
                    {item.step}. {item.label}
                  </span>
                ) : (
                  <span key={i} style={{ color: "rgba(204,171,74,0.4)", fontSize: 11, flexShrink: 0 }}>›</span>
                )
              )}
              <button
                onClick={() => setShowHint(false)}
                style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >✕</button>
            </div>
          )}

          {/* Auth gate — blurs vendor list if not signed in */}
          <div style={{ position: "relative" }}>
            <VendorList_ListingPage
              eventType={eventType}
              serviceType={serviceType}
              date={date}
              locationType={locationType}
              guestCount={guestCount}
              vendors={applySecondaryFilters(vendorList, secondaryFilters, serviceType)}
              paginationInfo={paginationInfo}
              handleShowMore={handleShowMore}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              setSortBy={setSortBy}
              setSortOrder={setSortOrder}
              compareSelected={compareSelected}
              onToggleCompare={toggleCompare}
              isLoggedIn={!!token}
            />

            {!token && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 50,
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                background: "rgba(255,252,245,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  background: "#FFFCF5", borderRadius: 24,
                  boxShadow: "0 24px 64px rgba(139,69,19,0.18)",
                  border: "1.5px solid rgba(196,122,46,0.2)",
                  padding: "40px 36px", textAlign: "center",
                  maxWidth: 380, width: "90%", fontFamily: font,
                }}>
                  <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
                  <h3 style={{ fontSize: 21, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>
                    Sign in to view vendors
                  </h3>
                  <p style={{ fontSize: 14, color: "#7A5535", margin: "0 0 24px", lineHeight: 1.55 }}>
                    Create a free account to browse vendor listings, compare profiles, and plan your event.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      onClick={() => { sessionStorage.setItem("auth_return", "/listings"); navigate("/login"); }}
                      style={{ padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { sessionStorage.setItem("auth_return", "/listings"); navigate("/signup"); }}
                      style={{ padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                    >
                      Create Free Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                Compare Vendors
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