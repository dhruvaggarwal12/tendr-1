import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const API_BASE = import.meta.env.VITE_BASE_URL;

// Shared [img:<data-uri>] convention the rest of the chat system already
// uses (see src/pages/customer/Chat.jsx) — images travel as a marked
// message string over the same send_message socket event as text, no
// separate upload endpoint. Normalizes one real Message doc (from the
// history fetch or a live new_message event) into the {type, text/imageUrl}
// shape this screen renders.
function normalizeMessage(raw) {
  const isVendor = raw.sender === 'vendor';
  const base = {
    id: raw._id || raw.id,
    sender: isVendor ? 'vendor' : 'customer',
    timestamp: raw.createdAt || raw.timestamp || new Date().toISOString(),
  };
  if (typeof raw.content === 'string' && raw.content.startsWith('[img:')) {
    return { ...base, type: 'image', imageUrl: raw.content.replace('[img:', '').replace(/\]$/, '') };
  }
  return { ...base, type: 'text', text: raw.content ?? raw.text ?? '' };
}

const VendorChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const token = useSelector((s) => s.auth?.token);

  const {
    chatId,
    customerName,
    customerImage,
    eventType,
    eventDate,
    guestCount,
  } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const [imagePreviews, setImagePreviews] = useState([]); // {id, url, file}

  // ── Real connection: join this conversation's room, load its real message
  // history, and listen for live replies — same socket.io infra and events
  // already used by the customer-facing chat (src/pages/customer/Chat.jsx)
  // and the vendor's own direct-chat page.
  useEffect(() => {
    if (!chatId || !token) return;
    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_conversation', { conversationId: chatId });
      fetch(`${API_BASE}/messages/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((history) => {
          setMessages(Array.isArray(history) ? history.map(normalizeMessage) : []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });

    socket.on('new_message', (msg) => {
      // Skip the echo of our own just-sent message — already shown optimistically.
      if (msg.sender === 'vendor') return;
      setMessages((prev) => [...prev, normalizeMessage(msg)]);
    });

    socket.on('connect_error', (err) => console.error('Vendor chat socket error:', err.message));

    return () => socket.disconnect();
  }, [chatId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendContent = (content) => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('send_message', { conversationId: chatId, sender: 'vendor', content });
  };

  // --------------- Handle text send ---------------
  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, type: 'text', text, sender: 'vendor', timestamp: new Date().toISOString() }]);
    setNewMessage('');
    sendContent(text);
  };

  // --------------- Image selection / preview ---------------
  const openFilePicker = () => fileInputRef.current?.click();

  const onFilesSelected = (filesList) => {
    const files = Array.from(filesList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const previews = files.map((file) => ({ id: `prev-${file.name}-${file.size}-${Date.now()}`, url: URL.createObjectURL(file), file }));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleFileInputChange = (e) => {
    onFilesSelected(e.target.files);
    e.target.value = '';
  };

  const removePreview = (id) => {
    setImagePreviews((prev) => prev.filter((p) => p.id !== id));
  };

  // Paste image from clipboard
  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    const imageBlobs = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) imageBlobs.push(blob);
      }
    }
    if (imageBlobs.length) {
      onFilesSelected(imageBlobs);
      e.preventDefault();
    }
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, []);

  // --------------- Send images — same [img:<data-uri>] convention as the
  // customer-facing chat, over the same send_message socket event. ---------
  const sendImages = () => {
    if (!imagePreviews.length) return;
    const batch = imagePreviews;
    setImagePreviews([]);

    batch.forEach(({ id, url, file }) => {
      setMessages((prev) => [...prev, { id, type: 'image', imageUrl: url, sender: 'vendor', timestamp: new Date().toISOString() }]);
      const reader = new FileReader();
      reader.onload = (ev) => sendContent(`[img:${ev.target.result}]`);
      reader.readAsDataURL(file);
    });
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (!chatId || !customerName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600 mb-4">Chat not found</div>
          <button
            onClick={() => navigate('/vendor/chats')}
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/vendor/chats')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowBackIcon className="text-gray-600" />
            </button>

            <div className="flex items-center space-x-3">
              {customerImage ? (
                <img
                  src={customerImage}
                  alt={customerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                  {customerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-800">{customerName}</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <PhoneIcon className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <EmailIcon className="text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertIcon className="text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Mark as resolved
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Archive chat
                  </div>
                  <div className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer">
                    Block customer
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        {(eventType || guestCount || eventDate) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {eventType && (
                <div className="flex items-center space-x-1">
                  <EventIcon className="text-orange-500" fontSize="small" />
                  <span>{eventType}</span>
                </div>
              )}
              {guestCount && (
                <div className="flex items-center space-x-1">
                  <PeopleIcon className="text-orange-500" fontSize="small" />
                  <span>{guestCount} guests</span>
                </div>
              )}
              {eventDate && <span>{eventDate}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">No messages yet — say hello!</div>
        )}
        {messages.map((message, index) => {
          const isVendor = message.sender === 'vendor';
          const showDate =
            index === 0 ||
            formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp);

          const bubbleBase =
            'max-w-xs lg:max-w-md rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm';
          const vendorBubble = 'bg-orange-500 text-white';
          const customerBubble = 'bg-white text-gray-800 border border-gray-200';

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}

              <div className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                <div className={`${bubbleBase} ${isVendor ? vendorBubble : customerBubble}`}>
                  {message.type === 'text' && (
                    <>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-[10px] sm:text-xs mt-2 ${isVendor ? 'text-orange-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </>
                  )}

                  {message.type === 'image' && (
                    <div className="flex flex-col">
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={message.imageUrl}
                          alt="attachment"
                          className="max-h-72 sm:max-h-96 object-cover rounded-xl"
                          onLoad={scrollToBottom}
                        />
                      </div>
                      <p className={`text-[10px] sm:text-xs mt-2 ${isVendor ? 'text-orange-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Image preview tray */}
      {imagePreviews.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {imagePreviews.map((p) => (
              <div key={p.id} className="relative flex-none">
                <img
                  src={p.url}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => removePreview(p.id)}
                  className="absolute -top-2 -right-2 bg-black/70 text-white text-xs rounded-full w-5 h-5"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={sendImages}
              className="px-4 py-2 rounded-full text-sm transition-colors bg-orange-500 text-white hover:bg-orange-600"
            >
              {`Send ${imagePreviews.length} photo${imagePreviews.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            capture="environment"
          />
          <button
            type="button"
            onClick={openFilePicker}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach photos"
          >
            <AttachFileIcon />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message…  (Tip: paste an image here)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorChat;
