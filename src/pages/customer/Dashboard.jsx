import { useState, useEffect } from "react";
import { selectCartItems, selectCartTotal } from "../../redux/giftHamperCartSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import tendrLogoImg from "../../assets/logos/tendr-logo-secondary.png";
import tendrLogo from "../../assets/logos/tendr.png";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import Footer from "../../components/Footer";
import { resetEventPlanning, setMultipleFormData, setBookingType } from "../../redux/eventPlanningSlice";
import { generateReferralCode, formatCode, DISCOUNT_PERCENT } from "../../utils/referral";
import { useChatOverlay } from "../../context/ChatContext";
import { generateInvoicePDF, generateEventDetailsPDF, generateTimelinePDF, generateInvitationPDF } from "../../utils/pdfGenerator";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const TABS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled", "Chats", "Gift Hampers"];

const statusMap = {
  Upcoming:  ["in_progress"],
  Ongoing:   ["submitted", "draft"],
  Completed: ["completed"],
  Cancelled: ["cancelled"],
};

const statusBadge = (status) => {
  const map = {
    submitted:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Planning in Progress" },
    draft:       { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Planning in Progress" },
    in_progress: { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe", label: "Confirmed — Upcoming" },
    completed:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Completed" },
    cancelled:   { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5", label: "Cancelled" },
  };
  const s = map[status] || map.submitted;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

export default function CustomerDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const { openVendorChat, openExistingChat } = useChatOverlay();
  const finalisedVendors = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const ghCartItems = useSelector(selectCartItems);
  const ghCartTotal = useSelector(selectCartTotal);
  const finalisedCount = Object.keys(finalisedVendors).length;
  // Event planning form data from Redux — used to show "planning in progress" card
  const formData = useSelector((s) => s.eventPlanning.formData || {});
  const selectedServices = useSelector((s) => s.eventPlanning.selectedVendors || []);
  const bookingType = useSelector((s) => s.eventPlanning.bookingType);

  // Delete a chat request/conversation permanently
  const [deletingChat, setDeletingChat] = useState(null); // conversationId being deleted
  const handleDeleteChat = async (convoId) => {
    if (!window.confirm("Delete this chat request? This cannot be undone.")) return;
    setDeletingChat(convoId);
    try {
      const res = await fetch(`${BASE_URL}/conversations/${convoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        // Remove from local state immediately
        setConversations(prev => prev.filter(c => c._id !== convoId));
      }
    } catch {}
    setDeletingChat(null);
  };

  const submitCancel = async (planId) => {
    const s = cancelState[planId];
    setCancelState(prev => ({ ...prev, [planId]: { ...prev[planId], submitting: true } }));
    try {
      const res = await fetch(`${BASE_URL}/event-plans/${planId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ reason: s?.reason?.trim() || "Cancelled by customer" }),
      });
      if (res.ok) {
        setPlans(prev => prev.map(p => p._id === planId ? { ...p, status: "cancelled" } : p));
        setCancelState(prev => ({ ...prev, [planId]: { open: false, done: true, submitting: false } }));
      }
    } catch {
      setCancelState(prev => ({ ...prev, [planId]: { ...prev[planId], submitting: false } }));
    }
  };

  const handleRebook = (plan) => {
    dispatch(resetEventPlanning());
    dispatch(setMultipleFormData({
      eventType: plan.eventType || "",
      guests:    plan.guests    || "",
      budget:    plan.budget    || "",
      location:  plan.location  || "",
    }));
    dispatch(setBookingType(plan.bookingType || "you-do-it"));
    navigate("/booking");
  };

  const [changeReqState, setChangeReqState] = useState({}); // { [planId]: { open, message, submitting, done } }
  const [cancelState, setCancelState] = useState({}); // { [planId]: { open, reason, submitting, done } }
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const openChangeReq = (planId) =>
    setChangeReqState(prev => ({ ...prev, [planId]: { open: true, message: "", submitting: false, done: false } }));

  const submitChangeReq = async (planId) => {
    const s = changeReqState[planId];
    if (!s?.message?.trim()) return;
    setChangeReqState(prev => ({ ...prev, [planId]: { ...prev[planId], submitting: true } }));
    try {
      const res = await fetch(`${BASE_URL}/event-plans/${planId}/change-request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ message: s.message.trim() }),
      });
      if (res.ok) {
        setChangeReqState(prev => ({ ...prev, [planId]: { open: true, message: s.message, submitting: false, done: true } }));
        setPlans(prev => prev.map(p => p._id === planId ? { ...p, changeRequest: { hasRequest: true, message: s.message, status: "pending" } } : p));
      }
    } catch {
      setChangeReqState(prev => ({ ...prev, [planId]: { ...prev[planId], submitting: false } }));
    }
  };

  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return TABS.includes(tab) ? tab : "All";
  });
  const [plans, setPlans] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Fetch event plans — re-fetches on every mount so returning from payment
  // shows updated status (submitted → in_progress) immediately
  const fetchPlans = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${BASE_URL}/event-plans`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setPlans(Array.isArray(d.plans) ? d.plans : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, [token]);

  // Also re-fetch every 15 seconds to catch status changes from admin
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchPlans, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch conversations — always fetch individually for authoritative pinnedMessages
  // so pin AND unpin changes from admin appear within the next poll cycle
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const r = await fetch(`${BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const d = await r.json();
      const convList = d.conversations || [];

      // Always fetch each conversation individually to get the current pinnedMessages
      // (do NOT skip if list already has them — list may be stale after an unpin)
      const enriched = await Promise.all(convList.map(async (c) => {
        try {
          const r2 = await fetch(`${BASE_URL}/conversations/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (!r2.ok) return c;
          const full = await r2.json();
          return {
            ...c,
            pinnedMessages: full.pinnedMessages ?? full.conversation?.pinnedMessages ?? [],
          };
        } catch { return c; }
      }));

      setConversations(enriched);
    } catch {}
  };

  // Fetch ongoing conversations on load
  useEffect(() => {
    if (!token) return;
    setLoadingChats(true);
    fetchConversations().finally(() => setLoadingChats(false));
    // Trigger inactivity cleanup so cancelled plans show up correctly
    // Uses a public-ish cleanup — only updates customer's own data via auth
    fetch(`${BASE_URL}/conversations/cleanup-mine`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    }).catch(() => {});
  }, [token]);

  // Re-fetch every 20s so pin/unpin changes from admin appear automatically
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchConversations, 20000);
    return () => clearInterval(interval);
  }, [token]);

  const filtered = activeTab === "All"
    ? plans
    : plans.filter((p) => statusMap[activeTab]?.includes(p.status));

  // Vendor chats expire 24hrs after the customer's last message
  const TWENTY_FOUR_HRS = 24 * 60 * 60 * 1000;
  const isWithin24Hrs = (convo) => {
    const ref = convo.lastCustomerMessageAt || convo.createdAt;
    if (!ref) return true;
    return (Date.now() - new Date(ref).getTime()) < TWENTY_FOUR_HRS;
  };

  // Vendor chats shown in Ongoing:
  // - Unapproved/pending: within 24hrs of last customer message
  // - Approved + no price agreed yet: always show (still in discussion)
  const pendingVendorChats = conversations.filter(c => {
    if (c.chatType !== "vendor") return false;
    if (!c.chatApproved) return isWithin24Hrs(c);   // pending → 24hr rule
    return !(c.vendorPrice?.amount > 0);             // approved + no price = still negotiating
  });

  // Once payment is done (in_progress), vendor chat cards belong to that paid booking
  // and must no longer show in the Ongoing tab.
  const hasPaidPlan = plans.some(p => p.status === "in_progress" || p.status === "completed");
  const ongoingVendorChats = hasPaidPlan ? [] : pendingVendorChats;

  // Show "planning in progress" card when form has data, regardless of whether
  // vendor chats exist — formData now persists 7 days via localStorage
  const hasFormData = !!(formData.eventType || formData.date || formData.location);
  const hasActiveConversations = ongoingVendorChats.length > 0;
  const hasSubmittedPlan = plans.some(p => ["submitted","draft","in_progress"].includes(p.status));
  const showPlanningCard = (hasFormData || hasActiveConversations) && !hasSubmittedPlan;

  // Support/concierge chats only appear after customer explicitly opens them
  const openedSupportChats = (() => {
    try { return new Set(JSON.parse(localStorage.getItem("openedSupportChats") || "[]")); }
    catch { return new Set(); }
  })();

  const visibleChats = conversations.filter(c => {
    // Vendor chats: show for 24hrs from customer's last message
    if (c.chatType === "vendor") return isWithin24Hrs(c);
    // Support/concierge: only approved + explicitly opened
    if (!c.chatApproved) return false;
    return openedSupportChats.has(c._id);
  });

  const counts = {
    All:       plans.length,
    Upcoming:  plans.filter((p) => p.status === "in_progress").length, // payment received, awaiting confirmation
    Ongoing:   plans.filter((p) => statusMap.Ongoing.includes(p.status)).length + ongoingVendorChats.length + (showPlanningCard ? 1 : 0),
    Completed: plans.filter((p) => p.status === "completed").length,
    Cancelled: plans.filter((p) => p.status === "cancelled").length,
    Chats:     visibleChats.length,
    "Gift Hampers": ghCartItems.length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <BasicSpeedDial />

      {/* Main Navbar */}
      <HamburgerNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>

        {/* Profile card */}
        <div style={{ background: "#FFFCF5", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 4px 20px rgba(139,69,19,0.07)", padding: "28px 32px", marginBottom: 32, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px", letterSpacing: "-0.01em" }}>{user?.name || "Customer"}</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {user?.phoneNumber && (
                <span style={{ fontSize: 14, color: "#9B7450" }}>📞 {user.phoneNumber}</span>
              )}
              {user?.email && (
                <span style={{ fontSize: 14, color: "#9B7450" }}>✉️ {user.email}</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <button onClick={() => navigate("/booking")}
              style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}>
              + Plan New Event
            </button>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Total Events", val: counts.All },
              { label: "Upcoming", val: counts.Upcoming },
              { label: "Completed", val: counts.Completed },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center", background: "rgba(196,122,46,0.07)", borderRadius: 12, padding: "10px 18px", border: "1px solid rgba(196,122,46,0.15)" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#C47A2E" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
            </div>{/* end stats flex */}
          </div>{/* end right column */}
        </div>

        {/* Referral Card */}
        {user?._id && (() => {
          const code = generateReferralCode(user._id);
          const formatted = formatCode(code);
          const [copied, setCopied] = useState(false);
          const handleCopy = () => {
            navigator.clipboard.writeText(formatted).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          };
          return (
            <div style={{ background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 100%)", borderRadius: 20, padding: "24px 28px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", boxShadow: "0 6px 24px rgba(44,26,14,0.18)" }}>
              <div style={{ display: "flex", align: "center", gap: 16 }}>
                <div style={{ fontSize: 36, flexShrink: 0 }}>🎁</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Your Referral Code</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace" }}>{formatted}</span>
                    <button onClick={handleCopy}
                      style={{ padding: "5px 14px", borderRadius: 8, border: "1.5px solid rgba(204,171,74,0.4)", background: copied ? "rgba(204,171,74,0.2)" : "transparent", color: "#CCAB4A", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "5px 0 0", lineHeight: 1.5 }}>
                    Share this code — friends get {DISCOUNT_PERCENT}% off their first booking
                  </p>
                </div>
              </div>
              <div style={{ background: "rgba(204,171,74,0.12)", border: "1px solid rgba(204,171,74,0.25)", borderRadius: 14, padding: "14px 18px", textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#CCAB4A" }}>{DISCOUNT_PERCENT}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Discount for<br />your friends</div>
              </div>
            </div>
          );
        })()}

        {/* Events section */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 16px", letterSpacing: "-0.01em" }}>Your Events</h3>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer", border: "1.5px solid", transition: "all 0.18s",
                  borderColor: activeTab === tab ? "#C47A2E" : "rgba(139,69,19,0.2)",
                  background: activeTab === tab ? "#C47A2E" : "#fff",
                  color: activeTab === tab ? "#fff" : "#6B3A1F",
                }}
              >
                {tab}
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700,
                  background: activeTab === tab ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)",
                  color: activeTab === tab ? "#fff" : "#C47A2E",
                  borderRadius: 100, padding: "1px 7px" }}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Ongoing tab — event plan cards + pending vendor chat cards in one unified block */}
          {activeTab === "Ongoing" ? (
            (loading || loadingChats) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                {[0,1,2].map(i => (
                  <div key={i} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ height: 20, width: "40%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                    <div style={{ height: 14, width: "65%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                    <div style={{ height: 14, width: "50%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 && ongoingVendorChats.length === 0 && !showPlanningCard ? (
              <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>No ongoing bookings</h4>
                <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Your submitted events will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* ── Planning in Progress card — shown as soon as form is filled ── */}
                {showPlanningCard && (
                  <div style={{ background: "linear-gradient(135deg,#FFFCF5,#fff9f0)", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.25)", boxShadow: "0 2px 12px rgba(196,122,46,0.08)", padding: "18px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✏️</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>
                            {formData.eventType ? `${formData.eventType} Event` : "Event Planning in Progress"}
                          </div>
                          <div style={{ fontSize: 12, color: "#9B7450" }}>
                            {bookingType === "let-us-do-it" ? "Let Us Do It — Concierge" : "You Do It — Self Service"}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
                        Planning in Progress
                      </span>
                    </div>

                    {/* Form details as pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                      {[
                        formData.eventType && { icon: "🎉", text: formData.eventType },
                        formData.date      && { icon: "📅", text: formData.date },
                        formData.guests    && { icon: "👥", text: `${formData.guests} guests` },
                        formData.budget    && { icon: "💰", text: formData.budget },
                        formData.location  && { icon: "📍", text: formData.location },
                      ].filter(Boolean).map(({ icon, text }) => (
                        <span key={text} style={{ fontSize: 12, fontWeight: 600, background: "#fff", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "3px 11px", color: "#5a3a1a" }}>
                          {icon} {text}
                        </span>
                      ))}
                    </div>

                    {/* Selected services */}
                    {selectedServices.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", alignSelf: "center" }}>Services:</span>
                        {selectedServices.map(s => (
                          <span key={s} style={{ fontSize: 12, fontWeight: 600, background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 10px", color: "#C47A2E" }}>{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Pinned messages from all active vendor conversations */}
                    {(() => {
                      const allPinned = conversations
                        .filter(c => c.chatType === "vendor")
                        .flatMap(c => (c.pinnedMessages || [])
                          .map(m => ({
                            text: typeof m === "string" ? m : m.content || m.text,
                            vendor: c.vendorName || "Vendor",
                            service: c.serviceType || "",
                          }))
                        )
                        .filter(m => m.text);
                      if (!allPinned.length) return null;
                      return (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>
                            📌 Pinned from Chats
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {allPinned.map((m, i) => (
                              <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "#5a3a1a", border: "1px solid rgba(196,122,46,0.15)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ color: "#C47A2E", flexShrink: 0 }}>•</span>
                                <span style={{ flex: 1 }}>{m.text}</span>
                                <span style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>({m.vendor})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button onClick={() => navigate("/listings")}
                        style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 2px 8px rgba(196,122,46,0.3)" }}>
                        Browse Vendors →
                      </button>
                      <button onClick={() => navigate("/booking")}
                        style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                        Edit Details
                      </button>
                    </div>
                  </div>
                )}

                {/* EventPlan cards (submitted/draft) */}
                {filtered.map((plan) => (
                  <div key={plan._id} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E" }}>{plan.eventType || "Event"}</span>
                          {statusBadge(plan.status)}
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#7A5535" }}>
                          {plan.date     && <span>📅 {plan.date}</span>}
                          {plan.location && <span>📍 {plan.location}</span>}
                          {plan.guests   && <span>👥 {plan.guests} guests</span>}
                          {plan.budget   && <span>💰 {plan.budget}</span>}
                        </div>
                        {plan.bookingSummary && (
                          <div style={{ marginTop: 10, background: "rgba(196,122,46,0.05)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word", border: "1px solid rgba(196,122,46,0.12)" }}>
                            <span style={{ fontWeight: 700, color: "#C47A2E" }}>📋 Booking Summary: </span>{plan.bookingSummary}
                          </div>
                        )}
                        {/* Pinned messages from vendor chats */}
                        {(() => {
                          const planConvos = conversations.filter(c =>
                            c.customerId?._id?.toString() === plan.customerId?.toString() ||
                            c.customerId?.toString() === plan.customerId?.toString()
                          );
                          const allPinned = planConvos.flatMap(c => (c.pinnedMessages || []).map(m => ({
                            text: typeof m === "string" ? m : m.content || m.text,
                            vendor: c.vendorName || c.vendorId?.name || "Vendor",
                          }))).filter(m => m.text);
                          if (!allPinned.length) return null;
                          return (
                            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.06em" }}>📌 Pinned from chats</span>
                              {allPinned.map((m, mi) => (
                                <div key={mi} style={{ background: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "#5a3a1a", border: "1px solid rgba(196,122,46,0.15)", display: "flex", gap: 6 }}>
                                  <span style={{ color: "#C47A2E", flexShrink: 0 }}>•</span>
                                  <span style={{ flex: 1, lineHeight: 1.5 }}>{m.text} <span style={{ color: "#bbb", fontSize: 11 }}>({m.vendor})</span></span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Re-order + Review & Pay actions */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(196,122,46,0.1)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleRebook(plan)}
                        style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                      >
                        🔄 Re-order
                      </button>
                      {plan.status !== "completed" && (
                        finalisedCount > 0 ? (
                          <button
                            onClick={() => navigate("/booking/review")}
                            style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
                          >
                            Review & Pay →
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/listings")}
                            style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#6B3A1F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                          >
                            Select Vendors →
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {/* Pending vendor chat cards (awaiting admin approval) */}
                {ongoingVendorChats.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: filtered.length > 0 ? 8 : 0 }}>
                    {ongoingVendorChats.map(convo => (
                <div key={convo._id} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                        {(convo.vendorName || convo.vendorId?.name || "V")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>
                          {convo.vendorName || convo.vendorId?.name || "Vendor Chat"}
                        </div>
                        <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>
                          {convo.serviceType || convo.vendorServiceType || "Vendor"} · Chat started {new Date(convo.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 100, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
                      ⏳ In Process — Awaiting Team Approval
                    </span>
                  </div>
                  {/* Event form details — from conversation OR fall back to Redux form data */}
                  {(() => {
                    const details = (convo.eventDetails && Object.values(convo.eventDetails).some(Boolean))
                      ? convo.eventDetails
                      : formData;
                    const lines = [
                      details.eventType && { k: "Event",    v: details.eventType },
                      details.date      && { k: "Date",     v: details.date },
                      details.guests    && { k: "Guests",   v: details.guests },
                      details.budget    && { k: "Budget",   v: details.budget },
                      details.location  && { k: "City",     v: details.location },
                    ].filter(Boolean);
                    if (!lines.length) return null;
                    return (
                      <div style={{ background: "rgba(196,122,46,0.04)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(196,122,46,0.12)", display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 6 }}>
                        {lines.map(({ k, v }) => (
                          <span key={k} style={{ fontSize: 12, background: "#fff", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 10px", color: "#5a3a1a" }}>
                            <b style={{ color: "#C47A2E" }}>{k}:</b> {v}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  {/* Pinned messages from this conversation */}
                  {(convo.pinnedMessages || []).length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.06em" }}>📌 Pinned</span>
                      {(convo.pinnedMessages || []).map((m, mi) => {
                        const text = typeof m === "string" ? m : m.content || m.text;
                        if (!text) return null;
                        return (
                          <div key={mi} style={{ background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, color: "#5a3a1a", border: "1px solid rgba(196,122,46,0.15)" }}>
                            • {text}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={() => openExistingChat(convo._id, { _id: typeof convo.vendorId === 'object' ? convo.vendorId?._id : convo.vendorId, name: convo.vendorName, serviceType: convo.serviceType, approved: convo.chatApproved })}
                      style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      Open Chat →
                    </button>
                    <button
                      onClick={() => handleDeleteChat(convo._id)}
                      disabled={deletingChat === convo._id}
                      style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, opacity: deletingChat === convo._id ? 0.6 : 1 }}>
                      {deletingChat === convo._id ? "Deleting…" : "🗑️ Delete Request"}
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                )}
              </div>
            )
          ) : null}

          {/* Chats tab */}
          {activeTab === "Chats" && (
            loadingChats ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[0,1].map(i => (
                  <div key={i} style={{ background: "#FFFCF5", borderRadius: 14, border: "1.5px solid rgba(139,69,19,0.1)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <div style={{ height: 16, width: "35%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                      <div style={{ height: 12, width: "20%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                    </div>
                    <div style={{ height: 34, width: 110, borderRadius: 10, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                  </div>
                ))}
              </div>
            ) : visibleChats.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>💬</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>No team chats yet</h4>
                <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 16px" }}>When our team starts coordinating your event, conversations will appear here.</p>
                <button onClick={() => navigate("/booking")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>Plan an Event →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleChats.map((convo) => (
                  <div key={convo._id} style={{ background: "#FFFCF5", borderRadius: 14, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 10px rgba(139,69,19,0.05)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                        {convo.chatType === 'vendor' ? ((convo.vendorName || convo.vendorId?.name || "V")[0].toUpperCase()) : convo.chatType === 'support' ? "🤝" : "✨"}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>
                            {convo.chatType === 'vendor'
                              ? (convo.vendorName || convo.vendorId?.name || "Vendor Chat")
                              : convo.chatType === 'support' ? "Tendr Support" : "Tendr Concierge"}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                            background: convo.chatType === 'vendor' ? "#f0fdf4" : convo.chatType === 'support' ? "#eff6ff" : "#f5f3ff",
                            color: convo.chatType === 'vendor' ? "#15803d" : convo.chatType === 'support' ? "#0369a1" : "#7c3aed",
                            border: "1px solid currentColor" }}>
                            {convo.chatType === 'vendor' ? (convo.vendorServiceType || convo.vendorId?.serviceType || "Vendor") : convo.chatType === 'support' ? "Support" : "Event Planning"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <div style={{ fontSize: 12, color: "#bbb" }}>Started {new Date(convo.createdAt).toLocaleDateString("en-IN")}</div>
                          {convo.chatType === 'vendor' && !convo.chatApproved && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 100, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>Pending approval</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={() => {
                          if (convo.chatType === 'vendor') {
                            openExistingChat(convo._id, {
                              _id: typeof convo.vendorId === 'object' ? convo.vendorId?._id : convo.vendorId,
                              name: convo.vendorName || convo.vendorId?.name || "Vendor",
                              serviceType: convo.serviceType || convo.vendorId?.serviceType,
                              approved: convo.chatApproved,
                            });
                          } else {
                            navigate("/chat", { state: { vendor: { _id: "concierge", name: convo.chatType === 'support' ? "Tendr Support" : "Tendr Concierge", approved: true }, from: convo.chatType === 'support' ? "support" : "concierge" } });
                          }
                        }}
                        style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Open Chat →
                      </button>
                      {/* Only vendor chats can be deleted by the customer */}
                      {convo.chatType === 'vendor' && (
                        <button
                          onClick={() => handleDeleteChat(convo._id)}
                          disabled={deletingChat === convo._id}
                          title="Delete this chat permanently"
                          style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: deletingChat === convo._id ? 0.6 : 1 }}
                        >
                          {deletingChat === convo._id ? "…" : "🗑️"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Gift Hampers tab */}
          {activeTab === "Gift Hampers" && (
            <div>
              {ghCartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>🎁</div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>No gift hampers in cart</h4>
                  <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 16px" }}>Browse our gift hampers collection and add items to your cart.</p>
                  <button onClick={() => navigate("/gift-hampers-cakes")}
                    style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                    Browse Gift Hampers →
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ghCartItems.map(item => (
                    <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFFCF5", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", padding: "14px 18px", boxShadow: "0 2px 8px rgba(196,122,46,0.06)" }}>
                      <img src={item.imageUrl || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=80&q=60"} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>{item.name}</div>
                        {item.productNumber && <div style={{ fontSize: 11, color: "#bbb" }}>#{item.productNumber}</div>}
                        <div style={{ fontSize: 13, color: "#9B7450", marginTop: 2 }}>Qty: {item.quantity} × ₹{item.pricePerUnit.toLocaleString("en-IN")}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#C47A2E" }}>₹{item.subtotal.toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#2C1A0E", borderRadius: 14, marginTop: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Total</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: "#CCAB4A" }}>₹{ghCartTotal.toLocaleString("en-IN")}</span>
                      <button onClick={() => navigate("/gift-hampers-cakes")}
                        style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        View Cart →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event cards — all tabs except Ongoing, Chats, Gift Hampers */}
          {activeTab !== "Ongoing" && activeTab !== "Chats" && activeTab !== "Gift Hampers" && (loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ height: 20, width: "40%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                  <div style={{ height: 14, width: "60%", borderRadius: 8, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📅</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>
                {activeTab === "All" ? "No events yet" : `No ${activeTab.toLowerCase()} events`}
              </h4>
              <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px" }}>
                {activeTab === "All" ? "Start planning your first event with Tendr." : ""}
              </p>
              {activeTab === "All" && (
                <button onClick={() => navigate("/booking")}
                  style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
                  Plan an Event →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((plan) => (
                <div key={plan._id}
                  style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", padding: "20px 24px", transition: "box-shadow 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,69,19,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(139,69,19,0.06)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E" }}>{plan.eventName}</span>
                        {statusBadge(plan.status)}
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: plan.bookingType === "you-do-it" ? "#eff6ff" : "#f5f3ff", color: plan.bookingType === "you-do-it" ? "#0369a1" : "#7c3aed", border: "1px solid currentColor", fontWeight: 600 }}>
                          {plan.bookingType === "you-do-it" ? "You Do It" : "Let Us Do It"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, color: "#7A5535" }}>
                        <span>📋 {plan.eventType}</span>
                        <span>📅 {plan.date}</span>
                        <span>📍 {plan.location}</span>
                        <span>👥 {plan.guests} guests</span>
                        <span>💰 {plan.budget}</span>
                      </div>
                      {plan.selectedServices?.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {plan.selectedServices.map((s) => (
                            <span key={s} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 100, background: "rgba(196,122,46,0.08)", color: "#C47A2E", border: "1px solid rgba(196,122,46,0.2)", fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ fontSize: 11, color: "#bbb", whiteSpace: "nowrap" }}>
                        {new Date(plan.createdAt).toLocaleDateString("en-IN")}
                      </div>
                      <button
                        onClick={() => handleRebook(plan)}
                        title="Copy this event's details into a new booking"
                        style={{ fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "rgba(196,122,46,0.06)", color: "#C47A2E", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.14)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
                      >
                        ↩ Re-book
                      </button>
                    </div>
                  </div>

                  {/* 4 download buttons — shown for Upcoming (in_progress) plans */}
                  {plan.status === "in_progress" && (() => {
                    const eventSummary = { eventType: plan.eventType, date: plan.date, location: plan.location, guests: plan.guests };
                    const confirmedVendors = (plan.vendors || plan.confirmedVendors || []).map(v => ({
                      name: v.vendorName || v.name || "",
                      serviceType: v.serviceType || "",
                    })).filter(v => v.name);
                    return (
                      <div style={{ marginTop: 14, borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Your Documents</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                          <button disabled={pdfGenerating} onClick={() => { setPdfGenerating(true); try { generateInvoicePDF({ eventSummary, confirmedVendors, amount: plan.totalAmount || plan.amount, orderId: plan.orderId, paymentId: plan.paymentId, userName: user?.name }); } finally { setPdfGenerating(false); } }}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "11px 6px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#FFFCF5", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font }}>
                            <span style={{ fontSize: 18 }}>🧾</span>Invoice
                          </button>
                          <button disabled={pdfGenerating} onClick={() => { setPdfGenerating(true); try { generateEventDetailsPDF({ eventSummary, confirmedVendors, pinnedMessages: {}, userName: user?.name, orderId: plan.orderId }); } finally { setPdfGenerating(false); } }}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "11px 6px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 11, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font }}>
                            <span style={{ fontSize: 18 }}>📋</span>Details
                          </button>
                          <button disabled={pdfGenerating} onClick={() => { setPdfGenerating(true); try { const stored = JSON.parse(localStorage.getItem("tendr_dayof") || "{}"); generateTimelinePDF({ slots: stored.slots || [], eventSummary, userName: user?.name }); } finally { setPdfGenerating(false); } }}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "11px 6px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#FFFCF5", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font }}>
                            <span style={{ fontSize: 18 }}>🗓</span>Timeline
                          </button>
                          <button disabled={pdfGenerating} onClick={async () => { setPdfGenerating(true); try { await generateInvitationPDF({ eventSummary, confirmedVendors, userName: user?.name, giftHamperUrl: `${window.location.origin}/gift-hampers-cakes` }); } finally { setPdfGenerating(false); } }}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "11px 6px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font }}>
                            <span style={{ fontSize: 18 }}>📬</span>Invitation
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Change request — only for Upcoming (in_progress) plans */}
                  {plan.status === "in_progress" && (() => {
                    const cr = plan.changeRequest;
                    const s  = changeReqState[plan._id];
                    // Already has a pending request
                    if (cr?.hasRequest && cr?.status === "pending") {
                      return (
                        <div style={{ marginTop: 14, background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 14 }}>⏳</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>Change request sent</div>
                            {cr.message && <div style={{ fontSize: 12, color: "#7A5535", marginTop: 2, fontStyle: "italic" }}>"{cr.message}"</div>}
                            <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>Waiting for Tendr team to respond</div>
                          </div>
                        </div>
                      );
                    }
                    // Submitted successfully just now
                    if (s?.done) {
                      return (
                        <div style={{ marginTop: 14, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                          ✓ Change request submitted. The Tendr team will get back to you shortly.
                        </div>
                      );
                    }
                    // Open input form
                    if (s?.open) {
                      return (
                        <div style={{ marginTop: 14, background: "rgba(196,122,46,0.04)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 8 }}>What would you like to change?</div>
                          <textarea
                            value={s.message}
                            onChange={e => setChangeReqState(prev => ({ ...prev, [plan._id]: { ...prev[plan._id], message: e.target.value } }))}
                            rows={3}
                            placeholder="e.g. Change the catering to 100 guests, update the date to 20 June..."
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 13, fontFamily: font, color: "#2C1A0E", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button
                              onClick={() => submitChangeReq(plan._id)}
                              disabled={s.submitting || !s.message?.trim()}
                              style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: s.message?.trim() ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#e5e7eb", color: s.message?.trim() ? "#fff" : "#aaa", fontSize: 13, fontWeight: 700, cursor: s.message?.trim() ? "pointer" : "not-allowed", fontFamily: font }}
                            >
                              {s.submitting ? "Sending…" : "Submit Request"}
                            </button>
                            <button
                              onClick={() => setChangeReqState(prev => ({ ...prev, [plan._id]: { ...prev[plan._id], open: false } }))}
                              style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }
                    // Default: show button
                    return (
                      <button
                        onClick={() => openChangeReq(plan._id)}
                        style={{ marginTop: 14, width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        ⚠️ Make a Change Request
                      </button>
                    );
                  })()}

                  {/* Cancel Booking — Upcoming plans only */}
                  {plan.status === "in_progress" && (() => {
                    const cs = cancelState[plan._id];
                    if (cs?.done) return null; // already cancelled, row disappears
                    if (cs?.open) {
                      return (
                        <div style={{ marginTop: 10, background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#c0392b", marginBottom: 8 }}>Cancel this booking?</div>
                          <p style={{ fontSize: 12, color: "#7A5535", margin: "0 0 10px", lineHeight: 1.5 }}>
                            This action cannot be undone. Please refer to our Cancellation Policy for refund details.
                          </p>
                          <textarea
                            value={cs.reason || ""}
                            onChange={e => setCancelState(prev => ({ ...prev, [plan._id]: { ...prev[plan._id], reason: e.target.value } }))}
                            rows={2}
                            placeholder="Reason for cancellation (optional)"
                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", fontSize: 12, fontFamily: font, outline: "none", resize: "none", boxSizing: "border-box", color: "#2C1A0E", background: "#fff" }}
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button
                              onClick={() => submitCancel(plan._id)}
                              disabled={cs.submitting}
                              style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "#c0392b", color: "#fff", fontSize: 13, fontWeight: 700, cursor: cs.submitting ? "not-allowed" : "pointer", fontFamily: font, opacity: cs.submitting ? 0.7 : 1 }}
                            >
                              {cs.submitting ? "Cancelling…" : "Confirm Cancellation"}
                            </button>
                            <button
                              onClick={() => setCancelState(prev => ({ ...prev, [plan._id]: { open: false } }))}
                              style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#fff", color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
                            >
                              Keep Booking
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <button
                        onClick={() => setCancelState(prev => ({ ...prev, [plan._id]: { open: true, reason: "", submitting: false } }))}
                        style={{ marginTop: 8, width: "100%", padding: "9px", borderRadius: 10, border: "1.5px dashed #fca5a5", background: "transparent", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(192,57,43,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        Cancel Booking
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
