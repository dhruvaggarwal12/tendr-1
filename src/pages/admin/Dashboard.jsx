import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { generateEventDetailsPDF, generateInvoicePDF, generateInvitationPDF, generateTimelinePDF } from "../../utils/pdfGenerator";
import { generateVendorReferralCode, formatCode } from "../../utils/referral";
import AddVendorModal from "./AddVendorModal";
import LaunchSequence from "../../components/LaunchSequence";
import StationeryAdminTab from "./StationeryAdminTab";
import RecommendationIntelligenceTab from "./RecommendationIntelligenceTab";
import CommunityModerationTab from "./CommunityModerationTab";
import EditVendorModal from "./EditVendorModal";
import CatererMenuEditor from "./CatererMenuEditor";
import { io } from "socket.io-client";
import EastIcon from "@mui/icons-material/East";

import Dashboards_Nav from "../../components/Dashboards_Nav";
import { Badge } from "../../components/ui";

import {
  LineChart_UserVendorGrowth_AdminDashboard,
  LineChart_BookingsPerMonth_AdminDashboard,
  Doughnut_BookingCategory_AdminDashboard,
  Doughnut_BookingCity_AdminDashboard,
  Doughnut_VendorCity_AdminDashboard,
  Doughnut_UserCity_AdminDashboard,
  LineChart_UserNew_AdminDashboard,
} from "../../components/Charts_Dashboards";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

import {
  LayoutDashboard,
  IndianRupee,
  TicketSlash,
  ChartColumnDecreasing,
  UserRound,
  BriefcaseBusiness,
  BadgeIndianRupee,
  MessageCircle,
  MessagesSquare,
  CalendarCheck2,
  CalendarClock,
  CalendarFold,
  CalendarX2,
  Camera,
  Music,
  SprayCan,
  HandPlatter,
  Store,
  Handshake,
  MonitorCheck,
  MonitorX,
  UserPlus,
  Star,
  FileText,
} from "lucide-react";
import useConversations from "../../hooks/useConversations";
import { getConversationMessages } from "../../apis/conversationsApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const formatEarnings = (amount) => {
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }
  return `₹${amount}`;
};

const getInitials = (name) => {
  const names = name.split(" ");
  const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
  return initials;
};

const formatTimeIST = (isoDate) => {
  const date = new Date(isoDate);

  const options = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };

  return new Intl.DateTimeFormat("en-IN", options).format(date);
};

