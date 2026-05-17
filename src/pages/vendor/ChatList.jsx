import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logos/tendr-logo-secondary.png";
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Fetch vendor chats from project backend
const fetchAllVendorChats = async () => {
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

const VendorChatList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chatsData = await fetchAllVendorChats();
        setChats(chatsData);
        setFilteredChats(chatsData);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    let filtered = chats;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(chat =>
        chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(chat => chat.status === statusFilter);
    }

    setFilteredChats(filtered);
  }, [chats, searchTerm, statusFilter]);

  const handleChatClick = (chat) => {
    navigate('/vendor/chat', { 
      state: { 
        chatId: chat.id,
        customerName: chat.customerName,
        customerImage: chat.customerImage,
        eventType: chat.eventType,
        eventDate: chat.eventDate,
        guestCount: chat.guestCount,
        customerPhone: chat.customerPhone
      } 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowBackIcon className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="tendr logo"
                className="h-10 cursor-pointer"
                onClick={() => navigate("/")}
              />
              <span className="text-xl font-bold text-gray-800">Chats</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FilterListIcon className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, event type, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Filter by Status</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'active', 'pending', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat List */}
          <div className="space-y-4">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <ChatIcon className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No chats found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'You don\'t have any conversations yet'
                  }
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={chat.customerImage}
                      alt={chat.customerName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                        {chat.unreadCount}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(chat.status)}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{chat.customerName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{chat.timestamp}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          chat.status === 'active' ? 'bg-green-100 text-green-800' :
                          chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(chat.status)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-2">{chat.lastMessage}</p>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        {chat.eventType}
                      </span>
                      <span>{chat.eventDate}</span>
                      <span>•</span>
                      <span>{chat.guestCount} guests</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total conversations: {filteredChats.length}</span>
              <span>
                Unread: {filteredChats.filter(chat => chat.unreadCount > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorChatList; 