import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io as socketIO } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL;

const GOLD = "#c49b30";
const INK  = "#0c0702";
const BG   = "#100c07";

export default function DirectChat() {
  const { conversationId } = useParams();

  const [messages, setMessages]       = useState([]);
  const [convo, setConvo]             = useState(null);
  const [input, setInput]             = useState("");
  const [connected, setConnected]     = useState(false);
  const [error, setError]             = useState(null);
  const [sending, setSending]         = useState(false);

  const socketRef  = useRef(null);
  const bottomRef  = useRef(null);
  const visitorId  = useRef(null);

  // Derive visitorId from localStorage on mount
  useEffect(() => {
    visitorId.current = localStorage.getItem("tendr:visitor_id");
  }, []);

  // Load existing messages from REST
  useEffect(() => {
    if (!visitorId.current) return;
    fetch(`${BASE_URL}/conversations/direct/${conversationId}/messages?visitorId=${encodeURIComponent(visitorId.current)}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(({ messages: msgs, conversation }) => {
        setMessages(msgs || []);
        setConvo(conversation || null);
      })
      .catch(() => setError("Unable to load this conversation. The link may have expired or you're on a different device."));
  }, [conversationId]);

  // Connect to socket as guest
  useEffect(() => {
    if (!visitorId.current) return;

    const socket = socketIO(SOCKET_URL, {
      transports: ["websocket"],
      query: { visitorId: visitorId.current },
      // No auth.token — this is the guest path
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_direct_conversation", { conversationId });
    });

    socket.on("direct_joined", () => setConnected(true));

    socket.on("new_message", (msg) => {
      setMessages(prev => {
        // Deduplicate by _id
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("direct_error", ({ message: msg }) => setError(msg));

    socket.on("disconnect", () => setConnected(false));

    return () => socket.disconnect();
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending || !connected) return;
    setSending(true);
    setInput("");
    socketRef.current?.emit("send_direct_message", { conversationId, content });
    // Optimistic local add (will be deduplicated when socket echoes back)
    const optimistic = { _id: `opt_${Date.now()}`, sender: "user", content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setSending(false);
  }, [input, sending, connected, conversationId]);

  const vendorName = convo?.vendorName || "Vendor";
  const visitorName = convo?.visitorName || "You";

  if (error) {
    return (
      <div style={{ minHeight: "100dvh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{ color: "#f5f0e8", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Conversation Unavailable</div>
          <div style={{ color: "rgba(245,240,232,0.5)", fontSize: 14, lineHeight: 1.7 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: BG, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(196,155,48,0.15)",
        background: "rgba(16,12,7,0.95)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `rgba(196,155,48,0.15)`, border: `1.5px solid rgba(196,155,48,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: GOLD, fontWeight: 700 }}>
          {vendorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 15 }}>{vendorName}</div>
          <div style={{ color: connected ? "#4caf80" : "rgba(245,240,232,0.35)", fontSize: 11, fontWeight: 500 }}>
            {connected ? "● Connected" : "○ Connecting…"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(245,240,232,0.28)", lineHeight: 1.5, textAlign: "right" }}>
          Direct Chat<br />
          <span style={{ color: "rgba(196,155,48,0.5)" }}>Outside Tendr</span>
        </div>
      </div>

      {/* Notice banner */}
      <div style={{
        background: "rgba(196,155,48,0.08)", borderBottom: "1px solid rgba(196,155,48,0.1)",
        padding: "8px 20px", fontSize: 12, color: "rgba(196,155,48,0.7)", lineHeight: 1.5,
        textAlign: "center",
      }}>
        This is a direct conversation between you and {vendorName}. Tendr is not involved — no booking protection applies.
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(245,240,232,0.3)", fontSize: 13, marginTop: 40 }}>
            Say hello to {vendorName}!
          </div>
        )}
        {messages.map((msg, i) => {
          const isGuest = msg.sender === "user";
          return (
            <div key={msg._id || i} style={{ display: "flex", justifyContent: isGuest ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "72%", padding: "10px 14px", borderRadius: isGuest ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: isGuest ? GOLD : "rgba(255,255,255,0.07)",
                color: isGuest ? INK : "#f5f0e8",
                fontSize: 14, lineHeight: 1.6, fontWeight: isGuest ? 500 : 400,
                boxShadow: isGuest ? "0 2px 8px rgba(196,155,48,0.25)" : "0 1px 4px rgba(0,0,0,0.3)",
              }}>
                {!isGuest && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {vendorName}
                  </div>
                )}
                {msg.content}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.55, textAlign: "right" }}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid rgba(196,155,48,0.15)", padding: "12px 16px",
        background: "rgba(16,12,7,0.95)", backdropFilter: "blur(12px)",
        display: "flex", gap: 10, alignItems: "flex-end",
        position: "sticky", bottom: 0,
      }}>
        <textarea
          rows={1}
          placeholder={`Message ${vendorName}…`}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          style={{
            flex: 1, resize: "none", overflow: "hidden",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(196,155,48,0.2)",
            borderRadius: 10, padding: "10px 14px", color: "#f5f0e8", fontSize: 14,
            outline: "none", fontFamily: "inherit", lineHeight: 1.5, minHeight: 40,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !connected || sending}
          style={{
            width: 42, height: 42, borderRadius: 10, border: "none",
            background: input.trim() && connected ? GOLD : "rgba(196,155,48,0.2)",
            color: input.trim() && connected ? INK : "rgba(196,155,48,0.4)",
            fontSize: 18, cursor: input.trim() && connected ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.2s",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
