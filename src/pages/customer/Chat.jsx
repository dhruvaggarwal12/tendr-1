import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Paperclip, X as XIcon, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { getBotFlow, buildSummaryMessage, buildAutoPackageMessage } from "../../utils/chatbot";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
import {
  setFinalisedVendor,
  addVendorToCompare,
  removeVendorFromCompare,
  clearVendorCompare,
} from "../../redux/listingFiltersSlice";
import ListingsNav from "../../components/ListingsNav";
import JourneyProgress from "../../components/JourneyProgress";
import HamburgerNav from "../../components/HamburgerNav";
import CompareModal from "../../components/CompareModal";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const compileFiltersMessage = (filters = {}) =>
  [
    filters.guest && ("Guests: " + filters.guest),
    filters.location && ("Location: " + filters.location),
    filters.date && ("Date: " + filters.date),
    filters.time && ("Time: " + filters.time),
    filters.foodType && ("Food Type: " + filters.foodType),
    filters.decorTheme && ("Decor Theme: " + filters.decorTheme),
    "Are you available?",
  ]
    .filter(Boolean)
    .join("\n");

const formatINR = (v) =>
  v == null || v === "" ? "N/A" : ("Rs." + Number(v).toLocaleString("en-IN"));

const compileBookingHeader = ({
  formData = {},
  selectedVendors = [],
  bookingType,
  extraRequirements,
  extraRequirementsText = "",
}) => {
  const { eventName, eventType, guests, budget, location, date, time, additionalInfo } = formData;
  const vendorNames = (selectedVendors || []).map((v) =>
    typeof v === "string" ? v : v?.name || v?.title || v?._id || "Vendor"
  );
  return [
    eventName && ("Event: " + eventName),
    eventType && ("Type: " + eventType),
    date && ("Date: " + date),
    time && ("Time: " + time),
    guests && ("Guests: " + guests),
    budget && ("Budget: " + formatINR(budget)),
    location && ("Location: " + location),
    vendorNames.length && ("Vendors: " + vendorNames.join(" | ")),
    bookingType && ("Booking Type: " + bookingType),
    additionalInfo && ("Notes: " + additionalInfo),
    extraRequirements && extraRequirementsText && ("Extra Requirements: " + extraRequirementsText),
  ]
    .filter(Boolean)
    .join("  •  ");
};

const MAX_FILES = 10;
const MAX_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const FALLBACK_VENDOR_IMG =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80";

