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

  const shimmerStyle = { background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: "'Outfit', sans-serif" }}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 32 }}>
            <div style={{ height: 360, borderRadius: 20, ...shimmerStyle }} />
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
              {[220, 130, 90, 300, 260].map((w, i) => (
                <div key={i} style={{ height: i === 0 ? 36 : 18, width: w, borderRadius: 10, ...shimmerStyle }} />
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 240, height: 280, borderRadius: 20, ...shimmerStyle }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Couldn't load vendor</h2>
          <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px", lineHeight: 1.6 }}>{error}</p>
          <button onClick={() => navigate("/listings")}
            style={{ padding: "11px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Vendor not found</h2>
          <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px", lineHeight: 1.6 }}>This vendor may have been removed or the link is incorrect.</p>
          <button onClick={() => navigate("/listings")}
            style={{ padding: "11px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
            Browse Vendors
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

  // Category field icons — inline SVG helpers, stroke="currentColor" → coloured by parent
  const fic = (children) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A5535" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
  const FIELD_ICONS = {
    cuisine:              fic(<><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></>),
    serviceStyle:         fic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
    menuType:             fic(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>),
    beveragesIncluded:    fic(<><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></>),
    typesOfDecoration:    fic(<><circle cx="13.5" cy="6.5" r=".5" fill="#7A5535"/><circle cx="17.5" cy="10.5" r=".5" fill="#7A5535"/><circle cx="8.5" cy="7.5" r=".5" fill="#7A5535"/><circle cx="6.5" cy="12.5" r=".5" fill="#7A5535"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.47-.688-.47-1.125A1.64 1.64 0 0 1 14.828 17h1.93C19.858 17 22 14.858 22 12 22 6.477 17.523 2 12 2z"/></>),
    venueCoverage:        fic(<><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 3l8 6H4l8-6z"/></>),
    themes:               fic(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
    setup:                fic(<><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>),
    lightsIncluded:       fic(<><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6 4.65 4.65 0 0 0 1.5 3.5c.75.76 1.23 1.52 1.41 2.5"/></>),
    eventTypes:           fic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
    services:             fic(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>),
    photographyType:      fic(<><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></>),
    hoursIncluded:        fic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),
    editingTimeDays:      fic(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>),
    photographersCount:   fic(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>),
    videographersCount:   fic(<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>),
    socialMedia:          fic(<><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>),
    album:                fic(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>),
    deliveryOptions:      fic(<><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>),
    panIndiaDelivery:     fic(<><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z"/></>),
    deliveryAreas:        fic(<><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z"/></>),
    maxDeliveryCapacity:  fic(<><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>),
    availableSizes:       fic(<><path d="M21 3H3v7h18V3z"/><path d="M21 14H3v7h18v-7z"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="16" y1="10" x2="16" y2="14"/></>),
    customFlavors:        fic(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
    pricesNegotiable:     fic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>),
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

      <div className="page-container vendor-profile-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>

        {/* ── Hero Header ── */}
        <div style={{ padding: "28px 0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 100, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>{serviceType}</span>
            {isPhoneVerified && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 100, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={11} /> Phone Verified</span>}
            {vendor?.isTopRated && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 100, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", display: "inline-flex", alignItems: "center", gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="#c2410c" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Top Rated</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            <h1 className="vendor-detail-h1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 300, color: "#1C0A04", margin: 0, lineHeight: 1.1, letterSpacing: "0.01em", flex: 1 }}>{vendor.name || "Vendor"}</h1>
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
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'Outfit',sans-serif", cursor: "pointer", boxShadow: "0 3px 12px rgba(196,122,46,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {!token ? "Sign In to Chat" : hasActiveChatSave ? "View Active Chat" : "Chat & Finalise"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "0 0 10px", lineHeight: 1.5 }}>Our team reviews and connects you within a few hours</p>
              {/* Contact directly (mobile) */}
              {vendor?.phoneNumber && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(196,122,46,0.12)" }} />
                    <span style={{ fontSize: 10, color: "#9B7450", fontWeight: 500, whiteSpace: "nowrap" }}>or contact directly</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(196,122,46,0.12)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={`https://wa.me/91${vendor.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${vendor.name}, I found your profile on Tendr and wanted to connect directly about your services.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: "9px", borderRadius: 9, background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Outfit',sans-serif" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      WhatsApp
                    </a>
                    <a href={`tel:${vendor.phoneNumber}`}
                      style={{ flex: 1, padding: "9px", borderRadius: 9, background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.2)", color: "#C47A2E", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Outfit',sans-serif" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Call
                    </a>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                {totalEventsCompleted > 0 && <span style={{ fontSize: 11, color: "#7A5535", display: "flex", alignItems: "center", gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>{totalEventsCompleted} events done</span>}
                {maxConcurrentEvents && <span style={{ fontSize: 11, color: "#7A5535", display: "flex", alignItems: "center", gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Up to {maxConcurrentEvents} events/month</span>}
                {vendor?.createdAt && <span style={{ fontSize: 11, color: "#7A5535", display: "flex", alignItems: "center", gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>On Tendr since {new Date(vendor.createdAt).getFullYear()}</span>}
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
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(196,122,46,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{icon}</div>
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
                    style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'Outfit',sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.4)", letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {!token ? "Sign In to Chat" : hasActiveChatSave ? "View Active Chat" : "Chat & Finalise"}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "0 0 10px", lineHeight: 1.5 }}>
                  Our team reviews and connects you within a few hours
                </p>

                {/* Contact directly */}
                {vendor?.phoneNumber && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1, height: 1, background: "rgba(196,122,46,0.12)" }} />
                      <span style={{ fontSize: 10.5, color: "#9B7450", fontWeight: 500, whiteSpace: "nowrap" }}>or contact directly</span>
                      <div style={{ flex: 1, height: 1, background: "rgba(196,122,46,0.12)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={`https://wa.me/91${vendor.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${vendor.name}, I found your profile on Tendr and wanted to connect directly about your services.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#25D366", color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Outfit',sans-serif" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${vendor.phoneNumber}`}
                        style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.2)", color: "#C47A2E", fontSize: 12.5, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Outfit',sans-serif" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Call
                      </a>
                    </div>
                  </div>
                )}

                {/* Quick facts */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
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
