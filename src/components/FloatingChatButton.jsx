import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import router from "../router";
import MiniChatWidget from "./MiniChatWidget";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

export default function FloatingChatButton({ hideOnRoutes = ["/chat", "/chats"] }) {
  const { user, token } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const [showMiniChat, setShowMiniChat] = useState(false);
  const [vendorChats, setVendorChats] = useState([]);
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
    router.navigate("/chat", {
      state: {
        vendor: {
          _id: convo.vendorId?._id || convo.vendorId,
          name: convo.vendorName || convo.vendorId?.name || "Vendor",
          approved: true,
        },
        from: "vendor",
      },
    });
  };

  const handleBrowseVendors = () => {
    setOpen(false);
    router.navigate("/listings");
  };

  const handleOpen = () => {
    if (!open) fetchVendorChats(); // refresh on every open
    setOpen(!open);
  };

  return (
    <>
      {showMiniChat && <MiniChatWidget onClose={() => setShowMiniChat(false)} />}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Chat"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 20px",
          borderRadius: 100,
          border: "none",
          background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: font,
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(196,122,46,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(196,122,46,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 18px rgba(196,122,46,0.45)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12c0 4.418-4.03 8-9 8-1.071 0-2.097-.162-3.05-.464L3 21l1.55-4.05C4.2 15.97 4 14.999 4 14c0-4.418 4.03-8 9-8s8 3.582 8 6z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Chat
        {vendorChats.length > 0 && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
          }}>
            {vendorChats.length}
          </span>
        )}
      </button>

      {/* Popup menu */}
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 899 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              bottom: 72,
              right: 20,
              zIndex: 901,
              background: "#FFFCF5",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(139,69,19,0.15)",
              border: "1px solid rgba(196,122,46,0.15)",
              padding: 8,
              minWidth: 240,
              maxWidth: 280,
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>Browse Vendors</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>Find & chat with vendors</div>
              </div>
            </button>
          </div>
        </>
      )}
    </>
  );
}
