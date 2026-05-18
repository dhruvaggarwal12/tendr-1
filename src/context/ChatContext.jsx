import { createContext, useContext, useState } from "react";

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
  const openConciergeChat = (conversationId = null) =>
    setChatState({
      vendor: { _id: "concierge", name: "Tendr Concierge", serviceType: "Concierge", approved: true },
      conversationId,
      minimized: false,
      isExisting: !!conversationId,
      isConcierge: true,
    });

  const setConversationId = (id) =>
    setChatState(prev => prev ? { ...prev, conversationId: id } : null);

  const minimizeChat = () =>
    setChatState(prev => prev ? { ...prev, minimized: true } : null);

  const expandChat = () =>
    setChatState(prev => prev ? { ...prev, minimized: false } : null);

  const closeChat = () => setChatState(null);

  return (
    <ChatContext.Provider value={{ chatState, openVendorChat, openExistingChat, openConciergeChat, setConversationId, minimizeChat, expandChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatOverlay = () => useContext(ChatContext) || {
  chatState: null,
  openVendorChat: () => {},
  openExistingChat: () => {},
  openConciergeChat: () => {},
  setConversationId: () => {},
  minimizeChat: () => {},
  expandChat: () => {},
  closeChat: () => {},
};
