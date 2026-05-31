import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useChatOverlay } from "../../../context/ChatContext";
import HamburgerNav from "../../../components/HamburgerNav";
import MiniChatWidget from "../../../components/MiniChatWidget";
import PullToRefresh from "../../../components/PullToRefresh";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const CAT_EMOJI = { Photographer: "📸", Caterer: "🍽", Decorator: "🎀", DJ: "🎵", Concierge: "🤝", support: "🛟" };

export default function CustomerChatList() {
  const { token } = useSelector((s) => s.auth);
  const { openExistingChat, openConciergeChat } = useChatOverlay();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  const fetchChats = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : { conversations: [] })
      .then(data => {
        const list = (data.conversations || []).filter(
          c => c.chatApproved &&
            (c.chatType === "vendor" || c.chatType === "concierge" || c.chatType === "support")
        );
        setChats(list);
      })
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  // Re-fetch when coming back from a chat
  useEffect(() => {
    const handler = () => fetchChats();
    document.addEventListener("tendr:open-active-chats", handler);
    return () => document.removeEventListener("tendr:open-active-chats", handler);
  }, [fetchChats]);

  const openChat = (convo) => {
    if (convo.chatType === "concierge" || convo.chatType === "support") {
      openConciergeChat(convo._id);
      setTimeout(() => document.dispatchEvent(new CustomEvent("tendr:set-from-active-chats")), 50);
    } else {
      openExistingChat(convo._id, {
        _id: typeof convo.vendorId === "object" ? convo.vendorId?._id : convo.vendorId,
        name: convo.vendorName || "Vendor",
        serviceType: convo.serviceType,
        approved: convo.chatApproved,
      });
    }
  };

  const vendorChats = chats.filter(c => c.chatType === "vendor");
  const hasPending = vendorChats.some(c => !c.chatApproved);

  return (
    <PullToRefresh onRefresh={fetchChats}>
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <HamburgerNav active="Chats" />
      {showSupport && <MiniChatWidget onClose={() => setShowSupport(false)} />}

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Page title */}
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
          Your Chats
        </h1>
        <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 24px" }}>
          Support · Vendor conversations · Booking updates
        </p>

        {/* ── Tendr Support ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
            Tendr Support
          </p>
          <button
            onClick={() => setShowSupport(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 16,
              background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)",
              boxShadow: "0 2px 12px rgba(196,122,46,0.07)",
              cursor: "pointer", fontFamily: font, textAlign: "left",
              transition: "box-shadow 0.18s",
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg,#2C1A0E,#4A2810)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              🛟
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>Tendr Support</div>
              <div style={{ fontSize: 12, color: "#9B7450" }}>FAQs, booking help, account issues</div>
            </div>
            <span style={{ fontSize: 18, color: "#C47A2E", flexShrink: 0 }}>›</span>
          </button>
        </div>

        {/* ── Active Vendor Chats ── */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
            Active Chats
          </p>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ height: 74, borderRadius: 16, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
              ))}
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          ) : vendorChats.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 24px",
              background: "#fff", borderRadius: 16,
              border: "1.5px solid rgba(196,122,46,0.1)",
              boxShadow: "0 2px 8px rgba(196,122,46,0.05)",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No active chats yet</div>
              <div style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.55 }}>
                Once a vendor approves your chat request, they'll appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vendorChats.map(convo => {
                const emoji = CAT_EMOJI[convo.serviceType] || "🏷";
                const isPending = !convo.chatApproved;
                const hasUnread = convo.unseenByCustomer > 0;

                return (
                  <button
                    key={convo._id}
                    onClick={() => openChat(convo)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 16,
                      background: "#fff",
                      border: `1.5px solid ${hasUnread ? "rgba(196,122,46,0.35)" : "rgba(196,122,46,0.12)"}`,
                      boxShadow: hasUnread ? "0 4px 16px rgba(196,122,46,0.15)" : "0 2px 8px rgba(196,122,46,0.06)",
                      cursor: "pointer", fontFamily: font, textAlign: "left",
                      transition: "all 0.18s",
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                      background: "linear-gradient(135deg,rgba(196,122,46,0.15),rgba(204,171,74,0.1))",
                      border: "1.5px solid rgba(196,122,46,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                      position: "relative",
                    }}>
                      {emoji}
                      {hasUnread && (
                        <div style={{
                          position: "absolute", top: -4, right: -4,
                          width: 18, height: 18, borderRadius: "50%",
                          background: "#C47A2E", border: "2px solid #fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 800, color: "#fff",
                        }}>
                          {convo.unseenByCustomer > 9 ? "9+" : convo.unseenByCustomer}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: hasUnread ? 800 : 600, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {convo.vendorName || "Vendor"}
                        </span>
                        {isPending && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(196,122,46,0.12)", color: "#C47A2E", padding: "2px 6px", borderRadius: 100, flexShrink: 0 }}>
                            Pending
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#9B7450", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {convo.lastMessage || (isPending ? "Waiting for vendor approval..." : "Tap to open chat")}
                      </div>
                    </div>

                    <span style={{ fontSize: 18, color: "#C47A2E", flexShrink: 0 }}>›</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
    </PullToRefresh>
  );
}
