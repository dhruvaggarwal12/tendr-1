// src/components/VendorList_ListingPage.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AuthModal from "./AuthModal";
import { useChatOverlay, useOpenBaatKaroChat } from "../context/ChatContext";
import TalkToTendrStrip from "./TalkToTendrStrip";
import { setMultipleFormData, setBookingType } from "../redux/eventPlanningSlice";
import { EventIdeasPanel } from "../utils/eventIdeas";
import VendorPhotoPlaceholder from "./VendorPhotoPlaceholder";
import { getRecommendations } from "../utils/recommendationEngine";
import { addToShortlist, isInShortlist } from "./ShortlistFloat";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Discovery listing session — isolated from planning-flow Redux data, 7-day TTL
const DISCOVERY_KEY = 'tendr:session:discovery';
const DISCOVERY_TTL = 7 * 24 * 60 * 60 * 1000;
const getDiscoverySession = () => {
  try {
    const s = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || 'null');
    if (!s) return null;
    const expiresAt = s.__expiresAt || (s.__savedAt ? s.__savedAt + DISCOVERY_TTL : 0);
    if (Date.now() > expiresAt) { localStorage.removeItem(DISCOVERY_KEY); return null; }
    const { __expiresAt, __savedAt, ...data } = s;
    return data;
  } catch { return null; }
};
const saveDiscoverySession = (data) => {
  let expiresAt;
  if (data.date) {
    const d = new Date(data.date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    expiresAt = d.getTime();
  } else {
    expiresAt = Date.now() + DISCOVERY_TTL;
  }
  try { localStorage.setItem(DISCOVERY_KEY, JSON.stringify({ ...data, __expiresAt: expiresAt })); } catch {}
};
export const extendDiscoverySessionTTL = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || 'null');
    if (!raw?.date) return;
    const d = new Date(raw.date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    localStorage.setItem(DISCOVERY_KEY, JSON.stringify({ ...raw, __expiresAt: d.getTime() }));
  } catch {}
};

