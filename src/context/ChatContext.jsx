import { createContext, useContext, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chatState, setChatState] = useState(null);
  // chatState: { vendor, conversationId?, minimized }

  // Open a NEW chat (with bot flow)
  const openVendorChat = (vendor) =>
    setChatState({ vendor, conversationId: null, minimized: false, isExisting: false });

  // Open an EXISTING approved chat (skip bot, load history)
  const openExistingChat = (conversationId, vendor) =>
    setChatState({ vendor, conversationId, minimized: false, isExisting: true });

  // Open Tendr Concierge chat (same window, no bot)
  // chatApproved=false → Smart Plan pending (input disabled until admin accepts)
  // chatApproved=true  → regular concierge / already accepted (input enabled)
  const openConciergeChat = (conversationId = null, chatApproved = true) =>
    setChatState({
      vendor: { _id: "concierge", name: "Tendr Team", serviceType: "Concierge", approved: chatApproved },
      conversationId,
      minimized: false,
      isExisting: !!conversationId,
      isConcierge: true,
      isSmartPlan: !!conversationId && !chatApproved,
    });

  // Open "Talk to Tendr Team" chat — no wizard, no approval wait, suggested Q&A
  const openTendrTeamChat = () =>
    setChatState({
      vendor: { _id: "tendr-team", name: "Tendr Team", serviceType: "Concierge", approved: true },
      conversationId: null,
      minimized: false,
      isExisting: false,
      isConcierge: true,
      skipBotFlow: true,
    });

  const setConversationId = (id) =>
    setChatState(prev => prev ? { ...prev, conversationId: id } : null);

  const minimizeChat = () =>
    setChatState(prev => prev ? { ...prev, minimized: true } : null);

  const expandChat = () =>
    setChatState(prev => prev ? { ...prev, minimized: false } : null);

  const closeChat = () => setChatState(null);

  return (
    <ChatContext.Provider value={{ chatState, openVendorChat, openExistingChat, openConciergeChat, openTendrTeamChat, setConversationId, minimizeChat, expandChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatOverlay = () => useContext(ChatContext) || {
  chatState: null,
  openVendorChat: () => {},
  openExistingChat: () => {},
  openConciergeChat: () => {},
  openTendrTeamChat: () => {},
  setConversationId: () => {},
  minimizeChat: () => {},
  expandChat: () => {},
  closeChat: () => {},
};

// Finds or navigates to the shared Baat Karo chat.
// All "Talk to our team" entry points (Budget, Listings, Search, EventPlanning) use this.
// If an existing Baat Karo chat is found → opens it in the modal.
// If none → navigates to /baat-karo so the customer can start one.
export function useOpenBaatKaroChat() {
  const { token } = useSelector((s) => s.auth);
  const { openExistingChat } = useChatOverlay();
  const navigate = useNavigate();

  return useCallback(async () => {
    if (!token) { navigate("/baat-karo"); return; }
    try {
      const res = await fetch(`${BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const existing = (data.conversations || []).find(
          (c) => c.chatType === "vendor" && !c.vendorId && c.serviceType === "Baat Karo"
        );
        if (existing) {
          openExistingChat(existing._id, { _id: null, name: "Tendr Team", serviceType: "Baat Karo" });
          return;
        }
      }
    } catch {}
    navigate("/baat-karo");
  }, [token, openExistingChat, navigate]);
}
