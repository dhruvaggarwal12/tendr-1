import { createContext, useContext, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chatState, setChatState] = useState(null);
  // chatState: { vendor, conversationId?, minimized }

  // Open a NEW chat (with bot flow)
  // All vendor enquiries route into the unified My Order chat
  const openVendorChat = (vendor) =>
    openAllBookingsChat(
      `I'd like to enquire about ${vendor.name} (${vendor.serviceType}) for my event.`,
      'vendor-enquiry',
      { vendorId: vendor._id, vendorName: vendor.name, serviceType: vendor.serviceType }
    );

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

  return (
    <ChatContext.Provider value={{ chatState, openVendorChat, openExistingChat, openConciergeChat, openTendrTeamChat, openOccasionsChat, openFunActivitiesChat, openAllBookingsChat, setConversationId, minimizeChat, expandChat, closeChat }}>
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
  openOccasionsChat: () => {},
  openFunActivitiesChat: () => {},
  openAllBookingsChat: () => {},
  setConversationId: () => {},
  minimizeChat: () => {},
  expandChat: () => {},
  closeChat: () => {},
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
