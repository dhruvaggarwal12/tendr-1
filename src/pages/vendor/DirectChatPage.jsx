import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io as socketIO } from "socket.io-client";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  DOC_THEMES, buildQuoteHTML, buildStandaloneInvoiceHTML, buildContractHTML, exportDocPdf,
} from "../../utils/vendorDocs";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL;
const DOC_MARKER = "__TENDR_DOC__:";

const GOLD = "#C47A2E";
const INK  = "#2C1A0E";
const font = "'Outfit',sans-serif";

// Parses a chat message's content for an embedded document (quote/invoice/contract) sent via
// the composer below. Returns null for a plain text message.
function parseDocMessage(content) {
  if (typeof content !== "string" || !content.startsWith(DOC_MARKER)) return null;
  try { return JSON.parse(content.slice(DOC_MARKER.length)); } catch { return null; }
}

function DocBubble({ doc }) {
  return (
    <div style={{ background: "rgba(196,122,46,0.1)", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 12, padding: "12px 14px", minWidth: 180 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>📄 {doc.kind?.charAt(0).toUpperCase() + doc.kind?.slice(1)}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 8 }}>{doc.label}</div>
      <a href={doc.dataUri} download={`${doc.kind}.pdf`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: GOLD, color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
        View / Download PDF
      </a>
    </div>
  );
}

// ── Price + Confirm Order — the lightweight alternative to a full Quote: type a number,
// confirm, and it logs straight into the Work tab (source:'Tendr Profile') without needing
// a PDF built first.
function ConfirmOrderModal({ onConfirm, onClose }) {
  const [amount, setAmount] = useState("");
  const [eventType, setEventType] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !Number.isFinite(amt) || confirming) return;
    setConfirming(true);
    setError("");
    try {
      await onConfirm({ amount: amt, eventType });
      onClose();
    } catch (e) {
      setError("Couldn't confirm the order — check your connection and try again.");
    } finally {
      setConfirming(false);
    }
  };

  const inp = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 14, color: INK, outline: "none", background: "#FFFCF5", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 360, padding: 20, fontFamily: font }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: INK, marginBottom: 4 }}>Confirm Order</div>
        <div style={{ fontSize: 12.5, color: "#9B7450", marginBottom: 16 }}>Logs this straight into your Work tab as a confirmed job.</div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>Price (₹) *</label>
          <input type="number" min="0" style={inp} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 25000" autoFocus />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>Event Type (optional)</label>
          <input style={inp} value={eventType} onChange={e => setEventType(e.target.value)} placeholder="e.g. Wedding" />
        </div>
        {error && <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#6B3A1F", fontFamily: font, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={confirm} disabled={!amount || Number(amount) <= 0 || confirming} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: (!amount || Number(amount) <= 0) ? "rgba(34,197,94,0.3)" : "#22C55E", color: "#fff", fontFamily: font, fontWeight: 800, cursor: (!amount || Number(amount) <= 0) ? "default" : "pointer" }}>
            {confirming ? "Confirming…" : "✅ Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document composer — Quote / Invoice / Contract, built and sent straight into the chat ──
function DocComposer({ vendorName, serviceType, defaultClientName, defaultClientPhone, onSend, onClose }) {
  const [kind, setKind] = useState("quote"); // quote | invoice | contract
  const [themeId, setThemeId] = useState("classic");
  const [clientName, setClientName] = useState(defaultClientName || "");
  const [clientPhone, setClientPhone] = useState(defaultClientPhone || "");
  const [items, setItems] = useState([{ desc: "", qty: 1, rate: "" }]);
  const [discount, setDiscount] = useState("");
  const [amount, setAmount] = useState("");
  const [advance, setAdvance] = useState("");
  const [eventType, setEventType] = useState("");
  const [sending, setSending] = useState(false);

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13.5, color: INK, outline: "none", background: "#FFFCF5", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 };

  const addItem = () => setItems(it => [...it, { desc: "", qty: 1, rate: "" }]);
  const setItem = (i, k, v) => setItems(it => it.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const removeItem = (i) => setItems(it => it.filter((_, idx) => idx !== i));
  const total = items.reduce((s, i) => s + (Number(i.qty)||1) * (Number(i.rate)||0), 0) - (Number(discount)||0);

  const theme = DOC_THEMES.find(t => t.id === themeId) || DOC_THEMES[0];

  const send = async () => {
    if (!clientName.trim() || sending) return;
    setSending(true);
    try {
      let html, label;
      if (kind === "quote") {
        html = buildQuoteHTML({ clientName, clientPhone, eventType, items, discount }, vendorName, serviceType, theme);
        label = `Quote — ₹${total.toLocaleString("en-IN")}`;
      } else if (kind === "invoice") {
        html = buildStandaloneInvoiceHTML({ clientName, clientPhone, eventType, items, discount }, vendorName, theme);
        label = `Invoice — ₹${total.toLocaleString("en-IN")}`;
      } else {
        html = buildContractHTML({ clientName, clientPhone, eventType, amount, advance }, vendorName, serviceType, theme);
        label = `Contract — ₹${Number(amount||0).toLocaleString("en-IN")}`;
      }
      const doc = await exportDocPdf(html, `${kind}.pdf`);
      const dataUri = doc.dataUri();
      await onSend({ kind, label, dataUri });
      onClose();
    } catch (e) {
      console.error("Failed to build/send document", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 480, maxHeight: "88dvh", overflowY: "auto", padding: "20px 20px calc(24px + env(safe-area-inset-bottom,0px))", fontFamily: font }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Send a document</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(196,122,46,0.1)", color: "#6B3A1F", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["quote","Quote"],["invoice","Invoice"],["contract","Contract"]].map(([k,l]) => (
            <button key={k} onClick={() => setKind(k)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1.5px solid ${kind===k?GOLD:"rgba(196,122,46,0.2)"}`, background: kind===k?`${GOLD}18`:"#fff", color: kind===k?GOLD:"#6B3A1F", fontFamily: font, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={lbl}>PDF Template</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DOC_THEMES.map(t => (
              <button key={t.id} onClick={() => setThemeId(t.id)} title={t.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 100, border: `1.5px solid ${themeId===t.id?t.swatch:"rgba(196,122,46,0.2)"}`, background: themeId===t.id?`${t.swatch}14`:"#fff", color: themeId===t.id?t.swatch:"#6B3A1F", fontFamily: font, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.swatch }} />{t.name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}><div style={lbl}>Client Name *</div><input style={inp} value={clientName} onChange={e => setClientName(e.target.value)} /></div>
          <div style={{ flex: 1 }}><div style={lbl}>Phone</div><input style={inp} value={clientPhone} onChange={e => setClientPhone(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: 12 }}><div style={lbl}>Event Type</div><input style={inp} value={eventType} onChange={e => setEventType(e.target.value)} placeholder="e.g. Wedding, Birthday" /></div>

        {(kind === "quote" || kind === "invoice") && (
          <>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={lbl}>Line Items</div>
                <button onClick={addItem} style={{ padding: "3px 10px", borderRadius: 7, border: "none", background: GOLD, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
              </div>
              {items.map((it, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 50px 85px 24px", gap: 4, marginBottom: 5 }}>
                  <input value={it.desc} onChange={e => setItem(i, "desc", e.target.value)} placeholder="Description" style={{ ...inp, padding: "7px 9px", fontSize: 12.5 }} />
                  <input type="number" min="1" value={it.qty} onChange={e => setItem(i, "qty", e.target.value)} style={{ ...inp, padding: "7px 4px", fontSize: 12.5, textAlign: "center" }} />
                  <input type="number" min="0" value={it.rate} onChange={e => setItem(i, "rate", e.target.value)} placeholder="₹" style={{ ...inp, padding: "7px 9px", fontSize: 12.5, textAlign: "right" }} />
                  <button onClick={() => removeItem(i)} disabled={items.length===1} style={{ border: "none", background: "transparent", color: "#DC2626", cursor: items.length===1?"default":"pointer", opacity: items.length===1?0.3:1 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
              <div style={{ flex: 1 }}><div style={lbl}>Discount (₹)</div><input type="number" style={inp} value={discount} onChange={e => setDiscount(e.target.value)} /></div>
              <div style={{ flex: 1, textAlign: "right", padding: "8px 12px", background: "rgba(196,122,46,0.06)", borderRadius: 9 }}>
                <div style={{ fontSize: 10, color: "#9B7450", textTransform: "uppercase" }}>Total</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: GOLD }}>₹{total.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </>
        )}
        {kind === "contract" && (
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><div style={lbl}>Amount (₹) *</div><input type="number" style={inp} value={amount} onChange={e => setAmount(e.target.value)} /></div>
            <div style={{ flex: 1 }}><div style={lbl}>Advance (₹)</div><input type="number" style={inp} value={advance} onChange={e => setAdvance(e.target.value)} /></div>
          </div>
        )}

        <button onClick={send} disabled={!clientName.trim() || sending || (kind==='contract' && !amount)} style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", background: (!clientName.trim()||sending||(kind==='contract'&&!amount)) ? "rgba(196,122,46,0.25)" : GOLD, color: "#fff", fontFamily: font, fontSize: 14.5, fontWeight: 700, cursor: (!clientName.trim()||sending)?"default":"pointer" }}>
          {sending ? "Building…" : "Send in Chat →"}
        </button>
      </div>
    </div>
  );
}

export default function VendorDirectChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector(s => s.auth || {});

  const [messages, setMessages] = useState([]);
  const [convo, setConvo] = useState(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/vendors/me/direct-chats/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(({ messages: msgs, conversation }) => { setMessages(msgs || []); setConvo(conversation || null); })
      .catch(() => setError("Unable to load this conversation."));
  }, [conversationId, token]);

  useEffect(() => {
    if (!token) return;
    const socket = socketIO(SOCKET_URL, { transports: ["websocket"], auth: { token } });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join_vendor_direct_conversation", { conversationId });
    });
    socket.on("direct_joined", () => setConnected(true));
    socket.on("direct_error", ({ message }) => setError(message));
    socket.on("new_message", (msg) => {
      if (String(msg.conversationId) !== String(conversationId)) return;
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
    });
    socket.on("disconnect", () => setConnected(false));
    return () => socket.disconnect();
  }, [conversationId, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendContent = useCallback(async (content) => {
    if (socketRef.current && connected) {
      socketRef.current.emit("send_vendor_direct_message", { conversationId, content });
    } else {
      await fetch(`${BASE_URL}/vendors/me/direct-chats/${conversationId}/message`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include", body: JSON.stringify({ content }),
      }).then(r => r.json()).then(msg => setMessages(prev => [...prev, msg])).catch(() => {});
    }
  }, [conversationId, connected, token]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    sendContent(content);
    setMessages(prev => [...prev, { _id: `opt_${Date.now()}`, sender: "vendor", content, timestamp: new Date().toISOString() }]);
  };

  const visitorName = convo?.visitorName || "Guest";
  const vendorName = user?.name || "";

  const confirmOrder = async ({ amount, eventType }) => {
    const res = await fetch(`${BASE_URL}/vendors/me/direct-chats/${conversationId}/confirm-order`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include", body: JSON.stringify({ amount, eventType }),
    });
    if (!res.ok) throw new Error("Failed to confirm order");
    const { message } = await res.json();
    if (message) setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);
  };

  if (error) {
    return <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: "#9B7450" }}>{error}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#FFFCF5", fontFamily: font }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(196,122,46,0.15)", background: "#fff", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/vendor/chats')} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><ArrowBackIcon style={{ color: INK }} /></button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(196,122,46,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: GOLD }}>{visitorName.charAt(0).toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>{visitorName}</div>
          <div style={{ fontSize: 11, color: connected ? "#16A34A" : "#9B7450" }}>{connected ? "● Connected" : "○ Connecting…"}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10.5, color: "#9B7450", textAlign: "right" }}>Direct Chat<br/>Profile Share</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && <div style={{ textAlign: "center", color: "#9B7450", fontSize: 13, marginTop: 40 }}>No messages yet. Say hello, or send a quote to get started.</div>}
        {messages.map((msg, i) => {
          const isVendor = msg.sender === "vendor";
          const doc = parseDocMessage(msg.content);
          return (
            <div key={msg._id || i} style={{ display: "flex", justifyContent: isVendor ? "flex-end" : "flex-start" }}>
              {doc ? <DocBubble doc={doc} /> : (
                <div style={{ maxWidth: "72%", padding: "10px 14px", borderRadius: isVendor ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isVendor ? GOLD : "#fff", color: isVendor ? "#fff" : INK, fontSize: 14, border: isVendor ? "none" : "1px solid rgba(196,122,46,0.15)" }}>
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: "1px solid rgba(196,122,46,0.15)", padding: "10px 12px", background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setComposerOpen(true)} title="Send a Quote / Invoice / Contract" style={{ width: 42, height: 42, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.06)", color: GOLD, fontSize: 18, cursor: "pointer", flexShrink: 0 }}>📄</button>
        <button onClick={() => setConfirmOrderOpen(true)} title="Confirm Order" style={{ width: 42, height: 42, borderRadius: 10, border: "1.5px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.08)", color: "#16A34A", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>💰</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message…" style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font, fontSize: 14, outline: "none" }} />
        <button onClick={sendMessage} disabled={!input.trim()} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: input.trim() ? GOLD : "rgba(196,122,46,0.2)", color: "#fff", fontSize: 16, cursor: input.trim() ? "pointer" : "default", flexShrink: 0 }}>↑</button>
      </div>

      {confirmOrderOpen && (
        <ConfirmOrderModal onConfirm={confirmOrder} onClose={() => setConfirmOrderOpen(false)} />
      )}

      {composerOpen && (
        <DocComposer
          vendorName={vendorName}
          serviceType={user?.serviceType || ''}
          defaultClientName={visitorName}
          onSend={({ kind, label, dataUri }) => sendContent(`${DOC_MARKER}${JSON.stringify({ kind, label, dataUri })}`).then(() => {
            setMessages(prev => [...prev, { _id: `opt_${Date.now()}`, sender: "vendor", content: `${DOC_MARKER}${JSON.stringify({ kind, label, dataUri })}`, timestamp: new Date().toISOString() }]);
          })}
          onClose={() => setComposerOpen(false)}
        />
      )}
    </div>
  );
}
