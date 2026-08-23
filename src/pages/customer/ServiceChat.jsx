import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import SEO from "../../components/SEO";
import HamburgerNav from "../../components/HamburgerNav";
import AuthModal from "../../components/AuthModal.jsx";
import { useChatOverlay } from "../../context/ChatContext";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const CONFIG = {
  "Gift Hampers": {
    icon: "🎁",
    title: "Gift Hampers",
    subtitle: "Tell us about the occasion, budget, and what kind of hamper you have in mind. We'll curate the perfect gift.",
    suggestions: [
      "Birthday gift hamper for a friend, budget 2000-3000, chocolates aur skincare include karo",
      "Corporate gifting, 50 employees, budget 1500 per person, branded packaging chahiye",
      "Wedding return gifts, 100 guests, dry fruits + sweet box, budget 500-800 per piece",
    ],
    seoTitle: "Gift Hampers | Tendr",
    seoDesc: "Custom curated gift hampers for every occasion. Tell us what you need and we'll handle the rest.",
    seoPath: "/gift-hampers/chat",
  },
  "Rakhi Hampers": {
    icon: "🪢",
    title: "Rakhi Hampers",
    subtitle: "Tell us about your Rakhi requirements — for siblings, family or bulk gifting. We'll curate the perfect hamper and deliver across Delhi NCR.",
    suggestions: [
      "Rakhi hamper for bhai, budget 1000-2000, mithai + dry fruits + personalised card chahiye",
      "Premium Rakhi set for 3 siblings, budget 3000-5000 per hamper, luxury packaging",
      "Corporate Rakhi gifting, 100 pieces, budget 500-800 per piece, branded packaging",
    ],
    seoTitle: "Rakhi Hampers | Tendr",
    seoDesc: "Custom Rakhi hampers curated for your loved ones. Tell us what you need and we'll handle the rest.",
    seoPath: "/rakhi-hampers/chat",
  },
  "Occasions": {
    icon: "🎉",
    title: "Plan by Occasions",
    subtitle: "Tell us about your occasion — baby shower, anniversary, birthday, or anything else. We'll connect you with the right vendors.",
    suggestions: [
      "Baby shower hai next month, 50 guests, decoration + catering chahiye, home mein, budget 30,000",
      "Anniversary party 25 log, candle light dinner setup, Noida mein, 10th Feb",
      "Kids birthday party, 30 bachche, theme decoration + cake + return gifts, budget 20,000",
    ],
    seoTitle: "Plan by Occasions | Tendr",
    seoDesc: "Plan any occasion with Tendr — baby shower, anniversary, birthday. Tell us what you need.",
    seoPath: "/occasions/chat",
  },
};

