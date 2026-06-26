import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const QUICK_QUESTIONS = [
  "How do I book a vendor?",
  "How can we proceed to booking?",
  "What areas do you serve?",
  "How does chat approval work?",
  "What is the refund policy?",
  "I need help with my booking",
];

const FAQ_KB = [
  {
    keywords: ["proceed to booking", "proceed", "next step", "next steps", "how to proceed", "start booking", "begin booking", "get started", "what do i do next", "how to start"],
    answer: "Here's how to proceed to booking on Tendr:\n\n1️⃣ Fill in your event details (type, date, guests, venue)\n2️⃣ Browse and shortlist vendors from the listings\n3️⃣ Start a chat with your chosen vendor\n4️⃣ Our team approves the chat within a few hours\n5️⃣ Discuss and agree on the final price in chat\n6️⃣ Tap the Pay button (bottom right) to confirm & pay\n\nNeed more help? Email us at contact@tendr.co.in 💛",
  },
  {
    keywords: ["how do i book", "how to book", "book a vendor", "vendor booking", "book vendor"],
    answer: "To book a vendor: fill the event planning form → browse vendors → request a chat → our team approves it → agree on price in chat → click Pay to confirm. The whole process usually takes a few hours! 🎉",
  },
  {
    keywords: ["area", "serve", "city", "location", "where", "available", "delhi", "noida", "gurgaon"],
    answer: "Tendr currently operates in Delhi NCR (Delhi, Gurgaon, Noida, Faridabad, Ghaziabad). We're expanding to more cities soon — stay tuned! 📍",
  },
  {
    keywords: ["chat approval", "approve", "approval", "request", "chat request", "chat approved"],
    answer: "After you request a chat with a vendor, our team reviews and approves it within a few hours. You'll get a WhatsApp notification when the chat is ready. ✅",
  },
  {
    keywords: ["refund", "cancel", "cancellation", "money back", "refund policy"],
    answer: "Cancellations made 7+ days before the event receive a full refund. Within 7 days, a 20% cancellation fee applies. Contact us at contact@tendr.co.in for specific cases. 💸",
  },
  {
    keywords: ["i need help", "need help", "help with booking", "help with my booking", "help me"],
    answer: "We're here to help! 🤝\n\n• For booking issues — email contact@tendr.co.in\n• WhatsApp/Call — +91 9211668427 (10 AM–7 PM)\n• Or describe your problem here and we'll get back to you shortly.",
  },
  {
    keywords: ["payment", "pay", "price", "cost", "charge", "fee", "how much", "pay button"],
    answer: "Payment is made after all vendor prices are confirmed in chat. We support UPI, cards, and net banking. The amount shown at checkout is always the final amount — no hidden charges. 💳",
  },
  {
    keywords: ["caterer", "food", "menu", "catering"],
    answer: "Our caterers offer customisable menus with North Indian, South Indian, Chinese, Punjabi, Italian, and more cuisines. Plate counts are set during booking. 🍽️",
  },
  {
    keywords: ["decorator", "decor", "decoration", "theme", "balloon", "floral"],
    answer: "Tendr decorators offer themed setups, balloon decor, floral arrangements, LED backdrops, and custom setups for all event types. 🎨",
  },
  {
    keywords: ["photographer", "photography", "photo", "video", "videographer"],
    answer: "Our photographers cover full-day events, deliver edited photos within 7–10 days, and offer reels/highlight videos. Raw footage is available on request. 📸",
  },
  {
    keywords: ["dj", "music", "sound", "anchor", "emcee"],
    answer: "Tendr connects you with DJs and anchors for weddings, birthdays, and corporate events. Equipment, lights, and setup are included in most packages. 🎵",
  },
  {
    keywords: ["makeup", "mehendi", "henna", "artist"],
    answer: "Makeup artists and mehndi artists are available for bridal, pre-bridal, and regular event bookings. Both can come to your venue. 💄",
  },
  {
    keywords: ["timeline", "schedule", "timeline pdf", "event timeline"],
    answer: "After your event is confirmed, you can download a custom event timeline PDF from your dashboard under your upcoming events. 📋",
  },
  {
    keywords: ["invoice", "receipt", "bill", "pdf", "document"],
    answer: "Your event details PDF and timeline are available on your dashboard after payment. You can download them anytime from your upcoming events. 📄",
  },
  {
    keywords: ["contact", "reach", "support", "email", "phone", "number", "whatsapp"],
    answer: "Reach our support team at contact@tendr.co.in or call/WhatsApp us at +91 9211668427. We're available 10 AM – 7 PM daily. 🤝",
  },
  {
    keywords: ["celebration kit", "kit", "decoration kit", "party kit"],
    answer: "Tendr Celebration Kits are coming soon! These are under ₹2,000 DIY kits with balloons, lights, confetti, and themed décor delivered to your door. 🎁",
  },
  {
    keywords: ["concierge", "let us do it", "full service", "plan for me"],
    answer: "With 'Let Us Do It', our concierge team handles all vendor coordination for you — just fill in your event details and we manage the rest. 🌟",
  },
];

function getFAQAnswer(text) {
  const lower = text.toLowerCase();
  for (const item of FAQ_KB) {
    if (item.keywords.some(kw => lower.includes(kw))) return item.answer;
  }
  return null;
}

