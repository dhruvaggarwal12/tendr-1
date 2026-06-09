import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import VendorAvailabilityCalendar from '../../components/VendorAvailabilityCalendar';
import { logout } from '../../redux/authSlice';
import logo from "../../assets/logos/tendr-logo-secondary.png";
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import BookIcon from '@mui/icons-material/Book';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Fetch vendor chats from project backend
const fetchVendorChats = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/vendor/chats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error("Error fetching vendor chats:", error);
    return [];
  }
};

const fetchVendorBookings = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/vendor/bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error("Error fetching vendor bookings:", error);
    return [];
  }
};

const fetchVendorStats = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/vendor/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    const result = await response.json();
    return result.data || result || {
      totalBookings: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalReviews: 0,
      thisMonthBookings: 0,
      thisMonthEarnings: 0
    };
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return {
      totalBookings: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalReviews: 0,
      thisMonthBookings: 0,
      thisMonthEarnings: 0
    };
  }
};

const VendorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [chats, setChats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chatsData, bookingsData, statsData] = await Promise.all([
          fetchVendorChats(),
          fetchVendorBookings(),
          fetchVendorStats()
        ]);
        
        setChats(chatsData);
        setBookings(bookingsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate('/');
      setIsModalOpen(false);
    });
  };

  const handleChatClick = (chat) => {
    navigate('/vendor/chat', { 
      state: { 
        chatId: chat.id,
        customerName: chat.customerName,
        customerImage: chat.customerImage,
        eventType: chat.eventType,
        eventDate: chat.eventDate,
        guestCount: chat.guestCount
      } 
    });
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'V';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="tendr logo"
              className="h-12 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <span className="text-2xl font-bold text-gray-800">Vendor Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-yellow-700 border border-yellow-600 rounded-full hover:bg-yellow-50 transition-colors"
            >
              View Site
            </button>
            <div className="relative">
              <div
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                {userInitial}
              </div>
              {isModalOpen && (
                <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                  <div
                    onClick={() => navigate("/vendor/profile")}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 font-semibold hover:bg-yellow-50 cursor-pointer"
                  >
                    <PersonIcon fontSize="small" />
                    <span>Profile</span>
                  </div>
                  <div
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 font-semibold hover:bg-yellow-50 cursor-pointer"
                  >
                    <LogoutIcon fontSize="small" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
              </div>
              <BookIcon className="text-yellow-600 text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-800">₹{stats.totalEarnings?.toLocaleString()}</p>
              </div>
              <PaymentIcon className="text-green-600 text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Rating</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-800">{stats.averageRating}</p>
                  <StarIcon className="text-yellow-500 text-2xl ml-1" />
                </div>
              </div>
              <TrendingUpIcon className="text-blue-500 text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-3xl font-bold text-gray-800">{stats.thisMonthBookings} bookings</p>
              </div>
              <EventIcon className="text-purple-500 text-3xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Chats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Chats</h2>
              <button
                onClick={() => navigate("/vendor/chats")}
                className="text-yellow-700 hover:text-yellow-800 font-semibold"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {chats.slice(0, 3).map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      src={chat.customerImage}
                      alt={chat.customerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{chat.customerName}</h3>
                      <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {chat.eventType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {chat.guestCount} guests
                      </span>
                    </div>
                  </div>
                  
                  <div className={`w-3 h-3 rounded-full ${
                    chat.status === 'active' ? 'bg-green-500' : 
                    chat.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Bookings</h2>
              <button
                onClick={() => navigate("/vendor/bookings")}
                className="text-yellow-700 hover:text-yellow-800 font-semibold"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{booking.customerName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{booking.eventType}</span>
                    <span>•</span>
                    <span>{booking.eventDate}</span>
                    <span>•</span>
                    <span>{booking.guestCount} guests</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">₹{booking.amount?.toLocaleString()}</span>
                    <span className={`text-xs ${
                      booking.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/vendor/chats")}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-yellow-50 transition-colors"
            >
              <ChatIcon className="text-yellow-600 text-2xl" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">View All Chats</h3>
                <p className="text-sm text-gray-600">Manage customer conversations</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/vendor/bookings")}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-yellow-50 transition-colors"
            >
              <BookIcon className="text-yellow-600 text-2xl" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">View Bookings</h3>
                <p className="text-sm text-gray-600">Check all your bookings</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/vendor/profile")}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-yellow-50 transition-colors"
            >
              <PersonIcon className="text-yellow-600 text-2xl" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Edit Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </button>
          </div>
        </div>

        {/* Manage Availability */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Manage Availability</h2>
          <p className="text-sm text-gray-500 mb-6">
            Set which slots you're available. Customers will see this on your profile before reaching out.
            Each day has 2 slots — <strong>Morning (10AM–2PM)</strong> and <strong>Evening (4PM–9PM)</strong>.
          </p>
          <VendorAvailabilityCalendar
            vendorId={user?._id || user?.id}
            isVendorView={true}
            token={token}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
