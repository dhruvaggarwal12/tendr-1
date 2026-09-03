import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const ink = "#2C1A0E";
const cream = "#FFFCF5";
const muted = "#9B7450";

const TABS = ["Overview", "Leads", "Bookings", "Chats", "Profile"];
const TAB_ICONS = { Overview: "📊", Leads: "🎯", Bookings: "📅", Chats: "💬", Profile: "👤" };

const LEAD_STATUS_COLORS = {
  assigned: { bg: "#EFF6FF", color: "#1D4ED8", label: "Assigned" },
  in_progress: { bg: "#FEF3C7", color: "#D97706", label: "In Progress" },
  completed: { bg: "#F0FDF4", color: "#15803D", label: "Completed" },
  declined: { bg: "#FFF1F2", color: "#BE123C", label: "Declined" },
};

const BOOKING_STATUS_COLORS = {
  pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
  in_progress: { bg: "#EFF6FF", color: "#1D4ED8", label: "In Progress" },
  completed: { bg: "#F0FDF4", color: "#15803D", label: "Completed" },
  cancelled: { bg: "#FFF1F2", color: "#BE123C", label: "Cancelled" },
};

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{ background: cream, borderRadius: 14, padding: "20px", border: "1.5px solid rgba(196,122,46,0.15)", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 24, fontWeight: 800, color: accent || ink, fontFamily: font }}>{value}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: ink, fontFamily: font }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: muted, fontFamily: font }}>{sub}</span>}
    </div>
  );
}

function StatusBadge({ status, map }) {
  const cfg = map[status] || { bg: "#f3f4f6", color: "#6B7280", label: status };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: "3px 10px", fontFamily: font }}>{cfg.label}</span>
  );
}

