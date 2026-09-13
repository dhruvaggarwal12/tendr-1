/**
 * DashboardAssistant
 * - Floating "?" button bottom-left of screen (avoids Pay button area bottom-right)
 * - Opens a panel with:
 *   1. Tour — re-runs the guided dashboard tour
 *   2. Bot  — Q&A about the dashboard with clickable action links
 */
import { useState, useRef, useEffect } from "react";

const F    = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK  = "#2C1A0E";

// ── FAQ knowledge base ───────────────────────────────────────────────────────
const FAQ = [
  {
    q: ["where are my events", "find my booking", "see my bookings", "my events", "where is my event"],
    a: "Your events live in the **All** tab — scroll down past the quick-links. Each card shows the event name, date, vendor list and current status.",
    action: { label: "Go to All tab", tab: "All" },
  },
  {
    q: ["upcoming event", "confirmed booking", "what is upcoming", "upcoming tab"],
    a: "**Upcoming** shows events that are fully confirmed and paid — your slot is locked in with your vendors.",
    action: { label: "Show Upcoming", tab: "Upcoming" },
  },
  {
    q: ["ongoing", "planning in progress", "what is ongoing", "draft", "submitted"],
    a: "**Ongoing** events are ones where you've chatted with vendors but haven't paid yet. Your plan is being reviewed by the Tendr team.",
    action: { label: "Show Ongoing", tab: "Ongoing" },
  },
  {
    q: ["completed events", "past events", "finished events"],
    a: "**Completed** shows events that are done. You can download invoices, timelines and memories from each completed card.",
    action: { label: "Show Completed", tab: "Completed" },
  },
  {
    q: ["cancelled", "cancel my booking", "how to cancel", "cancelled events"],
    a: "**Cancelled** events appear here. To cancel an active booking, open the event card and tap 'Cancel Booking'. You'll be asked for a reason.",
    action: { label: "Show Cancelled", tab: "Cancelled" },
  },
  {
    q: ["chat", "talk to vendor", "message vendor", "vendor chat", "chats tab", "open chats", "my chats"],
    a: "The **Chats** tab shows all your vendor conversations. Pending chats (awaiting Tendr approval) appear with an ⏰ badge. Once approved, you can message directly.",
    action: { label: "Go to Chats", tab: "Chats" },
  },
  {
    q: ["gift hamper", "gift hampers", "my gift order", "hamper order"],
    a: "**Gift Hampers** tab shows any hamper orders you've placed. You can track delivery status and download a receipt from here.",
    action: { label: "Show Gift Hampers", tab: "Gift Hampers" },
  },
  {
    q: ["pay", "payment", "how to pay", "pay button", "proceed to payment"],
    a: "After chatting with a vendor, tap **Finalise Vendor** in the chat. Then tap the gold **Pay** button (bottom-right of screen) → **Continue to Payment** to review and confirm your booking.",
    action: { label: "Go to Booking Review", href: "/booking/review" },
  },
  {
    q: ["finalise vendor", "finalize vendor", "confirm vendor", "lock vendor", "select vendor"],
    a: "Open the chat with your vendor → once pricing is agreed → tap **Finalise Vendor** (button inside the chat). This locks the vendor's slot for 2 hours while you complete payment.",
  },
  {
    q: ["invoice", "download invoice", "get invoice", "pdf invoice", "billing"],
    a: "On any **Completed** event card, tap the 📄 **Invoice** button to download a PDF invoice for that booking.",
    action: { label: "Show Completed", tab: "Completed" },
  },
  {
    q: ["referral", "referral code", "discount code", "refer a friend", "earn discount"],
    a: "Your **referral code** appears on the dashboard after your first paid booking. Share it with friends — they get a discount and you earn credit.",
  },
  {
    q: ["checklist", "event checklist", "what to do before event", "to-do list", "preparation"],
    a: "Each event card has a **Checklist** section — click it to expand pre-event tasks specific to your event type (guest count, outfit, vendor payments, etc.).",
  },
  {
    q: ["add vendor", "book another vendor", "add more vendors", "book more"],
    a: "Go to **Listings** to browse vendors by category. Chat with them and finalise — they'll be added to your booking alongside existing vendors.",
    action: { label: "Browse Vendors", href: "/listings" },
  },
  {
    q: ["change date", "change event date", "update event details", "edit event", "change event"],
    a: "Open the event card → tap **Request Change** to submit a date or detail change. The Tendr team will confirm availability and update your booking.",
  },
  {
    q: ["event plan pdf", "download plan", "event details pdf", "share plan"],
    a: "On any event card, tap **Download Plan PDF** to get a full PDF with your event details, vendor list and budget breakdown.",
  },
  {
    q: ["timeline", "event timeline", "schedule of events", "day schedule"],
    a: "On a **Confirmed/Upcoming** event card, tap **Timeline PDF** to download a day-of schedule with your vendors' arrival times.",
    action: { label: "Show Upcoming", tab: "Upcoming" },
  },
  {
    q: ["invitation", "invite pdf", "event invitation", "e-invite"],
    a: "Tap the **Invitation** button on your event card to generate a shareable PDF invite you can send to guests.",
  },
  {
    q: ["help", "support", "contact tendr", "talk to team", "need help"],
    a: "Tap the 💬 **chat button** (bottom-right) → **Talk to Tendr Team** to reach us directly. We're available daily.",
  },
  {
    q: ["book new event", "start new event", "create event", "new booking", "plan event"],
    a: "Tap **Plan New Event** on the dashboard or go to the homepage and select your event type to start a fresh plan.",
    action: { label: "Plan New Event", href: "/" },
  },
  {
    q: ["shortlist", "saved vendors", "compare vendors"],
    a: "Vendors you've shortlisted or added to compare appear in the floating Compare tray. Tap the compare icon in the bottom bar to view them side by side.",
  },
  {
    q: ["status", "what does status mean", "planning in progress", "confirmed upcoming"],
    a: "**Planning in Progress** = chat submitted, waiting for Tendr review. **Confirmed — Upcoming** = paid and locked. **Completed** = event is done. **Cancelled** = booking cancelled.",
  },
];

