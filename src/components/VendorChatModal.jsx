import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import router from "../router";
import { io } from "socket.io-client";
import { getBotFlow, OTHER_OPTION } from "../utils/chatbot";
import { addVendorToCompare, setFinalisedVendor } from "../redux/listingFiltersSlice";
import { useChatOverlay } from "../context/ChatContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

function BotTextInput({ onSubmit, placeholder = "Type your answer…" }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onSubmit(val.trim()); setVal(""); } }}
        placeholder={placeholder}
        style={{ flex: 1, padding: "9px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.3)", fontSize: 13, fontFamily: font, outline: "none", background: "#fff" }}
      />
      <button onClick={() => { if (val.trim()) { onSubmit(val.trim()); setVal(""); } }}
        style={{ padding: "9px 18px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
        Next →
      </button>
    </div>
  );
}

export default function VendorChatModal() {
  const { chatState, minimizeChat, closeChat, setConversationId: setCtxConvoId } = useChatOverlay();
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.auth.user);
  const authToken = useSelector(s => s.auth.token);
  const reduxFormData = useSelector(s => s.eventPlanning.formData || {});

  const vendor = chatState?.vendor;
  const isExistingChat = !!chatState?.isExisting;
  const fromActiveChats = !!chatState?.vendor?.fromActiveChats;
  const isConcierge = !!chatState?.isConcierge;

  // ── Bot state ────────────────────────────────────────────────────────────────
  // Concierge chats have no bot — skip questions entirely
  const botFlow = (!isExistingChat && !isConcierge && vendor) ? getBotFlow(vendor.serviceType, undefined, reduxFormData) : [];
  const [botStep, setBotStep] = useState(0);
  const [botAnswers, setBotAnswers] = useState({});
  const [botDone, setBotDone] = useState(isExistingChat || botFlow.length === 0);
  const botAnswersRef = useRef({});
  const botDoneRef = useRef(isExistingChat || botFlow.length === 0);
  const summarySentRef = useRef(false);

  // ── Chat state ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [botOtherMode, setBotOtherMode] = useState(false); // "Other..." selected — show text input
  const [conversationId, setConversationId] = useState(null);
  const [approved, setApproved] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Chat action state ────────────────────────────────────────────────────────
  const [chatCompleted, setChatCompleted] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const finalisedVendors = useSelector(s => s.listingFilters.finalisedVendors || {});
  const isThisVendorFinalised = vendor?._id && (() => {
    const entry = finalisedVendors[vendor?.serviceType];
    if (!entry) return false;
    const arr = Array.isArray(entry) ? entry : [entry];
    return arr.some(v => v._id === vendor._id);
  })();

  // ── Minimise animation state ─────────────────────────────────────────────────
  const [minimizing, setMinimizing] = useState(false);

  // Track previous vendor so we only reset when vendor ACTUALLY changes
  const prevResetKeyRef = useRef(null);

  // ── Reset when vendor/mode changes ──────────────────────────────────────────
  useEffect(() => {
    if (!chatState) return;
    const resetKey = `${chatState.vendor?._id}-${chatState.isExisting}`;
    // Don't reset if same vendor + same mode (prevents progress loss on re-renders)
    if (resetKey === prevResetKeyRef.current) return;
    prevResetKeyRef.current = resetKey;

    const existing = !!chatState.isExisting;
    setBotStep(0);
    setBotAnswers({});
    botAnswersRef.current = {};
    const flow = existing ? [] : getBotFlow(chatState.vendor?.serviceType, undefined, reduxFormData);
    const done = existing || flow.length === 0;
    setBotDone(done);
    botDoneRef.current = done;
    summarySentRef.current = false;
    setMessages([]);
    setText("");
    setConversationId(chatState.conversationId || null);
    setApproved(existing ? !!chatState.vendor?.approved : false);
    setChatCompleted(false);
    setMinimizing(false);
  }, [chatState?.vendor?._id, chatState?.isExisting]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botStep]);

  // ── Escape key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatState || chatState.minimized) return;
    const handler = (e) => { if (e.key === "Escape") handleMinimize(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatState?.minimized]);

  // ── Minimize with animation ──────────────────────────────────────────────────
  const handleMinimize = () => {
    setMinimizing(true);
    setTimeout(() => {
      setMinimizing(false);
      minimizeChat();
    }, 350);
  };

  // ── Socket ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatState || !currentUser?._id) return;

    const socket = io(BASE_URL, {
      query: { userId: currentUser._id, role: "user" },
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    // New concierge chat: open immediately on connect (no bot)
    if (isConcierge && !chatState.conversationId) {
      socket.on("connect", () => {
        socket.emit("open_conversation", { chatType: "concierge" });
      });
    }

    // Existing chat: join room directly
    if (isExistingChat && chatState.conversationId) {
      socket.on("connect", async () => {
        const cid = chatState.conversationId;
        socket.emit("join_conversation", { conversationId: cid });
        setConversationId(cid);
        if (vendor?.approved) setApproved(true);
        try {
          const res = await fetch(`${BASE_URL}/messages/${cid}/messages`, {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            credentials: "include",
          });
          if (res.ok) {
            const hist = await res.json();
            if (Array.isArray(hist) && hist.length > 0) {
              setMessages(hist.map(m => ({
                text: m.content, sender: m.sender === "user" ? "user" : "vendor",
                ts: new Date(m.createdAt).getTime(),
              })));
            }
          }
        } catch {}
      });
    }

    socket.on("conversation_opened", async ({ _id, chatApproved: isApproved }) => {
      setConversationId(_id);
      setCtxConvoId(_id);
      if (isApproved) setApproved(true);
      dispatch(addVendorToCompare(vendor));

      if (botDoneRef.current && Object.keys(botAnswersRef.current).length > 0 && !summarySentRef.current) {
        summarySentRef.current = true;
        const flow = getBotFlow(vendor?.serviceType);
        const qaLines = flow
          .filter(s => botAnswersRef.current[s.key])
          .map(s => `Q: ${s.question}\nA: ${botAnswersRef.current[s.key]}`);
        const fd = reduxFormData;
        const fullMsg = [
          "📋 Chat Request Details", "──────────────────",
          fd.eventType ? `Event: ${fd.eventType}` : null,
          fd.date      ? `Date: ${fd.date}` : null,
          fd.guests    ? `Guests: ${fd.guests}` : null,
          fd.budget    ? `Budget: ${fd.budget}` : null,
          fd.location  ? `City: ${fd.location}` : null,
          qaLines.length ? `\nYour Answers:\n${qaLines.join("\n\n")}` : null,
        ].filter(Boolean).join("\n");
        setTimeout(() => {
          socket.emit("send_message", { conversationId: _id, sender: "user", content: fullMsg });
        }, 400);
      }

      try {
        const res = await fetch(`${BASE_URL}/messages/${_id}/messages`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          credentials: "include",
        });
        if (res.ok) {
          const hist = await res.json();
          if (Array.isArray(hist) && hist.length > 0) {
            setMessages(hist.map(m => ({
              text: m.content, sender: m.sender === "user" ? "user" : "vendor",
              ts: new Date(m.createdAt).getTime(),
            })));
          }
        }
      } catch {}
    });

    socket.on("chat_approved", () => setApproved(true));
    socket.on("new_message", (msg) => {
      if (msg.sender === "user") return;
      setMessages(prev => [...prev, { text: msg.content, sender: "vendor", ts: Date.now() }]);
    });

    return () => socket.disconnect();
  }, [chatState?.vendor?._id, currentUser?._id]);

  const openConversation = useCallback((answers) => {
    if (!socketRef.current) return;
    if (isConcierge) {
      socketRef.current.emit("open_conversation", { chatType: "concierge" });
    } else if (vendor?._id && vendor._id !== "concierge") {
      socketRef.current.emit("open_conversation", {
        chatType: "VENDOR",
        vendorId: vendor._id,
        eventDetails: { ...reduxFormData, ...answers },
      });
    }
  }, [vendor?._id, isConcierge, reduxFormData]);

  const handleBotAnswer = (answer) => {
    if (answer === OTHER_OPTION) {
      // Don't advance — show a text input so user can describe their specific need
      setBotOtherMode(true);
      return;
    }
    setBotOtherMode(false);
    const step = botFlow[botStep];
    const newAnswers = { ...botAnswers, [step.key]: answer };
    setBotAnswers(newAnswers);
    botAnswersRef.current = newAnswers;
    if (botStep + 1 < botFlow.length) {
      setBotStep(p => p + 1);
    } else {
      setBotDone(true);
      botDoneRef.current = true;
      openConversation(newAnswers);
    }
  };

  const handleFinalise = () => {
    if (!chatCompleted || !vendor) return;
    dispatch(setFinalisedVendor(vendor));
    // Notify admin via chat
    if (socketRef.current && conversationId) {
      socketRef.current.emit("send_message", {
        conversationId,
        sender: "customer-care",
        content: `[FINALISED] ✅ Customer has completed the chat and finalised ${vendor.name || "this vendor"}. Ready for payment.`,
      });
    }
    setMessages(prev => [...prev, {
      text: `✅ ${vendor.name} added to your booking. Tap "Review & Pay" when ready.`,
      sender: "system", ts: Date.now(),
    }]);
  };

  const sendText = () => {
    if (!approved || !text.trim() || !conversationId) return;
    const content = text.trim();
    setMessages(prev => [...prev, { text: content, sender: "user", ts: Date.now() }]);
    socketRef.current?.emit("send_message", { conversationId, sender: "user", content });
    setText("");
  };

  const sendImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId || !approved) return;
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
    if (!text) return null;
    if (text.startsWith("[img:")) {
      const src = text.replace("[img:", "").replace(/\]$/, "");
      return <img src={src} alt="sent" style={{ maxWidth: "100%", borderRadius: 8, display: "block" }} />;
    }
    if (text.startsWith("[FINALISED]")) {
      return <span style={{ color: "#15803d", fontWeight: 600 }}>{text.replace("[FINALISED] ", "")}</span>;
    }
    // MCQ packages — render as selectable option buttons
    if (text.startsWith("[MCQ_PACKAGES:")) {
      const clean = text.replace(/\[MCQ_PACKAGES:[^\]]+\]\n?/, "");
      const tierNames = ["Basic", "Standard", "Premium"];
      const optionLines = ["1️⃣","2️⃣","3️⃣"].map((em, i) => {
        const start = clean.indexOf(em);
        const next = ["1️⃣","2️⃣","3️⃣"][i + 1];
        const end = next ? clean.indexOf(next) : clean.indexOf("\nReply with");
        return start >= 0 ? clean.slice(start, end > 0 ? end : undefined).trim() : null;
      }).filter(Boolean);
      return (
        <div>
          <p style={{ margin: "0 0 8px", whiteSpace: "pre-line", fontWeight: 600, fontSize: 13 }}>
            {clean.split('\n').slice(0, 2).join('\n')}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {optionLines.map((opt, i) => (
              <button key={i}
                onClick={() => {
                  const reply = `I'd like the ${tierNames[i]} package:\n\n${opt}`;
                  setMessages(prev => [...prev, { text: reply, sender: "user", ts: Date.now() }]);
                  socketRef.current?.emit("send_message", { conversationId, sender: "user", content: reply });
                }}
                style={{ textAlign: "left", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", color: "#2C1A0E", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "pre-line", lineHeight: 1.4 }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
              >{opt}</button>
            ))}
            <button
              onClick={() => {
                const reply = "No specific package — please suggest what suits my event.";
                setMessages(prev => [...prev, { text: reply, sender: "user", ts: Date.now() }]);
                socketRef.current?.emit("send_message", { conversationId, sender: "user", content: reply });
              }}
              style={{ textAlign: "center", padding: "7px 12px", borderRadius: 10, border: "1px dashed rgba(139,69,19,0.25)", background: "transparent", color: "#9B7450", fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
            >Skip → discuss directly</button>
          </div>
        </div>
      );
    }
    return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
  };

  if (!chatState || chatState.minimized) return null;

  // Event details from form
  const fd = reduxFormData || {};
  const formLines = [
    fd.eventType && { label: "Event", value: fd.eventType },
    fd.date && { label: "Date", value: fd.date },
    fd.guests && { label: "Guests", value: fd.guests },
    fd.budget && { label: "Budget", value: fd.budget },
    fd.location && { label: "City", value: fd.location },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes vcm-in {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes vcm-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, 120%) scale(0.5); }
        }
        .vcm-enter { animation: vcm-in 0.22s cubic-bezier(0.4,0,0.2,1) forwards; }
        .vcm-exit  { animation: vcm-out 0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleMinimize}
        style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(0,0,0,0.38)",
          backdropFilter: "blur(2px)",
          opacity: minimizing ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      />

      {/* Modal window */}
      <div
        className={minimizing ? "vcm-exit" : "vcm-enter vcm-root"}
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1201,
          width: "min(94vw, 660px)",
          height: "min(86vh, 700px)",
          background: "#FFFCF5",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(44,26,14,0.22), 0 4px 20px rgba(0,0,0,0.1)",
          border: "1.5px solid rgba(196,122,46,0.18)",
          display: "flex",
          flexDirection: "column",
          fontFamily: font,
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{ background: isConcierge ? "linear-gradient(135deg,#0369a1 0%,#0284c7 100%)" : "linear-gradient(135deg,#2C1A0E 0%,#4A2810 100%)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Back to Active Chats button */}
          {fromActiveChats && (
            <button
              onClick={() => {
                closeChat();
                document.dispatchEvent(new CustomEvent("tendr:open-active-chats"));
              }}
              title="Back to all chats"
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >‹</button>
          )}
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 17, flexShrink: 0 }}>
            {(vendor?.name || "V")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor?.name || "Vendor"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              {vendor?.serviceType || "Service"} · {approved ? "Chat active" : "Awaiting approval"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleMinimize}
              title="Minimise (Esc)"
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
            >⌄</button>
            <button
              onClick={closeChat}
              title="Close chat"
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
          </div>
        </div>

        {/* ── Event details bar (always visible if form data exists) ── */}
        {formLines.length > 0 && (
          <div style={{ background: "rgba(196,122,46,0.06)", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "10px 18px", flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Your Event Details</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {formLines.map(({ label, value }) => (
                <span key={label} style={{ fontSize: 12, fontWeight: 500, background: "#fff", borderRadius: 100, padding: "3px 11px", color: "#5a3a1a", border: "1px solid rgba(196,122,46,0.2)" }}>
                  <b style={{ color: "#C47A2E" }}>{label}:</b> {value}
                </span>
              ))}
            </div>
          </div>
        )}
        {formLines.length === 0 && (
          <div style={{ background: "rgba(196,122,46,0.04)", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "8px 18px", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#9B7450" }}>ℹ️ No event details yet —</span>
            <a href="/booking" style={{ fontSize: 12, color: "#C47A2E", fontWeight: 700, textDecoration: "none" }} onClick={closeChat}>fill the event form first →</a>
          </div>
        )}

        {/* ── Messages / Bot area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Bot questions (new chats only) */}
          {!botDone && (
            <>
              {botStep === 0 && (
                <div style={{ alignSelf: "flex-start", maxWidth: "82%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 13, color: "#1a1a1a", lineHeight: 1.55 }}>
                  👋 A few quick questions before connecting you with <strong>{vendor?.name}</strong>.
                </div>
              )}
              {botFlow.slice(0, botStep).map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "9px 13px", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", fontSize: 13, color: "#1a1a1a" }}>{step.question}</div>
                  <div style={{ alignSelf: "flex-end", maxWidth: "80%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: "16px 16px 4px 16px", padding: "9px 13px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{botAnswers[step.key]}</div>
                </div>
              ))}
              {botStep < botFlow.length && (() => {
                const cur = botFlow[botStep];
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ alignSelf: "flex-start", maxWidth: "82%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>{cur.question}</div>
                    {cur.type === "text" || botOtherMode
                      ? <BotTextInput
                          onSubmit={(val) => { setBotOtherMode(false); handleBotAnswer(val); }}
                          placeholder={botOtherMode ? "Describe what you need…" : "Type your answer…"}
                        />
                      : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {cur.options.map(opt => (
                            <button key={opt} onClick={() => handleBotAnswer(opt)}
                              style={{ padding: "8px 16px", borderRadius: 100, border: `1.5px solid ${opt === OTHER_OPTION ? "rgba(139,69,19,0.25)" : "rgba(196,122,46,0.4)"}`, background: opt === OTHER_OPTION ? "#f9f9f9" : "#fff", color: opt === OTHER_OPTION ? "#9B7450" : "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.08)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = opt === OTHER_OPTION ? "#f9f9f9" : "#fff"; }}
                            >{opt}</button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })()}
            </>
          )}

          {/* Waiting state */}
          {botDone && !approved && (
            <div style={{ textAlign: "center", padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E22,#CCAB4A22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⏳</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>Request Sent!</div>
              <div style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.65, maxWidth: 300 }}>
                Our team is reviewing your request. We'll connect you with <strong>{vendor?.name}</strong> shortly.
              </div>
              <button onClick={handleMinimize}
                style={{ marginTop: 6, padding: "9px 20px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Minimise & wait
              </button>
            </div>
          )}

          {/* Chat messages */}
          {(approved || isExistingChat) && messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.sender === "user" ? "flex-end" : msg.sender === "system" ? "center" : "flex-start", maxWidth: "80%" }}>
              {msg.sender === "system" ? (
                <div style={{ fontSize: 12, color: "#9B7450", textAlign: "center", padding: "2px 8px" }}>{renderMsg(msg.text)}</div>
              ) : (
                <div style={{
                  background: msg.sender === "user" ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#fff",
                  color: msg.sender === "user" ? "#fff" : "#1a1a1a",
                  padding: "9px 13px",
                  borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: 13, lineHeight: 1.5,
                  boxShadow: msg.sender === "user" ? "0 2px 8px rgba(196,122,46,0.25)" : "0 1px 4px rgba(0,0,0,0.07)",
                }}>
                  {renderMsg(msg.text)}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input + action bar ── */}
        <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", padding: "10px 14px", flexShrink: 0, background: "#fff", position: "relative" }}>
          {(approved || isExistingChat) ? (
            <>
              {/* Message row */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <label title="Attach image" style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5f0ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>
                  📌
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={sendImage} />
                </label>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendText()}
                  placeholder="Write your message…"
                  style={{ flex: 1, padding: "9px 14px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", background: "#fff" }}
                />
                <button onClick={sendText} disabled={!text.trim()}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: text.trim() ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: "#fff", cursor: text.trim() ? "pointer" : "not-allowed", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  ➤
                </button>
              </div>
              {/* Review & Pay — shows after vendor is finalised (vendor chats only) */}
              {isThisVendorFinalised && !isConcierge && (
                <>
                  <button
                    onClick={() => setShowReviewPopup(true)}
                    style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'Outfit', sans-serif", cursor: "pointer", boxShadow: "0 3px 12px rgba(21,128,61,0.35)", marginBottom: 8 }}
                  >
                    Review & Pay →
                  </button>
                  {showReviewPopup && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 24 }}>
                      <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", width: "85%", maxWidth: 340, boxShadow: "0 16px 48px rgba(44,26,14,0.2)", fontFamily: "'Outfit', sans-serif", textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                        <h3 style={{ fontSize: 17, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Ready to proceed?</h3>
                        <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6 }}>
                          You can complete your booking now, or browse for more vendors first.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <button onClick={() => { closeChat(); router.navigate("/booking/review"); }}
                            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                            Continue to Booking →
                          </button>
                          <button onClick={() => { closeChat(); router.navigate("/listings"); }}
                            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                            Browse More Vendors
                          </button>
                          <button onClick={() => setShowReviewPopup(false)}
                            style={{ fontSize: 12, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Hint for chat completion — vendor chats only */}
              {!chatCompleted && !isConcierge && (
                <div style={{ borderLeft: "3px solid #C47A2E", paddingLeft: 10, marginBottom: 8, background: "rgba(196,122,46,0.05)", borderRadius: "0 8px 8px 0", padding: "6px 10px 6px 10px" }}>
                  <p style={{ fontSize: 11, color: "#7A5535", margin: 0, fontWeight: 600 }}>
                    Mark chat as completed when you are done discussing
                  </p>
                </div>
              )}
              {/* Action buttons — vendor chats only (not concierge) */}
              {!isConcierge && (
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setChatCompleted(true)}
                    disabled={chatCompleted}
                    style={{ padding: "6px 14px", borderRadius: 100, border: "none", background: chatCompleted ? "#f0fdf4" : "linear-gradient(135deg,#0369a1,#3b82f6)", color: chatCompleted ? "#15803d" : "#fff", fontSize: 12, fontWeight: 700, cursor: chatCompleted ? "default" : "pointer", fontFamily: font, whiteSpace: "nowrap" }}
                  >
                    {chatCompleted ? "✓ Completed" : "Chat Completed"}
                  </button>
                  <button
                    onClick={handleFinalise}
                    disabled={!chatCompleted || isThisVendorFinalised}
                    title={!chatCompleted ? "Mark chat as completed first" : ""}
                    style={{ padding: "6px 14px", borderRadius: 100, border: "none", background: isThisVendorFinalised ? "linear-gradient(135deg,#15803d,#22c55e)" : !chatCompleted ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: (!chatCompleted && !isThisVendorFinalised) ? "#9ca3af" : "#fff", fontSize: 12, fontWeight: 700, cursor: (!chatCompleted && !isThisVendorFinalised) ? "not-allowed" : "pointer", fontFamily: font, whiteSpace: "nowrap", boxShadow: (chatCompleted && !isThisVendorFinalised) ? "0 2px 8px rgba(196,122,46,0.35)" : "none" }}
                  >
                    {isThisVendorFinalised ? "✓ Finalised" : "Finalise Vendor"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", fontSize: 12, color: "#9B7450", padding: "4px 0" }}>
              {botDone ? "Waiting for team approval…" : "Answer the questions above to continue"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
