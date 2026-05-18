import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import router from "../router";
import MiniChatWidget from "./MiniChatWidget";
import { useChatOverlay } from "../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

export default function FloatingChatButton({ hideOnRoutes = ["/chat", "/chats"] }) {
  const { user, token } = useSelector((s) => s.auth);
  const { chatState, expandChat, openExistingChat } = useChatOverlay();
  const hasMinimizedChat = chatState?.minimized && chatState?.vendor;
  const [open, setOpen] = useState(false);
  const [showMiniChat, setShowMiniChat] = useState(false);
  const [activeVendorChat, setActiveVendorChat] = useState(null);
  const [vendorChats, setVendorChats] = useState([]);
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
  const [path, setPath] = useState(() => router.state.location.pathname);

  // Track route changes in the SPA
  useEffect(() => {
    const unsub = router.subscribe((state) => {
      setPath(state.location.pathname);
      setOpen(false);
    });
    return unsub;
  }, []);

  // Fetch approved vendor conversations
  const fetchVendorChats = useCallback(() => {
    if (!token || !user?._id) return;
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : { conversations: [] })
      .then((data) => {
        const approved = (data.conversations || []).filter(
          (c) => c.chatApproved && c.chatType === "vendor"
        );
        setVendorChats(approved);
      })
      .catch(() => {});
  }, [token, user?._id]);

  useEffect(() => { fetchVendorChats(); }, [fetchVendorChats]);

  if (hideOnRoutes.some((r) => path === r || path.startsWith(r + "/"))) return null;

  const handleSupport = () => {
    setOpen(false);
    setShowMiniChat(true);
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

  const handleBrowseVendors = () => {
    setOpen(false);
    // Check if customer has filled the event form — if not, send them to booking flow first
    const state = router.state?.location?.state;
    const reduxState = router.state?.context;
    // Read from localStorage to check if form was filled
    try {
      const filters = JSON.parse(localStorage.getItem("listingFilters") || "{}");
      if (filters.serviceType || filters.eventType) {
        router.navigate("/listings");
        return;
      }
    } catch {}
    // No form filled — direct to booking flow
    router.navigate("/booking");
  };

  const handleOpen = () => {
    // If there's a minimized chat, clicking the bubble re-opens it
    if (hasMinimizedChat) {
      expandChat();
      return;
    }
    if (!open) {
      fetchVendorChats();
      markAllSeen(vendorChats);
    }
    setOpen(!open);
  };

  return (
    <>
      {showMiniChat && <MiniChatWidget onClose={() => setShowMiniChat(false)} />}

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
          position: "fixed",
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
        <span className="chat-btn-text">Chat</span>
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
            top: -5,
            right: -5,
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
            padding: "0 3px",
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
        @media (max-width: 640px) {
          .floating-chat-btn {
            padding: 14px;
            width: 52px;
            height: 52px;
            bottom: 18px;
            right: 16px;
          }
          .chat-btn-text { display: none; }
          .chat-popup {
            right: 12px !important;
            left: 12px !important;
            min-width: unset !important;
            max-width: unset !important;
            bottom: 78px !important;
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
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px 4px" }}>
              Start a Chat
            </p>

            {/* Chat Support */}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>Chat with Tendr</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>Concierge planning support</div>
              </div>
            </button>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 12px" }} />

            {/* Ongoing accepted vendor chats — always shown */}
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 12px 2px" }}>
              Ongoing Chats
            </p>
            {vendorChats.length === 0 ? (
              <p style={{ fontSize: 12, color: "#bbb", padding: "4px 12px 8px", fontFamily: font }}>
                No active vendor chats yet
              </p>
            ) : (
              vendorChats.map((convo) => (
                <button
                  key={convo._id}
                  onClick={() => handleVendorChatClick(convo)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "9px 12px", borderRadius: 10,
                    border: "none", background: "transparent", cursor: "pointer",
                    textAlign: "left", fontFamily: font, transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.07)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(convo.vendorName || "V")[0].toUpperCase()}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {convo.vendorName || "Vendor"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9B7450" }}>{convo.serviceType || "Chat"}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#22c55e", fontWeight: 600, flexShrink: 0 }}>Active</span>
                </button>
              ))
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(196,122,46,0.1)", margin: "4px 12px" }} />

            {/* Browse Vendors — always shown at bottom */}
            <button
              onClick={handleBrowseVendors}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "none", background: "transparent", cursor: "pointer",
                textAlign: "left", fontFamily: font, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>🔍</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>Find Vendors</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>Fill event details, then browse</div>
              </div>
            </button>
          </div>
        </>
      )}
    </>
  );
}
