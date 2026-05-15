import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import ListingsNav from "../../components/ListingsNav";
import CompareModal from "../../components/CompareModal";
import HamburgerNav from "../../components/HamburgerNav";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import JourneyProgress from "../../components/JourneyProgress";

import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

import { Heart, Share, Star, Hourglass, CheckCircle2, MapPin, Users, Trophy, Phone } from "lucide-react";

import main1 from "../../assets/vendor-details/main-1.avif";
import main2 from "../../assets/vendor-details/main-2.avif";
import main3 from "../../assets/vendor-details/main-3.avif";
import main4 from "../../assets/vendor-details/main-4.avif";
import main5 from "../../assets/vendor-details/main-5.avif";

import { getVendorById } from "../../apis/vendorApi";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import { useSelector, useDispatch } from "react-redux";
import { addVendorToCompare, removeVendorFromCompare, clearVendorCompare } from "../../redux/listingFiltersSlice";
import Footer from "../../components/Footer";

const VendorDetailsPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();

  // If navigated from listings
  const vendorFromState = location.state?.vendor;

  // Redux compare state
  const compareSelected = useSelector((state) => state.listingFilters.compareSelected);

  // Event form data from Redux
  const formEventName = useSelector((state) => state.eventPlanning.formData.eventName);
  const formEventType = useSelector((state) => state.eventPlanning.formData.eventType);
  const formGuests = useSelector((state) => state.eventPlanning.formData.guests);
  const formLocation = useSelector((state) => state.eventPlanning.formData.location);
  const formDate = useSelector((state) => state.eventPlanning.formData.date);
  const formBudget = useSelector((state) => state.eventPlanning.formData.budget);
  const formAdditionalInfo = useSelector((state) => state.eventPlanning.formData.additionalInfo);

  // Selected Vendors modal state
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [modalCompareIds, setModalCompareIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const serviceTypeForGroup = useSelector((state) => state.listingFilters.serviceType);

  const groupedByCategory = compareSelected.reduce((acc, v) => {
    const cat = v?.primaryService || v?.serviceType || serviceTypeForGroup || "Other";
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
    setModalCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        setError(null);

        let vendorData;
        if (vendorFromState) {
          vendorData = vendorFromState;
        } else if (id) {
          const response = await getVendorById(id);
          vendorData = response.vendor || response;
        } else {
          throw new Error("No vendor ID provided");
        }

        setVendor(vendorData);
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError(err.message || "Failed to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id, vendorFromState]);

  // Auto-add vendor to selected list when viewing their profile
  // The reducer handles deduplication so safe to always dispatch
  useEffect(() => {
    if (!vendor?._id) return;
    dispatch(addVendorToCompare(vendor));
  }, [vendor?._id]);

  // ===== Helpers =====
  const rating = useMemo(() => {
    const r = Number(vendor?.avgReviewScore);
    return Number.isFinite(r) && r > 0 ? r : 4.9;
  }, [vendor]);

  const ratingStars = useMemo(() => {
    const filled = Math.round(rating);
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={12} fill={i < filled ? "black" : "transparent"} stroke="black" />
    ));
  }, [rating]);

  const coverImages = useMemo(() => {
    const apiPhotos = (vendor?.portfolioPhotos || []).filter(Boolean);
    const first = apiPhotos[0] || main1;
    const smalls = apiPhotos.slice(1, 5);
    while (smalls.length < 4) {
      smalls.push([main2, main3, main4, main5][smalls.length]);
    }
    return { first, smalls };
  }, [vendor]);

  const primaryCity = vendor?.address?.city || vendor?.location || vendor?.locations?.[0] || "Location";
  const stateName = vendor?.address?.state || "";
  const serviceType = vendor?.serviceType || "Service";
  const yearsOfExperience = vendor?.yearsOfExperience ?? null;
  const teamSize = vendor?.teamSize ?? null;
  const totalEventsCompleted = vendor?.totalEventsCompleted ?? vendor?.eventsCompleted ?? null;
  const maxConcurrentEvents = vendor?.maxConcurrentEvents ?? vendor?.concurrentEvents ?? null;
  const isPhoneVerified = !!vendor?.phoneVerified;

  // Build info box lines — only show fields that have values
  const infoLines = [
    formEventName && ("Event: " + formEventName),
    formEventType && ("Type: " + formEventType),
    formLocation && ("Location: " + formLocation),
    formDate && ("Date: " + formDate),
    formGuests && ("Guests: " + formGuests),
    formBudget && ("Budget: " + formBudget),
    formAdditionalInfo && ("Notes: " + formAdditionalInfo),
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading vendor details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600 mb-4">Error loading vendor</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => navigate("/listings")}
            className="px-6 py-2 bg-[#CCAB4A] text-white rounded-xl hover:bg-[#ab8f39]"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600 mb-4">Vendor not found</div>
          <div className="text-gray-600 mb-4">The vendor you are looking for does not exist or has been removed.</div>
          <button
            onClick={() => navigate("/listings")}
            className="px-6 py-2 bg-[#CCAB4A] text-white rounded-xl hover:bg-[#ab8f39]"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <BasicSpeedDial />
      {/* Main Navbar */}
      <HamburgerNav active="Browse" />
      {/* Task bar — only shows Review & Pay when vendors are finalised */}
      <div className="border-b-[1px] border-[#CCAB4A]">
        <ListingsNav
          onOpenSelected={openSelectedModal}
          selectedCount={0}
          showFinalisedBtn={true}
          hideTitle={true}
        />
      </div>

      {/* Page Content Container */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title, Share and Save */}
        <div className="flex items-center justify-between py-7">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl lg:text-4xl break-words">
              {vendor.name || "Vendor Name"}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm md:text-base">
                Located in {primaryCity}
                {stateName ? ", " + stateName : ""}
              </span>
            </div>
          </div>

        </div>

        {/* Gallery */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="relative h-[400px] w-full rounded-l-xl overflow-hidden group cursor-pointer">
            <img
              src={coverImages.first}
              alt="Main cover"
              className="h-full w-full object-cover"
              onLoad={() => setIsLoaded(true)}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {coverImages.smalls.map((img, idx) => {
              let rounding = "";
              if (idx === 1) rounding = "rounded-tr-xl";
              if (idx === 3) rounding = "rounded-br-xl";
              return (
                <div
                  key={idx}
                  className={"relative h-[195px] w-full overflow-hidden group cursor-pointer " + rounding}
                >
                  <img
                    src={img}
                    alt={"Gallery " + (idx + 2)}
                    className="h-full w-full object-cover"
                    onLoad={() => setIsLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top Meta & Booking */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 py-10">
          {/* Left: Vendor Info */}
          <div className="lg:w-2/3">
            {/* Quick Facts Pill */}
            <div className="inline-flex items-stretch min-h-16 text-black rounded-3xl border-[1px] border-[#CCAB4A] mt-2 overflow-hidden">
              <div className="flex flex-col justify-center items-center px-6 py-3 gap-1 bg-white">
                <span className="font-semibold text-lg">{rating.toFixed(1)}</span>
                <div className="flex gap-[1px]">{ratingStars}</div>
                <div className="text-xs text-gray-600 mt-1">Average rating</div>
              </div>

              <div className="w-px bg-[#CCAB4A]" />

              <div className="flex flex-col justify-center items-center px-6 py-3">
                <span className="font-semibold text-lg">{yearsOfExperience ?? "—"}</span>
                <div className="text-xs text-gray-600">Years of experience</div>
              </div>

              <div className="w-px bg-[#CCAB4A]" />

              <div className="flex flex-col justify-center items-center px-6 py-3">
                <span className="font-semibold text-lg">{teamSize ?? "—"}</span>
                <div className="text-xs text-gray-600">Team size</div>
              </div>

              <div className="w-px bg-[#CCAB4A]" />

              <div className="flex flex-col justify-center items-center px-6 py-3">
                <span className="font-semibold text-lg">{totalEventsCompleted ?? "—"}</span>
                <div className="text-xs text-gray-600">Events completed</div>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {isPhoneVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-emerald-500 text-emerald-700 bg-emerald-50">
                  <CheckCircle2 className="w-3 h-3" /> Phone verified
                </span>
              )}

              {maxConcurrentEvents != null && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-amber-500 text-amber-700 bg-amber-50">
                  <Users className="w-3 h-3" /> {maxConcurrentEvents} events concurrently
                </span>
              )}
              {serviceType && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-[#CCAB4A] text-[#7a6527] bg-[#fffaea]">
                  <Trophy className="w-3 h-3" /> {serviceType}
                </span>
              )}
            </div>

            {/* Description block */}
            <p className="text-xl text-gray-700 mt-6">
              We offer premium {serviceType?.toLowerCase() || "event"} services with an unwavering commitment to quality,
              sophistication, and detail. From weddings to corporate gatherings, our team curates unforgettable
              experiences end-to-end.
            </p>

            {/* Contact & Service Areas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#CCAB4A] p-4">
                <div className="font-semibold text-lg mb-2">Service Areas</div>
                <div className="flex flex-wrap gap-2">
                  {(vendor.locations || []).map((loc, i) => (
                    <span key={i} className="text-sm px-3 py-1 rounded-full border border-gray-300 bg-white">
                      {loc}
                    </span>
                  ))}
                  {(!vendor.locations || vendor.locations.length === 0) && (
                    <span className="text-sm text-gray-600">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Category-specific info */}
            {(() => {
              const CATEGORY_SECTIONS = {
                Caterer: [
                  { key: "cuisine",           title: "Cuisine Types" },
                  { key: "serviceStyle",      title: "Service Type" },
                  { key: "menuType",          title: "Menu Type" },
                  { key: "beveragesIncluded", title: "Beverage Included", bool: true },
                ],
                Decorator: [
                  { key: "typesOfDecoration", title: "Types of Decoration" },
                  { key: "venueCoverage",     title: "Venue Coverage" },
                ],
                Photographer: [
                  { key: "services",          title: "Which Services" },
                  { key: "photographyType",   title: "Photography Type" },
                  { key: "hoursIncluded",     title: "Hours Included", single: true },
                  { key: "editingTimeDays",   title: "Editing Time (days)", single: true },
                ],
                DJ: [
                  { key: "setup",             title: "Setup Type" },
                  { key: "lightsIncluded",    title: "Lights Included?", bool: true },
                  { key: "eventTypes",        title: "Event Type" },
                ],
                Makeup: [
                  { key: "makeupStyles", title: "Makeup Styles" },
                  { key: "makeupServices", title: "Services" },
                  { key: "brands", title: "Brands" },
                ],
                Venue: [
                  { key: "venueType", title: "Venue Type" },
                  { key: "amenities", title: "Amenities" },
                  { key: "capacityBands", title: "Capacity" },
                ],
                Mehndi: [
                  { key: "mehndiStyles", title: "Mehndi Styles" },
                  { key: "packageTypes", title: "Packages" },
                ],
                Band: [
                  { key: "musicGenres", title: "Music Genres" },
                  { key: "instruments", title: "Instruments" },
                  { key: "bandServices", title: "Services" },
                ],
                Planner: [
                  { key: "specialties", title: "Specialties" },
                  { key: "plannerServices", title: "Services" },
                ],
              };
              const normalised = serviceType?.toLowerCase();
              const categoryKey = Object.keys(CATEGORY_SECTIONS).find(
                (k) => k.toLowerCase() === normalised
              );
              const sections = CATEGORY_SECTIONS[categoryKey] || [];
              return sections.map(({ key, title, bool, single }) => {
                const raw = vendor[key];
                if (raw === undefined || raw === null) return null;

                // Boolean field (Yes / No badge)
                if (bool) return (
                  <div key={key} className="mt-6">
                    <div className="font-semibold text-lg mb-2">{title}</div>
                    <span className={`text-sm px-3 py-1 rounded-full border font-medium ${raw ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 bg-white text-gray-500"}`}>
                      {raw ? "Yes" : "No"}
                    </span>
                  </div>
                );

                // Single value field (number/string)
                if (single) return (
                  <div key={key} className="mt-6">
                    <div className="font-semibold text-lg mb-2">{title}</div>
                    <span className="text-sm px-3 py-1 rounded-full border border-[#CCAB4A] bg-[#fffaea] text-[#7a6527] font-medium">
                      {raw}
                    </span>
                  </div>
                );

                // Array field (tags)
                const values = Array.isArray(raw) ? raw : [raw];
                return (
                  <div key={key} className="mt-6">
                    <div className="font-semibold text-lg mb-2">{title}</div>
                    <div className="flex flex-wrap gap-2">
                      {values.length > 0 ? values.map((item, idx) => (
                        <span key={idx} className="text-sm px-3 py-1 rounded-full border border-gray-300 bg-white">
                          {item}
                        </span>
                      )) : (
                        <span className="text-sm text-gray-600">—</span>
                      )}
                    </div>
                  </div>
                );
              });
            })()}

            {/* Response Time */}
            <div className="inline-flex items-center h-16 text-black font-semibold text-xl rounded-3xl border-[1px] border-[#CCAB4A] mt-6">
              <div className="flex items-center gap-2 px-8 py-2 h-full">
                <Hourglass className="w-5 h-5" />
                <div className="text-xl font-medium pr-8">Response time</div>
                <div className="h-10 w-px bg-[#CCAB4A]"></div>
                <div className="text-xl ml-1 px-8">1 hour</div>
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:w-1/3 bg-white p-5 rounded-2xl shadow-lg border border-[#CCAB4A]">
            <h2 className="text-xl font-semibold">
              {vendor.price ? ("Rs. " + vendor.price) : "Price to be updated"}
            </h2>
            <div className="text-base mt-2 text-gray-600 font-medium">Event Details</div>

            <div className="bg-[#fffaea] mt-4 border border-[#CCAB4A] text-sm font-medium p-3 rounded-xl text-gray-800">
              {infoLines.length > 0 ? (
                infoLines.map((line, i) => (
                  <div key={i} style={{ marginBottom: i < infoLines.length - 1 ? 4 : 0 }}>
                    {line}
                  </div>
                ))
              ) : (
                <span className="text-gray-400">No event details provided.</span>
              )}
            </div>

            {/* Request to chat — not the floating button */}
            <button
              onClick={() => navigate("/chat", { state: { vendor: vendor } })}
              className="w-full mt-5 px-4 py-3 bg-[#CCAB4A] hover:bg-[#ab8f39] text-white rounded-xl text-base font-bold"
            >
              Request to Chat with this Vendor
            </button>
            <p style={{ fontSize: 12, color: "#9B7450", textAlign: "center", marginTop: 6, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
              Submit a request — our team reviews and connects you within a few hours.
            </p>

            {/* Add to Compare */}
            {vendor && (() => {
              const isInCompare = compareSelected.some((v) => v._id === vendor._id);
              return (
                <button
                  onClick={() => isInCompare ? dispatch(removeVendorFromCompare(vendor._id)) : dispatch(addVendorToCompare(vendor))}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: "9px 16px",
                    borderRadius: 12,
                    border: isInCompare ? "2px solid #C47A2E" : "2px solid rgba(139,69,19,0.22)",
                    background: isInCompare ? "rgba(196,122,46,0.08)" : "transparent",
                    color: isInCompare ? "#C47A2E" : "#7A5535",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                >
                  {isInCompare ? "Added to Compare ✓" : "Add to Compare"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Selected Vendors Modal (same as VendorList) */}
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
                No vendors selected yet. Use the Add to Compare button on vendor cards.
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
                              onClick={() => dispatch(removeVendorFromCompare(v._id))}
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
                    onClick={() => dispatch(clearVendorCompare())}
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

      <Footer />
    </div>
  );
};

export default VendorDetailsPage;
