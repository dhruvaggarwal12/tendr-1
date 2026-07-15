import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import tendrLogo from "../assets/logos/tendr.png";
import AuthModal from "./AuthModal";
import { removeVendorFromCompare, clearVendorCompare } from "../redux/listingFiltersSlice";
import { selectFunCartCount, selectFunConfirmed, setFunConfirmed, clearFunCart, selectFunCartItems, selectFunCartTotal } from "../redux/funActivitiesCartSlice";
import router from "../router";
import MiniChatWidget from "./MiniChatWidget";
import CompareModal from "./CompareModal";
import { FunCartDrawer } from "./FunActivitiesSection";
import { GiftCartDrawer } from "./GiftCartDrawer";
import { useChatOverlay } from "../context/ChatContext";
import { useStationeryCart } from "../context/StationeryCartContext";
import GlobalStationeryCartDrawer from "./GlobalStationeryCartDrawer";
import { selectCartCount as selectGhCartCount, selectCartItems as selectGhCartItems, selectGhConfirmed, setGhConfirmed, clearCart as clearGhCart, selectGhDeliveryForm } from "../redux/giftHamperCartSlice";
import { selectStConfirmed, selectStForm, selectStCartSnapshot, clearStBooking } from "../redux/stationeryBookingSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const SAVED_KEY = "tendr_saved_vendors";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const getSavedVendors = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    return raw.filter(v => !v.__savedAt || Date.now() - v.__savedAt < SEVEN_DAYS_MS);
  } catch { return []; }
};