// conversationId + vendorName → vendor chat mode (join existing approved conversation)
// no props (default) → support chat mode
export default function MiniChatWidget({ onClose, conversationId: existingConvoId, vendorName }) {
  const isVendorChat = !!existingConvoId;
  const { user, token: authToken } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(existingConvoId || null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?._id) {
      setMessages([{ text: "Please sign in to chat.", sender: "system", ts: Date.now() }]);
      return;
    }

    const socket = io(BASE_URL, {
      auth: { token: authToken },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", async () => {
      if (isVendorChat) {
        // Join the existing approved conversation room
        socket.emit("join_conversation", { conversationId: existingConvoId });
        // Load history
        try {
          const res = await fetch(`${BASE_URL}/messages/${existingConvoId}/messages`, { credentials: "include" });
          if (res.ok) {
            const hist = await res.json();
            if (Array.isArray(hist) && hist.length > 0) {
              setMessages(hist.map(m => ({
                text: m.content,
                sender: m.sender === "user" ? "user" : "vendor",
                ts: new Date(m.createdAt).getTime(),
              })));
            } else {
              setMessages([{ text: `Start chatting with ${vendorName || "the vendor"}.`, sender: "system", ts: Date.now() }]);
            }
          }
        } catch {
          setMessages([{ text: `Chat with ${vendorName || "the vendor"}.`, sender: "system", ts: Date.now() }]);
        }
      } else {
        socket.emit("open_conversation", { chatType: "SUPPORT" });
      }
    });

    if (!isVendorChat) {
      socket.on("conversation_opened", async ({ _id }) => {
        setConversationId(_id);
        try {
          const res = await fetch(`${BASE_URL}/messages/${_id}/messages`, { credentials: "include" });
          if (res.ok) {
            const hist = await res.json();
            if (Array.isArray(hist) && hist.length > 0) {
              setMessages(hist.map(m => ({
                text: m.content,
                sender: m.sender === "user" ? "user" : "support",
                ts: new Date(m.createdAt).getTime(),
              })));
            } else {
              setMessages([{ text: "Hi! How can we help you today? 😊", sender: "support", ts: Date.now() }]);
            }
          }
        } catch {
          setMessages([{ text: "Hi! How can we help you today? 😊", sender: "support", ts: Date.now() }]);
        }
      });
    }

    socket.on("new_message", (msg) => {
      if (msg.sender === "user") return;
      setMessages(prev => [...prev, {
        text: msg.content,
        sender: isVendorChat ? "vendor" : "support",
        ts: Date.now(),
      }]);
    });

    return () => socket.disconnect();
  }, [user?._id]);

  const sendMessage = (text) => {
    const convoId = isVendorChat ? existingConvoId : conversationId;
    if (!text.trim() || !convoId) return;
    setMessages(prev => [...prev, { text, sender: "user", ts: Date.now() }]);
    socketRef.current?.emit("send_message", { conversationId: convoId, sender: "user", content: text });
    localStorage.setItem("tendr:lastMsgAt", Date.now().toString());
    setInput("");
    if (!isVendorChat) {
      const faqAnswer = getFAQAnswer(text);
      if (faqAnswer) {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: faqAnswer, sender: "support", ts: Date.now() }]);
        }, 600);
      }
    }
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    const convoId = isVendorChat ? existingConvoId : conversationId;
    if (!file || !convoId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = `[img:${ev.target.result}]`;
      setMessages(prev => [...prev, { text: content, sender: "user", ts: Date.now() }]);
      socketRef.current?.emit("send_message", { conversationId: convoId, sender: "user", content });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const renderMsg = (text) => {
    if (text?.startsWith("[img:")) {
      const src = text.replace("[img:", "").replace(/\]$/, "");
      return <img src={src} alt="sent" style={{ maxWidth: 200, borderRadius: 8 }} />;
    }
    return text;
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      right: 16,
      width: "min(380px, calc(100vw - 32px))",
      height: 520,
      background: "#FFFCF5",
      borderRadius: 20,
      boxShadow: "0 8px 40px rgba(139,69,19,0.18), 0 2px 12px rgba(0,0,0,0.1)",
      border: "1.5px solid rgba(196,122,46,0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 1000,
      fontFamily: font,
      overflow: "hidden",
      animation: "qv-fade 0.2s ease",
    }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>
          {isVendorChat ? "🏪" : "🤝"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
            {isVendorChat ? (vendorName || "Vendor") : "Tendr Support"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
            {isVendorChat ? "Active chat" : "Usually replies in a few minutes"}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : msg.sender === "system" ? "center" : "flex-start",
            maxWidth: "82%",
          }}>
            <div style={{
              background: msg.sender === "user" ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : msg.sender === "system" ? "transparent" : "#f3f4f6",
              color: msg.sender === "user" ? "#fff" : msg.sender === "system" ? "#9B7450" : "#1f2937",
              padding: msg.sender === "system" ? "0" : "9px 13px",
              borderRadius: msg.sender === "user" ? "14px 14px 4px 14px" : msg.sender === "system" ? 0 : "14px 14px 14px 4px",
              fontSize: msg.sender === "system" ? 11 : 13,
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}>
              {renderMsg(msg.text)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions — support only */}
      {!isVendorChat && (
        <div style={{ padding: "6px 10px", borderTop: "1px solid rgba(196,122,46,0.1)", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.25)", background: "#fff", color: "#6B3A1F", fontSize: 11, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(196,122,46,0.1)", display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ cursor: "pointer", width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
          📎
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        </label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder={user?._id ? "Type a message..." : "Sign in to chat"}
          disabled={!user?._id}
          style={{ flex: 1, padding: "9px 13px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 13, fontFamily: font, outline: "none", background: user?._id ? "#fff" : "#f9f9f9" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || !user?._id}
          style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: input.trim() && user?._id ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: "#fff", cursor: input.trim() && user?._id ? "pointer" : "not-allowed", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          ➤
        </button>
      </div>
    </div>
  );
}