export default function ServiceChat({ serviceType }) {
  const cfg = CONFIG[serviceType] || CONFIG["Occasions"];
  const { token } = useSelector((s) => s.auth);
  const { openExistingChat } = useChatOverlay();

  const [text, setText] = useState(() => {
    try { return sessionStorage.getItem("baat_karo_draft") || ""; } catch { return ""; }
  });
  const [refPhotos, setRefPhotos] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("gh_chat_photos") || "[]"); } catch { return []; }
  });
  const [venuePhoto, setVenuePhoto] = useState(() => {
    try { return sessionStorage.getItem("baat_karo_venue_photo") || null; } catch { return null; }
  });
  const [charCount, setCharCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [sending, setSending] = useState(false);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    setCharCount(text.length);
    try { sessionStorage.setItem("baat_karo_draft", text); } catch {}
  }, [text]);

  // Auto-submit for the unauthenticated redirect case: user wasn't logged in when they went through a
  // flow, logged in via the ServiceChat auth modal, and now token is set with a draft in sessionStorage.
  useEffect(() => {
    if (!token || autoSubmittedRef.current) return;
    const draft = (() => { try { return sessionStorage.getItem("baat_karo_draft") || ""; } catch { return ""; } })();
    if (!draft.trim()) return;
    autoSubmittedRef.current = true;
    const photos = (() => { try { return JSON.parse(sessionStorage.getItem("gh_chat_photos") || "[]"); } catch { return []; } })();
    const vPhoto = (() => { try { return sessionStorage.getItem("baat_karo_venue_photo") || null; } catch { return null; } })();
    setSending(true);
    const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/conversations/baat-karo`, {
          method: "POST", headers: hdrs, credentials: "include",
          body: JSON.stringify({ message: draft.trim(), serviceType }),
        });
        const data = await res.json();
        if (!res.ok || !data.conversationId) return;
        const cid = data.conversationId;
        window.dispatchEvent(new CustomEvent("tendr:chat-started"));
        try { sessionStorage.removeItem("baat_karo_draft"); } catch {}
        if (vPhoto) {
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: "📷 Venue / place photo:" }) }); } catch {}
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `[img:${vPhoto}]` }) }); } catch {}
          try { sessionStorage.removeItem("baat_karo_venue_photo"); } catch {}
          setVenuePhoto(null);
        }
        for (const photo of photos) {
          if (photo.name) try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `📎 ${photo.name}${photo.priceRange ? ` — ${photo.priceRange}` : ""}` }) }); } catch {}
          try { await fetch(`${BASE_URL}/messages/${cid}/message`, { method: "POST", headers: hdrs, body: JSON.stringify({ sender: "user", content: `[img:${photo.url}]` }) }); } catch {}
        }
        if (photos.length > 0) { try { sessionStorage.removeItem("gh_chat_photos"); } catch {} setRefPhotos([]); }
        setText("");
        openExistingChat(cid, { _id: null, name: "Tendr Team", serviceType, approved: false });
      } catch (e) { console.error("ServiceChat auto-submit failed:", e); }
      finally { setSending(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submitMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/conversations/baat-karo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ message: text.trim(), serviceType }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        try { sessionStorage.removeItem("baat_karo_draft"); } catch {}

        const msgHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

        if (venuePhoto) {
          try {
            await fetch(`${BASE_URL}/messages/${data.conversationId}/message`, {
              method: "POST", headers: msgHeaders,
              body: JSON.stringify({ sender: "user", content: "📷 Venue / place photo:" }),
            });
            await fetch(`${BASE_URL}/messages/${data.conversationId}/message`, {
              method: "POST", headers: msgHeaders,
              body: JSON.stringify({ sender: "user", content: `[img:${venuePhoto}]` }),
            });
          } catch {}
          try { sessionStorage.removeItem("baat_karo_venue_photo"); } catch {}
          setVenuePhoto(null);
        }

        if (refPhotos.length > 0) {
          for (const photo of refPhotos) {
            if (photo.name) {
              try {
                await fetch(`${BASE_URL}/messages/${data.conversationId}/message`, {
                  method: "POST", headers: msgHeaders,
                  body: JSON.stringify({ sender: "user", content: `📎 ${photo.name}${photo.priceRange ? ` — ${photo.priceRange}` : ""}` }),
                });
              } catch {}
            }
            try {
              await fetch(`${BASE_URL}/messages/${data.conversationId}/message`, {
                method: "POST", headers: msgHeaders,
                body: JSON.stringify({ sender: "user", content: `[img:${photo.url}]` }),
              });
            } catch {}
          }
          try { sessionStorage.removeItem("gh_chat_photos"); } catch {}
          setRefPhotos([]);
        }

        setText("");
        window.dispatchEvent(new CustomEvent("tendr:chat-started"));
        openExistingChat(data.conversationId, {
          _id: null,
          name: "Tendr Team",
          serviceType,
          approved: false,
        });
      }
    } catch (e) {
      console.error("ServiceChat submit failed:", e);
    }
    setSending(false);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    if (!token) { setShowAuth(true); return; }
    submitMessage();
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 100%)", fontFamily: font }}>
      <SEO title={cfg.seoTitle} description={cfg.seoDesc} path={cfg.seoPath} noIndex />
      <HamburgerNav />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(196,122,46,0.1)", border: "2px solid rgba(196,122,46,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px" }}>
            {cfg.icon}
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {cfg.title}
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
            {cfg.subtitle}
          </p>
        </div>

        <div style={{ background: "#FFFCF5", border: "2px solid rgba(196,122,46,0.25)", borderRadius: 20, padding: 20, boxShadow: "0 4px 24px rgba(139,69,19,0.08)", marginBottom: 16 }}>

          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              {cfg.icon}
            </div>
            <div style={{ background: "rgba(196,122,46,0.08)", borderRadius: "4px 14px 14px 14px", padding: "10px 14px", maxWidth: "85%" }}>
              <p style={{ fontSize: 13.5, color: "#2C1A0E", margin: 0, lineHeight: 1.6 }}>
                Namaste! 👋 Welcome to Tendr.<br /><br />
                Bas ek kaam karo — apna event batao. Likh do:<br />
                <span style={{ color: "#C47A2E", fontWeight: 700 }}>📅 Date · 📍 Location · 👥 Guests · 💰 Budget · 🎊 Kya chahiye</span><br /><br />
                Apni bhasha mein — Hinglish bilkul theek hai!
              </p>
            </div>
          </div>

          {refPhotos.length > 0 && (
            <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 12, background: "rgba(196,122,46,0.07)", border: "1px dashed rgba(196,122,46,0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  📎 {refPhotos.length} photo{refPhotos.length > 1 ? "s" : ""} attached
                </span>
                <button
                  onClick={() => { setRefPhotos([]); try { sessionStorage.removeItem("gh_chat_photos"); } catch {} }}
                  style={{ fontSize: 11, color: "#9B7450", background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}
                >
                  Clear all
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {refPhotos.map((p, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={p.url} alt={p.name || "reference"} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, display: "block", border: "1.5px solid rgba(196,122,46,0.3)" }} />
                    <button
                      onClick={() => setRefPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: "#9B7450", border: "none", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    >✕</button>
                    {p.name && (
                      <div style={{ fontSize: 9, color: "#7A5535", marginTop: 3, maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{p.name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={cfg.suggestions[0]}
              rows={5}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", fontSize: 14, fontFamily: font, color: "#2C1A0E", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#C47A2E"}
              onBlur={e => e.target.style.borderColor = "rgba(196,122,46,0.3)"}
            />
            <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "#9B7450" }}>{charCount} chars</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Examples</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {cfg.suggestions.map((s, i) => (
              <button key={i} onClick={() => setText(s)}
                style={{ textAlign: "left", padding: "9px 13px", borderRadius: 10, border: "1.5px dashed rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.04)", color: "#7A5535", fontSize: 12.5, fontFamily: font, cursor: "pointer", lineHeight: 1.5, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(196,122,46,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(196,122,46,0.04)"}
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: text.trim() && !sending ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.15)", color: text.trim() && !sending ? "#fff" : "#9B7450", fontSize: 16, fontWeight: 800, fontFamily: font, cursor: text.trim() && !sending ? "pointer" : "not-allowed", boxShadow: text.trim() && !sending ? "0 4px 18px rgba(196,122,46,0.35)" : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          <span style={{ fontSize: 20 }}>💬</span>
          {sending ? "Sending…" : !token ? "Sign in & Send →" : "Send →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#9B7450", marginTop: 8 }}>
          Tendr Team is reviewing your message — track it under My Chats.
        </p>
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => { setShowAuth(false); submitMessage(); }}
      />
    </div>
  );
}
