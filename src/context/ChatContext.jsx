import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import ChatToast from "../components/ChatToast";
// ChatProvider wraps <RouterProvider> in App.jsx (it's a router ANCESTOR, not
// a descendant), so the useNavigate() hook isn't available inside it — same
// constraint FloatingChatButton.jsx already works around by importing the
// router instance directly and calling its own imperative .navigate().
import router from "../router";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ChatContext = createContext(null);

// Decode a JWT payload without a library — same pattern already used in
// pages/vendor/Dashboard.jsx — just to tell a customer token from a vendor
// token so we know which "my conversations" endpoint(s) to call.
const parseJwt = (t) => { try { return JSON.parse(atob(t.split(".")[1])); } catch { return {}; } };

export function ChatProvider({ children }) {
  const [chatState, setChatState] = useState(null);
  // chatState: { vendor, conversationId?, minimized }
  const { token } = useSelector((s) => s.auth || {});

  // ── Real-time unread tracking — single source of truth for both the
  // customer and vendor sides. Server (unreadCount on each conversation,
  // conversation_unread_update over the socket) is authoritative; this is
  // just a live local mirror of it. ──────────────────────────────────────
  const [unreadByConversation, setUnreadByConversation] = useState({});
  const [toast, setToast] = useState(null);
  const role = token ? (parseJwt(token).vendorId ? "vendor" : "customer") : null;
  const chatStateRef = useRef(chatState);
  chatStateRef.current = chatState;

  const { on, connected } = useSocket({ token, enabled: !!token });

  const totalUnread = Object.values(unreadByConversation).reduce((sum, n) => sum + (n || 0), 0);

  // Seed unread counts once connected (and whenever the token/role changes).
  useEffect(() => {
    if (!token || !role) { setUnreadByConversation({}); return; }
    const headers = { Authorization: `Bearer ${token}` };
    if (role === "customer") {
      fetch(`${BASE_URL}/conversations`, { headers, credentials: "include" })
        .then(r => r.ok ? r.json() : { conversations: [] })
        .then(d => {
          const map = {};
          (d.conversations || []).forEach(c => { map[c._id] = c.unreadCount || 0; });
          setUnreadByConversation(map);
        })
        .catch(() => {});
    } else {
      Promise.all([
        fetch(`${BASE_URL}/conversations/vendor/mine`, { headers, credentials: "include" }).then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch(`${BASE_URL}/vendors/me/direct-chats`, { headers, credentials: "include" }).then(r => r.ok ? r.json() : { conversations: [] }).catch(() => ({ conversations: [] })),
      ]).then(([marketplace, direct]) => {
        const map = {};
        (marketplace.data || []).forEach(c => { map[c._id] = c.unreadCount || 0; });
        (direct.conversations || []).forEach(c => { map[c._id] = c.unreadCount || 0; });
        setUnreadByConversation(map);
      });
    }
  }, [token, role, connected]);

  // Live updates pushed from the server whenever a message is sent.
  useEffect(() => {
    if (!on) return;
    const off = on("conversation_unread_update", ({ conversationId, unreadCount }) => {
      setUnreadByConversation(prev => ({ ...prev, [conversationId]: unreadCount }));
    });
    return off;
  }, [on]);

  // New-message toast — shown only when the message's conversation isn't the
  // one currently open in the floating chat overlay (the one place this
  // provider can reliably know "what's on screen"; standalone chat pages may
  // occasionally still show a toast for their own open conversation — a
  // minor, accepted imperfection rather than threading "currently viewing"
  // state through every chat screen).
  useEffect(() => {
    if (!on) return;
    const off = on("new_message", (msg) => {
      if (!msg?.conversationId) return;
      const openId = chatStateRef.current?.conversationId;
      if (openId && String(openId) === String(msg.conversationId)) return;
      // Don't toast our own outgoing message echoed back.
      if (msg.sender === "user" && role === "customer") return;
      if (msg.sender === "vendor" && role === "vendor") return;
      setToast({
        conversationId: msg.conversationId,
        title: role === "vendor" ? "New message from a customer" : "New message",
        body: String(msg.content || "").slice(0, 80),
      });
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        try { new Notification(role === "vendor" ? "New customer message" : "New message on Tendr", { body: String(msg.content || "").slice(0, 100) }); } catch {}
      }
    });
    return off;
  }, [on, role]);

  const markConversationRead = useCallback((conversationId) => {
    if (!conversationId || !token || !role) return;
    setUnreadByConversation(prev => (prev[conversationId] ? { ...prev, [conversationId]: 0 } : prev));
    const path = role === "vendor" ? `vendor-read` : `read`;
    fetch(`${BASE_URL}/conversations/${conversationId}/${path}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    }).catch(() => {});
  }, [token, role]);

  // Open a NEW chat (with bot flow)
  // All vendor enquiries route into the unified My Order chat
  const openVendorChat = (vendor) =>
    openAllBookingsChat(
      `I'd like to enquire about ${vendor.name} (${vendor.serviceType}) for my event.`,
      'vendor-enquiry',
      { vendorId: vendor._id, vendorName: vendor.name, serviceType: vendor.serviceType }
    );

  // Open an EXISTING approved chat (skip bot, load history)
  const openExistingChat = (conversationId, vendor) => {
    setChatState({ vendor, conversationId, minimized: false, isExisting: true });
    markConversationRead(conversationId);
  };

  // Open Tendr Concierge chat (same window, no bot)
  // chatApproved=false → Smart Plan pending (input disabled until admin accepts)
  // chatApproved=true  → regular concierge / already accepted (input enabled)
  const openConciergeChat = (conversationId = null, chatApproved = true) => {
    setChatState({
      vendor: { _id: "concierge", name: "Tendr Team", serviceType: "Concierge", approved: chatApproved },
      conversationId,
      minimized: false,
      isExisting: !!conversationId,
      isConcierge: true,
      isSmartPlan: !!conversationId && !chatApproved,
    });
    if (conversationId) markConversationRead(conversationId);
  };

  // Open "Talk to Tendr Team" chat — no wizard, no approval wait, suggested Q&A
  const openTendrTeamChat = () =>
    setChatState({
      vendor: { _id: "tendr-team", name: "Tendr Team", serviceType: "Tendr Team", approved: true },
      conversationId: null,
      minimized: false,
      isExisting: false,
      isConcierge: true,
      skipBotFlow: true,
    });

  // Open unified "My Order" chat — single bucket for all service booking types
  // (occasions, gift-hampers, stationery, fun-activities, you-do-it, let-us-do-it)
  const openAllBookingsChat = (initialMessage = "", bookingCategory = null, eventDetails = {}) =>
    setChatState({
      vendor: { _id: "all-bookings", name: "Tendr Team", serviceType: "My Order", approved: true },
      conversationId: null,
      minimized: false,
      isExisting: false,
      isConcierge: true,
      skipBotFlow: true,
      isAllBookings: true,
      initialMessage,
      bookingCategory,
      funEventDetails: eventDetails,
    });

  // Wrappers kept for backward compatibility — both funnel into the single bucket
  const openOccasionsChat = (initialMessage = "") => openAllBookingsChat(initialMessage, 'occasions');
  const openFunActivitiesChat = (initialMessage = "", eventDetails = {}, bookingCategory = 'fun-activities') =>
    openAllBookingsChat(initialMessage, bookingCategory, eventDetails);

  const setConversationId = (id) =>
    setChatState(prev => prev ? { ...prev, conversationId: id } : null);

  const minimizeChat = () =>
    setChatState(prev => prev ? { ...prev, minimized: true } : null);

  const expandChat = () =>
    setChatState(prev => prev ? { ...prev, minimized: false } : null);

  const closeChat = () => setChatState(null);

  const viewToastConversation = () => {
    if (!toast) return;
    const conversationId = toast.conversationId;
    setToast(null);
    if (role === "vendor") { router.navigate("/vendor/chats"); return; }
    openExistingChat(conversationId, { _id: "unknown", name: "Chat", approved: true });
  };

  return (
    <ChatContext.Provider value={{ chatState, openVendorChat, openExistingChat, openConciergeChat, openTendrTeamChat, openOccasionsChat, openFunActivitiesChat, openAllBookingsChat, setConversationId, minimizeChat, expandChat, closeChat, totalUnread, unreadByConversation, markConversationRead }}>
      {children}
      <ChatToast toast={toast} onDismiss={() => setToast(null)} onView={viewToastConversation} />
    </ChatContext.Provider>
  );
}

export const useChatOverlay = () => useContext(ChatContext) || {
  chatState: null,
  openVendorChat: () => {},
  openExistingChat: () => {},
  openConciergeChat: () => {},
  openTendrTeamChat: () => {},
  openOccasionsChat: () => {},
  openFunActivitiesChat: () => {},
  openAllBookingsChat: () => {},
  setConversationId: () => {},
  minimizeChat: () => {},
  expandChat: () => {},
  closeChat: () => {},
  totalUnread: 0,
  unreadByConversation: {},
  markConversationRead: () => {},
};

// Opens the one unified "My Order" chat.
// All "Talk to our team"/"Can't find the right vendor?" entry points (Budget, Listings,
// Search, EventPlanning) use this. Used to find-or-create its own separate "Baat Karo"
// conversation — now just opens My Order like every other entry point, so a "can't find
// the right vendor" enquiry lands in the same place as everything else instead of its
// own thread.
export function useOpenBaatKaroChat() {
  const { token } = useSelector((s) => s.auth);
  const { openAllBookingsChat } = useChatOverlay();
  const navigate = useNavigate();

  return useCallback(() => {
    if (!token) { navigate("/baat-karo"); return; }
    openAllBookingsChat();
  }, [token, openAllBookingsChat, navigate]);
}
