import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
  { label: "Dashboard",      icon: <LayoutDashboard size={22} />,     key: "Dashboard" },
  { label: "Chat Requests",  icon: <MessageCircle size={22} />,       key: "ChatRequests" },
  { label: "Bookings",       icon: <CalendarFold size={22} />,        key: "Bookings" },
  { label: "Vendors",        icon: <BriefcaseBusiness size={22} />,   key: "Vendors" },
  { label: "Users",          icon: <UserRound size={22} />,           key: "Users" },
  { label: "Payments",       icon: <BadgeIndianRupee size={22} />,    key: "Payments" },
  { label: "Chat",           icon: <MessageCircle size={22} />,       key: "Chat" },
  { label: "Chat-Support",   icon: <MessagesSquare size={22} />,      key: "ChatSupport" },
  { label: "Chat-Concierge", icon: <MessagesSquare size={22} />,      key: "ChatConcierge" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (user && !user.isAdmin) { navigate("/login"); return; }
  }, [token, user, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeDropdown, setactiveDropdown] = useState("dashboard");
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [adminMsgInput, setAdminMsgInput] = useState("");
  const adminSocketRef = useRef(null);
  const [liveStats, setLiveStats] = useState(null);
  const [vendorApplications, setVendorApplications] = useState([]);
  const [eventPlans, setEventPlans] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [vendorStats, setVendorStats] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [bookingTab, setBookingTab] = useState("All");

  const { recentChats, supportChats, adminChats } = useConversations({ enabled: !!token });

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
      .then((data) => setChatRequests(data.conversations || []))
      .catch(() => {});

    fetch(`${BASE_URL}/admin/vendor-stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setVendorStats(data.vendors || []))
      .catch(() => {});
  }, [token, user]);

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
    if (!window.confirm('Delete this user? They will need to sign up again.')) return;
    fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then(() => {
        setUserList((prev) => prev.filter((u) => u._id !== userId));
        // Refresh stats count
        setLiveStats((prev) => prev ? { ...prev, users: { total: (prev.users?.total ?? 1) - 1 } } : prev);
      })
      .catch(() => {});
  };

  const loadConversation = async (id) => {
    const convo = await getConversationMessages(id);
    setCurrentConversation(convo || []);
    setAdminMsgInput("");
    // Join the conversation room so admin receives real-time messages
    if (adminSocketRef.current) {
      adminSocketRef.current.emit('join_conversation', { conversationId: id });
    }
  };

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
                        </div>

                        {req.eventDetails && Object.values(req.eventDetails).some(Boolean) && (
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#5a3a1a" }}>
                            {req.eventDetails.eventName  && <span><b>Event:</b> {req.eventDetails.eventName}</span>}
                            {req.eventDetails.eventType  && <span><b>Type:</b> {req.eventDetails.eventType}</span>}
                            {req.eventDetails.date       && <span><b>Date:</b> {req.eventDetails.date}</span>}
                            {req.eventDetails.location   && <span><b>City:</b> {req.eventDetails.location}</span>}
                            {req.eventDetails.guests     && <span><b>Guests:</b> {req.eventDetails.guests}</span>}
                            {req.eventDetails.budget     && <span><b>Budget:</b> {req.eventDetails.budget}</span>}
                          </div>
                        )}
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
                                }).then(() => setChatRequests((prev) => prev.map((r) => r._id === req._id ? { ...r, chatApproved: true } : r)));
                              }}
                              style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => {
                                fetch(`${BASE_URL}/admin/chat-requests/${req._id}/reject`, {
                                  method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
                                }).then(() => setChatRequests((prev) => prev.map((r) => r._id === req._id ? { ...r, chatRejected: true } : r)));
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
                  { label: "Users Count", value: liveStats?.users?.total ?? "—", icon: stats_dashboard[0].icon },
                  { label: "Vendor Count", value: liveStats?.vendors?.total ?? "—", icon: stats_dashboard[1].icon },
                  { label: "Registered Vendors", value: liveStats?.applications?.registered ?? "—", icon: stats_dashboard[2].icon },
                  { label: "Pending Applications", value: liveStats?.applications?.pending ?? "—", icon: stats_dashboard[3].icon },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="min-h-[160px] sm:min-h-[180px] w-full px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-between py-4 sm:py-5 hover:shadow-md transition-shadow"
                  >
                    <div className="icon text-[#d08f4e]">{item.icon}</div>
                    <div className="content flex flex-col items-center gap-2">
                      <div className="heading font-semibold text-sm sm:text-base lg:text-lg text-gray-500 leading-tight text-center">
                        {item.label}
                      </div>
                      <div className="metric text-4xl sm:text-5xl md:text-6xl lg:text-[75px] font-bold text-[#CCAB4A] leading-tight">
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
          const BOOKING_STATUS = { Upcoming: ["submitted"], Ongoing: ["in_progress"], Completed: ["completed"], Cancelled: ["cancelled"] };
          const filteredPlans = bookingTab === "All" ? eventPlans : eventPlans.filter((p) => (BOOKING_STATUS[bookingTab] || []).includes(p.status));
          const statusBadgeStyle = (s) => ({ submitted: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" }, in_progress: { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe" }, completed: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" }, cancelled: { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5" } }[s] || { bg: "#fffbeb", color: "#b45309", border: "#fde68a" });
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
                    style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: "pointer", border: "1.5px solid", transition: "all 0.18s",
                      borderColor: bookingTab === tab ? "#C47A2E" : "rgba(139,69,19,0.2)",
                      background: bookingTab === tab ? "#C47A2E" : "#fff",
                      color: bookingTab === tab ? "#fff" : "#6B3A1F",
                    }}>
                    {tab} <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 700, background: bookingTab === tab ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: bookingTab === tab ? "#fff" : "#C47A2E", borderRadius: 100, padding: "1px 7px" }}>{count}</span>
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
                        {["Customer", "Event", "Type", "Date", "Guests", "Budget", "Services", "Booking Type", "Status"].map((h) => (
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
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, textTransform: "capitalize" }}>
                                {plan.status?.replace("_", " ")}
                              </span>
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
            {/* Heading */}
            <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-4 text-[#d08f4e]">
              Payments
            </div>

            {/* Info Cards Upper */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {stats_payments.map((item) => (
                  <div
                    key={item.key}
                    className="min-h-[160px] sm:min-h-[180px] w-full px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-between py-4 sm:py-5 hover:shadow-md transition-shadow"
                  >
                    {/* Icon */}
                    <div className="icon text-[#d08f4e]">{item.icon}</div>

                    {/* Bottom Content */}
                    <div className="content flex flex-col items-center gap-2">
                      <div className="heading font-semibold text-sm sm:text-base lg:text-lg text-gray-500 leading-tight text-center">
                        {item.label}
                      </div>
                      <div className="metric text-4xl sm:text-5xl md:text-6xl lg:text-[75px] font-bold text-[#CCAB4A] leading-tight">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Cards Lower */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10 mt-4 sm:mt-8">
              {/* Booking by Category */}
              <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full px-4 sm:px-6 py-4 sm:py-5 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-start hover:shadow-md transition-shadow">
                <div className="heading font-semibold text-lg sm:text-xl md:text-2xl text-black mb-2 sm:mb-4">
                  Booking by Category
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                  <Doughnut_BookingCategory_AdminDashboard />
                </div>
              </div>

              {/* Booking by City */}
              <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full px-4 sm:px-6 py-4 sm:py-5 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-[#CCAB4A] flex flex-col justify-start hover:shadow-md transition-shadow">
                <div className="heading font-semibold text-lg sm:text-xl md:text-2xl text-black mb-2 sm:mb-4">
                  Booking by City
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[250px] text-gray-400">
                  <Doughnut_BookingCity_AdminDashboard />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDropdown === "vendors" && (() => {
          const [importResult, setImportResult] = React.useState(null);
          const [importing, setImporting] = React.useState(false);

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

          return (
          <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-4 overflow-y-auto">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 8, marginTop: 16 }}>
              <div className="heading font-semibold text-2xl sm:text-3xl md:text-4xl text-[#d08f4e]">Vendors</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
                      onClick={() => setSelectedVendor(v)}
                      style={{ background: "#fff", borderRadius: 14, border: "2px solid #CCAB4A", padding: "16px 18px", cursor: "pointer", transition: "box-shadow 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(204,171,74,0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#2C1A0E", marginBottom: 4 }}>{v.name}</div>
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
                      <div style={{ fontSize: 13, color: "#5a3a1a", padding: "12px 14px", background: "#fffaf0", borderRadius: 10, border: "1px solid rgba(204,171,74,0.3)" }}>
                        <b>Status:</b> {selectedVendor.status}
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
                    const GOOGLE_FORM_URL = "https://forms.google.com/your-form-link-here";

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

                          {/* STEP 3 — approved: WhatsApp approval message + mark registered */}
                          {app.status === "approved" && (
                            <>
                              <a
                                href={`https://wa.me/91${waNum}?text=${encodeURIComponent(`Hi ${app.name}! 🎉 Congratulations! You are approved by Tendr as a vendor. Our team will contact you shortly with your profile link and next steps. Welcome to the Tendr family! — Team Tendr`)}`}
                                target="_blank" rel="noopener noreferrer"
                                style={btnStyle("#25D366", "#fff", null)}
                              >
                                📱 Send Approval on WhatsApp
                              </a>
                              <button onClick={() => updateStatus("registered")} style={btnStyle("#15803d", "#fff", null)}>
                                ✓ Mark as Registered
                              </button>
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

                  {/* Vendor list */}
                  <div className="flex-1 flex flex-col justify-evenly space-y-3 sm:space-y-4">
                    {topVendors.map((vendor, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start group cursor-pointer"
                      >
                        {/* Left: medal + name */}
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="text-xl sm:text-2xl leading-tight group-hover:text-2xl sm:group-hover:text-3xl transition-all duration-500 flex-shrink-0">
                            {vendor.medal}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-base sm:text-lg leading-none break-words">
                              {vendor.name}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 mt-2">
                              {vendor.city}
                            </span>
                          </div>
                        </div>

                        {/* Right: booking count */}
                        <div className="text-[#CCAB4A] font-bold text-lg sm:text-2xl leading-none flex-shrink-0 ml-2">
                          {vendor.bookings}
                        </div>
                      </div>
                    ))}
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

                  {/* Earner list */}
                  <div className="flex-1 flex flex-col justify-evenly space-y-3 sm:space-y-4">
                    {topEarners.map((earner, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start group cursor-pointer"
                      >
                        {/* Left: medal + name */}
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="text-xl sm:text-2xl leading-tight group-hover:text-2xl sm:group-hover:text-3xl transition-all duration-500 flex-shrink-0">
                            {earner.medal}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-base sm:text-lg leading-none break-words">
                              {earner.name}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 mt-2">
                              {earner.city}
                            </span>
                          </div>
                        </div>

                        {/* Right: Earnings */}
                        <div className="text-[#CCAB4A] font-bold text-lg sm:text-2xl leading-none whitespace-nowrap flex-shrink-0 ml-2">
                          {formatEarnings(earner.earnings)}
                        </div>
                      </div>
                    ))}
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

                    <div className="flex flex-col items-center sm:items-end text-xs sm:text-sm">
                      <span className="text-gray-500">{c.time}</span>

                      {c.unread > 0 && (
                        <span className="mt-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-[#d08f4e] text-white text-xs font-semibold">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT - Chat Messages */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
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
                        {currentConversation.map((msg, index) => (
                          <div key={index} style={{
                            alignSelf: msg.sender === "user" ? "flex-start" : "flex-end",
                            background: msg.sender === "user" ? "#f3f4f6" : "#d08f4e",
                            color: msg.sender === "user" ? "#1f2937" : "#ffffff",
                            padding: "8px 14px", borderRadius: 14, maxWidth: "75%",
                            fontSize: 14, fontFamily: "'Outfit', sans-serif", wordBreak: "break-word", lineHeight: 1.5,
                          }}>
                            <span style={{ fontSize: 10, opacity: 0.65, display: "block", marginBottom: 3, fontWeight: 600 }}>
                              {msg.sender === "user" ? "Customer" : "Admin"}
                            </span>
                            {msg.content || msg.text || ""}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input Box */}
                    <div className="p-2 sm:p-3 border-t border-[#F1E1A8] flex gap-2">
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
                  </>
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
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT - Chat Window */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-3 sm:p-4 border-b border-[#F1E1A8] flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(selectedChat.customerId.name)}
                        </div>

                        <span className="font-semibold text-sm sm:text-lg">
                          {selectedChat.customerId.name}
                        </span>
                      </div>

                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatTimeIST(selectedChat.updatedAt)}
                      </span>
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
                          {currentConversation.map((msg, index) => (
                            <div key={index} style={{
                              alignSelf: msg.sender === "user" ? "flex-start" : "flex-end",
                              background: msg.sender === "user" ? "#f3f4f6" : "#d08f4e",
                              color: msg.sender === "user" ? "#1f2937" : "#ffffff",
                              padding: "8px 14px",
                              borderRadius: 14,
                              maxWidth: "75%",
                              fontSize: 14,
                              fontFamily: "'Outfit', sans-serif",
                              wordBreak: "break-word",
                              lineHeight: 1.5,
                            }}>
                              <span style={{ fontSize: 10, opacity: 0.65, display: "block", marginBottom: 3, fontWeight: 600 }}>
                                {msg.sender === "user" ? "Customer" : "Admin"}
                              </span>
                              {msg.content || msg.text || ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2 sm:p-3 border-t border-[#F1E1A8] flex gap-2">
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
                  </>
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
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT - Chat Window */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-3 sm:p-4 border-b border-[#F1E1A8] flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#FFF4D4] border border-[#CCAB4A] flex items-center justify-center font-semibold text-xs sm:text-sm text-[#CCAB4A]">
                          {getInitials(selectedChat.customerId.name)}
                        </div>

                        <span className="font-semibold text-sm sm:text-lg">
                          {selectedChat.customerId.name}
                        </span>
                      </div>

                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatTimeIST(selectedChat.updatedAt)}
                      </span>
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
                          {currentConversation.map((msg, index) => (
                            <div key={index} style={{
                              alignSelf: msg.sender === "user" ? "flex-start" : "flex-end",
                              background: msg.sender === "user" ? "#f3f4f6" : "#d08f4e",
                              color: msg.sender === "user" ? "#1f2937" : "#ffffff",
                              padding: "8px 14px",
                              borderRadius: 14,
                              maxWidth: "75%",
                              fontSize: 14,
                              fontFamily: "'Outfit', sans-serif",
                              wordBreak: "break-word",
                              lineHeight: 1.5,
                            }}>
                              <span style={{ fontSize: 10, opacity: 0.65, display: "block", marginBottom: 3, fontWeight: 600 }}>
                                {msg.sender === "user" ? "Customer" : "Admin"}
                              </span>
                              {msg.content || msg.text || ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2 sm:p-3 border-t border-[#F1E1A8] flex gap-2">
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
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm sm:text-base">
                    Select a user to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