function findAnswer(input) {
  const q = input.toLowerCase().trim();
  for (const faq of FAQ) {
    if (faq.q.some(k => q.includes(k) || k.includes(q.split(" ")[0]))) return faq;
  }
  // Partial word match fallback
  const words = q.split(/\s+/).filter(w => w.length > 3);
  for (const word of words) {
    for (const faq of FAQ) {
      if (faq.q.some(k => k.includes(word))) return faq;
    }
  }
  return null;
}

function renderAnswer(text) {
  // Bold **text**
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: INK }}>{p}</strong>
      : <span key={i}>{p}</span>
  );
}

// ── Tour steps definition ─────────────────────────────────────────────────────
export const CUSTOMER_TOUR_STEPS = [
  {
    target:  '[data-tour="dash-header"]',
    title:   "Your Dashboard",
    content: "This is your Tendr home — all your events, chats and bookings live here.",
  },
  {
    target:  '[data-tour="dash-tabs"]',
    title:   "Event Tabs",
    content: "Filter your events: All, Upcoming (confirmed), Ongoing (in planning), Completed, Cancelled, Chats, and Gift Hampers.",
  },
  {
    target:  '[data-tour="tab-All"]',
    title:   "All Events",
    content: "See every booking in one place — past, present and future.",
  },
  {
    target:  '[data-tour="tab-Ongoing"]',
    title:   "Ongoing — Events in Planning",
    content: "Events where you've chatted with vendors but haven't paid yet. The Tendr team is reviewing your plan.",
  },
  {
    target:  '[data-tour="tab-Upcoming"]',
    title:   "Upcoming — Confirmed Bookings",
    content: "Fully paid and confirmed events. Your vendor slots are locked in.",
  },
  {
    target:  '[data-tour="tab-Chats"]',
    title:   "Chats Tab",
    content: "All your vendor conversations. A red dot means unread messages waiting for you.",
  },
  {
    target:  '[data-tour="tab-Completed"]',
    title:   "Completed Events",
    content: "Past events with invoice, timeline and invitation PDFs you can download.",
  },
  {
    target:  '[data-tour="tab-Gift Hampers"]',
    title:   "Gift Hampers",
    content: "Track any hamper orders you've placed — delivery status and receipt all in one place.",
  },
  {
    target:  '[data-tour="dash-new-event"]',
    title:   "Plan a New Event",
    content: "Start a fresh event plan from scratch — choose your event type, set your budget and start finding vendors.",
  },
  {
    target:  '[data-tour="dash-assistant"]',
    title:   "Dashboard Assistant",
    content: "Stuck? Click this anytime to ask a question or restart this tour.",
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardAssistant({ onTabChange, onStartTour }) {
  const [open, setOpen]     = useState(false);
  const [view, setView]     = useState("home"); // "home" | "bot"
  const [input, setInput]   = useState("");
  const [msgs, setMsgs]     = useState([
    { from: "bot", text: "Hi! I'm your dashboard guide. Ask me anything about your bookings, chats, or how to use any feature here." },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (view === "bot" && open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [view, open]);

  const sendMessage = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMsgs(prev => [...prev, { from: "user", text: q }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const match = findAnswer(q);
      if (match) {
        setMsgs(prev => [...prev, {
          from: "bot",
          text: match.a,
          action: match.action,
        }]);
      } else {
        setMsgs(prev => [...prev, {
          from: "bot",
          text: "I'm not sure about that one. Try asking about your events, chats, payments, or specific tabs — or tap **Talk to Tendr Team** to reach us directly.",
          action: { label: "Talk to Tendr Team", chatTeam: true },
        }]);
      }
    }, 600);
  };

  const handleAction = (action) => {
    if (!action) return;
    if (action.tab && onTabChange) { onTabChange(action.tab); setOpen(false); }
    if (action.href) { window.location.href = action.href; setOpen(false); }
    if (action.chatTeam) {
      document.dispatchEvent(new CustomEvent("tendr:open-baat-karo"));
      setOpen(false);
    }
  };

  const QUICK = [
    "Where are my events?",
    "How do I pay?",
    "How to finalise a vendor?",
    "How do I cancel a booking?",
    "Where are my chats?",
    "How to download invoice?",
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        data-tour="dash-assistant"
        onClick={() => { setOpen(o => !o); setView("home"); }}
        title="Dashboard Assistant"
        style={{
          position: "fixed", bottom: 90, left: 18, zIndex: 1200,
          width: 46, height: 46, borderRadius: "50%",
          background: open ? INK : "linear-gradient(135deg,#C47A2E,#CCAB4A)",
          color: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, fontFamily: F,
          boxShadow: "0 4px 16px rgba(196,122,46,0.45)",
          transition: "all 0.2s",
        }}
        aria-label="Dashboard Assistant"
      >
        {open ? "×" : "?"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 144, left: 18, zIndex: 1201,
          width: "min(340px, calc(100vw - 36px))",
          background: "#FFFCF5", borderRadius: 18,
          boxShadow: "0 16px 56px rgba(44,26,14,0.18), 0 2px 8px rgba(44,26,14,0.06)",
          border: "1.5px solid rgba(196,122,46,0.2)",
          fontFamily: F, overflow: "hidden",
          display: "flex", flexDirection: "column", maxHeight: "70vh",
        }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(196,122,46,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#CCAB4A" }}>Dashboard Assistant</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Ask me anything about your dashboard</div>
            </div>
          </div>

          {/* Home view */}
          {view === "home" && (
            <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
              {/* Tour CTA */}
              <div
                onClick={() => { setOpen(false); onStartTour?.(); }}
                style={{ background: "linear-gradient(135deg,#2C1A0E,#3D2210)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontSize: 24 }}>🗺️</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#CCAB4A" }}>Take the Dashboard Tour</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>A guided walkthrough of every tab and feature — takes 60 seconds.</div>
                </div>
              </div>

              {/* Ask a question CTA */}
              <div
                onClick={() => setView("bot")}
                style={{ background: "#FFF8EE", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ fontSize: 24 }}>💬</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>Ask a Question</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", marginTop: 2 }}>Get instant answers about your bookings and how things work.</div>
                </div>
              </div>

              {/* Quick action chips */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Quick questions</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUICK.map(q => (
                  <button key={q}
                    onClick={() => { setView("bot"); setTimeout(() => sendMessage(q), 50); }}
                    style={{ fontSize: 12, fontWeight: 600, color: GOLD, background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "5px 12px", cursor: "pointer", fontFamily: F }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bot view */}
          {view === "bot" && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Back button */}
                <button onClick={() => setView("home")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F, padding: "2px 0", marginBottom: 4 }}>
                  ← Back
                </button>

                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "user" ? "flex-end" : "flex-start", gap: 4 }}>
                    <div style={{
                      maxWidth: "85%", padding: "9px 13px", borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: m.from === "user" ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#F8F4EF",
                      color: m.from === "user" ? "#fff" : INK,
                      fontSize: 13, lineHeight: 1.6, fontFamily: F,
                    }}>
                      {m.from === "bot" ? renderAnswer(m.text) : m.text}
                    </div>
                    {m.action && (
                      <button
                        onClick={() => handleAction(m.action)}
                        style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: GOLD, border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: F, alignSelf: m.from === "user" ? "flex-end" : "flex-start" }}
                      >
                        {m.action.label} →
                      </button>
                    )}
                  </div>
                ))}

                {typing && (
                  <div style={{ alignSelf: "flex-start", padding: "9px 14px", borderRadius: "16px 16px 16px 4px", background: "#F8F4EF", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9B7450", animation: `bounce 1s ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(196,122,46,0.12)", display: "flex", gap: 8, flexShrink: 0 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about your dashboard…"
                  style={{ flex: 1, padding: "9px 13px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: F, color: INK, background: "#FFF8EE", outline: "none" }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: input.trim() ? GOLD : "rgba(196,122,46,0.2)", color: "#fff", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
