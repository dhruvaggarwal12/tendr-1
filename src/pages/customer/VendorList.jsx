import { useSelector, useDispatch } from "react-redux";
import SEO, { vendorListTitle, vendorListDescription } from "../../components/SEO";
import { setFilters, addVendorToCompare, removeVendorFromCompare, clearVendorCompare } from "../../redux/listingFiltersSlice.js";
import { setCategoryBudgets } from "../../redux/eventPlanningSlice.js";


import { useNavigate, useLocation } from "react-router-dom";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

import ListingsNav from "../../components/ListingsNav";
import PrimaryFilters_ListingPage from "../../components/PrimaryFilters_ListingPage";
import SecondaryFilters_ListingPage, { applySecondaryFilters } from "../../components/SecondaryFilters_ListingPage";
import VendorList_ListingPage from "../../components/VendorList_ListingPage";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getVendors } from "../../apis/vendorApi";
import CompareModal from "../../components/CompareModal";
import Footer from "../../components/Footer.jsx";
import BasicSpeedDial from "../../components/BasicSpeedDial.jsx";
import JourneyProgress from "../../components/JourneyProgress";
import HamburgerNav from "../../components/HamburgerNav";
import PullToRefresh from "../../components/PullToRefresh";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const VendorList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const {
    eventType,
    serviceType,
    locationType,
    date,
    guestCount,
    corporateOnly,
  } = useSelector((state) => state.listingFilters);

  const {
    eventName,
    eventType: formEventType,
    additionalInfo,
    budget: formBudget,
    extraRequirements,
  } = useSelector((state) => state.eventPlanning.formData);
  const bookingType = useSelector((s) => s.eventPlanning.bookingType || "");
  const isNormalFlow = bookingType === "you-do-it";
  const isFromPlanFlow = new URLSearchParams(location.search).get("fromPlan") === "1";
  const categoryBudgets = useSelector((s) => s.eventPlanning.categoryBudgets || {});

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

  // Per-category budget for current service type
  const currentCatBudget = categoryBudgets[serviceType] || location.state?.categoryBudgets?.[serviceType] || null;
  // When opened from Budget Allocator, show fixed budget label only — no slider
  const fromBudgetAllocator = location.state?.fromBudgetAllocator === true;
  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  const [showHint, setShowHint] = useState(true);
  const [showTip, setShowTip] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secondaryFilters, setSecondaryFilters] = useState({});
  const [pendingSecondaryFilters, setPendingSecondaryFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  // Read URL query params and apply as filters (HamburgerNav "Browse" + rejection WA link pre-fill)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const updates = {};
    const svc      = params.get("serviceType");
    const evType   = params.get("eventType");
    const dt       = params.get("date");
    const guests   = params.get("guests");
    const loc      = params.get("location");
    if (svc)    updates.serviceType  = svc;
    if (evType) updates.eventType    = evType;
    if (dt)     updates.date         = dt;
    if (guests) updates.guestCount   = parseInt(guests) || guests;
    if (loc)    updates.locationType = loc;
    if (Object.keys(updates).length) dispatch(setFilters(updates));
  }, [location.search]); // re-run when URL params change (sidebar Browse→ buttons)

  // Gate: redirect to /booking if user hasn't filled ALL 5 event form fields
  useEffect(() => {
    if (user?.isAdmin) return;
    if (finalisedCount > 0) return;
    if (location.state?.selectedCategories?.length) return;
    // Bypass gate when arriving from a rejected-chat WA link (event details in URL)
    if (new URLSearchParams(location.search).get("from") === "rejected") return;

    // All 5 fields must be present in Redux
    if (formEventType && locationType && date && guestCount) return; // budget optional

    // Check persisted session in localStorage
    try {
      const raw = localStorage.getItem("tendr_ep_session");
      if (raw) {
        const session = JSON.parse(raw);
        const fd = session.formData || session;
        if (fd.eventType && fd.guests && fd.budget && fd.location && fd.date) return;
      }
    } catch {}

    // Check persisted finalisedVendors
    try {
      const fv = localStorage.getItem("tendr_finalised");
      if (fv) {
        const parsed = JSON.parse(fv);
        if (parsed && Object.keys(parsed).some(k => k !== "__expiresAt")) return;
      }
    } catch {}

    navigate("/booking", { replace: true });
  }, []); // eslint-disable-line

  // 20-sec tip popup (compare or save depending on flow)
  useEffect(() => {
    const t = setTimeout(() => setShowTip(true), 20000);
    return () => clearTimeout(t);
  }, []);

  // Restore saved scroll position after vendors load (not on mount — vendors aren't rendered yet)
  const [pendingScroll, setPendingScroll] = useState(() => {
    const saved = sessionStorage.getItem("listings_scroll_y");
    if (saved) { sessionStorage.removeItem("listings_scroll_y"); return Number(saved); }
    return null;
  });
  useEffect(() => {
    if (pendingScroll !== null && !isLoading && vendorList.length > 0) {
      const y = pendingScroll;
      setPendingScroll(null);
      // Two rAFs: first lets React paint, second lets the browser lay out images
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" })));
    }
  }, [isLoading, vendorList.length, pendingScroll]);

  const doFetch = React.useCallback(() => {
    setIsLoading(true);
    const payload = {
      ...(locationType && { location: locationType }),
      ...(serviceType && { serviceTypes: [serviceType] }),
      ...(currentCatBudget && { maxPrice: currentCatBudget }),
      ...(date && { date }),
      ...((corporateOnly || formEventType === "Corporate Event") && { hasCorporateExperience: true }),
      sortBy, sortOrder, page: 1, limit: 20, serviceFilters: secondaryFilters,
    };
    return getVendors(payload)
      .then((data) => { setVendorList(data.vendors || []); setPaginationInfo(data.pagination || {}); setCurrentPage(1); })
      .catch((err) => console.error("Error fetching vendors:", err))
      .finally(() => setIsLoading(false));
  }, [sortBy, sortOrder, secondaryFilters, locationType, serviceType, currentCatBudget]);

  // fetch on filter changes
  useEffect(() => {
    setIsLoading(true);
    const payload = {
      ...(locationType && { location: locationType }),
      ...(serviceType && { serviceTypes: [serviceType] }),
      ...(currentCatBudget && { maxPrice: currentCatBudget }),
      ...(date && { date }),
      ...((corporateOnly || formEventType === "Corporate Event") && { hasCorporateExperience: true }),
      sortBy, sortOrder, page: 1, limit: 20, serviceFilters: secondaryFilters,
    };
    getVendors(payload)
      .then((data) => { setVendorList(data.vendors || []); setPaginationInfo(data.pagination || {}); setCurrentPage(1); })
      .catch((err) => console.error("Error fetching vendors:", err))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, locationType, serviceType, currentCatBudget]); // secondaryFilters excluded to prevent loop

  const fetchPage = (pageNum) => {
    setIsLoading(true);
    const payload = {
      ...(locationType && { location: locationType }),
      ...(serviceType && { serviceTypes: [serviceType] }),
      ...(currentCatBudget && { maxPrice: currentCatBudget }),
      ...(date && { date }),
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
      ...(date && { date }),
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
    <PullToRefresh onRefresh={doFetch}>
    <div style={{ minHeight: "100vh", background: "#F8F4EF" }}>
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
      <HamburgerNav active="Browse" showBack />
      <div>
        {/* Full-width main content */}
        <div className="p-3 lg:p-4" style={{ position: "relative" }}>
          {/* Page header */}
          <div className="mb-1">

            {/* Per-category budget range adjuster — compact slider (or fixed label from Budget Allocator) */}
            {serviceType && (() => {
              const CAT_RANGES = {
                Caterer:      { min: 5000,  max: 500000, step: 5000  },
                Decorator:    { min: 3000,  max: 300000, step: 3000  },
                Photographer: { min: 3000,  max: 200000, step: 3000  },
                DJ:           { min: 2000,  max: 100000, step: 2000  },
              };
              const range = CAT_RANGES[serviceType] || { min: 2000, max: 300000, step: 2000 };
              const val = currentCatBudget || range.max;
              return (
                <div className="vendor-budget-strip" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 100, background: "rgba(196,122,46,0.06)", border: "1.5px solid rgba(196,122,46,0.18)", fontFamily: "'Outfit',sans-serif", maxWidth: "calc(100vw - 40px)", boxSizing: "border-box" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#5a3a1a", flexShrink: 0 }}>
                    💰 {serviceType}
                  </span>
                  {fromBudgetAllocator ? (
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#C47A2E" }}>{fmtBudget(val)}</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, color: "#9B7450", flexShrink: 0 }}>{fmtBudget(range.min)}</span>
                      <div style={{ flex: 1, minWidth: 80 }}>
                        <style>{`.budget-sl::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#C47A2E;cursor:pointer;box-shadow:0 1px 4px rgba(196,122,46,0.4)}.budget-sl::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#C47A2E;cursor:pointer;border:none}.budget-sl{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;outline:none;border:none}`}</style>
                        <input type="range" min={range.min} max={range.max} step={range.step} value={val}
                          className="budget-sl"
                          onChange={e => dispatch(setCategoryBudgets({ ...categoryBudgets, [serviceType]: Number(e.target.value) }))}
                          style={{ width: "100%", cursor: "pointer", background: `linear-gradient(to right, #C47A2E ${((val - range.min) / (range.max - range.min)) * 100}%, rgba(196,122,46,0.2) 0)` }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#C47A2E", flexShrink: 0 }}>{fmtBudget(val)}</span>
                    </>
                  )}
                </div>
              );
            })()}
            {serviceType === "Decorator" && window.innerWidth >= 768 && (
              <div style={{ display: "inline-flex", gap: 8, marginBottom: 12, marginLeft: 8, verticalAlign: "top" }}>
                <button
                  onClick={async () => {
                    setGalleryOpen(true);
                    if (galleryPhotos.length > 0) return;
                    setGalleryLoading(true);
                    try {
                      const res = await fetch(`${BASE_URL}/gallery`);
                      const data = await res.json();
                      setGalleryPhotos((data.grouped?.["Decoration"] || []).map(p => p.imageUrl || p.url || p).filter(Boolean));
                    } catch {} finally { setGalleryLoading(false); }
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 100, background: "rgba(196,122,46,0.06)", border: "1.5px solid rgba(196,122,46,0.18)", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}
                >
                  🖼 See Gallery
                </button>
                <button
                  onClick={() => window.open("/decor-finder", "_blank")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 100, background: "rgba(196,122,46,0.06)", border: "1.5px solid rgba(196,122,46,0.18)", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}
                >
                  🎨 Decor Finder ↗
                </button>
              </div>
            )}

            {/* Category switcher — mobile only dropdown; hidden on desktop (sidebar handles it) */}
            <div className="mobile-cat-switcher" style={{ display: "none", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#9B7450", flexShrink: 0 }}>Category:</span>
                <select value={serviceType || ""}
                  onChange={e => dispatch(setFilters({ serviceType: e.target.value }))}
                  style={{ flex: 1, padding: "7px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#2C1A0E", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit',sans-serif", cursor: "pointer", outline: "none" }}>
                  {[
                    { id: "Photographer", label: "📸 Photography" },
                    { id: "Caterer",      label: "🍽 Catering" },
                    { id: "Decorator",    label: "🎀 Decoration" },
                    { id: "DJ",           label: "🎵 DJ" },
                  ].map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <style>{`
              @media (max-width: 639px) {
                .mobile-cat-switcher { display: block !important; }
                .vendor-filter-chips { flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none !important; padding-bottom: 4px !important; }
                .vendor-filter-chips::-webkit-scrollbar { display: none; }
                .vendor-filter-chips span { font-size: 10px !important; padding: 2px 7px !important; }
                .vendor-sort-row { flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none !important; justify-content: flex-start !important; gap: 6px !important; }
                .vendor-sort-row::-webkit-scrollbar { display: none; }
              }
            `}</style>

            <div style={{ marginBottom: 10 }} className="vendor-heading-wrap">
              <style>{`@media(max-width:639px){.vendor-heading-wrap h1{display:none!important}}`}</style>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: "#1a1a1a", margin: 0, lineHeight: 1.2, textDecoration: "underline", textDecorationColor: "rgba(196,122,46,0.5)", textUnderlineOffset: 5 }}>
                {serviceType || "All"} Vendors
              </h1>
            </div>

            <div className="vendor-filter-chips" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                eventName ? { label: "Event", value: eventName, showLabel: false } : null,
                (formEventType || eventType) ? { label: "Type", value: formEventType || eventType, showLabel: false } : null,
                locationType ? { label: "Location", value: locationType, showLabel: false } : null,
                date ? { label: "Date", value: (() => { try { const d = new Date(date + "T00:00:00"); return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`; } catch { return date; } })(), showLabel: false } : null,
                guestCount ? { label: "Guests", value: guestCount, showLabel: false } : null,
                currentCatBudget ? { label: "Budget", value: (() => { const mins = {Caterer:5000,Decorator:3000,Photographer:3000,DJ:2000}; return `${fmtBudget(mins[serviceType]||0)} – ${fmtBudget(currentCatBudget)}`; })(), showLabel: false } : null,
                additionalInfo ? { label: "Note", value: additionalInfo, showLabel: false } : null,
                ...(extraRequirements?.length ? extraRequirements.map(r => ({ label: r, value: r, showLabel: false, isExtra: true })) : []),
              ]
                .filter(Boolean)
                .map(({ label, value, showLabel, isExtra }) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: 100,
                      background: isExtra ? "rgba(196,122,46,0.08)" : "#f5f0e8",
                      color: isExtra ? "#7A3A0E" : "#4a2c0e",
                      border: isExtra ? "1px solid rgba(196,122,46,0.28)" : "1px solid rgba(139,69,19,0.18)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      whiteSpace: "nowrap",
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

            <div className="listings-sort-sticky vendor-sort-row" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {/* Sort controls — left */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#9B7450" }}>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, padding: "3px 8px", borderRadius: 100, border: "1px solid rgba(204,171,74,0.6)", background: "#fff", color: "#4a2c0e", cursor: "pointer", outline: "none" }}>
                  <option value="rankingScore">Best Match</option>
                  <option value="rating">Rating</option>
                  <option value="price">Price</option>
                  <option value="experience">Experience</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, padding: "3px 8px", borderRadius: 100, border: "1px solid rgba(204,171,74,0.6)", background: "#fff", color: "#4a2c0e", cursor: "pointer", outline: "none" }}>
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
                {/* Corporate filter is now auto-applied when eventType === "Corporate Event" — no manual toggle */}
              </div>

              {/* Filters button */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 16px", borderRadius: 100, border: `1.5px solid ${filtersOpen ? "#C47A2E" : "rgba(196,122,46,0.4)"}`, background: filtersOpen ? "rgba(196,122,46,0.07)" : "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                >
                  <span>⚙ Filters</span>
                  <span style={{ display: "inline-block", transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: 11 }}>⌄</span>
                </button>

                {/* Filters — bottom sheet on mobile, dropdown on desktop */}
                {/* Desktop dropdown (position: absolute, unaffected by backdrop-filter parent) */}
                {filtersOpen && (
                  <div className="filters-desktop-panel" style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 99994,
                    width: 320, maxHeight: "70vh", overflowY: "auto",
                    background: "#fff", borderRadius: 16,
                    border: "1.5px solid rgba(196,122,46,0.2)",
                    boxShadow: "0 8px 32px rgba(44,26,14,0.14)",
                    padding: "18px 20px", fontFamily: "'Outfit', sans-serif",
                  }}>
                    <div style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 12px" }}>Service & Location</p>
                      <PrimaryFilters_ListingPage onSearch={(params) => { handleSearch(params); setFiltersOpen(false); }} allowedServiceTypes={selectedCategories} />
                    </div>
                    {serviceType && (
                      <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 14px" }}>{serviceType} Filters</p>
                        <SecondaryFilters_ListingPage serviceType={serviceType} onFiltersChange={(f) => setPendingSecondaryFilters(f)} />
                      </div>
                    )}
                    <button
                      onClick={() => { setSecondaryFilters(pendingSecondaryFilters); setFiltersOpen(false); }}
                      style={{ marginTop: 16, width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                    >
                      Apply
                    </button>
                  </div>
                )}
                {/* Mobile: portal backdrop + sheet to body to escape backdrop-filter containing block */}
                {filtersOpen && createPortal(
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 99993 }} onClick={() => setFiltersOpen(false)} />
                    <div className="filters-mobile-sheet" style={{
                      position: "fixed", bottom: "calc(60px + env(safe-area-inset-bottom, 0px))", left: 0, right: 0, zIndex: 99994,
                      background: "#FFFCF5", borderRadius: "20px 20px 0 0",
                      boxShadow: "0 -8px 40px rgba(44,26,14,0.18)",
                      maxHeight: "78vh",
                      display: "flex", flexDirection: "column",
                      fontFamily: "'Outfit', sans-serif",
                      animation: "sheet-up 0.28s cubic-bezier(0.4,0,0.2,1)",
                    }}>
                      {/* Fixed header */}
                      <div style={{ flexShrink: 0 }}>
                        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
                          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(196,122,46,0.25)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 20px 10px" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>Filters</span>
                          <button onClick={() => setFiltersOpen(false)} style={{ background: "none", border: "none", fontSize: 20, color: "#9B7450", cursor: "pointer", padding: 0 }}>✕</button>
                        </div>
                      </div>
                      {/* Scrollable filter content */}
                      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 10px" }}>Service & Location</p>
                          <PrimaryFilters_ListingPage onSearch={handleSearch} allowedServiceTypes={selectedCategories} hideButton />
                        </div>
                        {serviceType && (
                          <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 12 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 10px" }}>{serviceType} Filters</p>
                            <SecondaryFilters_ListingPage serviceType={serviceType} onFiltersChange={(f) => setPendingSecondaryFilters(f)} />
                          </div>
                        )}
                      </div>
                      {/* Sticky Apply button — always visible */}
                      <div style={{ flexShrink: 0, padding: "12px 20px 16px", borderTop: "1.5px solid rgba(196,122,46,0.1)" }}>
                        <button
                          onClick={() => { handleSearch(); setSecondaryFilters(pendingSecondaryFilters); setFiltersOpen(false); }}
                          style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>
            </div>
          </div>

          {/* Corporate filter active indicator */}
          {formEventType === "Corporate Event" && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 100, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 11, fontWeight: 600, color: "#7c3aed", marginBottom: 10 }}>
              🏢 Showing corporate-experienced vendors — based on your Corporate Event type
            </div>
          )}

          {/* How to book strip — shown for all users */}
          {showHint && (
            <div className="vendor-hint-strip" style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.12),rgba(204,171,74,0.08))", border: "1.5px solid rgba(196,122,46,0.22)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span><span style={{ fontSize: 14, marginRight: 4 }}>💡</span><span style={{ fontSize: 12, color: "#7A4A1A", fontWeight: 700 }}>How to book:</span></span>
                <button onClick={() => setShowHint(false)} style={{ background: "rgba(196,122,46,0.1)", border: "none", borderRadius: "50%", color: "#9B7450", cursor: "pointer", fontSize: 12, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none" }}>
                {[{ step: "1", label: "Quick View" }, { step: "→" }, { step: "2", label: "Request to Chat" }, { step: "→" }, { step: "3", label: "Finalise Vendor" }, { step: "→" }, { step: "4", label: "Review & Pay" }].map((item, i) =>
                  item.label ? (
                    <span key={i} style={{ background: "rgba(196,122,46,0.14)", color: "#7A4020", fontWeight: 700, fontSize: 11, padding: "2px 9px", borderRadius: 100, whiteSpace: "nowrap", flexShrink: 0, border: "1px solid rgba(196,122,46,0.2)" }}>{item.step}. {item.label}</span>
                  ) : (
                    <span key={i} style={{ color: "rgba(196,122,46,0.4)", fontSize: 10, flexShrink: 0, alignSelf: "center" }}>›</span>
                  )
                )}
              </div>
            </div>
          )}

          {/* 20-sec tip popup */}
          {showTip && (
            <div style={{ position: "fixed", bottom: "calc(72px + env(safe-area-inset-bottom,0px))", left: "50%", transform: "translateX(-50%)", zIndex: 100010, background: "#FFFCF5", borderRadius: 14, padding: "14px 18px", boxShadow: "0 8px 32px rgba(44,26,14,0.2)", border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: "'Outfit',sans-serif", maxWidth: 320, width: "90%" }}>
              <button onClick={() => setShowTip(false)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 14, lineHeight: 1 }}>✕</button>
              {isNormalFlow ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>💡 Compare vendors side by side</div>
                  <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5 }}>Tap the <strong>♡ heart icon</strong> on any vendor card to add them to compare. Then tap Compare in the bottom bar.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>💡 Don't lose a great vendor</div>
                  <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5 }}>Tap the <strong>Save button</strong> on any vendor card to bookmark them. Find saved vendors in the floating icon anytime.</div>
                </>
              )}
            </div>
          )}

          {/* Auth gate — blurs vendor list if not signed in */}
          <div data-tour="vendor-card-area" style={{ position: "relative" }}>
            <VendorList_ListingPage
              eventType={eventType}
              serviceType={serviceType}
              date={date}
              locationType={locationType}
              guestCount={guestCount}
              vendors={(() => {
                const filtered = applySecondaryFilters(vendorList, secondaryFilters, serviceType);
                if (!currentCatBudget) return filtered;
                // Sort: vendors within budget first, then those above
                return [...filtered].sort((a, b) => {
                  const aIn = !a.price || a.price <= currentCatBudget;
                  const bIn = !b.price || b.price <= currentCatBudget;
                  if (aIn && !bIn) return -1;
                  if (!aIn && bIn) return 1;
                  return 0;
                });
              })()}
              paginationInfo={paginationInfo}
              handleShowMore={handleShowMore}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              setSortBy={setSortBy}
              setSortOrder={setSortOrder}
              compareSelected={compareSelected}
              onToggleCompare={toggleCompare}
              compareInProfile={isFromPlanFlow}
              saveToCompare={isFromPlanFlow}
              requireFormBeforeChat={!isFromPlanFlow}
              isLoggedIn={!!token}
            />

            {/* Compare nudge — shown after 3+ vendors loaded, not already comparing */}
            {vendorList.length >= 3 && compareSelected.length === 0 && token && (
              <div style={{ margin: "20px 0", padding: "14px 18px", borderRadius: 14, background: "rgba(196,122,46,0.05)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontFamily: font }}>
                <span style={{ fontSize: 20 }}>🔀</span>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>Comparing vendors?</div>
                  <div style={{ fontSize: 12, color: "#9B7450" }}>Add vendors to Compare to see their profiles side by side before deciding.</div>
                </div>
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                  Use Compare Tool →
                </button>
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

      {/* Gallery modal — Decorator, desktop only */}
      {galleryOpen && (
        <div
          onClick={() => setGalleryOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#FFFCF5", borderRadius: 20, width: "min(92vw,900px)", maxHeight: "85vh", display: "flex", flexDirection: "column", fontFamily: font, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>🖼 Decoration Gallery</h3>
              <button onClick={() => setGalleryOpen(false)} style={{ width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: 16, flex: 1 }}>
              {galleryLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#9B7450", fontSize: 14 }}>Loading photos…</div>
              ) : galleryPhotos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#9B7450", fontSize: 14 }}>No decoration photos yet.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {galleryPhotos.map((url, i) => (
                    <div key={i} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", background: "#f0e8d8" }}>
                      <img src={url} alt={`Decoration ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <a
                        href={url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        style={{ position: "absolute", bottom: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, textDecoration: "none" }}
                        title="Download"
                        onClick={e => e.stopPropagation()}
                      >⬇</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer (unchanged) */}
      <Footer />
    </div>
    </PullToRefresh>
  );
};

export default VendorList;