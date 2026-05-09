import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import Footer from "../../components/Footer";
import { resetEventPlanning, setMultipleFormData, setBookingType } from "../../redux/eventPlanningSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const TABS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

const statusMap = {
  Upcoming:  ["submitted", "in_progress"],
  Completed: ["completed"],
  Cancelled: ["cancelled"],
};

const statusBadge = (status) => {
  const map = {
    submitted:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Submitted" },
    in_progress: { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe", label: "In Progress" },
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

  const [activeTab, setActiveTab] = useState("All");
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
      .then((d) => setConversations(Array.isArray(d.conversations) ? d.conversations : []))
      .catch(() => {})
      .finally(() => setLoadingChats(false));
  }, [token]);

  const filtered = activeTab === "All"
    ? plans
    : plans.filter((p) => statusMap[activeTab]?.includes(p.status));

  const counts = {
    All: plans.length,
    Upcoming:  plans.filter((p) => statusMap.Upcoming.includes(p.status)).length,
    Ongoing: conversations.length,
    Completed: plans.filter((p) => p.status === "completed").length,
    Cancelled: plans.filter((p) => p.status === "cancelled").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <BasicSpeedDial />

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,252,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span onClick={() => navigate("/")} style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", cursor: "pointer", letterSpacing: "-0.02em" }}>TENDR</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/booking")} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontFamily: font }}>Plan New Event</button>
            <button onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.18)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: font }}>← Home</button>
          </div>
        </div>
      </div>

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
          </div>
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

          {/* Ongoing chats tab */}
          {activeTab === "Ongoing" ? (
            loadingChats ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontSize: 15 }}>Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>💬</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>No ongoing chats</h4>
                <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Start a chat with a vendor from the listings page.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {conversations.map((convo) => (
                  <div key={convo._id}
                    style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", padding: "20px 24px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E" }}>
                            {convo.vendorId?.name || convo.vendorName || "Vendor Chat"}
                          </span>
                          {convo.chatApproved ? (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>Active</span>
                          ) : convo.chatRejected ? (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100, background: "#fff5f5", color: "#c0392b", border: "1px solid #fca5a5" }}>Rejected</span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>Pending Approval</span>
                          )}
                          {convo.serviceType && (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100, background: "rgba(196,122,46,0.08)", color: "#C47A2E", border: "1px solid rgba(196,122,46,0.2)" }}>{convo.serviceType}</span>
                          )}
                        </div>
                        {convo.eventDetails && convo.eventDetails.eventName && (
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#7A5535" }}>
                            <span>📋 {convo.eventDetails.eventName}</span>
                            {convo.eventDetails.date && <span>📅 {convo.eventDetails.date}</span>}
                            {convo.eventDetails.location && <span>📍 {convo.eventDetails.location}</span>}
                            {convo.eventDetails.guests && <span>👥 {convo.eventDetails.guests} guests</span>}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "#bbb", marginTop: 6 }}>
                          Started {new Date(convo.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      {convo.chatApproved && (
                        <button
                          onClick={() => navigate("/chat", { state: { vendor: convo.vendorId || { _id: convo.vendorId, name: convo.vendorName, approved: true } } })}
                          style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          Open Chat →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}

          {/* Event cards */}
          {activeTab !== "Ongoing" && (loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontSize: 15 }}>Loading your events...</div>
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