const stats_dashboard = [
  {
    label: "Users Count",
    value: 1229,
    icon: <UserRound size={32} className="text-[#d08f4e]" />,
    key: "customer",
  },
  {
    label: "Vendor Count",
    value: 305,
    icon: <BriefcaseBusiness size={32} className="text-[#d08f4e]" />,
    key: "vendor",
  },
  {
    label: "Completed Bookings",
    value: 689,
    icon: <CalendarCheck2 size={32} className="text-[#d08f4e]" />,
    key: "events-completed",
  },
  {
    label: "Pending Bookings",
    value: 132,
    icon: <CalendarClock size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
];

const stats_bookings = [
  {
    label: "Total Bookings",
    value: 838,
    icon: <CalendarFold size={32} className="text-[#d08f4e]" />,
    key: "customer",
  },
  {
    label: "Completed Bookings",
    value: 689,
    icon: <CalendarCheck2 size={32} className="text-[#d08f4e]" />,
    key: "vendor",
  },
  {
    label: "Pending Bookings",
    value: 132,
    icon: <CalendarClock size={32} className="text-[#d08f4e]" />,
    key: "events-completed",
  },
  {
    label: "Cancelled Bookings",
    value: 17,
    icon: <CalendarX2 size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
];

const stats_payments = [
  {
    label: "Total Payments",
    value: 208,
    icon: <CalendarFold size={32} className="text-[#d08f4e]" />,
    key: "customer",
  },
  {
    label: "Payments done this month",
    value: 159,
    icon: <CalendarCheck2 size={32} className="text-[#d08f4e]" />,
    key: "vendor",
  },
  {
    label: "Total Revenue",
    value: 49,
    icon: <CalendarClock size={32} className="text-[#d08f4e]" />,
    key: "events-completed",
  },
  {
    label: "Total Payouts to Vendors",
    value: 17,
    icon: <CalendarX2 size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
];

const stats_vendors = [
  {
    label: "Total Vendors",
    value: 305,
    icon: <BriefcaseBusiness size={32} className="text-[#d08f4e]" />,
    key: "customer",
  },
  {
    label: "Total Caterers",
    value: 82,
    icon: <HandPlatter size={32} className="text-[#d08f4e]" />,
    key: "vendor",
  },
  {
    label: "Total DJs",
    value: 77,
    icon: <Music size={32} className="text-[#d08f4e]" />,
    key: "events-completed",
  },
  {
    label: "Total Decorators",
    value: 67,
    icon: <SprayCan size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
  {
    label: "Total Photographers",
    value: 79,
    icon: <Camera size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
  {
    label: "New Vendors this month",
    value: 28,
    icon: <Handshake size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
  {
    label: "Active Vendors",
    value: 219,
    icon: <MonitorCheck size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
  {
    label: "Inactive Vendors",
    value: 86,
    icon: <MonitorX size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
];

const topVendors = [
  { name: "Vendor A", city: "Delhi", bookings: 59, medal: "🥇" },
  { name: "Vendor B", city: "Noida", bookings: 54, medal: "🥈" },
  { name: "Vendor C", city: "Ghaziabad", bookings: 48, medal: "🥉" },
];

const topEarners = [
  { name: "Vendor X", city: "Noida", medal: "🥇", earnings: 670000 },
  { name: "Vendor Y", city: "Greater Noida", medal: "🥈", earnings: 625500 },
  { name: "Vendor Z", city: "Ghaziabad", medal: "🥉", earnings: 592000 },
];

const stats_users = [
  {
    label: "Total Users",
    value: 1229,
    icon: <UserRound size={32} className="text-[#d08f4e]" />,
    key: "customer",
  },
  {
    label: "Active Users",
    value: 412,
    icon: <MonitorCheck size={32} className="text-[#d08f4e]" />,
    key: "vendor",
  },
  {
    label: "New Users this month",
    value: 121,
    icon: <UserPlus size={32} className="text-[#d08f4e]" />,
    key: "events-completed",
  },
  {
    label: "Repeat Users",
    value: 185,
    icon: <Handshake size={32} className="text-[#d08f4e]" />,
    key: "events-due",
  },
];

const sidebar_arr = [
  { label: "Dashboard",        icon: <LayoutDashboard size={22} />,   key: "Dashboard" },
  { label: "Chat Requests",    icon: <MessageCircle size={22} />,     key: "ChatRequests" },
  { label: "Bookings",         icon: <CalendarFold size={22} />,      key: "Bookings" },
  { label: "Change Requests",  icon: <CalendarClock size={22} />,     key: "ChangeRequests" },
  { label: "Vendors",          icon: <BriefcaseBusiness size={22} />, key: "Vendors" },
  { label: "Users",            icon: <UserRound size={22} />,         key: "Users" },
  { label: "Payments",         icon: <BadgeIndianRupee size={22} />,  key: "Payments" },
  { label: "Chat",             icon: <MessageCircle size={22} />,     key: "Chat" },
  { label: "Chat-Support",     icon: <MessagesSquare size={22} />,    key: "ChatSupport" },
  { label: "Gift Hampers",     icon: <span style={{ fontSize: 18 }}>🎁</span>, key: "GiftHampers" },
  { label: "Invoices",         icon: <FileText size={22} />,                   key: "Invoices" },
  { label: "Reviews",          icon: <Star size={22} />,                       key: "Reviews" },
  { label: "Photos",           icon: <Camera size={22} />,                     key: "Photos" },
  { label: "Smart Plans",     icon: <span style={{ fontSize: 16 }}>🗂</span>,  key: "SmartPlans" },
  { label: "Wedding Stationery",    icon: <span style={{ fontSize: 16 }}>💍</span>,  key: "Stationery" },
  { label: "Rec. Intelligence",     icon: <span style={{ fontSize: 16 }}>📊</span>,  key: "Recommendations" },
  { label: "Community",             icon: <span style={{ fontSize: 16 }}>🌟</span>,  key: "Community" },
  { label: "Event Day",             icon: <span style={{ fontSize: 16 }}>🎉</span>,  key: "EventDay" },
  { label: "Ebooks",               icon: <span style={{ fontSize: 16 }}>📚</span>,  key: "Ebooks" },
  { label: "🚀 Launch",            icon: <span style={{ fontSize: 16 }}>🚀</span>,  key: "Launch" },
];

// Simple inline markdown renderer — handles *bold*, _italic_, line breaks, [img:...] images
function RenderMessage({ text }) {
  if (!text) return null;
  if (text.startsWith("[img:")) {
    const src = text.slice(5, -1);
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={src}
          alt="shared"
          style={{ maxWidth: "min(220px, 100%)", maxHeight: 220, borderRadius: 10, display: "block", objectFit: "contain" }}
        />
        <a
          href={src}
          download={`tendr-image-${Date.now()}.jpg`}
          onClick={e => e.stopPropagation()}
          title="Download image"
          style={{ position: "absolute", bottom: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#fff", fontSize: 12 }}
        >
          ⬇
        </a>
      </div>
    );
  }
  const lines = text.split("\n");
  return (
    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
      {lines.map((line, li) => {
        // Parse *bold* and _italic_ inline
        const parts = [];
        let remaining = line;
        let key = 0;
        while (remaining.length > 0) {
          const boldMatch = remaining.match(/^\*([^*]+)\*/);
          const italicMatch = remaining.match(/^_([^_]+)_/);
          if (boldMatch) {
            parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
            remaining = remaining.slice(boldMatch[0].length);
          } else if (italicMatch) {
            parts.push(<em key={key++}>{italicMatch[1]}</em>);
            remaining = remaining.slice(italicMatch[0].length);
          } else {
            // grab until next * or _
            const nextSpecial = remaining.search(/[*_]/);
            const chunk = nextSpecial === -1 ? remaining : remaining.slice(0, nextSpecial);
            if (chunk) parts.push(<span key={key++}>{chunk}</span>);
            remaining = nextSpecial === -1 ? "" : remaining.slice(chunk.length);
            if (nextSpecial !== -1 && (remaining[0] === "*" || remaining[0] === "_")) {
              // orphan marker — just show it
              parts.push(<span key={key++}>{remaining[0]}</span>);
              remaining = remaining.slice(1);
            }
          }
        }
        return (
          <span key={li}>
            {parts.length ? parts : " "}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </div>
  );
}

function EventDayTab({ token, BASE_URL }) {
  const font = "'Outfit', sans-serif";
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/admin/event-day-messages?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => setPlans(d.plans || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [date]);

  const buildWAMessage = (plan) => {
    const name = plan.customerName || 'there';
    const event = plan.eventType || 'event';
    return encodeURIComponent(
      `Greetings of the day! 🎉\n\n` +
      `The Tendr Team wishes you and your loved ones a wonderful ${event}! 🎊✨\n\n` +
      `Today is the day — we hope everything comes together beautifully. Your vendors are ready, and we're rooting for you every step of the way! 🙌\n\n` +
      `📸 Don't forget to capture some beautiful moments! Upload your favourite photos to Instagram and tag us — @justtendrit — we'd love to celebrate your ${event} with you.\n\n` +
      `💛 Wishing you a joyful, stress-free celebration!\n\n` +
      `— Team Tendr\n` +
      `tendr.co.in`
    );
  };

  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#2C1A0E', margin: 0 }}>🎉 Event Day Messages</h2>
          <p style={{ fontSize: 13, color: '#9B7450', margin: '4px 0 0' }}>Send WhatsApp wishes to customers whose event is today.</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.3)', fontFamily: font, fontSize: 13, color: '#2C1A0E', background: '#fff', cursor: 'pointer' }}
        />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: '#9B7450' }}>Loading…</div>}

      {!loading && plans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗓</div>
          <p style={{ fontSize: 15, color: '#9B7450', fontWeight: 600 }}>No events scheduled for {date}.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {plans.map(plan => (
          <div key={plan._id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.18)', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#2C1A0E', marginBottom: 4 }}>{plan.customerName}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, background: 'rgba(196,122,46,0.1)', border: '1px solid rgba(196,122,46,0.25)', borderRadius: 100, padding: '2px 10px', color: '#6B3A1F', fontWeight: 700 }}>
                  🎊 {plan.eventType}
                </span>
                {plan.eventName && (
                  <span style={{ fontSize: 12, color: '#9B7450' }}>"{plan.eventName}"</span>
                )}
                <span style={{ fontSize: 12, color: '#9B7450' }}>📅 {plan.date}</span>
                {plan.phone && (
                  <span style={{ fontSize: 12, color: '#9B7450' }}>📞 {plan.phone}</span>
                )}
              </div>
            </div>
            {plan.phone ? (
              <a
                href={`https://wa.me/91${plan.phone.replace(/\D/g, '').slice(-10)}?text=${buildWAMessage(plan)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flexShrink: 0, padding: '10px 22px', borderRadius: 12, border: 'none', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: font, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 3px 12px rgba(37,211,102,0.3)', whiteSpace: 'nowrap' }}
              >
                <span style={{ fontSize: 18 }}>💬</span> Send WhatsApp
              </a>
            ) : (
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>No phone on record</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EbooksAdminTab() {
  const [accesses, setAccesses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const token = useSelector(s => s.auth?.token);

  React.useEffect(() => {
    fetch(`${BASE_URL}/admin/ebook-accesses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : { accesses: [] })
      .then(d => setAccesses(d.accesses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const stats = React.useMemo(() => {
    const total = accesses.length;
    const previews = accesses.filter(a => a.action === 'preview').length;
    const reads = accesses.filter(a => a.action === 'read').length;
    const downloads = accesses.filter(a => a.action === 'download').length;
    const phones = new Set(accesses.map(a => a.phone).filter(p => p && p !== 'unknown')).size;
    return { total, previews, reads, downloads, phones };
  }, [accesses]);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", maxWidth: 900 }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", marginBottom: 6 }}>📚 Ebooks Access Log</h2>
      <p style={{ fontSize: 13, color: "#9B7450", marginBottom: 24 }}>Track who accessed guides, read them, or downloaded them.</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Events", value: stats.total, icon: "📊" },
          { label: "Unique Phones", value: stats.phones, icon: "📱" },
          { label: "Previews", value: stats.previews, icon: "👁️" },
          { label: "Reads", value: stats.reads, icon: "📖" },
          { label: "Downloads", value: stats.downloads, icon: "⬇️" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 2px 8px rgba(139,69,19,0.06)" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#2C1A0E", lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9B7450" }}>Loading...</div>
      ) : accesses.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9B7450" }}>No ebook access events yet.</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(196,122,46,0.06)", borderBottom: "1.5px solid rgba(196,122,46,0.12)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#9B7450", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Phone</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#9B7450", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Guide</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#9B7450", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Action</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#9B7450", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {[...accesses].reverse().map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 700, color: "#2C1A0E" }}>{a.phone || "—"}</td>
                  <td style={{ padding: "11px 16px", color: "#5a3a1a" }}>{a.title || a.slug || "—"}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                      background: a.action === 'download' ? "rgba(21,128,61,0.1)" : a.action === 'read' ? "rgba(196,122,46,0.1)" : "rgba(59,130,246,0.1)",
                      color: a.action === 'download' ? "#15803d" : a.action === 'read' ? "#C47A2E" : "#3b82f6",
                    }}>
                      {a.action === 'download' ? "⬇️ Downloaded" : a.action === 'read' ? "📖 Read" : "👁️ Preview"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", color: "#9B7450", fontSize: 12 }}>{a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminLocation = useLocation();
  const { user, token } = useSelector((state) => state.auth);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (user && !user.isAdmin) { navigate("/login"); return; }
  }, [token, user, navigate]);

  // Check whether this token carries admin rights (works even when user object is null)
  const isAdminToken = (() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.isAdmin === true;
    } catch { return false; }
  })();

  // Centralized fetch that auto-detects 401 and redirects to login
  const adminFetch = async (url, opts = {}) => {
    const res = await fetch(url, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
      credentials: "include",
    });
    if (res.status === 401) {
      localStorage.removeItem('tendr_token');
      localStorage.removeItem('tendr_user');
      navigate("/login");
      throw new Error('401');
    }
    return res;
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [siteIsLive, setSiteIsLive] = useState(null); // null = loading, true/false = fetched
  const [launchSequenceActive, setLaunchSequenceActive] = useState(false);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [activeDropdown, setactiveDropdown] = useState(() => {
    const s = new URLSearchParams(adminLocation.search).get("section");
    return s || "dashboard";
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const selectedChatRef = useRef(null);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [adminMsgInput, setAdminMsgInput] = useState("");
  const adminSocketRef = useRef(null);
  const [remindersDue, setRemindersDue]       = useState([]);
  const [markingSent, setMarkingSent]         = useState({}); // { [eventId]: bool }
  const [copiedMsg, setCopiedMsg]             = useState({}); // { [eventId]: bool }
  const [liveStats, setLiveStats] = useState(null);
  const [vendorApplications, setVendorApplications] = useState([]);
  const [eventPlans, setEventPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [chatRequests, setChatRequests] = useState([]);
  const [ghOrders, setGhOrders]         = useState([]);
  const [ghLoading, setGhLoading]       = useState(false);
  const [selectedGhId, setSelectedGhId] = useState(null);
  const [ghEdits, setGhEdits]           = useState({}); // { [orderId]: items[] }
  const [ghSaving, setGhSaving]         = useState(false);
  const [ghSamples, setGhSamples]       = useState([]);
  const [ghSampleName, setGhSampleName] = useState("");
  const [ghSampleFile, setGhSampleFile] = useState(null);
  const [ghSampleUploading, setGhSampleUploading] = useState(false);
  const [ghSampleMsg, setGhSampleMsg]   = useState("");
  const [vendorStats, setVendorStats] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [bookingTab, setBookingTab] = useState("All");
  // Payments tab
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  // Top vendors (real)
  const [topVendorsReal, setTopVendorsReal] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [addedVendorCount, setAddedVendorCount] = useState(0);
  const [deletingVendorId, setDeletingVendorId] = useState(null);
  const [togglingHideId, setTogglingHideId] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [menuVendor, setMenuVendor] = useState(null);
  const [registeringAppId, setRegisteringAppId] = useState(null);
  // Vendor search + filters
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorFilterType, setVendorFilterType] = useState("all");
  const [vendorFilterCity, setVendorFilterCity] = useState("all");
  const [vendorFilterStatus, setVendorFilterStatus] = useState("all");
  const [vendorFilterTopRated, setVendorFilterTopRated] = useState("all");
  const [vendorFilterCorporate, setVendorFilterCorporate] = useState("all");
  const [vendorSubTab, setVendorSubTab] = useState("list");
  const [vendorAnalyticsSortBy, setVendorAnalyticsSortBy] = useState("requestCount");
  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewSubTab, setReviewSubTab] = useState("reviews"); // "reviews" | "upcoming"
  // Admin gallery for photo sharing
  const [adminGalleryOpen, setAdminGalleryOpen] = useState(false);
  const [adminGalleryPhotos, setAdminGalleryPhotos] = useState([]);
  const [adminGalleryLoading, setAdminGalleryLoading] = useState(false);
  const [adminGallerySelected, setAdminGallerySelected] = useState([]);
  // Gallery / Photos
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  // per-category upload meta: { [category]: { theme, caption } }
  const [galleryUploadMeta, setGalleryUploadMeta] = useState({});
  const [viewingPhoto, setViewingPhoto] = useState(null); // full-screen photo URL
  // Smart Plans
  const [smartPlans, setSmartPlans] = useState([]);
  const [smartPlansLoaded, setSmartPlansLoaded] = useState(false);
  const [smartPlanExpanded, setSmartPlanExpanded] = useState(null);
  const [smartPlanBudgets, setSmartPlanBudgets] = useState({}); // { [planId]: { [category]: amount } }
  const [budgetPinning, setBudgetPinning] = useState({}); // { [planId]: bool }
  // PDF + pinned messages in bookings
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // ── Invoice state ─────────────────────────────────────────────────────────
  const [invoiceSearch,   setInvoiceSearch]   = useState("");
  const [invoiceModal,    setInvoiceModal]     = useState(null); // null | { mode:"create"|"edit", planId:string|null }
  const [invoiceForm,     setInvoiceForm]      = useState({});
  const [customInvoices,  setCustomInvoices]   = useState([]);
  const blankInvoiceForm = () => ({
    customerName:"", phone:"", eventType:"", eventDate:"", location:"", guests:"",
    orderId:`INV-${Date.now()}`, paymentId:"", status:"paid", notes:"",
    services:[{ category:"", amount:"" }], totalOverride:"",
  });
  const openCreateInvoice = () => { setInvoiceForm(blankInvoiceForm()); setInvoiceModal({ mode:"create", planId:null }); };
  const openEditInvoice   = (plan) => {
    const vendors = (plan.vendors || plan.confirmedVendors || []).map(v => ({ category: v.serviceType || v.name || "", amount: "" }));
    setInvoiceForm({
      customerName: plan.customerId?.name || "", phone: plan.customerId?.phoneNumber || "",
      eventType: plan.eventType || "", eventDate: plan.date || "",
      location: plan.location || "", guests: plan.guests || "",
      orderId: plan.orderId || plan._id?.slice(-10) || "", paymentId: plan.paymentId || "",
      status: plan.status === "completed" ? "paid" : "paid", notes: "",
      services: vendors.length ? vendors : [{ category:"", amount:"" }],
      totalOverride: plan.totalAmount ? String(plan.totalAmount) : "",
    });
    setInvoiceModal({ mode:"edit", planId: plan._id });
  };
  const invFieldSet = (key, val) => setInvoiceForm(f => ({ ...f, [key]: val }));
  const invServiceSet = (i, key, val) => setInvoiceForm(f => {
    const s = [...f.services]; s[i] = { ...s[i], [key]: val }; return { ...f, services: s };
  });
  const invServiceAdd    = () => setInvoiceForm(f => ({ ...f, services: [...f.services, { category:"", amount:"" }] }));
  const invServiceRemove = (i) => setInvoiceForm(f => ({ ...f, services: f.services.filter((_,j) => j !== i) }));
  const invTotal = (form) => {
    if (form.totalOverride) return Number(form.totalOverride);
    return form.services.reduce((s, sv) => s + (Number(sv.amount) || 0), 0);
  };
  const downloadInvoiceFromForm = (form) => {
    const total = invTotal(form);
    setPdfGenerating(true);
    try {
      generateInvoicePDF({
        eventSummary: { eventType: form.eventType, date: form.eventDate, location: form.location, guests: form.guests },
        confirmedVendors: [],
        serviceAmounts: form.services.filter(s => s.category).map(s => ({ category: s.category, amount: Number(s.amount) || 0 })),
        amount: total, orderId: form.orderId, paymentId: form.paymentId, userName: form.customerName,
      });
    } finally { setPdfGenerating(false); }
  };
  const whatsAppInvoice = (form) => {
    downloadInvoiceFromForm(form);
    const phone = form.phone.replace(/\D/g, "");
    if (!phone) { alert("Add the customer's phone number to send via WhatsApp."); return; }
    const total = invTotal(form);
    const msg = encodeURIComponent(
      `Hello ${form.customerName || "there"},\n\nYour invoice from *Tendr* is ready!\n\n` +
      `📋 *Event:* ${form.eventType || "—"}\n📅 *Date:* ${form.eventDate || "—"}\n` +
      `💰 *Total:* ₹${Number(total).toLocaleString("en-IN")}\n🔖 *Order ID:* ${form.orderId || "—"}\n\n` +
      `Your invoice PDF has been downloaded. Please check your device downloads.\n\n— Tendr Team`
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
  };
  const [pinnedByPlan, setPinnedByPlan] = useState({}); // { [planId]: { loading, messages } }
  const [pinnedOpenByVendor, setPinnedOpenByVendor] = useState({}); // { [planId__vendorName]: bool }

  // Notified tracking — persisted to localStorage so it survives page refresh
  const [notifiedAt, setNotifiedAt] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tendr_admin_notified") || "{}"); } catch { return {}; }
  });
  const markNotified = (planId) => {
    const ts = Date.now();
    const next = { ...notifiedAt, [planId]: ts };
    setNotifiedAt(next);
    try { localStorage.setItem("tendr_admin_notified", JSON.stringify(next)); } catch {}
  };
  const fmtNotifiedAge = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Chat summary feature
  const [pinnedMsgs, setPinnedMsgs] = useState([]);   // [{ content, conversationId }]
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState("");

  const { recentChats: rawRecentChats, supportChats: rawSupportChats, adminChats: rawAdminChats, reload: reloadConversations } = useConversations({ enabled: !!token && isAdminToken });
  const [pendingConciergeId, setPendingConciergeId] = useState(null);
  const [deletedChatIds, setDeletedChatIds] = useState(new Set());

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this chat and all its messages from the database?")) return;
    const id = chatId?.toString();
    fetch(`${BASE_URL}/admin/conversations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(async r => {
        if (r.ok) {
          setDeletedChatIds(prev => new Set([...prev, id]));
          if (selectedChat?._id?.toString() === id) setSelectedChat(null);
        } else {
          const data = await r.json().catch(() => ({}));
          window.alert(`Delete failed: ${data.error || r.statusText}`);
        }
      })
      .catch(() => window.alert("Network error — chat not deleted. Please check your connection."));
  };

  // TTL fallback for chats with no event date — 24h inactivity
  const TTL_MS = 24 * 60 * 60 * 1000;
  const isClosed = (c) => c.status === 'CLOSED' || c.status === 'closed';
  const isExpired = (c) => {
    const eventDate = c.eventDetails?.date;
    if (eventDate) {
      // Keep until end of event day + 1 buffer day
      const expiry = new Date(eventDate + "T23:59:59");
      expiry.setDate(expiry.getDate() + 1);
      return Date.now() > expiry.getTime();
    }
    const last = c.updatedAt || c.lastMessageAt || c.createdAt;
    return last && (Date.now() - new Date(last).getTime()) > TTL_MS;
  };
  const hoursLeft = (c) => {
    const eventDate = c.eventDetails?.date;
    if (eventDate) {
      const expiry = new Date(eventDate + "T23:59:59");
      expiry.setDate(expiry.getDate() + 1);
      const remaining = expiry.getTime() - Date.now();
      return remaining > 0 ? Math.ceil(remaining / 3600000) : 0;
    }
    const last = c.updatedAt || c.lastMessageAt || c.createdAt;
    if (!last) return null;
    const remaining = TTL_MS - (Date.now() - new Date(last).getTime());
    return remaining > 0 ? Math.ceil(remaining / 3600000) : 0;
  };

  // Active + closed (non-expired or explicitly CLOSED) chats — CLOSED ones always stay visible
  const recentChats  = rawRecentChats.filter(c => (!isExpired(c) || isClosed(c)) && !deletedChatIds.has(c._id?.toString()));
  const supportChats = rawSupportChats.filter(c => (!isExpired(c) || isClosed(c)) && !deletedChatIds.has(c._id?.toString()));
  const adminChats   = rawAdminChats.filter(c => (!isExpired(c) || isClosed(c)) && !deletedChatIds.has(c._id?.toString()));

  // Auto-select conversation when navigating from Smart Plans tab
  useEffect(() => {
    if (!pendingConciergeId || !recentChats.length) return;
    const convo = recentChats.find(c => c._id?.toString() === pendingConciergeId.toString());
    if (convo) {
      setSelectedChat(convo);
      loadConversation(convo._id);
      setPendingConciergeId(null);
    }
  }, [recentChats, pendingConciergeId]);


  // Fetch WhatsApp reminders due today
  useEffect(() => {
    if (!token || !isAdminToken) return;
    adminFetch(`${BASE_URL}/planned-events/reminders-due`)
      .then(r => r.json())
      .then(d => setRemindersDue(d.due || []))
      .catch(() => {});
  }, [token]);

  // Fetch real stats from backend
  useEffect(() => {
    if (!token || !isAdminToken) return;

    adminFetch(`${BASE_URL}/admin/stats`)
      .then((r) => r.json())
      .then((data) => setLiveStats(data))
      .catch((e) => { if (e?.message !== '401') console.error('stats fetch:', e); });

    adminFetch(`${BASE_URL}/vendor-applications`)
      .then((r) => r.json())
      .then((data) => setVendorApplications(data.applications || []))
      .catch((e) => { if (e?.message !== '401') console.error('vendor-apps fetch:', e); });

    adminFetch(`${BASE_URL}/admin/event-plans`)
      .then((r) => r.json())
      .then((data) => { setEventPlans(data.plans || []); setLoadingPlans(false); })
      .catch((e) => { setLoadingPlans(false); if (e?.message !== '401') console.error('event-plans fetch:', e); });

    adminFetch(`${BASE_URL}/admin/chat-requests`)
      .then((r) => r.json())
      .then((data) => {
        const all = data.conversations || [];
        // Show ALL vendor chat requests — admin must see every request regardless of event date
        setChatRequests(all.filter(c => !c.chatRejected));
      })
      .catch((e) => { if (e?.message !== '401') console.error('chat-requests fetch:', e); });

    adminFetch(`${BASE_URL}/admin/vendor-stats`)
      .then((r) => r.json())
      .then((data) => setVendorStats(data.vendors || []))
      .catch((e) => { if (e?.message !== '401') console.error('vendor-stats fetch:', e); });

    adminFetch(`${BASE_URL}/admin/top-vendors`)
      .then((r) => r.json())
      .then((data) => setTopVendorsReal(data.topVendors || []))
      .catch((e) => { if (e?.message !== '401') console.error('top-vendors fetch:', e); });

    adminFetch(`${BASE_URL}/admin/payments/stats`)
      .then((r) => r.json())
      .then((data) => setPaymentStats(data))
      .catch((e) => { if (e?.message !== '401') console.error('payments/stats fetch:', e); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch gift hamper orders when tab is active
  useEffect(() => {
    if (activeDropdown !== 'gifthampers' || !token || !isAdminToken) return;
    setGhLoading(true);
    adminFetch(`${BASE_URL}/admin/gift-hamper-orders`)
      .then(r => r.json())
      .then(d => setGhOrders(d.orders || []))
      .catch((e) => { if (e?.message !== '401') console.error('gift-hampers fetch:', e); })
      .finally(() => setGhLoading(false));
    // Also fetch sample photos
    fetch(`${BASE_URL}/admin/gift-hamper-samples`)
      .then(r => r.json())
      .then(d => setGhSamples(d.samples || []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdown, token]);

  // Fetch payments when Payments tab is active
  useEffect(() => {
    if (activeDropdown !== 'payments' || !token || !isAdminToken) return;
    setLoadingPayments(true);
    adminFetch(`${BASE_URL}/admin/payments`)
      .then((r) => r.json())
      .then((data) => setPaymentsList(data.payments || []))
      .catch((e) => { if (e?.message !== '401') console.error('payments fetch:', e); })
      .finally(() => setLoadingPayments(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdown, token]);

  // Fetch users when Users tab is active
  useEffect(() => {
    if (activeDropdown !== 'users' || !token || !isAdminToken) return;
    setLoadingUsers(true);
    adminFetch(`${BASE_URL}/admin/users`)
      .then((r) => r.json())
      .then((d) => setUserList(d.users || []))
      .catch((e) => { if (e?.message !== '401') console.error('users fetch:', e); })
      .finally(() => setLoadingUsers(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdown, token]);

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Delete this user permanently? This removes them from the database and they will need to sign up again.')) return;
    fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => {
        if (!r.ok) throw new Error('Delete failed');
        return r.json();
      })
      .then(() => {
        setUserList((prev) => prev.filter((u) => u._id !== userId));
        setLiveStats((prev) => prev ? { ...prev, users: { total: (prev.users?.total ?? 1) - 1 } } : prev);
      })
      .catch(() => {
        window.alert('Failed to delete user. Please try again or check the backend.');
      });
  };

  const loadConversation = async (id) => {
    const convo = await getConversationMessages(id);
    setCurrentConversation(convo || []);
    setAdminMsgInput("");
    if (adminSocketRef.current) {
      adminSocketRef.current.emit('join_conversation', { conversationId: id });
    }
  };

  // Fetch launch status once on mount
  useEffect(() => {
    fetch(`${BASE_URL}/launch-status`)
      .then(r => r.json())
      .then(d => setSiteIsLive(!!d.isLive))
      .catch(() => setSiteIsLive(false));
  }, []);

  const handleLaunch = async () => {
    setLaunchLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/launch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSiteIsLive(true);
        // Open fullscreen launch sequence in a new tab
        window.open("/launch-live", "_blank");
      } else {
        alert(`Launch failed: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      alert(`Launch error: ${err.message}`);
    }
    setLaunchLoading(false);
  };

  const handleRevertLaunch = async () => {
    if (!window.confirm("Take tendr.co.in back to Coming Soon?")) return;
    setLaunchLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/revert-launch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSiteIsLive(false);
      } else {
        alert(`Revert failed: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      alert(`Revert error: ${err.message}`);
    }
    setLaunchLoading(false);
  };

  // Keep selectedChatRef in sync so socket handlers can read current value
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  // Poll chat requests every 30s — catches new requests that arrive while socket is
  // already connected (socket events can be missed; poll is the reliable fallback)
  useEffect(() => {
    if (!token || !isAdminToken) return;
    const poll = () => {
      fetch(`${BASE_URL}/admin/chat-requests`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (!data) return; const all = data.conversations || []; setChatRequests(all.filter(c => !c.chatRejected)); })
        .catch(() => {});
    };
    poll(); // fire immediately on mount — don't wait 30s for first data
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [token, isAdminToken]);

  // Re-fetch chat requests whenever the Chat Requests tab is clicked
  useEffect(() => {
    if (activeDropdown !== 'chatrequests' || !token || !isAdminToken) return;
    adminFetch(`${BASE_URL}/admin/chat-requests`)
      .then(r => r.json())
      .then(data => { const all = data.conversations || []; setChatRequests(all.filter(c => !c.chatRejected)); })
      .catch(e => { if (e?.message !== '401') console.error('chat-requests tab fetch:', e); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdown, token]);

  // Auto-fetch pinned messages for all plans when the bookings tab is active
  useEffect(() => {
    if (activeDropdown !== 'bookings' || !token || !isAdminToken || !eventPlans.length) return;
    const alreadyFetched = eventPlans.every(p => pinnedByPlan[p._id] !== undefined);
    if (alreadyFetched) return;
    adminFetch(`${BASE_URL}/admin/conversations?chatType=vendor`)
      .then(r => r.json())
      .then(data => {
        const allConvos = data.conversations || [];
        const pinnedByCust = {};
        allConvos.forEach(c => {
          const custId = (c.customerId?._id || c.customerId)?.toString();
          if (!custId) return;
          if (!pinnedByCust[custId]) pinnedByCust[custId] = [];
          (c.pinnedMessages || []).forEach(m => {
            if (m.content) pinnedByCust[custId].push({ text: m.content, vendor: c.vendorId?.name || c.vendorName || "Vendor" });
          });
        });
        setPinnedByPlan(prev => {
          const next = { ...prev };
          eventPlans.forEach(plan => {
            if (next[plan._id] !== undefined) return;
            const custId = (plan.customerId?._id || plan.customerId)?.toString();
            next[plan._id] = { loading: false, messages: pinnedByCust[custId] || [] };
          });
          return next;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdown, token, eventPlans.length]);

  // Auto-refresh messages every 10s when a chat is selected
  useEffect(() => {
    if (!selectedChat?._id) return;
    const interval = setInterval(async () => {
      const convo = await getConversationMessages(selectedChat._id).catch(() => null);
      if (convo) setCurrentConversation(convo);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedChat?._id]);

  // Real-time socket connection for admin — send/receive messages + chat requests
  useEffect(() => {
    if (!token || !isAdminToken) return;
    const socket = io(BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    adminSocketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin socket connected:', socket.id);
      // Re-fetch chat requests on reconnect so backend restarts don't cause missed requests
      fetch(`${BASE_URL}/admin/chat-requests`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return; // don't wipe list on auth/server error
          const all = data.conversations || [];
          setChatRequests(all.filter(c => !c.chatRejected));
        })
        .catch(() => {});
    });
    socket.on('connect_error', (e) => console.error('Admin socket error:', e.message));

    socket.on('new_chat_request', (req) => {
      setChatRequests((prev) => {
        const exists = prev.find((r) => r._id === req._id);
        if (exists) return prev;
        return [req, ...prev];
      });
    });

    // Receive new messages in real-time — only for the currently selected chat
    // Use selectedChatRef to avoid stale closure (socket effect only runs on token change)
    socket.on('new_message', (msg) => {
      if (msg.sender === 'customer-care') return;
      const cid = selectedChatRef.current?._id?.toString();
      if (!cid || msg.conversationId?.toString() !== cid) return;
      setCurrentConversation((prev) => [...(prev || []), msg]);
    });

    return () => { socket.disconnect(); adminSocketRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [pricingAmount, setPricingAmount] = useState("");
  const [pricingVendorName, setPricingVendorName] = useState("");
  const [categoryBudgets, setCategoryBudgetsState] = useState({}); // { [category]: amountString }
  const [savingCategoryBudgets, setSavingCategoryBudgets] = useState(false);

  // Sync pinned messages + pricing from selectedChat when chat changes
  useEffect(() => {
    if (!selectedChat?._id) { setPinnedMsgs([]); setPricingAmount(""); setPricingVendorName(""); setCategoryBudgetsState({}); return; }
    const existing = (selectedChat.pinnedMessages || []).map(m => ({
      content: m.content,
      conversationId: selectedChat._id,
    }));
    setPinnedMsgs(existing);
    // Pre-fill pricing if already set
    if (selectedChat.vendorPrice?.amount) {
      setPricingAmount(String(selectedChat.vendorPrice.amount));
      setPricingVendorName(selectedChat.vendorPrice.vendorName || "");
    } else {
      setPricingAmount("");
      setPricingVendorName(selectedChat.vendorName || selectedChat.vendorId?.name || "");
    }
    // Pre-fill per-category budgets for Smart Plan chats — from previously saved
    // categoryBudgets if set, else from the original vendorSlots estimate
    if (selectedChat.serviceType === "SmartPlan") {
      let slots = [];
      try { slots = JSON.parse(selectedChat.eventDetails?.vendorSlots || "[]"); } catch {}
      const saved = selectedChat.eventDetails?.categoryBudgets;
      const init = {};
      if (Array.isArray(saved) && saved.length) {
        saved.forEach(b => { init[b.category] = String(b.amount); });
      } else {
        slots.forEach(s => { init[s.category] = String(s.estimatedCost || ""); });
      }
      setCategoryBudgetsState(init);
    } else {
      setCategoryBudgetsState({});
    }
  }, [selectedChat?._id]);

  const saveCategoryBudgets = () => {
    if (!selectedChat?._id) return;
    const categoryBudgetsArr = Object.entries(categoryBudgets)
      .filter(([, amt]) => amt && Number(amt) > 0)
      .map(([category, amt]) => ({ category, amount: Number(amt) }));
    if (categoryBudgetsArr.length === 0) return;
    setSavingCategoryBudgets(true);
    fetch(`${BASE_URL}/admin/conversations/${selectedChat._id}/category-budgets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ categoryBudgets: categoryBudgetsArr }),
    }).finally(() => setSavingCategoryBudgets(false));
  };

  // Pin a user message during chat
  const pinMessage = (content) => {
    if (!selectedChat?._id || !content?.trim()) return;
    const cid = selectedChat._id;
    setPinnedMsgs(prev => {
      if (prev.find(m => m.content === content && m.conversationId === cid)) return prev;
      return [...prev, { content, conversationId: cid }];
    });
    fetch(`${BASE_URL}/admin/conversations/${cid}/pin-message`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ content }),
    }).catch(() => {});
  };

  const unpinMessage = (content) => {
    if (!selectedChat?._id) return;
    const cid = selectedChat._id;
    // Update local state immediately
    setPinnedMsgs(prev => prev.filter(m => !(m.content === content && m.conversationId === cid)));
    // Call backend — unpin by content
    fetch(`${BASE_URL}/admin/conversations/${cid}/unpin-message`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ content }),
    }).catch(() => {});
  };

  const currentPinned = pinnedMsgs.filter(m => m.conversationId === selectedChat?._id);

  const buildSummaryDraft = () => {
    const chat = selectedChat;
    if (!chat) return "";
    const name = chat.customerId?.name || "Customer";
    const ed   = chat.eventDetails   || {};

    // Merge conversation eventDetails with matching EventPlan for full data
    const plan = eventPlans.find(p =>
      p.customerId?._id?.toString() === chat.customerId?._id?.toString()
    );
    const eventType = ed.eventType || plan?.eventType;
    const date      = ed.date      || plan?.date;
    const location  = ed.location  || plan?.location;
    const guests    = ed.guests    || plan?.guests;
    const budget    = ed.budget    || plan?.budget;

    const pinned = currentPinned;
    const lines = [
      `Hi ${name}! 👋`,
      ``,
      `Here is your *Tendr Event Summary* 📋`,
      ``,
      `*Event Details*`,
      eventType && `  • Type: ${eventType}`,
      date      && `  • Date: ${date}`,
      location  && `  • Location: ${location}`,
      guests    && `  • Guests: ${guests}`,
      budget    && `  • Budget: ${budget}`,
      ``,
      `*Requirements & Confirmations* ✅`,
      ...(pinned.length ? pinned.map(m => `  • ${m.content}`) : [`  • (No items pinned yet)`]),
      ``,
      `*Next Step:* Please proceed to review and complete your payment to confirm the booking.`,
      ``,
      `For any questions, feel free to reach out on WhatsApp.`,
      ``,
      `— Team Tendr 🌟`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  const openSummaryModal = () => {
    setSummaryDraft(buildSummaryDraft());
    setShowSummaryModal(true);
  };

  const saveSummary = (text) => {
    const summary = text !== undefined ? text : summaryDraft;
    if (!selectedChat?._id || !summary) return;
    fetch(`${BASE_URL}/admin/conversations/${selectedChat._id}/summary`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ bookingSummary: summary }),
    }).catch(() => {});
  };

  // "Done" — saves summary + pricing to Conversation and EventPlan
  const handleSummaryDone = () => {
    const text = buildSummaryDraft();
    saveSummary(text);

    // Save pricing to the conversation
    const amt = Number(pricingAmount);
    if (amt > 0 && selectedChat?._id) {
      fetch(`${BASE_URL}/admin/conversations/${selectedChat._id}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({
          amount: amt,
          vendorName: pricingVendorName || selectedChat.vendorName || selectedChat.vendorId?.name || "",
          service: selectedChat.serviceType || "",
        }),
      }).catch(() => {});
    }

    // Also save to the matching EventPlan so admin Bookings can show it
    const plan = eventPlans.find(p =>
      p.customerId?._id?.toString() === selectedChat?.customerId?._id?.toString()
    );
    if (plan?._id) {
      fetch(`${BASE_URL}/admin/event-plans/${plan._id}/summary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ bookingSummary: text }),
      })
        .then(() => setEventPlans(prev => prev.map(p2 =>
          p2._id === plan._id ? { ...p2, bookingSummary: text, bookingSummaryAt: new Date().toISOString() } : p2
        )))
        .catch(() => {});
    }

    setSummaryDraft(text);
  };

  const summaryWhatsAppUrl = () => {
    const phone = (selectedChat?.customerId?.phoneNumber || '').replace(/[^0-9]/g, '');
    if (!phone) return null;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(summaryDraft)}`;
  };

  if (!token || !user) return null;
  if (!user.isAdmin) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", background: "#F8F4EF" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#C47A2E" }}>Access Denied</p>
        <p style={{ color: "#9B7450", marginBottom: 20 }}>You don't have admin permissions.</p>
        <button onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Go to Login</button>
      </div>
    </div>
  );

  return (
    <>
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <div className="navbar bg-white border-b-2 border-[#CCAB4A]">
        <Dashboards_Nav />
      </div>

      {/* Main content below navbar */}
      <div className="mainbody w-full flex flex-1">
        <div
          className="h-full flex"
          style={{
            width: sidebarOpen ? "30%" : "4rem",
            transition: "width 0.3s ease",
          }}
        >
          {/* Sidebar */}
          <div
            className="bg-[#fff4d4] h-full flex flex-col items-center py-8 relative"
            style={{
              width: sidebarOpen ? "100%" : "4rem",
              padding: sidebarOpen ? "2rem 0.5rem" : "1rem 0.25rem",
              transition: "all 0.3s ease",
            }}
          >
            {/* Sidebar Options */}
            {sidebarOpen && (
              <div className="options flex flex-col items-center w-full">
                <div className="flex flex-col gap-3 w-[220px] items-center">
                  {sidebar_arr.map((item) => {
                    const key = item.key.toLowerCase();
                    const isActive = activeDropdown === key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSelectedChat(null);
                          setactiveDropdown(key);
                        }}
                        className={`group cursor-pointer rounded-[16px] pl-2 sm:pl-4 pr-2 flex items-center justify-between font-bold w-[80px] sm:w-[100px] md:w-[140px] lg:w-[180px] xl:w-[250px] h-[40px] transform transition-transform duration-500 ease-in-out hover:scale-105 hover:-translate-y-1 active:scale-95 ${
                          isActive
                            ? "bg-[#CCAB4A] text-white"
                            : "bg-white text-[#CCAB4A] hover:bg-[#CCAB4A] hover:text-white"
                        }`}
                      >
                        <span className="pb-[2px] text-base hidden lg:block">
                          {item.label}
                        </span>
                        <span className="pb-[2px] text-base block lg:hidden">
                          {item.icon}
                        </span>
                        <span
                          className={`arrowButton w-[30px] h-[30px] rounded-[13px] flex items-center justify-center transition duration-500 ${
                            isActive
                              ? "bg-white text-[#CCAB4A]"
                              : "bg-[#CCAB4A] text-white group-hover:bg-white group-hover:text-[#CCAB4A]"
                          }`}
                        >
                          <EastIcon fontSize="medium" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Buttons */}
            {sidebarOpen ? (
              <div className="mt-auto flex flex-col gap-1 sm:gap-2 w-full items-center px-2">
                {/* Go Back */}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-10 sm:w-28 md:w-32 lg:w-40 flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-black bg-white hover:shadow-md hover:bg-gray-50 transition-all duration-300 rounded-full"
                  title="Go Back"
                >
                  <span className="font-semibold hidden sm:inline">
                    Go Back
                  </span>
                  <span className="sm:hidden text-lg">←</span>
                </button>

                {/* Hide */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 sm:w-28 md:w-32 lg:w-40 flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-black bg-white hover:shadow-md hover:bg-gray-50 transition-all duration-300 rounded-full"
                  title="Hide Sidebar"
                >
                  <KeyboardArrowLeftIcon
                    fontSize="small"
                    className="hidden sm:block"
                  />
                  <span className="font-semibold hidden sm:inline">Hide</span>
                  {/* <span className="sm:hidden text-lg">✕</span> */}
                </button>
              </div>
            ) : (
              // Collapsed Hamburger
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto flex justify-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 sm:p-3 rounded-lg hover:bg-[#ffdc73] transition-colors duration-300"
                  title="Show Sidebar"
                >
                  <MenuIcon className="text-[#CCAB4A] text-lg sm:text-2xl" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── CHAT REQUESTS TAB ── */}
        {activeDropdown === "chatrequests" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
                Chat Requests
              </div>
              <button
                onClick={() => adminFetch(`${BASE_URL}/admin/chat-requests`).then(r => r.json()).then(data => { const all = data.conversations || []; setChatRequests(all.filter(c => !c.chatRejected)); }).catch(() => {})}
                style={{ background: '#CCAB4A', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                Refresh
              </button>
            </div>

            {chatRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-lg">No chat requests yet.</div>
            ) : (
              <div className="adm-section">
                <div className="adm-section-header">
                  <span className="adm-section-title">Chat Requests</span>
                  <span className="adm-section-count">{chatRequests.length}</span>
                </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {chatRequests.map((req) => (
                  <div key={req._id} style={{ background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A", padding: "20px 24px", boxShadow: "0 2px 12px rgba(139,69,19,0.07)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#2C1A0E" }}>{req.customerName || req.customerId?.name || "Customer"}</span>
                          <span style={{ fontSize: 12, color: "#9B7450" }}>wants to chat with</span>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#C47A2E" }}>{req.vendorName || req.vendorId?.name || "Vendor"}</span>
                          <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "#eff6ff", color: "#0369a1", border: "1px solid #bfdbfe", fontWeight: 600 }}>{req.serviceType}</span>
                          <Badge status={req.chatApproved ? "approved" : req.chatRejected ? "rejected" : "pending"} />
                          {isClosed(req) && <Badge status="closed">🔒 Auto-closed</Badge>}
                          {/* Expiry countdown */}
                          {(() => { const h = hoursLeft(req); return h !== null && h <= 6 ? (
                            <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: h <= 2 ? "#fff5f5" : "#fffbeb", color: h <= 2 ? "#c0392b" : "#b45309", border: `1px solid ${h <= 2 ? "#fca5a5" : "#fde68a"}`, fontWeight: 600 }}>
                              ⏳ {h === 0 ? "Expiring now" : `Expires in ${h}h`}
                            </span>
                          ) : null; })()}
                        </div>

                        {req.eventDetails && Object.values(req.eventDetails).some(Boolean) && (() => {
                          // Friendly labels for all possible eventDetails keys (form + bot answers)
                          const labels = {
                            eventName:"Event", eventType:"Type", date:"Date", time:"Time",
                            location:"City", guests:"Guests", budget:"Budget",
                            decorationType:"Decoration", venueType:"Venue Type",
                            cateringType:"Catering", foodPreference:"Food",
                            photographyType:"Coverage", albumRequired:"Album",
                            coverage:"Hours", musicVibe:"Music", djHours:"DJ Hours",
                            soundSetup:"Sound", servicesNeeded:"Services",
                            timeline:"Timeline", venueAddress:"Address", queryType:"Query",
                            message:"Message",
                          };
                          const entries = Object.entries(req.eventDetails).filter(([,v]) => v);
                          return (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                              {entries.map(([key, val]) => (
                                <span key={key} style={{ fontSize: 12, background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 10px", color: "#5a3a1a" }}>
                                  <b style={{ color: "#C47A2E" }}>{labels[key] || key}:</b> {val}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                        <div style={{ fontSize: 12, color: "#9B7450", marginTop: 8 }}>
                          Requested: {new Date(req.createdAt).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        {!req.chatApproved && !req.chatRejected && (
                          <>
                            <button
                              onClick={() => {
                                fetch(`${BASE_URL}/admin/chat-requests/${req._id}/approve`, {
                                  method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
                                })
                                  .then((r) => { if (r.ok) setChatRequests((prev) => prev.map((r2) => r2._id === req._id ? { ...r2, chatApproved: true, chatRejected: false } : r2)); })
                                  .catch(() => {});
                              }}
                              style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => {
                                fetch(`${BASE_URL}/admin/chat-requests/${req._id}/reject`, {
                                  method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
                                })
                                  .then((r) => { if (r.ok) setChatRequests((prev) => prev.map((r2) => r2._id === req._id ? { ...r2, chatRejected: true, chatApproved: false } : r2)); })
                                  .catch(() => {});
                              }}
                              style={{ padding: "7px 18px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {req.chatApproved && req.customerId?.phoneNumber && (
                          <a
                            href={`https://wa.me/91${req.customerId.phoneNumber}?text=${encodeURIComponent(`Hi ${req.customerName || "there"}! Your chat request with ${req.vendorName || "the vendor"} on Tendr has been accepted. You can now start chatting. — Team Tendr`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding: "7px 16px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                          >
                            📱 Notify on WhatsApp
                          </a>
                        )}
                        {req.chatRejected && (
                          <button
                            onClick={() => {
                              fetch(`${BASE_URL}/admin/chat-requests/${req._id}/notify-rejected`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                credentials: "include",
                              })
                                .then(r => r.json())
                                .then(d => alert(d.error ? `Error: ${d.error}` : "✅ Re-notification sent"))
                                .catch(() => alert("Failed to send notification"));
                            }}
                            style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #CCAB4A", background: "#fffbeb", color: "#b45309", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}
                          >
                            📲 Re-send Notification
                          </button>
                        )}
                        {/* Delete — available for all request states */}
                        <button
                          onClick={() => {
                            if (!window.confirm("Permanently delete this chat request and all its messages from the database?")) return;
                            fetch(`${BASE_URL}/admin/conversations/${req._id}`, {
                              method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
                            })
                              .then(async r => {
                                if (r.ok) {
                                  setChatRequests(prev => prev.filter(r2 => r2._id !== req._id));
                                } else {
                                  const data = await r.json().catch(() => ({}));
                                  window.alert(`Delete failed: ${data.error || r.statusText}`);
                                }
                              })
                              .catch(() => window.alert("Network error — request not deleted."));
                          }}
                          style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            )}
          </div>
        )}

        {activeDropdown === "dashboard" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            {/* Heading */}
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Dashboard
            </div>

            {/* Info Cards Upper */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Users Count",            value: liveStats?.users?.total ?? "—",                 icon: stats_dashboard[0].icon },
                  { label: "Vendor Count",           value: liveStats?.vendors?.total ?? "—",               icon: stats_dashboard[1].icon },
                  { label: "Total Payments",         value: paymentStats?.total ?? "—",                     icon: <BadgeIndianRupee size={32} className="text-[#d08f4e]" /> },
                  { label: "Total Revenue",          value: paymentStats?.totalRevenue != null ? `₹${Number(paymentStats.totalRevenue).toLocaleString("en-IN")}` : "—", icon: <IndianRupee size={32} className="text-[#d08f4e]" /> },
                  { label: "Registered Vendors",     value: liveStats?.applications?.registered ?? "—",     icon: stats_dashboard[2].icon },
                  { label: "Pending Applications",   value: liveStats?.applications?.pending ?? "—",         icon: stats_dashboard[3].icon },
                  { label: "Payments This Month",    value: paymentStats?.thisMonth ?? "—",                  icon: <CalendarCheck2 size={32} className="text-[#d08f4e]" /> },
                  { label: "Revenue This Month",     value: paymentStats?.monthRevenue != null ? `₹${Number(paymentStats.monthRevenue).toLocaleString("en-IN")}` : "—", icon: <CalendarClock size={32} className="text-[#d08f4e]" /> },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="min-h-[160px] sm:min-h-[180px] w-full px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-between py-4 sm:py-5 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="icon text-[#d08f4e]">{item.icon}</div>
                    <div className="content flex flex-col items-center gap-2 w-full min-w-0">
                      <div className="heading font-semibold text-sm sm:text-base text-gray-500 leading-tight text-center">
                        {item.label}
                      </div>
                      <div
                        className="metric font-bold text-[#CCAB4A] leading-tight text-center w-full"
                        style={{
                          fontSize: String(item.value).length > 7
                            ? 'clamp(1.25rem, 3.5vw, 2rem)'
                            : String(item.value).length > 4
                            ? 'clamp(1.75rem, 4vw, 3rem)'
                            : 'clamp(2.5rem, 6vw, 4.5rem)',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Reminders Due Today */}
            {remindersDue.length > 0 && (
              <div style={{ background: "#fff", border: "2px solid #CCAB4A", borderRadius: 16, padding: "18px 22px", marginBottom: 24, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>📲</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E" }}>WhatsApp Reminders Due Today</div>
                    <div style={{ fontSize: 12, color: "#9B7450" }}>{remindersDue.length} customer{remindersDue.length > 1 ? "s" : ""} to message today</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {remindersDue.map(r => (
                    <div key={r.eventId} style={{ background: "#FFFCF5", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{r.name}</div>
                          <div style={{ fontSize: 12, color: "#9B7450" }}>
                            📞 {r.phone} &nbsp;·&nbsp; {r.occasion} on {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 100,
                          background: r.daysAway <= 7 ? "#fef2f2" : "#fffbeb",
                          color: r.daysAway <= 7 ? "#dc2626" : "#b45309",
                          border: `1px solid ${r.daysAway <= 7 ? "#fca5a5" : "#fde68a"}` }}>
                          {r.reminderDay}-day reminder · {r.daysAway} days away
                        </span>
                      </div>
                      <div style={{ background: "rgba(196,122,46,0.05)", border: "1px solid rgba(196,122,46,0.15)", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: "#2C1A0E", lineHeight: 1.6, marginBottom: 10 }}>
                        {r.message}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(r.message);
                            setCopiedMsg(prev => ({ ...prev, [r.eventId]: true }));
                            setTimeout(() => setCopiedMsg(prev => ({ ...prev, [r.eventId]: false })), 2000);
                          }}
                          style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          {copiedMsg[r.eventId] ? "✓ Copied!" : "📋 Copy Message"}
                        </button>
                        <a href={`https://wa.me/91${r.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                          style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
                          Open WhatsApp
                        </a>
                        <button
                          disabled={markingSent[r.eventId]}
                          onClick={async () => {
                            setMarkingSent(prev => ({ ...prev, [r.eventId]: true }));
                            await adminFetch(`${BASE_URL}/planned-events/${r.eventId}/mark-sent`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ reminderDay: r.reminderDay }),
                            }).catch(() => {});
                            setRemindersDue(prev => prev.filter(x => x.eventId !== r.eventId));
                            setMarkingSent(prev => ({ ...prev, [r.eventId]: false }));
                          }}
                          style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#15803d", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: markingSent[r.eventId] ? 0.6 : 1 }}>
                          {markingSent[r.eventId] ? "Saving…" : "✓ Mark Sent"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Cards Lower */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10 mt-4 sm:mt-8">
              {/* New Users and Vendors per month */}
              <div className="max-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full px-4 sm:px-6 py-4 sm:py-5 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-start hover:shadow-md transition-shadow">
                <div className="heading font-semibold text-lg sm:text-xl md:text-2xl text-black mb-2 sm:mb-4">
                  New Users and Vendors per month
                </div>
                <div className="flex-1 flex items-center justify-center max-h-[250px]">
                  <LineChart_UserVendorGrowth_AdminDashboard />
                </div>
              </div>

              {/* New Bookings per month */}
              <div className="max-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full px-4 sm:px-6 py-4 sm:py-5 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-start hover:shadow-md transition-shadow">
                <div className="heading font-semibold text-lg sm:text-xl md:text-2xl text-black mb-2 sm:mb-4">
                  New Bookings per month
                </div>
                <div className="flex-1 flex items-center justify-center max-h-[250px] text-gray-400">
                  <LineChart_BookingsPerMonth_AdminDashboard />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDropdown === "bookings" && (() => {
          const BOOKING_TABS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];
          const BOOKING_STATUS = { Upcoming: ["in_progress"], Ongoing: ["submitted", "draft"], Completed: ["completed"], Cancelled: ["cancelled"] };
          const pendingChanges = eventPlans.filter(p => p.status === "in_progress" && p.changeRequest?.hasRequest && p.changeRequest?.status === "pending").length;

          const buildWhatsAppSummary = (plan) => {
            const name  = plan.customerId?.name || "there";
            const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
            if (!phone) return null;
            const services = (plan.selectedServices || []).map(s => `  • ${s}`).join("\n") || "  • Not specified";
            const typeLabel = plan.bookingType === "you-do-it" ? "You Do It" : "Let Us Do It";
            const msg = [
              `Hi ${name}! 👋`,
              ``,
              `Here is your *Tendr Booking Summary* 🎉`,
              ``,
              `*📋 Event Details*`,
              `  • Type: ${plan.eventType || "—"}`,
              `  • Date: ${plan.date || "—"}`,
              `  • Location: ${plan.location || "—"}`,
              `  • Guests: ${plan.guests || "—"}`,
              `  • Budget: ${plan.budget || "—"}`,
              ``,
              `*✅ Services Selected*`,
              services,
              ``,
              `*🎯 Booking Type:* ${typeLabel}`,
              ``,
              `To confirm your booking, please complete the payment at your earliest convenience. Our team will follow up with final pricing from each vendor shortly.`,
              ``,
              `For any queries, feel free to reach out to us on WhatsApp.`,
              ``,
              `— Team Tendr 🌟`,
            ].join("\n");
            return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
          };
          const buildEventDetailsWhatsApp = (plan) => {
            const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
            if (!phone) return null;
            const msg = `Your payment is completed and event is booked. Move to your dashboard and download the timeline, event details, invitation flyer and invoice. Do share stories on social media with Tendr tagged. — Team Tendr`;
            return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
          };

          const notifyEventDetailsWhatsApp = async (plan, downloadOnly = false) => {
            // 1. Fetch pinned messages for this customer's conversations
            let pinnedByKey = {};
            try {
              const custId = (plan.customerId?._id || plan.customerId)?.toString();
              const r = await fetch(`${BASE_URL}/conversations?customerId=${custId}`, {
                headers: { Authorization: `Bearer ${token}` }, credentials: "include",
              });
              const data = await r.json();
              const convList = (data.conversations || []).filter(c => c.chatType === "vendor");
              await Promise.allSettled(convList.map(async c => {
                const vid = (c.vendorId?._id || c.vendorId)?.toString();
                if (!vid) return;
                try {
                  const r2 = await fetch(`${BASE_URL}/conversations/${c._id}`, {
                    headers: { Authorization: `Bearer ${token}` }, credentials: "include",
                  });
                  const full = await r2.json();
                  const msgs = full.pinnedMessages || full.conversation?.pinnedMessages || [];
                  const vName = c.vendorId?.name || c.vendorName || vid;
                  pinnedByKey[vid] = msgs.map(m => typeof m === "string" ? m : m.content || m.text || "").filter(Boolean);
                  pinnedByKey[vName] = pinnedByKey[vid];
                } catch {}
              }));
            } catch {}

            // 2. Generate and download event details PDF
            const confirmedVendors = (plan.selectedServices || []).map(s => ({ name: s, serviceType: s, _id: s }));
            await generateEventDetailsPDF({
              eventSummary: {
                eventType: plan.eventType,
                date: plan.date,
                location: plan.location,
                guests: plan.guests,
              },
              confirmedVendors,
              pinnedMessages: pinnedByKey,
              userName: plan.customerId?.name,
              orderId: plan._id,
            });

            // 3. Open WhatsApp with event details text (unless downloadOnly)
            if (!downloadOnly) {
              const url = buildEventDetailsWhatsApp(plan);
              if (url) window.open(url, "_blank");
            }
          };

          const filteredPlans = bookingTab === "All" ? eventPlans : eventPlans.filter((p) => (BOOKING_STATUS[bookingTab] || []).includes(p.status));
          const statusBadgeStyle = (s) => ({
            submitted:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a",  label: "In Process" },
            draft:       { bg: "#fffbeb", color: "#b45309", border: "#fde68a",  label: "In Process" },
            in_progress: { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe",  label: "Submitted"  },
            completed:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0",  label: "Completed"  },
            cancelled:   { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5",  label: "Cancelled"  },
          }[s] || { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: s || "—" });
          return (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Bookings
            </div>

            {/* Tabs */}
            <div className="adm-tab-row" style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {BOOKING_TABS.map((tab) => {
                const count = tab === "All" ? eventPlans.length : eventPlans.filter((p) => (BOOKING_STATUS[tab] || []).includes(p.status)).length;
                return (
                  <button key={tab} onClick={() => setBookingTab(tab)}
                    style={{ position: "relative", padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer", border: "1.5px solid", transition: "all 0.18s",
                      borderColor: bookingTab === tab ? "#C47A2E" : "rgba(139,69,19,0.2)",
                      background: bookingTab === tab ? "#C47A2E" : "#fff",
                      color: bookingTab === tab ? "#fff" : "#6B3A1F",
                    }}>
                    {tab} <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 700, background: bookingTab === tab ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: bookingTab === tab ? "#fff" : "#C47A2E", borderRadius: 100, padding: "1px 7px" }}>{count}</span>
                    {tab === "Upcoming" && pendingChanges > 0 && (
                      <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, background: "#ef4444", color: "#fff", borderRadius: 100, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "2px solid #fff" }}>{pendingChanges}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Event Plans Table */}
            {loadingPlans ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <style>{`@keyframes adm-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(204,171,74,0.2)", padding: "14px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ flex: 2, height: 14, borderRadius: 6, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                    <div style={{ flex: 1, height: 14, borderRadius: 6, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                    <div style={{ flex: 1, height: 14, borderRadius: 6, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                    <div style={{ width: 60, height: 22, borderRadius: 100, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                  </div>
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#9B7450", background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A" }}>
                No {bookingTab !== "All" ? bookingTab.toLowerCase() : ""} event plans yet.
              </div>
            ) : (
              <div className="mb-8">
                {bookingTab === "Upcoming" && (
                  <div className="adm-section-header" style={{ marginBottom: 16 }}>
                    <span className="adm-section-title">Upcoming Bookings</span>
                    <span className="adm-section-count">{filteredPlans.length}</span>
                  </div>
                )}
                {bookingTab === "Ongoing" && (
                  <div className="adm-section-header" style={{ marginBottom: 16 }}>
                    <span className="adm-section-title">Ongoing Plans</span>
                    <span className="adm-section-count">{filteredPlans.length}</span>
                  </div>
                )}
                {bookingTab === "Cancelled" && (
                  <div className="adm-section-header" style={{ marginBottom: 16 }}>
                    <span className="adm-section-title">Cancelled Bookings</span>
                    <span className="adm-section-count">{filteredPlans.length}</span>
                  </div>
                )}
                <div className="bg-white border-2 border-[#CCAB4A] rounded-[16px] overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Outfit', sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#fffaf0", borderBottom: "1.5px solid #CCAB4A" }}>
                        {[
                          "Customer", "Event", "Type", "Date", "Guests", "Budget", "Services", "Booking Type",
                          ...(bookingTab === "Cancelled" ? ["Reason", "Actions"] : ["Actions"]),
                        ].map((h) => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#7A5535", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.map((plan, i) => {
                        return (
                          <tr key={plan._id} style={{ borderBottom: i < filteredPlans.length - 1 ? "1px solid rgba(204,171,74,0.15)" : "none", background: i % 2 === 0 ? "#fffcf5" : "#fff" }}>
                            <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#2C1A0E", whiteSpace: "nowrap" }}>{plan.customerId?.name || "—"}</td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#5a3a1a", fontWeight: 600 }}>{plan.eventName}</td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#5a3a1a" }}>{plan.eventType}</td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#5a3a1a", whiteSpace: "nowrap" }}>{plan.date}</td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#5a3a1a" }}>{plan.guests}</td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#5a3a1a", whiteSpace: "nowrap" }}>{plan.budget}</td>
                            <td style={{ padding: "10px 14px", fontSize: 12, color: "#5a3a1a", maxWidth: 160 }}>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {(plan.selectedServices || []).map((s) => (
                                  <span key={s} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 100, background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontWeight: 600 }}>{s}</span>
                                ))}
                                {!plan.selectedServices?.length && "—"}
                              </div>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: plan.bookingType === "you-do-it" ? "#eff6ff" : "#f5f3ff", color: plan.bookingType === "you-do-it" ? "#0369a1" : "#7c3aed", border: "1px solid currentColor", whiteSpace: "nowrap" }}>
                                {plan.bookingType === "you-do-it" ? "You Do It" : "Let Us Do It"}
                              </span>
                            </td>
                            {bookingTab === "Cancelled" ? (
                              <>
                                <td style={{ padding: "10px 14px", fontSize: 12, color: "#c0392b", fontStyle: "italic", maxWidth: 200 }}>
                                  {plan.cancelledReason || "—"}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  {(() => {
                                    const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
                                    if (!phone) return <span style={{ color: "#9B7450", fontSize: 12 }}>No phone</span>;
                                    const cName = plan.customerId?.name || "there";
                                    const feedbackUrl = `${window.location.origin}/feedback?planId=${plan._id}`;
                                    const msg = `Hi ${cName}! 👋\n\nWe noticed your booking on Tendr wasn't completed. We'd love to know what happened so we can do better!\n\nIt takes under 2 minutes:\n\n${feedbackUrl}\n\n— Team Tendr 💛`;
                                    return (
                                      <a href={`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
                                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
                                        💬 Send Feedback Link
                                      </a>
                                    );
                                  })()}
                                </td>
                              </>
                            ) : (
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {/* Unpaid: Event Details WA + View Pinned + Mark Payment Done */}
                                {(plan.status === "submitted" || plan.status === "draft") && (() => {
                                  const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
                                  return (
                                    <>
                                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                        {phone && (
                                          <a href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${plan.customerId?.name || "there"}! We have received your event planning request. Your payment is currently pending — our team will confirm and process your booking shortly. — Team Tendr`)}`} target="_blank" rel="noopener noreferrer"
                                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
                                            📲 Notify Customer
                                          </a>
                                        )}
                                        <button
                                          onClick={() => {
                                            fetch(`${BASE_URL}/admin/event-plans/${plan._id}/mark-payment`, {
                                              method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
                                            }).then(r => { if (r.ok) setEventPlans(prev => prev.map(p => p._id === plan._id ? { ...p, status: 'in_progress' } : p)); }).catch(() => {});
                                          }}
                                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", background: "#0369a1", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif" }}>
                                          💳 Mark Payment Done
                                        </button>
                                      </div>
                                    </>
                                  );
                                })()}
                                {/* Paid: Send to Customer (dashboard link) + Invoice */}
                                {plan.status === "in_progress" && (() => {
                                  const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
                                  const eventSummary = { eventType: plan.eventType, date: plan.date, location: plan.location, guests: plan.guests };
                                  const confirmedVendors = (plan.vendors || plan.confirmedVendors || []).map(v => ({ name: v.vendorName || v.name || "", serviceType: v.serviceType || "" })).filter(v => v.name);
                                  const name = plan.customerId?.name || "there";
                                  const dashboardLink = `${window.location.origin}/dashboard`;
                                  const sendWA = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${name}! 🎉\n\nYour event is planned!\n\nYou can download your Event Details and Invitation Flyer from your Tendr dashboard:\n\n${dashboardLink}\n\n— Team Tendr 💛`)}` : null;
                                  const sentTs = notifiedAt[plan._id];
                                  const isOverdue = sentTs && (Date.now() - sentTs) > 24 * 60 * 60 * 1000;
                                  return (
                                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                                      {sendWA && (
                                        <a href={sendWA} target="_blank" rel="noopener noreferrer"
                                          onClick={() => markNotified(plan._id)}
                                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
                                          📲 {sentTs ? "Resend" : "Send to Customer"}
                                        </a>
                                      )}
                                      {sentTs && (
                                        <span style={{ fontSize: 10, fontWeight: 600, color: isOverdue ? "#c0392b" : "#15803d", background: isOverdue ? "#fff5f5" : "#f0fdf4", border: `1px solid ${isOverdue ? "#fca5a5" : "#bbf7d0"}`, borderRadius: 100, padding: "2px 8px", whiteSpace: "nowrap" }}>
                                          {isOverdue ? `⚠️ Sent ${fmtNotifiedAge(sentTs)} — not opened?` : `✓ Sent ${fmtNotifiedAge(sentTs)}`}
                                        </span>
                                      )}
                                      <button disabled={pdfGenerating} onClick={async () => {
                                        setPdfGenerating(true);
                                        try {
                                          generateInvoicePDF({ eventSummary, confirmedVendors, amount: plan.totalAmount || plan.amount, orderId: plan.orderId, paymentId: plan.paymentId, userName: plan.customerId?.name });
                                          await new Promise(r => setTimeout(r, 400));
                                          generateInvitationPDF({ eventSummary, confirmedVendors, userName: plan.customerId?.name });
                                          await new Promise(r => setTimeout(r, 400));
                                          await generateEventDetailsPDF({ eventSummary, confirmedVendors, pinnedMessages: [], userName: plan.customerId?.name, orderId: plan.orderId });
                                          await new Promise(r => setTimeout(r, 400));
                                          await generateTimelinePDF({ slots: [], eventSummary, userName: plan.customerId?.name });
                                        } finally { setPdfGenerating(false); }
                                      }}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 11, fontWeight: 600, cursor: pdfGenerating ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif", opacity: pdfGenerating ? 0.6 : 1 }}>
                                        📦 {pdfGenerating ? "Generating…" : "Documents"}
                                      </button>
                                    </div>
                                  );
                                })()}
                                {/* Review link — personalised WA, just planId */}
                                {(() => {
                                  const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
                                  const cName = plan.customerId?.name || "there";
                                  const eType = plan.eventType || plan.eventName || "event";
                                  const eDate = plan.date ? ` on ${plan.date}` : "";
                                  const reviewUrl = `${window.location.origin}/review?planId=${plan._id}`;
                                  const vendorStr = Object.values(plan.finalisedVendors || {}).filter(v => v && typeof v === 'object' && v.name).map(v => v.name).join(", ");
                                  const msg = [
                                    `Hi ${cName}! 🌟`,
                                    ``,
                                    `Thank you for celebrating your ${eType}${eDate} with Tendr!`,
                                    ``,
                                    vendorStr ? `Your vendors were: ${vendorStr}` : null,
                                    ``,
                                    `It takes just 2 minutes to share your experience. Your review helps vendors improve and helps others plan their events:`,
                                    ``,
                                    reviewUrl,
                                    ``,
                                    `— Team Tendr 💛`,
                                  ].filter(l => l !== null).join('\n');
                                  const reviewWhatsApp = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}` : null;
                                  if (!reviewWhatsApp) return null;
                                  return (
                                    <a href={reviewWhatsApp} target="_blank" rel="noopener noreferrer"
                                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 8, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
                                      ⭐ Send Review Link
                                    </a>
                                  );
                                })()}
                                {/* Pinned messages — per-vendor dropdowns, auto-loaded when bookings tab opens */}
                                {(plan.status === "submitted" || plan.status === "draft") && (() => {
                                  const ps = pinnedByPlan[plan._id];
                                  if (!ps || ps.loading) return <span style={{ fontSize: 11, color: "#9B7450" }}>Loading pins…</span>;
                                  if (!ps.messages.length) return <span style={{ fontSize: 11, color: "#bbb" }}>No pinned msgs</span>;
                                  // Group by vendor
                                  const byVendor = {};
                                  ps.messages.forEach(m => {
                                    if (!byVendor[m.vendor]) byVendor[m.vendor] = [];
                                    byVendor[m.vendor].push(m.text);
                                  });
                                  return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 240 }}>
                                      {Object.entries(byVendor).map(([vendorName, texts]) => {
                                        const key = `${plan._id}__${vendorName}`;
                                        const isOpen = !!pinnedOpenByVendor[key];
                                        return (
                                          <div key={vendorName} style={{ borderRadius: 8, overflow: "hidden", border: "1.5px solid rgba(196,122,46,0.2)" }}>
                                            <button
                                              onClick={() => setPinnedOpenByVendor(prev => ({ ...prev, [key]: !isOpen }))}
                                              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "5px 9px", background: isOpen ? "rgba(196,122,46,0.12)" : "#fffcf5", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                                            >
                                              <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textAlign: "left" }}>📌 {vendorName} ({texts.length})</span>
                                              <span style={{ fontSize: 10, color: "#C47A2E" }}>{isOpen ? "▲" : "▼"}</span>
                                            </button>
                                            {isOpen && (
                                              <div style={{ background: "#fffbeb", padding: "5px 9px 7px", display: "flex", flexDirection: "column", gap: 3 }}>
                                                {texts.map((t, ti) => (
                                                  <div key={ti} style={{ fontSize: 11, color: "#5a3a1a", lineHeight: 1.4 }}>• {t}</div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                                {/* Change request info + resolve */}
                                {plan.status === "in_progress" && plan.changeRequest?.hasRequest && plan.changeRequest?.status === "pending" && (
                                  <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 9, padding: "8px 10px", fontSize: 12 }}>
                                    <div style={{ fontWeight: 700, color: "#c0392b", marginBottom: 4 }}>⚠️ Change Request</div>
                                    {plan.changeRequest.message && <div style={{ color: "#7A5535", marginBottom: 6, fontStyle: "italic" }}>"{plan.changeRequest.message}"</div>}
                                    <button
                                      onClick={() => {
                                        fetch(`${BASE_URL}/admin/event-plans/${plan._id}/resolve-change-request`, {
                                          method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
                                        }).then(r => { if (r.ok) setEventPlans(prev => prev.map(p => p._id === plan._id ? { ...p, changeRequest: { ...p.changeRequest, hasRequest: false, status: 'resolved' } } : p)); }).catch(() => {});
                                      }}
                                      style={{ padding: "4px 10px", borderRadius: 7, border: "none", background: "#15803d", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                      ✓ Mark Resolved
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
          );
        })()}

        {activeDropdown === "payments" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Payments
            </div>

            {/* Live stat cards */}
            <div className="py-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Payments",      value: paymentStats?.total        ?? "—", icon: <BadgeIndianRupee size={28} className="text-[#d08f4e]" /> },
                  { label: "This Month",           value: paymentStats?.thisMonth    ?? "—", icon: <CalendarCheck2  size={28} className="text-[#d08f4e]" /> },
                  { label: "Total Revenue",        value: paymentStats?.totalRevenue != null ? `₹${Number(paymentStats.totalRevenue).toLocaleString("en-IN")}` : "—", icon: <IndianRupee size={28} className="text-[#d08f4e]" /> },
                  { label: "Revenue This Month",   value: paymentStats?.monthRevenue != null ? `₹${Number(paymentStats.monthRevenue).toLocaleString("en-IN")}` : "—", icon: <CalendarClock size={28} className="text-[#d08f4e]" /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-white border-2 border-[#CCAB4A] rounded-[16px] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow overflow-hidden">
                    {icon}
                    <div className="text-gray-500 text-sm font-semibold">{label}</div>
                    <div
                      className="font-bold text-[#CCAB4A] leading-tight"
                      style={{
                        fontSize: String(value).length > 7 ? 'clamp(1.1rem, 3vw, 1.6rem)' : 'clamp(1.5rem, 3.5vw, 1.875rem)',
                        wordBreak: 'break-word',
                      }}
                    >{value}</div>
                  </div>
                ))}
              </div>

              {/* Payments table */}
              <div className="adm-section">
                <div className="adm-section-header">
                  <span className="adm-section-title">Payment Records</span>
                  <span className="adm-section-count">{paymentsList.length}</span>
                </div>
              </div>
              <div className="bg-white border-2 border-[#CCAB4A] rounded-[16px] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F1E1A8] flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-black">All Transactions</h3>
                  <span className="text-sm text-gray-500">{paymentsList.length} total</span>
                </div>
                {loadingPayments ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 0" }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(204,171,74,0.2)", padding: "14px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ flex: 2, height: 13, borderRadius: 6, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                        <div style={{ flex: 1, height: 13, borderRadius: 6, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                        <div style={{ width: 60, height: 20, borderRadius: 100, background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f2 50%,#f5ede0 75%)", backgroundSize: "200% 100%", animation: "adm-shimmer 1.4s infinite" }} />
                      </div>
                    ))}
                  </div>
                ) : paymentsList.length === 0 ? (
                  <div className="py-12 text-center">
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                    <p className="text-gray-500">No payments recorded yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Payments will appear here once customers complete checkout.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#FFF8EE]">
                        <tr>
                          {["Customer", "Event Type", "Amount", "Method", "Status", "Date"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paymentsList.map((p) => (
                          <tr key={p._id} className="hover:bg-[#FFFBEF] transition">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{p.customer?.name || "—"}</div>
                              <div className="text-xs text-gray-400">{p.customer?.phoneNumber || p.customer?.email || ""}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{p.eventType || p.type || "—"}</td>
                            <td className="px-4 py-3 font-bold text-[#C47A2E]">₹{Number(p.amount || 0).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3 text-gray-500 capitalize">{(p.method || "razorpay").toLowerCase()}</td>
                            <td className="px-4 py-3">
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                {p.status || "SUCCESS"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {p.date ? new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Change Requests Tab ── */}
        {activeDropdown === "changerequests" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl text-[#d08f4e] my-4">
              Change Requests
            </div>
            {(() => {
              const pending = eventPlans.filter(p => p.changeRequest?.hasRequest && p.changeRequest?.status === "pending");
              if (!pending.length) return (
                <div style={{ textAlign: "center", padding: "56px 24px", background: "#fff", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: "#2C1A0E", margin: "0 0 8px" }}>No pending change requests</h4>
                  <p style={{ fontSize: 14, color: "#9B7450" }}>All confirmed bookings are up to date.</p>
                </div>
              );
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {pending.map(plan => (
                    <div key={plan._id} style={{ background: "#fff", borderRadius: 16, border: "2px solid #fde68a", boxShadow: "0 3px 14px rgba(139,69,19,0.06)", padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E" }}>{plan.eventName || plan.eventType}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>⚠️ Pending Change</span>
                          </div>
                          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#7A5535", flexWrap: "wrap" }}>
                            <span>👤 {plan.customerId?.name || "Customer"}</span>
                            {plan.date && <span>📅 {plan.date}</span>}
                            {plan.location && <span>📍 {plan.location}</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#bbb" }}>{plan.changeRequest?.requestedAt ? new Date(plan.changeRequest.requestedAt).toLocaleDateString("en-IN") : ""}</div>
                      </div>
                      {plan.changeRequest?.message && (
                        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#7A5535", fontStyle: "italic", marginBottom: 12 }}>
                          "{plan.changeRequest.message}"
                        </div>
                      )}
                      <button
                        onClick={() => fetch(`${BASE_URL}/admin/event-plans/${plan._id}/resolve-change-request`, {
                          method: "PATCH",
                          headers: { Authorization: `Bearer ${token}` },
                          credentials: "include",
                        }).then(r => { if (r.ok) setEventPlans(prev => prev.map(p => p._id === plan._id ? { ...p, changeRequest: { ...p.changeRequest, status: "resolved" } } : p)); })}
                        style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                      >
                        Mark Resolved ✓
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeDropdown === "vendors" && (() => {
          const handleImport = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImporting(true); setImportResult(null);
            const fd = new FormData(); fd.append('csv', file);
            try {
              const res = await fetch(`${BASE_URL}/admin/import/vendors`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
                credentials: 'include', body: fd,
              });
              const data = await res.json();
              setImportResult(data);
            } catch (err) {
              setImportResult({ error: err.message });
            } finally { setImporting(false); e.target.value = ''; }
          };


          const openEditVendor = async (partialVendor) => {
            try {
              const res = await fetch(`${BASE_URL}/admin/vendors/${partialVendor._id}`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
              });
              const data = await res.json();
              setEditingVendor(data.data || partialVendor);
            } catch {
              setEditingVendor(partialVendor);
            }
          };

          const handleDeleteVendor = async (vendor) => {
            if (!window.confirm(
              `Delete "${vendor.name}" (${vendor.serviceType})?\n\nThis will also delete all their conversations and messages. This cannot be undone.`
            )) return;
            setDeletingVendorId(vendor._id);
            try {
              const res = await fetch(`${BASE_URL}/admin/vendors/${vendor._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
              });
              const data = await res.json();
              if (res.ok) {
                setVendorStats(prev => prev.filter(v => v._id !== vendor._id));
                if (selectedVendor?._id === vendor._id) setSelectedVendor(null);
                setSeedResult({ message: data.message });
              } else {
                setSeedResult({ error: data.error });
              }
            } catch (err) {
              setSeedResult({ error: err.message });
            } finally {
              setDeletingVendorId(null);
            }
          };

          const handleSeedNehaeventz = async () => {
            if (!window.confirm(
              'Add Nehaeventz Event Planners as 3 vendors (DJ · Caterer · Decorator)?\n\n' +
              'Phone: 9643267331  |  Password: Nehaeventz@2024\n' +
              'Address: Sec 7 Main Market, Dwarka, Delhi\n\n' +
              'Safe to run again — skips existing service types.'
            )) return;
            setSeeding(true); setSeedResult(null);
            try {
              const res = await fetch(`${BASE_URL}/admin/seed-nehaeventz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                credentials: 'include',
              });
              const data = await res.json();
              setSeedResult(data);
            } catch (err) { setSeedResult({ error: err.message }); }
            finally { setSeeding(false); }
          };


          return (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">

            {/* Add Vendor Modal */}
            {showAddVendor && (
              <AddVendorModal
                onClose={() => setShowAddVendor(false)}
                onAdded={() => setAddedVendorCount(c => c + 1)}
              />
            )}

            {/* Caterer Menu Editor */}
            {menuVendor && (
              <CatererMenuEditor vendor={menuVendor} onClose={() => setMenuVendor(null)} />
            )}

            {/* Edit Vendor Modal */}
            {editingVendor && (
              <EditVendorModal
                vendor={editingVendor}
                onClose={() => setEditingVendor(null)}
                onSaved={(data) => {
                  setSeedResult({ message: data.message });
                  setVendorStats(prev => prev.map(v =>
                    v._id === editingVendor._id ? { ...v, ...data.vendor } : v
                  ));
                  setSelectedVendor(null);
                }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 8, marginTop: 16 }}>
              <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl text-[#d08f4e]">Vendors</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* ── Add Vendor button ── */}
                <button
                  onClick={() => setShowAddVendor(true)}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 3px 10px rgba(196,122,46,0.3)", display: "flex", alignItems: "center", gap: 7 }}>
                  ➕ Add Vendor
                  {addedVendorCount > 0 && (
                    <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: 100, padding: "1px 8px", fontSize: 12, fontWeight: 800 }}>
                      {addedVendorCount} added
                    </span>
                  )}
                </button>
                <button onClick={async () => {
                  if (!window.confirm('Set realistic starting prices for all vendors missing a price?\nDJ: ₹8k-25k  |  Caterer: ₹35k-90k  |  Decorator: ₹18k-60k  |  Photographer: ₹22k-75k')) return;
                  setSeeding(true); setSeedResult(null);
                  try {
                    const r = await fetch(`${BASE_URL}/admin/set-vendor-prices`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
                    setSeedResult(await r.json());
                  } catch(e) { setSeedResult({ error: e.message }); }
                  finally { setSeeding(false); }
                }} disabled={seeding}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: seeding ? "#e5e7eb" : "linear-gradient(135deg,#b45309,#f59e0b)", color: seeding ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 600, cursor: seeding ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                  {seeding ? "Setting..." : "💰 Set Vendor Prices"}
                </button>
                <button onClick={handleSeedNehaeventz} disabled={seeding}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: seeding ? "#e5e7eb" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: seeding ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 600, cursor: seeding ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                  {seeding ? "Creating..." : "🎪 Add Nehaeventz"}
                </button>
                <a href={`${BASE_URL}/admin/import/template`} download
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "'Outfit', sans-serif" }}>
                  ⬇ Download CSV Template
                </a>
                <label style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: importing ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: importing ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 600, cursor: importing ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                  {importing ? "Importing..." : "⬆ Import from CSV"}
                  <input type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} disabled={importing} />
                </label>
              </div>
            </div>

            {/* ── Vendor sub-tabs ── */}
            <div style={{ display: "flex", gap: 6, margin: "14px 0 18px", borderBottom: "2px solid rgba(196,122,46,0.15)", paddingBottom: 14 }}>
              {[["list", "📋 All Vendors"], ["analytics", "📊 Vendor Analytics"]].map(([key, label]) => (
                <button key={key} onClick={() => setVendorSubTab(key)}
                  style={{ padding: "7px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", border: "2px solid #CCAB4A", background: vendorSubTab === key ? "#CCAB4A" : "transparent", color: vendorSubTab === key ? "#fff" : "#CCAB4A", transition: "all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {seedResult && (
              <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: seedResult.error ? "#fff5f5" : "#f0fdf4", border: `1px solid ${seedResult.error ? "#fca5a5" : "#bbf7d0"}`, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                {seedResult.error ? `❌ ${seedResult.error}` : (
                  <>✅ {seedResult.message}<br/>
                  {(seedResult.results || []).map(r => <span key={r.name} style={{ display: "block", marginLeft: 16 }}>• {r.name}: {r.status}</span>)}</>
                )}
              </div>
            )}

            {/* Import result */}
            {importResult && (
              <div style={{ background: importResult.error ? "#fff5f5" : importResult.failed > 0 ? "#fffbeb" : "#f0fdf4", border: `1px solid ${importResult.error ? "#fca5a5" : importResult.failed > 0 ? "#fde68a" : "#bbf7d0"}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
                {importResult.error ? (
                  <p style={{ color: "#c0392b", margin: 0, fontWeight: 600 }}>Error: {importResult.error}</p>
                ) : (
                  <>
                    <p style={{ color: importResult.failed > 0 ? "#b45309" : "#15803d", fontWeight: 700, margin: "0 0 8px" }}>{importResult.message}</p>
                    {importResult.errors?.length > 0 && (
                      <div>
                        <p style={{ fontSize: 12, color: "#b45309", fontWeight: 600, margin: "0 0 6px" }}>Failed rows:</p>
                        {importResult.errors.map((e, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#c0392b", marginBottom: 3 }}>Row {e.row} ({e.name}): {e.error}</div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {vendorSubTab === "list" && <>
            {/* CSV format reminder */}
            <div style={{ background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "#7A5535", fontFamily: "'Outfit', sans-serif" }}>
              <strong>How to import:</strong> Download the CSV template → fill it in Excel or Google Sheets → save as CSV → click "Import from CSV".
              Service types: DJ, Decorator, Photographer, Caterer. Cities: Delhi, Noida, Greater Noida, Ghaziabad.
            </div>

            {/* Live Vendor Stats */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Total Vendors", value: liveStats?.vendors?.total ?? "—", icon: stats_vendors[0].icon },
                  { label: "Approved Vendors", value: liveStats?.vendors?.approved ?? "—", icon: stats_vendors[6].icon },
                  { label: "Pending Approval", value: liveStats?.vendors?.pending ?? "—", icon: stats_vendors[7].icon },
                  { label: "Caterers", value: liveStats?.vendors?.caterers ?? "—", icon: stats_vendors[1].icon },
                  { label: "DJs", value: liveStats?.vendors?.djs ?? "—", icon: stats_vendors[2].icon },
                  { label: "Decorators", value: liveStats?.vendors?.decorators ?? "—", icon: stats_vendors[3].icon },
                  { label: "Photographers", value: liveStats?.vendors?.photographers ?? "—", icon: stats_vendors[4].icon },
                  { label: "Applications (Total)", value: liveStats?.applications?.total ?? "—", icon: stats_vendors[5].icon },
                ].map((item, idx) => (
                  <div key={idx} className="min-h-[160px] sm:min-h-[180px] w-full px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-between py-4 sm:py-5 hover:shadow-md transition-shadow">
                    <div className="icon text-[#d08f4e]">{item.icon}</div>
                    <div className="content flex flex-col items-center gap-2">
                      <div className="heading font-semibold text-sm sm:text-base lg:text-lg text-gray-500 leading-tight text-center">{item.label}</div>
                      <div className="metric text-4xl sm:text-5xl md:text-6xl lg:text-[75px] font-bold text-[#CCAB4A] leading-tight">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Vendor Stats */}
            {vendorStats.length > 0 && (() => {
              const filteredVendors = vendorStats.filter(v => {
                if (vendorSearch && !v.name?.toLowerCase().includes(vendorSearch.toLowerCase())) return false;
                if (vendorFilterType !== "all" && v.serviceType !== vendorFilterType) return false;
                if (vendorFilterCity !== "all" && v.city !== vendorFilterCity) return false;
                if (vendorFilterStatus !== "all" && v.status !== vendorFilterStatus) return false;
                if (vendorFilterTopRated === "yes" && !v.isTopRated) return false;
                if (vendorFilterTopRated === "no" && v.isTopRated) return false;
                if (vendorFilterCorporate === "yes" && !v.hasCorporateExperience) return false;
                if (vendorFilterCorporate === "no" && v.hasCorporateExperience) return false;
                return true;
              });
              const allCities = [...new Set(vendorStats.map(v => v.city).filter(Boolean))].sort();
              const selStyle = { padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", fontSize: 12, fontFamily: "'Outfit',sans-serif", color: "#2C1A0E", cursor: "pointer", outline: "none" };
              return (
              <div className="mb-8">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <div className="text-xl font-semibold text-black">Vendor Details ({filteredVendors.length}/{vendorStats.length})</div>
                </div>
                {/* Search + Filters */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, padding: "12px 16px", background: "#fff", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.18)" }}>
                  {/* Name search */}
                  <div style={{ display: "flex", alignItems: "center", flex: "1 1 200px", minWidth: 160, background: "rgba(196,122,46,0.05)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 8, padding: "0 10px", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={vendorSearch}
                      onChange={e => setVendorSearch(e.target.value)}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: "#2C1A0E", padding: "7px 0" }}
                    />
                    {vendorSearch && <button onClick={() => setVendorSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>}
                  </div>
                  {/* Service type */}
                  <select value={vendorFilterType} onChange={e => setVendorFilterType(e.target.value)} style={selStyle}>
                    <option value="all">All Types</option>
                    {["Caterer","Decorator","Photographer","DJ","GiftHamper"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {/* City */}
                  <select value={vendorFilterCity} onChange={e => setVendorFilterCity(e.target.value)} style={selStyle}>
                    <option value="all">All Cities</option>
                    {allCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {/* Status */}
                  <select value={vendorFilterStatus} onChange={e => setVendorFilterStatus(e.target.value)} style={selStyle}>
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                  {/* Top Rated */}
                  <select value={vendorFilterTopRated} onChange={e => setVendorFilterTopRated(e.target.value)} style={selStyle}>
                    <option value="all">All</option>
                    <option value="yes">⭐ Top Rated</option>
                    <option value="no">Not Top Rated</option>
                  </select>
                  {/* Corporate Experience */}
                  <select value={vendorFilterCorporate} onChange={e => setVendorFilterCorporate(e.target.value)} style={selStyle}>
                    <option value="all">All</option>
                    <option value="yes">🏢 Corporate Exp.</option>
                    <option value="no">No Corporate Exp.</option>
                  </select>
                  {/* Clear all */}
                  {(vendorSearch || vendorFilterType !== "all" || vendorFilterCity !== "all" || vendorFilterStatus !== "all" || vendorFilterTopRated !== "all" || vendorFilterCorporate !== "all") && (
                    <button onClick={() => { setVendorSearch(""); setVendorFilterType("all"); setVendorFilterCity("all"); setVendorFilterStatus("all"); setVendorFilterTopRated("all"); setVendorFilterCorporate("all"); }}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid rgba(192,57,43,0.25)", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                      ✕ Clear
                    </button>
                  )}
                </div>
                {filteredVendors.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 24px", background: "#fff", borderRadius: 14, border: "2px solid #F1E1A8" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                    <p style={{ color: "#9B7450", fontSize: 14, fontWeight: 600 }}>No vendors match your filters</p>
                  </div>
                ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {filteredVendors.map((v) => (
                    <div key={v._id}
                      style={{ background: "#fff", borderRadius: 14, border: "2px solid #CCAB4A", padding: "16px 18px", transition: "box-shadow 0.2s", position: "relative" }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(204,171,74,0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      {/* Action buttons — top right corner */}
                      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                        {/* Top Rated toggle */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newVal = !v.isTopRated;
                            try {
                              await fetch(`${BASE_URL}/admin/vendors/${v._id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                credentials: 'include',
                                body: JSON.stringify({ isTopRated: newVal }),
                              });
                              setVendorStats(prev => prev.map(x => x._id === v._id ? { ...x, isTopRated: newVal } : x));
                            } catch {}
                          }}
                          title={v.isTopRated ? "Remove from Top Rated" : "Mark as Top Rated"}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${v.isTopRated ? "rgba(234,179,8,0.5)" : "rgba(156,163,175,0.3)"}`, background: v.isTopRated ? "rgba(234,179,8,0.15)" : "rgba(156,163,175,0.06)", color: v.isTopRated ? "#ca8a04" : "#9ca3af", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = v.isTopRated ? "rgba(234,179,8,0.25)" : "rgba(234,179,8,0.1)"; e.currentTarget.style.color = "#ca8a04"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = v.isTopRated ? "rgba(234,179,8,0.15)" : "rgba(156,163,175,0.06)"; e.currentTarget.style.color = v.isTopRated ? "#ca8a04" : "#9ca3af"; }}
                        >
                          ⭐
                        </button>
                        {/* Corporate Experience toggle */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newVal = !v.hasCorporateExperience;
                            try {
                              await fetch(`${BASE_URL}/admin/vendors/${v._id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                credentials: 'include',
                                body: JSON.stringify({ hasCorporateExperience: newVal }),
                              });
                              setVendorStats(prev => prev.map(x => x._id === v._id ? { ...x, hasCorporateExperience: newVal } : x));
                            } catch {}
                          }}
                          title={v.hasCorporateExperience ? "Remove Corporate tag (vendor still shows in all bookings)" : "Tag as Corporate Experienced — shows in all bookings + corporate filter"}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${v.hasCorporateExperience ? "rgba(124,58,237,0.5)" : "rgba(156,163,175,0.3)"}`, background: v.hasCorporateExperience ? "rgba(124,58,237,0.15)" : "rgba(156,163,175,0.06)", color: v.hasCorporateExperience ? "#7c3aed" : "#9ca3af", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.15)"; e.currentTarget.style.color = "#7c3aed"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = v.hasCorporateExperience ? "rgba(124,58,237,0.15)" : "rgba(156,163,175,0.06)"; e.currentTarget.style.color = v.hasCorporateExperience ? "#7c3aed" : "#9ca3af"; }}
                        >
                          🏢
                        </button>
                        {v.serviceType === "Caterer" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuVendor(v); }}
                            title="Manage Menu"
                            style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(21,128,61,0.3)", background: "rgba(21,128,61,0.06)", color: "#15803d", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#15803d"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(21,128,61,0.06)"; e.currentTarget.style.color = "#15803d"; }}
                          >
                            🍽️
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditVendor(v); }}
                          title="Edit vendor"
                          style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.06)", color: "#C47A2E", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#C47A2E"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.color = "#C47A2E"; }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newVal = !v.isHidden;
                            setTogglingHideId(v._id);
                            try {
                              const res = await fetch(`${BASE_URL}/admin/vendors/${v._id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                credentials: 'include',
                                body: JSON.stringify({ isHidden: newVal }),
                              });
                              if (res.ok) setVendorStats(prev => prev.map(x => x._id === v._id ? { ...x, isHidden: newVal } : x));
                            } catch {} finally { setTogglingHideId(null); }
                          }}
                          disabled={togglingHideId === v._id}
                          title={v.isHidden ? "Vendor is hidden — click to show on website" : "Hide vendor from website"}
                          style={{ padding: "2px 8px", height: 26, borderRadius: 7, border: `1.5px solid ${v.isHidden ? "rgba(239,68,68,0.4)" : "rgba(107,114,128,0.3)"}`, background: v.isHidden ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.06)", color: v.isHidden ? "#dc2626" : "#6b7280", cursor: togglingHideId === v._id ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap", transition: "all 0.15s" }}
                          onMouseEnter={e => { if (togglingHideId !== v._id) { e.currentTarget.style.background = v.isHidden ? "rgba(239,68,68,0.2)" : "rgba(107,114,128,0.15)"; } }}
                          onMouseLeave={e => { e.currentTarget.style.background = v.isHidden ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.06)"; }}
                        >
                          {togglingHideId === v._id ? "…" : v.isHidden ? "Unhide" : "Hide"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteVendor(v); }}
                          disabled={deletingVendorId === v._id}
                          title="Delete vendor"
                          style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(239,68,68,0.25)", background: deletingVendorId === v._id ? "#f3f4f6" : "rgba(239,68,68,0.06)", color: "#ef4444", cursor: deletingVendorId === v._id ? "not-allowed" : "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#ef4444"; }}
                        >
                          {deletingVendorId === v._id ? "…" : "✕"}
                        </button>
                      </div>

                      {/* Card content — click opens detail */}
                      <div onClick={() => setSelectedVendor(v)} style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingRight: 24 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#2C1A0E" }}>{v.name}</span>
                          {v.isHidden && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)", letterSpacing: "0.05em", flexShrink: 0 }}>HIDDEN</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#C47A2E", fontWeight: 600, marginBottom: 10 }}>{v.serviceType} · {v.city}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[
                            { label: "Requests", val: v.requestCount },
                            { label: "Chats Approved", val: v.chatCount },
                            { label: "Rating", val: v.avgReviewScore?.toFixed(1) ?? "—" },
                            { label: "Experience", val: `${v.yearsOfExperience}y` },
                          ].map(({ label, val }) => (
                            <div key={label} style={{ background: "#fffaf0", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                              <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>{label}</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "#CCAB4A" }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, fontWeight: 600,
                            ...(v.status === "approved" ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }
                            : { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }) }}>
                            {v.status}
                          </span>
                          {v.hasCorporateExperience && (
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, fontWeight: 600, background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)" }}>
                              🏢 Corporate
                            </span>
                          )}
                          <span style={{ fontSize: 0 }}>
                          </span>
                          <span style={{ fontSize: 11, color: "#9B7450" }}>Team: {v.teamSize}</span>
                        </div>
                      </div>

                      {/* Vendor Referral Code */}
                      {(() => {
                        const vCode = formatCode(generateVendorReferralCode(v._id));
                        return (
                          <div onClick={e => e.stopPropagation()} style={{ marginTop: 12, borderTop: "1px solid rgba(196,122,46,0.15)", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 10, color: "#9B7450", fontWeight: 600, marginBottom: 2 }}>
                                REFERRAL CODE · <span style={{ color: "#C47A2E" }}>{v.vendorReferralCount || 0} uses</span>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>{vCode}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                navigator.clipboard.writeText(vCode);
                                const btn = e.currentTarget;
                                btn.textContent = "✓ Copied";
                                setTimeout(() => { btn.textContent = "Copy"; }, 2000);
                              }}
                              style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}
                            >
                              Copy
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
                )}

                {/* Vendor Detail Modal */}
                {selectedVendor && (
                  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setSelectedVendor(null)}>
                    <div style={{ background: "#FFFCF5", borderRadius: 20, padding: "32px", maxWidth: 480, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'Outfit', sans-serif" }}
                      onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>{selectedVendor.name}</h2>
                          <p style={{ fontSize: 13, color: "#C47A2E", fontWeight: 600, margin: "4px 0 0" }}>{selectedVendor.serviceType} · {selectedVendor.city}</p>
                        </div>
                        <button onClick={() => setSelectedVendor(null)} style={{ border: "none", background: "#f3f4f6", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>×</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {[
                          { label: "Total Requests", val: selectedVendor.requestCount },
                          { label: "Approved Chats", val: selectedVendor.chatCount },
                          { label: "Avg Rating", val: selectedVendor.avgReviewScore?.toFixed(1) ?? "—" },
                          { label: "Ranking Score", val: selectedVendor.rankingScore },
                          { label: "Experience", val: `${selectedVendor.yearsOfExperience} years` },
                          { label: "Team Size", val: selectedVendor.teamSize },
                        ].map(({ label, val }) => (
                          <div key={label} style={{ background: "#fffaf0", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(204,171,74,0.3)" }}>
                            <div style={{ fontSize: 11, color: "#9B7450", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#C47A2E" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 13, color: "#5a3a1a", padding: "12px 14px", background: "#fffaf0", borderRadius: 10, border: "1px solid rgba(204,171,74,0.3)", marginBottom: 16 }}>
                        <b>Status:</b> {selectedVendor.status}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => { openEditVendor(selectedVendor); setSelectedVendor(null); }}
                          style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
                        >
                          ✏️ Edit Vendor
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(selectedVendor)}
                          disabled={deletingVendorId === selectedVendor._id}
                          style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: deletingVendorId === selectedVendor._id ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; e.currentTarget.style.color = "#ef4444"; }}
                        >
                          {deletingVendorId === selectedVendor._id ? "Deleting…" : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

            {/* Vendor Applications Table */}
            <div className="mb-8">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="text-xl font-semibold text-black">Vendor Applications ({vendorApplications.length})</div>
              </div>
              {vendorApplications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#9B7450", background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A" }}>No applications yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {vendorApplications.map((app) => {
                    // ── Replace this URL when you have the Google Form link ──
                    const GOOGLE_FORM_URL = "https://forms.gle/9DLeMdJiMdLNsTmbA";

                    const statusStyle = {
                      pending:    { bg: "#fffbeb", color: "#b45309",  border: "#fde68a",  label: "Pending" },
                      form_sent:  { bg: "#eff6ff", color: "#0369a1",  border: "#bfdbfe",  label: "Form Sent" },
                      approved:   { bg: "#f0fdf4", color: "#15803d",  border: "#bbf7d0",  label: "Approved" },
                      registered: { bg: "#f0fdf4", color: "#15803d",  border: "#bbf7d0",  label: "Registered ✓" },
                      rejected:   { bg: "#fff5f5", color: "#c0392b",  border: "#fca5a5",  label: "Rejected" },
                    }[app.status] || { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: app.status };

                    const waNum = app.whatsappNumber || app.phoneNumber;

                    const updateStatus = (newStatus) => {
                      fetch(`${BASE_URL}/vendor-applications/${app._id}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        credentials: "include",
                        body: JSON.stringify({ status: newStatus }),
                      })
                        .then((r) => r.json())
                        .then(() => setVendorApplications((prev) =>
                          prev.map((a) => a._id === app._id ? { ...a, status: newStatus } : a)
                        ))
                        .catch(() => {});
                    };

                    const btnStyle = (bg, color, border) => ({
                      padding: "7px 14px", borderRadius: 8, border: border ? `1.5px solid ${border}` : "none",
                      background: bg, color, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Outfit', sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5,
                    });

                    return (
                      <div key={app._id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(204,171,74,0.2)", padding: "16px 20px", boxShadow: "0 2px 10px rgba(139,69,19,0.05)" }}>
                        {/* Info row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 700, fontSize: 16, color: "#2C1A0E" }}>{app.name}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                                {statusStyle.label}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#5a3a1a" }}>
                              <span>📞 {app.phoneNumber}</span>
                              {app.whatsappNumber && <span>💬 {app.whatsappNumber}</span>}
                              {app.email && <span>✉️ {app.email}</span>}
                            </div>
                            <div style={{ fontSize: 12, color: "#9B7450", marginTop: 4 }}>{app.address} · {new Date(app.createdAt).toLocaleDateString("en-IN")}</div>
                          </div>
                        </div>

                        {/* Action buttons — step by step */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(204,171,74,0.15)", paddingTop: 10 }}>

                          {/* STEP 1 — pending: send form */}
                          {app.status === "pending" && (
                            <a
                              href={`https://wa.me/91${waNum}?text=${encodeURIComponent(`Hi ${app.name}! 👋 Thank you for your interest in joining Tendr. Please fill in this form to complete your vendor registration: ${GOOGLE_FORM_URL}`)}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={() => setTimeout(() => updateStatus("form_sent"), 500)}
                              style={btnStyle("linear-gradient(135deg,#C47A2E,#CCAB4A)", "#fff", null)}
                            >
                              📋 Send Google Form
                            </a>
                          )}

                          {/* STEP 2 — form sent: approve or reject */}
                          {app.status === "form_sent" && (
                            <>
                              <span style={{ fontSize: 12, color: "#9B7450", marginRight: 4 }}>Form sent ✓</span>
                              <button onClick={() => updateStatus("approved")} style={btnStyle("linear-gradient(135deg,#C47A2E,#CCAB4A)", "#fff", null)}>
                                ✓ Approve
                              </button>
                              <button onClick={() => updateStatus("rejected")} style={btnStyle("#fff5f5", "#c0392b", "#fca5a5")}>
                                ✗ Reject
                              </button>
                            </>
                          )}

                          {/* STEP 3 — approved: WhatsApp approval message + mark registered with service type */}
                          {app.status === "approved" && (
                            <>
                              <a
                                href={`https://wa.me/91${waNum}?text=${encodeURIComponent(`Hi ${app.name}! 🎉 Congratulations! You are approved by Tendr as a vendor. Our team will contact you shortly with your profile link and next steps. Welcome to the Tendr family! — Team Tendr`)}`}
                                target="_blank" rel="noopener noreferrer"
                                style={btnStyle("#25D366", "#fff", null)}
                              >
                                📱 Send Approval on WhatsApp
                              </a>

                              {registeringAppId === app._id ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Select service category:</span>
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {["DJ", "Caterer", "Decorator", "Photographer"].map((type) => (
                                      <button
                                        key={type}
                                        onClick={() => {
                                          fetch(`${BASE_URL}/vendor-applications/${app._id}/status`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                            credentials: "include",
                                            body: JSON.stringify({ status: "registered", serviceType: type }),
                                          })
                                            .then((r) => { if (r.ok) {
                                              setVendorApplications((prev) => prev.map((a) => a._id === app._id ? { ...a, status: "registered", serviceType: type } : a));
                                              setLiveStats((prev) => prev ? {
                                                ...prev,
                                                vendors: {
                                                  ...prev.vendors,
                                                  total: (prev.vendors?.total ?? 0) + 1,
                                                  // approved count only increases when admin manually adds via Add Vendor button
                                                },
                                                applications: { ...prev.applications, registered: (prev.applications?.registered ?? 0) + 1 },
                                              } : prev);
                                            }})
                                            .catch(() => {})
                                            .finally(() => setRegisteringAppId(null));
                                        }}
                                        style={btnStyle("linear-gradient(135deg,#C47A2E,#CCAB4A)", "#fff", null)}
                                      >
                                        {type}
                                      </button>
                                    ))}
                                    <button onClick={() => setRegisteringAppId(null)} style={btnStyle("#f3f4f6", "#6b7280", "#e5e7eb")}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setRegisteringAppId(app._id)} style={btnStyle("#15803d", "#fff", null)}>
                                  ✓ Mark as Registered
                                </button>
                              )}
                            </>
                          )}

                          {/* STEP 4 — registered: WhatsApp again if needed */}
                          {app.status === "registered" && (
                            <a
                              href={`https://wa.me/91${waNum}?text=${encodeURIComponent(`Hi ${app.name}! You are now fully registered as a Tendr vendor. — Team Tendr`)}`}
                              target="_blank" rel="noopener noreferrer"
                              style={btnStyle("#25D366", "#fff", null)}
                            >
                              📱 WhatsApp
                            </a>
                          )}

                          {/* Rejected: reconsider */}
                          {app.status === "rejected" && (
                            <button onClick={() => updateStatus("pending")} style={btnStyle("#fff", "#C47A2E", "#CCAB4A")}>
                              ↩ Reconsider
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Cards Lower */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10 mt-4 sm:mt-8">
              {/* Two side-by-side custom columns */}
              <div className="w-full grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Left box */}
                <div className="flex-1 px-4 sm:px-6 py-4 sm:py-5 bg-white border-2 border-[#CCAB4A] rounded-[16px] sm:rounded-[20px] flex flex-col justify-start hover:shadow-md transition-shadow">
                  {/* Heading */}
                  <div className="mb-4">
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold text-black">
                      Top Performers
                    </div>
                    <div className="text-sm sm:text-base text-gray-400 leading-4">
                      Total bookings handled
                    </div>
                  </div>

                  {/* Vendor list — real data */}
                  <div className="flex-1 flex flex-col justify-evenly space-y-3 sm:space-y-4">
                    {(topVendorsReal.length > 0 ? topVendorsReal : topVendors).map((vendor, index) => (
                      <div key={index} className="flex justify-between items-start group cursor-pointer">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="text-xl sm:text-2xl leading-tight flex-shrink-0">
                            {["🥇","🥈","🥉","4️⃣","5️⃣"][index] || "⭐"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-base sm:text-lg leading-none break-words">
                              {vendor.name || "Unnamed"}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 mt-1">
                              {vendor.city || vendor.serviceType || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="text-[#CCAB4A] font-bold text-lg sm:text-2xl leading-none flex-shrink-0 ml-2">
                          {vendor.bookings}
                        </div>
                      </div>
                    ))}
                    {topVendorsReal.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">Will populate after first paid bookings</p>
                    )}
                  </div>
                </div>

                {/* Right box */}
                <div className="flex-1 px-4 sm:px-6 py-4 sm:py-5 bg-white border-2 border-[#CCAB4A] rounded-[16px] sm:rounded-[20px] flex flex-col justify-start hover:shadow-md transition-shadow">
                  {/* Heading */}
                  <div className="mb-4">
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold text-black">
                      Top Earners
                    </div>
                    <div className="text-sm sm:text-base text-gray-400 leading-4">
                      Total revenue generated
                    </div>
                  </div>

                  {/* Earner list — real revenue data from top-vendors */}
                  <div className="flex-1 flex flex-col justify-evenly space-y-3 sm:space-y-4">
                    {(topVendorsReal.length > 0
                      ? [...topVendorsReal].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                      : topEarners
                    ).map((earner, index) => (
                      <div key={index} className="flex justify-between items-start group cursor-pointer">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="text-xl sm:text-2xl leading-tight flex-shrink-0">
                            {["🥇","🥈","🥉","4️⃣","5️⃣"][index] || "⭐"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-base sm:text-lg leading-none break-words">
                              {earner.name || "Unnamed"}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 mt-1">
                              {earner.city || earner.serviceType || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="text-[#CCAB4A] font-bold text-lg sm:text-2xl leading-none whitespace-nowrap flex-shrink-0 ml-2">
                          {formatEarnings(earner.revenue || earner.earnings || 0)}
                        </div>
                      </div>
                    ))}
                    {topVendorsReal.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">Will populate after first paid bookings</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vendors by City */}
              <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full px-4 sm:px-6 py-4 sm:py-5 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-start hover:shadow-md transition-shadow">
                <div className="heading font-semibold text-lg sm:text-xl md:text-2xl text-black mb-2 sm:mb-4">
                  Vendors by City
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[250px] text-gray-400">
                  <Doughnut_VendorCity_AdminDashboard />
                </div>
              </div>
            </div>
            </>}

            {/* ════════════════════════════════════════
                VENDOR ANALYTICS TAB
            ════════════════════════════════════════ */}
            {vendorSubTab === "analytics" && vendorStats.length > 0 && (() => {
              const font = "'Outfit', sans-serif";
              const thSt = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid rgba(196,122,46,0.15)", background: "rgba(196,122,46,0.04)", whiteSpace: "nowrap" };
              const tdSt = { padding: "10px 14px", fontSize: 13, color: "#2C1A0E", borderBottom: "1px solid rgba(196,122,46,0.08)" };
              const cardSt = { background: "#fff", border: "2px solid #CCAB4A", borderRadius: 16, overflow: "hidden" };
              const svcIcon = { Caterer: "🍽️", Decorator: "🎀", Photographer: "📸", DJ: "🎵" };

              // ── aggregates ──
              const totalReqs  = vendorStats.reduce((s, v) => s + (v.requestCount || 0), 0);
              const totalChats = vendorStats.reduce((s, v) => s + (v.chatCount    || 0), 0);
              const engPct     = totalReqs > 0 ? ((totalChats / totalReqs) * 100).toFixed(1) : null;
              const ratedVs    = vendorStats.filter(v => v.avgReviewScore > 0);
              const avgRating  = ratedVs.length > 0
                ? (ratedVs.reduce((s, v) => s + v.avgReviewScore, 0) / ratedVs.length).toFixed(2)
                : null;
              const approvedCount  = vendorStats.filter(v => v.status === "approved").length;
              const topRatedCount  = vendorStats.filter(v => v.isTopRated).length;
              const corpCount      = vendorStats.filter(v => v.hasCorporateExperience).length;

              // ── by service type ──
              const svcTypes = ["Caterer", "Decorator", "Photographer", "DJ"];
              const byType = svcTypes.map(t => {
                const vs = vendorStats.filter(v => v.serviceType === t);
                if (!vs.length) return null;
                const reqs  = vs.reduce((s, v) => s + (v.requestCount || 0), 0);
                const chats = vs.reduce((s, v) => s + (v.chatCount    || 0), 0);
                const rated = vs.filter(v => v.avgReviewScore > 0);
                return {
                  type: t, count: vs.length,
                  approved: vs.filter(v => v.status === "approved").length,
                  totalReqs: reqs,
                  avgReqs:  (reqs / vs.length).toFixed(1),
                  avgChats: (chats / vs.length).toFixed(1),
                  engRate:  reqs > 0 ? ((chats / reqs) * 100).toFixed(1) : null,
                  avgRating: rated.length
                    ? (rated.reduce((s, v) => s + v.avgReviewScore, 0) / rated.length).toFixed(1)
                    : null,
                  topRated: vs.filter(v => v.isTopRated).length,
                };
              }).filter(Boolean);

              // ── by city ──
              const cities = [...new Set(vendorStats.map(v => v.city).filter(Boolean))].sort();
              const byCity = cities.map(c => {
                const vs    = vendorStats.filter(v => v.city === c);
                const reqs  = vs.reduce((s, v) => s + (v.requestCount || 0), 0);
                const rated = vs.filter(v => v.avgReviewScore > 0);
                return {
                  city: c, count: vs.length,
                  approved: vs.filter(v => v.status === "approved").length,
                  totalReqs: reqs,
                  avgReqs:  (reqs / vs.length).toFixed(1),
                  avgRating: rated.length
                    ? (rated.reduce((s, v) => s + v.avgReviewScore, 0) / rated.length).toFixed(1)
                    : null,
                };
              }).sort((a, b) => b.count - a.count);

              // ── sorted leaderboard ──
              const sortedVs = [...vendorStats].sort((a, b) => {
                if (vendorAnalyticsSortBy === "avgReviewScore") return (b.avgReviewScore || 0) - (a.avgReviewScore || 0);
                if (vendorAnalyticsSortBy === "chatCount")      return (b.chatCount      || 0) - (a.chatCount      || 0);
                if (vendorAnalyticsSortBy === "engRate") {
                  const ea = a.requestCount > 0 ? (a.chatCount || 0) / a.requestCount : 0;
                  const eb = b.requestCount > 0 ? (b.chatCount || 0) / b.requestCount : 0;
                  return eb - ea;
                }
                return (b.requestCount || 0) - (a.requestCount || 0);
              });

              // ── rating distribution ──
              const rateDist = [
                { label: "4.0 – 5.0  ★★★★", count: vendorStats.filter(v => v.avgReviewScore >= 4).length,                               color: "#22a055" },
                { label: "3.0 – 3.9  ★★★",  count: vendorStats.filter(v => v.avgReviewScore >= 3 && v.avgReviewScore < 4).length,        color: "#f59e0b" },
                { label: "Below 3.0  ★★",   count: vendorStats.filter(v => v.avgReviewScore > 0 && v.avgReviewScore < 3).length,         color: "#ef4444" },
                { label: "Not yet rated",    count: vendorStats.filter(v => !v.avgReviewScore || v.avgReviewScore === 0).length,           color: "#9ca3af" },
              ];
              const maxRD = Math.max(...rateDist.map(r => r.count), 1);

              // ── flags ──
              const inactive  = vendorStats.filter(v => !v.requestCount);
              const lowEng    = vendorStats.filter(v => v.requestCount > 0 && ((v.chatCount || 0) / v.requestCount) < 0.3);
              const lowRating = vendorStats.filter(v => v.avgReviewScore > 0 && v.avgReviewScore < 3);

              const ColBtn = ({ k, label }) => (
                <th style={{ ...thSt, cursor: "pointer", userSelect: "none" }} onClick={() => setVendorAnalyticsSortBy(k)}>
                  {label} {vendorAnalyticsSortBy === k ? "▼" : ""}
                </th>
              );

              const engColor = (pct) =>
                pct === null ? "#9ca3af" : parseFloat(pct) >= 50 ? "#22a055" : parseFloat(pct) >= 30 ? "#f59e0b" : "#ef4444";

              return (
                <div style={{ fontFamily: font, paddingBottom: 32 }}>

                  {/* ── Summary cards ── */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 14, marginBottom: 24 }}>
                    {[
                      { label: "Total Vendors",     value: vendorStats.length,           icon: "👥" },
                      { label: "Approved",           value: approvedCount,                icon: "✅" },
                      { label: "Total Requests",     value: totalReqs,                    icon: "📨" },
                      { label: "Total Chats",        value: totalChats,                   icon: "💬" },
                      { label: "Engagement Rate",    value: engPct ? `${engPct}%` : "—", icon: "📈" },
                      { label: "Avg Rating",         value: avgRating ? `${avgRating} ★` : "—", icon: "⭐" },
                      { label: "Top Rated",          value: topRatedCount,                icon: "🏅" },
                      { label: "Corporate Ready",    value: corpCount,                    icon: "🏢" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#fff", border: "2px solid #CCAB4A", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#CCAB4A", lineHeight: 1 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── By service type ── */}
                  <div style={{ ...cardSt, marginBottom: 20 }}>
                    <div style={{ padding: "13px 20px", borderBottom: "2px solid rgba(196,122,46,0.15)", fontWeight: 700, fontSize: 15, color: "#2C1A0E" }}>
                      📊 Performance by Service Type
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {["Service","Vendors","Approved","Total Requests","Avg Requests","Avg Chats","Engagement %","Avg Rating","Top Rated"].map(h => (
                              <th key={h} style={thSt}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {byType.map((row, i) => (
                            <tr key={row.type} style={{ background: i % 2 === 0 ? "#fff" : "rgba(196,122,46,0.02)" }}>
                              <td style={{ ...tdSt, fontWeight: 700 }}>{svcIcon[row.type] || "🔧"} {row.type}</td>
                              <td style={tdSt}>{row.count}</td>
                              <td style={{ ...tdSt, color: "#22a055", fontWeight: 600 }}>{row.approved}</td>
                              <td style={{ ...tdSt, fontWeight: 700, color: "#d08f4e" }}>{row.totalReqs}</td>
                              <td style={tdSt}>{row.avgReqs}</td>
                              <td style={tdSt}>{row.avgChats}</td>
                              <td style={{ ...tdSt, fontWeight: 700, color: engColor(row.engRate) }}>
                                {row.engRate !== null ? `${row.engRate}%` : "—"}
                              </td>
                              <td style={{ ...tdSt, fontWeight: 700 }}>
                                {row.avgRating ? <span style={{ color: "#d08f4e" }}>{row.avgRating} ★</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                              </td>
                              <td style={tdSt}>{row.topRated}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── By city + rating dist ── */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    {/* By city */}
                    <div style={cardSt}>
                      <div style={{ padding: "13px 20px", borderBottom: "2px solid rgba(196,122,46,0.15)", fontWeight: 700, fontSize: 15, color: "#2C1A0E" }}>
                        📍 Performance by City
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["City","Vendors","Approved","Total Req.","Avg Req.","Avg Rating"].map(h => (
                                <th key={h} style={thSt}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {byCity.map((row, i) => (
                              <tr key={row.city} style={{ background: i % 2 === 0 ? "#fff" : "rgba(196,122,46,0.02)" }}>
                                <td style={{ ...tdSt, fontWeight: 700 }}>📍 {row.city}</td>
                                <td style={tdSt}>{row.count}</td>
                                <td style={{ ...tdSt, color: "#22a055", fontWeight: 600 }}>{row.approved}</td>
                                <td style={{ ...tdSt, color: "#d08f4e", fontWeight: 700 }}>{row.totalReqs}</td>
                                <td style={tdSt}>{row.avgReqs}</td>
                                <td style={{ ...tdSt, fontWeight: 700 }}>
                                  {row.avgRating ? <span style={{ color: "#d08f4e" }}>{row.avgRating} ★</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Rating distribution */}
                    <div style={cardSt}>
                      <div style={{ padding: "13px 20px", borderBottom: "2px solid rgba(196,122,46,0.15)", fontWeight: 700, fontSize: 15, color: "#2C1A0E" }}>
                        ⭐ Rating Distribution
                      </div>
                      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                        {rateDist.map(r => (
                          <div key={r.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, fontFamily: font }}>
                              <span style={{ color: "#2C1A0E" }}>{r.label}</span>
                              <span style={{ fontWeight: 700, color: r.color }}>{r.count} vendors</span>
                            </div>
                            <div style={{ background: "rgba(196,122,46,0.1)", borderRadius: 100, height: 9, overflow: "hidden" }}>
                              <div style={{ width: `${(r.count / maxRD) * 100}%`, height: "100%", background: r.color, borderRadius: 100 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Individual leaderboard ── */}
                  <div style={{ ...cardSt, marginBottom: 20 }}>
                    <div style={{ padding: "13px 20px", borderBottom: "2px solid rgba(196,122,46,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#2C1A0E" }}>🏆 All Vendor Performance</div>
                      <div style={{ fontSize: 12, color: "#9B7450" }}>Click column headers to sort</div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={thSt}>#</th>
                            <th style={thSt}>Name</th>
                            <th style={thSt}>Type</th>
                            <th style={thSt}>City</th>
                            <th style={thSt}>Status</th>
                            <ColBtn k="requestCount" label="Requests" />
                            <ColBtn k="chatCount"    label="Chats" />
                            <ColBtn k="engRate"      label="Engagement" />
                            <ColBtn k="avgReviewScore" label="Rating" />
                            <th style={thSt}>Flags</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedVs.map((v, i) => {
                            const eng = v.requestCount > 0
                              ? ((v.chatCount || 0) / v.requestCount * 100).toFixed(1)
                              : null;
                            const flags = [];
                            if (!v.requestCount) flags.push("💤 Inactive");
                            if (eng !== null && parseFloat(eng) < 30) flags.push("📉 Low eng.");
                            if (v.avgReviewScore > 0 && v.avgReviewScore < 3) flags.push("⚠️ Low rating");
                            return (
                              <tr key={v._id} style={{ background: i % 2 === 0 ? "#fff" : "rgba(196,122,46,0.02)" }}>
                                <td style={{ ...tdSt, color: "#9B7450", fontWeight: 600 }}>{i + 1}</td>
                                <td style={{ ...tdSt, fontWeight: 700 }}>
                                  {v.name}
                                  {v.isTopRated && (
                                    <span style={{ marginLeft: 5, fontSize: 10, background: "rgba(196,122,46,0.15)", color: "#8B6914", borderRadius: 100, padding: "1px 6px", fontWeight: 700 }}>TOP</span>
                                  )}
                                </td>
                                <td style={tdSt}>{svcIcon[v.serviceType] || ""} {v.serviceType}</td>
                                <td style={tdSt}>{v.city || "—"}</td>
                                <td style={tdSt}>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: v.status === "approved" ? "rgba(34,160,85,0.1)" : "rgba(239,68,68,0.1)", color: v.status === "approved" ? "#22a055" : "#ef4444" }}>
                                    {v.status || "unknown"}
                                  </span>
                                </td>
                                <td style={{ ...tdSt, fontWeight: 700, color: "#d08f4e" }}>{v.requestCount || 0}</td>
                                <td style={tdSt}>{v.chatCount || 0}</td>
                                <td style={{ ...tdSt, fontWeight: 700, color: engColor(eng) }}>
                                  {eng !== null ? `${eng}%` : "—"}
                                </td>
                                <td style={{ ...tdSt, fontWeight: 700 }}>
                                  {v.avgReviewScore > 0
                                    ? <span style={{ color: "#d08f4e" }}>{v.avgReviewScore.toFixed(1)} ★</span>
                                    : <span style={{ color: "#9ca3af" }}>—</span>}
                                </td>
                                <td style={{ ...tdSt, fontSize: 11 }}>
                                  {flags.length > 0 ? flags.join("  ") : <span style={{ color: "#9ca3af" }}>—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Attention flags ── */}
                  {(inactive.length > 0 || lowEng.length > 0 || lowRating.length > 0) && (
                    <div style={{ ...cardSt, marginBottom: 24 }}>
                      <div style={{ padding: "13px 20px", borderBottom: "2px solid rgba(196,122,46,0.15)", fontWeight: 700, fontSize: 15, color: "#2C1A0E" }}>
                        ⚠️ Attention Required
                      </div>
                      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                        {inactive.length > 0 && (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>
                              💤 Inactive Vendors ({inactive.length}) — 0 requests received
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {inactive.map(v => (
                                <span key={v._id} style={{ fontSize: 12, background: "rgba(156,163,175,0.12)", color: "#4B5563", borderRadius: 100, padding: "3px 10px", border: "1px solid rgba(156,163,175,0.25)" }}>
                                  {v.name} · {v.serviceType}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {lowEng.length > 0 && (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>
                              📉 Low Engagement ({lowEng.length}) — Chat rate below 30% of requests
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {lowEng.map(v => {
                                const e = ((v.chatCount || 0) / v.requestCount * 100).toFixed(0);
                                return (
                                  <span key={v._id} style={{ fontSize: 12, background: "rgba(245,158,11,0.1)", color: "#92400e", borderRadius: 100, padding: "3px 10px", border: "1px solid rgba(245,158,11,0.25)" }}>
                                    {v.name} · {e}%
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {lowRating.length > 0 && (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>
                              ⭐ Low Rating ({lowRating.length}) — Average below 3.0
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {lowRating.map(v => (
                                <span key={v._id} style={{ fontSize: 12, background: "rgba(239,68,68,0.1)", color: "#991b1b", borderRadius: 100, padding: "3px 10px", border: "1px solid rgba(239,68,68,0.2)" }}>
                                  {v.name} · {v.avgReviewScore.toFixed(1)} ★
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {vendorSubTab === "analytics" && vendorStats.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B7450", fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No vendor data yet</div>
                <div style={{ fontSize: 13 }}>Analytics will appear once vendors are added to the platform.</div>
              </div>
            )}

          </div>
          );
        })()}

        {activeDropdown === "users" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            {/* Heading */}
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Users
            </div>

            {/* Live User Stats */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Total Users", value: liveStats?.users?.total ?? "—", icon: stats_users[0].icon },
                ].map((item, idx) => (
                  <div key={idx} className="min-h-[160px] sm:min-h-[180px] w-full px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-between py-4 sm:py-5 hover:shadow-md transition-shadow">
                    <div className="icon text-[#d08f4e]">{item.icon}</div>
                    <div className="content flex flex-col items-center gap-2">
                      <div className="heading font-semibold text-sm sm:text-base lg:text-lg text-gray-500 leading-tight text-center">{item.label}</div>
                      <div className="metric text-4xl sm:text-5xl md:text-6xl lg:text-[75px] font-bold text-[#CCAB4A] leading-tight">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Users List */}
            <div className="mb-8 mt-2">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="text-xl font-semibold text-black">All Users ({userList.length})</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>Deleting a user removes their account — they must sign up again</div>
              </div>

              {loadingUsers ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#9B7450" }}>Loading users...</div>
              ) : userList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#9B7450", background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A" }}>No users yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {userList.map((u) => (
                    <div key={u._id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(204,171,74,0.2)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 2px 8px rgba(139,69,19,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#2C1A0E", fontFamily: "'Outfit', sans-serif" }}>
                            {u.name}
                            {u.isAdmin && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>Admin</span>}
                          </div>
                          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#9B7450", marginTop: 2 }}>
                            {u.phoneNumber && <span>📞 {u.phoneNumber}</span>}
                            {u.email && <span>✉️ {u.email}</span>}
                            <span>Joined {new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                      {!u.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeDropdown === "chat" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Chat
            </div>

            <div className="min-h-[500px] sm:min-h-[600px] w-full bg-white border-2 border-[#CCAB4A] rounded-[16px] sm:rounded-[20px] flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
              {/* LEFT - Recent Conversations */}
              <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-[#F1E1A8] overflow-y-auto max-h-[300px] sm:max-h-none">
                {recentChats.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedChat(c);
                      loadConversation(c._id);
                    }}
                    className={`flex items-center justify-between gap-2 p-3 sm:p-4 cursor-pointer hover:bg-[#FFF4D4] transition flex-col sm:flex-row text-center sm:text-left ${
                      selectedChat?.customerId.name === c.customerId.name
                        ? "bg-[#FFF4D4]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-1 w-full">
                      {/* User */}
                      <div className="flex items-center gap-1">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(c.customerId.name)}
                        </div>
                        <span className="font-semibold text-xs sm:text-base hidden sm:inline">
                          {c.customerId.name}
                        </span>
                      </div>

                      <span className="mx-1 sm:mx-2 text-gray-400 hidden sm:inline">
                        -
                      </span>

                      {/* Vendor */}
                      <div className="flex items-center gap-1">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(c.vendorId?.name || c.vendorName || "Tendr Team")}
                        </div>
                        <span className="font-semibold text-xs sm:text-base hidden sm:inline">
                          {c.vendorId?.name || c.vendorName || "Tendr Team"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end text-xs sm:text-sm gap-1">
                      <span className="text-gray-500">{c.time}</span>
                      {c.unread > 0 && (
                        <span className="mt-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-[#d08f4e] text-white text-xs font-semibold">
                          {c.unread}
                        </span>
                      )}
                      {/* Expiry badge */}
                      {(() => { const h = hoursLeft(c); return h !== null && h <= 6 && !isClosed(c) ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: h <= 2 ? "#c0392b" : "#b45309" }}>
                          ⏳ {h === 0 ? "Expiring" : `${h}h left`}
                        </span>
                      ) : null; })()}
                      {isClosed(c) && <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "2px 7px", marginTop: 2 }}>🔒 Closed</span>}
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteChat(e, c._id)}
                        style={{ fontSize: 10, fontWeight: 700, color: "#c0392b", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 6, padding: "2px 7px", cursor: "pointer", marginTop: 2 }}
                      >🗑</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT - Chat Messages */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "100%" }}>
                  {/* Chat column */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-[#F1E1A8] flex items-center justify-between flex-wrap gap-2">
                      {/* User */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(selectedChat.customerId.name)}
                        </div>
                        <span className="font-semibold text-sm sm:text-lg">
                          {selectedChat.customerId.name}
                        </span>
                      </div>

                      <span className="mx-2 text-gray-400 hidden sm:inline">
                        -
                      </span>

                      {/* Vendor */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(selectedChat.vendorId?.name || selectedChat.vendorName || "V")}
                        </div>
                        <span className="font-semibold text-sm sm:text-lg">
                          {selectedChat.vendorId?.name || selectedChat.vendorName}
                        </span>
                      </div>
                    </div>

                    {/* Event details strip */}
                    {selectedChat.eventDetails && Object.values(selectedChat.eventDetails).some(Boolean) && (
                      <div style={{ background: "#fffaf3", borderBottom: "1px solid #fde9c4", padding: "8px 16px", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#7a5c1e", fontFamily: "'Outfit', sans-serif" }}>
                        {selectedChat.serviceType && <span><b>Service:</b> {selectedChat.serviceType}</span>}
                        {selectedChat.eventDetails.eventName && <span><b>Event:</b> {selectedChat.eventDetails.eventName}</span>}
                        {selectedChat.eventDetails.eventType && <span><b>Type:</b> {selectedChat.eventDetails.eventType}</span>}
                        {selectedChat.eventDetails.date && <span><b>Date:</b> {selectedChat.eventDetails.date}</span>}
                        {selectedChat.eventDetails.location && <span><b>City:</b> {selectedChat.eventDetails.location}</span>}
                        {selectedChat.eventDetails.guests && <span><b>Guests:</b> {selectedChat.eventDetails.guests}</span>}
                        {selectedChat.eventDetails.budget && <span><b>Budget:</b> {selectedChat.eventDetails.budget}</span>}
                      </div>
                    )}

                    {/* Messages */}
                    {currentConversation && currentConversation.length > 0 && (
                      <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col space-y-2 sm:space-y-3">
                        {currentConversation.map((msg, index) => {
                          const msgText = msg.content || msg.text || "";
                          const isUser = msg.sender === "user";
                          const isPinned = currentPinned.some(m => m.content === msgText);
                          return (
                            <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 6, alignSelf: isUser ? "flex-start" : "flex-end" }}>
                              <button onClick={() => isPinned ? unpinMessage(msgText) : pinMessage(msgText)}
                                title={isPinned ? "Unpin" : "Pin this message"}
                                style={{ background: isPinned ? "rgba(196,122,46,0.15)" : "none", border: "none", cursor: "pointer", fontSize: 13, color: isPinned ? "#C47A2E" : "#ddd", padding: "4px 5px", borderRadius: 6, flexShrink: 0, marginTop: 4, lineHeight: 1 }}>
                                📌
                              </button>
                              <div style={{
                                background: isUser ? "#f3f4f6" : "#d08f4e",
                                color: isUser ? "#1f2937" : "#ffffff",
                                padding: "8px 14px", borderRadius: 14, maxWidth: "75%",
                                fontSize: 14, fontFamily: "'Outfit', sans-serif", wordBreak: "break-word", lineHeight: 1.5,
                              }}>
                                <span style={{ fontSize: 10, opacity: 0.65, display: "block", marginBottom: 3, fontWeight: 600 }}>
                                  {isUser ? "Customer" : "Admin"}
                                </span>
                                <RenderMessage text={msgText} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Hinglish quick replies — Baat Karo chats only */}
                    {selectedChat?.serviceType === "Baat Karo" && (
                      <div style={{ padding: "8px 10px 0", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid #F1E1A8" }}>
                        {[
                          "Dhanyawad! Hum aapke liye best vendors dhoondh rahe hain.",
                          "Aapka budget kitna hai?",
                          "Konsi date confirm hai?",
                          "Hum 2 ghante mein reply denge.",
                          "Kya aap location bata sakte hain?",
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              if (!selectedChat) return;
                              const msg = { conversationId: selectedChat._id, sender: 'customer-care', content: q };
                              if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                              setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                            }}
                            style={{ padding: "4px 10px", borderRadius: 100, border: "1.5px solid rgba(204,171,74,0.4)", background: "#FFFCF0", color: "#7A5535", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input Box */}
                    <div className="p-2 sm:p-3 border-t border-[#F1E1A8] flex gap-2">
                      {/* Image upload */}
                      <label style={{ cursor: "pointer", flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb" }}>
                        📎
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !selectedChat) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const content = `[img:${ev.target.result}]`;
                            const msg = { conversationId: selectedChat._id, sender: 'customer-care', content };
                            if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                            setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }} />
                      </label>

                      <input
                        type="text"
                        value={adminMsgInput}
                        onChange={(e) => setAdminMsgInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && adminMsgInput.trim()) {
                            const msg = { conversationId: selectedChat._id, sender: 'customer-care', content: adminMsgInput.trim() };
                            if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                            setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                            setAdminMsgInput("");
                          }
                        }}
                        placeholder="Type a message and press Enter or Send..."
                        className="flex-1 px-3 sm:px-4 py-2 rounded-full border border-[#CCAB4A] focus:outline-none text-sm"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      />
                      <button
                        onClick={() => {
                          if (!adminMsgInput.trim() || !selectedChat) return;
                          const msg = { conversationId: selectedChat._id, sender: 'customer-care', content: adminMsgInput.trim() };
                          if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                          setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                          setAdminMsgInput("");
                        }}
                        className="px-3 sm:px-4 py-2 bg-[#CCAB4A] text-white rounded-full font-semibold hover:opacity-90 transition text-sm"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Send
                      </button>
                    </div>
                  </div>

                  {/* Admin quick-send sidebar — always shown for vendor/concierge chats */}
                  <div style={{ width: 230, borderLeft: "1px solid rgba(196,122,46,0.15)", display: "flex", flexDirection: "column", background: "#fffbf5", flexShrink: 0, overflowY: "auto" }}>

                    {/* Common quick replies */}
                    <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Quick Replies</div>
                      {[
                        "Thank you for reaching out! We'll get back to you shortly.",
                        "Could you please share your event date and guest count?",
                        "We have availability on your date — let's discuss pricing.",
                        "Our team will prepare a custom quote for you.",
                        "Please confirm and we'll proceed with the booking.",
                      ].map((msg, i) => (
                        <button key={i} onClick={() => {
                          if (!selectedChat?._id || !adminSocketRef.current) return;
                          const m = { conversationId: selectedChat._id, sender: 'customer-care', content: msg };
                          adminSocketRef.current.emit('send_message', m);
                          setCurrentConversation((prev) => [...(prev || []), { ...m, createdAt: new Date().toISOString() }]);
                        }}
                          style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4, padding: "5px 8px", borderRadius: 7, border: "1px solid rgba(196,122,46,0.15)", background: "#fff", color: "#5a3a1a", fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                        >{msg}</button>
                      ))}
                    </div>

                    {/* Package cards — send to customer */}
                    {(() => {
                      const svcType = selectedChat?.serviceType
                        || selectedChat?.vendorId?.serviceType
                        || selectedChat?.vendorServiceType
                        || "";
                      const PACKAGES = {
                        Caterer: [
                          { tier: "Basic",    guests: "20–40", items: ["Veg Menu", "2 Starters", "1 Main Course", "1 Dessert", "Basic Serving"] },
                          { tier: "Standard", guests: "40–80", items: ["Veg/Non-Veg", "3 Starters", "2 Main Course", "2 Desserts", "Live Counter", "Professional Staff"] },
                          { tier: "Premium",  guests: "80+",   items: ["Custom Menu", "4+ Starters", "3+ Main Course", "3+ Desserts", "Live Counters", "Fine Dining Setup"] },
                        ],
                        Photographer: [
                          { tier: "Basic",    guests: "20–40", items: ["2–3 Hrs Coverage", "1 Photographer", "100+ Edited Photos", "Online Gallery"] },
                          { tier: "Standard", guests: "40–80", items: ["4–6 Hrs Coverage", "1 Photographer", "300+ Edited Photos", "Candid + Group", "Highlight Reel"] },
                          { tier: "Premium",  guests: "80+",   items: ["Full Day Coverage", "2 Photographers", "500+ Photos", "Candid + Group", "Highlight Reel", "Teaser Video"] },
                        ],
                        Decorator: [
                          { tier: "Basic",    guests: "20–40", items: ["Basic Backdrop", "Balloon Decor", "Table Decor", "Fairy Lights"] },
                          { tier: "Standard", guests: "40–80", items: ["Themed Backdrop", "Balloon & Floral", "Table & Entrance Decor", "Custom Signage", "Lighting Setup"] },
                          { tier: "Premium",  guests: "80+",   items: ["Premium Theme Decor", "Floral & Balloon Design", "Stage Setup", "Custom Installations", "Full Venue Styling"] },
                        ],
                        DJ: [
                          { tier: "Basic",    guests: "20–40", items: ["3 Hrs Set", "1 DJ", "Basic Sound System", "Standard Lighting"] },
                          { tier: "Standard", guests: "40–80", items: ["5 Hrs Set", "1 DJ", "Professional Sound", "LED Lighting", "Wireless Mic"] },
                          { tier: "Premium",  guests: "80+",   items: ["Full Event Coverage", "1 DJ + Assistant", "Premium Sound System", "Dance Floor Lighting", "Wireless Mics", "Fog Machine"] },
                        ],
                      };
                      const pkgs = PACKAGES[svcType] || (Object.keys(PACKAGES).length ? null : null);
                      if (!pkgs) return null;
                      return (
                        <div style={{ padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Send Package</div>
                          <button onClick={() => {
                            if (!selectedChat?._id || !adminSocketRef.current) return;
                            const lines = [
                              `[MCQ_PACKAGES:${svcType}]`,
                              `📦 *${svcType} Package Options*`,
                              `\nPlease choose a package that suits your event:\n`,
                              ...pkgs.map(({ tier, guests, items }, pi) =>
                                `${['1️⃣','2️⃣','3️⃣'][pi]} *${tier}* (${guests} guests)\n${items.map(i => `   • ${i}`).join('\n')}`
                              ),
                              `\nReply with 1, 2, or 3 to select your package.`,
                            ];
                            const msgText = lines.join('\n');
                            const m = { conversationId: selectedChat._id, sender: 'customer-care', content: msgText };
                            adminSocketRef.current.emit('send_message', m);
                            setCurrentConversation((prev) => [...(prev || []), { ...m, createdAt: new Date().toISOString() }]);
                          }}
                            style={{ display: "block", width: "100%", textAlign: "center", padding: "9px 10px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                          >
                            📦 Send Package Options
                          </button>
                          {svcType === "Caterer" && (
                            <button onClick={() => {
                              if (!selectedChat?._id || !adminSocketRef.current) return;
                              const conv = currentConversation || [];
                              const pkgMsg = [...conv].reverse().find(m =>
                                /I'd like the (Basic|Standard|Premium) package:/i.test(m.content || "") ||
                                /Package: (Basic|Standard|Premium)/i.test(m.content || "")
                              );
                              const pkgMatch = pkgMsg
                                ? (pkgMsg.content.match(/I'd like the (Basic|Standard|Premium) package:/i) ||
                                   pkgMsg.content.match(/Package: (Basic|Standard|Premium)/i))
                                : null;
                              const detectedPkg = pkgMatch ? pkgMatch[1] : "Free";
                              const payload = { pkg: detectedPkg, cuisines: ["North Indian","South Indian","Snacks","Chinese Starters","Punjabi","Sweets","Italian"] };
                              const msgText = `[FULL_MENU:${JSON.stringify(payload)}]`;
                              const m = { conversationId: selectedChat._id, sender: 'customer-care', content: msgText };
                              adminSocketRef.current.emit('send_message', m);
                              setCurrentConversation((prev) => [...(prev || []), { ...m, createdAt: new Date().toISOString() }]);
                            }}
                              style={{ display: "block", width: "100%", textAlign: "center", padding: "9px 10px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 6 }}
                            >
                              🍽️ Send Menu
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Share Photos */}
                    <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Share Photos</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 10px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "center" }}>
                          📷 From Device
                          <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                if (!selectedChat?._id || !adminSocketRef.current) return;
                                const content = `[img:${ev.target.result}]`;
                                const m = { conversationId: selectedChat._id, sender: 'customer-care', content };
                                adminSocketRef.current.emit('send_message', m);
                                setCurrentConversation(prev => [...(prev || []), { ...m, createdAt: new Date().toISOString() }]);
                              };
                              reader.readAsDataURL(file);
                            });
                            e.target.value = '';
                          }} />
                        </label>
                        <button onClick={() => {
                          setAdminGalleryOpen(true);
                          if (!adminGalleryPhotos.length) {
                            setAdminGalleryLoading(true);
                            fetch(`${BASE_URL}/gallery`)
                              .then(r => r.json())
                              .then(data => { setAdminGalleryPhotos((data.grouped?.["Decoration"] || []).filter(p => p.imageUrl)); setAdminGalleryLoading(false); })
                              .catch(() => setAdminGalleryLoading(false));
                          }
                        }}
                          style={{ display: "block", width: "100%", padding: "9px 10px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "center" }}>
                          🖼️ From Gallery
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary sidebar panel — always visible when a chat is selected */}
                  {selectedChat && (
                    <div style={{ width: 230, borderLeft: "1px solid rgba(196,122,46,0.15)", display: "flex", flexDirection: "column", background: "#fffbf5", flexShrink: 0 }}>

                      {/* Event details from customer */}
                      {(() => {
                        const ed = selectedChat.eventDetails || {};
                        const plan = eventPlans.find(p => p.customerId?._id?.toString() === selectedChat.customerId?._id?.toString());
                        const details = [
                          { label: "Type",     val: ed.eventType  || plan?.eventType },
                          { label: "Date",     val: ed.date       || plan?.date },
                          { label: "Location", val: ed.location   || plan?.location },
                          { label: "Guests",   val: ed.guests     || plan?.guests },
                          { label: "Budget",   val: ed.budget     || plan?.budget },
                        ].filter(d => d.val);
                        if (!details.length) return null;
                        return (
                          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>📅 Event Details</div>
                            {details.map(({ label, val }) => (
                              <div key={label} style={{ fontSize: 11.5, color: "#5a3a1a", marginBottom: 3 }}>
                                <span style={{ fontWeight: 700, color: "#9B7450" }}>{label}: </span>{val}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", fontWeight: 700, fontSize: 13, color: "#2C1A0E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>📌 Pinned</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#9B7450" }}>{currentPinned.length}</span>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {currentPinned.length === 0 && (
                          <p style={{ fontSize: 12, color: "#bbb", fontStyle: "italic", margin: 0 }}>Click 📌 on any message to pin it here</p>
                        )}
                        {currentPinned.map((m, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: "#5a3a1a", padding: "7px 10px", background: "#fff", borderRadius: 9, border: "1px solid rgba(196,122,46,0.12)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <span style={{ color: "#C47A2E", flexShrink: 0, marginTop: 1 }}>•</span>
                            <span style={{ flex: 1, lineHeight: 1.45, wordBreak: "break-word" }}>{m.content}</span>
                            <button onClick={() => unpinMessage(m.content)}
                              style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13, padding: 0, flexShrink: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                      {/* Pricing input — single vendor chats only */}
                      {selectedChat.serviceType !== "SmartPlan" && (
                      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>💰 Agreed Price</div>
                        <input
                          placeholder="Vendor name"
                          value={pricingVendorName}
                          onChange={e => setPricingVendorName(e.target.value)}
                          style={{ width: "100%", marginBottom: 6, padding: "6px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 12, fontFamily: "'Outfit', sans-serif", color: "#2C1A0E", outline: "none", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#9B7450", flexShrink: 0 }}>₹</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={pricingAmount}
                            onChange={e => setPricingAmount(e.target.value)}
                            style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#2C1A0E", outline: "none" }}
                          />
                        </div>
                        {pricingAmount > 0 && (
                          <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600, marginTop: 5 }}>
                            ₹{Number(pricingAmount).toLocaleString("en-IN")} — will appear on Review & Pay
                          </div>
                        )}
                      </div>
                      )}

                      {/* Per-category budget — Smart Plan chats only */}
                      {selectedChat.serviceType === "SmartPlan" && (
                        <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>💰 Budget per Category</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                            {Object.keys(categoryBudgets).map(cat => (
                              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#2C1A0E", minWidth: 80 }}>{cat}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", flexShrink: 0 }}>₹</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={categoryBudgets[cat]}
                                  onChange={e => setCategoryBudgetsState(prev => ({ ...prev, [cat]: e.target.value }))}
                                  style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#2C1A0E", outline: "none" }}
                                />
                              </div>
                            ))}
                            {Object.keys(categoryBudgets).length === 0 && (
                              <p style={{ fontSize: 11, color: "#bbb", fontStyle: "italic", margin: 0 }}>No categories found on this plan.</p>
                            )}
                          </div>
                          <button
                            onClick={saveCategoryBudgets}
                            disabled={savingCategoryBudgets}
                            style={{ width: "100%", padding: "8px 0", borderRadius: 9, border: "none", background: savingCategoryBudgets ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: savingCategoryBudgets ? "#9ca3af" : "#fff", fontSize: 12, fontWeight: 700, cursor: savingCategoryBudgets ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}
                          >
                            {savingCategoryBudgets ? "Saving…" : "📌 Pin Budget to Chat"}
                          </button>
                        </div>
                      )}

                      <button onClick={handleSummaryDone}
                        style={{ margin: "10px 12px 12px", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 3px 10px rgba(196,122,46,0.25)" }}>
                        Done ✓
                      </button>
                    </div>
                  )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm sm:text-base">
                    Select a conversation to start monitoring
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeDropdown === "chatsupport" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Chat - Users
            </div>

            <div className="min-h-[500px] sm:min-h-[600px] w-full bg-white border-2 border-[#CCAB4A] rounded-[16px] sm:rounded-[20px] flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
              {/* LEFT - User List */}
              <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-[#F1E1A8] overflow-y-auto max-h-[300px] sm:max-h-none">
                {supportChats.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedChat(c);
                      loadConversation(c._id);
                    }}
                    className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-[#FFF4D4] transition flex-col sm:flex-row text-center sm:text-left ${
                      selectedChat?.customerId.name === c.customerId.name
                        ? "bg-[#FFF4D4]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                        {getInitials(c.customerId.name)}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-semibold text-xs sm:text-base">
                          {c.customerId.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end text-xs sm:text-sm mt-2 sm:mt-0">
                      <span className="text-gray-500">
                        {formatTimeIST(c.updatedAt)}
                      </span>
                      {(() => { const h = hoursLeft(c); return h !== null && h <= 6 && !isClosed(c) ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: h <= 2 ? "#c0392b" : "#b45309" }}>
                          ⏳ {h === 0 ? "Expiring" : `${h}h left`}
                        </span>
                      ) : null; })()}
                      {isClosed(c) && <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "2px 7px", marginTop: 2 }}>🔒 Closed</span>}
                      <button
                        onClick={(e) => handleDeleteChat(e, c._id)}
                        style={{ fontSize: 10, fontWeight: 700, color: "#c0392b", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 6, padding: "2px 7px", cursor: "pointer", marginTop: 2 }}
                      >🗑</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT - Chat Window */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div className="p-3 sm:p-4 border-b border-[#F1E1A8] flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(selectedChat.customerId.name)}
                        </div>

                        <span className="font-semibold text-sm sm:text-lg">
                          {selectedChat.customerId.name}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatTimeIST(selectedChat.updatedAt)}
                        </span>
                        {activeDropdown !== "chatsupport" && (
                          <button
                            onClick={() => {
                              fetch(`${BASE_URL}/admin/conversations/${selectedChat._id}/close`, {
                                method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
                              }).then(r => { if (r.ok) { setSelectedChat(null); setCurrentConversation([]); } }).catch(() => {});
                            }}
                            style={{ padding: "4px 12px", borderRadius: 7, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c0392b", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}
                          >
                            ✕ Close Chat
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Event details strip */}
                    {selectedChat.eventDetails && Object.values(selectedChat.eventDetails).some(Boolean) && (
                      <div style={{ background: "#fffaf3", borderBottom: "1px solid #fde9c4", padding: "8px 16px", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#7a5c1e", fontFamily: "'Outfit', sans-serif" }}>
                        {selectedChat.eventDetails.eventName && <span><b>Event:</b> {selectedChat.eventDetails.eventName}</span>}
                        {selectedChat.eventDetails.eventType && <span><b>Type:</b> {selectedChat.eventDetails.eventType}</span>}
                        {selectedChat.eventDetails.date && <span><b>Date:</b> {selectedChat.eventDetails.date}</span>}
                        {selectedChat.eventDetails.location && <span><b>City:</b> {selectedChat.eventDetails.location}</span>}
                        {selectedChat.eventDetails.guests && <span><b>Guests:</b> {selectedChat.eventDetails.guests}</span>}
                        {selectedChat.eventDetails.budget && <span><b>Budget:</b> {selectedChat.eventDetails.budget}</span>}
                      </div>
                    )}

                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col space-y-2 sm:space-y-3">
                      {currentConversation && currentConversation.length > 0 && (
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                          {currentConversation.map((msg, index) => {
                            const msgText = msg.content || msg.text || "";
                            const isUser = msg.sender === "user";
                            const isPinned = currentPinned.some(m => m.content === msgText);
                            return (
                              <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 6, alignSelf: isUser ? "flex-start" : "flex-end" }}>
                                {activeDropdown !== "chatsupport" && (
                                  <button
                                    onClick={() => isPinned ? unpinMessage(msgText) : pinMessage(msgText)}
                                    title={isPinned ? "Unpin" : "Pin this message"}
                                    style={{ background: isPinned ? "rgba(196,122,46,0.15)" : "none", border: "none", cursor: "pointer", fontSize: 13, color: isPinned ? "#C47A2E" : "#ddd", padding: "4px 5px", borderRadius: 6, flexShrink: 0, marginTop: 4, lineHeight: 1 }}
                                  >📌</button>
                                )}
                                <div style={{
                                  background: isUser ? "#f3f4f6" : "#d08f4e",
                                  color: isUser ? "#1f2937" : "#ffffff",
                                  padding: "8px 14px", borderRadius: 14, maxWidth: "75%",
                                  fontSize: 14, fontFamily: "'Outfit', sans-serif", wordBreak: "break-word", lineHeight: 1.5,
                                }}>
                                  <span style={{ fontSize: 10, opacity: 0.65, display: "block", marginBottom: 3, fontWeight: 600 }}>
                                    {isUser ? "Customer" : "Admin"}
                                  </span>
                                  {msgText.startsWith("[img:") ? (
                                    <img src={msgText.replace("[img:", "").replace(/\]$/, "")} alt="sent" style={{ maxWidth: 200, borderRadius: 8, marginTop: 4 }} />
                                  ) : <RenderMessage text={msgText} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="p-2 sm:p-3 border-t border-[#F1E1A8] flex gap-2">
                      {/* Image upload */}
                      <label style={{ cursor: "pointer", flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb" }}>
                        📎
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !selectedChat) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const content = `[img:${ev.target.result}]`;
                            const msg = { conversationId: selectedChat._id, sender: 'customer-care', content };
                            if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                            setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }} />
                      </label>

                      <input
                        type="text"
                        value={adminMsgInput}
                        onChange={(e) => setAdminMsgInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && adminMsgInput.trim()) {
                            const msg = { conversationId: selectedChat._id, sender: 'customer-care', content: adminMsgInput.trim() };
                            if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                            setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                            setAdminMsgInput("");
                          }
                        }}
                        placeholder="Type a message and press Enter or Send..."
                        className="flex-1 px-3 sm:px-4 py-2 rounded-full border border-[#CCAB4A] focus:outline-none text-sm"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      />
                      <button
                        onClick={() => {
                          if (!adminMsgInput.trim() || !selectedChat) return;
                          const msg = { conversationId: selectedChat._id, sender: 'customer-care', content: adminMsgInput.trim() };
                          if (adminSocketRef.current) adminSocketRef.current.emit('send_message', msg);
                          setCurrentConversation((prev) => [...(prev || []), { ...msg, createdAt: new Date().toISOString() }]);
                          setAdminMsgInput("");
                        }}
                        className="px-3 sm:px-4 py-2 bg-[#CCAB4A] text-white rounded-full font-semibold hover:opacity-90 transition text-sm"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                  {/* Summary sidebar — only for concierge, not support */}
                  {currentPinned.length > 0 && activeDropdown !== "chatsupport" && (
                    <div style={{ width: 230, borderLeft: "1px solid rgba(196,122,46,0.15)", display: "flex", flexDirection: "column", background: "#fffbf5", flexShrink: 0 }}>
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", fontWeight: 700, fontSize: 13, color: "#2C1A0E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>📋 Summary</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#9B7450" }}>{currentPinned.length} pinned</span>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {currentPinned.map((m, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: "#5a3a1a", padding: "7px 10px", background: "#fff", borderRadius: 9, border: "1px solid rgba(196,122,46,0.12)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <span style={{ color: "#C47A2E", flexShrink: 0, marginTop: 1 }}>•</span>
                            <span style={{ flex: 1, lineHeight: 1.45, wordBreak: "break-word" }}>{m.content}</span>
                            <button onClick={() => unpinMessage(m.content)}
                              style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13, padding: 0, flexShrink: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSummaryDone}
                        style={{ margin: "10px 12px 12px", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                        Done ✓
                      </button>
                    </div>
                  )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm sm:text-base">
                    Select a user to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Gift Hampers Orders ── */}
        {activeDropdown === "gifthampers" && (() => {
          const selectedOrder = ghOrders.find(o => o._id === selectedGhId) || null;
          const editItems = selectedGhId ? (ghEdits[selectedGhId] ?? selectedOrder?.items ?? []) : [];

          const updateEditItem = (idx, field, value) => {
            const base = ghEdits[selectedGhId] ?? (selectedOrder?.items?.map(i => ({ ...i })) ?? []);
            const updated = base.map((item, i) => i === idx ? { ...item, [field]: value } : item);
            setGhEdits(prev => ({ ...prev, [selectedGhId]: updated }));
          };

          const saveVendorAssignment = async () => {
            if (!selectedGhId) return;
            setGhSaving(true);
            try {
              const items = ghEdits[selectedGhId] ?? selectedOrder?.items ?? [];
              const recalced = items.map(item => ({
                ...item,
                subtotal: (item.pricePerUnit || 0) * (Number(item.quantity) || 1),
              }));
              const newTotal = recalced.reduce((s, i) => s + (i.subtotal || 0), 0);
              await fetch(`${BASE_URL}/admin/gift-hamper-orders/${selectedGhId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
                body: JSON.stringify({ items: recalced, totalAmount: newTotal }),
              });
              setGhOrders(prev => prev.map(o => o._id === selectedGhId ? { ...o, items: recalced, totalAmount: newTotal } : o));
              setGhEdits(prev => { const n = { ...prev }; delete n[selectedGhId]; return n; });
              alert("Vendor details saved!");
            } catch(e) { alert("Save failed: " + e.message); }
            finally { setGhSaving(false); }
          };

          return (
            <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16, marginTop: 16 }}>
                <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl text-[#d08f4e]">🎁 Gift Hamper Orders</div>
                <button
                  onClick={async () => {
                    if (!window.confirm('Seed 5 sample gift hamper products + create vendor?')) return;
                    try {
                      const r = await fetch(`${BASE_URL}/admin/seed-gift-hamper-products`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
                      const d = await r.json();
                      if (d.error) { alert('Error: ' + d.error); return; }
                      alert((d.message || 'Done') + '\n' + (d.results || []).map(x => `• ${x.name}: ${x.status}`).join('\n'));
                    } catch(e) { alert('Request failed: ' + e.message); }
                  }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                >
                  🌱 Seed 5 Sample Products
                </button>
              </div>

              <div className="adm-section">
                <div className="adm-section-header">
                  <span className="adm-section-title">Gift Hamper Orders</span>
                  <span className="adm-section-count">{ghOrders.length}</span>
                </div>
              </div>
              {ghLoading ? (
                <p style={{ color: "#9B7450" }}>Loading orders…</p>
              ) : ghOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "2px solid #F1E1A8" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                  <p style={{ color: "#9B7450", fontSize: 16 }}>No gift hamper orders yet</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

                  {/* ── Left: Bookings ── */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7A5535", marginBottom: 10, letterSpacing: 0.5 }}>📋 BOOKINGS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ghOrders.map(order => {
                        const isSelected = order._id === selectedGhId;
                        return (
                          <div
                            key={order._id}
                            onClick={() => setSelectedGhId(isSelected ? null : order._id)}
                            style={{ background: "#fff", borderRadius: 12, border: isSelected ? "2px solid #C47A2E" : "2px solid #F1E1A8", padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s", boxShadow: isSelected ? "0 2px 12px rgba(196,122,46,0.15)" : "none" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: "#2C1A0E" }}>{order.customerName}</div>
                                <div style={{ fontSize: 12, color: "#9B7450" }}>📞 {order.customerPhone}</div>
                                <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>📦 {order.deliveryAddress}, {order.city}{order.pincode ? " – " + order.pincode : ""}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: "#C47A2E" }}>₹{order.totalAmount.toLocaleString("en-IN")}</div>
                                <div style={{ fontSize: 10, color: "#bbb" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <Badge status={order.status} />
                                {order.status === 'cancelled' && order.paymentStatus === 'pending' && (
                                  <span style={{ fontSize: 10, fontWeight: 600, color: "#9B7450", background: "#faf5ee", border: "1px solid #F1E1A8", borderRadius: 100, padding: "2px 8px" }}>Auto-expired (7 days)</span>
                                )}
                              </div>
                              <select
                                value={order.status}
                                onClick={e => e.stopPropagation()}
                                onChange={async (e) => {
                                  e.stopPropagation();
                                  await fetch(`${BASE_URL}/admin/gift-hamper-orders/${order._id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                    credentials: "include",
                                    body: JSON.stringify({ status: e.target.value }),
                                  });
                                  setGhOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: e.target.value } : o));
                                }}
                                style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid #F1E1A8", fontSize: 11, fontFamily: "'Outfit', sans-serif", cursor: "pointer", background: "#fffcf5" }}
                              >
                                {["pending","confirmed","processing","delivered","cancelled"].map(s => (
                                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Right: Vendor assignment ── */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7A5535", marginBottom: 10, letterSpacing: 0.5 }}>🏪 VENDOR ASSIGNMENT</div>
                    {!selectedOrder ? (
                      <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 12, border: "2px dashed #F1E1A8" }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>👈</div>
                        <p style={{ color: "#9B7450", fontSize: 13 }}>Select a booking to assign vendors & set quantities</p>
                      </div>
                    ) : (
                      <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #CCAB4A", padding: "16px 18px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#2C1A0E", marginBottom: 4 }}>{selectedOrder.customerName}'s order</div>
                        <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 14 }}>{editItems.length} item{editItems.length !== 1 ? "s" : ""}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {editItems.map((item, idx) => (
                            <div key={idx} style={{ background: "#faf5ee", borderRadius: 10, padding: "12px 14px", border: "1.5px solid #F1E1A8" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{item.productName}</div>
                                  <div style={{ fontSize: 11, color: "#9B7450" }}>{item.productNumber && `#${item.productNumber} · `}₹{item.pricePerUnit}/pc</div>
                                </div>
                                <div style={{ fontWeight: 700, color: "#C47A2E", fontSize: 13, flexShrink: 0 }}>
                                  ₹{((item.pricePerUnit || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                                </div>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                                <input
                                  type="text"
                                  placeholder="Vendor name"
                                  value={item.vendorName || ""}
                                  onChange={e => updateEditItem(idx, "vendorName", e.target.value)}
                                  style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #F1E1A8", fontSize: 12, fontFamily: "'Outfit', sans-serif", outline: "none", background: "#fff" }}
                                />
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 11, color: "#9B7450", whiteSpace: "nowrap" }}>Qty:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity || 1}
                                    onChange={e => updateEditItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ width: 60, padding: "6px 8px", borderRadius: 8, border: "1.5px solid #F1E1A8", fontSize: 12, fontFamily: "'Outfit', sans-serif", outline: "none", background: "#fff", textAlign: "center" }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: "#9B7450" }}>
                            Updated total: <strong style={{ color: "#C47A2E" }}>₹{editItems.reduce((s, i) => s + (i.pricePerUnit || 0) * (Number(i.quantity) || 1), 0).toLocaleString("en-IN")}</strong>
                          </div>
                          <button
                            disabled={ghSaving}
                            onClick={saveVendorAssignment}
                            style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 13, fontWeight: 700, cursor: ghSaving ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}
                          >
                            {ghSaving ? "Saving…" : "💾 Save Changes"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Sample Gift Hamper Photos ── */}
              <div style={{ marginTop: 32, background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px 22px" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>🖼️ Sample Gift Hamper Photos</div>
                <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 18 }}>These photos appear on the Gift Hampers customer page as downloadable reference images.</div>

                {/* Upload form */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 18, padding: "14px 16px", background: "#FFFCF7", borderRadius: 12, border: "1.5px dashed rgba(196,122,46,0.3)" }}>
                  <div style={{ flex: "1 1 180px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#7A5535", marginBottom: 5 }}>Photo Name</div>
                    <input
                      type="text"
                      placeholder="e.g. Luxury Birthday Hamper"
                      value={ghSampleName}
                      onChange={e => setGhSampleName(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: "#2C1A0E", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ flex: "1 1 160px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#7A5535", marginBottom: 5 }}>Photo File</div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: "pointer", fontSize: 12, color: "#7A5535", fontFamily: "'Outfit',sans-serif" }}>
                      📷 {ghSampleFile ? ghSampleFile.name.slice(0, 22) + (ghSampleFile.name.length > 22 ? "…" : "") : "Choose image"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setGhSampleFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <button
                    disabled={!ghSampleFile || ghSampleUploading}
                    onClick={async () => {
                      if (!ghSampleFile || ghSampleUploading) return;
                      setGhSampleUploading(true); setGhSampleMsg("");
                      const fd = new FormData();
                      fd.append("photo", ghSampleFile);
                      fd.append("name", ghSampleName.trim());
                      try {
                        const r = await fetch(`${BASE_URL}/admin/gift-hamper-samples`, {
                          method: "POST", headers: { Authorization: `Bearer ${token}` },
                          credentials: "include", body: fd,
                        });
                        const d = await r.json();
                        if (d.success) {
                          setGhSamples(prev => [d.sample, ...prev]);
                          setGhSampleFile(null); setGhSampleName("");
                          setGhSampleMsg("Uploaded!");
                        } else { setGhSampleMsg(d.error || "Upload failed."); }
                      } catch (e) { setGhSampleMsg(e.message); }
                      finally { setGhSampleUploading(false); setTimeout(() => setGhSampleMsg(""), 3000); }
                    }}
                    style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: !ghSampleFile || ghSampleUploading ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: !ghSampleFile || ghSampleUploading ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: !ghSampleFile || ghSampleUploading ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}
                  >{ghSampleUploading ? "Uploading…" : "✓ Upload"}</button>
                  {ghSampleMsg && <span style={{ fontSize: 12, color: ghSampleMsg.includes("fail") || ghSampleMsg.includes("Error") ? "#ef4444" : "#15803d", fontWeight: 600 }}>{ghSampleMsg}</span>}
                </div>

                {/* Samples grid */}
                {ghSamples.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "#9B7450", fontSize: 13, background: "#faf7f2", borderRadius: 10, border: "1.5px dashed rgba(196,122,46,0.2)" }}>
                    No sample photos uploaded yet. Add some above and they'll appear on the customer page.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                    {ghSamples.map(s => (
                      <div key={s._id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1.5px solid rgba(196,122,46,0.18)", background: "#faf5ee" }}>
                        <img src={s.url} alt={s.name || "Sample"} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                        {s.name && <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "#2C1A0E", lineHeight: 1.3 }}>{s.name}</div>}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Remove "${s.name || "this photo"}"?`)) return;
                            const r = await fetch(`${BASE_URL}/admin/gift-hamper-samples/${s._id}`, {
                              method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
                            });
                            if (r.ok) setGhSamples(prev => prev.filter(x => x._id !== s._id));
                          }}
                          style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* ── Invoices ── */}
        {activeDropdown === "invoices" && (() => {
          const F = "'Outfit', sans-serif";
          const GOLD = "#C47A2E"; const BROWN = "#2C1A0E";

          // All invoices: confirmed/completed plans + admin-created ones
          const planInvoices = eventPlans.filter(p => p.status === "in_progress" || p.status === "completed");
          const allRows = [
            ...customInvoices.map(c => ({ ...c, _source: "custom" })),
            ...planInvoices.map(p => ({ ...p, _source: "plan" })),
          ];
          const searchQ = invoiceSearch.trim().toLowerCase();
          const filtered = searchQ
            ? allRows.filter(r => {
                const name = r._source === "custom" ? r.customerName : (r.customerId?.name || "");
                return name.toLowerCase().includes(searchQ) ||
                  (r.eventType || "").toLowerCase().includes(searchQ) ||
                  (r.orderId || "").toLowerCase().includes(searchQ);
              })
            : allRows;

          const statusStyle = (s) => ({
            paid:    { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0", label:"✓ Paid" },
            pending: { bg:"#fffbeb", color:"#d97706", border:"#fde68a", label:"⏳ Pending" },
            partial: { bg:"#eff6ff", color:"#0369a1", border:"#bfdbfe", label:"◑ Partial" },
            completed: { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0", label:"✓ Completed" },
            in_progress: { bg:"#eff6ff", color:"#0369a1", border:"#bfdbfe", label:"⚡ Confirmed" },
          }[s] || { bg:"#F3F4F6", color:"#6B7280", border:"#E5E7EB", label: s || "—" });

          const inp = (val, onChange, ph, type="text", style={}) => (
            <input type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={ph}
              style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", boxSizing:"border-box", ...style }} />
          );

          return (
            <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto" style={{ fontFamily:F }}>

              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap", marginBottom:6, marginTop:16 }}>
                <div>
                  <h2 style={{ fontSize:28, fontWeight:900, color:GOLD, margin:"0 0 4px" }}>🧾 Invoices</h2>
                  <p style={{ fontSize:13, color:"#9B7450", margin:0 }}>Manage, edit and send invoices to customers.</p>
                </div>
                <button onClick={openCreateInvoice}
                  style={{ padding:"10px 22px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${GOLD},#CCAB4A)`, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:F, boxShadow:"0 4px 14px rgba(196,122,46,0.3)", whiteSpace:"nowrap" }}>
                  + Create Invoice
                </button>
              </div>

              {/* Search */}
              <div style={{ position:"relative", marginBottom:18 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔍</span>
                <input value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)}
                  placeholder="Search by customer name, event type or order ID…"
                  style={{ width:"100%", padding:"10px 14px 10px 36px", borderRadius:12, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", boxSizing:"border-box" }} />
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:"56px 24px", color:"#9B7450", background:"#fff", borderRadius:16, border:"1.5px solid #CCAB4A" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🧾</div>
                  <p style={{ fontSize:15, fontWeight:700, margin:"0 0 6px" }}>{invoiceSearch ? "No invoices match your search." : "No invoices yet."}</p>
                  <p style={{ fontSize:13, margin:0 }}>Create your first invoice using the button above.</p>
                </div>
              ) : (
                <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #CCAB4A", overflow:"hidden" }}>
                  {/* Desktop table */}
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:F }}>
                      <thead>
                        <tr style={{ background:"#fffaf0", borderBottom:"1.5px solid #CCAB4A" }}>
                          {["Customer","Event","Date","Amount","Order ID","Status","Actions"].map(h => (
                            <th key={h} style={{ padding:"10px 13px", textAlign:"left", fontSize:11, fontWeight:800, color:"#7A5535", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((row, i) => {
                          const isCustom = row._source === "custom";
                          const name   = isCustom ? row.customerName : (row.customerId?.name || "—");
                          const evType = isCustom ? row.eventType : (row.eventType || "—");
                          const date   = isCustom ? row.eventDate  : (row.date || "—");
                          const amount = isCustom ? invTotal(row)   : (row.totalAmount || 0);
                          const oid    = isCustom ? row.orderId     : (row.orderId || row._id?.slice(-8) || "—");
                          const stat   = isCustom ? (row.status || "paid") : row.status;
                          const ss     = statusStyle(stat);

                          return (
                            <tr key={row._id || row.orderId || i}
                              style={{ borderBottom: i < filtered.length-1 ? "1px solid rgba(204,171,74,0.12)" : "none", background: i%2===0 ? "#fffcf5" : "#fff" }}>
                              <td style={{ padding:"10px 13px", fontSize:13, fontWeight:700, color:BROWN, whiteSpace:"nowrap" }}>{name || "—"}</td>
                              <td style={{ padding:"10px 13px", fontSize:13, color:"#5a3a1a" }}>{evType || "—"}</td>
                              <td style={{ padding:"10px 13px", fontSize:13, color:"#5a3a1a", whiteSpace:"nowrap" }}>{date || "—"}</td>
                              <td style={{ padding:"10px 13px", fontSize:13, fontWeight:700, color:BROWN, whiteSpace:"nowrap" }}>
                                {amount ? `₹${Number(amount).toLocaleString("en-IN")}` : "—"}
                              </td>
                              <td style={{ padding:"10px 13px", fontSize:11, color:"#9B7450", fontFamily:"'Courier New',monospace" }}>{oid}</td>
                              <td style={{ padding:"10px 13px" }}>
                                <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>{ss.label}</span>
                              </td>
                              <td style={{ padding:"10px 13px" }}>
                                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                                  {/* Edit */}
                                  <button onClick={() => isCustom ? (setInvoiceForm(row), setInvoiceModal({ mode:"edit", planId: row.orderId })) : openEditInvoice(row)}
                                    style={{ padding:"5px 10px", borderRadius:8, border:"1.5px solid rgba(44,26,14,0.15)", background:"#fff", color:BROWN, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                                    ✏️ Edit
                                  </button>
                                  {/* Download */}
                                  <button disabled={pdfGenerating}
                                    onClick={() => isCustom ? downloadInvoiceFromForm(row) : (() => {
                                      setPdfGenerating(true);
                                      try { generateInvoicePDF({ eventSummary:{ eventType:row.eventType, date:row.date, location:row.location, guests:row.guests }, confirmedVendors:[], amount:row.totalAmount||0, orderId:row.orderId, paymentId:row.paymentId, userName:row.customerId?.name }); }
                                      finally { setPdfGenerating(false); }
                                    })()}
                                    style={{ padding:"5px 10px", borderRadius:8, border:"1.5px solid rgba(196,122,46,0.3)", background:"#fffcf5", color:GOLD, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                                    🧾 PDF
                                  </button>
                                  {/* WhatsApp */}
                                  <button
                                    onClick={() => {
                                      const form = isCustom ? row : {
                                        customerName: row.customerId?.name || "", phone: row.customerId?.phoneNumber || "",
                                        eventType: row.eventType || "", eventDate: row.date || "",
                                        orderId: row.orderId || "", totalOverride: String(row.totalAmount || 0),
                                        services:[], status:"paid",
                                      };
                                      whatsAppInvoice(form);
                                    }}
                                    style={{ padding:"5px 10px", borderRadius:8, border:"1.5px solid #22c55e30", background:"#f0fdf4", color:"#15803d", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                                    📲 WhatsApp
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Create / Edit Invoice Modal ──────────────────────────────── */}
              {invoiceModal && (
                <>
                  <div onClick={() => setInvoiceModal(null)}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, backdropFilter:"blur(3px)" }} />
                  <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                    width:"min(96vw,640px)", maxHeight:"90vh", overflowY:"auto",
                    background:"#FFFCF5", borderRadius:20, zIndex:1001, fontFamily:F,
                    boxShadow:"0 28px 70px rgba(0,0,0,0.22)" }}>

                    {/* Modal header */}
                    <div style={{ padding:"18px 22px 16px", borderBottom:"1.5px solid rgba(44,26,14,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#FFFCF5", zIndex:2 }}>
                      <div>
                        <h3 style={{ fontSize:17, fontWeight:900, color:BROWN, margin:0 }}>
                          {invoiceModal.mode === "create" ? "Create New Invoice" : "Edit Invoice"}
                        </h3>
                        <p style={{ fontSize:12, color:"#9B7450", margin:"3px 0 0" }}>
                          {invoiceModal.mode === "create" ? "Fill in the details to generate a downloadable invoice." : "Make changes and re-download or re-send."}
                        </p>
                      </div>
                      <button onClick={() => setInvoiceModal(null)}
                        style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid rgba(44,26,14,0.12)", background:"#fff", color:"#9B7450", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>×</button>
                    </div>

                    <div style={{ padding:"20px 22px 24px" }}>
                      {/* Row helper */}
                      {(() => {
                        const label = (t) => <label style={{ fontSize:12, fontWeight:700, color:BROWN, display:"block", marginBottom:5 }}>{t}</label>;
                        const row2  = (a,b) => (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>{a}{b}</div>
                        );

                        return (
                          <>
                            {/* Customer */}
                            <p style={{ fontSize:11, fontWeight:800, color:GOLD, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 10px" }}>Customer</p>
                            {row2(
                              <div>{label("Name")}{inp(invoiceForm.customerName, v => invFieldSet("customerName",v), "Customer name")}</div>,
                              <div>{label("Phone (WhatsApp)")}{inp(invoiceForm.phone, v => invFieldSet("phone",v), "e.g. 9XXXXXXXXX")}</div>
                            )}

                            {/* Event */}
                            <p style={{ fontSize:11, fontWeight:800, color:GOLD, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 10px" }}>Event Details</p>
                            {row2(
                              <div>{label("Event Type")}{inp(invoiceForm.eventType, v => invFieldSet("eventType",v), "e.g. Wedding")}</div>,
                              <div>{label("Date")}{inp(invoiceForm.eventDate, v => invFieldSet("eventDate",v), "", "date")}</div>
                            )}
                            {row2(
                              <div>{label("Location")}{inp(invoiceForm.location, v => invFieldSet("location",v), "Venue / City")}</div>,
                              <div>{label("Guests")}{inp(invoiceForm.guests, v => invFieldSet("guests",v), "e.g. 200")}</div>
                            )}

                            {/* Invoice IDs + Status */}
                            <p style={{ fontSize:11, fontWeight:800, color:GOLD, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 10px" }}>Invoice Info</p>
                            {row2(
                              <div>{label("Order / Invoice ID")}{inp(invoiceForm.orderId, v => invFieldSet("orderId",v), "INV-XXXXX")}</div>,
                              <div>{label("Payment ID")}{inp(invoiceForm.paymentId, v => invFieldSet("paymentId",v), "Optional")}</div>
                            )}
                            <div style={{ marginBottom:14 }}>
                              {label("Status")}
                              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                {[["paid","✓ Paid","#15803d","#f0fdf4"],["pending","⏳ Pending","#d97706","#fffbeb"],["partial","◑ Partial","#0369a1","#eff6ff"]].map(([k,l,c,bg]) => (
                                  <button key={k} onClick={() => invFieldSet("status",k)}
                                    style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${invoiceForm.status===k ? c : "rgba(44,26,14,0.1)"}`,
                                      background: invoiceForm.status===k ? bg : "#fff",
                                      color: invoiceForm.status===k ? c : "#9B7450",
                                      fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                                    {l}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Services */}
                            <p style={{ fontSize:11, fontWeight:800, color:GOLD, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 10px" }}>Services</p>
                            <div style={{ background:"rgba(196,122,46,0.04)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
                              {invoiceForm.services?.map((sv, i) => (
                                <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                                  <input value={sv.category} onChange={e => invServiceSet(i,"category",e.target.value)}
                                    placeholder="Service (e.g. Catering)"
                                    style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, outline:"none" }} />
                                  <input type="number" value={sv.amount} onChange={e => invServiceSet(i,"amount",e.target.value)}
                                    placeholder="₹ Amount"
                                    style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, outline:"none" }} />
                                  <button onClick={() => invServiceRemove(i)}
                                    style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#FEF2F2", color:"#DC2626", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
                                </div>
                              ))}
                              <button onClick={invServiceAdd}
                                style={{ fontSize:12, fontWeight:700, color:GOLD, background:"none", border:"none", cursor:"pointer", fontFamily:F, padding:"2px 0" }}>
                                + Add Service
                              </button>
                            </div>

                            {/* Total */}
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
                              <div>
                                {label("Total Override (optional)")}
                                <input type="number" value={invoiceForm.totalOverride} onChange={e => invFieldSet("totalOverride",e.target.value)}
                                  placeholder="Auto-calculated from services"
                                  style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", boxSizing:"border-box" }} />
                              </div>
                              <div style={{ background:"linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius:12, padding:"12px 16px", textAlign:"center" }}>
                                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:3, fontWeight:700 }}>TOTAL AMOUNT</div>
                                <div style={{ fontSize:20, fontWeight:900, color:"#CCAB4A" }}>
                                  ₹{Number(invTotal(invoiceForm)).toLocaleString("en-IN")}
                                </div>
                              </div>
                            </div>

                            {/* Notes */}
                            <div style={{ marginBottom:20 }}>
                              {label("Notes (optional)")}
                              <textarea value={invoiceForm.notes||""} onChange={e => invFieldSet("notes",e.target.value)}
                                rows={2} placeholder="Any additional notes for this invoice…"
                                style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
                            </div>

                            {/* Action buttons */}
                            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                              <button onClick={() => downloadInvoiceFromForm(invoiceForm)} disabled={pdfGenerating}
                                style={{ flex:1, minWidth:140, padding:"12px", borderRadius:12, border:"1.5px solid rgba(196,122,46,0.3)", background:"#fffcf5", color:GOLD, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:F }}>
                                🧾 Download PDF
                              </button>
                              <button onClick={() => whatsAppInvoice(invoiceForm)}
                                style={{ flex:1, minWidth:140, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:F, boxShadow:"0 4px 14px rgba(34,197,94,0.3)" }}>
                                📲 Send WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  if (invoiceModal.mode === "create") {
                                    setCustomInvoices(prev => [{ ...invoiceForm, _id:`cust-${Date.now()}` }, ...prev]);
                                  } else {
                                    setCustomInvoices(prev => prev.map(c => c.orderId === invoiceModal.planId ? { ...invoiceForm } : c));
                                  }
                                  setInvoiceModal(null);
                                }}
                                style={{ flex:1, minWidth:140, padding:"12px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${GOLD},#CCAB4A)`, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:F, boxShadow:"0 4px 14px rgba(196,122,46,0.3)" }}>
                                {invoiceModal.mode === "create" ? "Save Invoice" : "Save Changes"}
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

            </div>
          );
        })()}

        {/* ── Photos ── */}
        {activeDropdown === "photos" && (() => {
          const GALLERY_CATEGORIES = ['Decoration', 'Entertainment', 'Catering', 'Photography', 'Full Event Setup', 'Corporate Events'];
          const DECOR_THEMES = ['Floral', 'Balloon Art', 'Lighting', 'Themed Decoration', 'Traditional', 'Modern', 'Rustic', 'Minimalist'];

          if (!galleryLoaded) {
            fetch(`${BASE_URL}/admin/gallery`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
              .then(r => r.ok ? r.json() : { photos: [] })
              .then(d => { setGalleryPhotos(d.photos || []); setGalleryLoaded(true); })
              .catch(() => setGalleryLoaded(true));
          }

          const grouped = {};
          GALLERY_CATEGORIES.forEach(cat => { grouped[cat] = []; });
          galleryPhotos.forEach(p => { if (grouped[p.category]) grouped[p.category].push(p); });

          const getMeta = (cat) => galleryUploadMeta[cat] || { theme: '', caption: '' };
          const setMeta = (cat, field, val) =>
            setGalleryUploadMeta(prev => ({ ...prev, [cat]: { ...getMeta(cat), [field]: val } }));

          const handleUpload = async (category, file) => {
            if (!file) return;
            setGalleryUploading(true);
            try {
              const meta = getMeta(category);
              const fd = new FormData();
              fd.append('photo', file);
              fd.append('category', category);
              if (meta.theme) fd.append('theme', meta.theme);
              if (meta.caption) fd.append('caption', meta.caption);
              const res = await fetch(`${BASE_URL}/admin/gallery/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
                body: fd,
              });
              const data = await res.json();
              if (data.photo) setGalleryPhotos(prev => [data.photo, ...prev]);
            } catch (e) {
              alert('Upload failed: ' + e.message);
            } finally {
              setGalleryUploading(false);
            }
          };

          const handleDelete = async (photoId) => {
            if (!window.confirm('Delete this photo?')) return;
            try {
              const res = await fetch(`${BASE_URL}/admin/gallery/${photoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
              });
              if (res.ok) setGalleryPhotos(prev => prev.filter(p => p._id !== photoId));
            } catch (e) {
              alert('Delete failed: ' + e.message);
            }
          };

          return (
            <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
              <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl text-[#d08f4e] my-4">
                📸 Gallery Photos
              </div>
              <p style={{ fontSize: 14, color: "#9B7450", marginBottom: 28 }}>
                Upload photos per category. For Decoration photos, tag a theme so they appear in the Decor Finder.
              </p>

              {!galleryLoaded ? (
                <div style={{ textAlign: "center", padding: 48, color: "#9B7450" }}>Loading...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                  {GALLERY_CATEGORIES.map(cat => (
                    <div key={cat}>
                      {/* Category header */}
                      <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid rgba(196,122,46,0.18)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <span style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", fontFamily: "'Outfit', sans-serif" }}>{cat}</span>
                            <span style={{ marginLeft: 10, fontSize: 12, color: "#9B7450" }}>{grouped[cat].length} photo{grouped[cat].length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        {/* Upload controls row */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {cat === "Decoration" && (
                            <select
                              value={getMeta(cat).theme}
                              onChange={e => setMeta(cat, 'theme', e.target.value)}
                              style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", fontSize: 13, color: getMeta(cat).theme ? "#2C1A0E" : "#9B7450", fontFamily: "'Outfit', sans-serif", cursor: "pointer", outline: "none" }}
                            >
                              <option value="">Decor theme (optional)</option>
                              {DECOR_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          )}
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={getMeta(cat).caption}
                            onChange={e => setMeta(cat, 'caption', e.target.value)}
                            style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", fontSize: 13, color: "#2C1A0E", fontFamily: "'Outfit', sans-serif", outline: "none", minWidth: 160, flex: 1 }}
                          />
                          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, background: galleryUploading ? "#f3f4f6" : "linear-gradient(135deg,#2C1A0E,#4A2810)", color: galleryUploading ? "#bbb" : "#CCAB4A", fontSize: 13, fontWeight: 700, cursor: galleryUploading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", userSelect: "none", flexShrink: 0 }}>
                            {galleryUploading ? "Uploading…" : "+ Add Photo"}
                            <input
                              type="file" accept="image/*" style={{ display: "none" }}
                              disabled={galleryUploading}
                              onChange={e => { if (e.target.files[0]) { handleUpload(cat, e.target.files[0]); e.target.value = ""; } }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Photo grid */}
                      {grouped[cat].length === 0 ? (
                        <div style={{ padding: "24px 16px", borderRadius: 12, border: "2px dashed rgba(196,122,46,0.2)", textAlign: "center", color: "#C4A882", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                          No photos yet — upload the first one
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                          {grouped[cat].map(photo => (
                            <div key={photo._id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#eee", aspectRatio: "3/2", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                              onMouseEnter={e => e.currentTarget.querySelector(".del-btn").style.opacity = "1"}
                              onMouseLeave={e => e.currentTarget.querySelector(".del-btn").style.opacity = "0"}
                            >
                              <img src={photo.imageUrl} alt={photo.caption || cat}
                                onClick={() => setViewingPhoto(photo.imageUrl)}
                                style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", display: "block" }}
                              />
                              {/* Theme badge */}
                              {photo.theme && (
                                <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(196,122,46,0.85)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, fontFamily: "'Outfit', sans-serif" }}>
                                  {photo.theme}
                                </div>
                              )}
                              {(photo.caption || photo.theme) && (
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "12px 8px 6px", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                                  {photo.caption}
                                </div>
                              )}
                              <button className="del-btn" onClick={() => handleDelete(photo._id)}
                                style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}>
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Reviews ── */}
        {activeDropdown === "reviews" && (() => {
          // Lazy-load reviews when section becomes active
          if (!reviewsLoaded) {
            fetch(`${BASE_URL}/admin/reviews`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
              .then(r => r.ok ? r.json() : { reviews: [] })
              .then(d => { setReviews(d.reviews || []); setReviewsLoaded(true); })
              .catch(() => setReviewsLoaded(true));
          }

          const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

          return (
            <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
              <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl text-[#d08f4e] my-4">
                ⭐ Customer Reviews
              </div>

              {/* Sub-tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {[["reviews", "⭐ Reviews"], ["upcoming", "🎉 Upcoming Leads"]].map(([tab, label]) => {
                  const count = tab === "upcoming" ? reviews.filter(r => r.upcomingEventType || r.upcomingWhatsApp).length : reviews.length;
                  return (
                    <button key={tab} onClick={() => setReviewSubTab(tab)}
                      style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer", border: "1.5px solid", transition: "all 0.18s",
                        borderColor: reviewSubTab === tab ? "#C47A2E" : "rgba(139,69,19,0.2)",
                        background: reviewSubTab === tab ? "#C47A2E" : "#fff",
                        color: reviewSubTab === tab ? "#fff" : "#6B3A1F",
                      }}>
                      {label} <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 700, background: reviewSubTab === tab ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: reviewSubTab === tab ? "#fff" : "#C47A2E", borderRadius: 100, padding: "1px 7px" }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {!reviewsLoaded ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B7450" }}>Loading reviews…</div>
              ) : reviewSubTab === "upcoming" ? (
                (() => {
                  const leads = reviews.filter(r => r.upcomingEventType || r.upcomingWhatsApp);
                  if (!leads.length) return (
                    <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                      <p style={{ color: "#9B7450", fontSize: 16 }}>No upcoming event leads yet. They'll appear here when customers mention their next event in the review form.</p>
                    </div>
                  );
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {leads.map(r => (
                        <div key={r._id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                            {(r.customerName || "?")[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>{r.customerName || "Anonymous"}</div>
                            <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 8 }}>Reviewed {r.eventType || "an event"} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {r.upcomingEventType && <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "rgba(196,122,46,0.08)", color: "#7A5535", border: "1px solid rgba(196,122,46,0.18)", fontWeight: 600 }}>🎊 {r.upcomingEventType}</span>}
                              {r.upcomingDate && <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "rgba(196,122,46,0.08)", color: "#7A5535", border: "1px solid rgba(196,122,46,0.18)", fontWeight: 600 }}>📅 {r.upcomingDate}</span>}
                              {r.upcomingWhatsApp && (
                                <a href={`https://wa.me/${r.upcomingWhatsApp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", fontWeight: 600, textDecoration: "none" }}>
                                  📱 {r.upcomingWhatsApp}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
                  <p style={{ color: "#9B7450", fontSize: 16 }}>No reviews yet. Share the review link with customers after their event.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.18)", padding: "20px 24px", boxShadow: "0 2px 12px rgba(44,26,14,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                            {(r.customerName || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{r.customerName || "Anonymous"}</div>
                            {r.eventType && <div style={{ fontSize: 12, color: "#9B7450" }}>{r.eventType}</div>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, color: "#CCAB4A", letterSpacing: 1 }}>{stars(r.overallRating || 0)}</div>
                          <div style={{ fontSize: 10, color: "#9B7450", marginTop: 2 }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""}
                          </div>
                        </div>
                      </div>

                      {r.reviewText && (
                        <p style={{ fontSize: 13.5, color: "#5a3a1a", lineHeight: 1.65, margin: "0 0 12px", fontStyle: "italic" }}>
                          "{r.reviewText}"
                        </p>
                      )}

                      {/* Per-vendor ratings */}
                      {r.vendorRatings && Object.keys(r.vendorRatings).length > 0 && (
                        <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {Object.entries(r.vendorRatings).map(([vendor, rating]) => (
                            <span key={vendor} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(196,122,46,0.08)", color: "#7A5535", border: "1px solid rgba(196,122,46,0.18)", fontWeight: 600 }}>
                              {vendor}: {"★".repeat(rating)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Photos */}
                      {r.photos?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>📸 Event Photos</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {r.photos.map((url, pi) => (
                              <img
                                key={pi} src={url} alt="" onClick={() => setViewingPhoto(url)}
                                style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", cursor: "pointer", border: "1.5px solid rgba(196,122,46,0.2)", transition: "transform 0.15s" }}
                                onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                                onMouseLeave={e => e.target.style.transform = "scale(1)"}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Smart Plans ── */}
        {activeDropdown === "smartplans" && (() => {
          if (!smartPlansLoaded) {
            fetch(`${BASE_URL}/admin/smart-plans`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include',
            })
              .then(r => r.ok ? r.json() : { plans: [] })
              .then(d => { setSmartPlans(d.plans || []); setSmartPlansLoaded(true); })
              .catch(() => setSmartPlansLoaded(true));
          }

          const CAT_EMOJI = { Caterer: '🍽️', Decorator: '🎨', Photographer: '📸', DJ: '🎵' };

          const handleStatusChange = async (planId, category, status) => {
            try {
              const res = await fetch(`${BASE_URL}/admin/smart-plans/${planId}/vendor-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                credentials: 'include',
                body: JSON.stringify({ category, status }),
              });
              const data = await res.json();
              if (data.plan) {
                setSmartPlans(prev => prev.map(p => p._id === planId ? data.plan : p));
              }
            } catch (e) { console.error(e); }
          };

          return (
            <div style={{ padding: "28px 32px", maxWidth: 860, margin: "0 auto" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px", fontFamily: "'Outfit', sans-serif" }}>🗂 Smart Plans</h2>
              <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 24px", fontFamily: "'Outfit', sans-serif" }}>Customers who submitted a curated vendor package via Smart Planner</p>

              {!smartPlansLoaded ? (
                <div style={{ padding: 48, textAlign: "center", color: "#C47A2E", fontFamily: "'Outfit', sans-serif" }}>Loading…</div>
              ) : smartPlans.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center", color: "#bbb", fontFamily: "'Outfit', sans-serif" }}>No smart plans submitted yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {smartPlans.map(plan => {
                    const ed = plan.eventDetails || {};
                    const isExp = smartPlanExpanded === plan._id;
                    return (
                      <div key={plan._id} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)", overflow: "hidden", fontFamily: "'Outfit', sans-serif" }}>

                        {/* Header row */}
                        <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>
                              {plan.customerName || "Guest"}
                              {plan.customerPhone && <span style={{ fontSize: 12, fontWeight: 500, color: "#9B7450", marginLeft: 10 }}>📞 {plan.customerPhone}</span>}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                              {ed.eventType && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(196,122,46,0.1)", color: "#7A5535", fontWeight: 600 }}>{ed.eventType}</span>}
                              {ed.date && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(196,122,46,0.07)", color: "#7A5535" }}>📅 {ed.date}</span>}
                              {ed.location && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(196,122,46,0.07)", color: "#7A5535" }}>📍 {ed.location}</span>}
                              {ed.guests && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(196,122,46,0.07)", color: "#7A5535" }}>👥 {ed.guests} guests</span>}
                              {(ed.budget || ed.totalBudget) && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(196,122,46,0.07)", color: "#7A5535" }}>💰 ₹{(ed.totalBudget || ed.budget || '').toLocaleString()}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => setSmartPlanExpanded(isExp ? null : plan._id)}
                            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            {isExp ? "▲ Collapse" : "▼ Details"}
                          </button>
                        </div>

                        {/* Vendor slots — names and budgets only, no status */}
                        <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", padding: "10px 22px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(plan.vendorSlots || []).map((slot, si) => (
                            <div key={si} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.15)" }}>
                              <span style={{ fontSize: 15 }}>{CAT_EMOJI[slot.category] || '🏷️'}</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{slot.vendorName || "—"}</div>
                                <div style={{ fontSize: 10, color: "#9B7450" }}>{slot.category} · ₹{(slot.estimatedCost || 0).toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Expanded wizard answers */}
                        {isExp && plan.wizardAnswers && Object.keys(plan.wizardAnswers).length > 0 && (
                          <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", padding: "14px 22px", background: "rgba(196,122,46,0.03)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Event Brief</div>
                            {Object.entries(plan.wizardAnswers).map(([key, val]) => (
                              <div key={key} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                                <span style={{ color: "#9B7450", minWidth: 140, textTransform: "capitalize" }}>{key.replace(/_/g, ' ')}:</span>
                                <span style={{ color: "#2C1A0E", fontWeight: 500 }}>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Budget per category — only for accepted plans with vendor slots */}
                        {isExp && plan.status === 'active' && (plan.vendorSlots || []).length > 0 && (() => {
                          const planBudgets = smartPlanBudgets[plan._id] || {};
                          // Init defaults from estimatedCost if not set
                          const slots = plan.vendorSlots || [];
                          const isPinning = !!budgetPinning[plan._id];
                          return (
                            <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", padding: "14px 22px", background: "rgba(196,122,46,0.02)" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>📌 Set Budget per Category</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                                {slots.map((slot, si) => {
                                  const cat = slot.category;
                                  const val = planBudgets[cat] !== undefined ? planBudgets[cat] : (slot.estimatedCost || '');
                                  return (
                                    <div key={si} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      <span style={{ fontSize: 13, color: "#2C1A0E", fontWeight: 600, minWidth: 110 }}>{cat}</span>
                                      <input
                                        type="number"
                                        placeholder={`₹${(slot.estimatedCost || 0).toLocaleString('en-IN')}`}
                                        value={val}
                                        onChange={e => setSmartPlanBudgets(prev => ({ ...prev, [plan._id]: { ...(prev[plan._id] || {}), [cat]: Number(e.target.value) || '' } }))}
                                        style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: "none" }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              <button
                                disabled={isPinning}
                                onClick={async () => {
                                  setBudgetPinning(prev => ({ ...prev, [plan._id]: true }));
                                  const budgets = planBudgets;
                                  const categoryBudgets = slots.map(s => ({
                                    category: s.category,
                                    amount: budgets[s.category] !== undefined ? Number(budgets[s.category]) : (s.estimatedCost || 0),
                                  }));
                                  try {
                                    await fetch(`${BASE_URL}/smart-plans/${plan._id}/pin-budget`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      credentials: 'include',
                                      body: JSON.stringify({ categoryBudgets }),
                                    });
                                  } catch (e) { console.error(e); }
                                  setBudgetPinning(prev => ({ ...prev, [plan._id]: false }));
                                }}
                                style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: isPinning ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: isPinning ? "#9ca3af" : "#fff", fontSize: 12, fontWeight: 700, cursor: isPinning ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}
                              >
                                {isPinning ? "Pinning…" : "📌 Pin Budget to Chat"}
                              </button>
                            </div>
                          );
                        })()}

                        {/* Actions row */}
                        <div style={{ padding: "10px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: "#bbb" }}>
                              Submitted {new Date(plan.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {plan.status === 'pending' && <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 100, padding: "2px 10px" }}>Pending</span>}
                            {plan.status === 'active' && <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 100, padding: "2px 10px" }}>✓ Accepted</span>}
                            {plan.status === 'cancelled' && <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 100, padding: "2px 10px" }}>Rejected</span>}
                            {plan.status === 'completed' && <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 8, padding: "7px 12px" }}>✓ Paid</span>}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {/* Accept / Reject — only show when pending */}
                            {plan.status === 'pending' && (<>
                              <button
                                onClick={async () => {
                                  try {
                                    await fetch(`${BASE_URL}/smart-plans/${plan._id}/accept`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
                                    setSmartPlans(prev => prev.map(p => p._id === plan._id ? { ...p, status: 'active' } : p));
                                    if (plan.conversationId) { setPendingConciergeId(plan.conversationId.toString()); reloadConversations(); setactiveDropdown('chat'); }
                                  } catch (e) { console.error(e); }
                                }}
                                style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                ✓ Accept
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Reject this plan? The customer will be notified in chat.`)) return;
                                  try {
                                    await fetch(`${BASE_URL}/smart-plans/${plan._id}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
                                    setSmartPlans(prev => prev.map(p => p._id === plan._id ? { ...p, status: 'cancelled' } : p));
                                  } catch (e) { console.error(e); }
                                }}
                                style={{ padding: "7px 16px", borderRadius: 9, border: "1.5px solid rgba(220,38,38,0.3)", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                ✕ Reject
                              </button>
                            </>)}
                            {/* Open Chat */}
                            {plan.conversationId && (
                              <button
                                onClick={() => { setPendingConciergeId(plan.conversationId.toString()); reloadConversations(); setactiveDropdown('chat'); }}
                                style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "rgba(196,122,46,0.1)", color: "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                💬 Open Chat
                              </button>
                            )}
                            {/* Mark Payment Done */}
                            {plan.status === 'active' && (
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Mark payment done for ${plan.customerName || 'this customer'}?`)) return;
                                  try {
                                    await fetch(`${BASE_URL}/admin/smart-plans/${plan._id}/mark-payment`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
                                    setSmartPlans(prev => prev.map(p => p._id === plan._id ? { ...p, status: 'completed' } : p));
                                  } catch (e) { console.error(e); }
                                }}
                                style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#0369a1", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                💳 Mark Payment Done
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Stationery ── */}
        {activeDropdown === "stationery" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] overflow-y-auto">
            <StationeryAdminTab />
          </div>
        )}

        {/* ── Recommendation Intelligence ── */}
        {activeDropdown === "recommendations" && <RecommendationIntelligenceTab />}

        {/* ── Community Moderation ── */}
        {activeDropdown === "community" && <CommunityModerationTab />}

        {/* ── Event Day Messages ── */}
        {activeDropdown === "eventday" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <EventDayTab token={token} BASE_URL={BASE_URL} />
          </div>
        )}

        {/* ── Ebooks ── */}
        {activeDropdown === "ebooks" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <EbooksAdminTab />
          </div>
        )}

        {/* ── LAUNCH TAB ── */}
        {activeDropdown === "launch" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#0d0d0d] border-l-2 border-[#CCAB4A] overflow-y-auto" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
            <div style={{ textAlign: "center", padding: "48px 32px", fontFamily: "'Outfit', sans-serif", maxWidth: 540 }}>

              {/* Status badge */}
              <div style={{ marginBottom: 32 }}>
                {siteIsLive === null ? (
                  <span style={{ fontSize: 13, color: "#666" }}>Checking status…</span>
                ) : siteIsLive ? (
                  <span style={{ fontSize: 13, fontWeight: 700, background: "rgba(21,128,61,0.15)", color: "#15803d", border: "1.5px solid rgba(21,128,61,0.3)", borderRadius: 100, padding: "6px 18px" }}>
                    🟢 tendr.co.in is LIVE
                  </span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, background: "rgba(196,122,46,0.12)", color: "#C47A2E", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 100, padding: "6px 18px" }}>
                    🔴 Coming Soon (not live yet)
                  </span>
                )}
              </div>

              {/* Logo / title */}
              <div style={{ fontSize: "clamp(36px, 8vw, 64px)", fontWeight: 900, color: "#CCAB4A", letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1 }}>
                tendr
              </div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 48, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                launch control
              </div>

              {/* Launch / Revert button */}
              {!siteIsLive ? (
                <button
                  onClick={handleLaunch}
                  disabled={launchLoading}
                  style={{
                    padding: "20px 56px", borderRadius: 18, border: "none",
                    background: launchLoading ? "#333" : "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                    color: "#fff", fontSize: 22, fontWeight: 900, cursor: launchLoading ? "wait" : "pointer",
                    fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em",
                    boxShadow: launchLoading ? "none" : "0 8px 40px rgba(196,122,46,0.5)",
                    transition: "all 0.2s", transform: launchLoading ? "scale(0.97)" : "scale(1)",
                  }}
                  onMouseEnter={e => { if (!launchLoading) e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {launchLoading ? "Launching…" : "🚀 Launch tendr.co.in"}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                  <div style={{ fontSize: 48 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#CCAB4A" }}>tendr.co.in is live!</div>
                  <button
                    onClick={handleRevertLaunch}
                    disabled={launchLoading}
                    style={{
                      padding: "12px 32px", borderRadius: 12, border: "1.5px solid rgba(192,57,43,0.4)",
                      background: "rgba(192,57,43,0.1)", color: "#c0392b",
                      fontSize: 14, fontWeight: 700, cursor: launchLoading ? "wait" : "pointer",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {launchLoading ? "Reverting…" : "⏸ Take Offline (Coming Soon)"}
                  </button>
                </div>
              )}

              <div style={{ marginTop: 40, fontSize: 12, color: "#444", lineHeight: 1.7 }}>
                Launching makes <span style={{ color: "#CCAB4A" }}>tendr.co.in</span> show the full app to everyone.<br />
                You can toggle it back to Coming Soon anytime.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>

    {/* ── Photo viewer modal ── */}
    {viewingPhoto && (
      <>
        <div onClick={() => setViewingPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 3000, cursor: "zoom-out" }} />
        <img src={viewingPhoto} alt="" onClick={() => setViewingPhoto(null)}
          style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", maxWidth: "90vw", maxHeight: "88vh", borderRadius: 12, zIndex: 3001, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", cursor: "zoom-out" }} />
      </>
    )}
    {/* ── Booking Summary Modal ── */}
    {showSummaryModal && selectedChat && (
      <>
        <div onClick={() => setShowSummaryModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, backdropFilter: "blur(3px)" }} />
        <div style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "#FFFCF5", borderRadius: 20, boxShadow: "0 24px 64px rgba(139,69,19,0.2)",
          border: "1.5px solid rgba(196,122,46,0.2)", zIndex: 2001,
          width: 540, maxWidth: "95vw", maxHeight: "88vh", display: "flex", flexDirection: "column",
          fontFamily: "'Outfit', sans-serif",
        }}>
          {/* Header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>📋 Booking Summary</h3>
              <p style={{ fontSize: 12, color: "#9B7450", margin: "4px 0 0" }}>
                {currentPinned.length} pinned message{currentPinned.length !== 1 ? "s" : ""} · for {selectedChat.customerId?.name}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSummaryDraft(buildSummaryDraft())}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                ↺ Rebuild
              </button>
              <button onClick={() => setShowSummaryModal(false)}
                style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          </div>

          {/* Pinned messages list */}
          {currentPinned.length > 0 && (
            <div style={{ padding: "12px 24px 0", borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Pinned Messages</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                {currentPinned.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(196,122,46,0.05)", borderRadius: 8, padding: "6px 10px" }}>
                    <span style={{ color: "#C47A2E", fontSize: 12, flexShrink: 0, marginTop: 1 }}>📌</span>
                    <span style={{ fontSize: 13, color: "#2C1A0E", flex: 1 }}>{m.content}</span>
                    <button onClick={() => unpinMessage(m.content)}
                      style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13, padding: 0, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editable summary text */}
          <div style={{ flex: 1, padding: "14px 24px", overflowY: "auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>WhatsApp Message Preview</p>
            <textarea
              value={summaryDraft}
              onChange={e => setSummaryDraft(e.target.value)}
              rows={14}
              style={{ width: "100%", fontFamily: "'Outfit', sans-serif", fontSize: 13, border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 12, padding: "12px 14px", color: "#2C1A0E", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", background: "#fff" }}
            />
          </div>

          {/* Actions */}
          <div style={{ padding: "14px 24px 18px", borderTop: "1px solid rgba(196,122,46,0.1)", display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(() => {
              const waUrl = summaryWhatsAppUrl();
              return waUrl ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  onClick={saveSummary}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 12, background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
                  📱 Send on WhatsApp
                </a>
              ) : (
                <div style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#f3f4f6", color: "#bbb", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                  No phone number on record
                </div>
              );
            })()}
            <button onClick={() => { saveSummary(); setShowSummaryModal(false); }}
              style={{ padding: "12px 20px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Save Summary
            </button>
          </div>
        </div>
      </>
    )}




    {/* Admin gallery modal — for Share Photos feature */}
    {adminGalleryOpen && (
      <div style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        onClick={() => { setAdminGalleryOpen(false); setAdminGallerySelected([]); }}>
        <div style={{ background: "#FFFCF5", borderRadius: 20, width: "min(94vw, 600px)", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(44,26,14,0.22)", fontFamily: "'Outfit', sans-serif" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>Decoration Gallery</div>
              <div style={{ fontSize: 11, color: "#9B7450", marginTop: 2 }}>Tap to select{adminGallerySelected.length > 0 ? ` · ${adminGallerySelected.length} selected` : ""}</div>
            </div>
            <button onClick={() => { setAdminGalleryOpen(false); setAdminGallerySelected([]); }}
              style={{ background: "none", border: "none", fontSize: 20, color: "#9B7450", cursor: "pointer", padding: "4px 8px" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {adminGalleryLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: "#9B7450" }}>Loading…</div>
            ) : adminGalleryPhotos.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "#9B7450" }}>No photos available</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {adminGalleryPhotos.map(p => {
                  const sel = adminGallerySelected.includes(p.imageUrl);
                  return (
                    <div key={p.imageUrl} onClick={() => setAdminGallerySelected(prev => sel ? prev.filter(u => u !== p.imageUrl) : [...prev, p.imageUrl])}
                      style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: `2.5px solid ${sel ? "#C47A2E" : "transparent"}` }}>
                      <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      {sel && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(196,122,46,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 900 }}>✓</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0, display: "flex", gap: 8 }}>
            {adminGallerySelected.length > 0 && (
              <button onClick={() => {
                if (!selectedChat?._id || !adminSocketRef.current) return;
                adminGallerySelected.forEach(url => {
                  const content = `[img:${url}]`;
                  const m = { conversationId: selectedChat._id, sender: 'customer-care', content };
                  adminSocketRef.current.emit('send_message', m);
                  setCurrentConversation(prev => [...(prev || []), { ...m, createdAt: new Date().toISOString() }]);
                });
                setAdminGalleryOpen(false);
                setAdminGallerySelected([]);
              }}
                style={{ flex: 2, padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Send {adminGallerySelected.length} photo{adminGallerySelected.length !== 1 ? "s" : ""} →
              </button>
            )}
            <button onClick={() => { setAdminGalleryOpen(false); setAdminGallerySelected([]); }}
              style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminDashboard;
