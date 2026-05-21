import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AddVendorModal from "./AddVendorModal";
import EditVendorModal from "./EditVendorModal";
import { io } from "socket.io-client";
import EastIcon from "@mui/icons-material/East";

import Dashboards_Nav from "../../components/Dashboards_Nav";

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
  { label: "Chat-Concierge",   icon: <MessagesSquare size={22} />,    key: "ChatConcierge" },
  { label: "Gift Hampers",     icon: <span style={{ fontSize: 18 }}>🎁</span>, key: "GiftHampers" },
];

// Simple inline markdown renderer — handles *bold*, _italic_, line breaks
function RenderMessage({ text }) {
  if (!text) return null;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminLocation = useLocation();
  const { user, token } = useSelector((state) => state.auth);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (user && !user.isAdmin) { navigate("/login"); return; }
  }, [token, user, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeDropdown, setactiveDropdown] = useState(() => {
    const s = new URLSearchParams(adminLocation.search).get("section");
    return s || "dashboard";
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [adminMsgInput, setAdminMsgInput] = useState("");
  const adminSocketRef = useRef(null);
  const [liveStats, setLiveStats] = useState(null);
  const [vendorApplications, setVendorApplications] = useState([]);
  const [eventPlans, setEventPlans] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [ghOrders, setGhOrders]         = useState([]);
  const [ghLoading, setGhLoading]       = useState(false);
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
  const [editingVendor, setEditingVendor] = useState(null);
  const [registeringAppId, setRegisteringAppId] = useState(null);
  // Chat summary feature
  const [pinnedMsgs, setPinnedMsgs] = useState([]);   // [{ content, conversationId }]
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState("");

  const { recentChats: rawRecentChats, supportChats: rawSupportChats, adminChats: rawAdminChats } = useConversations({ enabled: !!token });
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

  // 24-hour inactivity TTL — filter and auto-delete inactive conversations
  const TTL_MS = 24 * 60 * 60 * 1000;
  const isExpired = (c) => {
    const last = c.updatedAt || c.lastMessageAt || c.createdAt;
    return last && (Date.now() - new Date(last).getTime()) > TTL_MS;
  };
  const hoursLeft = (c) => {
    const last = c.updatedAt || c.lastMessageAt || c.createdAt;
    if (!last) return null;
    const remaining = TTL_MS - (Date.now() - new Date(last).getTime());
    return remaining > 0 ? Math.ceil(remaining / 3600000) : 0;
  };

  // Active (non-expired, non-deleted) chats — always compare as strings
  const recentChats  = rawRecentChats.filter(c => !isExpired(c) && !deletedChatIds.has(c._id?.toString()));
  const supportChats = rawSupportChats.filter(c => !isExpired(c) && !deletedChatIds.has(c._id?.toString()));
  const adminChats   = rawAdminChats.filter(c => !isExpired(c) && !deletedChatIds.has(c._id?.toString()));

  // Auto-delete expired conversations from DB when they're discovered
  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    const expired = [...rawRecentChats, ...rawSupportChats, ...rawAdminChats].filter(isExpired);
    if (!expired.length) return;
    expired.forEach(c => {
      fetch(`${BASE_URL}/admin/conversations/${c._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).catch(() => {});
    });
  }, [rawRecentChats, rawSupportChats, rawAdminChats, token]);

  // Fetch real stats from backend
  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setLiveStats(data))
      .catch(() => {});

    fetch(`${BASE_URL}/vendor-applications`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setVendorApplications(data.applications || []))
      .catch(() => {});

    fetch(`${BASE_URL}/admin/event-plans`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setEventPlans(data.plans || []))
      .catch(() => {});

    fetch(`${BASE_URL}/admin/chat-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        const all = data.conversations || [];
        // Auto-delete expired chat requests (>24hr inactive)
        const expired = all.filter(isExpired);
        expired.forEach(c => {
          fetch(`${BASE_URL}/admin/conversations/${c._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }).catch(() => {});
        });
        setChatRequests(all.filter(c => !isExpired(c)));
      })
      .catch(() => {});

    fetch(`${BASE_URL}/admin/vendor-stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setVendorStats(data.vendors || []))
      .catch(() => {});

    // Run 24hr inactivity cleanup on every dashboard load
    fetch(`${BASE_URL}/admin/cleanup-inactive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    }).catch(() => {});

    // Fetch real top vendors
    fetch(`${BASE_URL}/admin/top-vendors`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setTopVendorsReal(data.topVendors || []))
      .catch(() => {});

    // Fetch payment stats for dashboard
    fetch(`${BASE_URL}/admin/payments/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setPaymentStats(data))
      .catch(() => {});
  }, [token, user]);

  // Fetch gift hamper orders when tab is active
  useEffect(() => {
    if (activeDropdown !== 'gifthampers' || !token || !user?.isAdmin) return;
    setGhLoading(true);
    fetch(`${BASE_URL}/admin/gift-hamper-orders`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => setGhOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setGhLoading(false));
  }, [activeDropdown, token, user]);

  // Fetch payments when Payments tab is active
  useEffect(() => {
    if (activeDropdown !== 'payments' || !token || !user?.isAdmin) return;
    setLoadingPayments(true);
    fetch(`${BASE_URL}/admin/payments`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setPaymentsList(data.payments || []))
      .catch(() => {})
      .finally(() => setLoadingPayments(false));
  }, [activeDropdown, token, user]);

  // Fetch users when Users tab is active
  useEffect(() => {
    if (activeDropdown !== 'users' || !token || !user?.isAdmin) return;
    setLoadingUsers(true);
    fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => setUserList(d.users || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
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
    if (!token || !user?.isAdmin) return;
    const socket = io(BASE_URL, {
      query: { userId: user._id, role: 'admin' },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    adminSocketRef.current = socket;

    socket.on('connect', () => console.log('Admin socket connected:', socket.id));
    socket.on('connect_error', (e) => console.error('Admin socket error:', e.message));

    socket.on('new_chat_request', (req) => {
      setChatRequests((prev) => {
        const exists = prev.find((r) => r._id === req._id);
        if (exists) return prev;
        return [req, ...prev];
      });
    });

    // Receive new messages in real-time — skip own messages (already added locally)
    socket.on('new_message', (msg) => {
      if (msg.sender === 'customer-care') return;
      setCurrentConversation((prev) => [...(prev || []), msg]);
    });

    return () => { socket.disconnect(); adminSocketRef.current = null; };
  }, [token, user]);

  const [pricingAmount, setPricingAmount] = useState("");
  const [pricingVendorName, setPricingVendorName] = useState("");

  // Sync pinned messages + pricing from selectedChat when chat changes
  useEffect(() => {
    if (!selectedChat?._id) { setPinnedMsgs([]); setPricingAmount(""); setPricingVendorName(""); return; }
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
  }, [selectedChat?._id]);

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
    setPinnedMsgs([]);
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
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Chat Requests
            </div>

            {chatRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-lg">No chat requests yet.</div>
            ) : (
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
                          <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, fontWeight: 600,
                            ...(req.chatApproved ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }
                            : req.chatRejected ? { background: "#fff5f5", color: "#c0392b", border: "1px solid #fca5a5" }
                            : { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }) }}>
                            {req.chatApproved ? "Approved" : req.chatRejected ? "Rejected" : "Pending"}
                          </span>
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
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
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
            {filteredPlans.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#9B7450", background: "#fff", borderRadius: 16, border: "2px solid #CCAB4A" }}>
                No {bookingTab !== "All" ? bookingTab.toLowerCase() : ""} event plans yet.
              </div>
            ) : (
              <div className="mb-8">
                <div className="bg-white border-2 border-[#CCAB4A] rounded-[16px] overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Outfit', sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#fffaf0", borderBottom: "1.5px solid #CCAB4A" }}>
                        {["Customer", "Event", "Type", "Date", "Guests", "Budget", "Services", "Booking Type", "Status", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#7A5535", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.map((plan, i) => {
                        const badge = statusBadgeStyle(plan.status);
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
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                {badge.label}
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {/* Ongoing: show summary + WhatsApp + Mark Payment Done */}
                                {(plan.status === "submitted" || plan.status === "draft") && (() => {
                                  const phone = (plan.customerId?.phoneNumber || "").replace(/[^0-9]/g, "");
                                  return (
                                    <>
                                      {plan.bookingSummary && phone && (
                                        <a href={`https://wa.me/91${phone}?text=${encodeURIComponent(plan.bookingSummary)}`}
                                          target="_blank" rel="noopener noreferrer"
                                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif" }}>
                                          📱 Send on WhatsApp
                                        </a>
                                      )}
                                      <button
                                        onClick={() => {
                                          fetch(`${BASE_URL}/admin/event-plans/${plan._id}/mark-payment`, {
                                            method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
                                          }).then(r => { if (r.ok) setEventPlans(prev => prev.map(p => p._id === plan._id ? { ...p, status: 'in_progress' } : p)); }).catch(() => {});
                                        }}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", background: "#0369a1", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif" }}>
                                        💳 Mark Payment Done
                                      </button>
                                    </>
                                  );
                                })()}
                                {/* Upcoming: show change request info + resolve */}
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
              <div className="bg-white border-2 border-[#CCAB4A] rounded-[16px] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F1E1A8] flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-black">All Transactions</h3>
                  <span className="text-sm text-gray-500">{paymentsList.length} total</span>
                </div>
                {loadingPayments ? (
                  <div className="py-12 text-center text-gray-400">Loading payments...</div>
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

            {/* Edit Vendor Modal */}
            {editingVendor && (
              <EditVendorModal
                vendor={editingVendor}
                onClose={() => setEditingVendor(null)}
                onSaved={(data) => {
                  setSeedResult({ message: data.message });
                  // Refresh vendor name in list
                  setVendorStats(prev => prev.map(v =>
                    v._id === editingVendor._id ? { ...v, name: data.vendor?.name || v.name } : v
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
            {vendorStats.length > 0 && (
              <div className="mb-8">
                <div className="text-xl font-semibold text-black mb-3">Vendor Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {vendorStats.map((v) => (
                    <div key={v._id}
                      style={{ background: "#fff", borderRadius: 14, border: "2px solid #CCAB4A", padding: "16px 18px", transition: "box-shadow 0.2s", position: "relative" }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(204,171,74,0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      {/* Action buttons — top right corner */}
                      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingVendor(v); }}
                          title="Edit vendor"
                          style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.3)", background: "rgba(196,122,46,0.06)", color: "#C47A2E", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#C47A2E"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(196,122,46,0.06)"; e.currentTarget.style.color = "#C47A2E"; }}
                        >
                          ✏️
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
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#2C1A0E", marginBottom: 4, paddingRight: 24 }}>{v.name}</div>
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
                          <span style={{ fontSize: 11, color: "#9B7450" }}>Team: {v.teamSize}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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
                          onClick={() => { setEditingVendor(selectedVendor); setSelectedVendor(null); }}
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
            )}

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
                          {getInitials(c.vendorId.name)}
                        </div>
                        <span className="font-semibold text-xs sm:text-base hidden sm:inline">
                          {c.vendorId.name}
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
                      {(() => { const h = hoursLeft(c); return h !== null && h <= 6 ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: h <= 2 ? "#c0392b" : "#b45309" }}>
                          ⏳ {h === 0 ? "Expiring" : `${h}h left`}
                        </span>
                      ) : null; })()}
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
                        </div>
                      );
                    })()}
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
                      {/* Pricing input */}
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
                      {(() => { const h = hoursLeft(c); return h !== null && h <= 6 ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: h <= 2 ? "#c0392b" : "#b45309" }}>
                          ⏳ {h === 0 ? "Expiring" : `${h}h left`}
                        </span>
                      ) : null; })()}
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

        {activeDropdown === "chatconcierge" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Chat - Events
            </div>

            <div className="min-h-[500px] sm:min-h-[600px] w-full bg-white border-2 border-[#CCAB4A] rounded-[16px] sm:rounded-[20px] flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
              {/* LEFT - User List */}
              <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-[#F1E1A8] overflow-y-auto max-h-[300px] sm:max-h-none">
                {adminChats.map((c, idx) => (
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
                      {(() => { const h = hoursLeft(c); return h !== null && h <= 6 ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: h <= 2 ? "#c0392b" : "#b45309" }}>
                          ⏳ {h === 0 ? "Expiring" : `${h}h left`}
                        </span>
                      ) : null; })()}
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
        {activeDropdown === "gifthampers" && (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8, marginTop: 16 }}>
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
            {ghLoading ? (
              <p style={{ color: "#9B7450" }}>Loading orders…</p>
            ) : ghOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "2px solid #F1E1A8" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                <p style={{ color: "#9B7450", fontSize: 16 }}>No gift hamper orders yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ghOrders.map(order => (
                  <div key={order._id} style={{ background: "#fff", borderRadius: 14, border: "2px solid #F1E1A8", padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#2C1A0E" }}>{order.customerName}</div>
                        <div style={{ fontSize: 13, color: "#9B7450" }}>📞 {order.customerPhone}</div>
                        <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>📦 {order.deliveryAddress}, {order.city}{order.pincode ? " - " + order.pincode : ""}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#C47A2E" }}>₹{order.totalAmount.toLocaleString("en-IN")}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: order.status === "confirmed" ? "#f0fdf4" : "#fffbeb", color: order.status === "confirmed" ? "#15803d" : "#b45309", border: "1px solid " + (order.status === "confirmed" ? "#bbf7d0" : "#fde68a") }}>
                          {order.status}
                        </span>
                        <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, background: "#faf5ee", borderRadius: 10, padding: "8px 12px" }}>
                          {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{item.productName}</div>
                            <div style={{ fontSize: 11, color: "#9B7450" }}>
                              {item.productNumber && `#${item.productNumber} · `}
                              Vendor: {item.vendorName || "—"} · Qty: {item.quantity} · ₹{item.pricePerUnit}/pc
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, color: "#C47A2E" }}>₹{item.subtotal.toLocaleString("en-IN")}</div>
                        </div>
                      ))}
                    </div>
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        await fetch(`${BASE_URL}/admin/gift-hamper-orders/${order._id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          credentials: "include",
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        setGhOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: e.target.value } : o));
                      }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #F1E1A8", fontSize: 12, fontFamily: "'Outfit', sans-serif", cursor: "pointer" }}
                    >
                      {["pending","confirmed","processing","delivered","cancelled"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
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

    </>
  );
};

export default AdminDashboard;