export default function FloatingChatButton({ hideOnRoutes = ["/chat", "/chats", "/login", "/signup", "/otp"] }) {
  const { user, token }      = useSelector((s) => s.auth);
  const selectedCategories   = useSelector((s) => s.eventPlanning.selectedVendors || []);
  const finalisedVendors     = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const compareSelected      = useSelector((s) => s.listingFilters.compareSelected || []);
  const activeServiceType    = useSelector((s) => s.listingFilters.serviceType);
  const funCartCount         = useSelector(selectFunCartCount);
  const ghCartCount          = useSelector(selectGhCartCount);
  const ghCartItems          = useSelector(selectGhCartItems);
  const ghDeliveryForm       = useSelector(selectGhDeliveryForm);
  const funConfirmed         = useSelector(selectFunConfirmed);
  const ghConfirmed          = useSelector(selectGhConfirmed);
  const stConfirmed          = useSelector(selectStConfirmed);
  const stForm               = useSelector(selectStForm);
  const stCartSnapshot       = useSelector(selectStCartSnapshot);
  const faItems              = useSelector(selectFunCartItems);
  const faTotal              = useSelector(selectFunCartTotal);
  const [funCartOpen, setFunCartOpen] = useState(false);
  const [ghCartOpen, setGhCartOpen] = useState(false);
  const [anyDrawerOpen, setAnyDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState(null);
  const [addOnsOpen, setAddOnsOpen] = useState(false);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const dispatch = useDispatch();
  const { chatState, expandChat, openExistingChat, openConciergeChat } = useChatOverlay();
  const { cartCount: stCartCount, openCart: openStCart } = useStationeryCart();
  const hasMinimizedChat = chatState?.minimized && chatState?.vendor;
  const [open, setOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareCategory, setCompareCategory] = useState("");
  const [activeCompare, setActiveCompare] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [showMiniChat, setShowMiniChat] = useState(false);
  const [showActiveChats, setShowActiveChats] = useState(false);
  const [vendorChats, setVendorChats] = useState([]);
  const [rejectedPanel, setRejectedPanel] = useState(null); // { convo, vendors, serviceType, eventDetails } | null
  const [rejectedPanelLoading, setRejectedPanelLoading] = useState(false);
  const [rejectedQv, setRejectedQv] = useState(null); // vendor for quick-view side panel
  const [savedVendors, setSavedVendors] = useState(() => getSavedVendors());
  const [newlyAdded, setNewlyAdded] = useState(null); // 'compare' | 'fun' | 'st' — drives fly-in animation
  const prevCompareLen = useRef(compareSelected.length);
  const prevFunCount   = useRef(funCartCount);
  const prevStCount    = useRef(stCartCount);
  // Persist seen conversation IDs so badge stays gone after viewing
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("chatBadgeSeenIds") || "[]")); }
    catch { return new Set(); }
  });

  const markAllSeen = (chats) => {
    setSeenIds(prev => {
      const next = new Set([...prev, ...chats.map(c => c._id)]);
      localStorage.setItem("chatBadgeSeenIds", JSON.stringify([...next]));
      return next;
    });
  };

  const unseenCount = vendorChats.filter(c => !c.chatRejected && !seenIds.has(c._id)).length;
  const [path, setPath]     = useState(() => router.state.location.pathname);
  const [search, setSearch] = useState(() => router.state.location.search || "");
  const [decorDismissed, setDecorDismissed] = useState(() => {
    try { return sessionStorage.getItem("tendr_decor_tip_dismissed") === "1"; } catch { return false; }
  });

  // Track route changes in the SPA
  useEffect(() => {
    const unsub = router.subscribe((state) => {
      setPath(state.location.pathname);
      setSearch(state.location.search || "");
      setOpen(false);
      setLauncherOpen(false);
    });
    return unsub;
  }, []);

  // Refresh saved vendors when listing page saves/unsaves
  useEffect(() => {
    const refresh = () => setSavedVendors(getSavedVendors());
    window.addEventListener("tendr:saved-vendors-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("tendr:saved-vendors-changed", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  // Auto-open launcher whenever a vendor is added to compare (gives immediate feedback)
  const prevCompareCountRef = useRef(compareSelected.length);
  useEffect(() => {
    if (compareSelected.length > prevCompareCountRef.current) {
      setLauncherOpen(true);
    }
    prevCompareCountRef.current = compareSelected.length;
  }, [compareSelected.length]);

  // Hide FAB + chat when any drawer (WS cart, quick view) is open
  useEffect(() => {
    const h = () => setAnyDrawerOpen((window.__tendrDrawers?.size || 0) > 0);
    window.addEventListener('tendr:drawer', h);
    return () => window.removeEventListener('tendr:drawer', h);
  }, []);

  const removeSaved = (id) => {
    const list = getSavedVendors().filter(v => v._id !== id);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {}
    setSavedVendors(list);
    window.dispatchEvent(new CustomEvent("tendr:saved-vendors-changed"));
  };

  const showDecorChip = !decorDismissed &&
    path === "/listings" &&
    activeServiceType === "Decorator";

  // Fetch all active conversations (pending + approved, all types)
  const fetchVendorChats = useCallback(() => {
    if (!token || !user?._id) return;
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : { conversations: [] })
      .then((data) => {
        // Show vendor + concierge chats only — exclude support (MiniChatWidget creates support conversations)
        const active = (data.conversations || []).filter(
          (c) => c.chatType !== "support"
        );
        // Deduplicate Tendr Team (null vendorId) entries — keep the most recently updated one
        const seen = new Set();
        const deduped = active.filter((c) => {
          const vid = c.vendorId?._id || c.vendorId || null;
          if (!vid) {
            if (seen.has("__tendr_team__")) return false;
            seen.add("__tendr_team__");
          }
          return true;
        });
        setVendorChats(deduped);
      })
      .catch(() => {});
  }, [token, user?._id]);

  useEffect(() => { fetchVendorChats(); }, [fetchVendorChats]);

  // Listen for VendorChatModal "back to active chats" event
  // Must be BEFORE any early returns to satisfy Rules of Hooks
  useEffect(() => {
    const handler = () => setShowActiveChats(true);
    document.addEventListener("tendr:open-active-chats", handler);
    return () => document.removeEventListener("tendr:open-active-chats", handler);
  }, []);

  // Re-fetch chats when a new vendor conversation is created
  useEffect(() => {
    const handler = () => fetchVendorChats();
    window.addEventListener("tendr:chat-started", handler);
    return () => window.removeEventListener("tendr:chat-started", handler);
  }, [fetchVendorChats]);

  // Re-fetch (and clear) active chats when payment is confirmed by admin
  useEffect(() => {
    const handler = () => fetchVendorChats();
    window.addEventListener("tendr:payment-confirmed", handler);
    return () => window.removeEventListener("tendr:payment-confirmed", handler);
  }, [fetchVendorChats]);

  // Fly-in animation: auto-open launcher when Compare/Fun/Stationery icon first appears
  useEffect(() => {
    const prev = prevCompareLen.current;
    prevCompareLen.current = compareSelected.length;
    if (prev === 0 && compareSelected.length > 0) {
      setLauncherOpen(true);
      setNewlyAdded('compare');
      const t = setTimeout(() => setNewlyAdded(null), 600);
      return () => clearTimeout(t);
    }
  }, [compareSelected.length]);

  useEffect(() => {
    const prev = prevFunCount.current;
    prevFunCount.current = funCartCount;
    if (prev === 0 && funCartCount > 0) {
      setLauncherOpen(true);
      setNewlyAdded('fun');
      const t = setTimeout(() => setNewlyAdded(null), 600);
      return () => clearTimeout(t);
    }
  }, [funCartCount]);

  useEffect(() => {
    const prev = prevStCount.current;
    prevStCount.current = stCartCount;
    if (prev === 0 && stCartCount > 0) {
      setLauncherOpen(true);
      setNewlyAdded('st');
      const t = setTimeout(() => setNewlyAdded(null), 600);
      return () => clearTimeout(t);
    }
  }, [stCartCount]);

  if (new URLSearchParams(search).get("standalone") === "1") return null;
  if (hideOnRoutes.some((r) => path === r || path.startsWith(r + "/"))) return null;

  const handleSupport = () => {
    setOpen(false);
    setShowMiniChat(true); // opens MiniChatWidget with FAQ answers
  };

  const handleActiveChats = () => {
    setOpen(false);
    fetchVendorChats();
    setShowActiveChats(true);
  };

  const handleVendorChatClick = (convo) => {
    setOpen(false);
    markAllSeen([convo]);
    // Open via VendorChatModal (same experience as the main chat window)
    openExistingChat(convo._id, {
      _id: typeof convo.vendorId === 'object' ? convo.vendorId?._id : convo.vendorId,
      name: convo.vendorName || "Vendor",
      serviceType: convo.serviceType,
      approved: convo.chatApproved,
    });
  };


  const handleOpen = () => {
    // Always open the popup — user can resume minimized chat from inside
    if (!open) {
      fetchVendorChats();
      markAllSeen(vendorChats);
    }
    setOpen(!open);
  };

  return (
    <>
      <GlobalStationeryCartDrawer />
      {funCartOpen && <FunCartDrawer onClose={() => setFunCartOpen(false)} />}
      {ghCartOpen && <GiftCartDrawer onClose={() => setGhCartOpen(false)} />}
      <AuthModal
        open={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setPendingCartAction(null); }}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (pendingCartAction === "gh")  setGhCartOpen(true);
          if (pendingCartAction === "fun") setFunCartOpen(true);
          if (pendingCartAction === "st")  openStCart();
          setPendingCartAction(null);
        }}
      />
      {showPayPopup && (
        <>
          <div onClick={() => setShowPayPopup(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1300, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(90vw,360px)", background: "#FFFCF5", borderRadius: 20, zIndex: 1301, padding: "28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: font, textAlign: "center" }}>
            <button onClick={() => setShowPayPopup(false)} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(155,116,80,0.12)", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Ready to book?</h3>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 24px", lineHeight: 1.5 }}>Head to Review & Pay to confirm your booking, or keep exploring.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setShowPayPopup(false); router.navigate("/booking/review"); }}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(44,26,14,0.3)" }}>
                Continue to Booking →
              </button>
              <button onClick={() => setShowPayPopup(false)}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                Book Other Things
              </button>
            </div>
          </div>
        </>
      )}
      {showMiniChat && <MiniChatWidget onClose={() => setShowMiniChat(false)} />}

      {isCompareModalOpen && (
        <CompareModal
          open={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          vendors={compareSelected.filter(v => activeCompare.includes(v._id))}
        />
      )}

      {/* ── Active Chats panel — same size as VendorChatModal ── */}
      {showActiveChats && (
        <>
          <div onClick={() => { setShowActiveChats(false); setRejectedPanel(null); setRejectedPanelLoading(false); setRejectedQv(null); }} style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.38)", backdropFilter: "blur(2px)" }} />
          <div
            onClick={e => e.stopPropagation()}
            className="active-chats-modal"
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              zIndex: 100001, width: "min(94vw,660px)", height: "min(86vh,700px)",
              background: "#FFFCF5", borderRadius: 24,
              boxShadow: "0 32px 80px rgba(44,26,14,0.22)",
              border: "1.5px solid rgba(196,122,46,0.18)",
              display: "flex", flexDirection: "column", fontFamily: font, overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 800, color: "#fff" }}>💬 Active Chats</div>
              <button onClick={() => { setShowActiveChats(false); setRejectedPanel(null); setRejectedPanelLoading(false); setRejectedQv(null); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Chat list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {(() => {
                // Merge minimized chat into list if not yet returned by API
                const minimizedVendorId = chatState?.vendor?._id;
                const alreadyInList = minimizedVendorId && vendorChats.some(c => {
                  const cvid = typeof c.vendorId === 'object' ? c.vendorId?._id : c.vendorId;
                  return String(cvid) === String(minimizedVendorId);
                });
                const displayChats = (!alreadyInList && chatState?.vendor && !chatState.isConcierge)
                  ? [{ _id: chatState.conversationId || `syn-${minimizedVendorId}`, vendorId: minimizedVendorId, vendorName: chatState.vendor.name, serviceType: chatState.vendor.serviceType, chatApproved: false, chatType: "vendor", _synthetic: true }, ...vendorChats]
                  : vendorChats;
                if (displayChats.length === 0) return (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No active chats</div>
                    <div style={{ fontSize: 13, color: "#9B7450" }}>Start a chat from any vendor profile.</div>
                  </div>
                );
                return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {displayChats.map(convo => (
                    <div
                      key={convo._id}
                      onClick={() => {
                        if (convo.chatRejected) {
                          setRejectedPanel(null);
                          setRejectedPanelLoading(true);
                          fetch(`${BASE_URL}/conversations/${convo._id}/alternatives`, {
                            headers: { Authorization: `Bearer ${token}` },
                            credentials: "include",
                          })
                            .then(r => r.ok ? r.json() : { vendors: [], serviceType: convo.serviceType || '', eventDetails: {} })
                            .then(data => {
                              setRejectedPanel({ convo, vendors: data.vendors || [], serviceType: data.serviceType || convo.serviceType || '', eventDetails: data.eventDetails || {} });
                              setRejectedPanelLoading(false);
                            })
                            .catch(() => {
                              setRejectedPanel({ convo, vendors: [], serviceType: convo.serviceType || '', eventDetails: {} });
                              setRejectedPanelLoading(false);
                            });
                          return;
                        }
                        setShowActiveChats(false);
                        if (convo.chatType === "concierge" || convo.chatType === "support") {
                          openConciergeChat(convo._id);
                          setTimeout(() => {
                            document.dispatchEvent(new CustomEvent("tendr:set-from-active-chats"));
                          }, 50);
                        } else if (convo._synthetic && String(convo._id).startsWith('syn-')) {
                          expandChat();
                        } else {
                          openExistingChat(convo._id, {
                            _id: typeof convo.vendorId === 'object' ? convo.vendorId?._id : convo.vendorId,
                            name: convo.vendorName || "Vendor",
                            serviceType: convo.serviceType,
                            approved: convo.chatApproved,
                            fromActiveChats: true,
                          });
                        }
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: convo.chatRejected ? "1.5px solid rgba(220,38,38,0.25)" : "1.5px solid rgba(196,122,46,0.15)", background: convo.chatRejected ? "rgba(254,242,242,0.7)" : "#fff", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = convo.chatRejected ? "rgba(254,226,226,0.9)" : "rgba(196,122,46,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = convo.chatRejected ? "rgba(254,242,242,0.7)" : "#fff")}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: convo.chatRejected ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, fontWeight: 800, flexShrink: 0 }}>
                        {(convo.vendorName || "V")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.vendorName || (convo.chatType === "concierge" ? "Tendr Concierge" : "Vendor")}</div>
                        <div style={{ fontSize: 12, color: convo.chatRejected ? "#dc2626" : "#9B7450" }}>{convo.chatRejected ? "Vendor not available — see alternatives →" : (convo.serviceType || (convo.chatType === "concierge" ? "Concierge" : "Chat"))}</div>
                      </div>
                      {convo.chatRejected ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 20, padding: "2px 8px", flexShrink: 0 }}>Rejected</span>
                      ) : convo.chatApproved ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", flexShrink: 0 }}>Active →</span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#b45309", background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.2)", borderRadius: 20, padding: "2px 8px", flexShrink: 0 }}>Pending</span>
                      )}
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* ── Rejected-chat alternatives panel ── */}
      {(rejectedPanel || rejectedPanelLoading) && (
        <>
          <div onClick={() => { setRejectedPanel(null); setRejectedPanelLoading(false); setRejectedQv(null); }} style={{ position: "fixed", inset: 0, zIndex: 100002, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(2px)" }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              zIndex: 100003, width: "min(94vw,600px)", maxHeight: "min(88vh,680px)",
              background: "#FFFCF5", borderRadius: 24,
              boxShadow: "0 32px 80px rgba(44,26,14,0.24)",
              border: "1.5px solid rgba(220,38,38,0.2)",
              display: "flex", flexDirection: "column", fontFamily: font, overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#7f1d1d,#b91c1c)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 22 }}>😔</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Your vendor is busy</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{rejectedPanel?.convo?.vendorName} is not available for your date</div>
              </div>
              <button onClick={() => { setRejectedPanel(null); setRejectedPanelLoading(false); setRejectedQv(null); }} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {rejectedPanelLoading ? (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                  <div style={{ fontSize: 14, color: "#9B7450" }}>Finding perfect alternatives for you...</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>Below are perfect options for you</div>
                  <div style={{ fontSize: 13, color: "#9B7450", marginBottom: 18 }}>
                    These {rejectedPanel?.serviceType} vendors are available and match your needs.
                  </div>

                  {(!rejectedPanel?.vendors || rejectedPanel.vendors.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "32px 20px", background: "rgba(196,122,46,0.06)", borderRadius: 16 }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontSize: 14, color: "#2C1A0E", fontWeight: 600, marginBottom: 4 }}>No alternatives found right now</div>
                      <div style={{ fontSize: 13, color: "#9B7450", marginBottom: 16 }}>Browse all vendors on the listings page</div>
                      <button
                        onClick={() => { setRejectedPanel(null); setRejectedPanelLoading(false); router.navigate(`/listings${rejectedPanel?.serviceType ? `?serviceType=${encodeURIComponent(rejectedPanel.serviceType)}` : ''}`); }}
                        style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: font }}
                      >See all vendors →</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                        {rejectedPanel.vendors.map(v => {
                          const photo = (v.portfolioPhotos && v.portfolioPhotos[0]) || v.image || null;
                          const location = (v.locations && v.locations[0]) || v.city || '';
                          return (
                            <div
                              key={v._id}
                              style={{ display: "flex", gap: 14, padding: "14px", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.18)", background: "#fff", boxShadow: "0 2px 10px rgba(44,26,14,0.06)", cursor: "pointer", transition: "box-shadow 0.15s" }}
                              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.18)")}
                              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(44,26,14,0.06)")}
                              onClick={() => setRejectedQv(v)}
                            >
                              {photo ? (
                                <img src={photo} alt={v.name} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: 72, height: 72, borderRadius: 12, background: "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎪</div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{v.name}</div>
                                  {v.isTopRated && <span style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 8, padding: "1px 6px" }}>⭐ Top Rated</span>}
                                </div>
                                <div style={{ fontSize: 12, color: "#C47A2E", fontWeight: 600, marginBottom: 3 }}>{v.serviceType}</div>
                                {location && <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 3 }}>📍 {location}</div>}
                                {v.startingPrice > 0 && <div style={{ fontSize: 12, color: "#5a3a1a" }}>From ₹{v.startingPrice.toLocaleString("en-IN")}</div>}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setRejectedQv(v); }}
                                  style={{ padding: "7px 14px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}
                                >View →</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => { setRejectedPanel(null); setRejectedPanelLoading(false); router.navigate(`/listings${rejectedPanel?.serviceType ? `?serviceType=${encodeURIComponent(rejectedPanel.serviceType)}` : ''}`); }}
                        style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: font }}
                      >See all {rejectedPanel?.serviceType} vendors →</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Rejected vendor quick-view side panel ── */}
      {rejectedQv && (
        <>
          <div onClick={() => setRejectedQv(null)} style={{ position: "fixed", inset: 0, zIndex: 100004, background: "rgba(0,0,0,0.35)" }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 100005,
              width: "min(92vw,420px)", background: "#FFFCF5",
              boxShadow: "-12px 0 48px rgba(44,26,14,0.2)",
              display: "flex", flexDirection: "column", fontFamily: font, overflowY: "auto",
            }}
          >
            {/* Vendor photo */}
            {(() => {
              const photo = (rejectedQv.portfolioPhotos && rejectedQv.portfolioPhotos[0]) || rejectedQv.image || null;
              return photo ? (
                <img src={photo} alt={rejectedQv.name} style={{ width: "100%", height: 200, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, flexShrink: 0 }}>🎪</div>
              );
            })()}

            <button onClick={() => setRejectedQv(null)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

            <div style={{ padding: "20px 20px 28px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>{rejectedQv.name}</div>
                  <div style={{ fontSize: 13, color: "#C47A2E", fontWeight: 600 }}>{rejectedQv.serviceType}</div>
                </div>
                {rejectedQv.isTopRated && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "3px 9px" }}>⭐ Top Rated</span>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, marginBottom: 20 }}>
                {((rejectedQv.locations && rejectedQv.locations[0]) || rejectedQv.city) && (
                  <div style={{ fontSize: 13, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 8, padding: "5px 10px" }}>📍 {(rejectedQv.locations && rejectedQv.locations[0]) || rejectedQv.city}</div>
                )}
                {rejectedQv.startingPrice > 0 && (
                  <div style={{ fontSize: 13, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 8, padding: "5px 10px" }}>💰 From ₹{rejectedQv.startingPrice.toLocaleString("en-IN")}</div>
                )}
                {rejectedQv.yearsOfExperience > 0 && (
                  <div style={{ fontSize: 13, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 8, padding: "5px 10px" }}>🏆 {rejectedQv.yearsOfExperience}+ yrs exp</div>
                )}
                {rejectedQv.avgReviewScore > 0 && (
                  <div style={{ fontSize: 13, color: "#5a3a1a", background: "rgba(196,122,46,0.08)", borderRadius: 8, padding: "5px 10px" }}>⭐ {rejectedQv.avgReviewScore.toFixed(1)} rating</div>
                )}
              </div>

              <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 20, lineHeight: 1.6 }}>
                ⚡ Responds in ~3 hours · Free consultation available
              </div>

              <button
                onClick={() => {
                  setRejectedQv(null);
                  setRejectedPanel(null);
                  setRejectedPanelLoading(false);
                  setShowActiveChats(false);
                  // Navigate to vendor profile
                  router.navigate(`/vendor/${rejectedQv._id}`);
                }}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: font, marginBottom: 10 }}
              >
                Send Chat Request →
              </button>
              <button
                onClick={() => setRejectedQv(null)}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: font }}
              >← Back to alternatives</button>
            </div>
          </div>
        </>
      )}

      {/* Hide all floating UI when a cart drawer or quick-view panel is open on mobile */}
      {(funCartOpen || ghCartOpen || anyDrawerOpen) ? null : <>

      {/* Decor Finder chip — above View Chats on Decorator listings */}
      {/* Decor Finder chip disabled
      {showDecorChip && (
        <div style={{
          position: "fixed", bottom: 84, right: 20, zIndex: 900,
          background: "#fff", borderRadius: 14, padding: "10px 14px",
          boxShadow: "0 6px 24px rgba(44,26,14,0.14)",
          border: "1.5px solid rgba(196,122,46,0.2)",
          maxWidth: 240, fontFamily: font,
          animation: "chatPop 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <button
            onClick={() => { setDecorDismissed(true); try { sessionStorage.setItem("tendr_decor_tip_dismissed", "1"); } catch {} }}
            style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", fontSize: 12, color: "#bbb", cursor: "pointer", lineHeight: 1 }}>✕</button>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#2C1A0E", lineHeight: 1.4, marginRight: 14 }}>
            🎨 Not sure what décor you want?
          </div>
          <div style={{ fontSize: 11.5, color: "#9B7450", margin: "3px 0 8px", lineHeight: 1.4 }}>
            Answer 5 questions → get your perfect theme
          </div>
          <button
            onClick={() => { setDecorDismissed(true); try { sessionStorage.setItem("tendr_decor_tip_dismissed", "1"); } catch {}; router.navigate("/decor-finder"); }}
            style={{ width: "100%", padding: "7px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Try Decor Finder →
          </button>
        </div>
      )}
      */}

      {/* ── Backdrop: closes launcher + saved/compare popups on outside tap ── */}
      {(savedOpen || compareOpen || launcherOpen) && (
        <div onClick={() => { setSavedOpen(false); setCompareOpen(false); setLauncherOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 99993 }} />
      )}

      {/* ── Saved / Compare popups (unchanged) ── */}
      {(savedVendors.length > 0 || compareSelected.length > 0 || Object.keys(finalisedVendors).length > 0 || funCartCount > 0 || ghCartCount > 0 || funConfirmed || stCartCount > 0) && (
        <>
          {(savedOpen || compareOpen) && (
            <div style={{ display: "none" }} />
          )}
          {/* Saved popup */}
          {savedOpen && (
            <div className="mobile-saved-popup" style={{ position: "fixed", bottom: 190, right: 12, zIndex: 99996, background: "#FFFCF5", borderRadius: 16, boxShadow: "0 10px 40px rgba(196,122,46,0.22)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "10px", minWidth: 240, maxWidth: 300, fontFamily: font, animation: "chatPop 0.18s ease" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 8px 8px" }}>💛 Saved Vendors</div>
              {savedVendors.map(v => (
                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name || "Vendor"}</div>
                    <div style={{ fontSize: 11, color: "#9B7450" }}>{v.serviceType || ""}{v.city ? ` · ${v.city}` : ""}</div>
                  </div>
                  <button
                    onClick={() => { setSavedOpen(false); router.navigate(`/vendor/${v._id}`); }}
                    style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.35)", background: "rgba(196,122,46,0.06)", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                    View Profile
                  </button>
                  <button onClick={() => removeSaved(v._id)} style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", border: "1.5px solid rgba(192,57,43,0.25)", background: "rgba(192,57,43,0.06)", color: "#c0392b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
          )}
          {/* Compare popup — category dropdown + per-vendor Add/Remove toggle */}
          {compareOpen && (
            <div className="mobile-compare-popup" style={{ position: "fixed", bottom: 190, right: 12, zIndex: 99996, background: "#FFFCF5", borderRadius: 16, boxShadow: "0 10px 40px rgba(196,122,46,0.22)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "12px", minWidth: 280, maxWidth: 320, fontFamily: font, animation: "chatPop 0.18s ease" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 8px 10px" }}>⚖ Compare Vendors</div>
              {compareSelected.length === 0 ? (
                <div style={{ padding: "8px 8px 4px", fontSize: 12, color: "#9B7450", lineHeight: 1.5 }}>Chat with or save vendors to build your compare list.</div>
              ) : (
                <>
                  <div style={{ padding: "0 8px 10px" }}>
                    <select
                      value={compareCategory}
                      onChange={e => { setCompareCategory(e.target.value); setActiveCompare([]); }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: compareCategory ? "#2C1A0E" : "#9B7450", fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer", outline: "none" }}>
                      <option value="">Select a category</option>
                      {[...new Set(compareSelected.map(v => v.serviceType || "Other"))].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {compareCategory && (() => {
                    const vendorsInCat = compareSelected.filter(v => (v.serviceType || "Other") === compareCategory);
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 8px" }}>
                        {vendorsInCat.map(v => {
                          const isActive = activeCompare.includes(v._id);
                          return (
                            <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name || "Vendor"}</div>
                                <div style={{ fontSize: 11, color: "#9B7450" }}>{v.city || ""}</div>
                              </div>
                              <button
                                onClick={() => setActiveCompare(prev => isActive ? prev.filter(id => id !== v._id) : [...prev, v._id])}
                                style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 8, border: `1.5px solid ${isActive ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: isActive ? "rgba(196,122,46,0.1)" : "transparent", color: isActive ? "#C47A2E" : "#9B7450", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                                {isActive ? "✓ Added" : "Add"}
                              </button>
                              <button
                                onClick={() => { dispatch(removeVendorFromCompare(v._id)); setActiveCompare(prev => prev.filter(id => id !== v._id)); }}
                                style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", border: "1.5px solid rgba(192,57,43,0.25)", background: "rgba(192,57,43,0.06)", color: "#c0392b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                ✕
                              </button>
                            </div>
                          );
                        })}
                        {activeCompare.length >= 1 && (
                          <button
                            onClick={() => { setCompareOpen(false); setIsCompareModalOpen(true); }}
                            style={{ marginTop: 6, width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
                            Show Comparison ({activeCompare.length}) →
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}
          {/* ── Launcher stack — expands upward when launcher is tapped ── */}
          {launcherOpen && (
            <div className="launcher-stack">
              {savedVendors.length > 0 && (
                <div className="launcher-saved-btn" style={{ position: "relative" }}>
                  <button className="lstack-btn" onClick={() => { setLauncherOpen(false); setSavedOpen(v => !v); setCompareOpen(false); }}
                    title="Saved Vendors"
                    style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#CCAB4A", boxShadow: "0 4px 14px rgba(44,26,14,0.45)", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#CCAB4A" stroke="#CCAB4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#CCAB4A", color: "#2C1A0E", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{savedVendors.length}</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); const list = []; try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {} setSavedVendors(list); window.dispatchEvent(new CustomEvent("tendr:saved-vendors-changed")); setSavedOpen(false); }}
                    style={{ position: "absolute", top: -4, left: -4, width: 18, height: 18, borderRadius: "50%", border: "2px solid #fff", background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              )}
              {compareSelected.length > 0 && (
                <div className={`launcher-compare-btn${newlyAdded === 'compare' ? ' lstack-new-item' : ''}`} style={{ position: "relative" }}>
                  <button className="lstack-btn" onClick={() => { setLauncherOpen(false); const opening = !compareOpen; setCompareOpen(v => !v); setSavedOpen(false); if (opening) { setCompareCategory(""); setActiveCompare([]); } }}
                    title="Compare Vendors"
                    style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 14px rgba(196,122,46,0.4)", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#2C1A0E", color: "#CCAB4A", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{compareSelected.length}</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); dispatch(clearVendorCompare()); setCompareOpen(false); setCompareCategory(""); setActiveCompare([]); }}
                    style={{ position: "absolute", top: -4, left: -4, width: 18, height: 18, borderRadius: "50%", border: "2px solid #fff", background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              )}
              {funCartCount > 0 && !funConfirmed && (
                <div className={newlyAdded === 'fun' ? 'lstack-new-item' : ''} style={{ position: "relative" }}>
                  <button className="lstack-btn" onClick={() => { setLauncherOpen(false); if (!token) { setPendingCartAction("fun"); setAuthModalOpen(true); } else { setFunCartOpen(true); } }}
                    title="Fun Activities Cart"
                    style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#CCAB4A", boxShadow: "0 4px 14px rgba(44,26,14,0.45)", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCAB4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#5b21b6", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{funCartCount}</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); dispatch(clearFunCart()); dispatch(setFunConfirmed(false)); }}
                    style={{ position: "absolute", top: -4, left: -4, width: 18, height: 18, borderRadius: "50%", border: "2px solid #fff", background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              )}
              {ghCartCount > 0 && !ghConfirmed && (
                <div style={{ position: "relative" }}>
                  <button className="lstack-btn" onClick={() => { setLauncherOpen(false); if (!token) { setPendingCartAction("gh"); setAuthModalOpen(true); } else { setGhCartOpen(true); } }}
                    title="Gift Hampers Cart"
                    style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 14px rgba(196,122,46,0.45)", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                    <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#2C1A0E", color: "#CCAB4A", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{ghCartCount}</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); dispatch(clearGhCart()); dispatch(setGhConfirmed(false)); }}
                    style={{ position: "absolute", top: -4, left: -4, width: 18, height: 18, borderRadius: "50%", border: "2px solid #fff", background: "#c0392b", color: "#fff", fontSize: 9, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              )}
              {stCartCount > 0 && !stConfirmed && (
                <div className={newlyAdded === 'st' ? 'lstack-new-item' : ''} style={{ position: "relative" }}>
                  <button className="lstack-btn" onClick={() => { setLauncherOpen(false); if (!token) { setPendingCartAction("st"); setAuthModalOpen(true); } else { openStCart(); } }}
                    title="Stationery Cart"
                    style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7A3A1E,#C47A2E)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 14px rgba(122,58,30,0.5)", flexShrink: 0, fontSize: 20 }}>
                    💒
                    <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#C47A2E", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{stCartCount}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Launcher FAB — saved/compare/cart cluster, shown on both mobile and desktop ── */}
      {(() => {
        const hasCartItems = (funCartCount > 0 && !funConfirmed) || (ghCartCount > 0 && !ghConfirmed) || (stCartCount > 0 && !stConfirmed);
        const hasOtherItems = savedVendors.length > 0 || compareSelected.length > 0;
        if (!hasCartItems && !hasOtherItems) return null;
        const count = [savedVendors.length > 0, compareSelected.length > 0, funCartCount > 0 && !funConfirmed, ghCartCount > 0 && !ghConfirmed, stCartCount > 0 && !stConfirmed].filter(Boolean).length;
        const hasSaved = savedVendors.length > 0;
        const hasCompare = compareSelected.length > 0;
        const handleLauncherClick = () => {
          // If only one item type exists, skip the stack and open that popup directly
          if (hasCompare && !hasSaved && !hasCartItems) {
            setCompareCategory(""); setActiveCompare([]);
            setCompareOpen(v => !v); setSavedOpen(false); setLauncherOpen(false);
            return;
          }
          if (hasSaved && !hasCompare && !hasCartItems) {
            setSavedOpen(v => !v); setCompareOpen(false); setLauncherOpen(false);
            return;
          }
          setLauncherOpen(v => !v);
        };
        return (
          <button
            className="launcher-fab"
            onClick={handleLauncherClick}
            aria-label="Open activity tray"
            title="Your activity"
          >
            <img src={tendrLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }} />
            <span className="launcher-badge">{count}</span>
          </button>
        );
      })()}

      {/* ── Chat-row-left: Pay + Gift FAB — horizontal row to the left of chat button ── */}
      {((path !== "/booking/review" && Object.keys(finalisedVendors).length > 0) || ghConfirmed || stConfirmed || funConfirmed) && (
        <div className="chat-row-left">
          {path !== "/booking/review" && Object.keys(finalisedVendors).length > 0 && (
            <button
              onClick={() => setShowPayPopup(true)}
              title="Review & Pay"
              style={{ position: "relative", borderRadius: 100, padding: "0 16px", height: 44, width: "auto", minWidth: 54, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#CCAB4A", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", boxShadow: "0 4px 14px rgba(44,26,14,0.35)", flexShrink: 0, fontFamily: font }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
            >
              Pay
            </button>
          )}
          {(ghConfirmed || stConfirmed || funConfirmed) && (
            <button
              onClick={() => setAddOnsOpen(true)}
              aria-label="View Add-on Orders"
              title="View your add-on orders"
              style={{ position: "relative", width: 50, height: 50, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontFamily: font, cursor: "pointer", boxShadow: "0 6px 24px rgba(196,122,46,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(196,122,46,0.65)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.55)"; }}
            >
              🎁
              <span style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: "#2C1A0E", color: "#CCAB4A", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #fff" }}>
                {(ghConfirmed ? 1 : 0) + (stConfirmed ? 1 : 0) + (funConfirmed ? 1 : 0)}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Add-ons panel */}
      {addOnsOpen && (() => {
        const buildWaMsg = () => {
          const lines = ["🌸 *Order Summary — Tendr*", ""];
          if (ghConfirmed && ghCartItems.length > 0) {
            lines.push("🎁 *GIFT HAMPERS*");
            ghCartItems.forEach(item => {
              lines.push(`• ${item.name} × ${item.quantity} — ₹${item.subtotal.toLocaleString("en-IN")}`);
            });
            const total = ghCartItems.reduce((s, i) => s + i.subtotal, 0);
            lines.push(`*Total: ₹${total.toLocaleString("en-IN")}*`);
            if (ghDeliveryForm) {
              lines.push("");
              lines.push("*Delivery Details:*");
              if (ghDeliveryForm.name)         lines.push(`👤 ${ghDeliveryForm.name}`);
              if (ghDeliveryForm.phone)        lines.push(`📞 ${ghDeliveryForm.phone}`);
              if (ghDeliveryForm.address)      lines.push(`📦 ${ghDeliveryForm.address}${ghDeliveryForm.city ? `, ${ghDeliveryForm.city}` : ""}${ghDeliveryForm.pincode ? ` - ${ghDeliveryForm.pincode}` : ""}`);
              if (ghDeliveryForm.deliveryDate) lines.push(`🗓 Delivery Date: ${ghDeliveryForm.deliveryDate}`);
              if (ghDeliveryForm.instructions) lines.push(`📝 ${ghDeliveryForm.instructions}`);
            }
            lines.push("");
          }
          if (stConfirmed && stCartSnapshot.length > 0) {
            lines.push("💒 *WEDDING STATIONERY*");
            stCartSnapshot.forEach(({ item, quantity }, i) => {
              const price = item.priceOnRequest ? "Price on request" : item.priceRange || (item.startingPrice ? `₹${(item.startingPrice * quantity).toLocaleString("en-IN")}` : "—");
              lines.push(`${i + 1}. ${item.name} × ${quantity} ${item.unit || "pcs"} — ${price}`);
            });
            if (stForm) {
              lines.push("");
              lines.push("*Event Details:*");
              if (stForm.name)    lines.push(`👤 ${stForm.name}`);
              if (stForm.phone)   lines.push(`📞 ${stForm.phone}`);
              if (stForm.address) lines.push(`📍 ${stForm.address}`);
              if (stForm.date)    lines.push(`📅 Event Date: ${stForm.date}`);
            }
            lines.push("");
          }
          if (funConfirmed && faItems.length > 0) {
            lines.push("🎭 *FUN ACTIVITIES*");
            faItems.forEach((item, i) => {
              lines.push(`${i + 1}. ${item.emoji || ""} ${item.name}${item.totalPrice ? ` — ₹${Number(item.totalPrice).toLocaleString("en-IN")}` : ""}`);
              if (item.form) {
                if (item.form.eventType) lines.push(`   Event: ${item.form.eventType}`);
                if (item.form.date)      lines.push(`   📅 ${item.form.date}${item.form.time ? ` · ⏰ ${item.form.time}` : ""}`);
                if (item.form.address)   lines.push(`   📍 ${item.form.address}`);
                if (item.form.guests)    lines.push(`   👥 ${item.form.guests} guests`);
                if (item.form.name)      lines.push(`   👤 ${item.form.name}${item.form.phone ? ` · ${item.form.phone}` : ""}`);
                if (item.form.notes)     lines.push(`   📝 ${item.form.notes}`);
              }
            });
            if (faTotal > 0) lines.push(`*Total: ₹${faTotal.toLocaleString("en-IN")}*`);
            lines.push("");
          }
          lines.push("📌 *Note:* Design prices shown. Final pricing will be confirmed by Tendr team.");
          lines.push("");
          lines.push("_Sent via tendr.co.in_");
          return lines.join("\n");
        };

        const handleProceedWhatsApp = () => {
          const url = `https://wa.me/919211668427?text=${encodeURIComponent(buildWaMsg())}`;
          window.open(url, "_blank");
          dispatch(clearGhCart());
          dispatch(clearStBooking());
          dispatch(clearFunCart());
          dispatch(setFunConfirmed(false));
          setAddOnsOpen(false);
        };

        return (
          <>
            <div onClick={() => setAddOnsOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100000, backdropFilter: "blur(3px)" }} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(82vw,420px)", background: "#FFFCF5", zIndex: 100001, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", fontFamily: font, animation: "chatPop 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setAddOnsOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 2px" }}>🎁 Your Orders</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: 0 }}>Review and send to Tendr on WhatsApp</p>
                  </div>
                </div>
                <button onClick={() => setAddOnsOpen(false)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", fontSize: 18, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {/* Gift Hampers section */}
                {ghConfirmed && ghCartItems.length > 0 && (
                  <div style={{ marginBottom: 20, padding: 16, background: "rgba(196,122,46,0.06)", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>🎁 Gift Hampers</div>
                    {ghCartItems.map(item => (
                      <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a3a1a", marginBottom: 6 }}>
                        <span style={{ flex: 1 }}>{item.name} × {item.quantity}</span>
                        <span style={{ fontWeight: 700, color: "#2C1A0E" }}>₹{item.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>
                      <span>Total</span>
                      <span>₹{ghCartItems.reduce((s, i) => s + i.subtotal, 0).toLocaleString("en-IN")}</span>
                    </div>
                    {ghDeliveryForm && (
                      <div style={{ marginTop: 10, fontSize: 12, color: "#9B7450", background: "#fff", borderRadius: 8, padding: "8px 12px", lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 700, color: "#5a3a1a", marginBottom: 4 }}>Delivery Details</div>
                        {ghDeliveryForm.name && <div>👤 {ghDeliveryForm.name}</div>}
                        {ghDeliveryForm.phone && <div>📞 {ghDeliveryForm.phone}</div>}
                        {ghDeliveryForm.address && <div>📦 {ghDeliveryForm.address}{ghDeliveryForm.city ? `, ${ghDeliveryForm.city}` : ""}</div>}
                        {ghDeliveryForm.deliveryDate && <div>🗓 {ghDeliveryForm.deliveryDate}</div>}
                        {ghDeliveryForm.instructions && <div>📝 {ghDeliveryForm.instructions}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Stationery section */}
                {stConfirmed && stCartSnapshot.length > 0 && (
                  <div style={{ marginBottom: 20, padding: 16, background: "rgba(122,58,30,0.06)", borderRadius: 14, border: "1.5px solid rgba(122,58,30,0.15)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#7A3A1E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>💒 Wedding Stationery</div>
                    {stCartSnapshot.map(({ item, quantity }) => (
                      <div key={item._id || item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5a3a1a", marginBottom: 6 }}>
                        <span style={{ flex: 1 }}>{item.name} × {quantity} {item.unit || "pcs"}</span>
                        <span style={{ fontWeight: 700, color: "#C47A2E" }}>
                          {item.priceOnRequest ? "On request" : item.priceRange || (item.startingPrice ? `₹${(item.startingPrice * quantity).toLocaleString("en-IN")}` : "—")}
                        </span>
                      </div>
                    ))}
                    {stForm && (
                      <div style={{ marginTop: 10, fontSize: 12, color: "#9B7450", background: "#fff", borderRadius: 8, padding: "8px 12px", lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 700, color: "#5a3a1a", marginBottom: 4 }}>Event Details</div>
                        {stForm.name && <div>👤 {stForm.name}</div>}
                        {stForm.phone && <div>📞 {stForm.phone}</div>}
                        {stForm.address && <div>📍 {stForm.address}</div>}
                        {stForm.date && <div>📅 {stForm.date}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Fun Activities section */}
                {funConfirmed && faItems.length > 0 && (
                  <div style={{ marginBottom: 20, padding: 16, background: "rgba(91,33,182,0.05)", borderRadius: 14, border: "1.5px solid rgba(91,33,182,0.15)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#5b21b6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>🎭 Fun Activities</div>
                    {faItems.map((item, idx) => (
                      <div key={item.id || idx} style={{ marginBottom: idx < faItems.length - 1 ? 12 : 0, paddingBottom: idx < faItems.length - 1 ? 12 : 0, borderBottom: idx < faItems.length - 1 ? "1px solid rgba(91,33,182,0.1)" : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{item.emoji} {item.name}</span>
                          {item.totalPrice > 0 && <span style={{ fontSize: 13, fontWeight: 800, color: "#5b21b6" }}>₹{Number(item.totalPrice).toLocaleString("en-IN")}</span>}
                        </div>
                        {item.form && (
                          <div style={{ fontSize: 12, color: "#9B7450", background: "#fff", borderRadius: 8, padding: "6px 10px", lineHeight: 1.6 }}>
                            {item.form.eventType && <div>🎉 {item.form.eventType}</div>}
                            {item.form.date && <div>📅 {item.form.date}{item.form.time ? ` · ⏰ ${item.form.time}` : ""}</div>}
                            {item.form.address && <div>📍 {item.form.address}</div>}
                            {item.form.guests && <div>👥 {item.form.guests} guests</div>}
                            {item.form.name && <div>👤 {item.form.name}{item.form.phone ? ` · ${item.form.phone}` : ""}</div>}
                            {item.form.notes && <div>📝 {item.form.notes}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                    {faTotal > 0 && faItems.length > 1 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: "#5b21b6", borderTop: "1px solid rgba(91,33,182,0.15)", paddingTop: 8, marginTop: 8 }}>
                        <span>Activities Total</span>
                        <span>₹{faTotal.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed bottom — Proceed on WhatsApp */}
              <div style={{ padding: "16px 24px", paddingBottom: "max(16px, calc(env(safe-area-inset-bottom, 0px) + 70px))", borderTop: "1.5px solid rgba(196,122,46,0.15)", background: "#FFFCF5", flexShrink: 0 }}>
                <button
                  onClick={handleProceedWhatsApp}
                  style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(37,211,102,0.4)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Proceed on WhatsApp
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Chat"
        className="floating-chat-btn"
        style={{
          position: "fixed",
          bottom: "calc(22px + env(safe-area-inset-bottom, 0px))",
          right: 20,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRadius: 100,
          border: "none",
          background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
          color: "#fff",
          fontFamily: font,
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(196,122,46,0.5)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(196,122,46,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.5)";
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="chat-btn-text">View Chats</span>
        {/* Minimized vendor chat indicator */}
        {hasMinimizedChat && (
          <span style={{
            position: "absolute",
            top: -5,
            right: -5,
            minWidth: 20,
            height: 20,
            borderRadius: "50%",
            background: "#22c55e",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2.5px solid #fff",
            animation: "chat-pulse 1.4s infinite",
          }}>
            💬
          </span>
        )}
        {!hasMinimizedChat && unseenCount > 0 && (
          <span style={{
            position: "absolute",
            top: -6,
            right: -6,
            minWidth: 20,
            height: 20,
            borderRadius: "50%",
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2.5px solid #fff",
            padding: "0 4px",
            animation: "unseen-pulse 1.2s ease-in-out infinite",
          }}>
            {unseenCount}
          </span>
        )}
      </button>
      <style>{`
        .floating-chat-btn {
          padding: 13px 22px;
          bottom: calc(22px + env(safe-area-inset-bottom, 0px));
          right: 20px;
        }
        .chat-btn-text { font-size: 14px; font-weight: 700; }
        .chat-popup { animation: chatPop 0.18s cubic-bezier(0.4,0,0.2,1); }
        @keyframes chatPop {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes chat-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        @keyframes unseen-pulse {
          0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          50%  { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(239,68,68,0); }
          100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes lstack-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes lstack-fly-in {
          0%   { opacity: 0; transform: translateY(80px) scale(0.3); }
          60%  { opacity: 1; transform: translateY(-10px) scale(1.15); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lstack-new-item { animation: lstack-fly-in 0.48s cubic-bezier(0.34,1.56,0.64,1) forwards !important; }
        .vendor-cluster-desktop { display: none !important; }
        .mobile-saved-popup { display: block; }
        .mobile-compare-popup { display: block; }

        /* ── Launcher FAB (wine glass, above chat) ── */
        .launcher-fab {
          position: fixed;
          bottom: calc(82px + env(safe-area-inset-bottom, 0px));
          right: 20px;
          z-index: 99995;
          width: 50px; height: 50px;
          border-radius: 50%;
          border: none; padding: 0;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(44,26,14,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .launcher-fab:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 10px 30px rgba(44,26,14,0.55); }
        .launcher-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px; border-radius: 9px;
          background: #C47A2E; color: #fff;
          font-size: 10px; font-weight: 900; font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px; border: 2px solid #fff;
        }

        /* ── Launcher stack (expands upward) ── */
        .launcher-stack {
          position: fixed;
          bottom: calc(140px + env(safe-area-inset-bottom, 0px));
          right: 20px;
          z-index: 99995;
          display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
        }
        .launcher-stack > * { animation: lstack-pop 0.18s ease forwards; }
        .launcher-stack > *:nth-child(1) { animation-delay: 0s; }
        .launcher-stack > *:nth-child(2) { animation-delay: 0.05s; }
        .launcher-stack > *:nth-child(3) { animation-delay: 0.10s; }
        .launcher-stack > *:nth-child(4) { animation-delay: 0.15s; }
        .launcher-stack > *:nth-child(5) { animation-delay: 0.20s; }
        .lstack-btn { display: flex !important; }
        /* Saved + Compare hidden on desktop ≥1024px (handled by sidebar) */
        @media (min-width: 1024px) { .launcher-saved-btn, .launcher-compare-btn { display: none !important; } }
        /* Desktop: slightly larger stack buttons */
        @media (min-width: 768px) { .lstack-btn { width: 54px !important; height: 54px !important; } }

        /* ── Chat-row-left: Pay + Gift to the LEFT of chat button ── */
        .chat-row-left {
          position: fixed;
          bottom: calc(22px + env(safe-area-inset-bottom, 0px));
          right: 168px;
          z-index: 900;
          display: flex; flex-direction: row; gap: 8px; align-items: center;
        }

        @media (max-width: 767px) {
          .floating-chat-btn {
            bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
            right: 14px !important;
            padding: 12px !important;
            width: 50px !important;
            height: 50px !important;
          }
          .chat-btn-text { display: none; }
          .launcher-fab {
            bottom: calc(138px + env(safe-area-inset-bottom, 0px)) !important;
            right: 14px !important;
            width: 44px !important; height: 44px !important;
          }
          .launcher-stack {
            bottom: calc(192px + env(safe-area-inset-bottom, 0px)) !important;
            right: 14px !important;
          }
          .chat-row-left {
            bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
            right: 72px !important;
          }
          .chat-popup {
            right: 12px !important;
            left: 12px !important;
            min-width: unset !important;
            max-width: unset !important;
            bottom: calc(140px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .mobile-saved-popup, .mobile-compare-popup {
            bottom: calc(260px + env(safe-area-inset-bottom, 0px)) !important;
            right: 12px !important;
            left: 12px !important;
            max-width: unset !important;
          }
          .active-chats-modal {
            top: calc(50% - 36px) !important;
            height: min(78vh, 640px) !important;
          }
        }
      `}</style>

      {/* Popup menu */}
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 899 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="chat-popup"
            style={{
              position: "fixed",
              bottom: 82,
              right: 20,
              zIndex: 901,
              background: "#FFFCF5",
              borderRadius: 20,
              boxShadow: "0 12px 48px rgba(139,69,19,0.18)",
              border: "1px solid rgba(196,122,46,0.15)",
              padding: 10,
              minWidth: 260,
              maxWidth: 300,
              fontFamily: font,
            }}
          >
            {/* Resume minimized chat — shown at top when a chat is minimized */}
            {hasMinimizedChat && chatState?.vendor && (
              <>
                <button
                  onClick={() => { setOpen(false); expandChat(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "rgba(21,128,61,0.07)", cursor: "pointer", textAlign: "left", fontFamily: font }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(21,128,61,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(21,128,61,0.07)")}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💬</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                      Resume: {chatState.vendor.name || "Chat"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9B7450" }}>Tap to continue your minimized chat</div>
                  </div>
                </button>
                <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 12px" }} />
              </>
            )}


            {/* Active Chats */}
            <button
              onClick={handleActiveChats}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "none", background: "transparent", cursor: "pointer",
                textAlign: "left", fontFamily: font, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>💬</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>Active Chats</div>
                  {vendorChats.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 800, background: "#22c55e", color: "#fff", borderRadius: 100, padding: "1px 7px" }}>{vendorChats.length}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>Vendors · Concierge · All chats</div>
              </div>
            </button>

            <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 12px" }} />

            {/* Tendr Support — FAQ chatbot */}
            <button
              onClick={handleSupport}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "none", background: "transparent", cursor: "pointer",
                textAlign: "left", fontFamily: font, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>🤝</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>Tendr Support</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>Quick answers · FAQ · Help</div>
              </div>
            </button>

          </div>
        </>
      )}
      </> /* end hide-when-drawer-open */}
    </>
  );
}