function SectionHead({ children }) {
  return <h3 style={{ fontSize: 15, fontWeight: 800, color: ink, fontFamily: font, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>{children}</h3>;
}

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [coordinator, setCoordinator] = useState(null);
  const [token, setToken] = useState(null);
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [referralCopied, setReferralCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem("tendr_coordinator_token");
    const c = localStorage.getItem("tendr_coordinator");
    if (!t || !c) { navigate("/coordinator/login"); return; }
    setToken(t);
    setCoordinator(JSON.parse(c));
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchAll();
    const s = io(BASE, { auth: { token } });
    socketRef.current = s;
    s.on("new_lead", (lead) => setLeads(prev => [lead, ...prev]));
    s.on("new_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return () => s.disconnect();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [lRes, bRes, cRes] = await Promise.all([
        fetch(`${BASE}/coordinators/leads`, { headers: h }),
        fetch(`${BASE}/coordinators/bookings`, { headers: h }),
        fetch(`${BASE}/coordinators/chats`, { headers: h }),
      ]);
      if (lRes.ok) setLeads(await lRes.json());
      if (bRes.ok) setBookings(await bRes.json());
      if (cRes.ok) setChats(await cRes.json());
    } catch {}
    setLoading(false);
  };

  const openChat = async (chat) => {
    setSelectedChat(chat);
    socketRef.current?.emit("join_coordinator_chat", chat._id);
    try {
      const r = await fetch(`${BASE}/coordinators/chats/${chat._id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setMessages(await r.json());
    } catch {}
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedChat) return;
    const text = msgInput.trim();
    setMsgInput("");
    try {
      await fetch(`${BASE}/coordinators/chats/${selectedChat._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
    } catch {}
  };

  const updateLeadStatus = async (leadId, status) => {
    try {
      const r = await fetch(`${BASE}/coordinators/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (r.ok) setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status } : l));
    } catch {}
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const r = await fetch(`${BASE}/coordinators/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await r.json();
      if (r.ok) {
        setCoordinator(data.coordinator);
        localStorage.setItem("tendr_coordinator", JSON.stringify(data.coordinator));
        setEditMode(false);
        setSaveMsg("Profile updated!");
      } else {
        setSaveMsg(data.error || "Update failed");
      }
    } catch {
      setSaveMsg("Network error");
    }
    setSaving(false);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(coordinator?.referralCode || "");
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const logout = () => {
    localStorage.removeItem("tendr_coordinator_token");
    localStorage.removeItem("tendr_coordinator");
    navigate("/coordinator/login");
  };

  if (!coordinator) return null;

  const completedLeads = leads.filter(l => l.status === "completed").length;
  const totalEarned = coordinator.wallet || 0;
  const filteredBookings = bookingFilter === "All" ? bookings : bookings.filter(b => b.status === bookingFilter.toLowerCase().replace(" ", "_"));

  const inputS = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1.5px solid #E5D5C0", background: "#FFFEF9",
    fontFamily: font, fontSize: 13, color: ink, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      {/* Top nav */}
      <div style={{ background: ink, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logo} alt="Tendr" style={{ height: 26, cursor: "pointer" }} onClick={() => navigate("/")} />
            <span style={{ fontSize: 12, color: "rgba(204,171,74,0.7)", fontWeight: 600, borderLeft: "1px solid rgba(204,171,74,0.3)", paddingLeft: 12 }}>Coordinator</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#CCAB4A", fontWeight: 600 }}>{coordinator.name}</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>
              {coordinator.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={logout} style={{ background: "none", border: "1px solid rgba(196,122,46,0.4)", borderRadius: 8, padding: "5px 12px", color: muted, fontFamily: font, fontSize: 12, cursor: "pointer" }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: cream, borderBottom: "1.5px solid rgba(196,122,46,0.15)", padding: "0 20px", overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "14px 20px", fontFamily: font, fontSize: 13, fontWeight: 700,
              color: activeTab === tab ? gold : muted,
              background: "none", border: "none", cursor: "pointer",
              borderBottom: activeTab === tab ? `2.5px solid ${gold}` : "2.5px solid transparent",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
              {TAB_ICONS[tab]} {tab}
              {tab === "Leads" && leads.filter(l => l.status === "assigned").length > 0 && (
                <span style={{ background: gold, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "1px 6px", marginLeft: 2 }}>
                  {leads.filter(l => l.status === "assigned").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>
        {loading && <div style={{ textAlign: "center", color: muted, padding: "60px 0", fontFamily: font }}>Loading your dashboard…</div>}

        {/* ── OVERVIEW ── */}
        {!loading && activeTab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: ink, margin: "0 0 4px" }}>Welcome back, {coordinator.name.split(" ")[0]}! 👋</h2>
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Here's how you're doing</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <StatCard icon="🎯" label="Leads Received" value={leads.length} sub="Total assigned to you" />
              <StatCard icon="✅" label="Leads Completed" value={completedLeads} sub={`${leads.length ? Math.round((completedLeads / leads.length) * 100) : 0}% completion rate`} accent="#15803D" />
              <StatCard icon="💰" label="Wallet Balance" value={`₹${Number(totalEarned).toLocaleString("en-IN")}`} sub="20% of referred bookings" accent={gold} />
              <StatCard icon="📅" label="Active Bookings" value={bookings.filter(b => b.status === "in_progress").length} sub="Currently in progress" />
              <StatCard icon="💬" label="Active Chats" value={chats.length} sub="Client conversations" />
            </div>

            {/* Referral code */}
            {coordinator.referralCode && (
              <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(204,171,74,0.7)", margin: "0 0 6px" }}>Your Referral Code</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: "#CCAB4A", margin: "0 0 4px", letterSpacing: "0.05em", fontFamily: font }}>{coordinator.referralCode}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>Share this code — you earn 20% of every booking that uses it</p>
                </div>
                <button onClick={copyReferral} style={{ background: referralCopied ? "#15803D" : gold, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}>
                  {referralCopied ? "✓ Copied!" : "Copy Code"}
                </button>
              </div>
            )}

            {/* Recent leads */}
            {leads.slice(0, 3).length > 0 && (
              <div>
                <SectionHead>🎯 Recent Leads</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {leads.slice(0, 3).map(lead => (
                    <div key={lead._id} style={{ background: cream, borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: ink, fontSize: 14 }}>{lead.customerName}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: muted }}>{lead.eventType} · {lead.eventDate ? new Date(lead.eventDate).toLocaleDateString("en-IN") : "Date TBD"}</p>
                      </div>
                      <StatusBadge status={lead.status} map={LEAD_STATUS_COLORS} />
                    </div>
                  ))}
                  {leads.length > 3 && <button onClick={() => setActiveTab("Leads")} style={{ background: "none", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "10px", color: gold, fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View all {leads.length} leads →</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LEADS ── */}
        {!loading && activeTab === "Leads" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: ink, margin: 0 }}>🎯 Your Leads</h2>
              <span style={{ fontSize: 13, color: muted }}>{leads.length} total · {leads.filter(l => l.status === "assigned").length} new</span>
            </div>

            {leads.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: muted }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ fontWeight: 700, color: ink }}>No leads yet</p>
                <p style={{ fontSize: 13 }}>Admin will assign leads to you — check back soon</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {leads.map(lead => (
                <div key={lead._id} style={{ background: cream, borderRadius: 14, padding: "20px", border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 10px rgba(44,26,14,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, color: ink, fontSize: 16 }}>{lead.customerName}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: muted }}>{lead.eventType}{lead.location ? ` · ${lead.location}` : ""}</p>
                    </div>
                    <StatusBadge status={lead.status} map={LEAD_STATUS_COLORS} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                    {[
                      ["📅 Date", lead.eventDate ? new Date(lead.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "TBD"],
                      ["👥 Guests", lead.guests || "—"],
                      ["💰 Budget", lead.budget ? `₹${Number(lead.budget).toLocaleString("en-IN")}` : "—"],
                      ["📍 Location", lead.location || "—"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: "#F8F4EF", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ margin: 0, fontSize: 10, color: muted, fontWeight: 600 }}>{k}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: ink }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {lead.notes && <p style={{ fontSize: 13, color: muted, margin: "0 0 14px", background: "#FFF8EE", borderRadius: 8, padding: "8px 12px", borderLeft: `3px solid ${gold}` }}>{lead.notes}</p>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {lead.status === "assigned" && (
                      <>
                        <button onClick={() => updateLeadStatus(lead._id, "in_progress")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Accept Lead</button>
                        <button onClick={() => updateLeadStatus(lead._id, "declined")} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid #FCA5A5", background: "#FFF1F2", color: "#BE123C", fontFamily: font, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Decline</button>
                      </>
                    )}
                    {lead.status === "in_progress" && (
                      <button onClick={() => updateLeadStatus(lead._id, "completed")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#15803D", color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Mark Completed ✓</button>
                    )}
                    {lead.phone && (
                      <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noopener" style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: gold, fontFamily: font, fontWeight: 700, fontSize: 12, textDecoration: "none" }}>WhatsApp Client</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {!loading && activeTab === "Bookings" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: ink, margin: 0 }}>📅 Bookings</h2>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", "In Progress", "Completed", "Cancelled"].map(f => (
                <button key={f} onClick={() => setBookingFilter(f)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer", background: bookingFilter === f ? gold : "#fff", color: bookingFilter === f ? "#fff" : muted, border: bookingFilter === f ? "none" : "1.5px solid #E5D5C0" }}>
                  {f}
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: muted }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ fontWeight: 700, color: ink }}>No bookings found</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredBookings.map(booking => (
                <div key={booking._id} style={{ background: cream, borderRadius: 14, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: ink, fontSize: 15 }}>{booking.customerName}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: muted }}>{booking.eventType} · {booking.date ? new Date(booking.date).toLocaleDateString("en-IN") : "TBD"}</p>
                    {booking.location && <p style={{ margin: "1px 0 0", fontSize: 12, color: muted }}>📍 {booking.location}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <StatusBadge status={booking.status} map={BOOKING_STATUS_COLORS} />
                    {booking.amount && <span style={{ fontSize: 13, fontWeight: 700, color: gold }}>₹{Number(booking.amount).toLocaleString("en-IN")}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHATS ── */}
        {!loading && activeTab === "Chats" && (
          <div style={{ display: "flex", gap: 16, height: "calc(100vh - 200px)", minHeight: 400 }}>
            {/* Chat list */}
            <div style={{ width: 280, flexShrink: 0, background: cream, borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
                <p style={{ margin: 0, fontWeight: 800, color: ink, fontSize: 14 }}>Conversations ({chats.length})</p>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {chats.length === 0 && <div style={{ textAlign: "center", padding: "30px 16px", color: muted, fontSize: 13 }}>No chats yet</div>}
                {chats.map(chat => (
                  <button key={chat._id} onClick={() => openChat(chat)} style={{ width: "100%", padding: "14px 16px", border: "none", background: selectedChat?._id === chat._id ? "#FFF8EE" : "transparent", cursor: "pointer", textAlign: "left", borderBottom: "1px solid rgba(196,122,46,0.07)", fontFamily: font }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                        {(chat.clientName || chat.customerName || "C")[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: ink, fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{chat.clientName || chat.customerName || "Client"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: muted, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{chat.lastMessage || chat.eventType || "—"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat window */}
            <div style={{ flex: 1, background: cream, borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {!selectedChat ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: muted }}>
                  <div style={{ fontSize: 36 }}>💬</div>
                  <p style={{ fontWeight: 700, color: ink }}>Select a conversation</p>
                  <p style={{ fontSize: 13 }}>Choose a chat from the left to start messaging</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>
                      {(selectedChat.clientName || selectedChat.customerName || "C")[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, color: ink, fontSize: 14 }}>{selectedChat.clientName || selectedChat.customerName || "Client"}</p>
                      {selectedChat.eventType && <p style={{ margin: 0, fontSize: 11, color: muted }}>{selectedChat.eventType}</p>}
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {messages.length === 0 && <div style={{ textAlign: "center", color: muted, fontSize: 13, padding: "20px 0" }}>No messages yet — say hello!</div>}
                    {messages.map((msg, i) => {
                      const mine = msg.senderType === "coordinator";
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "70%", padding: "9px 14px", borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: mine ? gold : "#F3EDE6", color: mine ? "#fff" : ink, fontSize: 13, fontFamily: font, lineHeight: 1.5 }}>
                            {msg.text}
                            <div style={{ fontSize: 10, color: mine ? "rgba(255,255,255,0.6)" : muted, marginTop: 3, textAlign: "right" }}>
                              {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(196,122,46,0.1)", display: "flex", gap: 8 }}>
                    <input
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message…"
                      style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E5D5C0", background: "#FFFEF9", fontFamily: font, fontSize: 13, color: ink, outline: "none" }}
                    />
                    <button onClick={sendMessage} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: gold, color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {!loading && activeTab === "Profile" && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: ink, margin: 0 }}>👤 Your Profile</h2>
              {!editMode
                ? <button onClick={() => { setEditMode(true); setEditForm({ name: coordinator.name, city: coordinator.city, bio: coordinator.bio, portfolio: coordinator.portfolioLink, instagram: coordinator.instagram }); }} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: gold, fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Edit Profile</button>
                : <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditMode(false)} style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E5D5C0", background: "#fff", color: muted, fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                    <button onClick={saveProfile} disabled={saving} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: gold, color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Saving…" : "Save Changes"}</button>
                  </div>
              }
            </div>

            {saveMsg && <div style={{ background: saveMsg.includes("!") ? "#F0FDF4" : "#FFF1F1", border: `1.5px solid ${saveMsg.includes("!") ? "#86EFAC" : "#FCA5A5"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: saveMsg.includes("!") ? "#15803D" : "#DC2626", fontFamily: font }}>{saveMsg}</div>}

            <div style={{ background: cream, borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(196,122,46,0.12)" }}>
              {/* Avatar strip */}
              <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "28px 28px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {coordinator.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: "#fff", fontSize: 18 }}>{coordinator.name}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(196,122,46,0.8)" }}>Event Coordinator · {coordinator.city}</p>
                  {coordinator.referralCode && <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(204,171,74,0.6)" }}>Code: <strong style={{ color: "#CCAB4A" }}>{coordinator.referralCode}</strong></p>}
                </div>
              </div>

              <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
                {editMode ? (
                  <>
                    {[["Name", "name", "text"], ["City", "city", "text"], ["Portfolio Link", "portfolio", "url"], ["Instagram", "instagram", "text"]].map(([label, key, type]) => (
                      <div key={key}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>{label}</label>
                        <input type={type} style={inputS} value={editForm[key] || ""} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>About You</label>
                      <textarea style={{ ...inputS, height: 90, resize: "vertical" }} value={editForm.bio || ""} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      ["Phone", coordinator.phoneNumber],
                      ["Email", coordinator.email],
                      ["City", coordinator.city],
                      ["Experience", coordinator.experience ? `${coordinator.experience} years` : "—"],
                      ["Events/Month", coordinator.eventsPerMonth || "—"],
                      ["Portfolio", coordinator.portfolioLink || "—"],
                      ["Instagram", coordinator.instagram || "—"],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                        <span style={{ fontSize: 14, color: ink, fontWeight: 600, textAlign: "right" }}>{value}</span>
                      </div>
                    ))}
                    {coordinator.specializations?.length > 0 && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Specializations</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {coordinator.specializations.map(s => <span key={s} style={{ background: "#FFF8EE", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: gold }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                    {coordinator.bio && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>About</p>
                        <p style={{ fontSize: 14, color: ink, lineHeight: 1.65, margin: 0 }}>{coordinator.bio}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
