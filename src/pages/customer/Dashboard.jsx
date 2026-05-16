import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import tendrLogoImg from "../../assets/logos/tendr-logo-secondary.png";
import tendrLogo from "../../assets/logos/tendr.png";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import Footer from "../../components/Footer";
import { resetEventPlanning, setMultipleFormData, setBookingType } from "../../redux/eventPlanningSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const TABS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled", "Chats"];

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

  // Fetch event plans
  useEffect(() => {
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
  }, [token]);

  // Fetch ongoing conversations
  useEffect(() => {
    if (!token) return;
    setLoadingChats(true);
    fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {})
      .finally(() => setLoadingChats(false));
  }, [token]);

  const filtered = activeTab === "All"
    ? plans
    : plans.filter((p) => statusMap[activeTab]?.includes(p.status));

  // Show vendor chats + only approved support/concierge chats
  const visibleChats = conversations.filter(c =>
    (c.chatType === "vendor" && c.chatApproved) ||
    (c.chatType === "support" && c.chatApproved) ||
    (c.chatType === "concierge" && c.chatApproved)
  );

  const counts = {
    All:       plans.length,
    Upcoming:  plans.filter((p) => statusMap.Upcoming.includes(p.status)).length,
    Ongoing:   plans.filter((p) => statusMap.Ongoing.includes(p.status)).length,
    Completed: plans.filter((p) => p.status === "completed").length,
    Cancelled: plans.filter((p) => p.status === "cancelled").length,
    Chats:     visibleChats.length + (conversations.filter(c => c.chatType === 'vendor' && c.chatApproved).length > 0 ? 0 : 0),
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

          {/* Ongoing tab — shows event plan summary cards */}
          {activeTab === "Ongoing" ? (
            loading ? (
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
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>No ongoing bookings</h4>
                <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Your submitted events will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                          <div style={{ marginTop: 10, background: "rgba(196,122,46,0.05)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#5a3a1a", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 120, overflowY: "auto", border: "1px solid rgba(196,122,46,0.12)" }}>
                            <span style={{ fontWeight: 700, color: "#C47A2E" }}>📋 Summary: </span>{plan.bookingSummary}
                          </div>
                        )}
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
                        <button
                          onClick={() => navigate("/booking/review")}
                          style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
                        >
                          Review & Pay →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                        {convo.chatType === 'vendor' ? (convo.vendorId?.name?.[0] || "V") : convo.chatType === 'support' ? "🤝" : "✨"}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>
                            {convo.chatType === 'vendor' ? (convo.vendorId?.name || "Vendor") : convo.chatType === 'support' ? "Tendr Support" : "Tendr Concierge"}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                            background: convo.chatType === 'vendor' ? "#f0fdf4" : convo.chatType === 'support' ? "#eff6ff" : "#f5f3ff",
                            color: convo.chatType === 'vendor' ? "#15803d" : convo.chatType === 'support' ? "#0369a1" : "#7c3aed",
                            border: "1px solid currentColor" }}>
                            {convo.chatType === 'vendor' ? (convo.vendorId?.serviceType || "Vendor") : convo.chatType === 'support' ? "Support" : "Event Planning"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#bbb" }}>Started {new Date(convo.createdAt).toLocaleDateString("en-IN")}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (convo.chatType === 'vendor') {
                          navigate("/chat", { state: { chatId: convo._id, vendor: convo.vendorId, from: "vendor" } });
                        } else {
                          navigate("/chat", { state: { vendor: { _id: "concierge", name: convo.chatType === 'support' ? "Tendr Support" : "Tendr Concierge", approved: true }, from: convo.chatType === 'support' ? "support" : "concierge" } });
                        }
                      }}
                      style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Open Chat →
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Event cards — all tabs except Ongoing and Chats */}
          {activeTab !== "Ongoing" && activeTab !== "Chats" && (loading ? (
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
