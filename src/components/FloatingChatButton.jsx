import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeVendorFromCompare } from "../redux/listingFiltersSlice";
import router from "../router";
import MiniChatWidget from "./MiniChatWidget";
import CompareModal from "./CompareModal";
import { useChatOverlay } from "../context/ChatContext";
import { useStationeryCart } from "../context/StationeryCartContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const SAVED_KEY = "tendr_saved_vendors";
const getSavedVendors = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; } };

export default function FloatingChatButton({ hideOnRoutes = ["/chat", "/chats"] }) {
  const { user, token }      = useSelector((s) => s.auth);
  const selectedCategories   = useSelector((s) => s.eventPlanning.selectedVendors || []);
  const finalisedVendors     = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const compareSelected      = useSelector((s) => s.listingFilters.compareSelected || []);
  const activeServiceType    = useSelector((s) => s.listingFilters.serviceType);
  const dispatch = useDispatch();
  const { chatState, expandChat, openExistingChat, openConciergeChat } = useChatOverlay();
  const { cart: stCart, cartCount: stCartCount, clearCart: clearStCart } = useStationeryCart();
  const hasMinimizedChat = chatState?.minimized && chatState?.vendor;
  const [open, setOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareCategory, setCompareCategory] = useState("");
  const [activeCompare, setActiveCompare] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [showMiniChat, setShowMiniChat] = useState(false);
  const [showActiveChats, setShowActiveChats] = useState(false);
  const [vendorChats, setVendorChats] = useState([]);
  const [savedVendors, setSavedVendors] = useState(() => getSavedVendors());
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

  const unseenCount = vendorChats.filter(c => !seenIds.has(c._id)).length;
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
    });
    return unsub;
  }, []);

  // Refresh saved vendors when listing page saves/unsaves
  useEffect(() => {
    const refresh = () => setSavedVendors(getSavedVendors());
    window.addEventListener("tendr:saved-vendors-changed", refresh);
    // Also poll on storage events (cross-tab)
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("tendr:saved-vendors-changed", refresh); window.removeEventListener("storage", refresh); };
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
          (c) => !c.chatRejected && c.chatType !== undefined && c.chatType !== "support"
        );
        setVendorChats(active);
      })
      .catch(() => {});
  }, [token, user?._id]);

  useEffect(() => { fetchVendorChats(); }, [fetchVendorChats]);

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

  // Listen for VendorChatModal "back to active chats" event
  useEffect(() => {
    const handler = () => setShowActiveChats(true);
    document.addEventListener("tendr:open-active-chats", handler);
    return () => document.removeEventListener("tendr:open-active-chats", handler);
  }, []);

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
          <div onClick={() => setShowActiveChats(false)} style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.38)", backdropFilter: "blur(2px)" }} />
          <div
            onClick={e => e.stopPropagation()}
            className="active-chats-modal"
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              zIndex: 1201, width: "min(94vw,660px)", height: "min(86vh,700px)",
              background: "#FFFCF5", borderRadius: 24,
              boxShadow: "0 32px 80px rgba(44,26,14,0.22)",
              border: "1.5px solid rgba(196,122,46,0.18)",
              display: "flex", flexDirection: "column", fontFamily: font, overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 800, color: "#fff" }}>💬 Active Chats</div>
              <button onClick={() => setShowActiveChats(false)} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
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
                const displayChats = (!alreadyInList && chatState?.vendor && !chatState.isConcierge && chatState?.conversationId)
                  ? [{ _id: chatState.conversationId, vendorId: minimizedVendorId, vendorName: chatState.vendor.name, serviceType: chatState.vendor.serviceType, chatApproved: false, chatType: "VENDOR", _synthetic: true }, ...vendorChats]
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
                        setShowActiveChats(false);
                        if (convo.chatType === "concierge" || convo.chatType === "support") {
                          // Open concierge chat with back-to-chats flag
                          openConciergeChat(convo._id);
                          // Dispatch custom event so back button works
                          setTimeout(() => {
                            document.dispatchEvent(new CustomEvent("tendr:set-from-active-chats"));
                          }, 50);
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
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, fontWeight: 800, flexShrink: 0 }}>
                        {(convo.vendorName || "V")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.vendorName || (convo.chatType === "support" ? "Support" : convo.chatType === "concierge" ? "Tendr Concierge" : "Vendor")}</div>
                        <div style={{ fontSize: 12, color: "#9B7450" }}>{convo.serviceType || (convo.chatType === "support" ? "Support Chat" : convo.chatType === "concierge" ? "Concierge" : "Chat")}</div>
                      </div>
                      {convo.chatApproved ? (
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

      {/* Decor Finder chip — above View Chats on Decorator listings */}
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

      {/* Mobile action stack — Saved / Compare / Review & Pay — above chat button */}
      {(savedVendors.length > 0 || compareSelected.length > 0 || Object.keys(finalisedVendors).length > 0) && (
        <>
          {(savedOpen || compareOpen) && (
            <div onClick={() => { setSavedOpen(false); setCompareOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 897 }} />
          )}
          {/* Saved popup */}
          {savedOpen && (
            <div className="mobile-saved-popup" style={{ position: "fixed", bottom: 190, right: 12, zIndex: 901, background: "#FFFCF5", borderRadius: 16, boxShadow: "0 10px 40px rgba(196,122,46,0.22)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "10px", minWidth: 240, maxWidth: 300, fontFamily: font, animation: "chatPop 0.18s ease" }}>
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
            <div className="mobile-compare-popup" style={{ position: "fixed", bottom: 190, right: 12, zIndex: 901, background: "#FFFCF5", borderRadius: 16, boxShadow: "0 10px 40px rgba(196,122,46,0.22)", border: "1.5px solid rgba(196,122,46,0.18)", padding: "12px", minWidth: 280, maxWidth: 320, fontFamily: font, animation: "chatPop 0.18s ease" }}>
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
          {/* Button stack — column-reverse so Saved is visual-bottom (closest to chat) */}
          <div className="mobile-action-stack">
            {savedVendors.length > 0 && (
              <button className="mobile-action-btn" onClick={() => { setSavedOpen(v => !v); setCompareOpen(false); }}
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#be185d,#ec4899)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", boxShadow: "0 4px 14px rgba(190,24,93,0.35)", flexShrink: 0 }}>
                ♥
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#9d174d", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{savedVendors.length}</span>
              </button>
            )}
            {compareSelected.length > 0 && (
              <button className="mobile-action-btn" onClick={() => { const opening = !compareOpen; setCompareOpen(v => !v); setSavedOpen(false); if (opening) { setCompareCategory(""); setActiveCompare([]); } }}
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fff", boxShadow: "0 4px 14px rgba(196,122,46,0.4)", flexShrink: 0 }}>
                ⚖
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#2C1A0E", color: "#CCAB4A", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{compareSelected.length}</span>
              </button>
            )}
            {Object.keys(finalisedVendors).length > 0 && (
              <button className="mobile-action-btn" onClick={() => router.navigate("/booking/review")}
                style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#CCAB4A", boxShadow: "0 4px 14px rgba(44,26,14,0.35)", flexShrink: 0 }}>
                ✅
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: "#C47A2E", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{Object.keys(finalisedVendors).length}</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Stationery cart button — left of chat button, appears on all pages */}
      {stCartCount > 0 && (
        <button
          className="stat-cart-fab"
          onClick={() => path === "/stationery"
            ? document.dispatchEvent(new CustomEvent("tendr:open-stationery-cart"))
            : router.navigate("/stationery")
          }
          aria-label="Stationery Cart"
          title={`${stCartCount} stationery item${stCartCount > 1 ? "s" : ""} in cart`}
          style={{
            position: "fixed",
            bottom: 22,
            zIndex: 900,
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg,#7A3A1E,#C47A2E)",
            color: "#fff",
            fontFamily: font,
            cursor: "pointer",
            boxShadow: "0 6px 24px rgba(122,58,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
        >
          💒
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9,
            background: "#C47A2E", color: "#fff",
            fontSize: 10, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", border: "2px solid #fff",
          }}>{stCartCount}</span>
        </button>
      )}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Chat"
        className="floating-chat-btn"
        style={{
          position: "fixed",
          bottom: 22,
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
          bottom: 22px;
          right: 20px;
        }
        /* Stationery cart FAB sits to the LEFT of the chat button */
        .stat-cart-fab {
          right: 168px; /* chat btn ~140px wide + 8px gap + 20px from edge */
        }
        .chat-btn-text {
          font-size: 14px;
          font-weight: 700;
        }
        .chat-popup {
          animation: chatPop 0.18s cubic-bezier(0.4,0,0.2,1);
        }
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
        .vendor-cluster-desktop { display: none !important; }
        /* Action stack — above chat FAB on both desktop and mobile */
        .mobile-action-stack { display: flex; position: fixed; bottom: 82px; right: 20px; z-index: 900; flex-direction: column-reverse; gap: 8px; align-items: flex-end; }
        .mobile-action-btn { display: flex !important; }
        .mobile-saved-popup { display: block; }
        .mobile-compare-popup { display: block; }
        @media (max-width: 767px) {
          /* Position above the 60px bottom nav bar */
          .floating-chat-btn {
            bottom: 80px !important;
            right: 14px !important;
            padding: 12px !important;
            width: 50px !important;
            height: 50px !important;
          }
          .mobile-action-stack { bottom: 138px !important; right: 14px !important; }
          .chat-btn-text { display: none; }
          /* Stationery cart button: to the left of chat on mobile, above bottom nav */
          .stat-cart-fab {
            bottom: 80px !important;
            right: 72px !important; /* 14 + 50 + 8 */
          }
          .chat-popup {
            right: 12px !important;
            left: 12px !important;
            min-width: unset !important;
            max-width: unset !important;
            bottom: 140px !important;
          }
          /* Shift Active Chats modal up so it clears the 60px bottom nav */
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
    </>
  );
}
