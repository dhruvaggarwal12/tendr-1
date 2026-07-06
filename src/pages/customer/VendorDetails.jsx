import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import SEO, { vendorPageTitle, vendorPageDescription } from "../../components/SEO";

import ListingsNav from "../../components/ListingsNav";
import CompareModal from "../../components/CompareModal";
import HamburgerNav from "../../components/HamburgerNav";

import { Star, CheckCircle2, MapPin, Users } from "lucide-react";

import main1 from "../../assets/vendor-details/main-1.avif";
import main2 from "../../assets/vendor-details/main-2.avif";
import main3 from "../../assets/vendor-details/main-3.avif";
import main4 from "../../assets/vendor-details/main-4.avif";
import main5 from "../../assets/vendor-details/main-5.avif";

import { getVendorById, getVendors } from "../../apis/vendorApi";
import VendorAvailabilityCalendar from "../../components/VendorAvailabilityCalendar";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import VendorPhotoPlaceholder from "../../components/VendorPhotoPlaceholder";
import { useSelector, useDispatch } from "react-redux";
import { addVendorToCompare, removeVendorFromCompare, clearVendorCompare } from "../../redux/listingFiltersSlice";
import { setMultipleFormData, setBookingType } from "../../redux/eventPlanningSlice";
import { useChatOverlay } from "../../context/ChatContext";
const openExistingChatForVendor = async (vendorId, vendorData, token, openExistingChat, openVendorChat) => {
  const save = (() => { try { return JSON.parse(localStorage.getItem(`tendr:chat_req:${vendorId}`) || "null"); } catch { return null; } })();
  if (save?.conversationId) {
    openExistingChat(save.conversationId, { _id: vendorData._id, name: vendorData.name, serviceType: vendorData.serviceType });
    return;
  }
  // Fallback: fetch conversations to find the right one
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      const convo = (data.conversations || []).find(c => {
        const cvid = typeof c.vendorId === "object" ? c.vendorId?._id : c.vendorId;
        return String(cvid) === String(vendorId);
      });
      if (convo) { openExistingChat(convo._id, { _id: vendorData._id, name: vendorData.name, serviceType: vendorData.serviceType, approved: convo.chatApproved }); return; }
    }
  } catch {}
  openVendorChat({ _id: vendorData._id, name: vendorData.name, serviceType: vendorData.serviceType });
};
import ServiceAreaMap from "../../components/ServiceAreaMap";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const chatSaveKey = (id) => `tendr:chat_req:${id}`;
const getVendorChatSave = (id) => {
  try {
    const s = JSON.parse(localStorage.getItem(chatSaveKey(id)) || "null");
    if (!s) return null;
    if (s.date) {
      const exp = new Date(s.date + "T00:00:00"); exp.setDate(exp.getDate() + 1);
      if (Date.now() > exp.getTime()) { localStorage.removeItem(chatSaveKey(id)); return null; }
    } else if (Date.now() - (s.submittedAt || 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(chatSaveKey(id)); return null;
    }
    return s;
  } catch { return null; }
};

const VendorDetailsPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [brokenImgIdx, setBrokenImgIdx] = useState(new Set());
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatFormOpen, setChatFormOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [chatEventForm, setChatEventForm] = useState({ eventType: "", guests: "", date: "", location: "", eventTime: "" });
  const [invitePersonName, setInvitePersonName] = useState(() => { try { return localStorage.getItem('tendr_person_name') || ''; } catch { return ''; } });
  const [hasActiveChatSave, setHasActiveChatSave] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [similarVendors, setSimilarVendors] = useState([]);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [unavailModal, setUnavailModal] = useState(null); // { date, alternatives[] }

  const handleShare = async () => {
    const url = window.location.href;
    const title = vendor?.name ? `${vendor.name} on Tendr` : "Check out this vendor on Tendr";
    const text = vendor?.serviceType ? `Book ${vendor.serviceType.toLowerCase()} services from ${vendor.name}` : title;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openVendorChat, openExistingChat, chatState } = useChatOverlay();
  const { id } = useParams();
  const location = useLocation();

  // If navigated from listings
  const vendorFromState = location.state?.vendor;
  // Only show compare button when navigated from normal booking flow
  const showCompare = location.state?.compareInProfile === true;
  // Skip pre-chat form if event details already collected (normal booking flow)
  // Redux compare state
  const compareSelected = useSelector((state) => state.listingFilters.compareSelected);
  const { token } = useSelector((s) => s.auth);

  // Event form data from Redux
  const formEventName = useSelector((state) => state.eventPlanning.formData.eventName);
  const formEventType = useSelector((state) => state.eventPlanning.formData.eventType);
  const formGuests = useSelector((state) => state.eventPlanning.formData.guests);
  const formLocation = useSelector((state) => state.eventPlanning.formData.location);
  const formDate = useSelector((state) => state.eventPlanning.formData.date);
  const formBudget = useSelector((state) => state.eventPlanning.formData.budget);
  const formAdditionalInfo = useSelector((state) => state.eventPlanning.formData.additionalInfo);

  // Must come after formEventType declaration to avoid TDZ ReferenceError
  const hasEventContext = !!(location.state?.compareInProfile && formEventType);
  // Browse/search/top-rated flow — do NOT carry planning form data here
  const isFromListingFlow = location.state?.from === "listing";

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
        setHasActiveChatSave(!!getVendorChatSave(vendorData._id));
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError(err.message || "Failed to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id, vendorFromState]);

  useEffect(() => {
    if (!vendor?.serviceType || !vendor?._id) return;
    getVendors({ serviceTypes: [vendor.serviceType], limit: 5 })
      .then(data => {
        const others = (data?.vendors || []).filter(v => v._id !== vendor._id).slice(0, 4);
        setSimilarVendors(others);
      })
      .catch(() => {});
  }, [vendor?.serviceType, vendor?._id]);


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

  const galleryItems = useMemo(() => {
    const photos = (vendor?.portfolioPhotos || []).filter(u => u && typeof u === "string" && u.startsWith("http"));
    const videos = (vendor?.portfolioVideos || []).filter(Boolean);
    const photoItems = photos.length
      ? photos.map(url => ({ type: 'image', url }))
      : [{ type: 'placeholder', serviceType: vendor?.serviceType }];
    const videoItems = videos.map(url => ({ type: 'video', url }));
    return [...photoItems, ...videoItems];
  }, [vendor]);

  const galleryRef = useRef(null);
  const touchStartX = useRef(0);
  const scrollGallery = (dir) => {
    if (galleryRef.current) {
      const w = galleryRef.current.offsetWidth * 0.55;
      galleryRef.current.scrollBy({ left: dir * w, behavior: "smooth" });
    }
  };
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) scrollGallery(delta > 0 ? 1 : -1);
  };

  // Keyboard: arrows scroll photo gallery, Esc closes chat form
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && chatFormOpen) { setChatFormOpen(false); return; }
      if (e.key === "ArrowRight") scrollGallery(1);
      if (e.key === "ArrowLeft")  scrollGallery(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatFormOpen]);

  const primaryCity = vendor?.address?.city || vendor?.location || vendor?.locations?.[0] || "Location";
  const stateName = vendor?.address?.state || "";
  const serviceType = vendor?.serviceType || "Service";
  const yearsOfExperience = vendor?.yearsOfExperience ?? null;
  const teamSize = vendor?.teamSize ?? null;
  const totalEventsCompleted = vendor?.totalEventsCompleted ?? vendor?.eventsCompleted ?? null;
  const maxConcurrentEvents = vendor?.maxConcurrentEvents ?? vendor?.concurrentEvents ?? null;
  const isPhoneVerified = !!vendor?.phoneVerified;

  // Build info box lines — only from planning flow, never from browse/search/top-rated
  const infoLines = isFromListingFlow ? [] : [
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
      <div className="min-h-screen bg-[#FFFCF5]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Gallery skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
            <div style={{ height: 400, borderRadius: 12, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            <div className="grid grid-cols-2 gap-3">
              {[0,1,2,3].map(i => (
                <div key={i} style={{ height: 195, borderRadius: i === 1 ? "0 12px 0 0" : i === 3 ? "0 0 12px 0" : 0, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
              ))}
            </div>
          </div>
          {/* Info skeleton */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
              {[200, 120, 80, 300, 300].map((w, i) => (
                <div key={i} style={{ height: i === 0 ? 32 : i === 3 || i === 4 ? 18 : 20, width: w, borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 240, height: 280, borderRadius: 16, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
          </div>
        </div>
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

  const vendorCity = vendor?.city || vendor?.address?.city || vendor?.locations?.[0] || "";
  const vendorSchema = vendor ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": vendor.name,
    "description": vendorPageDescription(vendor),
    "image": vendor.portfolioPhotos?.[0] || vendor.image || "",
    "url": `https://tendr.co.in/vendor/${vendor._id}`,
    "address": { "@type": "PostalAddress", "addressLocality": vendorCity, "addressCountry": "IN" },
    "areaServed": vendor.locations?.map(l => ({ "@type": "City", "name": l })) || [],
    ...(vendor.avgReviewScore > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": vendor.avgReviewScore.toFixed(1),
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": vendor.totalReviews || 1,
      }
    } : {}),
    "knowsAbout": [vendor.serviceType, "Event Planning", "Celebrations", "Delhi NCR Events"],
  } : null;

  const font = "'Outfit', sans-serif";

  const CATEGORY_SECTIONS = {
    Caterer: [
      { key: "cuisine",           title: "Cuisine Types" },
      { key: "serviceStyle",      title: "Service Style" },
      { key: "menuType",          title: "Menu Type" },
      { key: "beveragesIncluded", title: "Beverages Included", bool: true },
    ],
    Decorator: [
      { key: "typesOfDecoration", title: "Types of Decoration" },
      { key: "venueCoverage",     title: "Venue Coverage" },
    ],
    Photographer: [
      { key: "services",          title: "Services Offered" },
      { key: "photographyType",   title: "Photography Style" },
      { key: "hoursIncluded",     title: "Hours Included", single: true },
      { key: "editingTimeDays",   title: "Editing Time (days)", single: true },
    ],
    DJ: [
      { key: "setup",             title: "Setup Type" },
      { key: "lightsIncluded",    title: "Lights Included", bool: true },
      { key: "eventTypes",        title: "Event Types" },
    ],
    GiftHamper: [
      { key: "deliveryOptions",       title: "Delivery Options" },
      { key: "panIndiaDelivery",      title: "Pan India Delivery", bool: true },
      { key: "deliveryAreas",         title: "Delivery Areas" },
      { key: "maxDeliveryCapacity",   title: "Max Delivery Capacity", single: true },
    ],
    Cake: [
      { key: "availableSizes",    title: "Available Sizes" },
      { key: "customFlavors",     title: "Custom Flavors" },
      { key: "pricesNegotiable",  title: "Prices Negotiable", bool: true },
      { key: "deliveryOptions",   title: "Delivery Options" },
    ],
  };

  const normalised = serviceType?.toLowerCase();
  const categoryKey = Object.keys(CATEGORY_SECTIONS).find(k => k.toLowerCase() === normalised);
  const categorySections = CATEGORY_SECTIONS[categoryKey] || [];

  // Category field icons
  const FIELD_ICONS = {
    cuisine: "🍽️", serviceStyle: "👨‍🍳", menuType: "📋", beveragesIncluded: "🥤",
    typesOfDecoration: "🎨", venueCoverage: "🏛️", themes: "✨",
    setup: "🎛️", lightsIncluded: "💡", eventTypes: "🎉",
    services: "📸", photographyType: "🎞️", hoursIncluded: "⏱️", editingTimeDays: "✏️",
    photographersCount: "👤", videographersCount: "🎥", socialMedia: "📱", album: "📔",
    deliveryOptions: "🚚", panIndiaDelivery: "🇮🇳", deliveryAreas: "📍", maxDeliveryCapacity: "📦",
    availableSizes: "📏", customFlavors: "🍰", pricesNegotiable: "💬",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <style>{`
        @media (max-width: 768px) {
          .vendor-mobile-booking-card { display: block !important; }
          .vendor-booking-card { display: none !important; }
        }
      `}</style>
      <SEO
        title={vendorPageTitle(vendor)}
        description={vendorPageDescription(vendor)}
        path={`/vendor/${vendor?._id || ""}`}
        image={vendor?.portfolioPhotos?.[0] || vendor?.image || undefined}
        schema={vendorSchema}
        city={vendor?.address?.city || vendor?.locations?.[0] || null}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Vendors", path: "/listings" },
          { name: vendor?.name || "Vendor", path: `/vendor/${vendor?._id || ""}` },
        ]}
      />
      <BasicSpeedDial />
      <HamburgerNav active="Browse" />

      <div className="page-container vendor-profile-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ── Hero Header ── */}
        <div style={{ padding: "28px 0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 100, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>{serviceType}</span>
            {isPhoneVerified && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 100, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={11} /> Phone Verified</span>}
            {vendor?.isTopRated && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 100, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>🏆 Top Rated</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            <h1 className="vendor-detail-h1" style={{ fontSize: 34, fontWeight: 900, color: "#2C1A0E", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", flex: 1 }}>{vendor.name || "Vendor"}</h1>
            <button onClick={handleShare}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: shareCopied ? "rgba(196,122,46,0.08)" : "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", flexShrink: 0, transition: "all 0.2s" }}
              title={shareCopied ? "Link copied!" : "Share vendor"}>
              {shareCopied ? "✓ Copied!" : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share</>
              )}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#7A5535" }}>
              <MapPin size={14} color="#C47A2E" /> {primaryCity}{stateName ? ", " + stateName : ""}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 100, padding: "3px 10px" }}>
              ✓ Verified
            </span>
            {yearsOfExperience != null && (
              <span style={{ fontSize: 14, color: "#7A5535" }}>🗓️ {yearsOfExperience} yrs in business</span>
            )}
          </div>
        </div>

        {/* ── Gallery — horizontal scroll with arrows ── */}
        <div style={{ position: "relative", marginBottom: 36 }}>
          {/* Left arrow — only when multiple items */}
          {galleryItems.length > 1 && (
            <button
              onClick={() => scrollGallery(-1)}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(196,122,46,0.2)", boxShadow: "0 2px 10px rgba(0,0,0,0.14)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", fontWeight: 700 }}
            >‹</button>
          )}

          {/* Gallery — show placeholder if no items or all images broken */}
          {(() => {
            const isPlaceholder = galleryItems.length === 1 && galleryItems[0].type === 'placeholder';
            const imageItems = galleryItems.filter(i => i.type === 'image');
            const allBroken = imageItems.length > 0 && imageItems.every((_, i) => brokenImgIdx.has(i));
            if (isPlaceholder || allBroken) {
              return (
                <div style={{ borderRadius: 20, overflow: "hidden", height: 300 }}>
                  <VendorPhotoPlaceholder serviceType={vendor?.serviceType} style={{ height: 300 }} />
                </div>
              );
            }
            const visibleItems = galleryItems.filter((item, idx) => item.type !== 'image' || !brokenImgIdx.has(idx));
            return (
            <div
              ref={galleryRef}
              className="vendor-gallery-scroll"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", borderRadius: 20, scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab" }}
            >
              <style>{`#vendor-gallery::-webkit-scrollbar { display: none; }`}</style>
              {visibleItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{ flex: "0 0 auto", width: visibleItems.length === 1 ? "100%" : "calc(55% - 4px)", minWidth: visibleItems.length === 1 ? "100%" : 260, height: 300, borderRadius: 16, overflow: "hidden", scrollSnapAlign: "start", position: "relative" }}
                >
                  {item.type === 'video' ? (
                    <>
                      <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} controls preload="metadata" playsInline />
                      <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>VIDEO</div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={`${vendor.name} photo ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onLoad={() => setIsLoaded(true)}
                      onError={() => setBrokenImgIdx(prev => new Set([...prev, idx]))}
                    />
                  )}
                </div>
              ))}
            </div>
            );
          })()}

          {/* Right arrow — only when multiple items */}
          {galleryItems.length > 1 && (
            <button
              onClick={() => scrollGallery(1)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(196,122,46,0.2)", boxShadow: "0 2px 10px rgba(0,0,0,0.14)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", fontWeight: 700 }}
            >›</button>
          )}

          {/* Dot indicators — only when multiple items */}
          {galleryItems.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width: i === 0 ? 18 : 6, height: 5, borderRadius: 100, background: i === 0 ? "#C47A2E" : "rgba(196,122,46,0.2)" }} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile-only compact booking card — appears right after gallery */}
        <div className="vendor-mobile-booking-card" style={{ display: "none", marginBottom: 24 }}>
          <div style={{ background: "#FFFCF5", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.22)", boxShadow: "0 4px 20px rgba(139,69,19,0.1)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Starting price</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                  {vendor.price ? `₹${Number(vendor.price).toLocaleString("en-IN")}` : "Price based on request"}
                </div>
              </div>
              {vendor?.totalEventsCompleted > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#CCAB4A" }}>{vendor.totalEventsCompleted}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>events done</div>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={handleShare} title={shareCopied ? "Copied!" : "Share"}
                  style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: shareCopied ? "rgba(196,122,46,0.08)" : "#fff", color: "#C47A2E", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {shareCopied ? "✓" : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
                </button>
                <button
                  onClick={() => {
                    if (!token) { setAuthModalOpen(true); return; }
                    if (hasActiveChatSave) { openExistingChatForVendor(vendor._id, vendor, token, openExistingChat, openVendorChat); return; }
                    if (isFromListingFlow) {
                      openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                    } else if (hasEventContext) {
                      dispatch(setBookingType("you-do-it"));
                      openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                    } else {
                      setChatEventForm({ eventType: formEventType || "", guests: formGuests ? String(formGuests) : "", date: formDate || "", location: formLocation || "" });
                      setChatFormOpen(true);
                    }
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'Outfit',sans-serif", cursor: "pointer", boxShadow: "0 3px 12px rgba(196,122,46,0.4)" }}
                >
                  💬 {!token ? "Sign In to Chat" : hasActiveChatSave ? "View Active Chat" : "Chat & Finalise"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "0 0 10px", lineHeight: 1.5 }}>Our team reviews and connects you within a few hours</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px" }}>
                {totalEventsCompleted > 0 && <span style={{ fontSize: 11, color: "#7A5535" }}>🎉 {totalEventsCompleted} events completed</span>}
                {maxConcurrentEvents && <span style={{ fontSize: 11, color: "#7A5535" }}>📅 Up to {maxConcurrentEvents} events at once</span>}
                {vendor?.createdAt && <span style={{ fontSize: 11, color: "#7A5535" }}>🗓️ On Tendr since {new Date(vendor.createdAt).getFullYear()}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="vendor-main-layout" style={{ display: "flex", gap: 36, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ════ LEFT: Full info ════ */}
          <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ── Stats Row ── */}
            <div className="vendor-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 }}>
              {[
                { icon: "✓", value: "Verified", label: "Tendr", sub: "verified vendor", isVerified: true },
                { icon: "📅", value: yearsOfExperience ?? "—", label: "Years Active", sub: "experience" },
                { icon: "👥", value: teamSize ?? "—", label: "Team Size", sub: "professionals" },
                { icon: "🎉", value: totalEventsCompleted ?? "—", label: "Events Done", sub: "completed" },
              ].map(({ icon, value, label, sub, isVerified }) => (
                <div key={label} style={{ background: isVerified ? "#f0fdf4" : "#FFFCF5", borderRadius: 16, border: `1.5px solid ${isVerified ? "#bbf7d0" : "rgba(196,122,46,0.16)"}`, padding: "18px 10px", textAlign: "center", boxShadow: "0 2px 10px rgba(44,26,14,0.04)" }}>
                  <div style={{ fontSize: isVerified ? 22 : 22, marginBottom: 6, color: isVerified ? "#15803d" : undefined, fontWeight: isVerified ? 900 : undefined }}>{icon}</div>
                  <div style={{ fontSize: isVerified ? 16 : 24, fontWeight: 900, color: isVerified ? "#15803d" : "#2C1A0E", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isVerified ? "#16a34a" : "#7A5535", marginTop: 4 }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* ── Trust + Availability chips ── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {maxConcurrentEvents != null && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={12} /> Handles up to {maxConcurrentEvents} events at once
                </span>
              )}
              {vendor?.rankingScore > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100, background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", gap: 5 }}>
                  📊 Score: {vendor.rankingScore}/100
                </span>
              )}
            </div>

            {/* ── About ── */}
            {vendor?.bio ? (
              <>
                <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 12px" }}>About</h2>
                  <p style={{ fontSize: 14.5, color: "#5a3a1a", lineHeight: 1.75, margin: 0 }}>{vendor.bio}</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
                <div style={{ marginBottom: 28, background: "#FFFCF5", borderRadius: 14, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.14)" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px" }}>About {vendor.name}</h2>
                  <p style={{ fontSize: 14, color: "#9B7450", lineHeight: 1.7, margin: 0 }}>
                    {vendor.name} is a {serviceType.toLowerCase()} service provider based in {primaryCity}{stateName ? ", " + stateName : ""}.
                    With {yearsOfExperience ?? "several"} years of experience and {totalEventsCompleted ?? "many"} events completed,
                    they bring expertise and professionalism to every event.
                  </p>
                </div>
              </>
            )}

            {/* ── What We Offer ── */}
            {categorySections.length > 0 && (() => {
              const rendered = categorySections.map(({ key, title, bool, single }) => {
                const raw = vendor[key];
                if (raw === undefined || raw === null) return null;
                const icon = FIELD_ICONS[key] || "•";
                return (
                  <div key={key} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(196,122,46,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>{title}</div>
                      {bool ? (
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 100, borderColor: raw ? "#86efac" : "#e5e7eb", border: "1.5px solid", background: raw ? "#f0fdf4" : "#f9fafb", color: raw ? "#15803d" : "#6b7280" }}>
                          {raw ? "✓ Included" : "✗ Not included"}
                        </span>
                      ) : single ? (
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: "#fffbeb", border: "1.5px solid #fde68a", color: "#b45309" }}>{raw}</span>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {(Array.isArray(raw) ? raw : [raw]).map((item, idx) => (
                            <span key={idx} style={{ fontSize: 12, fontWeight: 500, padding: "3px 12px", borderRadius: 100, background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.22)", color: "#5a3a1a" }}>{item}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }).filter(Boolean);

              if (!rendered.length) return null;
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px" }}>What We Offer</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{rendered}</div>
                </div>
              );
            })()}

            {/* ── Business Details ── */}
            <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 16px" }}>Business Details</h2>

              {/* Verified document badges */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                  { label: "GST Verified",    icon: "✓", color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
                  { label: "PAN Verified",     icon: "✓", color: "#0369a1", bg: "#f0f9ff", border: "#7dd3fc" },
                  { label: "Aadhaar Verified", icon: "✓", color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd" },
                ].map(({ label, icon, color, bg, border }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: bg, border: `1.5px solid ${border}`, borderRadius: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color }}>{label}</div>
                      <div style={{ fontSize: 10, color: color, opacity: 0.7 }}>Verified by Tendr</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* ── Service Areas + Map ── */}
            {(vendor.locations || []).length > 0 && (
              <>
                <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Service Areas</h2>
                  <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 16px" }}>
                    {vendor.name} serves {vendor.locations.length} {vendor.locations.length === 1 ? "city" : "cities"} — all locations are pinned on the map below.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {(vendor.locations || []).map((loc, i) => (
                      <span key={i} style={{ fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 100, background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.28)", color: "#5a3a1a", display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={11} color="#C47A2E" /> {loc}
                      </span>
                    ))}
                  </div>
                  <ServiceAreaMap cities={vendor.locations || []} vendorName={vendor.name} />
                </div>
              </>
            )}
            {/* ── Availability Calendar ── */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px", fontFamily: font }}>📅 Availability</h2>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 16px" }}>
                2 slots per day — Morning (10AM–2PM) and Evening (4PM–9PM)
              </p>
              <VendorAvailabilityCalendar vendorId={vendor._id} isVendorView={false} token={token} />
            </div>

            {/* ── Questions to Ask This Vendor ── */}
            {(() => {
              const QA = {
                Photographer: ["What is your style — candid, traditional or both?", "How many hours of coverage does your package include?", "Do you have backup equipment on the day?", "How long after the event do we receive edited photos?", "Have you shot at our venue before?", "Will you personally be there, or send a second photographer?", "What happens if you fall sick on the day?", "Can we see a full wedding gallery, not just highlights?"],
                Decorator: ["Can you do a walkthrough of our venue before quoting?", "Do you handle setup, breakdown and cleanup?", "Can you accommodate our colour scheme or theme ideas?", "What is your cancellation policy if we need to make changes?", "Do you provide artificial flowers, fresh flowers or both?", "Have you done decor at this venue before?", "What is the latest time you can finish setup before guests arrive?", "Do you have photos of past events at a similar budget?"],
                Caterer: ["Is your quote per plate or a flat fee?", "Can we do a tasting before confirming?", "Do you handle service staff on the day?", "What is included — crockery, cutlery, chafing dishes?", "Are there vegetarian-only options available?", "How do you handle dietary restrictions or allergies?", "What is your minimum and maximum guest count?", "Is the kitchen set up on-site or is food brought pre-cooked?"],
                DJ: ["Do you have a playlist planning session before the event?", "Can you take specific song requests from guests?", "What happens if your equipment fails during the event?", "Do you provide your own sound and lighting, or just the DJ service?", "How early do you arrive to set up?", "Have you performed at our venue size before?", "Do you MC the event or just play music?", "What is your overtime rate if the event runs longer?"],
              };
              const questions = QA[serviceType];
              if (!questions) return null;
              return (
                <>
                  <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 24 }} />
                  <div style={{ marginBottom: 28 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px" }}>
                      Questions to Ask This {serviceType}
                    </h2>
                    <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 18px", lineHeight: 1.5 }}>
                      Copy these into your chat to get the information you need before committing.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {questions.map((q, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderRadius: 10, background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.12)", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 6, padding: "2px 7px", flexShrink: 0, marginTop: 1, letterSpacing: "0.04em" }}>{String(i + 1).padStart(2, "0")}</span>
                          <span style={{ fontSize: 13.5, color: "#2C1A0E", lineHeight: 1.5 }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* ════ RIGHT: Sticky Booking Card ════ */}
          <div data-tour="vendor-booking-card" className="vendor-booking-card" style={{ flex: "0 0 340px", position: "sticky", top: 80 }}>
            <div style={{ background: "#FFFCF5", borderRadius: 24, border: "1.5px solid rgba(196,122,46,0.22)", boxShadow: "0 8px 40px rgba(139,69,19,0.1)", overflow: "hidden" }}>

              {/* Card header */}
              <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Starting price</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
                  {vendor.price ? `₹${Number(vendor.price).toLocaleString("en-IN")}` : "Price based on request"}
                </div>
              </div>

              <div style={{ padding: "20px 22px" }}>

                {/* CTA */}
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <button onClick={handleShare} title={shareCopied ? "Copied!" : "Share"}
                    style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: shareCopied ? "rgba(196,122,46,0.08)" : "#fff", color: shareCopied ? "#15803d" : "#C47A2E", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {shareCopied ? "✓" : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
                  </button>
                  <button
                    onClick={() => {
                      if (!token) { setAuthModalOpen(true); return; }
                      if (hasActiveChatSave) { openExistingChatForVendor(vendor._id, vendor, token, openExistingChat, openVendorChat); return; }
                      if (isFromListingFlow) {
                        openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                      } else if (hasEventContext) {
                        dispatch(setBookingType("you-do-it"));
                        openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                      } else {
                        setChatEventForm({ eventType: formEventType || "", guests: formGuests ? String(formGuests) : "", date: formDate || "", location: formLocation || "" });
                        setChatFormOpen(true);
                      }
                    }}
                    style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'Outfit',sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.4)", letterSpacing: "0.01em" }}
                  >
                    💬 {!token ? "Sign In to Chat" : hasActiveChatSave ? "View Active Chat" : "Chat & Finalise"}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "0 0 14px", lineHeight: 1.5 }}>
                  Our team reviews and connects you within a few hours
                </p>


                {/* Quick facts */}
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                  {[
                    isPhoneVerified && { icon: "✅", text: "Phone number verified" },
                    totalEventsCompleted > 0 && { icon: "🎉", text: `${totalEventsCompleted} events completed` },
                    maxConcurrentEvents && { icon: "📅", text: `Takes up to ${maxConcurrentEvents} events at once` },
                    vendor?.createdAt && { icon: "🗓️", text: `On Tendr since ${new Date(vendor.createdAt).getFullYear()}` },
                  ].filter(Boolean).map((fact, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7A5535", padding: "4px 0" }}>
                      <span>{fact.icon}</span> {fact.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                          <div style={{ fontSize: 13, color: "#3B2F2F", marginTop: 2 }}>
                            {v.startingPrice ? `Starting from ₹${Number(v.startingPrice).toLocaleString("en-IN")}` : "Starting price : Price based on request"}
                          </div>
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

      {/* ── Similar Vendors ── */}
      {similarVendors.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px", fontFamily: font }}>
          <div style={{ height: 1, background: "rgba(196,122,46,0.1)", marginBottom: 28 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 18px" }}>
            Other {serviceType}s You Might Like
          </h2>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
            {similarVendors.map(sv => {
              const svRating = Number(sv.avgReviewScore);
              return (
                <a
                  key={sv._id}
                  href={`/vendor/${sv._id}`}
                  style={{ flex: "0 0 220px", textDecoration: "none", borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(196,122,46,0.14)", background: "#FFFCF5", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,69,19,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
                >
                  <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
                    <img
                      src={sv.portfolioPhotos?.[0] || sv.image || main1}
                      alt={sv.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {sv.isTopRated && (
                      <div style={{ position: "absolute", top: 8, left: 8, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", borderRadius: 100, padding: "2px 8px", fontSize: 9.5, fontWeight: 800 }}>⭐ Top Rated</div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#2C1A0E", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sv.name}</div>
                    <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 5 }}>
                      📍 {sv.address?.city || sv.locations?.[0] || ""}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {svRating > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E" }}>★ {svRating.toFixed(1)}</span>}
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{sv.price ? `Starting from ₹${Number(sv.price).toLocaleString("en-IN")}` : "Starting price : Price based on request"}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <Footer />

      {/* Pre-chat event form — same as QuickView flow */}
      {chatFormOpen && vendor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Outfit', sans-serif" }}
          onClick={() => setChatFormOpen(false)}>
          <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "24px", maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Your Event Details</h2>
                <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>This goes to {vendor.name} — wizard questions follow after</p>
              </div>
              <button onClick={() => setChatFormOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9B7450", padding: 0 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "What's the occasion?", field: "eventType", placeholder: "e.g. Birthday, Wedding, Anniversary..." },
                { label: "Guest count", field: "guests", placeholder: "Approx. number of guests" },
                { label: "Event date", field: "date", type: "date", placeholder: "" },
                { label: "Location", field: "location", placeholder: "City / area" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 4 }}>{label}</label>
                  <input type={type || "text"} placeholder={placeholder} value={chatEventForm[field]}
                    onChange={e => setChatEventForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              {["Birthday","1st Birthday","Anniversary","Baby Shower","Newborn Welcome","Graduation"].includes(chatEventForm.eventType) && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#C47A2E", marginBottom: 4 }}>
                    {{"Birthday":"Whose birthday is it?","1st Birthday":"Whose birthday is it?","Anniversary":"Whose anniversary?","Baby Shower":"Baby's name (if decided)","Newborn Welcome":"Baby's name","Graduation":"Who's graduating?"}[chatEventForm.eventType]}
                    <span style={{ fontWeight: 400, color: "#9B7450" }}> — for invitation flyer</span>
                  </label>
                  <input type="text" value={invitePersonName}
                    onChange={e => { setInvitePersonName(e.target.value); try { localStorage.setItem('tendr_person_name', e.target.value); } catch {} }}
                    placeholder={{"Birthday":"e.g., Aarav's","1st Birthday":"e.g., little Riya's","Anniversary":"e.g., Priya & Rahul","Baby Shower":"e.g., Arjun","Newborn Welcome":"e.g., Aanya","Graduation":"e.g., Ananya"}[chatEventForm.eventType] || "Optional"}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 4 }}>
                    Start time <span style={{ fontWeight: 400, color: "#9B7450" }}>(flyer)</span>
                  </label>
                  <input type="time" value={chatEventForm.eventTime}
                    onChange={e => { setChatEventForm(p => ({ ...p, eventTime: e.target.value })); try { localStorage.setItem('tendr_event_time', e.target.value); } catch {} }}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: "'Outfit', sans-serif", fontSize: 13, color: chatEventForm.eventTime ? "#2C1A0E" : "#9B7450", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
            <button
              disabled={checkingAvail}
              onClick={async () => {
                if (isFromListingFlow) {
                  if (!chatEventForm.date) {
                    setChatFormOpen(false);
                    openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                    return;
                  }
                  setCheckingAvail(true);
                  try {
                    const month = chatEventForm.date.substring(0, 7);
                    const res = await fetch(`${BASE_URL}/vendors/${vendor._id}/availability?month=${month}`, { credentials: "include" });
                    const data = res.ok ? await res.json() : {};
                    const day = (data?.availability || {})[chatEventForm.date];
                    const hasSlot = !day || day.slot1 === "available" || day.slot2 === "available";
                    if (hasSlot) {
                      setChatFormOpen(false);
                      openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                    } else {
                      const altRes = await fetch(`${BASE_URL}/vendors?serviceTypes=${vendor.serviceType}&location=${encodeURIComponent(chatEventForm.location || "")}&limit=6`, { credentials: "include" });
                      const altData = altRes.ok ? await altRes.json() : { vendors: [] };
                      const alternatives = (altData.vendors || []).filter(v => v._id !== vendor._id);
                      setChatFormOpen(false);
                      setUnavailModal({ date: chatEventForm.date, alternatives });
                    }
                  } catch {
                    setChatFormOpen(false);
                    openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                  } finally {
                    setCheckingAvail(false);
                  }
                } else {
                  dispatch(setMultipleFormData({
                    eventType: chatEventForm.eventType,
                    guests: chatEventForm.guests,
                    date: chatEventForm.date,
                    location: chatEventForm.location,
                    eventTime: chatEventForm.eventTime,
                    token,
                  }));
                  dispatch(setBookingType("you-do-it"));
                  setChatFormOpen(false);
                  openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType });
                }
              }}
              style={{ width: "100%", marginTop: 18, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: checkingAvail ? "wait" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.3)", opacity: checkingAvail ? 0.7 : 1 }}>
              {checkingAvail ? "Checking availability…" : `Request to Chat with ${vendor.name} →`}
            </button>
          </div>
        </div>
      )}

      {/* Unavailability modal — vendor not available on selected date */}
      {unavailModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Outfit', sans-serif" }}
          onClick={() => setUnavailModal(null)}>
          <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", maxWidth: 460, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 28, marginBottom: 10, textAlign: "center" }}>😔</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", textAlign: "center", margin: "0 0 8px" }}>
              {vendor?.name} is unavailable
            </h2>
            <p style={{ fontSize: 13, color: "#9B7450", textAlign: "center", margin: "0 0 20px", lineHeight: 1.6 }}>
              This vendor is booked on <strong>{unavailModal.date}</strong>. Here are vendors available on that date:
            </p>
            {unavailModal.alternatives.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {unavailModal.alternatives.slice(0, 5).map(alt => (
                  <div key={alt._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.18)", background: "#fff", cursor: "pointer" }}
                    onClick={() => { setUnavailModal(null); navigate(`/vendor/${alt._id}`, { state: { from: "listing" } }); }}>
                    {alt.photos?.[0] ? (
                      <img src={alt.photos[0]} alt={alt.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, flexShrink: 0 }}>
                        {(alt.name || "V")[0]}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{alt.name}</div>
                      <div style={{ fontSize: 12, color: "#9B7450" }}>{alt.location || alt.city || ""}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#C47A2E", fontWeight: 700, flexShrink: 0 }}>View →</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#9B7450", fontSize: 13 }}>No alternatives found for this date. Try a different date.</p>
            )}
            <button onClick={() => setUnavailModal(null)}
              style={{ width: "100%", marginTop: 18, padding: "11px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Close
            </button>
          </div>
        </div>
      )}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default VendorDetailsPage;