const chatSaveKey = (id) => `tendr:chat_req:${id}`;
const getChatSave = (id) => {
  if (!id) return null;
  try {
    const s = JSON.parse(localStorage.getItem(chatSaveKey(id)) || "null");
    if (!s) return null;
    if (s.date) {
      // Keep until the day after the event date (gives the user the full event day)
      const expiry = new Date(s.date);
      expiry.setDate(expiry.getDate() + 1);
      if (Date.now() > expiry.getTime()) {
        localStorage.removeItem(chatSaveKey(id));
        return null;
      }
    } else {
      // No event date set — fallback: keep for 7 days
      if (Date.now() - (s.submittedAt || 0) > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(chatSaveKey(id));
        return null;
      }
    }
    return s;
  } catch { return null; }
};
const setChatSave = (id, data) => {
  if (!id) return;
  try { localStorage.setItem(chatSaveKey(id), JSON.stringify({ ...data, submittedAt: Date.now() })); } catch {}
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
  compareInProfile = false,
  isLoggedIn = false,
  requireFormBeforeChat = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { openVendorChat, openExistingChat } = useChatOverlay();
  const openBaatKaroChat = useOpenBaatKaroChat();
  const { token } = useSelector(s => s.auth);
  const formData = useSelector(s => s.eventPlanning?.formData || {});
  // Show shortlist UI only when explicitly arriving via fromPlan=1 (DIY Browse links)
  const isFromPlanFlow = location.pathname === "/listings" && new URLSearchParams(location.search).get("fromPlan") === "1";
  const recommendedServices = eventType ? getRecommendations({ eventType }).services : [];
  const [quickViewVendor, setQuickViewVendor] = useState(null);
  const [chatFormVendor, setChatFormVendor] = useState(null);
  const [authModalOpen, setAuthModalOpen]   = useState(false);
  const [pendingChatVendor, setPendingChatVendor] = useState(null);
  const [pendingTendrChat, setPendingTendrChat] = useState(false);
  const [chatEventForm, setChatEventForm] = useState({ eventType: "", guests: "", date: "", budget: "", location: "", eventTime: "" });
  const [invitePersonName, setInvitePersonName] = useState(() => { try { return localStorage.getItem('tendr_person_name') || ''; } catch { return ''; } });
  const [inviteVenueAddress, setInviteVenueAddress] = useState(() => { try { return localStorage.getItem('tendr_venue_address') || ''; } catch { return ''; } });
  // Page-session pre-fill for search/top-rated — isolated from Redux planning data
  const [localFormData, setLocalFormData] = useState(() => getDiscoverySession() || { eventType: "", guests: "", date: "", budget: "", location: "", eventTime: "" });
  const [unavailModal, setUnavailModal] = useState(null); // null or { vendor, date, alternatives[] }
  const [checkingAvail, setCheckingAvail] = useState(false);
  // Shortlist re-render tick (DIY flow)
  const [shortlistTick, setShortlistTick] = useState(0);

  // Re-render shortlist state when vendors are shortlisted/removed
  useEffect(() => {
    const handler = () => setShortlistTick(t => t + 1);
    window.addEventListener("tendr:shortlist-update", handler);
    return () => window.removeEventListener("tendr:shortlist-update", handler);
  }, []);

  // Restore quick view after login redirect
  useEffect(() => {
    const pendingId = sessionStorage.getItem("tendr_pending_quickview");
    if (!pendingId || !vendors?.length) return;
    const vendor = vendors.find(v => v._id === pendingId);
    if (vendor) {
      sessionStorage.removeItem("tendr_pending_quickview");
      setQuickViewVendor(vendor);
    }
  }, [vendors]);

  // Keyboard: Esc un-flips the quick view / closes the pre-chat form
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (chatFormVendor) { setChatFormVendor(null); return; }
      if (quickViewVendor) { setQuickViewVendor(null); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickViewVendor, chatFormVendor]);

  const handleViewProfile = (e, vendorId) => {
    e.stopPropagation();
    if (!vendorId) return;
    const url = `/vendor/${vendorId}${isFromPlanFlow ? "?fromPlan=1" : ""}`;
    const state = { from: "listing", compareInProfile, filters: { eventType, serviceType, locationType, date, guestCount, sortBy, sortOrder } };
    if (window.innerWidth >= 768) {
      // Desktop — open in new tab so user keeps their listings context
      window.open(url, "_blank");
    } else {
      // Mobile — same tab, scroll position restored via sessionStorage
      sessionStorage.setItem("listings_scroll_y", String(window.scrollY));
      navigate(url, { state });
    }
  };

  const handleTalkToTendr = () => {
    if (!token) {
      setPendingTendrChat(true);
      setAuthModalOpen(true);
      return;
    }
    openBaatKaroChat();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <style>{`
        .vl-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 8px 0 16px; }
        @media (min-width: 540px) { .vl-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1024px) { .vl-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1280px) { .vl-grid { grid-template-columns: repeat(4,1fr); } }
        .vendor-card { animation: vl-card-in 0.4s both; }
        @keyframes vl-card-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .vendor-card-flip-wrap { display: block; }
        @media (max-width: 540px) {
          .vendor-card-mobile-overlay { display: block !important; }
          .vendor-card-info-text { display: none !important; }
          .vendor-card-img { height: 200px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vendor-card-flip-inner { transition: none !important; }
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 12px" }}>

        <div>
          {isLoading ? (
            <div className="vl-grid" style={{ padding: "4px 0" }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.1)" }}>
                  <div className="ske" style={{ height: 220, borderRadius: 0 }} />
                  <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="ske" style={{ height: 14, width: "70%" }} />
                    <div className="ske" style={{ height: 12, width: "45%" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <div className="ske" style={{ height: 10, width: "30%" }} />
                      <div className="ske" style={{ height: 10, width: "25%" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                      <div className="ske" style={{ height: 13, width: "38%" }} />
                      <div className="ske" style={{ height: 28, width: 80, borderRadius: 100 }} />
                    </div>
                  </div>
                </div>
              ))}
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
              <TalkToTendrStrip onTalk={handleTalkToTendr} serviceType={serviceType} />
            </div>
          ) : (
            <>
            <div className="vl-grid">
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
              {[...vendors].sort((a, b) => {
                const hasPhoto = (v) => !![v.image, ...(v.portfolioPhotos || [])].find(u => u && typeof u === "string" && u.startsWith("http"));
                return hasPhoto(b) - hasPhoto(a);
              }).map((vendor, index) => {
                const isSelected = compareSelected.some((v) => v._id === vendor._id);
                const rating = vendor.avgReviewScore ?? vendor.rating;
                const isFlipped = quickViewVendor?._id === vendor._id;
                const cardPhotoUrl = [vendor.image, ...(vendor.portfolioPhotos || [])].find(u => u && typeof u === "string" && u.startsWith("http"));

                const openFullProfile = (e) => {
                  e.stopPropagation();
                  setQuickViewVendor(null);
                  const url = `/vendor/${vendor._id}${isFromPlanFlow ? "?fromPlan=1" : ""}`;
                  const state = { from: "listing", compareInProfile, filters: { eventType, serviceType, locationType, date, guestCount, sortBy, sortOrder } };
                  if (window.innerWidth >= 768) {
                    window.open(url, "_blank");
                  } else {
                    sessionStorage.setItem("listings_scroll_y", String(window.scrollY));
                    navigate(url, { state });
                  }
                };

                const bookNow = async (e) => {
                  e.stopPropagation();
                  if (!token) {
                    setPendingChatVendor(vendor);
                    setAuthModalOpen(true);
                    return;
                  }
                  if (getChatSave(vendor._id)) {
                    document.dispatchEvent(new CustomEvent("tendr:open-active-chats"));
                    setQuickViewVendor(null);
                    return;
                  }
                  setQuickViewVendor(null);
                  if (requireFormBeforeChat) {
                    const discoveryData = getDiscoverySession();
                    setChatFormVendor(vendor);
                    setChatEventForm({ eventType: "", guests: "", date: "", location: "", eventTime: "", ...(discoveryData || {}), budget: "" });
                    return;
                  }
                  const saved = getChatSave(vendor._id);
                  if (saved) {
                    try {
                      const res = await fetch(`${BASE_URL}/conversations`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
                      if (res.ok) {
                        const data = await res.json();
                        const convo = (data.conversations || []).find(c => {
                          const cvid = typeof c.vendorId === "object" ? c.vendorId?._id : c.vendorId;
                          return String(cvid) === String(vendor._id);
                        });
                        if (convo) {
                          openExistingChat(convo._id, { _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, approved: convo.chatApproved, addToCompare: true });
                          return;
                        }
                      }
                    } catch {}
                    openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, addToCompare: true });
                    return;
                  }
                  openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, addToCompare: true });
                };

                return (
                  <div key={vendor._id || index} style={{ perspective: 1400 }} className="vendor-card-flip-wrap">
                    <div
                      className="vendor-card-flip-inner"
                      style={{
                        position: "relative", width: "100%",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.55s cubic-bezier(0.4,0.15,0.2,1)",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                    {/* ═══ FRONT ═══ */}
                    <div
                      className="vendor-card tap-scale"
                      onClick={() => {
                        if (window.innerWidth >= 1024) {
                          window.open(`/vendor/${vendor._id}${isFromPlanFlow ? "?fromPlan=1" : ""}`, "_blank");
                        } else {
                          setQuickViewVendor(vendor);
                        }
                      }}
                      style={{
                        animationDelay: `${Math.min(index, 8) * 55}ms`,
                        background: "#FFFCF5", borderRadius: 16,
                        border: "1.5px solid rgba(196,122,46,0.13)",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                        overflow: "hidden", transition: "transform 0.22s, box-shadow 0.22s, border-color 0.22s",
                        fontFamily: font, cursor: "pointer",
                        backfaceVisibility: "hidden",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(139,69,19,0.1)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.28)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.13)"; }}
                    >
                    {/* Image — full bleed */}
                    <div className="vendor-card-img" style={{ height: 260, overflow: "hidden", position: "relative" }}>
                      {(() => {
                        const cardPhoto = [vendor.image, ...(vendor.portfolioPhotos || [])].find(u => u && typeof u === "string" && u.startsWith("http"));
                        if (cardPhoto) {
                          return (
                            <>
                              <img
                                src={cardPhoto}
                                alt={vendor.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                loading="lazy"
                              />
                              {/* Gradient overlay — only over real photos */}
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,4,0,0.88) 0%, rgba(12,4,0,0.3) 45%, transparent 100%)", pointerEvents: "none" }} />
                              {/* Service type badge — desktop only, only over real photos */}
                              <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.9)", color: "#fff", padding: "3px 9px", borderRadius: 20 }}>
                                {vendor.serviceType}
                              </span>
                            </>
                          );
                        }
                        return <VendorPhotoPlaceholder serviceType={vendor.serviceType} style={{ height: 260 }} />;
                      })()}
                      {/* Top Rated star badge */}
                      {vendor.isTopRated && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(196,122,46,0.5)" }}>
                          ⭐ Top Rated
                        </div>
                      )}
                      {/* Location badge */}
                      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(20,10,4,0.58)", backdropFilter: "blur(8px)", color: "rgba(255,248,236,0.9)", borderRadius: 100, padding: "4px 10px", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, border: "1px solid rgba(255,255,255,0.1)" }}>
                        📍 {vendor.locations?.[0] || vendor.city || "Delhi NCR"}
                      </div>
                      {/* Mobile-only full-bleed text overlay */}
                      <div className="vendor-card-mobile-overlay" style={{
                        display: "none",
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "52px 12px 12px",
                        background: "linear-gradient(to top, rgba(12,4,0,0.92) 0%, transparent 100%)",
                        pointerEvents: "none",
                      }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: "0 0 4px", lineHeight: 1.2, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                          {vendor.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{vendor.serviceType}</span>
                          {(vendor.city || vendor.locations?.[0]) && (
                            <>
                              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>·</span>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>📍 {vendor.city || vendor.locations?.[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="vendor-card-info" style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}>

                      {/* Desktop text block — hidden on mobile (info shown as image overlay instead) */}
                      <div className="vendor-card-info-text" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {/* Name — first */}
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", margin: 0, lineHeight: 1.25 }}>{vendor.name}</h3>
                        {/* Category + top rated + event intelligence tag */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9B7450", padding: "2px 0" }}>
                            {vendor.serviceType}
                          </span>
                          {vendor.isTopRated && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.08)", padding: "2px 8px", borderRadius: 20 }}>⭐ Top Rated</span>
                          )}
                          {recommendedServices.includes(vendor.serviceType) && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#6B3FA0", background: "rgba(107,63,160,0.08)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(107,63,160,0.15)" }}>
                              ✦ Best for {eventType}s
                            </span>
                          )}
                        </div>
                        {/* Location */}
                        {(vendor.locations?.length > 0 || vendor.city) && (
                          <div style={{ fontSize: 11, color: "#9B7450", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {vendor.locations?.length > 0 ? vendor.locations.slice(0,3).join(" · ") : vendor.city}
                            {vendor.locations?.length > 3 && ` +${vendor.locations.length - 3} more`}
                          </div>
                        )}
                        {/* Rating + review count */}
                        {rating > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ color: "#C47A2E", fontSize: 11 }}>{"★".repeat(Math.min(5, Math.round(rating)))}{"☆".repeat(Math.max(0, 5 - Math.round(rating)))}</span>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>{Number(rating).toFixed(1)}</span>
                            {(vendor.reviewCount > 0 || vendor.totalReviews > 0) && (
                              <span style={{ fontSize: 11, color: "#9B7450" }}>({(vendor.reviewCount || vendor.totalReviews).toLocaleString("en-IN")} reviews)</span>
                            )}
                          </div>
                        )}
                        {/* Price */}
                        <div style={{ display: "flex", gap: 8, fontSize: 11.5, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ color: "#5a3a1a", fontWeight: 700 }}>
                            {(vendor.price > 0 || vendor.startingPrice > 0)
                              ? `Starting at ₹${Number(vendor.price || vendor.startingPrice).toLocaleString("en-IN")} / event`
                              : "Price on request"}
                          </span>
                          {vendor.isTopRated && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#15803d", background: "rgba(21,128,61,0.09)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(21,128,61,0.16)", flexShrink: 0 }}>Available</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons — always visible on both mobile and desktop */}
                      <div style={{ display: "flex", gap: 7, marginTop: 2 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setQuickViewVendor(vendor); }}
                          style={{ flex: 1, padding: "9px 6px", borderRadius: 9, border: "1.5px solid #C47A2E", background: "transparent", color: "#C47A2E", fontSize: 12, fontWeight: 700, fontFamily: font, cursor: "pointer", transition: "all 0.18s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#C47A2E"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C47A2E"; }}
                        >
                          Quick View
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleCompare?.(vendor); }}
                          title={isSelected ? "In compare list" : "Add to compare"}
                          style={{ padding: "9px 13px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(0,0,0,0.12)"}`, background: isSelected ? "rgba(196,122,46,0.08)" : "transparent", color: isSelected ? "#C47A2E" : "#9B7450", fontSize: 16, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
                        >
                          {isSelected ? "♥" : "♡"}
                        </button>
                      </div>
                    </div>
                    </div>

                    {/* ═══ BACK — quick view ═══ */}
                    <div
                      style={{
                        position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                        background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.3)",
                        boxShadow: "0 8px 28px rgba(139,69,19,0.16)",
                        padding: "16px 14px", display: "flex", flexDirection: "column",
                        fontFamily: font, overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setQuickViewVendor(null); }}
                        aria-label="Close quick view"
                        style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
                      >✕</button>

                      {/* Scrollable info — everything that doesn't fit shows via scroll instead of being cut off */}
                      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingRight: 26 }}>
                          {cardPhotoUrl ? (
                            <img src={cardPhotoUrl} alt={vendor.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid rgba(196,122,46,0.2)" }} />
                          ) : (
                            <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: "rgba(196,122,46,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏷️</div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <div style={{ fontSize: 14.5, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.name}</div>
                              {vendor.isVerified && (
                                <span title="Verified" style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", background: "#C47A2E", borderRadius: 100, padding: "1.5px 6px", flexShrink: 0 }}>✓</span>
                              )}
                              {vendor.isTopRated && (
                                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#b45309", background: "rgba(245,158,11,0.12)", borderRadius: 100, padding: "1.5px 7px", flexShrink: 0 }}>⭐ Top Rated</span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.05em" }}>{vendor.serviceType}</div>
                          </div>
                        </div>

                        {rating > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                            <span style={{ color: "#C47A2E", fontSize: 12 }}>{"★".repeat(Math.min(5, Math.round(rating)))}{"☆".repeat(Math.max(0, 5 - Math.round(rating)))}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{Number(rating).toFixed(1)}</span>
                            {(vendor.reviewCount > 0 || vendor.totalReviews > 0) && (
                              <span style={{ fontSize: 11, color: "#9B7450" }}>({(vendor.reviewCount || vendor.totalReviews).toLocaleString("en-IN")})</span>
                            )}
                          </div>
                        )}

                        <div style={{ fontSize: 13, fontWeight: 700, color: "#5a3a1a", marginBottom: 8 }}>
                          {(vendor.price > 0 || vendor.startingPrice > 0)
                            ? `Starting at ₹${Number(vendor.price || vendor.startingPrice).toLocaleString("en-IN")} / event`
                            : "Price on request"}
                        </div>

                        {/* Stats — what used to live in the old side-panel quick view
                            (events done, experience, team size, cities served) */}
                        {(() => {
                          const eventsCompleted = vendor.totalEventsCompleted ?? vendor.eventsCompleted ?? null;
                          const stats = [
                            eventsCompleted > 0 && { label: "Events Done", value: `${eventsCompleted}+` },
                            vendor.yearsOfExperience > 0 && { label: "Experience", value: `${vendor.yearsOfExperience}y` },
                            vendor.teamSize > 0 && { label: "Team Size", value: `${vendor.teamSize}` },
                            (vendor.locations?.length > 0 || vendor.city) && { label: "Serves", value: vendor.locations?.length > 0 ? vendor.locations.slice(0, 2).join(", ") : vendor.city },
                          ].filter(Boolean);
                          if (!stats.length) return (vendor.locations?.[0] || vendor.city) ? (
                            <div style={{ fontSize: 11.5, color: "#9B7450", marginBottom: 8 }}>📍 {vendor.locations?.length > 1 ? vendor.locations.slice(0,3).join(" · ") : (vendor.locations?.[0] || vendor.city)}</div>
                          ) : null;
                          return (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                              {stats.map(({ label, value }) => (
                                <div key={label} style={{ background: "rgba(196,122,46,0.05)", borderRadius: 8, padding: "6px 9px", border: "1px solid rgba(196,122,46,0.1)" }}>
                                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
                                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {vendor.description && (
                          <p style={{ fontSize: 11.5, color: "#6b4a28", lineHeight: 1.55, margin: "4px 0 10px" }}>
                            {vendor.description.slice(0, 220)}{vendor.description.length > 220 ? "…" : ""}
                          </p>
                        )}

                        {vendor.portfolioPhotos?.length > 1 && (
                          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 2 }}>
                            {vendor.portfolioPhotos.slice(0, 6).map((p, i) => (
                              <img key={i} src={p} alt="" style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} loading="lazy" />
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, paddingTop: 10 }}>
                        <button
                          onClick={openFullProfile}
                          style={{ width: "100%", padding: "11px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
                        >
                          Full Profile →
                        </button>
                        {isFromPlanFlow ? (() => {
                          void shortlistTick;
                          const slActive = isInShortlist(serviceType, vendor._id);
                          return (
                            <button
                              onClick={(e) => { e.stopPropagation(); if (slActive) return; addToShortlist(serviceType, vendor); setQuickViewVendor(null); }}
                              style={{ width: "100%", padding: "11px", borderRadius: 11, border: slActive ? "1.5px solid rgba(34,197,94,0.4)" : "1.5px solid rgba(196,122,46,0.25)", background: slActive ? "rgba(34,197,94,0.08)" : "#fff", color: slActive ? "#16a34a" : "#C47A2E", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: slActive ? "default" : "pointer" }}
                            >
                              {slActive ? "✓ Shortlisted" : "Shortlist"}
                            </button>
                          );
                        })() : (
                          <button
                            onClick={bookNow}
                            style={{ width: "100%", padding: "11px", borderRadius: 11, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                          >
                            {!token ? "Sign In to Book" : getChatSave(vendor._id) ? "View Active Chat" : "Book Now"}
                          </button>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <TalkToTendrStrip onTalk={handleTalkToTendr} serviceType={serviceType} />
            </>
          )}
        </div>

        {/* Show More */}
        {paginationInfo?.totalPages > currentPage && (
          <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 40px" }}>
            <button
              type="button"
              onClick={handleShowMore}
              disabled={isLoading}
              style={{
                padding: "12px 36px", borderRadius: 100,
                border: "1.5px solid rgba(196,122,46,0.4)",
                background: isLoading ? "rgba(196,122,46,0.06)" : "#fff",
                color: "#C47A2E", fontSize: 14, fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                boxShadow: "0 2px 12px rgba(196,122,46,0.12)",
                transition: "all 0.2s",
              }}
            >
              {isLoading ? "Loading…" : "Show More Vendors"}
            </button>
          </div>
        )}
      </div>

      {/* Pre-chat event form — shown when "Request to Chat" is clicked without event details */}
      {chatFormVendor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99996, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font }}
          onClick={() => setChatFormVendor(null)}>
          <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px", maxWidth: 480, width: "100%", maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Your Event Details</h2>
                <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Tell us about your event — this goes to {chatFormVendor.name}</p>
              </div>
              <button onClick={() => setChatFormVendor(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9B7450", padding: 0 }}>✕</button>
            </div>
            {(() => {
              const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
              const fieldStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" };
              return (
                <div className="ep-chat-form-fields" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Occasion — full width */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>What's the occasion? *</label>
                    <select value={chatEventForm.eventType} onChange={e => setChatEventForm(p => ({ ...p, eventType: e.target.value }))}
                      style={{ ...fieldStyle, color: chatEventForm.eventType ? "#2C1A0E" : "#9B7450" }}>
                      <option value="">Select event type</option>
                      {["Birthday","1st Birthday","Baby Shower","Newborn Welcome","Get-together","Anniversary","Housewarming","Graduation","Office Party","Pre Wedding","Corporate Event","Festival","Others"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <EventIdeasPanel eventType={chatEventForm.eventType} />
                  {/* Invite-only: person name — Birthday, Anniversary, Baby Shower, Graduation */}
                  {["Birthday","1st Birthday","Anniversary","Baby Shower","Newborn Welcome","Graduation"].includes(chatEventForm.eventType) && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                        {{"Birthday":"Whose birthday is it?","1st Birthday":"Whose birthday is it?","Anniversary":"Whose anniversary?","Baby Shower":"Baby's name (if decided)","Newborn Welcome":"Baby's name","Graduation":"Who's graduating?"}[chatEventForm.eventType]}
                        <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#9B7450" }}> — for invitation flyer</span>
                      </label>
                      <input
                        type="text"
                        value={invitePersonName}
                        onChange={e => { setInvitePersonName(e.target.value); try { localStorage.setItem('tendr_person_name', e.target.value); } catch {} }}
                        placeholder={{"Birthday":"e.g., Aarav's","1st Birthday":"e.g., little Riya's","Anniversary":"e.g., Priya & Rahul","Baby Shower":"e.g., Arjun","Newborn Welcome":"e.g., Aanya","Graduation":"e.g., Ananya"}[chatEventForm.eventType] || "Optional"}
                        style={{ ...fieldStyle, color: "#2C1A0E" }}
                      />
                    </div>
                  )}
                  {/* Date + Time — side by side on mobile */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 10px" }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Event date *</label>
                      <input
                        type="date"
                        value={chatEventForm.date}
                        min={today}
                        onChange={e => {
                          if (e.target.value && e.target.value < today) return;
                          setChatEventForm(p => ({ ...p, date: e.target.value }));
                        }}
                        style={{ ...fieldStyle, color: "#2C1A0E" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                        Start time <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#C47A2E", fontSize: 10 }}>(flyer)</span>
                      </label>
                      <input
                        type="time"
                        value={chatEventForm.eventTime}
                        onChange={e => setChatEventForm(p => ({ ...p, eventTime: e.target.value }))}
                        style={{ ...fieldStyle, color: chatEventForm.eventTime ? "#2C1A0E" : "#9B7450" }}
                      />
                    </div>
                  </div>
                  {/* Guest count — full width below date so it never overlaps the calendar */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Guest count *</label>
                    <select value={chatEventForm.guests} onChange={e => setChatEventForm(p => ({ ...p, guests: e.target.value }))}
                      style={{ ...fieldStyle, color: chatEventForm.guests ? "#2C1A0E" : "#9B7450" }}>
                      <option value="">Select guests</option>
                      {["Under 25","25–50","50–100","100–150","150–200","200–300","300+"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  {/* Budget + Location side by side on desktop, stacked on mobile */}
                  <div className="ep-chat-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 14px" }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Budget *</label>
                      <select value={chatEventForm.budget} onChange={e => setChatEventForm(p => ({ ...p, budget: e.target.value }))}
                        style={{ ...fieldStyle, color: chatEventForm.budget ? "#2C1A0E" : "#9B7450" }}>
                        <option value="">Select budget</option>
                        {["Under ₹10K","₹10K–₹30K","₹30K–₹50K","₹50K–₹1L","Over ₹1L"].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Location *</label>
                      <select value={chatEventForm.location} onChange={e => setChatEventForm(p => ({ ...p, location: e.target.value }))}
                        style={{ ...fieldStyle, color: chatEventForm.location ? "#2C1A0E" : "#9B7450" }}>
                        <option value="">Select city</option>
                        {["Delhi","Noida","Greater Noida","Ghaziabad"].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Invite-only: venue address — shown after city is selected */}
                  {chatEventForm.location && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                        Venue name & address
                        <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#9B7450" }}> — for invitation flyer</span>
                      </label>
                      <input
                        type="text"
                        value={inviteVenueAddress}
                        onChange={e => { setInviteVenueAddress(e.target.value); try { localStorage.setItem('tendr_venue_address', e.target.value); } catch {} }}
                        placeholder="e.g., The Grand Pavilion, Sector 45"
                        style={{ ...fieldStyle, color: "#2C1A0E" }}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
            <style>{`
              @media (max-width: 480px) {
                .ep-chat-form-row { grid-template-columns: 1fr !important; }
              }
            `}</style>
            <button
              disabled={checkingAvail}
              onClick={async () => {
                const { eventType: et, guests: g, date: d, budget: b, location: loc, eventTime: et2 } = chatEventForm;
                if (!requireFormBeforeChat) {
                  // Planning flow — no availability check needed; chatSave written after conversation opens
                  dispatch(setMultipleFormData({ eventType: et, guests: g, date: d, budget: b, location: loc, eventTime: et2, token }));
                  dispatch(setBookingType("you-do-it"));
                  openVendorChat({ _id: chatFormVendor._id, name: chatFormVendor.name, serviceType: chatFormVendor.serviceType, addToCompare: true });
                  setChatFormVendor(null);
                  return;
                }
                // Discovery flow — save session, then check availability before opening chat
                saveDiscoverySession({ eventType: et, guests: g, date: d, location: loc });
                setLocalFormData({ eventType: et, guests: g, date: d, location: loc, eventTime: et2 });
                if (et2) { try { localStorage.setItem('tendr_event_time', et2); } catch {} }
                if (d) {
                  setCheckingAvail(true);
                  try {
                    const month = d.slice(0, 7);
                    const res = await fetch(`${BASE_URL}/vendors/${chatFormVendor._id}/availability?month=${month}`);
                    const data = res.ok ? await res.json() : { availability: {} };
                    const day = (data?.availability || {})[d];
                    const hasSlot = !day || day.slot1 === 'available' || day.slot2 === 'available';
                    if (!hasSlot) {
                      const params = new URLSearchParams({ serviceTypes: chatFormVendor.serviceType, date: d, limit: '6' });
                      if (loc) params.set('location', loc);
                      const altRes = await fetch(`${BASE_URL}/vendors?${params}`);
                      const altData = altRes.ok ? await altRes.json() : { vendors: [] };
                      const alternatives = (altData?.vendors || []).filter(v => v._id !== chatFormVendor._id).slice(0, 5);
                      const bookedVendor = chatFormVendor;
                      setChatFormVendor(null);
                      setCheckingAvail(false);
                      setUnavailModal({ vendor: bookedVendor, date: d, alternatives });
                      return;
                    }
                  } catch { /* on error fall through and open chat */ }
                  setCheckingAvail(false);
                }
                // chatSave written after conversation opens in VendorChatModal
                openVendorChat({ _id: chatFormVendor._id, name: chatFormVendor.name, serviceType: chatFormVendor.serviceType, addToCompare: true });
                setChatFormVendor(null);
              }}
              style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 12, border: "none", background: checkingAvail ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: checkingAvail ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 800, cursor: checkingAvail ? "not-allowed" : "pointer", fontFamily: font, boxShadow: checkingAvail ? "none" : "0 4px 14px rgba(196,122,46,0.3)" }}>
              {checkingAvail ? "Checking availability…" : `Chat & Finalise with ${chatFormVendor.name} →`}
            </button>
          </div>
        </div>
      )}

      {/* ── Vendor Unavailable Modal ── */}
      {unavailModal && (
        <div
          onClick={() => setUnavailModal(null)}
          style={{ position: "fixed", inset: 0, zIndex: 99997, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: font }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", maxWidth: 520, width: "100%", maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))", overflowY: "auto", boxShadow: "0 32px 80px rgba(44,26,14,0.25)" }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 30, marginBottom: 8 }}>😔</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px" }}>
                  {unavailModal.vendor.name} is fully booked
                </h2>
                <p style={{ fontSize: 13, color: "#9B7450", margin: 0, lineHeight: 1.5 }}>
                  No slots available on{" "}
                  {new Date(unavailModal.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setUnavailModal(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9B7450", padding: "0 0 0 14px", flexShrink: 0 }}>✕</button>
            </div>

            {/* Alternative vendors */}
            {unavailModal.alternatives.length > 0 ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Available {unavailModal.vendor.serviceType}s on your date
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {unavailModal.alternatives.map(v => {
                    const photo = v.portfolioPhotos?.[0] || v.image || FALLBACK_IMG;
                    const rating = v.avgReviewScore ?? v.rating;
                    return (
                      <div
                        key={v._id}
                        onClick={() => { setQuickViewVendor(v); setUnavailModal(null); }}
                        style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.4)"; e.currentTarget.style.background = "rgba(196,122,46,0.03)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.background = "#fff"; }}
                      >
                        <img src={photo} alt={v.name} style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>{v.name}</div>
                          <div style={{ fontSize: 11, color: "#C47A2E", fontWeight: 700, marginBottom: 5 }}>{v.serviceType}</div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            {(v.city || v.locations?.[0]) && <span style={{ fontSize: 11, color: "#9B7450" }}>📍 {v.city || v.locations?.[0]}</span>}
                            <span style={{ fontSize: 11, color: "#5a3a1a", fontWeight: 600 }}>{(v.price || v.startingPrice) > 0 ? `Starting from ₹${Number(v.price || v.startingPrice).toLocaleString("en-IN")}` : "Starting price : Price based on request"}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 13, color: "#C47A2E", fontWeight: 700, flexShrink: 0 }}>View →</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0", color: "#9B7450", fontSize: 13, lineHeight: 1.6 }}>
                No other {unavailModal.vendor.serviceType}s available on this date in your area.<br />Try a different date.
              </div>
            )}

            <button
              onClick={() => setUnavailModal(null)}
              style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              Try a different date
            </button>
          </div>
        </div>
      )}

      {/* Auth modal — triggered from "Sign In to Chat" inside quick view */}
      <AuthModal
        open={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setPendingChatVendor(null); setPendingTendrChat(false); }}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (pendingChatVendor) {
            setQuickViewVendor(pendingChatVendor);
            setPendingChatVendor(null);
          }
          if (pendingTendrChat) {
            setPendingTendrChat(false);
            openBaatKaroChat();
          }
        }}
      />
    </div>
  );
};

export default VendorList_ListingPage;