const Chat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    vendor: navVendor,
    filters: navFilters,
    from,
    bookingType,
    formData,
    selectedVendors,
    extraRequirements,
    extraRequirementsText,
    chatId: existingChatId,   // set when navigating to an EXISTING conversation
  } = location.state || {};

  const fallbackVendor = { _id: "concierge", name: "Tendr Concierge", approved: true };
  const vendor = navVendor || fallbackVendor;
  const filters = navFilters || {};

  // Redux
  const compareSelected = useSelector((state) => state.listingFilters.compareSelected);
  const finalisedVendors = useSelector((state) => state.listingFilters.finalisedVendors || {});
  const serviceTypeForGroup = useSelector((state) => state.listingFilters.serviceType);
  const reduxBookingType = useSelector((state) => state.eventPlanning.bookingType);
  const reduxFormData = useSelector((state) => state.eventPlanning.formData || {});
  const currentUser = useSelector((state) => state.auth.user);
  const authToken = useSelector((state) => state.auth.token);
  const isLetUsDoIt = (bookingType || reduxBookingType) === "let-us-do-it";
  const isThisVendorFinalised = finalisedVendors[vendor?.serviceType]?._id === vendor._id;

  // Socket
  const socketRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  // Connect socket when user is logged in
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = io(BASE_URL, {
      query: { userId: currentUser._id, role: "user" },
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    const vendorId = vendor?._id && vendor._id !== "concierge" ? vendor._id : undefined;
    // Support chat from floating button sets from="support"
    const socketChatType = (from === "support") ? "SUPPORT" : "VENDOR";

    socket.on("connect", () => {
      socketRef._connected = true;
      // For existing chats: emit immediately (skip bot)
      if (isExistingChat) {
        socket.emit("open_conversation", {
          chatType: (from === "support") ? "SUPPORT" : "VENDOR",
          vendorId: vendor?._id && vendor._id !== "concierge" ? vendor._id : undefined,
          eventDetails: { ...reduxFormData, ...formData },
          bookingType: bookingType || reduxBookingType,
        });
      }
    });

    socket.on("conversation_opened", async ({ _id, chatApproved: approved }) => {
      setConversationId(_id);
      if (approved) setVendorApprovedByAdmin(true);
      // After bot finishes: send summary only for NEW conversations (no history yet)
      // This prevents duplicates when resuming an existing conversation
      if (botDoneRef.current && Object.keys(botAnswersRef.current).length > 0) {
        // Wait for history load, then send summary + auto package MCQ if new
        setTimeout(() => {
          const currentMessages = messagesRef.current || [];
          const alreadySent = currentMessages.some(m => m.text?.includes("Chat Request Details"));
          if (!alreadySent) {
            const botAns     = botAnswersRef.current;
            const formAns    = { ...reduxFormData, ...formData };
            const summaryMsg = buildSummaryMessage(formAns, botAns, vendor?.name, vendor?.serviceType);
            // 1. Send event summary from customer side
            socket.emit("send_message", { conversationId: _id.toString(), sender: "user", content: summaryMsg });
            // 2. Auto-send package MCQ from vendor side
            const packageMsg = buildAutoPackageMessage(vendor?.serviceType);
            if (packageMsg) {
              setTimeout(() => {
                socket.emit("send_message", { conversationId: _id.toString(), sender: "user", content: packageMsg });
                // Show locally as bot message
                setMessages(prev => [...prev, { text: packageMsg, sender: "vendor", ts: Date.now() }]);
              }, 600);
            }
          }
        }, 800);
      }
      // Mark support/concierge chats as explicitly opened by customer
      // so they appear in the dashboard Chats tab
      if (from === "support" || from === "concierge" || vendor?._id === "concierge") {
        try {
          const opened = JSON.parse(localStorage.getItem("openedSupportChats") || "[]");
          if (!opened.includes(_id)) {
            localStorage.setItem("openedSupportChats", JSON.stringify([...opened, _id]));
          }
        } catch {}
      }
      // Load message history from DB
      try {
        const res = await fetch(`${BASE_URL}/messages/${_id}/messages`, { credentials: "include" });
        if (res.ok) {
          const history = await res.json();
          if (Array.isArray(history) && history.length > 0) {
            setMessages(history.map(m => ({
              text: m.content,
              sender: m.sender === "user" ? "user" : "vendor",
              ts: new Date(m.createdAt).getTime(),
            })));
          }
        }
      } catch {}
    });

    socket.on("chat_approved", () => setVendorApprovedByAdmin(true));
    socket.on("chat_rejected", () => setVendorApprovedByAdmin(false));

    socket.on("new_message", (msg) => {
      // Skip echoed user messages — already added locally when sent
      if (msg.sender === "user") return;
      setMessages((prev) => [
        ...prev,
        { text: msg.content, sender: "vendor", ts: msg.createdAt || Date.now() },
      ]);
      setIsVendorTyping(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Chat socket error:", err.message);
    });

    return () => socket.disconnect();
  }, [currentUser?._id]);

  // Chat state
  const [message, setMessage] = useState("");
  const [isVendorTyping, setIsVendorTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);
  const [vendorApprovedByAdmin, setVendorApprovedByAdmin] = useState(false);

  // Chat is enabled if vendor is pre-approved OR admin has approved the chat request
  const vendorApproved = vendor?.approved || vendorApprovedByAdmin || false;
  const [chatCompleted, setChatCompleted] = useState(false);

  // ── Bot state ──────────────────────────────────────────────────────────────
  // Skip bot entirely if navigating to an existing chat (chatId in state)
  const isExistingChat = !!existingChatId;
  const botFlow   = isExistingChat ? [] : getBotFlow(
    vendor?.serviceType,
    from === "support" ? "support" : (from === "concierge" || vendor?._id === "concierge") ? "concierge" : vendor?.serviceType
  );
  const [botStep,    setBotStep]    = useState(0);
  const [botAnswers, setBotAnswers] = useState({});
  const [botDone,    setBotDone]    = useState(isExistingChat); // pre-done for existing chats
  const botActive = !botDone && botFlow?.length > 0;
  // Refs so async socket callbacks can read latest values
  const botDoneRef    = useRef(false);
  const botAnswersRef = useRef({});
  const messagesRef   = useRef([]);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleCloseChat = async () => {
    if (conversationId) {
      try {
        await fetch(`${BASE_URL}/conversations/${conversationId}/close`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authToken}` },
          credentials: 'include',
        });
      } catch {}
    }
    navigate(-1);
  };
  const messagesEndRef = useRef(null);

  // Selected vendors modal
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [modalCompareIds, setModalCompareIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const groupedByCategory = compareSelected.reduce((acc, v) => {
    const cat = v?.primaryService || v?.serviceType || serviceTypeForGroup || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});
  const modalCategories = Object.keys(groupedByCategory);

  const openSelectedModal = () => {
    setActiveModalCategory(modalCategories[0] ?? null);
    setModalCompareIds([]);
    setIsSelectedModalOpen(true);
  };

  const toggleModalCompare = (id) => {
    setModalCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Keep ref in sync for async callbacks
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const bookingHeader = useMemo(() => {
    if (from !== "booking") return "";
    return compileBookingHeader({ formData, selectedVendors, bookingType, extraRequirements, extraRequirementsText });
  }, [from, formData, selectedVendors, bookingType, extraRequirements, extraRequirementsText]);

  useEffect(() => {
    if (from === "booking") return;
    if (filters && !hasSentInitialMessage && Object.keys(filters).length > 0) {
      setMessages([{ text: compileFiltersMessage(filters), sender: "user", ts: Date.now() }]);
      setHasSentInitialMessage(true);
    }
  }, [hasSentInitialMessage, filters, from]);

  useEffect(() => {
    return () => { pendingAttachments.forEach((a) => URL.revokeObjectURL(a.url)); };
  }, []);

  const handleUserTyping = (e) => {
    setMessage(e.target.value);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFilesChosen = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const available = Math.max(0, MAX_FILES - pendingAttachments.length);
    const slice = files.slice(0, available);
    const rejected = [];
    const accepted = [];
    slice.forEach((file) => {
      if (file.size > MAX_MB * 1024 * 1024) { rejected.push({ name: file.name, reason: (">" + MAX_MB + "MB") }); return; }
      if (!ACCEPTED_TYPES.includes(file.type)) { rejected.push({ name: file.name, reason: "type" }); return; }
      accepted.push({ id: (file.name + "-" + file.size + "-" + Date.now()), url: URL.createObjectURL(file), file, name: file.name, size: file.size, type: file.type });
    });
    if (rejected.length) alert("Some files were not added:\n" + rejected.map((r) => ("* " + r.name + " (" + r.reason + ")")).join("\n"));
    if (pendingAttachments.length + accepted.length >= MAX_FILES) alert("You can attach up to " + MAX_FILES + " images per message.");
    setPendingAttachments((prev) => [...prev, ...accepted]);
    e.target.value = "";
  };

  const removePendingAttachment = (id) => {
    setPendingAttachments((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!vendorApproved) return;
    const trimmed = message.trim();
    const hasImages = pendingAttachments.length > 0;
    if (!trimmed && !hasImages) return;

    // Show message locally immediately
    setMessages((prev) => [
      ...prev,
      {
        text: trimmed || "",
        sender: "user",
        attachments: hasImages ? pendingAttachments.map((a) => ({ url: a.url, name: a.name, type: a.type, size: a.size })) : undefined,
        ts: Date.now(),
      },
    ]);
    setMessage("");
    setPendingAttachments([]);

    // Send via socket if connected, otherwise show static reply
    if (socketRef.current && conversationId && trimmed) {
      socketRef.current.emit("send_message", {
        conversationId,
        sender: "user",
        content: trimmed,
      });
      // No typing indicator — admin/vendor will reply when ready
    } else {
      // No socket — add a static acknowledgement only
      setMessages((prev) => [
        ...prev,
        { text: "Message received. Our team will respond shortly.", sender: "vendor", ts: Date.now() },
      ]);
    }
  };

  // ── Bot answer handler ────────────────────────────────────────────────────
  const handleBotAnswer = (answer) => {
    const step    = botFlow[botStep];
    const newAnswers = { ...botAnswers, [step.key]: answer };
    setBotAnswers(newAnswers);
    botAnswersRef.current = newAnswers;

    if (botStep + 1 < botFlow.length) {
      // More questions — advance
      setBotStep(prev => prev + 1);
    } else {
      // All questions done — open the conversation with full context
      setBotDone(true);
      botDoneRef.current = true;
      const mergedDetails = { ...reduxFormData, ...formData, ...newAnswers };

      // Show bot summary in local messages (includes form data)
      const formAns = { ...reduxFormData, ...formData };
      const summaryText = buildSummaryMessage(formAns, newAnswers, vendor?.name, vendor?.serviceType);
      setMessages(prev => [...prev, {
        text: summaryText,
        sender: "vendor",
        ts: Date.now(),
        isBot: true,
      }]);

      // Now emit open_conversation with all collected answers
      const socket = socketRef.current;
      if (!socket) return;
      const vendorId = vendor?._id && vendor._id !== "concierge" ? vendor._id : undefined;
      const emit = () => socket.emit("open_conversation", {
        chatType: (from === "support") ? "SUPPORT" : "VENDOR",
        vendorId,
        eventDetails: mergedDetails,
        bookingType:  bookingType || reduxBookingType,
      });

      if (socket.connected) {
        emit();
      } else {
        socket.once("connect", emit);
      }
    }
  };

  const handleFinalise = () => {
    dispatch(setFinalisedVendor(vendor));
    setMessages((prev) => [
      ...prev,
      {
        text: `✅ ${vendor.name || "This vendor"} has been added to your booking. Tap "Review & Pay" in the top bar whenever you're ready to proceed.`,
        sender: "system",
        ts: Date.now(),
      },
    ]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8f4ef",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <BasicSpeedDial />

      <HamburgerNav active={vendor._id !== "concierge" && from !== "support" ? "Chat" : ""} />

      {/* Next steps hint — vendor chats only */}
      {vendor._id !== "concierge" && from !== "support" && (
        <div style={{ background: "rgba(196,122,46,0.06)", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "8px 24px", fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Next steps:</span>
            {[
              { label: "Chat & Confirm",   done: false, active: !chatCompleted },
              { label: "Mark Complete",    done: false, active: vendorApproved && !chatCompleted && false, current: !chatCompleted && messages.length > 0 },
              { label: "Finalise Vendor",  done: isThisVendorFinalised, active: chatCompleted && !isThisVendorFinalised },
              { label: "Review & Pay",     done: false, active: isThisVendorFinalised },
            ].map(({ label, done, active }, i, arr) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 12, fontWeight: active || done ? 700 : 500,
                  color: done ? "#15803d" : active ? "#C47A2E" : "#bbb",
                  padding: "2px 0",
                }}>
                  {done ? "✓ " : ""}{label}
                </span>
                {i < arr.length - 1 && <span style={{ color: "rgba(196,122,46,0.3)", fontSize: 10 }}>›</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor sub-header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(139,69,19,0.1)",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src={vendor.image || vendor.coverImage || FALLBACK_VENDOR_IMG}
            alt={vendor.name}
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(204,171,74,0.4)", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{vendor.name || "Vendor"}</div>
            <div style={{ fontSize: 12, color: "#9B7450" }}>{vendor.serviceType || "Service Provider"}</div>
          </div>
          {isThisVendorFinalised && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                color: "#15803d",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 100,
                padding: "4px 12px",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={13} /> Finalised
            </span>
          )}
        </div>
      </div>

      {/* Booking header strip */}
      {bookingHeader && (
        <div style={{ background: "#fffaf3", borderBottom: "1px solid #fde9c4" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "10px 24px", fontSize: 13, color: "#7a5c1e" }}>
            <span style={{ fontWeight: 700, marginRight: 8 }}>Booking Details:</span>
            {bookingHeader}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          paddingBottom: pendingAttachments.length > 0 ? 200 : 90,
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginBottom: 8 }}>
            Chatting with <b style={{ color: "#7A4A1E" }}>{vendor.name || "Vendor"}</b>
          </div>

          {/* ── BOT QUESTIONS (before open_conversation is emitted) ── */}
          {botActive && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Greeting */}
              {botStep === 0 && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ maxWidth: "72%", background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 14, color: "#1a1a1a", lineHeight: 1.5 }}>
                    👋 Hi! Before we connect you, I have a few quick questions to help us understand your needs. It'll only take a moment!
                  </div>
                </div>
              )}
              {/* Previously answered questions (show as chat history) */}
              {botFlow.slice(0, botStep).map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ maxWidth: "72%", background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 14, color: "#1a1a1a" }}>
                      {step.question}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "72%", background: "linear-gradient(135deg,#CCAB4A,#e8c96a)", borderRadius: "18px 18px 4px 18px", padding: "10px 14px", fontSize: 14, color: "#fff", fontWeight: 600 }}>
                      {botAnswers[step.key]}
                    </div>
                  </div>
                </div>
              ))}
              {/* Current question */}
              {botStep < botFlow.length && (() => {
                const currentQ = botFlow[botStep];
                const isText   = currentQ.type === "text";
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ maxWidth: "80%", background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 14, color: "#1a1a1a", lineHeight: 1.5 }}>
                        {currentQ.question}
                      </div>
                    </div>
                    {isText ? (
                      // Free-text address input
                      <BotTextInput onSubmit={handleBotAnswer} />
                    ) : (
                      // MCQ option buttons
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 8 }}>
                        {currentQ.options.map(opt => (
                          <button key={opt} onClick={() => handleBotAnswer(opt)}
                            style={{ padding: "8px 16px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.4)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.08)"; e.currentTarget.style.borderColor = "#C47A2E"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.4)"; }}
                          >{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {messages.map((msg, idx) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.ts || idx} style={{ textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      color: "#15803d",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 100,
                      padding: "5px 16px",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              );
            }
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.ts || idx}
                style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "72%",
                    background: isUser ? "linear-gradient(135deg, #CCAB4A, #e8c96a)" : "#fff",
                    color: isUser ? "#fff" : "#1a1a1a",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "10px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {!!msg.text && (() => {
                    // MCQ package message — render with selectable option buttons
                    if (msg.text.startsWith("[MCQ_PACKAGES:")) {
                      const svcType = msg.text.match(/\[MCQ_PACKAGES:(.+?)\]/)?.[1] || "";
                      const clean = msg.text.replace(/\[MCQ_PACKAGES:[^\]]+\]\n?/, "");
                      const optionLines = ["1️⃣","2️⃣","3️⃣"].map((em, i) => {
                        const start = clean.indexOf(em);
                        const next = ["1️⃣","2️⃣","3️⃣"][i + 1];
                        const end = next ? clean.indexOf(next) : clean.indexOf("\nReply with");
                        return start >= 0 ? clean.slice(start, end > 0 ? end : undefined).trim() : null;
                      }).filter(Boolean);
                      const tierNames = ["Basic", "Standard", "Premium"];
                      return (
                        <div>
                          <p style={{ margin: "0 0 10px", whiteSpace: "pre-line", fontWeight: 600 }}>
                            {clean.split('\n').slice(0, 2).join('\n')}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {optionLines.map((opt, i) => (
                              <button key={i}
                                onClick={() => {
                                  const reply = `I'd like to go with the ${tierNames[i]} package:\n\n${opt}`;
                                  // Send directly via socket — bypasses approval gate
                                  // so package selection works before admin approves
                                  if (socketRef.current && conversationId) {
                                    socketRef.current.emit("send_message", {
                                      conversationId,
                                      sender: "user",
                                      content: reply,
                                    });
                                    setMessages(prev => [...prev, { text: reply, sender: "user", ts: Date.now() }]);
                                  } else {
                                    setMessage(reply);
                                    setTimeout(() => { const btn = document.getElementById("chat-send-btn"); if (btn) btn.click(); }, 50);
                                  }
                                  // Save package selection to eventDetails so it shows in chat request
                                  if (conversationId && authToken) {
                                    fetch(`${BASE_URL}/conversations/${conversationId}/bot-summary`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
                                      credentials: "include",
                                      body: JSON.stringify({ eventDetails: { selectedPackage: `${tierNames[i]} Package` } }),
                                    }).catch(() => {});
                                  }
                                }}
                                style={{ textAlign: "left", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#2C1A0E", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "pre-line", lineHeight: 1.5 }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                              >
                                {opt}
                              </button>
                            ))}
                            {/* Skip option */}
                            <button
                              onClick={() => {
                                const reply = "No specific package preference — please suggest what suits my event.";
                                if (socketRef.current && conversationId) {
                                  socketRef.current.emit("send_message", { conversationId, sender: "user", content: reply });
                                  setMessages(prev => [...prev, { text: reply, sender: "user", ts: Date.now() }]);
                                } else {
                                  setMessage(reply);
                                  setTimeout(() => { const btn = document.getElementById("chat-send-btn"); if (btn) btn.click(); }, 50);
                                }
                                if (conversationId && authToken) {
                                  fetch(`${BASE_URL}/conversations/${conversationId}/bot-summary`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
                                    credentials: "include",
                                    body: JSON.stringify({ eventDetails: { selectedPackage: "No preference — discuss directly" } }),
                                  }).catch(() => {});
                                }
                              }}
                              style={{ textAlign: "center", padding: "8px 12px", borderRadius: 10, border: "1px dashed rgba(139,69,19,0.25)", background: "transparent", color: "#9B7450", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                            >
                              Skip → I'll discuss directly
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return <p style={{ margin: 0, whiteSpace: "pre-line" }}>{msg.text}</p>;
                  })()}
                  {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "grid",
                        gridTemplateColumns: msg.attachments.length > 1 ? "1fr 1fr" : "1fr",
                        gap: 6,
                      }}
                    >
                      {msg.attachments.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noreferrer">
                          <img
                            src={att.url}
                            alt={att.name || "attachment"}
                            style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10 }}
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isVendorTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 18, padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#CCAB4A",
                      animation: "bounce 1s ease infinite",
                      animationDelay: (i * 0.2) + "s",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#aaa" }}>Vendor is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Pending attachment previews */}
      {pendingAttachments.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 72,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: "0 16px",
          }}
        >
          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              border: "1px solid #f0e8dc",
              padding: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#7A4A1E" }}>
                <ImageIcon size={14} />
                <span>Attachments ({pendingAttachments.length}/{MAX_FILES})</span>
              </div>
              <span style={{ fontSize: 11, color: "#aaa" }}>JPG/PNG/WebP/GIF up to {MAX_MB}MB</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
              {pendingAttachments.map((att) => (
                <div key={att.id} style={{ position: "relative" }}>
                  <img src={att.url} alt={att.name} style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid #f0e8dc" }} />
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(att.id)}
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#1a1a1a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <XIcon size={11} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      {/* Quick replies — all vendor chats */}
      {vendor._id !== "concierge" && from !== "support" && vendorApproved && (
        <div style={{ background: "#fffaf3", borderTop: "1px solid rgba(196,122,46,0.15)", padding: "8px 16px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, maxWidth: 860, margin: "0 auto", flexWrap: "nowrap" }}>
            {[
              "What packages do you offer?",
              "What is your availability on my date?",
              "Can you share pricing details?",
              "Do you have experience with my event type?",
              "What is included in your service?",
              "Can we schedule a call?",
            ].map((q) => (
              <button key={q} onClick={() => setMessage(q)}
                style={{ whiteSpace: "nowrap", padding: "5px 12px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.3)", background: "#fff", color: "#6B3A1F", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Predefined questions — support/concierge chats */}
      {(vendor._id === "concierge" || from === "support") && vendorApproved && (
        <div style={{ background: "#fffaf3", borderTop: "1px solid rgba(196,122,46,0.15)", padding: "8px 16px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, maxWidth: 860, margin: "0 auto", flexWrap: "nowrap" }}>
            {[
              "How do I book a vendor?",
              "What areas do you serve?",
              "How does the approval process work?",
              "Can I change my event details?",
              "What is the refund policy?",
              "How do I contact a vendor?",
            ].map((q) => (
              <button key={q} onClick={() => setMessage(q)}
                style={{ whiteSpace: "nowrap", padding: "5px 12px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.3)", background: "#fff", color: "#6B3A1F", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >{q}</button>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          borderTop: "1px solid rgba(139,69,19,0.1)",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
          padding: "10px 16px",
          zIndex: 50,
        }}
      >
        <form
          onSubmit={handleSendMessage}
          style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}
        >
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={handleFilesChosen} style={{ display: "none" }} />

          <button
            type="button"
            onClick={openFilePicker}
            disabled={botActive || !vendorApproved}
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid rgba(139,69,19,0.2)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: vendorApproved ? "pointer" : "not-allowed",
              opacity: vendorApproved ? 1 : 0.5,
            }}
          >
            <Paperclip size={17} color="#7A4A1E" />
          </button>

          <input
            type="text"
            placeholder={botActive ? "Please answer the questions above first…" : vendorApproved ? "Write your message..." : "Waiting for admin to approve your chat request..."}
            value={message}
            onChange={handleUserTyping}
            disabled={botActive || !vendorApproved}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 100,
              border: "1.5px solid rgba(139,69,19,0.2)",
              background: vendorApproved ? "#fff" : "#f9f9f9",
              fontSize: 14,
              fontFamily: "'Outfit', sans-serif",
              outline: "none",
              color: "#1a1a1a",
            }}
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={botActive || !vendorApproved}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: 100,
              border: "none",
              background: vendorApproved ? "#CCAB4A" : "#e5e7eb",
              color: vendorApproved ? "#fff" : "#9ca3af",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              cursor: vendorApproved ? "pointer" : "not-allowed",
            }}
          >
            Send
          </button>

          {/* Vendor chat action buttons */}
          {vendor._id !== "concierge" && from !== "support" && (
            <>
              {/* Close Chat */}
              <button
                type="button"
                onClick={handleCloseChat}
                style={{ flexShrink: 0, padding: "9px 14px", borderRadius: 100, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                ✕ Close Chat
              </button>

              {/* Chat Completed */}
              <button
                type="button"
                onClick={() => setChatCompleted(true)}
                disabled={chatCompleted}
                style={{ flexShrink: 0, padding: "9px 14px", borderRadius: 100, border: "none", background: chatCompleted ? "#f0fdf4" : "linear-gradient(135deg,#0369a1,#3b82f6)", color: chatCompleted ? "#15803d" : "#fff", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: chatCompleted ? "default" : "pointer", whiteSpace: "nowrap" }}
              >
                {chatCompleted ? "Completed ✓" : "Chat Completed"}
              </button>

              {/* Finalise Vendor — only enabled after Chat Completed */}
              <button
                type="button"
                onClick={() => handleFinalise()}
                disabled={!chatCompleted}
                title={!chatCompleted ? "Mark chat as completed first" : ""}
                style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 100, border: "none", background: !chatCompleted ? "#e5e7eb" : isThisVendorFinalised ? "linear-gradient(135deg,#15803d,#22c55e)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: !chatCompleted ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: !chatCompleted ? "not-allowed" : "pointer", whiteSpace: "nowrap", boxShadow: chatCompleted ? "0 3px 10px rgba(196,122,46,0.3)" : "none", transition: "all 0.2s" }}
              >
                {isThisVendorFinalised ? "Finalised ✓" : "Finalise Vendor"}
              </button>
            </>
          )}
        </form>
      </div>

      {/* Compare Modal */}
      <CompareModal
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        vendors={compareSelected.filter((v) => modalCompareIds.includes(v._id))}
      />

      {/* Selected Vendors Modal */}
      {isSelectedModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsSelectedModalOpen(false)}
        >
          <div
            style={{ width: "96%", maxWidth: 768, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", maxHeight: "88vh", fontFamily: "'Outfit', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #f0e8dc" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2C1A0E", margin: 0 }}>
                Selected Vendors
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: "#9B7450" }}>
                  ({compareSelected.length} total)
                </span>
              </h3>
              <button
                onClick={() => setIsSelectedModalOpen(false)}
                style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 14, color: "#555" }}
              >
                x
              </button>
            </div>

            {compareSelected.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#9B7450", fontSize: 14 }}>
                No vendors selected yet. Use the Add to Compare button on vendor cards.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, padding: "16px 24px 4px", flexWrap: "wrap" }}>
                  {modalCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveModalCategory(cat); setModalCompareIds([]); }}
                      style={{
                        padding: "6px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                        border: "2px solid", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                        borderColor: activeModalCategory === cat ? "#C47A2E" : "rgba(139,69,19,0.18)",
                        background: activeModalCategory === cat ? "#C47A2E" : "#fff",
                        color: activeModalCategory === cat ? "#fff" : "#6B3A1F",
                      }}
                    >
                      {cat}
                      <span style={{ marginLeft: 6, background: activeModalCategory === cat ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.12)", color: activeModalCategory === cat ? "#fff" : "#C47A2E", borderRadius: 100, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                        {groupedByCategory[cat].length}
                      </span>
                    </button>
                  ))}
                </div>
                <p style={{ padding: "4px 24px", fontSize: 12, color: "#aaa", margin: 0 }}>Select vendors to compare side by side.</p>
                <div style={{ overflowY: "auto", padding: "8px 24px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  {(groupedByCategory[activeModalCategory] || []).map((v) => {
                    const isChecked = modalCompareIds.includes(v._id);
                    return (
                      <div key={v._id} style={{ border: isChecked ? "2px solid #C47A2E" : "1.5px solid #f0e8dc", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 14, alignItems: "flex-start", background: isChecked ? "#fffaf4" : "#fff" }}>
                        <img src={v.image || v.coverImage || (v.images && v.images[0]) || FALLBACK_VENDOR_IMG} alt={v.name || "Vendor"} style={{ width: 88, height: 66, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "#2C1A0E", fontSize: 15, marginBottom: 2 }}>{v.name || v.businessName || "Verified Vendor"}</div>
                          <div style={{ fontSize: 13, color: "#7A5535" }}>{v.primaryService || activeModalCategory}{v.city ? " - " + v.city : ""}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button onClick={() => toggleModalCompare(v._id)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "1.5px solid " + (isChecked ? "#C47A2E" : "rgba(139,69,19,0.22)"), background: isChecked ? "#C47A2E" : "#fff", color: isChecked ? "#fff" : "#6B3A1F", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                              {isChecked ? "Comparing" : "Add to Compare"}
                            </button>
                            <button onClick={() => dispatch(removeVendorFromCompare(v._id))} style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#555", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Remove</button>
                            <button onClick={() => navigate("/vendor/" + v._id)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "none", background: "#f5eedf", color: "#7A4A1E", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>View Profile</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid #f0e8dc" }}>
                  <button onClick={() => dispatch(clearVendorCompare())} style={{ fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f5f5f5", color: "#555", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Clear All</button>
                  <button
                    disabled={modalCompareIds.length < 2}
                    onClick={() => { setIsSelectedModalOpen(false); setIsCompareOpen(true); }}
                    style={{ fontSize: 13, fontWeight: 700, padding: "7px 22px", borderRadius: 8, border: "none", background: modalCompareIds.length >= 2 ? "linear-gradient(135deg, #C47A2E, #DEB887)" : "#e5e7eb", color: modalCompareIds.length >= 2 ? "#fff" : "#9ca3af", cursor: modalCompareIds.length >= 2 ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif" }}
                  >
                    Compare Selected ({modalCompareIds.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

// Small inline component for text-type bot questions (address)
function BotTextInput({ onSubmit }) {
  const [val, setVal] = React.useState("");
  const font = "'Outfit', sans-serif";
  return (
    <div style={{ display: "flex", gap: 8, paddingLeft: 8, paddingRight: 8 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) onSubmit(val.trim()); }}
        placeholder="Type your address and press Enter…"
        autoFocus
        style={{ flex: 1, padding: "10px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.4)", fontSize: 14, fontFamily: font, outline: "none", color: "#1a1a1a" }}
      />
      <button
        onClick={() => { if (val.trim()) onSubmit(val.trim()); }}
        disabled={!val.trim()}
        style={{ padding: "10px 18px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: val.trim() ? "pointer" : "not-allowed", opacity: val.trim() ? 1 : 0.5, fontFamily: font, whiteSpace: "nowrap" }}
      >
        Send →
      </button>
    </div>
  );
}

export default Chat;
