// src/components/VendorList_ListingPage.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AuthModal from "./AuthModal";
import { useChatOverlay } from "../context/ChatContext";
import TalkToTendrStrip from "./TalkToTendrStrip";
import { setMultipleFormData, setBookingType } from "../redux/eventPlanningSlice";
import { EventIdeasPanel } from "../utils/eventIdeas";
import VendorPhotoPlaceholder from "./VendorPhotoPlaceholder";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Discovery listing session — isolated from planning-flow Redux data, 24h TTL
const DISCOVERY_KEY = 'tendr:session:discovery';
const DISCOVERY_TTL = 24 * 60 * 60 * 1000;
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
      // No event date set — fallback: keep for 24h
      if (Date.now() - (s.submittedAt || 0) > 24 * 60 * 60 * 1000) {
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

const SAVED_KEY = "tendr_saved_vendors";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const getSaved = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    // Filter out bookmarks older than 7 days
    return raw.filter(v => !v.__savedAt || Date.now() - v.__savedAt < SEVEN_DAYS_MS);
  } catch { return []; }
};
const isSaved = (id) => getSaved().some(v => v._id === id);
const toggleSaved = (vendor) => {
  const list = getSaved();
  const exists = list.some(v => v._id === vendor._id);
  const updated = exists
    ? list.filter(v => v._id !== vendor._id)
    : [...list, { _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, image: vendor.image || vendor.portfolioPhotos?.[0] || "", city: vendor.city || "", __savedAt: Date.now() }];
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(updated)); } catch {}
  window.dispatchEvent(new CustomEvent("tendr:saved-vendors-changed"));
  // Sync to server
  try { const t = localStorage.getItem("tendr_token") || localStorage.getItem("jwt"); if (t) import("../utils/progressSync").then(m => m.scheduleSyncToServer(t)); } catch {}
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
  saveToCompare = false, // when true: ♡ toggles compareSelected (normal flow), else localStorage
  isLoggedIn = false,
  requireFormBeforeChat = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // true only when user arrived via planning flow (Save and Browse)
  const isFromPlanFlow = location.pathname === "/listings" && new URLSearchParams(location.search).get("fromPlan") === "1";
  const dispatch = useDispatch();
  const { openVendorChat, openExistingChat, openTendrTeamChat } = useChatOverlay();
  const { token } = useSelector(s => s.auth);
  const formData = useSelector(s => s.eventPlanning?.formData || {});
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
  const [savedTick, setSavedTick] = useState(0);
  const [shareCopiedId, setShareCopiedId] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [unavailModal, setUnavailModal] = useState(null); // null or { vendor, date, alternatives[] }
  const [checkingAvail, setCheckingAvail] = useState(false);

  const handleToggleSave = useCallback((vendor) => {
    toggleSaved(vendor);
    setSavedTick(t => t + 1);
    // Notify HamburgerNav sidebar to refresh saved vendors count
    window.dispatchEvent(new CustomEvent("tendr:saved-updated"));
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

  // Reset photo index when quick view opens
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [quickViewVendor?._id]);

  // Keyboard: Esc closes QuickView/form, arrows navigate between vendors in QuickView
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (chatFormVendor) { setChatFormVendor(null); return; }
        if (quickViewVendor) { setQuickViewVendor(null); return; }
      }
      if (!quickViewVendor || vendors.length < 2) return;
      const idx = vendors.findIndex(v => v._id === quickViewVendor._id);
      if (e.key === "ArrowRight" && idx < vendors.length - 1) setQuickViewVendor(vendors[idx + 1]);
      if (e.key === "ArrowLeft"  && idx > 0)                  setQuickViewVendor(vendors[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickViewVendor, chatFormVendor, vendors]);

  const handleViewProfile = (e, vendorId) => {
    e.stopPropagation();
    if (!vendorId) return;
    const url = `/vendor/${vendorId}`;
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

  const closePanel = () => setQuickViewVendor(null);

  const handleTalkToTendr = () => {
    if (!token) {
      setPendingTendrChat(true);
      setAuthModalOpen(true);
      return;
    }
    openTendrTeamChat();
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5">


        <div className="vendor-list">
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", fontFamily: font }}>
              <div style={{ fontSize: 50, marginBottom: 20, animation: "curateFloat 2s ease-in-out infinite" }}>✨</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Curating your list...</h3>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 28px" }}>Finding the best vendors for your event</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: "#C47A2E", animation: `curateDot 1.2s ${i * 0.18}s ease-in-out infinite` }} />
                ))}
              </div>
              <style>{`
                @keyframes curateFloat { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
                @keyframes curateDot { 0%, 100% { opacity: 0.25; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.2); } }
              `}</style>
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
            <div className="vendor-list-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2 pb-4">
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
              {vendors.map((vendor, index) => {
                const isSelected = compareSelected.some((v) => v._id === vendor._id);
                const rating = vendor.avgReviewScore ?? vendor.rating;

                return (
                  <div
                    key={vendor._id || index}
                    className="vendor-card"
                    onClick={() => {
                      if (window.innerWidth >= 1024) {
                        window.open(`/vendor/${vendor._id}`, "_blank");
                      } else {
                        setQuickViewVendor(vendor);
                      }
                    }}
                    style={{
                      background: "#FFFCF5", borderRadius: 20,
                      border: "1.5px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
                      fontFamily: font, cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(139,69,19,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.07)"; }}
                  >
                    {/* Image — full bleed */}
                    <div className="vendor-card-img" style={{ height: 260, overflow: "hidden", position: "relative" }}>
                      {(vendor.image || vendor.portfolioPhotos?.[0]) ? (
                        <img
                          src={vendor.image || vendor.portfolioPhotos[0]}
                          alt={vendor.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          loading="lazy"
                        />
                      ) : (
                        <VendorPhotoPlaceholder serviceType={vendor.serviceType} style={{ height: 260 }} />
                      )}
                      {/* Gradient overlay — stronger at bottom for mobile text legibility */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,4,0,0.88) 0%, rgba(12,4,0,0.3) 45%, transparent 100%)", pointerEvents: "none" }} />
                      {/* Top Rated star badge */}
                      {vendor.isTopRated && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(196,122,46,0.5)" }}>
                          ⭐ Top Rated
                        </div>
                      )}
                      {/* Verified badge — always shown */}
                      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(196,122,46,0.88)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 100, padding: "4px 10px", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        ✓ Verified
                      </div>
                      {/* Service type badge — desktop only (hidden on mobile via CSS) */}
                      <span style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(196,122,46,0.9)", color: "#fff", padding: "3px 9px", borderRadius: 20 }}>
                        {vendor.serviceType}
                      </span>
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
                          {rating > 0 && (
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "#FFCC55", fontWeight: 700 }}>★ {Number(rating).toFixed(1)}{vendor.reviewCount > 0 ? ` (${vendor.reviewCount})` : ""}</span>
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
                        {/* Category + top rated */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9B7450", padding: "2px 0" }}>
                            {vendor.serviceType}
                          </span>
                          {vendor.isTopRated && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.08)", padding: "2px 8px", borderRadius: 20 }}>⭐ Top Rated</span>
                          )}
                        </div>
                        {/* Location */}
                        {(vendor.locations?.length > 0 || vendor.city) && (
                          <div style={{ fontSize: 11, color: "#9B7450", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            📍 {vendor.locations?.length > 0 ? vendor.locations.slice(0,3).join(", ") : vendor.city}
                            {vendor.locations?.length > 3 && ` +${vendor.locations.length - 3}`}
                          </div>
                        )}
                        {/* Rating + review count */}
                        <div style={{ display: "flex", gap: 10, fontSize: 11.5, color: "#9B7450", flexWrap: "wrap", alignItems: "center" }}>
                          {rating > 0 && (
                            <span style={{ color: "#C47A2E", fontWeight: 700 }}>
                              ★ {Number(rating).toFixed(1)}
                              {vendor.reviewCount > 0 && <span style={{ fontWeight: 500, color: "#9B7450" }}> · {vendor.reviewCount} review{vendor.reviewCount !== 1 ? "s" : ""}</span>}
                            </span>
                          )}
                          {(vendor.price > 0 || vendor.startingPrice > 0) && (
                            <span style={{ color: "#5a3a1a", fontWeight: 700 }}>From ₹{Number(vendor.price || vendor.startingPrice).toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons — always visible on both mobile and desktop */}
                      <div style={{ display: "flex", gap: 7, marginTop: 2 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setQuickViewVendor(vendor); }}
                          style={{ flex: 1, padding: "9px 6px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
                        >
                          Quick View
                        </button>
                        {/* Normal booking → ♡ compare; Discovery (top-rated/search) → "Save" text */}
                        {saveToCompare ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleCompare?.(vendor); }}
                            title={isSelected ? "In compare list" : "Add to compare"}
                            style={{ padding: "9px 13px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#C47A2E" : "rgba(0,0,0,0.12)"}`, background: isSelected ? "rgba(196,122,46,0.08)" : "transparent", color: isSelected ? "#C47A2E" : "#9B7450", fontSize: 16, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
                          >
                            {isSelected ? "♥" : "♡"}
                          </button>
                        ) : (
                          (() => { const saved = isSaved(vendor._id); return (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleSave(vendor); }}
                              title={saved ? "Saved" : "Save vendor"}
                              style={{ padding: "9px 13px", borderRadius: 10, border: `1.5px solid ${saved ? "#C47A2E" : "rgba(0,0,0,0.12)"}`, background: saved ? "rgba(196,122,46,0.08)" : "transparent", color: saved ? "#C47A2E" : "#9B7450", fontSize: 16, cursor: "pointer", flexShrink: 0 }}
                            >
                              {saved ? "♥" : "♡"}
                            </button>
                          ); })()
                        )}
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
          {/* Backdrop — z-index must beat MobileBottomNav (99990) */}
          <div
            onClick={closePanel}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99994, animation: "qv-fade 0.2s ease" }}
          />

          {/* Panel */}
          <div
            style={window.innerWidth < 768 ? {
              position: "fixed", left: 0, right: 0, bottom: 0, top: 0,
              width: "100vw", height: "100%",
              background: "#FFFCF5", zIndex: 99995,
              overflowY: "auto", fontFamily: font,
              animation: "qv-up 0.32s cubic-bezier(0.4,0,0.2,1)",
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
            } : {
              position: "fixed", right: 0, top: 0, height: "100dvh",
              width: 420, maxWidth: "92vw",
              background: "#FFFCF5", zIndex: 99995,
              boxShadow: "-8px 0 48px rgba(139,69,19,0.18)",
              overflowY: "auto", fontFamily: font,
              animation: "qv-slide 0.32s cubic-bezier(0.4,0,0.2,1)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Cover image with browsing arrows */}
            {(() => {
              const photos = (quickViewVendor.portfolioPhotos || []).filter(Boolean);
              const hasPhoto = photos.length > 0 || quickViewVendor.image;
              const imgSrc = photos.length
                ? photos[activePhotoIdx] || photos[0]
                : (quickViewVendor.image || null);
              const total = photos.length || 1;
              const qvRating = quickViewVendor.avgReviewScore ?? quickViewVendor.rating;
              return (
                <div style={{ position: "relative", height: 230, flexShrink: 0 }}>
                  {hasPhoto ? (
                    <img src={imgSrc} alt={quickViewVendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <VendorPhotoPlaceholder serviceType={quickViewVendor.serviceType} style={{ height: 230 }} />
                  )}
                  {/* Close + nav hint */}
                  <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    {vendors.length > 1 && (
                      <div style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.75)", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>← → vendors</div>
                    )}
                    <button onClick={closePanel}
                      style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                  {/* Photo prev/next arrows */}
                  {total > 1 && (
                    <>
                      <button onClick={() => setActivePhotoIdx(i => (i - 1 + total) % total)}
                        style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                      <button onClick={() => setActivePhotoIdx(i => (i + 1) % total)}
                        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                      {/* Dot indicators */}
                      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
                        {photos.slice(0, 6).map((_, i) => (
                          <div key={i} onClick={() => setActivePhotoIdx(i)}
                            style={{ width: i === activePhotoIdx ? 14 : 5, height: 5, borderRadius: 100, background: i === activePhotoIdx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.2s" }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Content */}
            <div style={{ padding: "22px 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
              {/* Name + type */}
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                  {quickViewVendor.name}
                </h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 100, background: "rgba(196,122,46,0.12)", color: "#C47A2E" }}>
                  {quickViewVendor.serviceType}
                </span>
              </div>

              {/* Starting price */}
              {(quickViewVendor.price || quickViewVendor.startingPrice) && (
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4, marginBottom: 14, background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 10, padding: "8px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Starting from</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>₹{Number(quickViewVendor.price || quickViewVendor.startingPrice).toLocaleString("en-IN")}</span>
                </div>
              )}
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
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const vendorId = quickViewVendor._id || quickViewVendor.id;
                      if (!vendorId) return;
                      closePanel();
                      const url = `/vendor/${vendorId}`;
                      const state = { from: "listing", compareInProfile, filters: { eventType, serviceType, locationType, date, guestCount, sortBy, sortOrder } };
                      if (window.innerWidth >= 768) {
                        window.open(url, "_blank");
                      } else {
                        sessionStorage.setItem("listings_scroll_y", String(window.scrollY));
                        navigate(url, { state });
                      }
                    }}
                    style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}
                  >
                    View Full Profile →
                  </button>
                  {/* Share button — uses shareCopiedId from component state (no hooks-in-IIFE) */}
                  {(() => {
                    const copied = shareCopiedId === quickViewVendor._id;
                    const share = async () => {
                      const url = `${window.location.origin}/vendor/${quickViewVendor._id}`;
                      if (navigator.share) { try { await navigator.share({ title: quickViewVendor.name, url }); } catch {} }
                      else { await navigator.clipboard.writeText(url); setShareCopiedId(quickViewVendor._id); setTimeout(() => setShareCopiedId(null), 2000); }
                    };
                    return (
                      <button onClick={share} title={copied ? "Copied!" : "Share"}
                        style={{ padding: "13px 14px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: copied ? "rgba(196,122,46,0.08)" : "#fff", color: "#C47A2E", cursor: "pointer", flexShrink: 0, fontSize: 16, transition: "all 0.2s" }}>
                        {copied ? "✓" : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        )}
                      </button>
                    );
                  })()}
                </div>
                <button
                  onClick={async () => {
                    if (!token) {
                      setPendingChatVendor(quickViewVendor);
                      setAuthModalOpen(true);
                      return;
                    }
                    // Already have an active chat request for this vendor — open active chats
                    if (getChatSave(quickViewVendor._id)) {
                      document.dispatchEvent(new CustomEvent("tendr:open-active-chats"));
                      closePanel();
                      return;
                    }
                    const vendor = quickViewVendor;
                    closePanel();
                    // Discovery listings (top-rated/browse/search): show pre-filled form
                    if (requireFormBeforeChat) {
                      const discoveryData = getDiscoverySession();
                      setChatFormVendor(vendor);
                      // Pre-fill event details from session but always clear budget (it's per-vendor)
                      setChatEventForm({ eventType: "", guests: "", date: "", location: "", eventTime: "", ...(discoveryData || {}), budget: "" });
                      return;
                    }
                    // Planning flow: check 24h save for this vendor
                    const saved = getChatSave(vendor._id);
                    if (saved) {
                      // Already submitted within 24h — open existing conversation
                      try {
                        const res = await fetch(`${BASE_URL}/conversations`, {
                          headers: { Authorization: `Bearer ${token}` },
                          credentials: "include",
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const convo = (data.conversations || []).find(c => {
                            const cvid = typeof c.vendorId === "object" ? c.vendorId?._id : c.vendorId;
                            return String(cvid) === String(vendor._id);
                          });
                          if (convo) {
                            openExistingChat(convo._id, { _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, approved: convo.chatApproved, addToCompare: saveToCompare });
                            return;
                          }
                        }
                      } catch {}
                      // Fallback if conversation not found yet
                      openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, addToCompare: saveToCompare });
                      return;
                    }
                    // Planning flow → open chat modal; chatSave is written after conversation is created
                    openVendorChat({ _id: vendor._id, name: vendor.name, serviceType: vendor.serviceType, addToCompare: saveToCompare });
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                >
                  {!token ? "Sign In to Chat" : getChatSave(quickViewVendor._id) ? "💬 View Active Chat" : "💬 Chat & Finalise"}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes qv-fade  { from { opacity: 0 } to { opacity: 1 } }
            @keyframes qv-slide { from { transform: translateX(100%) } to { transform: translateX(0) } }
            @keyframes qv-up    { from { transform: translateY(100%) } to { transform: translateY(0) } }
          `}</style>
        </>
      )}


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
                  openVendorChat({ _id: chatFormVendor._id, name: chatFormVendor.name, serviceType: chatFormVendor.serviceType, addToCompare: saveToCompare });
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
                openVendorChat({ _id: chatFormVendor._id, name: chatFormVendor.name, serviceType: chatFormVendor.serviceType, addToCompare: saveToCompare });
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
                            {rating > 0 && <span style={{ fontSize: 11, color: "#C47A2E", fontWeight: 700 }}>★ {Number(rating).toFixed(1)}</span>}
                            {(v.price || v.startingPrice) > 0 && <span style={{ fontSize: 11, color: "#5a3a1a", fontWeight: 600 }}>From ₹{Number(v.price || v.startingPrice).toLocaleString("en-IN")}</span>}
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
            openTendrTeamChat();
          }
        }}
      />
    </div>
  );
};

export default VendorList_ListingPage;
