import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const QUICK_QUESTIONS = [
  "How do I book a vendor?",
  "What areas do you serve?",
  "How does chat approval work?",
  "What is the refund policy?",
  "I need help with my booking",
];

export default function MiniChatWidget({ onClose }) {
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [approved, setApproved] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect socket
  useEffect(() => {
    if (!user?._id) {
      setMessages([{ text: "Please sign in to chat with support.", sender: "system", ts: Date.now() }]);
      return;
    }

    const socket = io(BASE_URL, {
      query: { userId: user._id, role: "user" },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("open_conversation", { chatType: "SUPPORT" });
    });

    socket.on("conversation_opened", async ({ _id, chatApproved: ok }) => {
      setConversationId(_id);
      setApproved(true); // support chats are auto-approved
      // Load history
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

    socket.on("new_message", (msg) => {
      if (msg.sender === "user") return;
      setMessages(prev => [...prev, { text: msg.content, sender: "support", ts: Date.now() }]);
    });

    return () => socket.disconnect();
  }, [user?._id]);

  const sendMessage = (text) => {
    if (!text.trim() || !conversationId) return;
    setMessages(prev => [...prev, { text, sender: "user", ts: Date.now() }]);
    socketRef.current?.emit("send_message", { conversationId, sender: "user", content: text });
    setInput("");
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = `[img:${ev.target.result}]`;
      setMessages(prev => [...prev, { text: content, sender: "user", ts: Date.now() }]);
      socketRef.current?.emit("send_message", { conversationId, sender: "user", content });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const renderMsg = (text) => {
    if (text?.startsWith("[img:")) {
      const src = text.replace("[img:", "").replace(/\]$/, "");
      return <img src={src} alt="sent" style={{ maxWidth: 180, borderRadius: 8 }} />;
    }
    return text;
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      right: 24,
      width: 330,
      height: 460,
      background: "#FFFCF5",
      borderRadius: 20,
      boxShadow: "0 8px 40px rgba(139,69,19,0.18), 0 2px 12px rgba(0,0,0,0.1)",
      border: "1.5px solid rgba(196,122,46,0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 1000,
      fontFamily: font,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤝</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Tendr Support</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Usually replies in a few minutes</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : msg.sender === "system" ? "center" : "flex-start",
            maxWidth: "82%",
          }}>
            <div style={{
              background: msg.sender === "user" ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : msg.sender === "system" ? "transparent" : "#f3f4f6",
              color: msg.sender === "user" ? "#fff" : msg.sender === "system" ? "#9B7450" : "#1f2937",
              padding: msg.sender === "system" ? "0" : "8px 12px",
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

      {/* Quick questions */}
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

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(196,122,46,0.1)", display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ cursor: "pointer", width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
          📎
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        </label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder={user?._id ? "Type a message..." : "Sign in to chat"}
          disabled={!user?._id}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 13, fontFamily: font, outline: "none", background: user?._id ? "#fff" : "#f9f9f9" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || !user?._id}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: input.trim() && user?._id ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: "#fff", cursor: input.trim() && user?._id ? "pointer" : "not-allowed", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          ➤
        </button>
      </div>
    </div>
  );
}
